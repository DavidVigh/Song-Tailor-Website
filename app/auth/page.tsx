"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { FaGoogle, FaEnvelope, FaLock, FaSignInAlt, FaUserPlus } from "react-icons/fa";
import { useToast } from "@/app/context/ToastContext"; // 👈 Import Hook

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { showToast } = useToast(); // 👈 Use Hook

  // 1. Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        checkRole(session.user.id);
      }
    };
    checkUser();
  }, []);

  // 2. Role-Based Redirect Helper
  const checkRole = async (userId: string) => {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching role:", error);
      router.push("/"); 
      return;
    }

    if (profile?.role === "admin") {
      router.push("/pages/admin");
    } else {
      router.push("/pages/user/my-tickets"); // Or dashboard
    }
  };

  // 3. Email Auth Handler
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        
        // Create Profile immediately after signup
        if (data.user) {
            await supabase.from("profiles").insert([{ id: data.user.id, role: "user" }]);
        }
        
        showToast("Check your email to confirm sign up!", "info"); // 👈 Toast
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        showToast("Logged in successfully!", "success"); // 👈 Toast
        if (data.user) checkRole(data.user.id);
      }
    } catch (error: any) {
      showToast(error.message || "Authentication failed", "error"); // 👈 Toast
    } finally {
      setLoading(false);
    }
  };

  // 4. Google Auth Handler
  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      showToast(error.message, "error"); // 👈 Toast
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#121212] p-4 text-white">
      <div className="w-full max-w-md rounded-2xl border border-[#333] bg-[#1e1e1e] p-8 shadow-2xl">
        <h2 className="mb-6 text-center text-3xl font-bold tracking-tight text-white">
          {isSignUp ? "Create an Account" : "Welcome Back"}
        </h2>

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          className="mb-6 flex w-full items-center justify-center gap-3 rounded-xl bg-white py-3 font-semibold text-gray-900 transition-all hover:bg-gray-200"
        >
          <FaGoogle className="text-red-500" />
          Continue with Google
        </button>

        <div className="mb-6 flex items-center gap-4 text-sm text-gray-500">
          <div className="h-px flex-1 bg-[#333]"></div>
          OR
          <div className="h-px flex-1 bg-[#333]"></div>
        </div>

        {/* Email Form */}
        <form onSubmit={handleAuth} className="space-y-4">
          <div className="relative">
            <FaEnvelope className="absolute left-4 top-3.5 text-gray-500" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-[#333] bg-[#252525] py-3 pl-11 pr-4 text-white focus:border-blue-500 focus:outline-none"
              required
            />
          </div>
          <div className="relative">
            <FaLock className="absolute left-4 top-3.5 text-gray-500" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-[#333] bg-[#252525] py-3 pl-11 pr-4 text-white focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-bold text-white transition-all hover:bg-blue-500 disabled:opacity-50"
          >
            {loading ? "Processing..." : isSignUp ? <><FaUserPlus /> Sign Up</> : <><FaSignInAlt /> Log In</>}
          </button>
        </form>

        {/* Toggle */}
        <p className="mt-6 text-center text-sm text-gray-400">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="font-semibold text-blue-400 hover:underline"
          >
            {isSignUp ? "Log In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
}