"use client";

import { useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import AdminLayout from "@/components/AdminLayout";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { HOTEL_INFO } from "@/data/hotel";
import { Database, CreditCard, CheckCircle2, AlertTriangle } from "lucide-react";

export default function AdminSettingsPage() {
  const [supabaseActive, setSupabaseActive] = useState(false);
  const [razorpayActive, setRazorpayActive] = useState(false);

  useEffect(() => {
    setSupabaseActive(isSupabaseConfigured());
    const rzpKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    setRazorpayActive(Boolean(rzpKey && !rzpKey.includes("rzp_test_your_key")));
  }, []);

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="border-b border-sandstone/20 pb-4">
            <span className="text-xs uppercase tracking-[0.25em] text-sandstone font-bold block">
              SYSTEM & SECURITY CONFIGURATION
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-charcoal">
              Hotel Settings & Backend Integration
            </h2>
          </div>

          {/* Hotel Identity Card */}
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
