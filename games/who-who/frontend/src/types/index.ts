export interface Session {
  id: string;
  code: string;
  name: string;
  created_at?: string;
  active?: boolean;
  participants?: Participant[];
  photos?: Photo[];
}

export interface Participant {
  id: string;
  sessionId?: string;
  name: string;
  socketId?: string | null;
  photo_assigned?: string | null;
  createdAt?: string;
}

export interface Photo {
  id: string;
  sessionId?: string;
  url: string;
  title?: string;
  uploadedAt?: string;
}
