// app/types/index.ts

export type TicketStatus = "new" | "accepted" | "in progress" | "done" | "completed" | "queue";

export interface UserProfile {
  full_name: string;
  avatar_url: string;
  phone?: string;
  id?: string;
}

// Update your Ticket interface to match the new schema
export interface Track {
  url: string;
  title: string;
  base_bpm: number | null;
  target_bpm: number | null;
}

export interface Ticket {
  id: number;
  created_at: string;
  updated_at?: string;
  user_id: string;
  title: string;
  genre: 'fashion' | 'rnr';
  service_name: string;
  status: 'new' | 'accepted' | 'in progress' | 'done';
  total_price: number;
  deadline: string | null;
  description: string | null;
  hype: boolean;
  target_bpm: number | null; // Global/Project BPM
  position: number;
  tracks: Track[];
  profiles?: {
    full_name: string;
    avatar_url: string;
    phone?: string;
    id?: string;
  };
}

export interface SongRequestInsert {
  title: string;
  genre: string;
  service_name: string;
  upgrades: string[];
  total_price: number;
  deadline: string | null;
  description: string | null;
  hype: boolean;
  target_bpm: number | null;
  tracks: Track[];
  user_id?: string; // Set this from your session
}