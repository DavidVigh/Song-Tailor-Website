"use client";
import { FaSearch, FaTimes, FaChevronDown } from "react-icons/fa";

interface SearchProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filters: any;
  setFilters: (f: any) => void;
}

export default function AdminSearch({
  searchQuery,
  setSearchQuery,
  filters,
  setFilters,
}: SearchProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
      {/* Quick Search */}
      <div className="relative flex-1 w-full">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search by Title, ID, or Genre..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-2xl focus:border-blue-500 outline-none transition-all text-sm font-medium"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <FaTimes />
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      <div className="flex gap-2 w-full md:w-auto">
        <div className="relative w-full md:w-auto">
          <select
            value={filters.genre}
            onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
            className="appearance-none w-full bg-white/90 dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-2xl pl-4 pr-9 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] outline-none shadow-sm hover:border-blue-400/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
          >
            <option value="all">All Genres</option>
            <option value="rnr">Rock & Roll</option>
            <option value="fashion">Fashion</option>
          </select>
          <FaChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
        </div>

        <div className="relative w-full md:w-auto">
          <select
            value={filters.urgency}
            onChange={(e) =>
              setFilters({ ...filters, urgency: e.target.value })
            }
            className="appearance-none w-full bg-white/90 dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-2xl pl-4 pr-9 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] outline-none shadow-sm hover:border-blue-400/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
          >
            <option value="all">All Urgency</option>
            <option value="overdue">🚨 Overdue</option>
            <option value="urgent">🔥 Urgent</option>
            <option value="soon">⏳ Soon</option>
          </select>
          <FaChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
        </div>
      </div>
    </div>
  );
}
