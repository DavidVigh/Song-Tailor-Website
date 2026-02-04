"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { FaPaperPlane, FaMusic, FaYoutube } from "react-icons/fa";

export default function RequestSongPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    title: "",
    youtube_link: "",
    base_bpm: "",
    target_bpm: "",
    deadline: "",
    music_type: "class music", // Default selection
  });

  // Check if user is logged in
  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) router.push("/auth");
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { error } = await supabase.from("song_requests").insert([
        {
          user_id: user.id,
          title: formData.title,
          youtube_link: formData.youtube_link,
          base_bpm: formData.base_bpm,
          target_bpm: formData.target_bpm,
          music_category: formData.music_type, // Maps to your DB column 'music_category'
          deadline: formData.deadline || null, // Handle empty date
          
          // 🛠️ CRITICAL FIX: Force status to 'new' so it shows in Admin Panel
          status: "new", 
        },
      ]);

      if (error) {
        alert("Error sending request: " + error.message);
      } else {
        router.push("/pages/user/my-tickets"); // Redirect to My Tickets
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-[#1e1e1e] border border-[#333] p-8 rounded-2xl w-full max-w-lg shadow-2xl">
        
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <FaMusic className="text-blue-500" /> Request a Song
        </h1>
        <p className="text-gray-400 mb-8">Fill in the details for your custom cut.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Song Title / Artist</label>
            <input
              required
              type="text"
              placeholder="e.g. Blinding Lights - The Weeknd"
              className="w-full bg-[#252525] border border-[#444] text-white p-3 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* YouTube Link */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
              <FaYoutube className="text-red-500" /> YouTube Link
            </label>
            <input
              type="url"
              placeholder="https://youtube.com/..."
              className="w-full bg-[#252525] border border-[#444] text-white p-3 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
              value={formData.youtube_link}
              onChange={(e) => setFormData({ ...formData, youtube_link: e.target.value })}
            />
          </div>

          {/* BPMs (Side by Side) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Base BPM</label>
              <input
                type="number"
                placeholder="120"
                className="w-full bg-[#252525] border border-[#444] text-white p-3 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                value={formData.base_bpm}
                onChange={(e) => setFormData({ ...formData, base_bpm: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Target BPM</label>
              <input
                type="number"
                placeholder="128"
                className="w-full bg-[#252525] border border-[#444] text-white p-3 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                value={formData.target_bpm}
                onChange={(e) => setFormData({ ...formData, target_bpm: e.target.value })}
              />
            </div>
          </div>

          {/* Type & Deadline */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Type</label>
              <select
                className="w-full bg-[#252525] border border-[#444] text-white p-3 rounded-lg focus:outline-none focus:border-blue-500 appearance-none"
                value={formData.music_type}
                onChange={(e) => setFormData({ ...formData, music_type: e.target.value })}
              >
                <option value="class music">Class Music</option>
                <option value="choreo">Choreo</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Deadline</label>
              <input
                type="date"
                className="w-full bg-[#252525] border border-[#444] text-white p-3 rounded-lg focus:outline-none focus:border-blue-500 [color-scheme:dark]"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 mt-4"
          >
            {loading ? "Sending..." : <><FaPaperPlane /> Send Request</>}
          </button>

        </form>
      </div>
    </div>
  );
}