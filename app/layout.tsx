// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/app/context/ToastContext";
import Navbar from "@/app/layouts/navbar";
import { ThemeProvider } from "./layouts/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Song Tailor",
  description:
    "Song Tailor is a platform that connects choreographers with music producers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* 👇 UPDATED BODY TAG */}
      <body
        className={`${inter.className} min-h-screen bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-white`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          <Navbar />
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
