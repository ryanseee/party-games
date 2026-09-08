import { Session } from "../types";
import { API_URL } from "../config";

export const api = {
  // Session endpoints
  createSession: async (name: string): Promise<Session> => {
    const response = await fetch(`${API_URL}api/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) throw new Error("Failed to create session");
    return response.json();
  },

  getSession: async (code: string): Promise<Session> => {
    const response = await fetch(`${API_URL}api/sessions/${code}`);
    if (!response.ok) throw new Error("Session not found");
    return response.json();
  },

  endSession: async (code: string): Promise<void> => {
    const response = await fetch(`${API_URL}api/sessions/${code}/end`, {
      method: "POST",
    });
    if (!response.ok) throw new Error("Failed to end session");
  },
};
