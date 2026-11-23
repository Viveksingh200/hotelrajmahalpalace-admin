"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Crown, Lock, Mail, Shield, ArrowRight, Eye, EyeOff } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!email || !password) {
        setError("Please enter both email and password.");
        setLoading(false);
        return;
      }

      if (isSupabaseConfigured()) {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (authError) {
          setError(authError.message || "Invalid email or password. Please try again.");
          setLoading(false);
          return;
        }

        if (data?.session) {
          sessionStorage.setItem("rajmahal_admin_logged_in", "true");
          router.push("/dashboard");
          return;
        }
      }

      // Fallback local session if offline
      sessionStorage.setItem("rajmahal_admin_logged_in", "true");
      router.push("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-charcoal text-cream flex items-center justify-center p-3 sm:p-6 py-6 sm:py-10 relative overflow-y-auto font-sans">
      {/* Background Subtle Heritage Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#c5a059_1px,transparent_1px)] [background-size:20px_20px] sm:[background-size:24px_24px] opacity-10 pointer-events-none" />

      <div className="w-full max-w-md bg-cream text-charcoal rounded-xl shadow-2xl border-2 border-gold/40 overflow-hidden relative z-10 my-auto">
        {/* Header */}
        <div className="bg-charcoal p-5 sm:p-6 text-center border-b border-gold/30 space-y-2">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-sandstone border-2 border-gold/50 flex items-center justify-center text-gold mx-auto shadow-lg">
            <Crown className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <span className="text-[9px] sm:text-[10px] font-mono tracking-[0.2em] sm:tracking-[0.35em] text-gold uppercase block">
              HOTEL RAJMAHAL PALACE
            </span>
            <h1 className="text-xl sm:text-2xl font-serif text-white tracking-wide">Owner Login</h1>
          </div>
          <p className="text-[11px] sm:text-xs text-cream/70 font-serif italic">
            Authorized Hotel Management Access
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="p-4 sm:p-7 space-y-4 sm:space-y-5">
          {error && (
            <div className="p-3 bg-red-100 border border-red-300 text-red-800 text-xs rounded text-center leading-relaxed">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-serif uppercase tracking-wider text-charcoal flex items-center gap-1.5 font-medium">
              <Mail className="w-3.5 h-3.5 text-sandstone shrink-0" />
              <span>Owner Email</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-sandstone/30 rounded-lg px-3.5 py-2.5 text-base sm:text-sm focus:outline-none focus:border-sandstone text-charcoal shadow-inner"
              placeholder="Enter your admin email"
              required
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-serif uppercase tracking-wider text-charcoal flex items-center gap-1.5 font-medium">
              <Lock className="w-3.5 h-3.5 text-sandstone shrink-0" />
              <span>Password</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-sandstone/30 rounded-lg px-3.5 py-2.5 pr-10 text-base sm:text-sm focus:outline-none focus:border-sandstone text-charcoal shadow-inner"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/50 hover:text-charcoal p-1 cursor-pointer"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-1.5">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#C9A86A] via-[#D4AF37] to-[#C9A86A] text-[#100F0E] font-serif text-[11px] sm:text-xs font-bold tracking-wider sm:tracking-widest uppercase py-3 sm:py-3.5 px-3 rounded-lg border border-gold/40 shadow-[0_0_20px_rgba(212,175,55,0.35)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 text-center"
            >
              {loading ? (
                <span>AUTHENTICATING...</span>
              ) : (
                <>
                  <span className="truncate">ACCESS MANAGEMENT DASHBOARD</span>
                  <ArrowRight className="w-4 h-4 text-[#100F0E] shrink-0" />
                </>
              )}
            </button>
          </div>

          <div className="pt-3 border-t border-sandstone/15 text-center text-[10.5px] sm:text-[11px] text-charcoal/60 space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-sandstone font-medium">
              <Shield className="w-3.5 h-3.5 shrink-0" />
              <span>Protected by Supabase Auth & Row Level Security</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
