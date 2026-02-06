"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { FaMusic, FaYoutube, FaClock, FaCheck, FaInfoCircle } from "react-icons/fa";
import { useToast } from "@/app/context/ToastContext"; 

export default function RequestSongPage() {
  const router = useRouter();
  const { showToast } = useToast(); 
  
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Form State
  const [title, setTitle] = useState("");
  const [youtubeLinks, setYoutubeLinks] = useState([""]); 
  const [baseBpm, setBaseBpm] = useState("");
  const [targetBpm, setTargetBpm] = useState("");
  const [musicCategory, setMusicCategory] = useState("class music");
  const [description, setDescription] = useState(""); 

  useEffect(() => {
    getUser();
  }, []);

  async function getUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        router.push("/auth");
    } else {
        setUser(user);
    }
  }

  // --- Dynamic Input Handlers ---
  const handleLinkChange = (index: number, value: string) => {
    const newLinks = [...youtubeLinks];
    newLinks[index] = value;
    setYoutubeLinks(newLinks);
  };

  const addLinkField = () => {
    if (youtubeLinks.length < 5) {
        setYoutubeLinks([...youtubeLinks, ""]);
    } else {
        showToast("Max 5 links allowed", "info");
    }
  };

  const removeLinkField = (index: number) => {
    const newLinks = youtubeLinks.filter((_, i) => i !== index);
    setYoutubeLinks(newLinks);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    // Validation
    const validLinks = youtubeLinks.filter(link => link.trim() !== "");
    if (validLinks.length === 0) {
        showToast("Please add at least one YouTube link.", "error");
        return;
    }

    setLoading(true);

    const { error } = await supabase.from("song_requests").insert([
      {
        user_id: user.id,
        title,
        youtube_link: validLinks, 
        base_bpm: baseBpm,
        target_bpm: targetBpm,
        music_category: musicCategory,
        // Only save description if Choreo is selected (optional cleanup)
        description: musicCategory === "choreo" ? description : "",
        status: "new",
      },
    ]);

    if (error) {
      showToast("Error submitting request: " + error.message, "error");
    } else {
      showToast("Request submitted successfully!", "success");
      router.push("/pages/user/my-tickets");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-[#121212] text-white flex justify-center items-start pt-10 sm:pt-20">
      <div className="w-full max-w-2xl bg-[#1e1e1e] border border-[#333] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

        <h1 className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-3 relative z-10">
          <FaMusic className="text-blue-500" /> New Song Request
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          
          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">Project Title</label>
            <input
              type="text"
              className="w-full bg-[#252525] border border-[#444] rounded-xl p-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="e.g. Summer Vibe Mix"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* YouTube Links (Dynamic Array) */}
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2 flex justify-between">
                <span>YouTube Links</span>
                {/* Only show 'Add up to 5' hint if Choreo */}
                {musicCategory === "choreo" && <span className="text-xs font-normal text-gray-500">Add up to 5</span>}
            </label>
            <div className="space-y-3">
                {youtubeLinks.map((link, index) => (
                    <div key={index} className="flex gap-2">
                        <div className="relative flex-1">
                            <FaYoutube className="absolute left-3 top-3.5 text-red-500" />
                            <input
                                type="url"
                                className="w-full bg-[#252525] border border-[#444] rounded-xl p-3 pl-10 text-white focus:border-blue-500 focus:outline-none transition-colors"
                                placeholder="https://youtube.com/..."
                                value={link}
                                onChange={(e) => handleLinkChange(index, e.target.value)}
                                required={index === 0} 
                            />
                        </div>
                        {youtubeLinks.length > 1 && (
                            <button 
                                type="button" 
                                onClick={() => removeLinkField(index)}
                                className="px-3 py-2 bg-red-900/20 text-red-400 rounded-xl hover:bg-red-900/40 transition-colors text-sm font-bold"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                ))}
            </div>
            
            {/* 🛠️ CONDITIONAL ADD BUTTON: Only show if Choreo */}
            {musicCategory === "choreo" && youtubeLinks.length < 5 && (
                <button 
                    type="button" 
                    onClick={addLinkField}
                    className="mt-3 text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                >
                    + Add Another Link
                </button>
            )}
          </div>

          {/* BPM Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Base BPM</label>
              <div className="relative">
                <FaClock className="absolute left-3 top-3.5 text-gray-500" />
                <input
                  type="number"
                  className="w-full bg-[#252525] border border-[#444] rounded-xl p-3 pl-10 text-white focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="120"
                  value={baseBpm}
                  onChange={(e) => setBaseBpm(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Target BPM</label>
              <div className="relative">
                <FaClock className="absolute left-3 top-3.5 text-gray-500" />
                <input
                  type="number"
                  className="w-full bg-[#252525] border border-[#444] rounded-xl p-3 pl-10 text-white focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="128"
                  value={targetBpm}
                  onChange={(e) => setTargetBpm(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">Category</label>
            <div className="grid grid-cols-2 gap-4">
                <button
                    type="button"
                    onClick={() => {
                        setMusicCategory("class music");
                        // Optional: Reset links to 1 when switching back to Class Music?
                        // setYoutubeLinks([youtubeLinks[0]]); 
                    }}
                    className={`p-4 rounded-xl border transition-all font-bold text-center
                        ${musicCategory === "class music" 
                            ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20" 
                            : "bg-[#252525] border-[#444] text-gray-400 hover:border-gray-300"
                        }
                    `}
                >
                    Class Music
                </button>
                <button
                    type="button"
                    onClick={() => setMusicCategory("choreo")}
                    className={`p-4 rounded-xl border transition-all font-bold text-center
                        ${musicCategory === "choreo" 
                            ? "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/20" 
                            : "bg-[#252525] border-[#444] text-gray-400 hover:border-gray-300"
                        }
                    `}
                >
                    Choreo
                </button>
            </div>
          </div>

          {/* 🛠️ CONDITIONAL DESCRIPTION: Only show if Choreo */}
          {musicCategory === "choreo" && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-sm font-bold text-gray-400 mb-2 flex items-center gap-2">
                    Description <FaInfoCircle className="text-gray-600" title="Add specific details or instructions" />
                </label>
                <textarea
                className="w-full bg-[#252525] border border-[#444] rounded-xl p-3 text-white focus:border-blue-500 focus:outline-none transition-colors min-h-[100px] resize-y"
                placeholder="Any specific instructions, cuts, or vibe details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {loading ? "Submitting..." : <><FaCheck /> Submit Request</>}
          </button>

        </form>
      </div>
    </div>
  );
}