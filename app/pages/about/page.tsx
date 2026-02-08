"use client";
import Link from "next/link";
import { motion, Variants } from "framer-motion"; // 🛠️ Explicitly imported Variants type
import { 
  FaMusic, 
  FaLayerGroup, 
  FaMagic, 
  FaArrowLeft, 
  FaCut, 
  FaCloudUploadAlt, 
  FaCheckDouble,
  FaDownload 
} from "react-icons/fa";

// 🎬 ANIMATION VARIANTS: Explicitly typed to resolve TypeScript compatibility
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: "easeOut" } 
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function About() {
  return (
    <div className="min-h-screen flex flex-col items-center transition-colors duration-500 overflow-x-hidden relative
      bg-gray-50 text-gray-900 
      dark:bg-[#0a0a0a] dark:text-white"
    >
      {/* 🌫️ ANIMATED DECORATIVE BLOBS: Floating background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-10 dark:block hidden">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0] 
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] right-[-5%] w-[35%] h-[35%] bg-pink-600 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            x: [0, -60, 0],
            y: [0, -40, 0] 
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[60%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]" 
        />
      </div>

      <main className="relative z-10 w-full px-6 md:px-12 lg:px-24 py-20 space-y-32">
        
        {/* 🔙 BACK LINK: Slide-in entrance */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-7xl mx-auto"
        >
          <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white transition-colors font-bold group">
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Home
          </Link>
        </motion.div>

        {/* 🏷️ INTRO SECTION: Scroll-triggered reveal */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="max-w-4xl mx-auto text-center space-y-6"
        >
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter">
            We Edit, <span className="text-blue-600 dark:text-blue-400 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">You Dance.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
            Song Tailor was built by creators, for creators. We understand that a choreographer's vision shouldn't be limited by technical audio hurdles. Our mission is to provide seamless, professional-grade music edits that feel as fluid as your movement.
          </p>
        </motion.section>

        {/* 🛠️ THE PROCESS: Staggered list items */}
        <section className="w-full">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-black text-center mb-16 tracking-tight"
          >
            The Workflow
          </motion.h2>
          
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            <StepCard num="01" icon={<FaCloudUploadAlt />} title="Upload" desc="Submit your YouTube links or raw files with specific timestamps." />
            <StepCard num="02" icon={<FaCut />} title="Tailor" desc="We craft the perfect cut, adjusting BPM and transitions." />
            <StepCard num="03" icon={<FaCheckDouble />} title="Review" desc="Review the draft and request revisions until it's perfect." />
            <StepCard num="04" icon={<FaDownload />} title="Perform" desc="Download your final master and hit the stage." />
          </motion.div>
        </section>

        {/* 💎 CORE VALUES: Grid section with glassmorphism */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-white dark:bg-[#111] p-8 md:p-16 rounded-[3rem] border border-gray-200 dark:border-white/5 shadow-2xl"
        >
          <div className="space-y-6">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">Why Choose <br /> Song Tailor?</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Traditional editing software is clunky and expensive. We've streamlined the process into a visual dashboard where you can track every request in real-time.
            </p>
            <ul className="space-y-4">
              {[
                { icon: <FaMusic />, text: "Lossless Audio Quality" },
                { icon: <FaMagic />, text: "AI-Enhanced Tempo Transitions" },
                { icon: <FaLayerGroup />, text: "Organized Request History" }
              ].map((item, i) => (
                <motion.li 
                  key={i} 
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + (i * 0.1) }}
                  className="flex items-center gap-4 font-bold text-lg"
                >
                  <span className="text-blue-500">{item.icon}</span> {item.text}
                </motion.li>
              ))}
            </ul>
          </div>
          <motion.div 
            whileHover={{ rotate: 1 }}
            className="relative aspect-video rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center shadow-2xl"
          >
             <FaMusic className="text-white/20 text-[12rem] absolute" />
             <p className="relative z-10 text-white font-black text-2xl uppercase tracking-widest text-center px-6">
               Precision editing for <br /> the modern stage.
             </p>
          </motion.div>
        </motion.section>

        {/* 🚀 FINAL CTA: Interactive button */}
        <motion.section 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center py-20"
        >
          <h2 className="text-3xl md:text-5xl font-black mb-8">Ready to cut your track?</h2>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link 
              href="/auth" 
              className="inline-flex items-center gap-3 px-10 py-5 rounded-full font-bold text-xl bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20"
            >
              Start Your First Project <FaMagic />
            </Link>
          </motion.div>
        </motion.section>
      </main>
    </div>
  );
}

// 🃏 HELPER COMPONENT: Reusable Step Cards
function StepCard({ num, icon, title, desc }: { num: string, icon: React.ReactNode, title: string, desc: string }) {
  return (
    <motion.div 
      variants={fadeInUp}
      className="p-8 rounded-[2rem] bg-white dark:bg-[#151515] border border-gray-200 dark:border-[#222] shadow-lg space-y-4 relative overflow-hidden group"
    >
      <span className="absolute -top-2 -right-2 text-6xl font-black opacity-5 dark:opacity-10 group-hover:scale-110 transition-transform">
        {num}
      </span>
      <div className="text-3xl text-blue-500 bg-blue-50 dark:bg-blue-900/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-2xl font-bold">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{desc}</p>
    </motion.div>
  );
}