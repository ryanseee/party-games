import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { supabase } from "./lib/supabase";
import { db } from "./lib/database";

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  "PORT",
  "CORS_ORIGIN",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_KEY",
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

const app = express();
const httpServer = createServer(app);

// Configure CORS
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:8080",
    "http://168.138.186.220:3000",
    "http://168.138.186.220:8080",
  ],
  methods: ["GET", "POST"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

const io = new Server(httpServer, { cors: corsOptions });

// Constants from environment variables
const SESSION_EXPIRY_TIME = parseInt(
  process.env.SESSION_EXPIRY_TIME || "86400000"
);
const MAX_PARTICIPANTS = parseInt(process.env.MAX_PARTICIPANTS || "50");
const SESSION_CODE_LENGTH = parseInt(process.env.SESSION_CODE_LENGTH || "6");

// Helper functions
const generateSessionCode = (): string => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < SESSION_CODE_LENGTH; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
};

const isValidSessionCode = (code: string): boolean => {
  return /^[A-Z0-9]{6}$/.test(code);
};

const cleanupInactiveSessions = async () => {
  try {
    const { data: sessions, error } = await supabase
      .from("sessions")
      .select("id, created_at")
      .eq("active", true);

    if (error) throw error;

    const now = Date.now();
    for (const session of sessions) {
      const sessionAge = now - new Date(session.created_at).getTime();
      if (sessionAge > SESSION_EXPIRY_TIME) {
        // Update session to inactive
        await supabase
          .from("sessions")
          .update({ active: false })
          .eq("id", session.id);

        console.log(`Cleaned up inactive session: ${session.id}`);
      }
    }
  } catch (error) {
    console.error("Error cleaning up sessions:", error);
  }
};

// Run cleanup every hour
setInterval(cleanupInactiveSessions, 60 * 60 * 1000);

