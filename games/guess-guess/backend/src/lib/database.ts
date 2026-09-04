import { supabase } from "./supabase";

export interface Session {
  id: string;
  code: string;
  name: string;
  created_at: string;
  active: boolean;
}

export interface Participant {
  id: string;
  session_id: string;
  name: string;
  socket_id: string;
  photo_assigned: string | null;
  created_at: string;
}

export interface Photo {
  id: string;
  session_id: string;
  url: string;
  title?: string;
  uploaded_at: string;
}

export const db = {
  // Session operations
  async createSession(name: string, code: string): Promise<Session> {
    console.log("Creating session with:", { name, code });
    const { data, error } = await supabase
      .from("sessions")
      .insert([{ name, code }])
      .select("id, code, name, created_at, active")
      .single();

    if (error) {
      console.error("Error creating session:", error);
      throw error;
    }
    console.log("Created session:", data);
    return data;
  },

  async getSession(code: string): Promise<Session | null> {
    console.log("getSession called with code:", code);
    process.stdout.write(`getSession called with code: ${code}\n`);

    const { data, error } = await supabase
      .from("sessions")
      .select("id, code, name, created_at, active")
      .eq("code", code)
      .single();

    if (error) {
      console.error("Error in getSession:", error);
      process.stderr.write(`Error in getSession: ${JSON.stringify(error)}\n`);
      if (error.code !== "PGRST116") throw error;
    }

    console.log("getSession result:", data);
    process.stdout.write(`getSession result: ${JSON.stringify(data)}\n`);
    return data;
  },

  async endSession(code: string): Promise<void> {
    try {
      console.log("Ending session and cleaning up data:", code);

      // Get the session first to get its ID
      const session = await this.getSession(code);
      if (!session) {
        console.error("Session not found for cleanup:", code);
        return;
      }

      // Delete all photos associated with the session
      const { error: photosError } = await supabase
        .from("photos")
        .delete()
        .eq("session_id", session.id);

      if (photosError) {
        console.error("Error deleting session photos:", photosError);
        throw photosError;
      }
      console.log("Deleted session photos");

      // Delete all participants associated with the session
      const { error: participantsError } = await supabase
        .from("participants")
        .delete()
        .eq("session_id", session.id);

      if (participantsError) {
        console.error(
          "Error deleting session participants:",
          participantsError
        );
        throw participantsError;
      }
      console.log("Deleted session participants");

      // Finally, delete the session itself
      const { error: sessionError } = await supabase
        .from("sessions")
        .delete()
        .eq("id", session.id);

      if (sessionError) {
        console.error("Error deleting session:", sessionError);
        throw sessionError;
      }
      console.log("Deleted session");
    } catch (error) {
      console.error("Error in endSession:", error);
      throw error;
    }
  },

  // Participant operations
  async addParticipant(
    sessionId: string,
    name: string,
    socketId: string
  ): Promise<Participant> {
    const { data, error } = await supabase
      .from("participants")
      .insert([{ session_id: sessionId, name, socket_id: socketId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getParticipants(sessionId: string): Promise<Participant[]> {
    const { data, error } = await supabase
      .from("participants")
      .select()
      .eq("session_id", sessionId);

    if (error) throw error;
    return data || [];
  },

  async removeParticipant(participantId: string): Promise<void> {
    console.log("Removing participant:", participantId);
    const { error } = await supabase
      .from("participants")
      .delete()
      .eq("id", participantId);

    if (error) {
      console.error("Error removing participant:", error);
      throw error;
    }
    console.log("Successfully removed participant");
  },

  async updateParticipantSocketId(
    participantId: string,
    socketId: string
  ): Promise<void> {
    const { error } = await supabase
      .from("participants")
      .update({ socket_id: socketId })
      .eq("id", participantId);

    if (error) throw error;
  },

  // Photo operations
  async addPhotos(
    sessionId: string,
    photos: Omit<Photo, "id" | "session_id" | "uploaded_at">[]
  ): Promise<Photo[]> {
    const photosWithSessionId = photos.map((photo) => ({
      ...photo,
      session_id: sessionId,
      uploaded_at: new Date().toISOString(),
    }));

    console.log("Adding photos to database:", photosWithSessionId);

    const { data, error } = await supabase
      .from("photos")
      .insert(photosWithSessionId)
      .select();

    if (error) {
      console.error("Database error adding photos:", error);
      throw error;
    }

    console.log("Successfully added photos to database:", data);
    return data;
  },

  async getPhotos(sessionId: string): Promise<Photo[]> {
    console.log("Getting photos for session:", sessionId);

    const { data, error } = await supabase
      .from("photos")
      .select("*")
      .eq("session_id", sessionId)
      .order("uploaded_at", { ascending: false });

    if (error) {
      console.error("Error getting photos:", error);
      throw error;
    }

    // Log detailed information about retrieved photos
    console.log("Retrieved photos from database:", {
      count: data?.length || 0,
      photos: data?.map((photo) => ({
        id: photo.id,
        title: photo.title,
        uploaded_at: photo.uploaded_at,
      })),
    });

    // Ensure we're returning an array even if data is null
    const photos = data || [];

    // Log the final array being returned
    console.log("Returning photos array:", {
      length: photos.length,
      ids: photos.map((p) => p.id),
    });

    return photos;
  },

  async assignPhoto(
    participantId: string,
    photoId: string | null
  ): Promise<void> {
    const { error } = await supabase
      .from("participants")
      .update({ photo_assigned: photoId })
      .eq("id", participantId);

    if (error) throw error;
  },

  async clearPhotoAssignments(sessionId: string): Promise<void> {
    const { error } = await supabase
      .from("participants")
      .update({ photo_assigned: null })
      .eq("session_id", sessionId);

    if (error) throw error;
  },

  async assignPhotos(
    assignments: { participantId: string; photoId: string }[]
  ): Promise<void> {
    for (const { participantId, photoId } of assignments) {
      await this.assignPhoto(participantId, photoId);
    }
  },

  async getSessionById(sessionId: string): Promise<Session | null> {
    const { data, error } = await supabase
      .from("sessions")
      .select("id, code, name, created_at, active")
      .eq("id", sessionId)
      .single();

    if (error) {
      if (error.code !== "PGRST116") throw error;
      return null;
    }
    return data;
  },

  async getParticipant(participantId: string): Promise<Participant | null> {
    const { data, error } = await supabase
      .from("participants")
      .select()
      .eq("id", participantId)
      .single();

    if (error) {
      if (error.code !== "PGRST116") throw error;
      return null;
    }
    return data;
  },

  async getPhoto(photoId: string): Promise<Photo | null> {
    const { data, error } = await supabase
      .from("photos")
      .select()
      .eq("id", photoId)
      .single();

    if (error) {
      if (error.code !== "PGRST116") throw error;
      return null;
    }
    return data;
  },

  async getPhotoAssignment(photoId: string): Promise<Participant | null> {
    const { data, error } = await supabase
      .from("participants")
      .select()
      .eq("photo_assigned", photoId)
      .single();

    if (error) {
      if (error.code !== "PGRST116") throw error;
      return null;
    }
    return data;
  },

  async removePhoto(photoId: string): Promise<void> {
    console.log("Removing photo:", photoId);
    const { error } = await supabase.from("photos").delete().eq("id", photoId);

    if (error) {
      console.error("Error removing photo:", error);
      throw error;
    }
    console.log("Successfully removed photo");
  },
};
