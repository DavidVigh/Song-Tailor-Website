import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/app/layouts/navbar"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Song Tailor",
  description: "Request songs for the DJ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#121212] text-white`}>
        <Navbar />
        {/* 🛠️ FIX: Removed 'pt-24'. Sticky navbar handles spacing automatically. */}
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}