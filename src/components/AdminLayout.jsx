"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  BedDouble,
  Settings,
  LogOut,
  ChevronRight,
  Crown,
  Globe,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const mainSiteUrl = process.env.NEXT_PUBLIC_MAIN_SITE_URL || "https://hotelrajmahalpalace.com";

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Bookings Ledger", href: "/bookings", icon: CalendarCheck },
    { name: "Rooms Management", href: "/rooms", icon: BedDouble },
    { name: "Settings & Status", href: "/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.error(e);
      }
    }
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("rajmahal_admin_logged_in");
    }
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-cream text-charcoal flex flex-col font-sans selection:bg-sandstone selection:text-white">
      {/* Top Header Bar */}
      <header className="bg-charcoal text-cream border-b border-gold/30 px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between shadow-xl fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="md:hidden p-2 text-gold hover:bg-white/10 rounded-lg transition-colors cursor-pointer shrink-0"
            aria-label="Toggle navigation"
          >
            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/dashboard" className="flex items-center gap-2.5 sm:gap-3 group min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-sandstone border border-gold/40 flex items-center justify-center text-gold shadow-md group-hover:scale-105 transition-transform shrink-0">
              <Crown className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 truncate">
              <span className="text-[9px] sm:text-[10px] font-mono tracking-[0.2em] sm:tracking-[0.3em] text-gold uppercase block truncate">
                HOTEL MANAGEMENT
              </span>
              <h1 className="text-sm sm:text-lg lg:text-xl font-serif text-white tracking-wide truncate">
                Hotel Rajmahal Palace
              </h1>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 text-xs font-serif shrink-0">
          <a
            href={mainSiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded border border-gold/50 text-[#C5A059] hover:bg-[#C5A059] hover:text-[#100F0E] hover:border-[#C5A059] transition-all duration-200 group font-bold"
          >
            <Globe className="w-3.5 h-3.5 text-current" />
            <span className="uppercase text-[11px] tracking-wider text-current">Public Website</span>
          </a>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded bg-gradient-to-r from-[#C9A86A] via-[#D4AF37] to-[#C9A86A] text-[#100F0E] font-bold border border-gold/40 font-serif text-xs transition-transform hover:scale-105 cursor-pointer shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5 text-[#100F0E]" />
            <span className="uppercase text-[11px] tracking-wider hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Mobile Drawer Backdrop */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 md:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* Main Body with Fixed Desktop Sidebar */}
      <div className="pt-16 flex-1 flex flex-col md:flex-row relative">
        {/* Sidebar Navigation */}
        <aside
          className={`w-72 max-w-[85vw] md:w-64 bg-charcoal-light border-r border-gold/20 p-5 shrink-0 flex flex-col justify-between z-40 transition-transform duration-200 ease-in-out ${
            mobileNavOpen
              ? "fixed top-16 left-0 bottom-0 translate-x-0 shadow-2xl overflow-y-auto"
              : "hidden md:flex md:fixed md:top-16 md:left-0 md:bottom-0 md:w-64 md:translate-x-0 md:overflow-y-auto"
          }`}
        >
          <div className="space-y-6">
            <div className="px-3 py-1.5 text-[10px] uppercase font-mono tracking-[0.25em] text-gold/80 border-b border-white/10 flex items-center justify-between">
              <span>ADMIN NAVIGATION</span>
              <ShieldCheck className="w-3.5 h-3.5 text-gold" />
            </div>

            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href === "/dashboard" && pathname === "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileNavOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded text-xs font-serif tracking-wider transition-all ${
                      isActive
                        ? "bg-sandstone text-white border-l-4 border-gold shadow-lg font-semibold"
                        : "text-cream/70 hover:text-white hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? "text-gold" : "text-cream/50"}`} />
                      <span>{item.name}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-gold" />}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer Info */}
          <div className="pt-6 border-t border-white/10 space-y-3 mt-6">
            <a
              href={mainSiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex md:hidden items-center justify-center gap-2 w-full py-2.5 bg-white/5 hover:bg-[#C5A059] border border-gold/40 text-[#C5A059] hover:text-[#100F0E] rounded text-xs font-serif uppercase tracking-wider font-bold transition-all"
            >
              <Globe className="w-3.5 h-3.5 text-current" />
              <span className="text-current">View Public Website</span>
            </a>

            <div className="p-3.5 rounded bg-charcoal border border-gold/20 space-y-1 text-xs">
              <span className="text-[10px] text-gold uppercase tracking-widest block font-mono">
                ROYAL HERITAGE
              </span>
              <p className="text-cream/70 text-[11px] leading-relaxed">
                Hotel Rajmahal Palace Management Console. Powered by Supabase & Razorpay.
              </p>
            </div>
          </div>
        </aside>

        {/* Page Content Container with md:pl-64 to offset fixed sidebar */}
        <main className="flex-1 md:pl-64 w-full min-w-0">
          <div className="p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
