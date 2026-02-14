"use client";
import React, { useState, useEffect } from "react";
import { FaSearch, FaChevronDown, FaTimes, FaCheck } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

interface Option {
  label: string;
  value: string;
}

interface CustomDropdownProps {
  value: string;
  options: Option[];
  onSelect: (val: string) => void;
  type: string;
  activeDropdown: string | null;
  setActiveDropdown: (val: string | null) => void;
}

/**
 * ⚓ CUSTOM DROPDOWN (Outside to prevent re-mounting)
 */
const CustomDropdown = ({
  value,
  options,
  onSelect,
  type,
  activeDropdown,
  setActiveDropdown,
}: CustomDropdownProps) => {
  const isOpen = activeDropdown === type;
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div
      className="relative flex-1 min-w-0 sm:flex-initial sm:min-w-40"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => setActiveDropdown(isOpen ? null : type)}
        className={`w-full flex items-center justify-between px-4 py-2.5 bg-white dark:bg-[#111] border rounded-xl transition-colors duration-300 ${
          isOpen
            ? "border-blue-500 ring-2 ring-blue-500/20"
            : "border-gray-200 dark:border-[#222] hover:border-gray-300 dark:hover:border-[#444]"
        }`}
      >
        <span className="text-[10px] font-black uppercase tracking-widest truncate text-gray-900 dark:text-white">
          {selectedOption?.label}
        </span>

        {/* 🏹 FIXED ARROW ANIMATION */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="flex items-center justify-center ml-2"
        >
          <FaChevronDown
            className={`text-[10px] ${
              isOpen ? "text-blue-500" : "text-gray-500 dark:text-gray-400"
            }`}
          />
        </motion.div>
      </button>

      {/* 🎭 THE ROLL-UP / WINDOW SHADE ANIMATION */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key={`${type}-menu`}
            initial={{ height: 0, opacity: 0, scaleY: 0.9 }}
            animate={{ height: "auto", opacity: 1, scaleY: 1 }}
            exit={{
              height: 0,
              opacity: 0,
              scaleY: 0.9,
              transition: { duration: 0.25, ease: "circIn" },
            }}
            transition={{ duration: 0.35, ease: "circOut" }}
            style={{
              transformOrigin: "top", // ⚓ Ensures it rolls UP to the button
              overflow: "hidden",
            }}
            className="absolute top-full left-0 right-0 sm:left-auto sm:right-0 mt-2 w-full sm:min-w-50 bg-white dark:bg-[#161616] border border-gray-200 dark:border-[#222] rounded-2xl shadow-2xl z-100"
          >
            <div className="p-2 space-y-1">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onSelect(opt.value);
                    setActiveDropdown(null);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[10px] font-black tracking-widest transition-colors ${
                    value === opt.value
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {opt.label}
                  {value === opt.value && <FaCheck size={8} />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function AdminSearch({
  searchQuery,
  setSearchQuery,
  filters,
  setFilters,
}: any) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // 🖱️ SITE-WIDE CLICK TO CLOSE
  useEffect(() => {
    const handleGlobalClick = () => setActiveDropdown(null);
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, []);

  const genreOptions = [
    { label: "ALL GENRES", value: "all" },
    { label: "ROCK & ROLL", value: "rnr" },
    { label: "FASHION", value: "fashion" },
  ];

  const urgencyOptions = [
    { label: "ALL URGENCY", value: "all" },
    { label: "🚨 OVERDUE", value: "overdue" },
    { label: "🔥 URGENT", value: "urgent" },
    { label: "⏳ SOON", value: "soon" },
  ];

  return (
    <div className="w-full flex justify-center mb-10 px-4">
      <div className="w-full max-w-300 flex flex-col md:flex-row gap-4 items-stretch md:items-center">
        {/* Search Bar */}
        <div
          className="relative flex-1 w-full group"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FaSearch className="text-gray-500 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search by Title, ID, or Genre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-12 py-3 bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-2xl focus:border-blue-500 outline-none transition-all text-xs sm:text-sm font-medium text-gray-900 dark:text-white shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400"
            >
              <FaTimes size={12} />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-row gap-3 w-full md:w-auto shrink-0">
          <CustomDropdown
            type="genre"
            value={filters.genre}
            options={genreOptions}
            onSelect={(val: string) => setFilters({ ...filters, genre: val })}
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
          />

          <CustomDropdown
            type="urgency"
            value={filters.urgency}
            options={urgencyOptions}
            onSelect={(val: string) => setFilters({ ...filters, urgency: val })}
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
          />
        </div>
      </div>
    </div>
  );
}
