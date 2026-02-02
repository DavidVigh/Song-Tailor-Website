"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchMyTickets() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth"); //
        return;
      }

      // Fetch only tickets belonging to this user
      const { data, error } = await supabase
        .from("song_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error) setTickets(data);
      setLoading(false);
    }

    fetchMyTickets();
  }, [router]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-blue-900/30 text-blue-400 border-blue-800";
      case "done":
        return "bg-green-900/30 text-green-400 border-green-800";
      default:
        return "bg-yellow-900/30 text-yellow-500 border-yellow-800";
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center text-white">
        Loading your tickets...
      </div>
    );

  return (
    <main className="min-h-screen bg-[#1a1a1a] text-white p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          🎫 <span className="tracking-tight uppercase">My Requests</span>
        </h1>

        {tickets.length === 0 ? (
          <div className="bg-[#2b2b2b] p-12 rounded-2xl border border-dashed border-[#3b3b3b] text-center">
            <p className="text-gray-400 mb-4">
              You haven't submitted any tickets yet.
            </p>
            {/* Updated redirect path */}
            <button
              onClick={() => router.push("/pages/request")}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-bold transition-all"
            >
              Create First Ticket
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((t) => (
              <div
                key={t.id}
                className="bg-[#2b2b2b] border border-[#3b3b3b] p-6 rounded-xl flex items-center justify-between shadow-xl"
              >
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xl">
                      {t.music_category === "choreo" ? "💃" : "📖"}
                    </span>
                    <h3 className="font-bold text-lg">{t.title}</h3>
                  </div>
                  <p className="text-sm text-gray-400">
                    BPM: {t.base_bpm} ➔ {t.target_bpm} |{" "}
                    {new Date(t.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div
                  className={`px-4 py-1.5 rounded-full border text-xs font-black uppercase tracking-widest ${getStatusStyle(t.status)}`}
                >
                  {t.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
