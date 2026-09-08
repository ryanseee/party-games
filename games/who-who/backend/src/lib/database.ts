export interface Photo {
  id: string;
  sessionId: string;
  url: string;
  title?: string;
  uploadedAt: string;
}

export interface Participant {
  id: string;
  sessionId: string;
  name: string;
  socketId: string;
  photo_assigned: string | null;
  createdAt: string;
}

export interface Session {
  id: string;
  code: string;
  name: string;
  createdAt: string;
  active: boolean;
  participants: Map<string, Participant>;
  photos: Map<string, Photo>;
}

// Global in-memory storage map
const sessions = new Map<string, Session>();

export const db = {
  createSession(name: string, code: string): Session {
    const session: Session = {
      id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      code,
      name,
      createdAt: new Date().toISOString(),
      active: true,
      participants: new Map(),
      photos: new Map(),
    };
    sessions.set(code, session);
    return session;
  },

  getSession(code: string): Session | null {
    const session = sessions.get(code);
    return session && session.active ? session : null;
  },

  getSessionById(sessionId: string): Session | null {
    for (const session of sessions.values()) {
      if (session.id === sessionId && session.active) return session;
    }
    return null;
  },

  endSession(code: string): void {
    const session = sessions.get(code);
    if (session) {
      session.participants.clear();
      session.photos.clear();
      sessions.delete(code);
    }
  },

  addParticipant(
    sessionId: string,
    name: string,
    socketId: string,
  ): Participant | null {
    const session = this.getSessionById(sessionId);
    if (!session) return null;

    const participant: Participant = {
      id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      sessionId,
      name,
      socketId,
      photo_assigned: null,
      createdAt: new Date().toISOString(),
    };
    session.participants.set(participant.id, participant);
    return participant;
  },

  getParticipants(sessionId: string): Participant[] {
    const session = this.getSessionById(sessionId);
    if (!session) return [];
    return Array.from(session.participants.values());
  },

  getParticipant(participantId: string): Participant | null {
    for (const session of sessions.values()) {
      if (session.participants.has(participantId)) {
        return session.participants.get(participantId)!;
      }
    }
    return null;
  },

  removeParticipant(participantId: string): void {
    for (const session of sessions.values()) {
      if (session.participants.has(participantId)) {
        session.participants.delete(participantId);
        break;
      }
    }
  },

  updateParticipantSocketId(participantId: string, socketId: string): void {
    const participant = this.getParticipant(participantId);
    if (participant) {
      participant.socketId = socketId;
    }
  },

  addPhotos(
    sessionId: string,
    photos: { url: string; title?: string }[],
  ): Photo[] {
    const session = this.getSessionById(sessionId);
    if (!session) return [];

    const addedPhotos: Photo[] = [];
    photos.forEach((photoData) => {
      const photo: Photo = {
        id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        sessionId,
        url: photoData.url,
        title: photoData.title,
        uploadedAt: new Date().toISOString(),
      };
      session.photos.set(photo.id, photo);
      addedPhotos.push(photo);
    });
    return addedPhotos;
  },

  getPhotos(sessionId: string): Photo[] {
    const session = this.getSessionById(sessionId);
    if (!session) return [];
    return Array.from(session.photos.values()).sort(
      (a, b) =>
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
    );
  },

  getPhoto(photoId: string): Photo | null {
    for (const session of sessions.values()) {
      if (session.photos.has(photoId)) {
        return session.photos.get(photoId)!;
      }
    }
    return null;
  },

  removePhoto(photoId: string): void {
    for (const session of sessions.values()) {
      if (session.photos.has(photoId)) {
        session.photos.delete(photoId);
        break;
      }
    }
  },

  assignPhoto(participantId: string, photoId: string | null): void {
    const participant = this.getParticipant(participantId);
    if (participant) {
      participant.photo_assigned = photoId;
    }
  },

  clearPhotoAssignments(sessionId: string): void {
    const session = this.getSessionById(sessionId);
    if (session) {
      session.participants.forEach((p) => {
        p.photo_assigned = null;
      });
    }
  },

  assignPhotos(
    assignments: { participantId: string; photoId: string }[],
  ): void {
    assignments.forEach(({ participantId, photoId }) => {
      this.assignPhoto(participantId, photoId);
    });
  },

  getPhotoAssignment(photoId: string): Participant | null {
    for (const session of sessions.values()) {
      for (const participant of session.participants.values()) {
        if (participant.photo_assigned === photoId) return participant;
      }
    }
    return null;
  },

  findParticipantBySocketId(
    socketId: string,
  ): { participant: Participant; session: Session } | null {
    for (const session of sessions.values()) {
      for (const participant of session.participants.values()) {
        if (participant.socketId === socketId) {
          return { participant, session };
        }
      }
    }
    return null;
  },

  cleanupExpiredSessions(maxAgeMs: number): void {
    const now = Date.now();
    for (const [code, session] of sessions.entries()) {
      const age = now - new Date(session.createdAt).getTime();
      if (age > maxAgeMs) {
        sessions.delete(code);
      }
    }
  },
};
