// 🏷️ 1. Status & Metadata Types
export type TicketStatus = "new" | "accepted" | "in progress" | "done" | "completed" | "queue";

export interface UserProfile {
  full_name: string;
  avatar_url: string;
  phone?: string;
  id?: string;
}

// 🎵 2. Track Structure (JSONB Mapping)
// This interface defines the objects stored inside the 'tracks' array
export interface Track {
  url: string;
  title: string;
  base_bpm: number | null;
  target_bpm: number | null;
}

// 🎫 3. Main Ticket Interface
// Used for displaying data on the Admin Board and User Dashboard
export interface Ticket {
  id: number;
  created_at: string;
  updated_at?: string;
  user_id: string;
  title: string;
  // Strictly typed to match your PostgreSQL ENUMs
  genre: 'fashion' | 'rnr'; 
  service_name: string;
  status: 'new' | 'accepted' | 'in progress' | 'done';
  total_price: number;
  deadline: string | null;
  description: string | null;
  hype: boolean;
  target_bpm: number | null; // Global/Project BPM for Choreo Mixes
  position: number;
  tracks: Track[]; // Maps to the JSONB column in Supabase
  profiles?: {
    full_name: string;
    avatar_url: string;
    phone?: string;
    id?: string;
  };
}

// 📥 4. Insertion Interface
// Used specifically for the handleSubmit logic in your request form
export interface SongRequestInsert {
  title: string;
  genre: string; // Typically 'fashion' or 'rnr'
  service_name: string;
  upgrades: string[];
  total_price: number;
  deadline: string | null;
  description: string | null;
  hype: boolean;
  target_bpm: number | null;
  tracks: Track[]; // Ensure this is JSON.stringified if sending via raw SQL
  user_id?: string; 
}