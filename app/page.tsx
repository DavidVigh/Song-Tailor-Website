"use client";
import Link from "next/link";
import { FaMusic, FaLayerGroup, FaMagic, FaArrowRight, FaPlay } from "react-icons/fa";

export default function Welcome() {
  return (
    <div className="flex flex-col items-center transition-colors duration-500 overflow-x-hidden relative
      bg-gray-50 text-gray-900 
      dark:bg-[#0a0a0a] dark:text-white"
    >
      {/* 🌫️ DECORATIVE BACKGROUND BLOBS */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-20 dark:block hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      {/* 🦸 HERO SECTION */}
      <main className="relative z-10 w-full px-6 md:px-12 lg:px-24 text-center flex flex-col items-center justify-center min-h-[90vh] space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-white/50 backdrop-blur-md dark:border-white/10 dark:bg-white/5 text-xs font-bold tracking-widest uppercase mb-4 animate-fade-in">
          <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-ping" />
          The Future of Dance Edits
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-9xl font-black tracking-tighter mb-4 leading-[1.1]">
          Tailor Your <br />
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-500 dark:to-pink-500 bg-clip-text text-transparent">
            Perfect Sound
          </span>
        </h1>

        <p className="text-lg md:text-2xl max-w-3xl mx-auto leading-relaxed text-gray-600 dark:text-gray-400">
          The ultimate platform for choreographers and dancers to request, manage, and perfect their music cuts. Professional editing, simplified.
        </p>

        <div className="flex flex-col md:flex-row gap-4 justify-center items-center mt-10">
          <Link 
            href="/auth" 
            className="group px-10 py-5 rounded-full font-bold text-xl shadow-xl hover:scale-105 transition-all flex items-center gap-3
            bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/30
            dark:bg-white dark:text-black dark:hover:bg-gray-200 dark:shadow-white/10"
          >
            Get Started 
            <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link 
            href="/pages/about" 
            className="px-10 py-5 rounded-full font-bold text-xl border-2 hover:scale-105 transition-all flex items-center gap-2
            border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-100
            dark:border-white/20 dark:text-white dark:hover:bg-white/10"
          >
            <FaPlay className="text-sm" /> How it Works
          </Link>
        </div>
      </main>

      {/* 📦 FEATURES GRID */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 w-full px-6 md:px-12 lg:px-24 py-32">
        <FeatureCard 
          icon={<FaMusic className="text-blue-500" size={28} />}
          title="Custom Cuts"
          desc="Upload your tracks and get precise edits tailored to your choreography."
          hoverColor="hover:border-blue-500/50"
        />
        <FeatureCard 
          icon={<FaMagic className="text-purple-500" size={28} />}
          title="Professional Polish"
          desc="Seamless transitions, tempo changes, and sound mastering included."
          hoverColor="hover:border-purple-500/50"
        />
        <FeatureCard 
          icon={<FaLayerGroup className="text-pink-500" size={28} />}
          title="Easy Management"
          desc="Track your requests, revisions, and final files all in one dashboard."
          hoverColor="hover:border-pink-500/50"
        />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc, hoverColor }: { icon: React.ReactNode, title: string, desc: string, hoverColor: string }) {
  return (
    <div className={`p-10 rounded-[2.5rem] border shadow-lg transition-all duration-500 hover:-translate-y-2 group
      bg-white border-gray-200 shadow-gray-200/50 ${hoverColor}
      dark:bg-[#151515] dark:border-[#252525] dark:shadow-black/50 dark:hover:bg-[#1a1a1a]`}
    >
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-transform group-hover:scale-110 group-hover:rotate-3
        bg-gray-50 
        dark:bg-black/40"
      >
        {icon}
      </div>
      <h3 className="text-3xl font-extrabold mb-4 text-gray-900 dark:text-white">
        {title}
      </h3>
      <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
        {desc}
      </p>
    </div>
  );
}