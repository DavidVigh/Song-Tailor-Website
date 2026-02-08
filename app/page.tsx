"use client";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import {
  FaMusic,
  FaLayerGroup,
  FaMagic,
  FaArrowRight,
  FaPlay,
  FaCut,
  FaCloudUploadAlt,
  FaCheckDouble,
  FaDownload,
  FaPlusCircle,
} from "react-icons/fa";

// 🎬 ANIMATION VARIANTS (Fixed TS Types)
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

export default function LandingPage() {
  return (
    /* 🛠️ FIX: Cleaned up container classes to prevent scroll conflicts */
    <div className="relative w-full flex flex-col items-center bg-gray-50 text-gray-900 dark:bg-[#0a0a0a] dark:text-white">
      {/* 🌫️ DECORATIVE BACKGROUND BLOBS */}
      {/* 🛠️ FIX: Changed to 'fixed' to prevent them from expanding page height/width */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 opacity-20 dark:block hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], x: [0, -60, 0], y: [0, -40, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] bg-purple-600 rounded-full blur-[120px]"
        />
      </div>

      {/* 🦸 SECTION 1: HERO */}
      <main className="relative z-10 w-full px-6 md:px-12 lg:px-24 text-center flex flex-col items-center justify-center min-h-[100dvh] space-y-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-white/50 backdrop-blur-md dark:border-white/10 dark:bg-white/5 text-xs font-bold tracking-widest uppercase mb-4"
        >
          <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-ping" />
          The Future of Dance Edits
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-5xl md:text-7xl lg:text-9xl font-black tracking-tighter mb-4 leading-[1.1]"
        >
          Tailor Your <br />
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-500 dark:to-pink-500 bg-clip-text text-transparent">
            Perfect Sound
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-lg md:text-2xl max-w-3xl mx-auto leading-relaxed text-gray-600 dark:text-gray-400"
        >
          The ultimate platform for choreographers and dancers to request,
          manage, and perfect their music cuts. Professional editing,
          simplified.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col md:flex-row gap-4 justify-center items-center mt-10"
        >
          <Link
            href="/auth"
            className="group px-10 py-5 rounded-full font-bold text-xl shadow-xl hover:scale-105 transition-all flex items-center gap-3 bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/30 dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            Get Started{" "}
            <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="#workflow"
            className="px-10 py-5 rounded-full font-bold text-xl border-2 hover:scale-105 transition-all flex items-center gap-2 border-gray-300 text-gray-700 hover:border-gray-400 dark:border-white/20 dark:text-white dark:hover:bg-white/10"
          >
            <FaPlay className="text-sm" /> How it Works
          </Link>
        </motion.div>
      </main>

      {/* 📦 SECTION 2: FEATURES */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 w-full px-6 md:px-12 lg:px-24 py-20"
      >
        <FeatureCard
          icon={<FaMusic className="text-blue-500" size={28} />}
          title="Custom Cuts"
          desc="Precise edits tailored to your choreography."
          hoverColor="hover:border-blue-500/50"
        />
        <FeatureCard
          icon={<FaMagic className="text-purple-500" size={28} />}
          title="Pro Polish"
          desc="Seamless transitions and tempo changes."
          hoverColor="hover:border-purple-500/50"
        />
        <FeatureCard
          icon={<FaLayerGroup className="text-pink-500" size={28} />}
          title="Easy Tracking"
          desc="Track revisions in one dashboard."
          hoverColor="hover:border-pink-500/50"
        />
      </motion.div>

      {/* 🛠️ SECTION 3: WORKFLOW */}
      <section
        id="workflow"
        className="relative z-10 w-full px-6 md:px-12 lg:px-24 py-32 space-y-20"
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center space-y-4"
        >
          <h2 className="text-4xl md:text-6xl font-black tracking-tight">
            The Workflow
          </h2>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Four simple steps to audio perfection.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          <StepCard
            num="01"
            icon={<FaCloudUploadAlt />}
            title="Upload"
            desc="Submit links or raw files with timestamps."
          />
          <StepCard
            num="02"
            icon={<FaCut />}
            title="Tailor"
            desc="We craft the cut and adjust the BPM."
          />
          <StepCard
            num="03"
            icon={<FaCheckDouble />}
            title="Review"
            desc="Request revisions until it's perfect."
          />
          <StepCard
            num="04"
            icon={<FaDownload />}
            title="Perform"
            desc="Download your master and hit the stage."
          />
        </motion.div>
      </section>

      {/* 💎 SECTION 4: WHY CHOOSE US */}
      <section className="relative z-10 w-full px-6 md:px-12 lg:px-24 py-32">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-white dark:bg-[#111] p-8 md:p-16 rounded-[3rem] border border-gray-200 dark:border-white/5 shadow-2xl"
        >
          <div className="space-y-6">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">
              Why Choose <br /> Song Tailor?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              Traditional software is clunky. We've streamlined editing into a
              visual dashboard where you track every request in real-time.
            </p>
            <ul className="space-y-4">
              {[
                "Lossless Audio Quality",
                "Automated Notifications",
                "AI-Enhanced Tempo Transitions",
                "Full Request History",
              ].map((text, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4 font-bold text-lg"
                >
                  <FaPlusCircle className="text-blue-500 text-sm" /> {text}
                </motion.li>
              ))}
            </ul>
          </div>
          <div className="relative aspect-video rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
            <FaMusic className="text-white/10 text-[10rem] absolute" />
            <p className="relative z-10 text-white font-black text-2xl uppercase tracking-widest text-center px-6">
              Precision editing for <br /> the modern stage.
            </p>
          </div>
        </motion.div>
      </section>

      {/* 🚀 SECTION 5: FINAL CTA */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative z-10 w-full px-6 py-32 text-center"
      >
        <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tighter">
          Ready to cut your track?
        </h2>
        <motion.div
          className="inline-block"
          whileHover={{
            scale: 1.02,
          }} /* 🛠️ Reduced scale slightly to be safer */
          whileTap={{ scale: 0.98 }}
        >
          <Link
            href="/auth"
            className="inline-flex items-center gap-3 px-12 py-6 rounded-full font-bold text-2xl bg-blue-600 text-white hover:bg-blue-700 shadow-2xl shadow-blue-500/20"
          >
            Get Started Now <FaMagic />
          </Link>
        </motion.div>
      </motion.section>
    </div>
  );
}

// 🃏 REUSABLE COMPONENTS (Untouched, just ensured types are correct)
function FeatureCard({ icon, title, desc, hoverColor }: any) {
  return (
    <motion.div
      variants={fadeInUp}
      className={`p-10 rounded-[2.5rem] border shadow-lg transition-all duration-500 hover:-translate-y-2 group bg-white border-gray-200 dark:bg-[#151515] dark:border-[#252525] ${hoverColor}`}
    >
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 bg-gray-50 dark:bg-black/40 group-hover:scale-110 group-hover:rotate-3 transition-transform">
        {icon}
      </div>
      <h3 className="text-3xl font-extrabold mb-4">{title}</h3>
      <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
        {desc}
      </p>
    </motion.div>
  );
}

function StepCard({ num, icon, title, desc }: any) {
  return (
    <motion.div
      variants={fadeInUp}
      className="p-8 rounded-[2rem] bg-white dark:bg-[#151515] border border-gray-200 dark:border-[#222] shadow-lg space-y-4 relative overflow-hidden group min-h-[220px]"
    >
      {/* 🛠️ FIX: Adjusted positioning from -top-2 -right-2 to top-4 right-4 or similar 
          to ensure they stay within the card's padding area and don't get cropped. */}
      <span className="absolute top-4 right-6 text-7xl font-black opacity-10 dark:opacity-20 group-hover:scale-110 transition-transform select-none pointer-events-none">
        {num}
      </span>

      <div className="relative z-10 text-3xl text-blue-500 bg-blue-50 dark:bg-blue-900/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
        {icon}
      </div>

      <div className="relative z-10">
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
          {desc}
        </p>
      </div>
    </motion.div>
  );
}