// REST API endpoints
app.post("/api/sessions", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== "string" || name.length > 50) {
      return res.status(400).json({ error: "Invalid name" });
    }

    const code = generateSessionCode();
    const session = await db.createSession(name, code);

    res.json({
      code: session.code,
      session: {
        id: session.id,
        code: session.code,
        name: session.name,
        created_at: session.created_at,
        active: session.active,
      },
    });
  } catch (error: any) {
    console.error("Error creating session:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/sessions/:code", async (req, res) => {
  try {
    const { code } = req.params;
    if (!isValidSessionCode(code)) {
      return res.status(400).json({ error: "Invalid session code" });
    }

    const session = await db.getSession(code);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    res.json(session);
  } catch (error: any) {
    console.error("Error getting session:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;

    res.json({
      status: "healthy",
      supabase: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Health check failed:", error);
    res.status(500).json({
      status: "unhealthy",
      supabase: "disconnected",
      error: error?.message || "Unknown error",
    });
  }
});

// WebSocket event handlers
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  process.stdout.write(`Client connected: ${socket.id}\n`);

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error);
  });

  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });

  socket.on("join_session", async ({ code, name, isAdmin }) => {
    try {
      // Validate input
      if (!code || !name || typeof isAdmin !== "boolean") {
        socket.emit("error", { message: "Invalid join request" });
        return;
      }

      if (!isValidSessionCode(code)) {
        socket.emit("error", { message: "Invalid session code" });
        return;
      }

      // Get session
      const session = await db.getSession(code);
      if (!session) {
        socket.emit("error", { message: "Session not found" });
        return;
      }

      if (!session.active) {
        socket.emit("error", { message: "Session has ended" });
        return;
      }

      // Join the room
      socket.join(code);

      // Handle participant management for non-admin users
      if (!isAdmin) {
        const participants = await db.getParticipants(session.id);

        if (participants.length >= MAX_PARTICIPANTS) {
          socket.emit("error", { message: "Session is full" });
          return;
        }

        // Update or create participant
        const existingParticipant = participants.find((p) => p.name === name);
        if (existingParticipant) {
          await db.updateParticipantSocketId(existingParticipant.id, socket.id);
        } else {
          await db.addParticipant(session.id, name, socket.id);
        }
      }

      // Get updated participants list and notify all clients
      const updatedParticipants = await db.getParticipants(session.id);
      io.in(code).emit("participants_updated", updatedParticipants);

      // Send session data and photos to the client
      socket.emit("session_joined", session);
      const photos = await db.getPhotos(session.id);
      socket.emit("photos_updated", photos);
    } catch (error: any) {
      console.error("Error in join_session:", error);
      socket.emit("error", { message: "Internal server error" });
    }
  });

  socket.on("get_participants", async ({ code }) => {
    try {
      const session = await db.getSession(code);
      if (session) {
        const participants = await db.getParticipants(session.id);
        socket.emit("participants_updated", participants);
      }
    } catch (error: any) {
      console.error("Error getting participants:", error);
    }
  });

  socket.on("upload_photos", async ({ code, photos: newPhotos }) => {
    try {
      console.log("Received upload_photos event for session:", code);

      // Validate input
      if (!code || !isValidSessionCode(code)) {
        socket.emit("error", { message: "Invalid session code" });
        return;
      }

      if (!Array.isArray(newPhotos) || newPhotos.length === 0) {
        socket.emit("error", { message: "Invalid photos array" });
        return;
      }

      // Validate each photo object
      const validPhotos = newPhotos.filter((photo) => {
        if (!photo || typeof photo !== "object") return false;
        if (!photo.url || typeof photo.url !== "string") return false;
        return true;
      });

      if (validPhotos.length === 0) {
        socket.emit("error", { message: "No valid photos to upload" });
        return;
      }

      if (validPhotos.length !== newPhotos.length) {
        console.warn("Some photos were invalid and were filtered out");
      }

      console.log(`Processing ${validPhotos.length} photos for upload`);

      const session = await db.getSession(code);
      if (!session) {
        socket.emit("error", { message: "Session not found" });
        return;
      }

      if (!session.active) {
        socket.emit("error", { message: "Session has ended" });
        return;
      }

      // Get existing photos first
      const existingPhotos = await db.getPhotos(session.id);
      console.log("Existing photos count:", existingPhotos.length);

      // Add new photos to database
      console.log("Adding new photos to database for session:", session.id);
      const addedPhotos = await db.addPhotos(session.id, validPhotos);
      console.log("Successfully added photos to database:", addedPhotos.length);

      // Get all photos after adding new ones
      const allPhotos = await db.getPhotos(session.id);
      console.log("Total photos after upload:", allPhotos.length);

      // Verify we have all photos
      if (allPhotos.length !== existingPhotos.length + addedPhotos.length) {
        console.error(
          "Warning: Photo count mismatch. Expected:",
          existingPhotos.length + addedPhotos.length,
          "Got:",
          allPhotos.length
        );
      }

      // Emit the complete set of photos
      console.log(
        "Emitting photos_updated event with",
        allPhotos.length,
        "photos"
      );
      io.in(code).emit("photos_updated", allPhotos);
    } catch (error: any) {
      console.error("Error uploading photos:", error);
      socket.emit("error", { message: "Failed to upload photos" });
    }
  });

  socket.on("assign_photos", async ({ code }) => {
    try {
      const session = await db.getSession(code);
      if (!session) return;

      const participants = await db.getParticipants(session.id);
      const photos = await db.getPhotos(session.id);

      if (participants.length === 0 || photos.length === 0) return;

      // Clear all previous photo assignments
      await db.clearPhotoAssignments(session.id);

      // Randomly assign photos to participants
      const shuffledPhotos = [...photos].sort(() => Math.random() - 0.5);
      const assignments = participants.map((participant, index) => ({
        participantId: participant.id,
        photoId: shuffledPhotos[index % shuffledPhotos.length].id,
      }));

      // Update assignments in database
      await db.assignPhotos(assignments);

      // Get updated participants and photos
      const updatedParticipants = await db.getParticipants(session.id);
      const updatedPhotos = await db.getPhotos(session.id);

      // Notify all clients
      io.in(code).emit("participants_updated", updatedParticipants);
      io.in(code).emit("photos_updated", updatedPhotos);
    } catch (error: any) {
      console.error("Error assigning photos:", error);
      socket.emit("error", { message: "Failed to assign photos" });
    }
  });

  socket.on(
    "assign_photo_manually",
    async ({ sessionId, participantId, photoId }) => {
      try {
        // Validate input
        if (!sessionId || !participantId || !photoId) {
          socket.emit("error", { message: "Invalid assignment request" });
          return;
        }

        // Get session
        const session = await db.getSessionById(sessionId);
        if (!session) {
          socket.emit("error", { message: "Session not found" });
          return;
        }

        if (!session.active) {
          socket.emit("error", { message: "Session has ended" });
          return;
        }

        // Get participant and photo
        const participant = await db.getParticipant(participantId);
        const photo = await db.getPhoto(photoId);

        if (!participant || !photo) {
          socket.emit("error", { message: "Participant or photo not found" });
          return;
        }

        // Check if photo is already assigned
        const existingAssignment = await db.getPhotoAssignment(photoId);
        if (existingAssignment) {
          socket.emit("error", { message: "Photo is already assigned" });
          return;
        }

        // Assign photo to participant
        await db.assignPhoto(participantId, photoId);

        // Get updated participants and photos
        const updatedParticipants = await db.getParticipants(session.id);
        const updatedPhotos = await db.getPhotos(session.id);

        // Notify all clients
        io.in(session.code).emit("participants_updated", updatedParticipants);
        io.in(session.code).emit("photos_updated", updatedPhotos);
      } catch (error: any) {
        console.error("Error in manual photo assignment:", error);
        socket.emit("error", { message: "Failed to assign photo" });
      }
    }
  );

  socket.on("unassign_photo", async ({ sessionId, participantId }) => {
    try {
      // Validate input
      if (!sessionId || !participantId) {
        socket.emit("error", { message: "Invalid unassign request" });
        return;
      }

      // Get session
      const session = await db.getSessionById(sessionId);
      if (!session) {
        socket.emit("error", { message: "Session not found" });
        return;
      }

      if (!session.active) {
        socket.emit("error", { message: "Session has ended" });
        return;
      }

      // Get participant
      const participant = await db.getParticipant(participantId);
      if (!participant) {
        socket.emit("error", { message: "Participant not found" });
        return;
      }

      // Unassign photo from participant
      await db.assignPhoto(participantId, null);

      // Get updated participants and photos
      const updatedParticipants = await db.getParticipants(session.id);
      const updatedPhotos = await db.getPhotos(session.id);

      // Notify all clients
      io.in(session.code).emit("participants_updated", updatedParticipants);
      io.in(session.code).emit("photos_updated", updatedPhotos);
    } catch (error: any) {
      console.error("Error in photo unassignment:", error);
      socket.emit("error", { message: "Failed to unassign photo" });
    }
  });

  socket.on("end_session", async ({ code }) => {
    try {
      console.log("End session event received for code:", code);

      // Get the session first to verify it exists
      const session = await db.getSession(code);
      if (!session) {
        console.error("Session not found for ending:", code);
        socket.emit("error", { message: "Session not found" });
        return;
      }

      // End the session and clean up all related data
      await db.endSession(code);
      console.log("Session ended and data cleaned up:", code);

      // Notify all clients in the session
      io.in(code).emit("session_ended");

      // Leave the room
      socket.leave(code);
    } catch (error: any) {
      console.error("Error ending session:", error);
      socket.emit("error", { message: "Failed to end session" });
    }
  });

  socket.on("participant_left", async ({ code, participantId }) => {
    try {
      console.log("Participant left event received:", { code, participantId });

      // Get the session first
      const session = await db.getSession(code);
      if (!session) {
        console.error("Session not found for participant left event");
        return;
      }

      // Get the participant to verify it exists
      const participants = await db.getParticipants(session.id);
      const participant = participants.find((p) => p.id === participantId);

      if (!participant) {
        console.error("Participant not found for removal:", participantId);
        return;
      }

      // Remove the participant
      await db.removeParticipant(participantId);
      console.log("Successfully removed participant:", participantId);

      // Get updated participants list
      const updatedParticipants = await db.getParticipants(session.id);
      console.log("Updated participants count:", updatedParticipants.length);

      // Notify all clients in the session
      io.in(code).emit("participants_updated", updatedParticipants);
    } catch (error: any) {
      console.error("Error removing participant:", error);
      socket.emit("error", { message: "Failed to remove participant" });
    }
  });

  socket.on("disconnect", async () => {
    try {
      console.log("Socket disconnected:", socket.id);

      // Find the participant by socket ID
      const { data: participants } = await supabase
        .from("participants")
        .select("*")
        .eq("socket_id", socket.id);

      if (participants && participants.length > 0) {
        const participant = participants[0];
        console.log("Found participant to remove:", participant.id);

        // Get the session
        const session = await db.getSession(participant.session_id);
        if (session) {
          // Remove the participant
          await db.removeParticipant(participant.id);
          console.log("Successfully removed participant on disconnect");

          // Get updated participants list
          const updatedParticipants = await db.getParticipants(session.id);
          console.log(
            "Updated participants count:",
            updatedParticipants.length
          );

          // Notify all clients in the session
          io.in(session.code).emit("participants_updated", updatedParticipants);
        }
      }
    } catch (error: any) {
      console.error("Error handling disconnect:", error);
    }
  });

  socket.on("remove_photo", async ({ code, photoId }) => {
    try {
      console.log("Remove photo event received:", { code, photoId });

      // Get the session first
      const session = await db.getSession(code);
      if (!session) {
        console.error("Session not found for photo removal");
        socket.emit("error", { message: "Session not found" });
        return;
      }

      // Get participants who have this photo assigned
      const participants = await db.getParticipants(session.id);
      const participantsWithPhoto = participants.filter(
        (p) => p.photo_assigned === photoId
      );

      // Clear photo assignments for affected participants
      for (const participant of participantsWithPhoto) {
        await db.assignPhoto(participant.id, null);
      }

      // Remove the photo
      await db.removePhoto(photoId);
      console.log("Successfully removed photo:", photoId);

      // Get updated data
      const updatedPhotos = await db.getPhotos(session.id);
      const updatedParticipants = await db.getParticipants(session.id);
      console.log("Updated photos count:", updatedPhotos.length);
      console.log("Updated participants count:", updatedParticipants.length);

      // Notify all clients in the session
      io.in(code).emit("photos_updated", updatedPhotos);
      io.in(code).emit("participants_updated", updatedParticipants);
    } catch (error: any) {
      console.error("Error removing photo:", error);
      socket.emit("error", { message: "Failed to remove photo" });
    }
  });
});

// Update the server listen port
const PORT = parseInt(process.env.PORT || "3000", 10);
const HOST = process.env.HOST || "0.0.0.0";

httpServer.listen(PORT, HOST, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(
    `CORS enabled for origins: http://localhost:3000, http://localhost:8080, http://168.138.186.220:3000, http://168.138.186.220:8080`
  );
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
