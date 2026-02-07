"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-xl transition-all duration-300 bg-gray-100 dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333] text-gray-800 dark:text-yellow-400 hover:scale-110 active:scale-95"
      aria-label="Toggle Theme"
    >
      {theme === "dark" ? <Sun size={20} /> : <Moon size={20} className="text-blue-600" />}
    </button>
  );
}