"use client";

import { useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import AdminLayout from "@/components/AdminLayout";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { HOTEL_INFO } from "@/data/hotel";
import {
  Database,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Mail,
  ShieldCheck,
  Eye,
  EyeOff,
  KeyRound,
  RefreshCw,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [supabaseActive, setSupabaseActive] = useState(false);
  const [razorpayActive, setRazorpayActive] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Email update state
  const [currentEmail, setCurrentEmail] = useState("admin@rajmahalpalace.in");
  const [newEmail, setNewEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState({ type: "", message: "" });

  // Password update state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    setSupabaseActive(isSupabaseConfigured());
    const rzpKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    setRazorpayActive(Boolean(rzpKey && !rzpKey.includes("rzp_test_your_key")));

    const loadUser = async () => {
      if (isSupabaseConfigured()) {
        try {
          const { data } = await supabase.auth.getUser();
          if (data?.user) {
            setCurrentUser(data.user);
            if (data.user.email) {
              setCurrentEmail(data.user.email);
            }
          }
        } catch (e) {
          console.error(e);
        }
      } else if (typeof window !== "undefined") {
        const stored = localStorage.getItem("rajmahal_admin_email");
        if (stored) setCurrentEmail(stored);
      }
    };

    loadUser();
  }, []);

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    setEmailStatus({ type: "", message: "" });

    if (!newEmail || !newEmail.includes("@")) {
      setEmailStatus({ type: "error", message: "Please enter a valid email address." });
      return;
    }

    if (newEmail.toLowerCase() === currentEmail.toLowerCase()) {
      setEmailStatus({ type: "error", message: "New email is the same as current email." });
      return;
    }

    setEmailLoading(true);

    try {
      const res = await fetch("/api/admin/auth/update-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_email",
          currentEmail,
          newEmail,
          userId: currentUser?.id,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to update email");
      }

      setCurrentEmail(newEmail);
      setNewEmail("");
      if (typeof window !== "undefined") {
        localStorage.setItem("rajmahal_admin_email", newEmail);
      }
      setEmailStatus({
        type: "success",
        message: `Admin email successfully updated to ${newEmail}.`,
      });
    } catch (err) {
      setEmailStatus({ type: "error", message: err.message || "Failed to update email." });
    } finally {
      setEmailLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordStatus({ type: "", message: "" });

    if (!newPassword || newPassword.length < 6) {
      setPasswordStatus({
        type: "error",
        message: "New password must be at least 6 characters long.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordStatus({
        type: "error",
        message: "New password and confirmation do not match.",
      });
      return;
    }

    setPasswordLoading(true);

    try {
      const res = await fetch("/api/admin/auth/update-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_password",
          currentEmail,
          currentPassword,
          newPassword,
          userId: currentUser?.id,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to update password");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordStatus({
        type: "success",
        message: "Admin password updated successfully. Use your new password on next login.",
      });
    } catch (err) {
      setPasswordStatus({
        type: "error",
        message: err.message || "Failed to update password.",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-6 max-w-5xl">
          {/* Header */}
          <div className="border-b border-sandstone/20 pb-4">
            <span className="text-xs uppercase tracking-[0.25em] text-sandstone font-bold block">
              SYSTEM & SECURITY CONFIGURATION
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-charcoal">
              Hotel Settings & Account Security
            </h2>
          </div>

          {/* Admin Credentials & Security Management Card */}
          <div className="bg-white rounded-lg border-2 border-gold/40 shadow-md overflow-hidden">
            <div className="bg-charcoal text-cream p-5 border-b border-gold/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="shrink-0 w-9 h-9 rounded-full bg-sandstone border border-gold/40 flex items-center justify-center text-gold">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-gold block">
                    ACCESS CONTROL
                  </span>
                  <h3 className="text-lg font-serif text-white">
                    Admin Login Credentials & Security
                  </h3>
                </div>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 divide-y lg:divide-y-0 lg:divide-x divide-sandstone/15">
              {/* 1. Update Email Form */}
              <form onSubmit={handleUpdateEmail} className="space-y-4 lg:pr-4">
                <div className="flex items-center gap-2 text-charcoal border-b border-sandstone/15 pb-2">
                  <Mail className="w-4 h-4 text-sandstone" />
                  <h4 className="font-serif font-bold text-sm">Change Admin Email</h4>
                </div>

                {emailStatus.message && (
                  <div
                    className={`p-3 rounded text-xs flex items-center gap-2 ${emailStatus.type === "success"
                      ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                      : "bg-red-100 text-red-900 border border-red-300"
                      }`}
                  >
                    {emailStatus.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-700 shrink-0" />
                    )}
                    <span>{emailStatus.message}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-serif uppercase tracking-wider text-charcoal/70 block">
                    Current Active Email
                  </label>
                  <input
                    type="email"
                    value={currentEmail}
                    disabled
                    className="w-full bg-cream-muted border border-sandstone/20 rounded px-3 py-2 text-xs font-mono text-charcoal cursor-not-allowed opacity-80"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-serif uppercase tracking-wider text-charcoal block font-medium">
                    New Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="Enter new email (e.g. owner@rajmahalpalace.in)"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                    className="w-full bg-white border border-sandstone/30 rounded px-3 py-2 text-xs text-charcoal focus:outline-none focus:border-sandstone"
                  />
                </div>

                <button
                  type="submit"
                  disabled={emailLoading || !newEmail}
                  className="w-full py-2.5 px-4 rounded bg-sandstone hover:bg-sandstone-dark text-white font-serif text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {emailLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  <span>{emailLoading ? "Updating Email..." : "Update Email Address"}</span>
                </button>
              </form>

              {/* 2. Update Password Form */}
              <form onSubmit={handleUpdatePassword} className="space-y-4 pt-6 lg:pt-0 lg:pl-4">
                <div className="flex items-center gap-2 text-charcoal border-b border-sandstone/15 pb-2">
                  <Lock className="w-4 h-4 text-sandstone" />
                  <h4 className="font-serif font-bold text-sm">Change Admin Password</h4>
                </div>

                {passwordStatus.message && (
                  <div
                    className={`p-3 rounded text-xs flex items-center gap-2 ${passwordStatus.type === "success"
                      ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                      : "bg-red-100 text-red-900 border border-red-300"
                      }`}
                  >
                    {passwordStatus.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-700 shrink-0" />
                    )}
                    <span>{passwordStatus.message}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-serif uppercase tracking-wider text-charcoal block font-medium">
                    New Password (Min. 6 Characters)
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full bg-white border border-sandstone/30 rounded px-3 py-2 pr-9 text-xs text-charcoal focus:outline-none focus:border-sandstone"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2.5 text-charcoal/50 hover:text-charcoal cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-serif uppercase tracking-wider text-charcoal block font-medium">
                    Confirm New Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full bg-white border border-sandstone/30 rounded px-3 py-2 text-xs text-charcoal focus:outline-none focus:border-sandstone"
                  />
                </div>

                <button
                  type="submit"
                  disabled={passwordLoading || !newPassword || !confirmPassword}
                  className="w-full py-2.5 px-4 rounded bg-gradient-to-r from-[#C9A86A] via-[#D4AF37] to-[#C9A86A] text-[#100F0E] font-serif text-xs uppercase tracking-wider font-bold shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {passwordLoading ? <RefreshCw className="w-4 h-4 animate-spin text-[#100F0E]" /> : <KeyRound className="w-4 h-4 text-[#100F0E]" />}
                  <span>{passwordLoading ? "Updating Password..." : "Update Password"}</span>
                </button>
              </form>
            </div>
          </div>

          {/* Hotel Property Identity Card */}
          <div className="bg-white p-6 rounded-lg border border-sandstone/20 shadow-sm space-y-4">
            <h3 className="text-lg font-serif text-charcoal border-b border-sandstone/15 pb-2">
              Hotel Property Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
              <div>
                <label className="text-charcoal/60 block font-serif uppercase tracking-wider text-[10px]">
                  Property Name
                </label>
                <span className="font-semibold text-charcoal text-sm">{HOTEL_INFO.name}</span>
              </div>

              <div>
                <label className="text-charcoal/60 block font-serif uppercase tracking-wider text-[10px]">
                  Address / Location
                </label>
                <span className="font-semibold text-charcoal text-sm">{HOTEL_INFO.address}</span>
              </div>

              <div>
                <label className="text-charcoal/60 block font-serif uppercase tracking-wider text-[10px]">
                  Contact Phone
                </label>
                <span className="font-semibold text-charcoal">{HOTEL_INFO.phone}</span>
              </div>

              <div>
                <label className="text-charcoal/60 block font-serif uppercase tracking-wider text-[10px]">
                  Reservations Email
                </label>
                <span className="font-semibold text-charcoal">{HOTEL_INFO.email}</span>
              </div>
            </div>
          </div>

          {/* System & API Status Card */}
          <div className="bg-white p-6 rounded-lg border border-sandstone/20 shadow-sm space-y-5">
            <h3 className="text-lg font-serif text-charcoal border-b border-sandstone/15 pb-2">
              Database & Security Integration Diagnostics
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Supabase Status */}
              <div className="p-4 rounded-lg border border-sandstone/20 bg-cream-muted space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-sandstone" />
                    <span className="font-serif font-bold text-charcoal text-sm">Supabase PostgreSQL & RLS</span>
                  </div>
                  {supabaseActive ? (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> CONNECTED
                    </span>
                  ) : (
                    <span className="text-[10px] bg-amber-100 text-amber-900 font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> DEMO FALLBACK MODE
                    </span>
                  )}
                </div>

                <p className="text-xs text-charcoal/70 leading-relaxed">
                  {supabaseActive
                    ? "Production Supabase database connected. Row Level Security policies enforce admin data isolation."
                    : "Using active in-memory & local state fallback layer. To connect live Supabase PostgreSQL, add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to environment variables."}
                </p>
              </div>

              {/* Razorpay Status */}
              <div className="p-4 rounded-lg border border-sandstone/20 bg-cream-muted space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-gold" />
                    <span className="font-serif font-bold text-charcoal text-sm">Razorpay Payment Gateway</span>
                  </div>
                  {razorpayActive ? (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> LIVE ACTIVE
                    </span>
                  ) : (
                    <span className="text-[10px] bg-amber-100 text-amber-900 font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> TEST DEMO MODE
                    </span>
                  )}
                </div>

                <p className="text-xs text-charcoal/70 leading-relaxed">
                  {razorpayActive
                    ? "Razorpay integration active. Server-side HMAC SHA256 signature verification enabled."
                    : "Operating with built-in Razorpay order creation and verification simulator. To use live Razorpay payments, configure NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
