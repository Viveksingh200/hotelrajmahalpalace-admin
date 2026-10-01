"use client";

import { useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import AdminLayout from "@/components/AdminLayout";
import MonthlyDownloadModal from "@/components/MonthlyDownloadModal";
import { fetchAdminBookings, updateBookingStatus, fetchRooms } from "@/lib/bookingService";
import { exportBookingsToCSV } from "@/lib/exportUtils";
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  X,
  Sparkles,
  RefreshCw,
  Download,
} from "lucide-react";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [roomFilter, setRoomFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Modal states
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [monthlyDownloadOpen, setMonthlyDownloadOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const roomList = await fetchRooms();
      setRooms(roomList);

      // Fetch all raw bookings for monthly report selection
      const allData = await fetchAdminBookings({});
      setAllBookings(allData);

      // Fetch filtered bookings for the table view
      const data = await fetchAdminBookings({
        search: searchQuery,
        status: statusFilter,
        paymentStatus: paymentFilter,
        roomId: roomFilter,
        dateFrom,
        dateTo,
      });
      setBookings(data);
    } catch (e) {
      console.error("Error loading admin bookings:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery, statusFilter, paymentFilter, roomFilter, dateFrom, dateTo]);

  const handleUpdateStatus = async (bookingId, bookingStatus, paymentStatus) => {
    setActionLoading(true);
    try {
      await updateBookingStatus(bookingId, bookingStatus, paymentStatus);
      await loadData();
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking((prev) => ({
          ...prev,
          booking_status: bookingStatus || prev.booking_status,
          payment_status: paymentStatus || prev.payment_status,
        }));
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleQuickExportFiltered = () => {
    exportBookingsToCSV(bookings, {
      title: "Filtered Bookings Ledger Export",
      monthLabel: dateFrom && dateTo ? `${dateFrom} to ${dateTo}` : "Current Filter View",
      year: new Date().getFullYear(),
      filterSummary: `Status: ${statusFilter} | Payment: ${paymentFilter} | Found: ${bookings.length} reservations`,
    });
  };

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sandstone/20 pb-4">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-sandstone font-bold block">
                RESERVATION MANAGEMENT
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif text-charcoal">
                Guest Bookings Ledger
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Primary Download Monthly Record Button */}
              <button
                onClick={() => setMonthlyDownloadOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#C9A86A] via-[#D4AF37] to-[#C9A86A] text-[#100F0E] text-xs font-serif rounded shadow-md hover:shadow-lg transition-all cursor-pointer font-bold"
                title="Download Monthly Booking Record (CSV & PDF Statement)"
              >
                <Download className="w-3.5 h-3.5 text-[#100F0E]" />
                <span>Download Monthly Record</span>
              </button>

              <button
                onClick={loadData}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-sandstone/30 text-sandstone text-xs font-serif rounded hover:bg-cream-muted transition-colors cursor-pointer"
                title="Refresh Ledger"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Filters & Search Control Bar */}
          <div className="bg-white p-5 rounded-lg border border-sandstone/20 shadow-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Search Bar */}
              <div className="md:col-span-4 relative">
                <Search className="w-4 h-4 text-charcoal/50 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search by Guest Name, Phone, or Booking Ref (RMP-XXXXXX)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-cream-muted border border-sandstone/30 rounded text-xs focus:outline-none focus:border-sandstone"
                />
              </div>

              {/* Status Filter */}
              <div className="md:col-span-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full py-2 px-3 bg-cream-muted border border-sandstone/30 rounded text-xs font-serif text-charcoal focus:outline-none focus:border-sandstone cursor-pointer"
                >
                  <option value="all">All Booking Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Payment Filter */}
              <div className="md:col-span-2">
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="w-full py-2 px-3 bg-cream-muted border border-sandstone/30 rounded text-xs font-serif text-charcoal focus:outline-none focus:border-sandstone cursor-pointer"
                >
                  <option value="all">All Payment Statuses</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending Payment</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              {/* Room Filter */}
              <div className="md:col-span-4">
                <select
                  value={roomFilter}
                  onChange={(e) => setRoomFilter(e.target.value)}
                  className="w-full py-2 px-3 bg-cream-muted border border-sandstone/30 rounded text-xs font-serif text-charcoal focus:outline-none focus:border-sandstone cursor-pointer"
                >
                  <option value="all">All Palace Rooms & Suites</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.room_name || r.name} ({r.room_number || "Suite"})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date Range Controls & Filter Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-sandstone/10 text-xs font-serif text-charcoal/70">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sandstone font-bold uppercase tracking-wider text-[10px]">
                  Date Range Filter:
                </span>
                <div className="flex items-center gap-2">
                  <span>From:</span>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="bg-cream-muted border border-sandstone/30 px-2 py-1 rounded font-mono text-xs"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span>To:</span>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="bg-cream-muted border border-sandstone/30 px-2 py-1 rounded font-mono text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Export Current View Button */}
                {bookings.length > 0 && (
                  <button
                    onClick={handleQuickExportFiltered}
                    className="flex items-center gap-1 text-xs text-sandstone hover:text-sandstone-dark font-serif underline cursor-pointer"
                    title="Quick download currently displayed table records as CSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export View CSV ({bookings.length})</span>
                  </button>
                )}

                {(dateFrom || dateTo || searchQuery || statusFilter !== "all" || paymentFilter !== "all" || roomFilter !== "all") && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("all");
                      setPaymentFilter("all");
                      setRoomFilter("all");
                      setDateFrom("");
                      setDateTo("");
                    }}
                    className="text-xs text-sandstone underline"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Bookings Ledger Table */}
          <div className="bg-white rounded-lg border border-sandstone/20 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans border-collapse">
                <thead>
                  <tr className="bg-charcoal text-cream font-serif text-[11px] uppercase tracking-wider">
                    <th className="p-3.5">Booking ID</th>
                    <th className="p-3.5">Guest</th>
                    <th className="p-3.5">Phone</th>
                    <th className="p-3.5">Room / Suite</th>
                    <th className="p-3.5">Check-In</th>
                    <th className="p-3.5">Check-Out</th>
                    <th className="p-3.5 text-center">Stay</th>
                    <th className="p-3.5 text-right">Amount</th>
                    <th className="p-3.5 text-center">Payment</th>
                    <th className="p-3.5 text-center">Booking Status</th>
                    <th className="p-3.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sandstone/10">
                  {bookings.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="p-8 text-center text-xs text-charcoal/60 font-serif italic">
                        No reservation records match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-cream-muted/60 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-sandstone">{b.booking_reference}</td>
                        <td className="p-3.5 font-medium text-charcoal">
                          <div>{b.customer_name}</div>
                          <div className="text-[10px] text-charcoal/60 font-mono">{b.customer_email}</div>
                        </td>
                        <td className="p-3.5 text-charcoal/80 font-mono">{b.customer_phone}</td>
                        <td className="p-3.5 font-serif">{b.room?.room_name || b.room_name || "Palace Suite"}</td>
                        <td className="p-3.5 font-mono">{b.check_in}</td>
                        <td className="p-3.5 font-mono">{b.check_out}</td>
                        <td className="p-3.5 text-center font-mono">{b.nights || 1}N / {b.guests || 1}G</td>
                        <td className="p-3.5 font-mono font-bold text-charcoal text-right">
                          ₹{Number(b.total_amount || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="p-3.5 text-center">
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
                        <td className="p-3.5 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              b.booking_status === "confirmed"
                                ? "bg-emerald-100 text-emerald-800"
                                : b.booking_status === "cancelled"
                                ? "bg-gray-100 text-gray-800"
                                : b.booking_status === "completed"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {b.booking_status}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => setSelectedBooking(b)}
                            className="p-1.5 rounded bg-sandstone/10 hover:bg-sandstone hover:text-white text-sandstone border border-sandstone/30 transition-all cursor-pointer"
                            title="View Full Booking Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detailed Booking Modal */}
          {selectedBooking && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-cream text-charcoal w-full max-w-2xl rounded-lg shadow-2xl border-2 border-gold/40 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
                {/* Modal Header */}
                <div className="bg-charcoal text-cream p-5 flex items-center justify-between border-b border-gold/30">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-gold" />
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-widest text-gold block">
                        BOOKING VOUCHER DETAILS
                      </span>
                      <h3 className="text-xl font-serif text-white">
                        {selectedBooking.booking_reference}
                      </h3>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedBooking(null)}
                    className="p-1.5 rounded hover:bg-white/10 text-cream/70 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-6">
                  {/* Guest & Room Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded border border-sandstone/20 space-y-2">
                      <span className="text-xs font-serif uppercase tracking-wider text-sandstone font-bold block border-b border-sandstone/10 pb-1">
                        Guest Information
                      </span>
                      <div className="text-xs space-y-1">
                        <p className="font-semibold text-charcoal text-sm">{selectedBooking.customer_name}</p>
                        <p className="text-charcoal/70 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-sandstone" />
                          <span>{selectedBooking.customer_email}</span>
                        </p>
                        <p className="text-charcoal/70 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-sandstone" />
                          <span>{selectedBooking.customer_phone}</span>
                        </p>
                        <p className="text-charcoal/70">Occupancy: {selectedBooking.guests} Guests</p>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded border border-sandstone/20 space-y-2">
                      <span className="text-xs font-serif uppercase tracking-wider text-sandstone font-bold block border-b border-sandstone/10 pb-1">
                        Room & Dates
                      </span>
                      <div className="text-xs space-y-1">
                        <p className="font-semibold text-charcoal text-sm">
                          {selectedBooking.room?.room_name || selectedBooking.room_name || "Palace Suite"}
                        </p>
                        <p className="text-charcoal/70">Check-In: <span className="font-mono text-charcoal font-bold">{selectedBooking.check_in} (12:00 PM)</span></p>
                        <p className="text-charcoal/70">Check-Out: <span className="font-mono text-charcoal font-bold">{selectedBooking.check_out} (10:00 AM)</span></p>
                        <p className="text-charcoal/70">Duration: <span className="text-sandstone font-semibold">{selectedBooking.nights} Night(s) ({(selectedBooking.nights || 1) * 22}h — 22h Stay Policy)</span></p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Details Card */}
                  <div className="bg-charcoal text-cream p-5 rounded-lg border border-gold/30 space-y-3">
                    <div className="flex justify-between items-center border-b border-white/10 pb-2 text-xs">
                      <span className="text-gold font-serif uppercase tracking-wider font-bold">
                        Billing & Payment Verification
                      </span>
                      <span className="font-mono text-sm text-white font-bold">
                        Total: ₹{Number(selectedBooking.total_amount || 0).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-cream/60 block text-[11px]">Payment Status</span>
                        <span className="font-semibold uppercase text-emerald-400 font-serif">
                          {selectedBooking.payment_status}
                        </span>
                      </div>
                      <div>
                        <span className="text-cream/60 block text-[11px]">Booking Status</span>
                        <span className="font-semibold uppercase text-gold font-serif">
                          {selectedBooking.booking_status}
                        </span>
                      </div>
                      {selectedBooking.razorpay_order_id && (
                        <div>
                          <span className="text-cream/60 block text-[11px]">Razorpay Order ID</span>
                          <span className="font-mono text-[11px] text-cream/90">{selectedBooking.razorpay_order_id}</span>
                        </div>
                      )}
                      {selectedBooking.razorpay_payment_id && (
                        <div>
                          <span className="text-cream/60 block text-[11px]">Razorpay Payment ID</span>
                          <span className="font-mono text-[11px] text-cream/90">{selectedBooking.razorpay_payment_id}</span>
                        </div>
                      )}
                    </div>

                    {selectedBooking.special_requests && (
                      <div className="pt-2 border-t border-white/10 text-xs">
                        <span className="text-gold block font-serif">Special Requests:</span>
                        <p className="italic text-cream/80">{selectedBooking.special_requests}</p>
                      </div>
                    )}
                  </div>

                  {/* Admin Actions */}
                  <div className="pt-2 space-y-2">
                    <span className="text-xs font-serif uppercase tracking-wider text-sandstone font-bold block">
                      Admin Quick Actions
                    </span>

                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => handleUpdateStatus(selectedBooking.id, "confirmed", "paid")}
                        disabled={actionLoading}
                        className="px-4 py-2 rounded bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-serif uppercase tracking-wider flex items-center gap-1.5 shadow cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Confirm & Mark Paid</span>
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(selectedBooking.id, "completed", selectedBooking.payment_status)}
                        disabled={actionLoading}
                        className="px-4 py-2 rounded bg-blue-700 hover:bg-blue-800 text-white text-xs font-serif uppercase tracking-wider flex items-center gap-1.5 shadow cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Mark Stay Completed</span>
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(selectedBooking.id, "cancelled", "refunded")}
                        disabled={actionLoading}
                        className="px-4 py-2 rounded bg-red-800 hover:bg-red-900 text-white text-xs font-serif uppercase tracking-wider flex items-center gap-1.5 shadow cursor-pointer disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Cancel Booking</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Monthly Record Download & Export Modal */}
          <MonthlyDownloadModal
            isOpen={monthlyDownloadOpen}
            onClose={() => setMonthlyDownloadOpen(false)}
            allBookings={allBookings.length > 0 ? allBookings : bookings}
            rooms={rooms}
          />
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
