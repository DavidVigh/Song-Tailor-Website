"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } }, // Captured by your DB trigger
      });
      if (error) alert(error.message);
      else alert("Check your email for the confirmation link!");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
      else router.push("/"); // Redirect to home/request page
    }
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#1a1a1a] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#2b2b2b] p-8 rounded-2xl border border-[#3b3b3b] shadow-2xl">
        <h1 className="text-3xl font-bold mb-6 text-center">🧵 TAILOR // {isSignUp ? "JOIN" : "LOGIN"}</h1>
        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <input
              type="text" placeholder="Full Name" required
              className="w-full bg-[#1a1a1a] border border-[#3b3b3b] rounded-lg p-3 outline-none focus:border-blue-500"
              onChange={(e) => setFullName(e.target.value)}
            />
          )}
          <input
            type="email" placeholder="Email" required
            className="w-full bg-[#1a1a1a] border border-[#3b3b3b] rounded-lg p-3 outline-none focus:border-blue-500"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password" placeholder="Password" required
            className="w-full bg-[#1a1a1a] border border-[#3b3b3b] rounded-lg p-3 outline-none focus:border-blue-500"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-bold transition-all">
            {loading ? "PROCESSING..." : isSignUp ? "CREATE ACCOUNT" : "SIGN IN"}
          </button>
        </form>
        <button onClick={() => setIsSignUp(!isSignUp)} className="w-full mt-4 text-sm text-gray-400 hover:text-white">
          {isSignUp ? "Already have an account? Login" : "Need an account? Sign Up"}
        </button>
      </div>
    </main>
  );
}