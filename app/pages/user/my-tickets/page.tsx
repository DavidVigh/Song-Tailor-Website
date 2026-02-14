"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaMusic, FaPlus, FaTicketAlt } from "react-icons/fa";
import TicketCard from "@/app/components/TicketCard";
import { Ticket } from "@/app/types";
import LoadingLayout from "@/app/layouts/LoadingLayout";

export default function MyTicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchMyTickets();
  }, []);

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`my-tickets-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "song_requests",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setTickets((prev) =>
            prev.map((ticket) =>
              ticket.id === payload.new.id
                ? ({ ...ticket, ...payload.new } as Ticket)
                : ticket,
            ),
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  async function fetchMyTickets() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth");
        return;
      }
      setUserId(user.id);

      const { data, error } = await supabase
        .from("song_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching tickets:", error);
      } else {
        setTickets(data as Ticket[]);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setIsPageLoading(false);
    }
  }

  // 🛡️ THEMED LOADING STATE
  if (isPageLoading) {
    return (
      <LoadingLayout
        message="Loading your tickets..."
        icon={<FaMusic className="text-blue-500 text-2xl animate-bounce" />}
      />
    );
  }

  return (
    /* 🌊 FLUID OUTER CONTAINER: Stretches to full screen edges */
    <div className="min-h-screen w-full transition-colors duration-500 bg-gray-50 dark:bg-[#0d0d0d] overflow-x-hidden">
      {/* 🌫️ OPTIONAL: ADDED DECORATIVE BLOBS FOR COHESION */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 opacity-10">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600 rounded-full blur-[120px]" />
      </div>

      {/* 🎯 CENTERED FIXED CONTAINER: Holds the actual content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10 sm:py-16">
        {/* --- HEADER --- */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tighter text-gray-900 dark:text-white flex items-center gap-4">
              <FaTicketAlt className="text-blue-600" /> My Requests
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              Manage and track your song tailoring projects.
            </p>
          </div>

          <Link
            href="/pages/request"
            className="group bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98]"
          >
            <FaPlus className="group-hover:rotate-90 transition-transform duration-300" />{" "}
            New Request
          </Link>
        </div>

        {/* --- TICKETS GRID --- */}
        {tickets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}

        {/* --- EMPTY STATE --- */}
        {tickets.length === 0 && (
          <div className="text-center py-24 rounded-[3rem] border-2 border-dashed bg-white border-gray-200 dark:bg-[#151515] dark:border-[#252525] shadow-2xl dark:shadow-none">
            <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/10 rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-3">
              <FaTicketAlt className="text-4xl text-blue-500" />
            </div>
            <h3 className="text-3xl font-black mb-3 text-gray-900 dark:text-white">
              No Requests Yet
            </h3>
            <p className="mb-10 text-gray-500 dark:text-gray-400 max-w-sm mx-auto text-lg leading-relaxed">
              Your audio queue is empty. Start by adding your first song request
              to get tailored edits!
            </p>
            <Link
              href="/pages/request"
              className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-2xl shadow-blue-500/30 active:scale-[0.95]"
            >
              Create Your First Request
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
