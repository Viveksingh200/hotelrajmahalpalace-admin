"use client";

import { useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import AdminLayout from "@/components/AdminLayout";
import MonthlyDownloadModal from "@/components/MonthlyDownloadModal";
import { fetchDashboardMetrics, fetchAdminBookings, fetchRooms } from "@/lib/bookingService";
import {
  CalendarCheck,
  CheckCircle,
  Clock,
  BedDouble,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Download,
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [allBookings, setAllBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [monthlyDownloadOpen, setMonthlyDownloadOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [data, bookingsList, roomList] = await Promise.all([
        fetchDashboardMetrics(),
        fetchAdminBookings({}),
        fetchRooms(),
      ]);
      setMetrics(data);
      setAllBookings(bookingsList || []);
      setRooms(roomList || []);
    } catch (e) {
      console.error("Dashboard data load error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-8">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sandstone/20 pb-4">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-sandstone font-bold block">
                EXECUTIVE OVERVIEW
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif text-charcoal">
                Today at Rajmahal Palace
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Primary Download Monthly Report Button */}
              <button
                onClick={() => setMonthlyDownloadOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#C9A86A] via-[#D4AF37] to-[#C9A86A] text-[#100F0E] text-xs font-serif rounded shadow-md hover:shadow-lg transition-all cursor-pointer font-bold"
                title="Download Monthly Booking Record & Ledger (CSV / PDF)"
              >
                <Download className="w-3.5 h-3.5 text-[#100F0E]" />
                <span>Download Monthly Record</span>
              </button>

              <button
                onClick={loadData}
                className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-2 bg-white border border-sandstone/30 text-sandstone text-xs font-serif rounded hover:bg-cream-muted transition-colors cursor-pointer"
                title="Refresh Metrics"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                <span>Refresh Metrics</span>
              </button>
            </div>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Today's Arrivals */}
            <div className="bg-white p-5 rounded-lg border border-sandstone/20 shadow-sm space-y-3">
              <div className="flex justify-between items-center text-sandstone">
                <span className="text-xs font-serif uppercase tracking-wider font-semibold">
                  Today's Arrivals
                </span>
                <Clock className="w-5 h-5 text-gold" />
              </div>
              <div className="text-3xl font-serif font-bold text-charcoal">
                {metrics ? metrics.todayArrivalsCount : 0}
              </div>
              <p className="text-[11px] text-charcoal/60">Guests checking in today</p>
            </div>

            {/* Card 2: Today's Departures */}
            <div className="bg-white p-5 rounded-lg border border-sandstone/20 shadow-sm space-y-3">
              <div className="flex justify-between items-center text-sandstone">
                <span className="text-xs font-serif uppercase tracking-wider font-semibold">
                  Today's Departures
                </span>
                <CalendarCheck className="w-5 h-5 text-gold" />
              </div>
              <div className="text-3xl font-serif font-bold text-charcoal">
                {metrics ? metrics.todayDeparturesCount : 0}
              </div>
              <p className="text-[11px] text-charcoal/60">Guests checking out today</p>
            </div>

            {/* Card 3: Room Availability */}
            <div className="bg-white p-5 rounded-lg border border-sandstone/20 shadow-sm space-y-3">
              <div className="flex justify-between items-center text-sandstone">
                <span className="text-xs font-serif uppercase tracking-wider font-semibold">
                  Room Availability
                </span>
                <BedDouble className="w-5 h-5 text-gold" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-serif font-bold text-emerald-700">
                  {metrics ? metrics.availableRoomsCount : 8}
                </span>
                <span className="text-xs text-charcoal/60 font-mono font-medium">
                  Available / {metrics ? (metrics.totalRoomsCount || 8) : 8} Total
                </span>
              </div>
              <p className="text-[11px] text-charcoal/60">
                {metrics?.unavailableRoomsCount || 0} occupied / unavailable
              </p>
            </div>

            {/* Card 4: Revenue Summary */}
            <div className="bg-charcoal text-cream p-5 rounded-lg border border-gold/30 shadow-md space-y-3">
              <div className="flex justify-between items-center text-gold">
                <span className="text-xs font-serif uppercase tracking-wider font-semibold">
                  Total Verified Revenue
                </span>
                <TrendingUp className="w-5 h-5 text-gold" />
              </div>
              <div className="text-3xl font-serif font-bold text-white font-mono">
                ₹{metrics ? metrics.totalRevenue.toLocaleString("en-IN") : "0"}
              </div>
              <p className="text-[11px] text-cream/70">From confirmed paid bookings</p>
            </div>
          </div>

          {/* Secondary Metric Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-cream-muted p-4 rounded border border-sandstone/20 flex items-center justify-between">
              <div>
                <span className="text-xs text-charcoal/60 block font-serif">Total Bookings Recorded</span>
                <span className="text-xl font-serif font-bold text-charcoal">
                  {metrics ? metrics.totalBookings : 0}
                </span>
              </div>
              <CalendarCheck className="w-8 h-8 text-sandstone/40" />
            </div>

            <div className="bg-cream-muted p-4 rounded border border-sandstone/20 flex items-center justify-between">
              <div>
                <span className="text-xs text-charcoal/60 block font-serif">Confirmed Reservations</span>
                <span className="text-xl font-serif font-bold text-emerald-800">
                  {metrics ? metrics.confirmedBookings : 0}
                </span>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-600/40" />
            </div>

            <div className="bg-cream-muted p-4 rounded border border-sandstone/20 flex items-center justify-between">
              <div>
                <span className="text-xs text-charcoal/60 block font-serif">Pending Payments</span>
                <span className="text-xl font-serif font-bold text-amber-800">
                  {metrics ? metrics.pendingPayments : 0}
                </span>
              </div>
              <AlertCircle className="w-8 h-8 text-amber-600/40" />
            </div>
          </div>

          {/* Operational Tables Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Today's Arrivals Section */}
            <div className="lg:col-span-6 bg-white p-6 rounded-lg border border-sandstone/20 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-sandstone/15 pb-3">
                <h3 className="text-lg font-serif text-charcoal">Today's Arrivals</h3>
                <span className="text-xs bg-sandstone/10 text-sandstone px-2.5 py-1 rounded font-serif">
                  {metrics?.todayArrivals?.length || 0} Expected
                </span>
              </div>

              {metrics?.todayArrivals?.length === 0 ? (
                <div className="p-8 text-center text-xs text-charcoal/60 font-serif italic bg-cream-muted rounded">
                  No check-in arrivals scheduled for today.
                </div>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {metrics?.todayArrivals?.map((b) => (
                    <div
                      key={b.id}
                      className="p-3 bg-cream-muted rounded border border-sandstone/10 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-mono font-bold text-sandstone block">{b.booking_reference}</span>
                        <span className="font-semibold text-charcoal text-sm">{b.customer_name}</span>
                        <span className="text-[11px] text-charcoal/60 block">{b.room?.room_name || b.room_id}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-charcoal block">
                          ₹{Number(b.total_amount || 0).toLocaleString("en-IN")}
                        </span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold uppercase">
                          {b.payment_status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Today's Departures Section */}
            <div className="lg:col-span-6 bg-white p-6 rounded-lg border border-sandstone/20 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-sandstone/15 pb-3">
                <h3 className="text-lg font-serif text-charcoal">Today's Departures</h3>
                <span className="text-xs bg-gold/20 text-wood px-2.5 py-1 rounded font-serif">
                  {metrics?.todayDepartures?.length || 0} Expected
                </span>
              </div>

              {metrics?.todayDepartures?.length === 0 ? (
                <div className="p-8 text-center text-xs text-charcoal/60 font-serif italic bg-cream-muted rounded">
                  No check-out departures scheduled for today.
                </div>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {metrics?.todayDepartures?.map((b) => (
                    <div
                      key={b.id}
                      className="p-3 bg-cream-muted rounded border border-sandstone/10 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-mono font-bold text-sandstone block">{b.booking_reference}</span>
                        <span className="font-semibold text-charcoal text-sm">{b.customer_name}</span>
                        <span className="text-[11px] text-charcoal/60 block">{b.room?.room_name || b.room_id}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-charcoal block">
                          ₹{Number(b.total_amount || 0).toLocaleString("en-IN")}
                        </span>
                        <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-semibold uppercase">
                          CHECK-OUT
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Bookings List */}
          <div className="bg-white p-6 rounded-lg border border-sandstone/20 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sandstone/15 pb-3">
              <div>
                <h3 className="text-lg font-serif text-charcoal">Recent Bookings Record</h3>
                <p className="text-xs text-charcoal/60">Latest reservation requests processed by system</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMonthlyDownloadOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-sandstone/10 hover:bg-sandstone hover:text-white text-sandstone border border-sandstone/30 text-xs font-serif transition-colors cursor-pointer"
                  title="Download Monthly Ledger"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Monthly Report</span>
                </button>

                <Link
                  href="/bookings"
                  className="text-xs font-serif text-sandstone hover:underline font-semibold flex items-center gap-1"
                >
                  <span>View All Bookings</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans border-collapse">
                <thead>
                  <tr className="bg-charcoal text-cream font-serif text-[11px] uppercase tracking-wider">
                    <th className="p-3">Reference</th>
                    <th className="p-3">Guest Name</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Check-In</th>
                    <th className="p-3">Check-Out</th>
                    <th className="p-3 text-right">Amount</th>
                    <th className="p-3 text-center">Payment</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sandstone/10">
                  {metrics?.recentBookings?.map((b) => (
                    <tr key={b.id} className="hover:bg-cream-muted/50 transition-colors">
                      <td className="p-3 font-mono font-bold text-sandstone">{b.booking_reference}</td>
                      <td className="p-3 font-medium text-charcoal">{b.customer_name}</td>
                      <td className="p-3 text-charcoal/70">{b.customer_phone}</td>
                      <td className="p-3 font-mono">{b.check_in}</td>
                      <td className="p-3 font-mono">{b.check_out}</td>
                      <td className="p-3 font-mono font-bold text-charcoal text-right">
                        ₹{Number(b.total_amount || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            b.payment_status === "paid"
                              ? "bg-emerald-100 text-emerald-800"
                              : b.payment_status === "failed"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {b.payment_status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            b.booking_status === "confirmed"
                              ? "bg-emerald-100 text-emerald-800"
                              : b.booking_status === "cancelled"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {b.booking_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Monthly Record Download & Export Modal */}
          <MonthlyDownloadModal
            isOpen={monthlyDownloadOpen}
            onClose={() => setMonthlyDownloadOpen(false)}
            allBookings={allBookings}
            rooms={rooms}
          />
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
