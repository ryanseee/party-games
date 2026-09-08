import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { db } from "./lib/database";

dotenv.config();

const requiredEnvVars = ["PORT", "CORS_ORIGIN"];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

const app = express();
const httpServer = createServer(app);

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

const io = new Server(httpServer, {
  cors: corsOptions,
  maxHttpBufferSize: 50 * 1024 * 1024, // 50MB payload limit
});

const SESSION_EXPIRY_TIME = parseInt(
  process.env.SESSION_EXPIRY_TIME || "86400000",
  10,
);
const MAX_PARTICIPANTS = parseInt(process.env.MAX_PARTICIPANTS || "50", 10);
const SESSION_CODE_LENGTH = parseInt(
  process.env.SESSION_CODE_LENGTH || "6",
  10,
);

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

// Cleanup stale sessions every hour
setInterval(
  () => db.cleanupExpiredSessions(SESSION_EXPIRY_TIME),
  60 * 60 * 1000,
);

// API Endpoints
app.post("/api/sessions", (req, res) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== "string" || name.length > 50) {
      return res.status(400).json({ error: "Invalid name" });
    }
    const code = generateSessionCode();
    const session = db.createSession(name, code);
    res.json({
      code: session.code,
      session: {
        id: session.id,
        code: session.code,
        name: session.name,
        created_at: session.createdAt,
        active: session.active,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/sessions/:code", (req, res) => {
  try {
    const { code } = req.params;
    if (!isValidSessionCode(code)) {
      return res.status(400).json({ error: "Invalid session code" });
    }
    const session = db.getSession(code);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    res.json(session);
  } catch (error: any) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/sessions/:code/end", (req, res) => {
  try {
    const { code } = req.params;
    const formattedCode = code.toUpperCase();
    io.in(formattedCode).emit("session_ended");
    db.endSession(formattedCode);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to end session" });
  }
});

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    storage: "in-memory",
    timestamp: new Date().toISOString(),
  });
});

