// app/types/index.ts

export type TicketStatus = "new" | "accepted" | "in progress" | "done" | "completed" | "queue";

export interface UserProfile {
  full_name: string;
  avatar_url: string;
  phone?: string;
  id?: string;
}

export interface Ticket {
  id: number;
  user_id: string;
  title: string;
  youtube_link: string | string[];
  base_bpm: string | number | null;
  target_bpm: string | number | null;
  deadline: string | null;
  music_category: string; 
  description?: string;
  status: TicketStatus;
  created_at: string;
  position: number;
  hype?: boolean;
  profiles?: UserProfile;
}