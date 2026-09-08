import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "../config";
import { api } from "../lib/api";
import { Session, Participant, Photo } from "../types";

interface SessionContextType {
  currentSession: Session | null;
  participant: Participant | null;
  isAdmin: boolean;
  participants: Participant[];
  photos: Photo[];
  isSessionEnded: boolean;
  createSession: (
    name: string,
  ) => Promise<{ success: boolean; error?: string }>;
  joinSession: (
    code: string,
    name: string,
    isAdmin?: boolean,
  ) => Promise<{ success: boolean; error?: string }>;
  uploadPhotos: (photos: { url: string; title?: string }[]) => Promise<void>;
  assignPhotos: () => void;
  assignPhotoManually: (participantId: string, photoId: string | null) => void;
  leaveSession: () => void;
  endSession: () => void;
  clearSession: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isSessionEnded, setIsSessionEnded] = useState<boolean>(false);

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ["websocket"],
      autoConnect: true,
    });

    newSocket.on(
      "participants_updated",
      (updatedParticipants: Participant[]) => {
        setParticipants(updatedParticipants);
      },
    );

    newSocket.on("photos_updated", (updatedPhotos: Photo[]) => {
      setPhotos(updatedPhotos);
    });

    newSocket.on("session_ended", () => {
      setIsSessionEnded(true);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const clearSession = useCallback(() => {
    setCurrentSession(null);
    setParticipant(null);
    setIsAdmin(false);
    setParticipants([]);
    setPhotos([]);
    setIsSessionEnded(false);
  }, []);

  const createSession = async (name: string) => {
    try {
      const res = await api.createSession(name);
      if (res && res.code) {
        return await joinSession(res.code, "Admin", true);
      }
      return { success: false, error: "Failed to create session code" };
    } catch (err: any) {
      return { success: false, error: err.message || "Error creating session" };
    }
  };

  const joinSession = async (code: string, name: string, adminFlag = false) => {
    return new Promise<{ success: boolean; error?: string }>((resolve) => {
      if (!socket) {
        resolve({ success: false, error: "Socket connection unavailable" });
        return;
      }

      const onSessionJoined = (data: {
        session: Session;
        participant: Participant | null;
      }) => {
        setCurrentSession(data.session);
        setParticipant(data.participant);
        setIsAdmin(adminFlag);
        setIsSessionEnded(false);
        socket.off("session_joined", onSessionJoined);
        socket.off("error", onError);
        resolve({ success: true });
      };

      const onError = (err: { message: string }) => {
        socket.off("session_joined", onSessionJoined);
        socket.off("error", onError);
        resolve({ success: false, error: err.message });
      };

      socket.on("session_joined", onSessionJoined);
      socket.on("error", onError);

      socket.emit("join_session", {
        code: code.toUpperCase(),
        name,
        isAdmin: adminFlag,
      });
    });
  };

  const uploadPhotos = async (newPhotos: { url: string; title?: string }[]) => {
    if (socket && currentSession) {
      socket.emit("upload_photos", {
        code: currentSession.code,
        photos: newPhotos,
      });
    }
  };

  const assignPhotos = () => {
    if (socket && currentSession) {
      socket.emit("assign_photos", { code: currentSession.code });
    }
  };

  const assignPhotoManually = (
    participantId: string,
    photoId: string | null,
  ) => {
    if (socket && currentSession) {
      if (photoId) {
        socket.emit("assign_photo_manually", {
          sessionId: currentSession.id,
          participantId,
          photoId,
        });
      } else {
        socket.emit("unassign_photo", {
          sessionId: currentSession.id,
          participantId,
        });
      }
    }
  };

  // Participant exits lobby gracefully
  const leaveSession = () => {
    if (socket && currentSession) {
      socket.emit("leave_room", {
        code: currentSession.code,
        participantId: participant?.id,
      });
    }
    clearSession();
  };

  // Admin terminates the lobby for everyone
  const endSession = () => {
    if (socket && currentSession) {
      socket.emit("end_session", { code: currentSession.code });
    }
  };

  return (
    <SessionContext.Provider
      value={{
        currentSession,
        participant,
        isAdmin,
        participants,
        photos,
        isSessionEnded,
        createSession,
        joinSession,
        uploadPhotos,
        assignPhotos,
        assignPhotoManually,
        leaveSession,
        endSession,
        clearSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};
