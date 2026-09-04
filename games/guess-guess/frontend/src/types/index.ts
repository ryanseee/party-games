export interface Session {
  id: string;
  code: string;
  name: string;
  created_at: string;
  active: boolean;
}

export interface Participant {
  id: string;
  name: string;
  session_id: string;
  photo_assigned: string | null;
  is_admin: boolean;
  user_id: string | null;
  socket_id: string | null;
  created_at: string;
}

export interface Photo {
  id?: string;
  url: string;
  title: string;
  session_id: string;
  // participant_id: string | null;
  uploaded_at: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}
