"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { FaYoutube, FaPlus, FaTrash, FaPaperPlane, FaAlignLeft } from "react-icons/fa";

export default function RequestPage() {
  const [title, setTitle] = useState("");
  const [links, setLinks] = useState<string[]>([""]); 
  const [baseBpm, setBaseBpm] = useState("");
  const [targetBpm, setTargetBpm] = useState("");
  
  // 🛠️ Default is "Dance Class"
  const [musicType, setMusicType] = useState("Dance Class");
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");
  
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const addLinkField = () => {
    setLinks([...links, ""]);
  };

  const removeLinkField = (index: number) => {
    const newLinks = links.filter((_, i) => i !== index);
    setLinks(newLinks);
  };

  const handleLinkChange = (index: number, value: string) => {
    const newLinks = [...links];
    newLinks[index] = value;
    setLinks(newLinks);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("You must be logged in!");
      router.push("/auth");
      return;
    }

    // Filter valid links
    const validLinks = links.filter(link => link.trim() !== "");

    const { error } = await supabase.from("song_requests").insert([
      {
        user_id: user.id,
        title,
        youtube_link: validLinks, 
        base_bpm: baseBpm,
        target_bpm: targetBpm,
        music_category: musicType, // Sends "Dance Class" or "Choreo"
        deadline: deadline || null,
        // 🛠️ Logic: Only send description if type is "choreo"
        description: musicType === "Choreo" ? description : null, 
        status: "new",
        position: 1000 
      },
    ]);

    if (error) {
      alert("Error creating ticket: " + error.message);
    } else {
      router.push("/pages/user/my-tickets");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#121212]">
      <form onSubmit={handleSubmit} className="bg-[#1e1e1e] border border-[#333] p-8 rounded-2xl shadow-2xl w-full max-w-lg relative overflow-hidden">
        
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

        <h1 className="text-3xl font-bold text-white mb-6 text-center tracking-tight">New Request</h1>

        <div className="space-y-4">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Song Title / Artist</label>
            <input 
              required 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Michael Jackson - Billie Jean" 
              className="w-full bg-[#252525] border border-[#444] text-white p-3 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Type Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Type</label>
               <select 
                 value={musicType}
                 onChange={(e) => {
                    setMusicType(e.target.value);
                    // Optional: Reset to 1 link if switching back to Dance Class
                    if (e.target.value === "dance class") setLinks([links[0] || ""]);
                 }}
                 className="w-full bg-[#252525] border border-[#444] text-white p-3 rounded-xl focus:outline-none focus:border-blue-500 appearance-none"
               >
                 <option value="dance class">Dance Class</option>
                 <option value="choreo">Choreo</option>
               </select>
            </div>
            <div>
               <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Deadline</label>
               <input 
                 type="date" 
                 value={deadline}
                 onChange={(e) => setDeadline(e.target.value)}
                 className="w-full bg-[#252525] border border-[#444] text-white p-3 rounded-xl focus:outline-none focus:border-blue-500"
               />
            </div>
          </div>

          {/* 🎥 YouTube Links */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">YouTube Reference(s)</label>
            <div className="space-y-2">
              {links.map((link, index) => (
                <div key={index} className="flex gap-2">
                  <div className="relative flex-1">
                    <FaYoutube className="absolute left-3 top-3.5 text-red-500" />
                    <input 
                      type="text" 
                      value={link}
                      onChange={(e) => handleLinkChange(index, e.target.value)}
                      placeholder="Paste YouTube Link" 
                      className="w-full bg-[#252525] border border-[#444] text-white py-3 pl-10 pr-4 rounded-xl focus:outline-none focus:border-red-500 transition-colors"
                    />
                  </div>
                  {/* Delete button: Only show if >1 link AND type is Choreo (or just if >1 link generally) */}
                  {links.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removeLinkField(index)}
                      className="p-3 bg-[#2a2a2a] text-gray-400 hover:text-red-500 rounded-xl border border-[#444] transition-colors"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            {/* 🛠️ Add Button - Only visible for Choreo */}
            {musicType === "choreo" && (
              <button 
                type="button" 
                onClick={addLinkField}
                className="mt-2 text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors animate-in fade-in"
              >
                <FaPlus /> Add Another Link
              </button>
            )}
          </div>

          {/* BPMs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Current BPM</label>
              <input 
                type="text" 
                value={baseBpm}
                onChange={(e) => setBaseBpm(e.target.value)}
                placeholder="e.g. 128" 
                className="w-full bg-[#252525] border border-[#444] text-white p-3 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Target BPM</label>
              <input 
                type="text" 
                value={targetBpm}
                onChange={(e) => setTargetBpm(e.target.value)}
                placeholder="e.g. 130" 
                className="w-full bg-[#252525] border border-[#444] text-white p-3 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* 📝 Description - Only visible for Choreo */}
          {musicType === "choreo" && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
               <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                 Choreography Instructions
               </label>
               <div className="relative">
                 <FaAlignLeft className="absolute left-3 top-3.5 text-gray-500" />
                 <textarea 
                   value={description}
                   onChange={(e) => setDescription(e.target.value)}
                   placeholder="Describe the cuts, structure, or specific details..."
                   rows={4}
                   className="w-full bg-[#252525] border border-[#444] text-white py-3 pl-10 pr-4 rounded-xl focus:outline-none focus:border-blue-500 transition-colors resize-none"
                 />
               </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl mt-4 transition-all transform active:scale-95 shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? "Sending..." : <><FaPaperPlane /> Submit Request</>}
          </button>
        </div>
      </form>
    </div>
  );
}