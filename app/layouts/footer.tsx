"use client";

export default function Footer() {
  return (
    <footer className="relative z-10 py-12 text-center w-full border-t border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#0a0a0a] transition-colors duration-500">
      <div className="text-sm opacity-60 text-gray-900 dark:text-white">
        © {new Date().getFullYear()} Song Tailor. Developed for creators.
      </div>
    </footer>
  );
}