"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export default function AdminGuard({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      // If visiting login page, don't block
      if (pathname === "/login" || pathname === "/admin/login") {
        setLoading(false);
        return;
      }

      // Check session in Supabase if configured
      if (isSupabaseConfigured()) {
        try {
          const { data } = await supabase.auth.getSession();
          if (data?.session) {
            setIsAuthenticated(true);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error("Supabase auth check error:", e);
        }
      }

      // Check local session storage fallback for demo owner access
      if (typeof window !== "undefined") {
        const localAuth = sessionStorage.getItem("rajmahal_admin_logged_in");
        if (localAuth === "true") {
          setIsAuthenticated(true);
          setLoading(false);
          return;
        }
      }

      // Redirect to login page if unauthenticated
      router.push("/login");
    };

    checkAuth();
  }, [pathname, router]);

  if (pathname === "/login" || pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-charcoal text-cream flex items-center justify-center font-serif">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs uppercase tracking-widest text-gold">Verifying Palace Access...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
}
