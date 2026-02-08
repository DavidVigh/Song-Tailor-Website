"use client";
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  FaChevronLeft,
  FaMusic,
  FaBolt,
  FaStar,
  FaDrum,
  FaLayerGroup,
  FaPlus,
  FaVolumeUp,
  FaYoutube,
  FaArrowRight,
  FaCheckCircle,
  FaFire,
  FaTachometerAlt,
  FaTrash,
  FaPlusCircle,
  FaPencilAlt,
  FaHistory,
  FaCalendarAlt,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import { getYouTubeThumbnail } from "@/app/lib/utils";
import { supabase } from "@/lib/supabase"; // Ensure this path is correct for your client

// --- TYPES ---
interface Track {
  url: string;
  title: string;
  base_bpm: number | null;
  target_bpm: number | null;
  isEditing?: boolean; // For UI state only
}

// --- ANIMATION ---
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// --- SHARED COMPONENTS ---
const Currency = ({
  value,
  className = "",
}: {
  value: string | number;
  className?: string;
}) => (
  <div className={`flex items-baseline gap-1 ${className}`}>
    <span className="leading-none">
      {typeof value === "number" ? value.toLocaleString() : value}
    </span>
    <span className="text-[0.4em] font-black uppercase tracking-[0.2em] text-blue-500/80 dark:text-blue-400">
      FT
    </span>
  </div>
);

