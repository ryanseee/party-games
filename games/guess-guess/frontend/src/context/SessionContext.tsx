import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useRef,
} from "react";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Session, Participant, Photo } from "../types";
import { SOCKET_URL } from "../config";

interface SessionContextProps {
  currentSession: Session | null;
  participants: Participant[];
  photos: Photo[];
  createSession: (name: string) => Promise<string>;
  joinSession: (
    code: string,
    name: string,
    isAdmin: boolean
  ) => Promise<{ success: boolean; error?: string }>;
  addParticipant: (participant: Participant) => Promise<void>;
  uploadPhotos: (photos: Photo[]) => Promise<void>;
  assignPhotos: () => Promise<void>;
  endSession: () => Promise<void>;
  isAdmin: boolean;
  setIsAdmin: (value: boolean) => void;
  clearSession: () => Promise<void>;
  validateSessionCode: (code: string) => boolean;
  socket: any;
  isSessionEnded: boolean;
  setIsSessionEnded: (value: boolean) => void;
}

const SessionContext = createContext<SessionContextProps | undefined>(
  undefined
);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};

export const SessionProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSessionEnded, setIsSessionEnded] = useState(false);
  const navigate = useNavigate();
  const socketRef = useRef<any>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Initialize socket connection
  useEffect(() => {
    console.log("Initializing socket connection...");
    if (!socketRef.current) {
      console.log("Creating new socket connection to:", SOCKET_URL);
      const newSocket = io(SOCKET_URL, {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        transports: ["websocket"],
        forceNew: true,
      });
      socketRef.current = newSocket;

      newSocket.on("connect", () => {
        console.log("Connected to socket server with ID:", newSocket.id);
      });

      newSocket.on("connect_error", (error: Error) => {
        console.error("Socket connection error:", error);
      });

      newSocket.on("disconnect", (reason: string) => {
        console.log("Disconnected from socket server. Reason:", reason);
      });

      newSocket.on("error", (error: { message: string }) => {
        console.error("Socket error received:", error);
      });

      newSocket.on("participants_updated", (participants: Participant[]) => {
        console.log("participants_updated event received:", participants);
        setParticipants(participants);
      });

      newSocket.on("photos_updated", (newPhotos: Photo[]) => {
        console.log("photos_updated event received:", newPhotos);
        if (Array.isArray(newPhotos)) {
          console.log(
            "Updating photos state with:",
            newPhotos.length,
            "photos"
          );
          setPhotos(newPhotos);
        } else {
          console.error("Received invalid photos data:", newPhotos);
        }
      });

      newSocket.on("session_joined", (session: Session) => {
        console.log("session_joined event received:", session);
        setCurrentSession(session);

        // If admin, fetch participants and navigate to admin dashboard
        if (isAdmin) {
          // Emit get_participants event to fetch the list
          socketRef.current?.emit("get_participants", { code: session.code });
          navigate("/admin");
        } else {
          navigate(`/participant/${session.code}`);
        }
      });

      newSocket.on("session_ended", () => {
        console.log("session_ended event received");
        setIsSessionEnded(true);
      });
    }

    return () => {
      if (socketRef.current) {
        console.log("Cleaning up socket connection");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []); // Remove isAdmin and navigate from dependencies

  // Add cleanup effect for session state
  useEffect(() => {
    const handleBeforeUnload = () => {
      clearSession();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      clearSession();
    };
  }, []);

  const joinSession = async (
    code: string,
    name: string,
    isAdmin: boolean = false
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log("joinSession called with:", { code, name, isAdmin });
      if (!socketRef.current) {
        console.error("Socket not initialized");
        throw new Error("Socket not initialized");
      }

      if (!socketRef.current.connected) {
        console.error("Socket not connected, attempting to connect...");
        socketRef.current.connect();
        // Wait for connection
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error("Socket connection timeout"));
          }, 5000);

          socketRef.current?.once("connect", () => {
            clearTimeout(timeout);
            resolve(true);
          });

          socketRef.current?.once("connect_error", (error: Error) => {
            clearTimeout(timeout);
            reject(error);
          });
        });
      }

      console.log("Socket connected, emitting join_session event");
      // Join the session via socket
      socketRef.current.emit("join_session", {
        code,
        name,
        isAdmin,
      });

      // Store the name in localStorage
      localStorage.setItem("participantName", name);

      // Wait for session_joined event or error
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          resolve({
            success: false,
            error: "Timeout waiting for session join",
          });
        }, 5000);

        socketRef.current?.once("session_joined", (session: Session) => {
          clearTimeout(timeout);
          console.log("Session joined successfully:", session);
          resolve({ success: true });
        });

        socketRef.current?.once("error", (error: { message: string }) => {
          clearTimeout(timeout);
          console.error("Error joining session:", error);
          resolve({
            success: false,
            error: error.message || "Failed to join session",
          });
        });
      });
    } catch (error: any) {
      console.error("Error in joinSession:", error);
      return {
        success: false,
        error: error.message || "Failed to join session",
      };
    }
  };

  const createSession = async (name: string): Promise<string> => {
    try {
      if (!socketRef.current) {
        throw new Error("Socket not initialized");
      }

      const session = await api.createSession(name);
      setCurrentSession(session);
      setIsAdmin(true);
      localStorage.setItem("participantName", name);

      // Join the session as admin
      socketRef.current.emit("join_session", {
        code: session.code,
        name: name,
        isAdmin: true,
      });

      // Fetch initial participants list
      socketRef.current.emit("get_participants", { code: session.code });

      return session.code;
    } catch (error) {
      console.error("Error creating session:", error);
      throw error;
    }
  };

  const clearSession = async () => {
    console.log("Clearing session state");
    setCurrentSession(null);
    setParticipants([]);
    setPhotos([]);
    setIsAdmin(false);
    setIsSessionEnded(false);
    localStorage.removeItem("participantName");
  };

  const validateSessionCode = (code: string): boolean => {
    return /^[A-Z0-9]{6}$/.test(code);
  };

  const uploadPhotos = async (newPhotos: Photo[]) => {
    if (!currentSession || !socketRef.current) {
      console.error("Cannot upload photos: no session or socket");
      return;
    }

    if (isUploading) {
      console.warn("Photo upload already in progress");
      return;
    }

    try {
      setIsUploading(true);
      console.log("Starting photo upload process...");

      // Validate photos array
      if (!Array.isArray(newPhotos) || newPhotos.length === 0) {
        throw new Error("Invalid photos array");
      }

      // Validate each photo object
      const validPhotos = newPhotos.filter((photo) => {
        if (!photo || typeof photo !== "object") return false;
        if (!photo.url || typeof photo.url !== "string") return false;
        return true;
      });

      if (validPhotos.length !== newPhotos.length) {
        console.warn("Some photos were invalid and were filtered out");
      }

      if (validPhotos.length === 0) {
        throw new Error("No valid photos to upload");
      }

      console.log(`Uploading ${validPhotos.length} photos...`);
      console.log("Current session code:", currentSession.code);
      console.log("Socket connected:", socketRef.current.connected);

      // Emit the upload event
      socketRef.current.emit("upload_photos", {
        code: currentSession.code,
        photos: validPhotos,
      });

      console.log("Emitted upload_photos event");

      // Wait for photos_updated event to confirm upload
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Photo upload timeout"));
        }, 10000);

        socketRef.current?.once("photos_updated", (updatedPhotos: Photo[]) => {
          clearTimeout(timeout);
          console.log("Photos updated successfully:", updatedPhotos.length);
          resolve(true);
        });

        socketRef.current?.once("error", (error: { message: string }) => {
          clearTimeout(timeout);
          reject(new Error(error.message || "Failed to upload photos"));
        });
      });
    } catch (error: any) {
      console.error("Error uploading photos:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const assignPhotos = async () => {
    if (!currentSession || !socketRef.current) return;
    try {
      socketRef.current.emit("assign_photos", { code: currentSession.code });
    } catch (error) {
      console.error("Error assigning photos:", error);
      throw error;
    }
  };

  const endSession = async () => {
    if (!currentSession || !socketRef.current) return;
    try {
      socketRef.current.emit("end_session", { code: currentSession.code });
      await clearSession();
    } catch (error) {
      console.error("Error ending session:", error);
      throw error;
    }
  };

  return (
    <SessionContext.Provider
      value={{
        currentSession,
        participants,
        photos,
        createSession,
        joinSession,
        addParticipant: async (participant) => {
          setParticipants((prev) => [...prev, participant]);
        },
        uploadPhotos,
        assignPhotos,
        endSession,
        isAdmin,
        setIsAdmin,
        clearSession,
        validateSessionCode,
        socket: socketRef.current,
        isSessionEnded,
        setIsSessionEnded,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};
