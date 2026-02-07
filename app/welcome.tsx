"use client";
import Link from "next/link";
import { FaMusic, FaLayerGroup, FaMagic, FaArrowRight } from "react-icons/fa";

export default function Welcome() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-300
      bg-gray-50 text-gray-900 
      dark:bg-[#121212] dark:text-white"
    >
      
      {/* 🦸 HERO SECTION */}
      <main className="max-w-4xl w-full text-center space-y-8 mt-10">
        
        {/* Animated Gradient Title */}
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4">
          Tailor Your <br />
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-500 dark:to-pink-500 bg-clip-text text-transparent animate-gradient-x">
            Perfect Sound
          </span>
        </h1>

        <p className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed
          text-gray-600 
          dark:text-gray-400"
        >
          The ultimate platform for choreographers and dancers to request, manage, and perfect their music cuts. Professional editing, simplified.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center mt-8">
          <Link 
            href="/auth" 
            className="px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:scale-105 transition-all flex items-center gap-2
            bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/30
            dark:bg-white dark:text-black dark:hover:bg-gray-200 dark:shadow-white/10"
          >
            Get Started <FaArrowRight />
          </Link>
          
          <Link 
            href="/pages/about" 
            className="px-8 py-4 rounded-full font-bold text-lg border-2 hover:scale-105 transition-all
            border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-100
            dark:border-white/20 dark:text-white dark:hover:bg-white/10"
          >
            Learn More
          </Link>
        </div>
      </main>

      {/* 📦 FEATURES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full mt-20">
        <FeatureCard 
          icon={<FaMusic className="text-blue-500" size={24} />}
          title="Custom Cuts"
          desc="Upload your tracks and get precise edits tailored to your choreography."
        />
        <FeatureCard 
          icon={<FaMagic className="text-purple-500" size={24} />}
          title="Professional Polish"
          desc="Seamless transitions, tempo changes, and sound mastering included."
        />
        <FeatureCard 
          icon={<FaLayerGroup className="text-pink-500" size={24} />}
          title="Easy Management"
          desc="Track your requests, revisions, and final files all in one dashboard."
        />
      </div>

      {/* FOOTER */}
      <footer className="mt-20 py-6 text-sm opacity-60">
        © {new Date().getFullYear()} Song Tailor. All rights reserved.
      </footer>
    </div>
  );
}

// 🃏 REUSABLE CARD COMPONENT (Handles Theme Switching)
function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-6 rounded-2xl border shadow-lg transition-all hover:-translate-y-1
      bg-white border-gray-200 shadow-gray-200/50
      dark:bg-[#1e1e1e] dark:border-[#333] dark:shadow-black/50"
    >
      <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4
        bg-gray-100 
        dark:bg-black/40"
      >
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
        {desc}
      </p>
    </div>
  );
}