"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ProfileSettings from "../../components/ProfileSettings";

export default function SongRequestPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    target_bpm: "",
    base_bpm: "",
    deadline: "",
    youtube_link: "",
    music_category: "class music",
  });

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return; // Guard clause

    setStatus("loading");

    const { error } = await supabase.from("song_requests").insert([
      {
        title: formData.title,
        user_id: user.id, // Securely link the ticket to the logged-in user
        target_bpm: parseInt(formData.target_bpm) || 0,
        base_bpm: parseInt(formData.base_bpm) || 0,
        deadline: formData.deadline || null,
        youtube_link: formData.youtube_link,
        music_category: formData.music_category,
        status: "pending",
      },
    ]);

    if (error) {
      console.error(error);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    } else {
      // Reset form on success
      setFormData({
        title: "",
        base_bpm: "",
        target_bpm: "",
        deadline: "",
        youtube_link: "",
        music_category: "class music",
      });
      setStatus("success");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <main className="min-h-screen bg-[#1a1a1a] text-white flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-lg">
        {/* Profile header displayed outside the card if logged in */}
        <div className="bg-[#2b2b2b] p-8 rounded-2xl border-2 border-[#3b3b3b] shadow-2xl mt-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              🧵{" "}
              <span className="tracking-tight uppercase">Tailor // Ticket</span>
            </h1>
            {/* Logout removed from here as it is handled in the Navbar */}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Song Title */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Song Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full bg-[#1a1a1a] border border-[#3b3b3b] rounded-lg p-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* BPM Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Base BPM
                </label>
                <input
                  type="number"
                  value={formData.base_bpm}
                  onChange={(e) =>
                    setFormData({ ...formData, base_bpm: e.target.value })
                  }
                  className="w-full bg-[#1a1a1a] border border-[#3b3b3b] rounded-lg p-3 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Target BPM
                </label>
                <input
                  type="number"
                  value={formData.target_bpm}
                  onChange={(e) =>
                    setFormData({ ...formData, target_bpm: e.target.value })
                  }
                  className="w-full bg-[#1a1a1a] border border-[#3b3b3b] rounded-lg p-3 outline-none"
                />
              </div>
            </div>

            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Music Type
              </label>
              <select
                value={formData.music_category}
                onChange={(e) =>
                  setFormData({ ...formData, music_category: e.target.value })
                }
                className="w-full bg-[#1a1a1a] border border-[#3b3b3b] rounded-lg p-3 text-white outline-none"
              >
                <option value="class music">Class Music</option>
                <option value="choreo">Choreo</option>
              </select>
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Deadline
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) =>
                  setFormData({ ...formData, deadline: e.target.value })
                }
                className="w-full bg-[#1a1a1a] border border-[#3b3b3b] rounded-lg p-3 outline-none"
              />
            </div>

            {/* YouTube Link */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                YouTube Link
              </label>
              <input
                type="url"
                value={formData.youtube_link}
                onChange={(e) =>
                  setFormData({ ...formData, youtube_link: e.target.value })
                }
                className="w-full bg-[#1a1a1a] border border-[#3b3b3b] rounded-lg p-3 outline-none"
                placeholder="https://youtube.com/..."
              />
            </div>

            {/* Submit Section */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={!user || status === "loading"}
                className={`w-full py-4 rounded-lg font-bold transition-all ${
                  !user
                    ? "bg-gray-600 cursor-not-allowed opacity-50"
                    : "bg-[#1f538d] hover:bg-blue-600"
                }`}
              >
                {!user
                  ? "LOGIN REQUIRED TO SUBMIT"
                  : status === "loading"
                    ? "SUBMITTING..."
                    : status === "success"
                      ? "TICKET CREATED ✅"
                      : status === "error"
                        ? "ERROR! TRY AGAIN"
                        : "CREATE TICKET"}
              </button>

              {!user && (
                <p className="text-center text-xs text-gray-500 mt-3">
                  Don't have an account?{" "}
                  <span
                    onClick={() => router.push("/auth")}
                    className="text-blue-400 cursor-pointer hover:underline"
                  >
                    Sign up here
                  </span>
                  .
                </p>
              )}
            </div>
          </form>
        </div>

        {/* Footer Link */}
        {user && (
          <p className="text-center text-xs text-gray-500 mt-4">
            Want to see your active songs?{" "}
            <span
              onClick={() => router.push("/pages/user/my-tickets")}
              className="text-blue-400 cursor-pointer hover:underline"
            >
              View My Tickets
            </span>
          </p>
        )}
      </div>
    </main>
  );
}