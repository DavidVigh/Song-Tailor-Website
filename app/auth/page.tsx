"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { FaMusic, FaUser, FaLock, FaEnvelope } from "react-icons/fa";
import { useToast } from "@/app/context/ToastContext";

export default function AuthPage() {
  const router = useRouter();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState(""); 

  // Check if already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        checkRole(session.user.id);
      }
    };
    checkUser();
  }, []);

  // 🔄 SELF-HEALING CHECK ROLE
  async function checkRole(userId: string) {
    try {
      // 1. Try to get the profile
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle(); 

      // 2. SUCCESS: Profile found
      if (profile) {
        if (profile.role === "admin") {
            router.push("/pages/admin");
        } else {
            router.push("/pages/request");
        }
        return;
      }

      // 3. FAILURE: Profile missing? -> AUTO-FIX IT
      console.log("Profile not found. Attempting to auto-create...");
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
         // Use UPSERT here too for safety
         const { error: insertError } = await supabase.from("profiles").upsert([
           {
             id: user.id,
             email: user.email,
             full_name: user.user_metadata?.full_name || "User",
             role: "user"
           }
         ], { onConflict: 'id' });

         if (!insertError) {
             console.log("Profile auto-created. Redirecting...");
             router.push("/pages/request");
         } else {
             console.error("Critical: Failed to auto-create profile:", JSON.stringify(insertError, null, 2));
             showToast("Account error. Please contact support.", "error");
         }
      }

    } catch (err) {
      console.error("Unexpected auth error:", err);
    }
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // 📝 SIGN UP LOGIC
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName, 
            },
          },
        });

        if (error) throw error;

        // Manually create profile using UPSERT (Safe Insert)
        if (data.user) {
          const { error: profileError } = await supabase
            .from("profiles")
            .upsert(
              [
                {
                  id: data.user.id,
                  full_name: fullName,
                  email: email,
                  role: "user",
                },
              ],
              { onConflict: 'id' } // If ID exists, just update/ignore
            );
            
           if (profileError) {
             console.error("Profile creation error:", JSON.stringify(profileError, null, 2));
           }
        }

        showToast("Account created! Logging you in...", "success");
        
        if (data.session) {
            checkRole(data.user!.id);
        } else {
            showToast("Please check your email to confirm your account.", "info");
        }

      } else {
        // 🔐 LOGIN LOGIC
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        showToast("Welcome back!", "success");
        if (data.session) {
          checkRole(data.session.user.id);
        }
      }
    } catch (error: any) {
      showToast(error.message || "Authentication failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
      <div className="bg-[#1e1e1e] border border-[#333] p-8 rounded-2xl shadow-2xl w-full max-w-md">
        
        {/* Logo / Header */}
        <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center border border-blue-500/50 shadow-lg shadow-blue-500/20">
                <FaMusic className="text-blue-500 text-3xl" />
            </div>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2 text-center">
          {isSignUp ? "Create Account" : "Welcome Back"}
        </h1>
        <p className="text-gray-400 mb-8 text-center">
          {isSignUp ? "Join to request songs" : "Sign in to manage your requests"}
        </p>

        <form onSubmit={handleAuth} className="space-y-4">
          
          {/* Username Field (Only for Sign Up) */}
          {isSignUp && (
            <div className="relative animate-in fade-in slide-in-from-top-2">
              <FaUser className="absolute left-3 top-3.5 text-gray-500" />
              <input
                type="text"
                placeholder="Username / Full Name"
                className="w-full bg-[#252525] border border-[#333] rounded-xl p-3 pl-10 text-white focus:border-blue-500 focus:outline-none transition-colors"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}

          {/* Email Field */}
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-3.5 text-gray-500" />
            <input
              type="email"
              placeholder="Email Address"
              className="w-full bg-[#252525] border border-[#333] rounded-xl p-3 pl-10 text-white focus:border-blue-500 focus:outline-none transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Field */}
          <div className="relative">
            <FaLock className="absolute left-3 top-3.5 text-gray-500" />
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-[#252525] border border-[#333] rounded-xl p-3 pl-10 text-white focus:border-blue-500 focus:outline-none transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
          >
            {loading ? "Processing..." : (isSignUp ? "Sign Up" : "Sign In")}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-400 hover:text-blue-300 font-bold ml-1 transition-colors"
            >
              {isSignUp ? "Log In" : "Sign Up"}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}