const SelectionCard = ({
  title,
  icon,
  active,
  onClick,
  description,
  priceLabel,
  disabled = false,
}: {
  title: string;
  icon: any;
  active: boolean;
  onClick: () => void;
  description?: string;
  priceLabel?: string;
  disabled?: boolean;
}) => (
  <button
    disabled={disabled}
    onClick={onClick}
    className={`relative w-full p-6 rounded-[2rem] border transition-all duration-300 text-left group
      ${
        active
          ? "bg-blue-600 border-blue-500 shadow-xl shadow-blue-900/20 scale-[1.02]"
          : "bg-white dark:bg-[#111111] border-gray-200 dark:border-white/5 hover:border-blue-500/30"
      }
      ${disabled ? "cursor-default opacity-90" : "cursor-pointer"}`}
  >
    <div className="flex justify-between items-start mb-4">
      <div
        className={`p-3 rounded-2xl transition-colors ${active ? "bg-white/20 text-white" : "bg-gray-50 dark:bg-white/5 text-blue-500"}`}
      >
        {icon}
      </div>
      {priceLabel && (
        <span
          className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border
          ${active ? "bg-white/20 border-white/30 text-white" : "bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-400/30"}`}
        >
          {priceLabel}
        </span>
      )}
    </div>
    <h3
      className={`text-lg font-black uppercase tracking-tight mb-1 ${active ? "text-white" : "text-gray-900 dark:text-white"}`}
    >
      {title}
    </h3>
    {description && (
      <p
        className={`text-xs font-medium leading-relaxed ${active ? "text-blue-100" : "text-gray-500 dark:text-gray-400"}`}
      >
        {description}
      </p>
    )}
  </button>
);

export default function NewRequestPage() {
  const router = useRouter();

  // --- CORE STATE ---
  const [step, setStep] = useState(1);
  const [genre, setGenre] = useState<"fashion" | "rocknroll" | null>(null);
  const [service, setService] = useState<string | null>(null);
  const [upgrades, setUpgrades] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isHype, setIsHype] = useState(false);
  const [hasProjectBpm, setHasProjectBpm] = useState(false);
  const [projectTargetBpm, setProjectTargetBpm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- CLASS MUSIC & TRACK STATE ---
  const [classMusicQty, setClassMusicQty] = useState(1);
  const [ytLinks, setYtLinks] = useState<any[]>([
    { url: "", title: "", isEditing: false, baseBpm: "", targetBpm: "" },
  ]);

  const isCustomTier = useMemo(
    () => service === "Full Custom" || service === "Custom Beat",
    [service],
  );
  const isClassMusic = useMemo(() => service === "Class Music", [service]);

  // --- LOGIC: SCROLL TO TOP ---
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  // --- LOGIC: TRACK GENERATION (CLASS MUSIC) ---
  useEffect(() => {
    if (isClassMusic) {
      const currentCount = ytLinks.length;
      if (classMusicQty > currentCount) {
        const diff = classMusicQty - currentCount;
        const newTracks = Array(diff)
          .fill(null)
          .map(() => ({
            url: "",
            title: "",
            isEditing: false,
            baseBpm: "",
            targetBpm: "",
          }));
        setYtLinks([...ytLinks, ...newTracks]);
      } else if (classMusicQty < currentCount) {
        setYtLinks(ytLinks.slice(0, classMusicQty));
      }
    }
  }, [classMusicQty, isClassMusic]);

  // --- LOGIC: AUTO-TICK CUSTOM UPGRADES ---
  useEffect(() => {
    if (isCustomTier) setUpgrades(["sfx", "intro", "fillers", "fast"]);
  }, [isCustomTier]);

  // --- HANDLERS: RESETS ---
  const handleGenreSelection = (selectedGenre: "fashion" | "rocknroll") => {
    if (genre !== selectedGenre) {
      setService(null);
      setUpgrades([]);
      setIsHype(false);
      setHasProjectBpm(false);
      setProjectTargetBpm("");
      setYtLinks([
        { url: "", title: "", isEditing: false, baseBpm: "", targetBpm: "" },
      ]);
      setClassMusicQty(1);
    }
    setGenre(selectedGenre);
    setStep(2);
  };

  const handleServiceSelection = (selectedService: string) => {
    if (service !== selectedService) {
      setUpgrades([]);
      setIsHype(false);
      setHasProjectBpm(false);
      setProjectTargetBpm("");
      setYtLinks([
        { url: "", title: "", isEditing: false, baseBpm: "", targetBpm: "" },
      ]);
      setClassMusicQty(1);
    }
    setService(selectedService);
    setStep(3);
  };

  // --- HANDLERS: DATA & SUBMISSION ---
  const totalPrice = useMemo(() => {
    let total = 0;
    if (isClassMusic) {
      const perTrack =
        classMusicQty >= 12
          ? 1500
          : classMusicQty >= 7
            ? 1700
            : classMusicQty >= 3
              ? 2000
              : 2500;
      return perTrack * classMusicQty;
    }
    if (genre === "fashion") {
      if (service === "Choreo Mix") total = 15000;
      if (service === "Full Custom") total = 25000;
    } else if (genre === "rocknroll") {
      if (service === "Choreo Mix") total = 18000;
      if (service === "Custom Beat") total = 35000;
    }
    if (service === "Choreo Mix") {
      if (ytLinks.length === 4) total += 2000;
      if (ytLinks.length >= 5) total += 3500;
    }
    if (!isCustomTier) {
      if (upgrades.includes("sfx")) total += 3000;
      if (upgrades.includes("intro")) total += 2500;
      if (upgrades.includes("fillers")) total += 5000;
      if (upgrades.includes("fast")) total += 5000;
    }
    return total;
  }, [
    genre,
    service,
    upgrades,
    ytLinks,
    isCustomTier,
    isClassMusic,
    classMusicQty,
  ]);

  const fetchVideoTitle = async (index: number, url: string) => {
    if (!url || (!url.includes("youtube.com") && !url.includes("youtu.be")))
      return;
    try {
      const res = await fetch(
        `https://www.youtube.com/oembed?url=${url}&format=json`,
      );
      const data = await res.json();
      const next = [...ytLinks];
      next[index].title = data.title;
      setYtLinks(next);
    } catch (e) {
      console.error(e);
    }
  };

  const updateTrackData = (index: number, key: string, val: string) => {
    const next = [...ytLinks];
    (next[index] as any)[key] = val;
    setYtLinks(next);
  };

  const toggleEdit = (index: number, val: boolean) => {
    const next = [...ytLinks];
    next[index].isEditing = val;
    if (!val) fetchVideoTitle(index, next[index].url);
    setYtLinks(next);
  };

  const handleContainerBlur = (e: React.FocusEvent, index: number) => {
    const nextFocusedElement = e.relatedTarget as Node;
    if (e.currentTarget.contains(nextFocusedElement)) return;
    toggleEdit(index, false);
  };

  const removeYtLink = (index: number) => {
    if (isClassMusic) setClassMusicQty(Math.max(1, classMusicQty - 1));
    else setYtLinks(ytLinks.filter((_, i) => i !== index));
  };

  const addYtLink = () => {
    if (ytLinks.length < 5)
      setYtLinks([
        ...ytLinks,
        { url: "", title: "", isEditing: false, baseBpm: "", targetBpm: "" },
      ]);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const formattedTracks = ytLinks.map((link) => ({
        url: link.url,
        title: link.title || "Untitled Track",
        base_bpm: link.baseBpm ? parseInt(link.baseBpm) : null,
        target_bpm: link.targetBpm ? parseInt(link.targetBpm) : null,
      }));

      const { error } = await supabase.from("song_requests").insert([
        {
          title: title || "Untitled Project",
          genre: genre === "rocknroll" ? "rnr" : "fashion", // ENUM match
          service_name: service,
          upgrades,
          total_price: totalPrice,
          deadline: deadline || null,
          description: isClassMusic ? null : description,
          hype: isHype,
          target_bpm: projectTargetBpm ? parseInt(projectTargetBpm) : null,
          tracks: formattedTracks,
          user_id: user.id,
          status: "new",
          // 'position' is handled by the DB default automatically now
        },
      ]);

      if (error) throw error;
      router.push("/pages/user/my-tickets");
    } catch (error: any) {
      console.error("Submission error:", error);
      alert(`Submission failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] pb-44">
      <div className="max-w-4xl mx-auto px-6 pt-12 sm:pt-20">
        <button
          onClick={() => (step > 1 ? setStep(step - 1) : router.back())}
          className="mb-8 flex items-center gap-2 font-black text-[10px] uppercase tracking-widest px-5 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:scale-105 transition-all"
        >
          <FaChevronLeft /> PREVIOUS STEP
        </button>

        <div className="mb-12">
          <div className="flex items-center gap-2 sm:gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= i ? "bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.3)]" : "bg-gray-200 dark:bg-white/5"}`}
              />
            ))}
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">
            {step === 3 && isClassMusic
              ? "Quantity"
              : step === 3
                ? "Technicals"
                : step === 4
                  ? "Media & Info"
                  : step === 2
                    ? "Service"
                    : "Start"}
          </h1>
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: GENRE */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={fadeInUp}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6"
            >
              <SelectionCard
                title="Fashion & Street"
                icon={<FaMusic size={20} />}
                active={genre === "fashion"}
                onClick={() => handleGenreSelection("fashion")}
                description="K-pop, Hip-hop, and Urban styles."
              />
              <SelectionCard
                title="Acro Rock & Roll"
                icon={<FaDrum size={20} />}
                active={genre === "rocknroll"}
                onClick={() => handleGenreSelection("rocknroll")}
                description="Speed tracks with mandatory drum bases."
              />
            </motion.div>
          )}

          {/* STEP 2: SERVICE */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={fadeInUp}
              className="grid grid-cols-1 gap-4"
            >
              {genre === "fashion" ? (
                <>
                  <SelectionCard
                    title="Class Music"
                    priceLabel="2.500 FT"
                    icon={<FaMusic />}
                    active={service === "Class Music"}
                    onClick={() => handleServiceSelection("Class Music")}
                    description="Rounded bulk deals for training sessions."
                  />
                  <SelectionCard
                    title="Choreo Mix"
                    priceLabel="15.000 FT"
                    icon={<FaLayerGroup />}
                    active={service === "Choreo Mix"}
                    onClick={() => handleServiceSelection("Choreo Mix")}
                    description="Competition ready mix. 3 songs included."
                  />
                  <SelectionCard
                    title="Full Custom"
                    priceLabel="25.000 FT"
                    icon={<FaStar />}
                    active={service === "Full Custom"}
                    onClick={() => handleServiceSelection("Full Custom")}
                    description="Elite production with all upgrades included."
                  />
                </>
              ) : (
                <>
                  <SelectionCard
                    title="Class Music"
                    priceLabel="2.500 FT"
                    icon={<FaDrum />}
                    active={service === "Class Music"}
                    onClick={() => handleServiceSelection("Class Music")}
                    description="Regulation speed with drum base bundles."
                  />
                  <SelectionCard
                    title="Choreo Mix"
                    priceLabel="18.000 FT"
                    icon={<FaLayerGroup />}
                    active={service === "Choreo Mix"}
                    onClick={() => handleServiceSelection("Choreo Mix")}
                    description="Advanced R&R competition mix with 3 songs."
                  />
                  <SelectionCard
                    title="Custom Beat"
                    priceLabel="35.000 FT"
                    icon={<FaBolt />}
                    active={service === "Custom Beat"}
                    onClick={() => handleServiceSelection("Custom Beat")}
                    description="Pro drum patterns with all upgrades included."
                  />
                </>
              )}
            </motion.div>
          )}

          {/* STEP 3: TECHNICALS OR QUANTITY */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={fadeInUp}
              className="space-y-8"
            >
              {isClassMusic ? (
                <div className="space-y-10">
                  <div className="bg-white dark:bg-[#111111] p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3.5rem] border border-gray-200 dark:border-white/5 shadow-xl">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-10">
                      <div className="space-y-2">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-500">
                          Config
                        </h3>
                        <p className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                          How many tracks?
                        </p>
                      </div>
                      <div className="bg-black/5 dark:bg-white/5 px-6 py-4 rounded-2xl border border-gray-200 dark:border-white/5 w-full sm:w-auto text-center sm:text-right">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                          Base Rate
                        </span>
                        <Currency
                          value={
                            classMusicQty >= 12
                              ? 1500
                              : classMusicQty >= 7
                                ? 1700
                                : classMusicQty >= 3
                                  ? 2000
                                  : 2500
                          }
                          className="text-2xl font-black"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-8">
                      <div className="w-full sm:flex-1 py-4">
                        <input
                          type="range"
                          min="1"
                          max="20"
                          step="1"
                          value={classMusicQty}
                          onChange={(e) =>
                            setClassMusicQty(parseInt(e.target.value))
                          }
                          className="w-full h-2.5 bg-gray-100 dark:bg-white/5 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                      </div>
                      <div className="w-24 h-24 sm:w-32 rounded-[2.5rem] bg-blue-600 text-white flex flex-col items-center justify-center shadow-2xl shrink-0">
                        <span className="text-4xl sm:text-5xl font-black leading-none mb-1">
                          {classMusicQty}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/70">
                          Songs
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-12">
                      {[
                        { label: "Standard", min: 1, price: "2.500 FT" },
                        { label: "Pro Pack", min: 3, price: "2.000 FT" },
                        { label: "Bulk Deal", min: 12, price: "1.500 FT" },
                      ].map((tier) => (
                        <div
                          key={tier.label}
                          className={`p-5 sm:p-6 rounded-3xl border flex sm:flex-col items-center justify-between sm:justify-center transition-all ${classMusicQty >= tier.min ? "border-green-500/40 bg-green-500/5" : "border-gray-200 dark:border-white/5 opacity-40 grayscale"}`}
                        >
                          <span className="block text-[9px] font-black uppercase text-gray-400 sm:mb-2 tracking-widest">
                            {tier.label}
                          </span>
                          <span className="text-sm sm:text-base font-black text-gray-900 dark:text-white uppercase whitespace-nowrap">
                            {tier.price}{" "}
                            <span className="text-[9px] text-blue-500">
                              /song
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-gray-100 dark:bg-white/5 p-8 rounded-[3rem] border border-dashed border-gray-300 dark:border-white/10 text-center group cursor-pointer hover:border-blue-500/50 transition-all">
                    <div className="w-14 h-14 rounded-2xl bg-white dark:bg-white/5 mx-auto flex items-center justify-center text-blue-500 mb-5 group-hover:scale-110 transition-transform">
                      <FaHistory size={20} />
                    </div>
                    <h4 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-widest mb-1">
                      Select from Done Songs
                    </h4>
                    <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                      Reuse previous tracks
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div
                      className={`p-6 rounded-[2rem] border transition-all ${hasProjectBpm ? "bg-white dark:bg-[#111111] border-blue-500/50 shadow-lg" : "bg-white dark:bg-[#111111] border-gray-200 dark:border-white/5 opacity-60"}`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-500 flex items-center gap-2">
                          <FaTachometerAlt /> Project Tempo
                        </h3>
                        {genre === "fashion" && (
                          <input
                            type="checkbox"
                            checked={hasProjectBpm}
                            onChange={(e) => setHasProjectBpm(e.target.checked)}
                            className="w-5 h-5 accent-blue-600 cursor-pointer"
                          />
                        )}
                      </div>
                      <input
                        type="number"
                        disabled={!hasProjectBpm && genre === "fashion"}
                        value={projectTargetBpm}
                        onChange={(e) => setProjectTargetBpm(e.target.value)}
                        placeholder="Target BPM"
                        className="w-full bg-gray-50 dark:bg-black/20 p-4 rounded-xl outline-none border focus:border-blue-500/50 text-sm font-bold"
                      />
                    </div>
                    <button
                      onClick={() => setIsHype(!isHype)}
                      className={`p-6 rounded-[2rem] border flex items-center justify-between transition-all ${isHype ? "bg-red-600 border-red-500 shadow-lg" : "bg-white dark:bg-[#111111] border-gray-200 dark:border-white/5"}`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-3 rounded-xl ${isHype ? "bg-white/20 text-white" : "bg-red-50 dark:bg-red-900/10 text-red-500"}`}
                        >
                          <FaFire />
                        </div>
                        <span
                          className={`font-black uppercase tracking-tight ${isHype ? "text-white" : "text-gray-900 dark:text-white"}`}
                        >
                          Hype Choreo
                        </span>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isHype ? "border-white bg-white text-red-600" : "border-gray-300"}`}
                      >
                        {isHype && <FaCheckCircle size={12} />}
                      </div>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <SelectionCard
                      title="Special FX"
                      priceLabel={isCustomTier ? "Included" : "+3.000 FT"}
                      icon={<FaVolumeUp />}
                      active={upgrades.includes("sfx")}
                      disabled={isCustomTier}
                      onClick={() =>
                        setUpgrades((u) =>
                          u.includes("sfx")
                            ? u.filter((x) => x !== "sfx")
                            : [...u, "sfx"],
                        )
                      }
                      description="Impacts and risers."
                    />
                    <SelectionCard
                      title="Custom Intro"
                      priceLabel={isCustomTier ? "Included" : "+2.500 FT"}
                      icon={<FaMusic />}
                      active={upgrades.includes("intro")}
                      disabled={isCustomTier}
                      onClick={() =>
                        setUpgrades((u) =>
                          u.includes("intro")
                            ? u.filter((x) => x !== "intro")
                            : [...u, "intro"],
                        )
                      }
                      description="Performance intro track."
                    />
                    <SelectionCard
                      title="Custom Fillers"
                      priceLabel={isCustomTier ? "Included" : "+5.000 FT"}
                      icon={<FaPlus />}
                      active={upgrades.includes("fillers")}
                      disabled={isCustomTier}
                      onClick={() =>
                        setUpgrades((u) =>
                          u.includes("fillers")
                            ? u.filter((x) => x !== "fillers")
                            : [...u, "fillers"],
                        )
                      }
                      description="Produce 8-counts from scratch."
                    />
                    <SelectionCard
                      title="Fast Delivery"
                      priceLabel={isCustomTier ? "Included" : "+5.000 FT"}
                      icon={<FaBolt />}
                      active={upgrades.includes("fast")}
                      disabled={isCustomTier}
                      onClick={() =>
                        setUpgrades((u) =>
                          u.includes("fast")
                            ? u.filter((x) => x !== "fast")
                            : [...u, "fast"],
                        )
                      }
                      description="Priority 1-week turnaround."
                    />
                  </div>
                </>
              )}
              <button
                onClick={() => setStep(4)}
                className="w-full py-6 rounded-[2.5rem] bg-gray-900 dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-xs sm:text-sm active:scale-95 transition-all shadow-xl"
              >
                Continue to media
              </button>
            </motion.div>
          )}

          {/* STEP 4: MEDIA & INFO */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={fadeInUp}
              className="space-y-10"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">
                    Project Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Mix Title"
                    className="w-full p-6 rounded-[2.5rem] bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 outline-none text-gray-900 dark:text-white font-bold transition-all shadow-sm"
                  />
                </div>
                <div className="space-y-4 relative group">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">
                    Hard Deadline
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full p-6 rounded-[2.5rem] bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 outline-none text-gray-900 dark:text-white font-bold transition-all shadow-sm pr-14 appearance-none cursor-pointer"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none group-hover:scale-110 transition-transform">
                      <FaCalendarAlt size={18} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-center ml-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 font-black tracking-[0.2em]">
                    YouTube Tracks
                  </label>
                  <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest font-black">
                    {ytLinks.length} Tracks Selected
                  </span>
                </div>
                <div className="space-y-6">
                  {ytLinks.map((track, idx) => {
                    const rawThumb = getYouTubeThumbnail([track.url]);
                    const thumb = Array.isArray(rawThumb) ? rawThumb[0] : rawThumb;
                    return (
                      <div
                        key={idx}
                        onBlur={(e) => handleContainerBlur(e, idx)}
                        className="bg-white dark:bg-[#111111] p-4 sm:p-5 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm transition-all hover:border-blue-500/20 group"
                      >
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center justify-between gap-3 sm:gap-4">
                            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                              <div className="w-16 h-10 sm:w-20 sm:h-12 rounded-xl bg-gray-100 dark:bg-black/40 overflow-hidden flex-shrink-0 border border-gray-200 dark:border-white/5">
                                {thumb ? (
                                  <img
                                    src={thumb}
                                    className="w-full h-full object-cover"
                                    alt="preview"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <FaYoutube size={16} />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 relative min-w-0">
                                {!track.isEditing ? (
                                  <div
                                    onClick={() => toggleEdit(idx, true)}
                                    className="w-full flex items-center justify-between bg-blue-50 dark:bg-blue-900/10 py-2.5 px-4 rounded-xl cursor-pointer group/title"
                                  >
                                    <div className="flex items-center gap-2 truncate pr-24">
                                      <span className="text-[11px] sm:text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-tight truncate">
                                        {track.title || "PASTE LINK..."}
                                      </span>
                                      <FaPencilAlt
                                        size={10}
                                        className="text-blue-500/40 group-hover/title:text-blue-500 transition-colors flex-shrink-0"
                                      />
                                    </div>
                                    <span
                                      className={`absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-black uppercase px-2 py-1 rounded border shadow-sm ${idx < 3 || isCustomTier || isClassMusic ? "text-green-500 border-green-500/30 bg-green-500/10" : "text-blue-500 border-blue-500/30 bg-blue-500/10"}`}
                                    >
                                      {isCustomTier || isClassMusic || idx < 3
                                        ? "Included"
                                        : idx === 3
                                          ? "+2.000 FT"
                                          : "+3.500 FT"}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="relative">
                                    <input
                                      type="text"
                                      value={track.url}
                                      onChange={(e) =>
                                        updateTrackData(
                                          idx,
                                          "url",
                                          e.target.value,
                                        )
                                      }
                                      placeholder="Paste URL..."
                                      className="w-full bg-gray-50 dark:bg-black/20 py-2.5 pl-4 pr-24 rounded-xl border focus:border-blue-500/30 outline-none font-bold text-[10px] sm:text-xs"
                                    />
                                    <span
                                      className={`absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-black uppercase px-2 py-1 rounded border ${idx < 3 || isCustomTier || isClassMusic ? "text-green-500 border-green-500/30 bg-green-500/5" : "text-blue-500 border-blue-500/30 bg-blue-500/5"}`}
                                    >
                                      {isCustomTier || isClassMusic || idx < 3
                                        ? "Included"
                                        : idx === 3
                                          ? "+2.000 FT"
                                          : "+3.500 FT"}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            {!isClassMusic && ytLinks.length > 1 && (
                              <button
                                onClick={() => removeYtLink(idx)}
                                className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 transition-all hover:text-white flex-shrink-0"
                              >
                                <FaTrash size={12} />
                              </button>
                            )}
                          </div>
                          {isClassMusic && track.isEditing && (
                            <div className="flex items-center gap-3 pl-20 sm:pl-24">
                              <div className="flex-1 space-y-1.5">
                                <span className="block text-[8px] font-black text-gray-400 uppercase tracking-widest pl-1">
                                  Base BPM
                                </span>
                                <div className="bg-gray-50 dark:bg-black/20 rounded-xl px-3 py-2.5">
                                  <input
                                    type="number"
                                    value={track.baseBpm}
                                    onChange={(e) =>
                                      updateTrackData(
                                        idx,
                                        "baseBpm",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="0"
                                    className="bg-transparent w-full outline-none font-black text-xs"
                                  />
                                </div>
                              </div>
                              <div className="flex-1 space-y-1.5">
                                <span className="block text-[8px] font-black text-blue-500 uppercase tracking-widest pl-1">
                                  Target BPM
                                </span>
                                <div className="bg-gray-50 dark:bg-black/20 rounded-xl px-3 py-2.5">
                                  <input
                                    type="number"
                                    value={track.targetBpm}
                                    onChange={(e) =>
                                      updateTrackData(
                                        idx,
                                        "targetBpm",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="0"
                                    className="bg-transparent w-full outline-none font-black text-xs text-blue-600"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                          {isClassMusic &&
                            !track.isEditing &&
                            (track.baseBpm || track.targetBpm) && (
                              <div className="flex items-center gap-3 pl-20 sm:pl-24">
                                {track.baseBpm && (
                                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5">
                                    <span className="text-[7px] font-black text-gray-400 uppercase">
                                      Base
                                    </span>
                                    <span className="text-[9px] font-black text-gray-700 dark:text-gray-300 font-black">
                                      {track.baseBpm}
                                    </span>
                                  </div>
                                )}
                                {track.targetBpm && (
                                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                    <span className="text-[7px] font-black text-blue-500 uppercase">
                                      Target
                                    </span>
                                    <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 font-black">
                                      {track.targetBpm}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                        </div>
                      </div>
                    );
                  })}
                  {!isClassMusic && ytLinks.length < 5 && (
                    <button
                      onClick={addYtLink}
                      className="w-full p-5 rounded-[2.5rem] border border-dashed border-gray-300 dark:border-white/10 flex items-center justify-center gap-2 text-gray-400 hover:text-blue-500 transition-all font-black text-[10px] uppercase tracking-widest"
                    >
                      <FaPlusCircle /> ADD ANOTHER TRACK
                    </button>
                  )}
                </div>
              </div>

              {!isClassMusic && (
                <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-white/5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4 uppercase tracking-[0.2em]">
                    Detailed Instructions
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    placeholder="Transitions, BPM notes, energy levels..."
                    className="w-full p-8 rounded-[2.5rem] bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 outline-none text-gray-900 dark:text-white font-bold resize-none shadow-sm"
                  />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="fixed bottom-0 left-0 w-full p-4 sm:p-6 z-50">
        <div className="max-w-4xl mx-auto p-5 sm:p-6 rounded-[2.5rem] bg-black/90 dark:bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400 mb-1 font-black">
              Estimated Total
            </span>
            <Currency
              value={totalPrice}
              className="text-2xl sm:text-3xl font-black text-white"
            />
          </div>
          <button
            disabled={!service || isSubmitting}
            onClick={() => (step < 4 ? setStep(step + 1) : handleSubmit())}
            className={`flex items-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all bg-blue-600 text-white hover:bg-blue-500 shadow-xl ${isSubmitting ? "opacity-50" : "active:scale-95"}`}
          >
            {isSubmitting
              ? "Processing..."
              : step === 4
                ? "Submit Request"
                : "Next Step"}{" "}
            <FaArrowRight size={10} />
          </button>
        </div>
      </div>
    </div>
  );
}