// Socket.IO Handlers
io.on("connection", (socket) => {
  socket.on("join_session", ({ code, name, isAdmin }) => {
    try {
      if (
        !code ||
        !name ||
        typeof isAdmin !== "boolean" ||
        !isValidSessionCode(code)
      ) {
        socket.emit("error", { message: "Invalid join request" });
        return;
      }
      const session = db.getSession(code);
      if (!session) {
        socket.emit("error", { message: "Session not found" });
        return;
      }
      socket.join(code);

      let currentParticipant = null;
      if (!isAdmin) {
        const participants = db.getParticipants(session.id);
        if (participants.length >= MAX_PARTICIPANTS) {
          socket.emit("error", { message: "Session is full" });
          return;
        }
        const existingParticipant = participants.find((p) => p.name === name);
        if (existingParticipant) {
          db.updateParticipantSocketId(existingParticipant.id, socket.id);
          currentParticipant = existingParticipant;
        } else {
          currentParticipant = db.addParticipant(session.id, name, socket.id);
        }
      }

      const updatedParticipants = db.getParticipants(session.id);
      io.in(code).emit("participants_updated", updatedParticipants);
      socket.emit("session_joined", {
        session,
        participant: currentParticipant,
      });
      socket.emit("photos_updated", db.getPhotos(session.id));
    } catch (error: any) {
      socket.emit("error", { message: "Internal server error" });
    }
  });

  socket.on("upload_photos", ({ code, photos: newPhotos }) => {
    try {
      if (
        !code ||
        !isValidSessionCode(code) ||
        !Array.isArray(newPhotos) ||
        newPhotos.length === 0
      ) {
        socket.emit("error", { message: "Invalid photo upload parameters" });
        return;
      }
      const session = db.getSession(code);
      if (!session) {
        socket.emit("error", { message: "Session not found" });
        return;
      }
      db.addPhotos(session.id, newPhotos);
      io.in(code).emit("photos_updated", db.getPhotos(session.id));
    } catch (error: any) {
      socket.emit("error", { message: "Failed to upload photos" });
    }
  });

  socket.on("assign_photos", ({ code }) => {
    try {
      const session = db.getSession(code);
      if (!session) return;
      const participants = db.getParticipants(session.id);
      const photos = db.getPhotos(session.id);

      if (participants.length === 0 || photos.length === 0) return;

      db.clearPhotoAssignments(session.id);
      const shuffledPhotos = [...photos].sort(() => Math.random() - 0.5);
      const assignments = participants.map((participant, index) => ({
        participantId: participant.id,
        photoId: shuffledPhotos[index % shuffledPhotos.length].id,
      }));
      db.assignPhotos(assignments);

      const updatedParticipants = db.getParticipants(session.id);
      const updatedPhotos = db.getPhotos(session.id);
      io.in(code).emit("participants_updated", updatedParticipants);
      io.in(code).emit("photos_updated", updatedPhotos);
    } catch (error: any) {
      socket.emit("error", { message: "Failed to assign photos" });
    }
  });

  socket.on(
    "assign_photo_manually",
    ({ sessionId, participantId, photoId }) => {
      try {
        if (!sessionId || !participantId || !photoId) {
          socket.emit("error", { message: "Invalid assignment request" });
          return;
        }
        const session = db.getSessionById(sessionId);
        if (!session) {
          socket.emit("error", { message: "Session not found" });
          return;
        }
        db.assignPhoto(participantId, photoId);
        const updatedParticipants = db.getParticipants(session.id);
        const updatedPhotos = db.getPhotos(session.id);
        io.in(session.code).emit("participants_updated", updatedParticipants);
        io.in(session.code).emit("photos_updated", updatedPhotos);
      } catch (error: any) {
        socket.emit("error", { message: "Failed to assign photo" });
      }
    },
  );

  socket.on("unassign_photo", ({ sessionId, participantId }) => {
    try {
      if (!sessionId || !participantId) {
        socket.emit("error", { message: "Invalid unassign request" });
        return;
      }
      const session = db.getSessionById(sessionId);
      if (!session) {
        socket.emit("error", { message: "Session not found" });
        return;
      }
      db.assignPhoto(participantId, null);
      const updatedParticipants = db.getParticipants(session.id);
      const updatedPhotos = db.getPhotos(session.id);
      io.in(session.code).emit("participants_updated", updatedParticipants);
      io.in(session.code).emit("photos_updated", updatedPhotos);
    } catch (error: any) {
      socket.emit("error", { message: "Failed to unassign photo" });
    }
  });

  // Admin explicit session termination
  socket.on("end_session", ({ code }) => {
    try {
      if (!code) return;
      const formattedCode = code.toUpperCase();
      // Broadcast to ALL sockets in the room before deleting database record
      io.in(formattedCode).emit("session_ended");
      db.endSession(formattedCode);
      io.socketsLeave(formattedCode);
    } catch (error: any) {
      socket.emit("error", { message: "Failed to end session" });
    }
  });

  // Handle participant leaving gracefully without killing the room
  socket.on("leave_room", ({ code, participantId }) => {
    try {
      if (participantId) {
        db.removeParticipant(participantId);
      }
      socket.leave(code);
      if (code) {
        const session = db.getSession(code);
        if (session) {
          io.in(code).emit(
            "participants_updated",
            db.getParticipants(session.id),
          );
        }
      }
    } catch (error: any) {
      console.error("Error processing leave_room:", error);
    }
  });

  socket.on("disconnect", () => {
    try {
      const match = db.findParticipantBySocketId(socket.id);
      if (match) {
        db.removeParticipant(match.participant.id);
        io.in(match.session.code).emit(
          "participants_updated",
          db.getParticipants(match.session.id),
        );
      }
    } catch (error: any) {
      console.error("Disconnect error:", error);
    }
  });
});

const PORT = parseInt(process.env.PORT || "3000", 10);
const HOST = process.env.HOST || "0.0.0.0";
httpServer.listen(PORT, HOST, () => {
  console.log(`In-memory server running on port ${PORT}`);
});
