"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

// --- Profile Settings Component ---
function ProfileSettings({ user }: { user: any }) {
  const [name, setName] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      if (data) setName(data.full_name || "");
    }
    fetchProfile();
  }, [user]);

  async function handleUpdate() {
    setUpdating(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: name })
      .eq("id", user.id);
    
    if (error) alert("Error updating name");
    else alert("Profile updated!");
    setUpdating(false);
  }

  return (
    <div className="bg-[#2b2b2b] p-4 rounded-xl border border-[#3b3b3b] mb-8 flex gap-4 items-end">
      <div className="flex-1">
        <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Your Display Name</label>
        <input 
          value={name} 
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-[#1a1a1a] border border-[#3b3b3b] rounded-lg p-2 text-white outline-none focus:border-blue-500"
        />
      </div>
      <button onClick={handleUpdate} disabled={updating} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-bold transition-all">
        {updating ? "SAVING..." : "UPDATE"}
      </button>
    </div>
  );
}

// --- Main Page Component ---
export default function SongRequestPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [formData, setFormData] = useState({
    title: "",
    target_bpm: "",
    base_bpm: "",
    deadline: "",
    youtube_link: "",
    music_category: "class music",
  });

  // Check authentication on load
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth"); // Redirect to login if not authenticated
      } else {
        setUser(user);
      }
    };
    checkUser();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setStatus("loading");

    // Insert request with user_id link
    const { error } = await supabase.from("song_requests").insert([
      {
        title: formData.title,
        user_id: user.id, // THE "CONNECTION" KEY
        target_bpm: parseInt(formData.target_bpm) || 0,
        base_bpm: parseInt(formData.base_bpm) || 0,
        deadline: formData.deadline || null,
        youtube_link: formData.youtube_link,
        music_category: formData.music_category,
        status: "pending",
      },
    ]);

    if (error) {
      alert(`Error: ${error.message}`);
      setStatus("idle");
    } else {
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
  }

  if (!user) return <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center text-white">Loading session...</div>;

  return (
    <main className="min-h-screen bg-[#1a1a1a] text-white flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-lg">
        
        {/* Profile Section */}
        <ProfileSettings user={user} />

        <div className="bg-[#2b2b2b] p-8 rounded-2xl border-2 border-[#3b3b3b] shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              🧵 <span className="tracking-tight uppercase">Tailor // Ticket</span>
            </h1>
            <button 
              onClick={() => supabase.auth.signOut().then(() => router.push("/auth"))}
              className="text-xs text-red-400 hover:text-red-300 uppercase font-bold"
            >
              Logout
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Song Title</label>
              <input
                type="text" required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-[#3b3b3b] rounded-lg p-3 outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Base BPM</label>
                <input
                  type="number"
                  value={formData.base_bpm}
                  onChange={(e) => setFormData({ ...formData, base_bpm: e.target.value })}
                  className="w-full bg-[#1a1a1a] border border-[#3b3b3b] rounded-lg p-3 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Target BPM</label>
                <input
                  type="number"
                  value={formData.target_bpm}
                  onChange={(e) => setFormData({ ...formData, target_bpm: e.target.value })}
                  className="w-full bg-[#1a1a1a] border border-[#3b3b3b] rounded-lg p-3 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Music Type</label>
              <select
                value={formData.music_category}
                onChange={(e) => setFormData({ ...formData, music_category: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-[#3b3b3b] rounded-lg p-3 text-white outline-none"
              >
                <option value="class music">Class Music</option>
                <option value="choreo">Choreo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Deadline</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-[#3b3b3b] rounded-lg p-3 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">YouTube Link</label>
              <input
                type="url"
                value={formData.youtube_link}
                onChange={(e) => setFormData({ ...formData, youtube_link: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-[#3b3b3b] rounded-lg p-3 outline-none"
                placeholder="https://youtube.com/..."
              />
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-[#1f538d] hover:bg-blue-600 py-4 rounded-lg font-bold transition-all mt-4"
            >
              {status === "loading" ? "SUBMITTING..." : status === "success" ? "TICKET CREATED ✅" : "CREATE TICKET"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}