"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { 
  FaMusic, 
  FaYoutube, 
  FaClock, 
  FaCheck, 
  FaInfoCircle, 
  FaFire, 
  FaCalendarAlt 
} from "react-icons/fa";
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
  const [deadline, setDeadline] = useState(""); 
  const [musicCategory, setMusicCategory] = useState("class music");
  const [description, setDescription] = useState(""); 
  const [isHype, setIsHype] = useState(false);
  
  // State for "Tickable" Target BPM in Choreo
  const [hasTargetBpm, setHasTargetBpm] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
          router.push("/auth");
      } else {
          setUser(user);
      }
    };
    getUser();
  }, [router]);

  // --- Dynamic Input Handlers ---
  const handleLinkChange = (index: number, value: string) => {
    const newLinks = [...youtubeLinks];
    newLinks[index] = value;
    setYoutubeLinks(newLinks);
  };

  const addLinkField = () => {
    // Double check constraint (though button should be hidden)
    if (musicCategory === "class music" && youtubeLinks.length >= 1) {
         showToast("Class Music allows only 1 link.", "info");
         return;
    }

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

    // 🛠️ Data Cleaning
    let finalBaseBpm: number | null = baseBpm ? parseInt(baseBpm) : null;
    let finalTargetBpm: number | null = targetBpm ? parseInt(targetBpm) : null;

    if (musicCategory === "choreo") {
        finalBaseBpm = null; 
        if (!hasTargetBpm) finalTargetBpm = null; 
    }

    setLoading(true);

    const { error } = await supabase.from("song_requests").insert([
      {
        user_id: user.id,
        title,
        youtube_link: validLinks, 
        base_bpm: finalBaseBpm,
        target_bpm: finalTargetBpm,
        deadline: deadline || null,
        music_category: musicCategory,
        description: musicCategory === "choreo" ? description : "",
        hype: musicCategory === "choreo" ? isHype : false,
        status: "new",
      },
    ]);

    if (error) {
      showToast("Error: " + error.message, "error");
    } else {
      showToast("Request submitted successfully!", "success");
      router.push("/pages/user/my-tickets");
    }
    setLoading(false);
  }

  const isTargetBpmDisabled = musicCategory === "choreo" && !hasTargetBpm;

  return (
    <div className="min-h-screen p-4 sm:p-8 flex justify-center items-start pt-10 sm:pt-20
      /* ☀️ Light Mode */
      bg-gray-50 text-gray-900
      /* 🌙 Dark Mode */
      dark:bg-[#121212] dark:text-white"
    >
      <div className="w-full max-w-2xl border rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden
        /* ☀️ Light Mode */
        bg-white border-gray-200
        /* 🌙 Dark Mode */
        dark:bg-[#1e1e1e] dark:border-[#333] dark:shadow-2xl"
      >
        
        {/* Decorative Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none
          bg-blue-600/10 dark:bg-blue-600/10" 
        />

        <h1 className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-3 relative z-10
          text-gray-900 dark:text-white"
        >
          <FaMusic className="text-blue-500" /> New Song Request
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          
          {/* Project Title */}
          <div>
            <label className="block text-sm font-bold mb-2
              text-gray-600 dark:text-gray-400"
            >
              Project Title
            </label>
            <input
              type="text"
              className="w-full rounded-xl p-3 border focus:outline-none transition-colors
                /* ☀️ Light Mode */
                bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500
                /* 🌙 Dark Mode */
                dark:bg-[#252525] dark:border-[#444] dark:text-white dark:focus:border-blue-500"
              placeholder="e.g. Summer Vibe Mix"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* YouTube Links */}
          <div>
            <label className="block text-sm font-bold mb-2 flex justify-between
              text-gray-600 dark:text-gray-400"
            >
                <span>YouTube Links</span>
                <span className="text-xs font-normal text-gray-500">
                    {musicCategory === "choreo" ? "Up to 5 links" : "1 link allowed"}
                </span>
            </label>
            <div className="space-y-3">
                {youtubeLinks.map((link, index) => (
                    <div key={index} className="flex gap-2">
                        <div className="relative flex-1">
                            <FaYoutube className="absolute left-3 top-3.5 text-red-500" />
                            <input
                                type="url"
                                className="w-full rounded-xl p-3 pl-10 border focus:outline-none transition-colors
                                  /* ☀️ Light Mode */
                                  bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500
                                  /* 🌙 Dark Mode */
                                  dark:bg-[#252525] dark:border-[#444] dark:text-white dark:focus:border-blue-500"
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
                                className="px-3 py-2 rounded-xl transition-colors
                                  bg-red-50 text-red-500 hover:bg-red-100
                                  dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                ))}
            </div>
            
            {/* Show Add Button ONLY if category is Choreo AND links < 5 */}
            {musicCategory === "choreo" && youtubeLinks.length < 5 && (
                <button 
                    type="button" 
                    onClick={addLinkField}
                    className="mt-3 text-sm font-bold text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                    + Add Another Link
                </button>
            )}
          </div>

          {/* BPM & Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className={`flex gap-2 ${musicCategory === "choreo" ? "flex-col" : ""}`}>
                
                {/* 1. Base BPM: Only for Class Music */}
                {musicCategory === "class music" && (
                  <div className="flex-1 animate-in fade-in slide-in-from-left-2">
                      <label className="block text-sm font-bold mb-2
                        text-gray-600 dark:text-gray-400"
                      >
                        Base BPM
                      </label>
                      <div className="relative">
                          <FaClock className="absolute left-3 top-3.5 text-gray-400" />
                          <input
                            type="number"
                            min="60"
                            max="220"
                            className="w-full rounded-xl p-3 pl-10 border focus:outline-none transition-colors
                              /* ☀️ Light Mode */
                              bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500
                              /* 🌙 Dark Mode */
                              dark:bg-[#252525] dark:border-[#444] dark:text-white dark:focus:border-blue-500"
                            placeholder="120"
                            value={baseBpm}
                            onChange={(e) => setBaseBpm(e.target.value)}
                            required
                          />
                      </div>
                  </div>
                )}

                {/* 2. Target BPM: Tickable for Choreo */}
                <div className="flex-1">
                    {musicCategory === "choreo" ? (
                      <div 
                        onClick={() => setHasTargetBpm(!hasTargetBpm)}
                        className="flex items-center gap-2 mb-2 cursor-pointer group select-none"
                      >
                         <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors
                            ${hasTargetBpm 
                              ? "bg-blue-600 border-blue-600" 
                              : "border-gray-400 group-hover:border-gray-500 dark:border-gray-500 dark:group-hover:border-gray-400"}
                         `}>
                             {hasTargetBpm && <FaCheck size={10} className="text-white" />}
                         </div>
                         <label className="text-sm font-bold cursor-pointer
                           text-gray-600 dark:text-gray-400"
                         >
                           Set Target BPM?
                         </label>
                      </div>
                    ) : (
                      <label className="block text-sm font-bold mb-2
                        text-gray-600 dark:text-gray-400"
                      >
                        Target BPM
                      </label>
                    )}

                    <div className={`relative transition-opacity duration-200 ${isTargetBpmDisabled ? "opacity-40" : "opacity-100"}`}>
                        <FaClock className="absolute left-3 top-3.5 text-gray-400" />
                        <input
                            type="number"
                            min="60"
                            max="220"
                            className={`w-full rounded-xl p-3 pl-10 border focus:outline-none transition-colors
                              /* ☀️ Light Mode */
                              bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500
                              /* 🌙 Dark Mode */
                              dark:bg-[#252525] dark:border-[#444] dark:text-white dark:focus:border-blue-500
                              ${isTargetBpmDisabled ? "cursor-not-allowed" : ""}
                            `}
                            placeholder="128"
                            value={targetBpm}
                            onChange={(e) => setTargetBpm(e.target.value)}
                            disabled={isTargetBpmDisabled}
                            required={!isTargetBpmDisabled}
                        />
                    </div>
                </div>
            </div>

            {/* Deadline (Optional) */}
            <div>
              <label className="block text-sm font-bold mb-2
                text-gray-600 dark:text-gray-400"
              >
                Deadline <span className="text-gray-500 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="date"
                  className="w-full rounded-xl p-3 pl-10 border focus:outline-none transition-colors appearance-none
                    /* ☀️ Light Mode */
                    bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500
                    /* 🌙 Dark Mode */
                    dark:bg-[#252525] dark:border-[#444] dark:text-white dark:focus:border-blue-500
                    [color-scheme:light] dark:[color-scheme:dark]"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>
            </div>

          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-sm font-bold mb-2
              text-gray-600 dark:text-gray-400"
            >
              Category
            </label>
            <div className="grid grid-cols-2 gap-4">
                <button
                    type="button"
                    onClick={() => { 
                      setMusicCategory("class music"); 
                      setIsHype(false); 
                      // If user had multiple links, trim to 1 and notify
                      if (youtubeLinks.length > 1) {
                        setYoutubeLinks([youtubeLinks[0]]);
                        showToast("Class Music allows only 1 link. Extra links removed.", "info");
                      }
                    }}
                    className={`p-4 rounded-xl border transition-all font-bold 
                      ${musicCategory === "class music" 
                        ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20" 
                        : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300 dark:bg-[#252525] dark:border-[#444] dark:text-gray-400 dark:hover:border-gray-300"
                      }`}
                >
                    Class Music
                </button>
                <button
                    type="button"
                    onClick={() => setMusicCategory("choreo")}
                    className={`p-4 rounded-xl border transition-all font-bold 
                      ${musicCategory === "choreo" 
                        ? "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/20" 
                        : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300 dark:bg-[#252525] dark:border-[#444] dark:text-gray-400 dark:hover:border-gray-300"
                      }`}
                >
                    Choreo
                </button>
            </div>
          </div>

          {/* Conditional Choreo Extras */}
          {musicCategory === "choreo" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-200">
                <div 
                    onClick={() => setIsHype(!isHype)}
                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors
                      ${isHype 
                        ? "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-500/50" 
                        : "bg-gray-50 border-gray-200 hover:border-gray-300 dark:bg-[#252525] dark:border-[#444] dark:hover:border-gray-500"
                      }`}
                >
                    <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors
                      ${isHype 
                        ? "bg-red-500 border-red-500 text-white" 
                        : "border-gray-400 dark:border-gray-500"
                      }`}
                    >
                        {isHype && <FaCheck size={12} />}
                    </div>
                    <div className="flex-1">
                        <h3 className={`font-bold text-sm transition-colors
                          ${isHype 
                            ? "text-red-600 dark:text-red-400" 
                            : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          Level Assessment / Hype Track
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">High-energy assessment choreography</p>
                    </div>
                    <FaFire className={`text-xl transition-colors ${isHype ? "text-red-500 animate-pulse" : "text-gray-400 dark:text-gray-600"}`} />
                </div>

                <div>
                    <label className="block text-sm font-bold mb-2 flex items-center gap-2
                      text-gray-600 dark:text-gray-400"
                    >
                        Description <FaInfoCircle className="text-gray-400" />
                    </label>
                    <textarea
                        className="w-full rounded-xl p-3 border focus:outline-none min-h-[100px] resize-y transition-colors
                          /* ☀️ Light Mode */
                          bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500
                          /* 🌙 Dark Mode */
                          dark:bg-[#252525] dark:border-[#444] dark:text-white dark:focus:border-blue-500"
                        placeholder="Specific instructions, cuts, or vibe details..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-4 rounded-xl shadow-lg transition-transform transform active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {loading ? "Submitting..." : <><FaCheck /> Submit Request</>}
          </button>

        </form>
      </div>
    </div>
  );
}