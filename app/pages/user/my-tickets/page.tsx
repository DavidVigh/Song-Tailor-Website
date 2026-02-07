"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaMusic, FaPlus, FaTicketAlt } from "react-icons/fa";
import TicketCard from "@/app/components/TicketCard";
import { Ticket } from "@/app/types";

export default function MyTicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyTickets();
  }, []);

  async function fetchMyTickets() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth"); return; }

    const { data, error } = await supabase
      .from("song_requests")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setTickets(data as Ticket[]);
    setLoading(false);
  }

  if (loading) return <div className="p-10 text-center text-white">Loading your tickets...</div>;

  return (
    <div className="min-h-screen p-4 sm:p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <FaTicketAlt className="text-blue-500" /> My Requests
        </h1>
        <Link href="/pages/request" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all">
          <FaPlus /> New Request
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {tickets.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} />
        ))}
      </div>

      {tickets.length === 0 && (
        <div className="text-center py-20 bg-[#1e1e1e] rounded-3xl border border-[#333] border-dashed mt-8">
          <h3 className="text-xl font-bold text-white mb-2 text-center">No Requests Yet</h3>
          <p className="text-gray-500 mb-6">Start by adding your first song request!</p>
          <Link href="/pages/request" className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-colors">
            Create Request
          </Link>
        </div>
      )}
    </div>
  );
}