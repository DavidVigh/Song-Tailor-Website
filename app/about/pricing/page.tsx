"use client";
import { useState } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { 
  FaCheck, FaMusic, FaBolt, FaStar, FaChevronLeft, 
  FaDrum, FaLayerGroup, FaPlus, FaVolumeUp, FaTags, FaInfoCircle 
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import Link from "next/link";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: "easeOut" } 
  }
};

const Currency = ({ value, className = "" }: { value: string, className?: string }) => (
  <div className={`flex items-baseline gap-1 ${className}`}>
    <span className="text-gray-900 dark:text-white leading-none">{value}</span>
    <span className="text-[0.4em] font-black uppercase tracking-[0.2em] text-blue-500/80 dark:text-blue-400">
      FT
    </span>
  </div>
);

const PricingBackground = () => {
  const placeholderImages = [
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1514525253361-bee8a19740c1?auto=format&fit=crop&q=80"
  ];

  return (
    <div className="absolute top-0 left-0 w-full h-[500px] z-0 overflow-hidden pointer-events-none select-none">
      <div className="absolute inset-0 flex w-[115%] -left-[7.5%] h-full opacity-30 dark:opacity-20">
        {placeholderImages.map((img, i) => (
          <div key={i} className="relative h-full flex-1 overflow-hidden"
            style={{ clipPath: 'polygon(15% 0, 100% 0, 85% 100%, 0% 100%)', marginLeft: i === 0 ? '0' : '-5%' }}>
            <img src={img} alt="bg" className="w-full h-full object-cover filter brightness-110 contrast-105" />
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-50/80 to-gray-50 dark:via-[#0a0a0a]/80 dark:to-[#0a0a0a]" />
    </div>
  );
};

export default function PricingPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"fashion" | "rocknroll">("fashion");
  const [hoveredAddon, setHoveredAddon] = useState<string | null>(null);

  const services = {
    fashion: [
      { 
        name: "Class Music", 
        price: "2.500", 
        unit: "single", 
        desc: "Individual training tracks. Rounded bulk deals.", 
        items: ["BPM Syncing", "Basic Cuts", "Clean Audio"], 
        bundles: [
          { label: "3 Tracks", perSong: "2.000", total: "6.000" },
          { label: "7 Tracks", perSong: "1.700", total: "12.000" },
          { label: "12 Tracks", perSong: "1.500", total: "18.000" }
        ],
        icon: <FaMusic className="text-blue-500" /> 
      },
      { 
        name: "Choreo Mix", 
        price: "15.000", 
        unit: "base package", 
        desc: "Competition mix (3 songs included).", 
        items: ["3 songs base", "BPM Matching", "Standard FX"], 
        scaling: [
          { label: "4th Song", price: "+2.000" },
          { label: "5th Song", price: "+2.000" },
          { label: "Revision / Restart", price: "+4.000" }
        ],
        icon: <FaLayerGroup className="text-purple-500" />, 
        popular: true 
      },
      { 
        name: "Full Custom", 
        price: "25.000", 
        unit: "start price", 
        desc: "Elite production for pro dancers.", 
        items: ["Unlimited tracks", "Stage mastering", "2 Revisions"], 
        scaling: [
          { label: "Creative Vision Sync", price: "Included" },
          { label: "Signature FX Set", price: "Included" },
          { label: "High-End Mastering", price: "Included" }
        ],
        icon: <FaStar className="text-yellow-500" /> 
      }
    ],
    rocknroll: [
      { 
        name: "Class Music", 
        price: "2.500", 
        unit: "single", 
        desc: "Regulation tracks with drum base.", 
        items: ["Mandatory Drum Base", "BPM Fixes", "Regulation Ready"], 
        bundles: [
          { label: "3 Tracks", perSong: "2.000", total: "6.000" },
          { label: "7 Tracks", perSong: "1.700", total: "12.000" },
          { label: "12 Tracks", perSong: "1.500", total: "18.000" }
        ],
        icon: <FaDrum className="text-blue-500" /> 
      },
      { 
        name: "Choreo Mix", 
        price: "18.000", 
        unit: "base package", 
        desc: "R&R competition mix (3 songs included).", 
        items: ["3 songs base", "Drum Base", "Complex Mixing"], 
        scaling: [
          { label: "4th Song", price: "+2.000" },
          { label: "5th Song", price: "+2.000" },
          { label: "Revision / Restart", price: "+5.000" }
        ],
        icon: <FaLayerGroup className="text-purple-500" />, 
        popular: true 
      },
      { 
        name: "Custom Beat", 
        price: "35.000", 
        unit: "start price", 
        desc: "Pro drum pattern production.", 
        items: ["'From Scratch' Base", "Unlimited tracks", "2 Revisions"], 
        scaling: [
          { label: "Exclusive Transitions", price: "Included" },
          { label: "Instrumental Layering", price: "Included" },
          { label: "Elite Audio Polishing", price: "Included" }
        ],
        icon: <FaBolt className="text-yellow-500" /> 
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] relative overflow-x-hidden">
      <PricingBackground />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <button onClick={() => router.back()} className="mb-8 flex items-center gap-2 font-black text-[10px] uppercase tracking-widest px-5 py-2.5 rounded-xl bg-black/60 text-white backdrop-blur-xl border border-white/20 hover:scale-105 transition-all">
          <FaChevronLeft /> Back
        </button>

        <div className="text-center mb-12 sm:mb-16">
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl sm:text-7xl font-black text-gray-900 dark:text-white tracking-tighter mb-6">
            Simple <span className="text-blue-600">Pricing.</span>
          </motion.h1>
          
          <div className="flex justify-center gap-2 sm:gap-4 mt-8">
            {["fashion", "rocknroll"].map((t) => (
              <button key={t} onClick={() => setActiveTab(t as any)}
                className={`px-4 sm:px-6 py-3 rounded-2xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest transition-all border
                  ${activeTab === t ? 'bg-blue-600 text-white border-blue-500 shadow-xl' : 'bg-white dark:bg-[#111111] text-gray-400 border-gray-200 dark:border-white/5'}`}>
                {t === "fashion" ? "Fashion & Street" : "Acro Rock & Roll"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-start">
          {services[activeTab].map((service, idx) => (
            <motion.div key={service.name} initial="hidden" animate="visible" variants={fadeInUp}
              className={`relative bg-white dark:bg-[#111111] border rounded-[2.5rem] p-6 sm:p-8 shadow-2xl transition-all hover:scale-[1.01]
                ${service.popular ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-gray-200 dark:border-[#222222]'}`}>
              
              {service.popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Best Value</div>}
              
              <div className="flex justify-between items-start mb-6 sm:mb-8">
                <div className="p-3 sm:p-4 rounded-2xl bg-gray-50 dark:bg-white/5 text-xl sm:text-2xl">{service.icon}</div>
                <div className="text-right">
                  <Currency value={service.price} className="text-2xl sm:text-4xl font-black" />
                  <p className="text-[9px] font-black text-blue-500/60 uppercase mt-1 tracking-widest">{service.unit}</p>
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-black mb-3 text-gray-900 dark:text-white uppercase tracking-tight">{service.name}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mb-6 sm:mb-8 font-medium leading-relaxed">{service.desc}</p>
              
              <ul className="space-y-3 sm:space-y-4 mb-8 sm:mb-10">
                {service.items.map(f => (
                  <li key={f} className="flex items-center gap-3 text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300">
                    <FaCheck className="text-green-500" size={10} /> {f}
                  </li>
                ))}
              </ul>

              {(service.bundles || service.scaling) && (
                <div className="mb-8 p-4 sm:p-5 rounded-3xl bg-gray-50 dark:bg-white/5 border border-dashed border-gray-300 dark:border-white/10">
                  <div className="flex items-center gap-2 mb-4">
                    <FaTags className="text-blue-500" size={12} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Rate Summary</span>
                  </div>
                  <div className="space-y-3">
                    {(service.bundles || service.scaling || []).map((opt: any) => (
                      <div key={opt.label} className="flex justify-between items-center">
                        <span className="text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-tighter">{opt.label}</span>
                        <div className="flex items-center gap-2">
                           {opt.perSong && (
                              <div className="flex items-baseline gap-0.5 text-green-500">
                                <span className="text-[9px] font-black uppercase">{opt.perSong}</span>
                                <span className="text-[7px] font-bold uppercase tracking-tighter">/track</span>
                              </div>
                           )}
                           <Currency value={opt.total || opt.price} className="text-sm font-black" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Link href="/pages/user/request/new" className={`block w-full py-4 rounded-2xl text-center font-black uppercase text-[10px] tracking-widest transition-all ${service.popular ? 'bg-blue-600 text-white shadow-blue-900/20 shadow-xl' : 'bg-gray-900 dark:bg-white text-white dark:text-black'}`}>Request Music</Link>
            </motion.div>
          ))}
        </div>

        {/* 🛠️ UPDATED PREMIUM UPGRADES WITH FILLER INFO */}
        <div className="mt-16 sm:mt-20">
          <h2 className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-8 sm:mb-10">Premium Upgrades</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
             {[
               { id: "sfx", name: "Special FX", price: "+3.000", icon: <FaVolumeUp />, color: "yellow" },
               { id: "intro", name: "Custom Intro", price: "+2.500", icon: <FaMusic />, color: "purple" },
               { 
                 id: "fillers", 
                 name: "Custom Fillers", 
                 price: "+5.000", 
                 icon: <FaLayerGroup />, 
                 color: "green",
                 // 🛠️ CUSTOMER LANGUAGE SUMMARY
                 tooltip: "Need to hit minimum time? I'll produce original 8-counts, dramatic transitions, or impact pauses from scratch to fit your needs." 
               },
               { id: "fast", name: "Fast Delivery", price: "+5.000", icon: <FaBolt />, color: "blue", tooltip: "Priority handling with delivery within a 1 week period" }
             ].map((addon) => (
               <div 
                key={addon.id} 
                className="relative group flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#151515] border border-gray-200 dark:border-white/5 shadow-sm transition-all hover:border-blue-500/50"
                onMouseEnter={() => setHoveredAddon(addon.id)}
                onMouseLeave={() => setHoveredAddon(null)}
               >
                  <div className="flex items-center gap-3">
                    <div className="text-blue-500 flex items-center gap-1.5">
                      {addon.icon}
                      {addon.tooltip && <FaInfoCircle size={10} className="opacity-40" />}
                    </div>
                    <span className="font-bold text-[10px] sm:text-[11px] uppercase tracking-widest text-gray-700 dark:text-gray-300">{addon.name}</span>
                  </div>
                  
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border tracking-widest flex items-baseline gap-0.5
                    ${addon.color === 'blue' ? 'bg-blue-600 text-white border-blue-600 dark:bg-blue-900/40 dark:text-blue-400 dark:border-blue-400/50' : 
                      addon.color === 'yellow' ? 'bg-yellow-500 text-white border-yellow-400 dark:bg-yellow-900/40 dark:text-yellow-400 dark:border-yellow-400/50' :
                      addon.color === 'purple' ? 'bg-purple-600 text-white border-purple-600 dark:bg-purple-900/40 dark:text-purple-400 dark:border-purple-400/50' :
                      'bg-green-600 text-white border-green-600 dark:bg-green-900/40 dark:text-green-400 dark:border-green-400/50'}`}>
                    {addon.price} <span className="text-[7px] tracking-tighter opacity-70">FT</span>
                  </span>

                  <AnimatePresence>
                    {hoveredAddon === addon.id && addon.tooltip && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        className="absolute bottom-full left-0 mb-3 w-56 p-4 rounded-xl bg-black/80 backdrop-blur-xl border border-white/10 text-[9px] font-black uppercase tracking-widest text-white shadow-2xl z-50 pointer-events-none"
                      >
                        <div className="flex items-center gap-2 mb-2 text-blue-400">
                          <FaStar size={10} /> <span>Pro Feature</span>
                        </div>
                        <p className="text-gray-300 leading-relaxed font-bold">{addon.tooltip}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}