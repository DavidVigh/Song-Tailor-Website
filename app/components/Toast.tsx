"use client";
import { useEffect, useState } from "react";
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from "react-icons/fa";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true); 
    const timer = setTimeout(() => {
      setIsVisible(false); 
      setTimeout(onClose, 300); 
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColors = {
    success: "bg-green-600/90 border-green-500",
    error: "bg-red-600/90 border-red-500",
    info: "bg-blue-600/90 border-blue-500",
  };

  const icons = {
    success: <FaCheckCircle className="text-white text-lg" />,
    error: <FaExclamationCircle className="text-white text-lg" />,
    info: <FaInfoCircle className="text-white text-lg" />,
  };

  return (
    <div
      // 🛠️ CHANGED: 'top-5' -> 'top-24' to sit below the navbar
      className={`fixed top-24 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md transition-all duration-300 transform 
        ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"}
        ${bgColors[type]} text-white min-w-[300px] max-w-sm`}
    >
      <div className="shrink-0">{icons[type]}</div>
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button onClick={() => setIsVisible(false)} className="text-white/70 hover:text-white transition-colors">
        <FaTimes />
      </button>
    </div>
  );
}