"use client";

import { useState, useMemo } from "react";
import {
  X,
  Download,
  Printer,
  Calendar,
  Filter,
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Users,
  BedDouble,
  ChevronDown,
} from "lucide-react";
import { exportBookingsToCSV, printMonthlyReport, formatINR } from "@/lib/exportUtils";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function MonthlyDownloadModal({
  isOpen,
  onClose,
  allBookings = [],
  rooms = [],
}) {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth()); // 0 - 11
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [isAllMonths, setIsAllMonths] = useState(false);
  const [dateField, setDateField] = useState("check_in"); // "check_in" | "created_at"
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [roomFilter, setRoomFilter] = useState("all");
  const [showPreview, setShowPreview] = useState(true);

  // Filter bookings matching the selected month/year/filters
  const filteredBookings = useMemo(() => {
    return allBookings.filter((b) => {
      // 1. Month & Year filter
      if (!isAllMonths) {
        let dateToTest = b.check_in;
        if (dateField === "created_at" && b.created_at) {
          dateToTest = new Date(b.created_at).toISOString().split("T")[0];
        }

        if (!dateToTest) return false;
        const [yearStr, monthStr] = dateToTest.split("-");
        const bYear = parseInt(yearStr, 10);
        const bMonth = parseInt(monthStr, 10) - 1; // 0-indexed

        if (bYear !== Number(selectedYear) || bMonth !== Number(selectedMonth)) {
          return false;
        }
      }

      // 2. Status filter
      if (statusFilter === "confirmed_completed") {
        if (b.booking_status !== "confirmed" && b.booking_status !== "completed") return false;
      } else if (statusFilter !== "all" && b.booking_status !== statusFilter) {
        return false;
      }

      // 3. Payment filter
      if (paymentFilter !== "all" && b.payment_status !== paymentFilter) {
        return false;
      }

      // 4. Room filter
      if (roomFilter !== "all") {
        if (b.room_id !== roomFilter && b.room?.id !== roomFilter) {
          return false;
        }
      }

      return true;
    });
  }, [allBookings, selectedMonth, selectedYear, isAllMonths, dateField, statusFilter, paymentFilter, roomFilter]);

  // Calculate live statistics
  const stats = useMemo(() => {
    const totalCount = filteredBookings.length;
    const paidBookings = filteredBookings.filter((b) => b.payment_status === "paid");
    const verifiedRevenue = paidBookings.reduce((sum, b) => sum + Number(b.total_amount || 0), 0);
    const grossPotentialRevenue = filteredBookings
      .filter((b) => b.booking_status !== "cancelled")
      .reduce((sum, b) => sum + Number(b.total_amount || 0), 0);
    const totalNights = filteredBookings.reduce((sum, b) => sum + Number(b.nights || 1), 0);
    const confirmedCount = filteredBookings.filter((b) => b.booking_status === "confirmed").length;
    const pendingPaymentCount = filteredBookings.filter((b) => b.payment_status === "pending").length;
    const avgBookingValue = totalCount > 0 ? Math.round(grossPotentialRevenue / totalCount) : 0;

    return {
      totalCount,
      verifiedRevenue,
      grossPotentialRevenue,
      totalNights,
      confirmedCount,
      pendingPaymentCount,
      avgBookingValue,
    };
  }, [filteredBookings]);

  if (!isOpen) return null;

  const currentMonthLabel = isAllMonths ? "All Months" : MONTH_NAMES[selectedMonth];

  const handleDownloadCSV = () => {
    const filterDesc = [
      isAllMonths ? "All Months" : `${MONTH_NAMES[selectedMonth]} ${selectedYear}`,
      `Date Field: ${dateField === "check_in" ? "Check-In" : "Created At"}`,
      statusFilter !== "all" ? `Status: ${statusFilter}` : null,
      paymentFilter !== "all" ? `Payment: ${paymentFilter}` : null,
    ]
      .filter(Boolean)
      .join(" | ");

    exportBookingsToCSV(filteredBookings, {
      title: "Monthly Reservation & Revenue Ledger",
      monthLabel: currentMonthLabel,
      year: selectedYear,
      filterSummary: filterDesc,
    });
  };

  const handlePrintStatement = () => {
    const filterDesc = [
      isAllMonths ? "All Months" : `${MONTH_NAMES[selectedMonth]} ${selectedYear}`,
      statusFilter !== "all" ? `Status: ${statusFilter}` : null,
      paymentFilter !== "all" ? `Payment: ${paymentFilter}` : null,
    ]
      .filter(Boolean)
      .join(" | ");

    printMonthlyReport(filteredBookings, {
      title: "Monthly Booking & Financial Statement",
      monthLabel: currentMonthLabel,
      year: selectedYear,
      filterSummary: filterDesc,
    });
  };

  // Quick preset shortcuts
  const selectPreset = (type) => {
    setIsAllMonths(false);
    const now = new Date();
    if (type === "this_month") {
      setSelectedMonth(now.getMonth());
      setSelectedYear(now.getFullYear());
    } else if (type === "last_month") {
      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      setSelectedMonth(lastMonthDate.getMonth());
      setSelectedYear(lastMonthDate.getFullYear());
    } else if (type === "all_months") {
      setIsAllMonths(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-cream text-charcoal w-full max-w-4xl rounded-xl shadow-2xl border-2 border-gold/40 overflow-hidden relative my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-charcoal text-cream p-5 sm:p-6 flex items-center justify-between border-b border-gold/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sandstone/30 border border-gold/50 flex items-center justify-center text-gold shadow-md">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-gold block">
                ADMIN EXPORT & REPORTING
              </span>
              <h3 className="text-xl sm:text-2xl font-serif text-white tracking-wide">
                Download Monthly Booking Record
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-cream/70 hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[calc(85vh-140px)] overflow-y-auto">
          {/* Controls Bar: Month, Year, Presets & Filtering */}
          <div className="bg-white p-5 rounded-lg border border-sandstone/25 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sandstone/15 pb-3">
              <span className="text-xs font-serif uppercase tracking-wider font-bold text-sandstone flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-gold" />
                <span>Select Target Monthly Period</span>
              </span>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-serif">
                <button
                  type="button"
                  onClick={() => selectPreset("this_month")}
                  className={`px-2.5 py-1 rounded border text-xs transition-colors cursor-pointer ${
                    !isAllMonths &&
                    selectedMonth === currentDate.getMonth() &&
                    selectedYear === currentDate.getFullYear()
                      ? "bg-sandstone text-white border-sandstone font-bold shadow-sm"
                      : "bg-cream-muted text-charcoal border-sandstone/30 hover:bg-sandstone/10"
                  }`}
                >
                  This Month ({MONTH_NAMES[currentDate.getMonth()].slice(0, 3)})
                </button>
                <button
                  type="button"
                  onClick={() => selectPreset("last_month")}
                  className={`px-2.5 py-1 rounded border text-xs transition-colors cursor-pointer ${
                    !isAllMonths &&
                    selectedMonth === (currentDate.getMonth() - 1 + 12) % 12
                      ? "bg-sandstone text-white border-sandstone font-bold shadow-sm"
                      : "bg-cream-muted text-charcoal border-sandstone/30 hover:bg-sandstone/10"
                  }`}
                >
                  Previous Month
                </button>
                <button
                  type="button"
                  onClick={() => selectPreset("all_months")}
                  className={`px-2.5 py-1 rounded border text-xs transition-colors cursor-pointer ${
                    isAllMonths
                      ? "bg-sandstone text-white border-sandstone font-bold shadow-sm"
                      : "bg-cream-muted text-charcoal border-sandstone/30 hover:bg-sandstone/10"
                  }`}
                >
                  All Recorded Months
                </button>
              </div>
            </div>

            {/* Selectors Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              {/* Month Selector */}
              <div>
                <label className="text-charcoal/70 block mb-1 font-serif">Month</label>
                <select
                  disabled={isAllMonths}
                  value={selectedMonth}
                  onChange={(e) => {
                    setIsAllMonths(false);
                    setSelectedMonth(Number(e.target.value));
                  }}
                  className="w-full py-2 px-3 bg-cream-muted border border-sandstone/30 rounded font-serif text-charcoal focus:outline-none focus:border-sandstone cursor-pointer disabled:opacity-50"
                >
                  {MONTH_NAMES.map((month, idx) => (
                    <option key={month} value={idx}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year Selector */}
              <div>
                <label className="text-charcoal/70 block mb-1 font-serif">Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full py-2 px-3 bg-cream-muted border border-sandstone/30 rounded font-serif text-charcoal focus:outline-none focus:border-sandstone cursor-pointer"
                >
                  {[2024, 2025, 2026, 2027, 2028].map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Filter Criterion */}
              <div>
                <label className="text-charcoal/70 block mb-1 font-serif">Date Criteria</label>
                <select
                  value={dateField}
                  onChange={(e) => setDateField(e.target.value)}
                  className="w-full py-2 px-3 bg-cream-muted border border-sandstone/30 rounded font-serif text-charcoal focus:outline-none focus:border-sandstone cursor-pointer"
                >
                  <option value="check_in">Check-In Stay Month</option>
                  <option value="created_at">Booking Creation Month</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-charcoal/70 block mb-1 font-serif">Booking Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full py-2 px-3 bg-cream-muted border border-sandstone/30 rounded font-serif text-charcoal focus:outline-none focus:border-sandstone cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="confirmed">Confirmed Only</option>
                  <option value="confirmed_completed">Confirmed & Completed</option>
                  <option value="pending">Pending Only</option>
                  <option value="cancelled">Cancelled Only</option>
                </select>
              </div>
            </div>

            {/* Secondary Row: Payment Status & Room Filter */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-sandstone/10 text-xs">
              <div>
                <label className="text-charcoal/70 block mb-1 font-serif">Payment Status</label>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="w-full py-2 px-3 bg-cream-muted border border-sandstone/30 rounded font-serif text-charcoal focus:outline-none focus:border-sandstone cursor-pointer"
                >
                  <option value="all">All Payment Statuses</option>
                  <option value="paid">Paid Transactions Only</option>
                  <option value="pending">Pending Payments Only</option>
                  <option value="failed">Failed Transactions Only</option>
                </select>
              </div>

              <div>
                <label className="text-charcoal/70 block mb-1 font-serif">Filter by Suite Category</label>
                <select
                  value={roomFilter}
                  onChange={(e) => setRoomFilter(e.target.value)}
                  className="w-full py-2 px-3 bg-cream-muted border border-sandstone/30 rounded font-serif text-charcoal focus:outline-none focus:border-sandstone cursor-pointer"
                >
                  <option value="all">All Palace Rooms & Suites</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.room_name || r.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Monthly KPI Analytics Summary Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-lg border border-sandstone/20 shadow-xs">
              <span className="text-[10px] uppercase font-serif tracking-wider text-sandstone font-bold block">
                Total Bookings
              </span>
              <div className="text-2xl font-serif font-bold text-charcoal mt-1">{stats.totalCount}</div>
              <span className="text-[11px] text-charcoal/60">
                {stats.confirmedCount} confirmed stays
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-sandstone/20 shadow-xs">
              <span className="text-[10px] uppercase font-serif tracking-wider text-sandstone font-bold block">
                Total Room Nights
              </span>
              <div className="text-2xl font-serif font-bold text-charcoal mt-1">
                {stats.totalNights} <span className="text-xs font-normal">Nights</span>
              </div>
              <span className="text-[11px] text-charcoal/60">Guest occupancy</span>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-sandstone/20 shadow-xs">
              <span className="text-[10px] uppercase font-serif tracking-wider text-emerald-700 font-bold block">
                Verified Paid Revenue
              </span>
              <div className="text-2xl font-serif font-bold text-emerald-800 font-mono mt-1">
                ₹{stats.verifiedRevenue.toLocaleString("en-IN")}
              </div>
              <span className="text-[11px] text-charcoal/60">
                Avg: ₹{stats.avgBookingValue.toLocaleString("en-IN")} / res
              </span>
            </div>

            <div className="bg-charcoal text-cream p-3.5 rounded-lg border border-gold/30 shadow-xs">
              <span className="text-[10px] uppercase font-serif tracking-wider text-gold font-bold block">
                Gross Expected
              </span>
              <div className="text-2xl font-serif font-bold text-white font-mono mt-1">
                ₹{stats.grossPotentialRevenue.toLocaleString("en-IN")}
              </div>
              <span className="text-[11px] text-cream/70">
                {stats.pendingPaymentCount} pending verification
              </span>
            </div>
          </div>

          {/* Records Preview Table */}
          <div className="bg-white rounded-lg border border-sandstone/20 shadow-sm overflow-hidden space-y-2 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-sandstone" />
                <h4 className="text-xs font-serif uppercase tracking-wider font-bold text-charcoal">
                  Itemized Monthly Ledger Preview ({filteredBookings.length} records)
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="text-xs text-sandstone hover:underline font-serif"
              >
                {showPreview ? "Hide Preview" : "Show Preview"}
              </button>
            </div>

            {showPreview && (
              <div className="max-h-56 overflow-y-auto border border-sandstone/15 rounded">
                <table className="w-full text-left text-xs font-sans border-collapse">
                  <thead className="sticky top-0 bg-charcoal text-cream font-serif text-[10px] uppercase tracking-wider">
                    <tr>
                      <th className="p-2.5">Ref</th>
                      <th className="p-2.5">Guest</th>
                      <th className="p-2.5">Suite</th>
                      <th className="p-2.5">Check-In</th>
                      <th className="p-2.5">Check-Out</th>
                      <th className="p-2.5 text-right">Amount</th>
                      <th className="p-2.5 text-center">Payment</th>
                      <th className="p-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sandstone/10">
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-6 text-center text-xs text-charcoal/60 font-serif italic">
                          No reservation records found for {currentMonthLabel} {selectedYear}.
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-cream-muted/50 transition-colors">
                          <td className="p-2.5 font-mono font-bold text-sandstone text-[11px]">
                            {b.booking_reference}
                          </td>
                          <td className="p-2.5">
                            <div className="font-medium text-charcoal">{b.customer_name}</div>
                            <div className="text-[10px] text-charcoal/60 font-mono">{b.customer_phone}</div>
                          </td>
                          <td className="p-2.5 font-serif text-charcoal">
                            {b.room?.room_name || b.room_name || "Palace Suite"}
                          </td>
                          <td className="p-2.5 font-mono text-[11px]">{b.check_in}</td>
                          <td className="p-2.5 font-mono text-[11px]">{b.check_out}</td>
                          <td className="p-2.5 font-mono font-bold text-right text-charcoal">
                            ₹{Number(b.total_amount || 0).toLocaleString("en-IN")}
                          </td>
                          <td className="p-2.5 text-center">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase ${
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
                          <td className="p-2.5 text-center">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase ${
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
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="bg-cream-muted px-6 py-4 border-t border-sandstone/20 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-charcoal/70 font-serif">
            Ready to export <span className="font-bold text-charcoal">{filteredBookings.length}</span> records for{" "}
            <span className="font-bold text-sandstone">
              {currentMonthLabel} {selectedYear}
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handlePrintStatement}
              disabled={filteredBookings.length === 0}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded bg-white border border-sandstone/30 text-charcoal hover:bg-charcoal hover:text-cream text-xs font-serif uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
            >
              <Printer className="w-4 h-4 text-gold" />
              <span>Print / PDF</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadCSV}
              disabled={filteredBookings.length === 0}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded bg-gradient-to-r from-[#C9A86A] via-[#D4AF37] to-[#C9A86A] text-[#100F0E] text-xs font-serif uppercase tracking-wider shadow-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed font-bold hover:shadow-lg hover:scale-105"
            >
              <Download className="w-4 h-4 text-[#100F0E]" />
              <span>Download Monthly CSV</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
