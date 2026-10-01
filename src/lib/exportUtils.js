import { HOTEL_INFO } from "@/data/hotel";

/**
 * Helper to escape CSV values according to RFC 4180
 */
function escapeCSV(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  // If value contains comma, quote, or newline, escape quotes and wrap in quotes
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Format currency in Indian Rupees
 */
export function formatINR(amount) {
  const num = Number(amount || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Export filtered bookings into an Excel-compatible CSV file with metadata header and totals
 */
export function exportBookingsToCSV(bookings = [], options = {}) {
  const {
    title = "Monthly Bookings Ledger",
    monthLabel = "All Months",
    year = new Date().getFullYear(),
    filterSummary = "All Statuses",
  } = options;

  const exportDate = new Date().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  // Calculate totals
  const totalBookings = bookings.length;
  const totalRevenue = bookings
    .filter((b) => b.payment_status === "paid")
    .reduce((sum, b) => sum + Number(b.total_amount || 0), 0);
  const totalPotentialRevenue = bookings
    .filter((b) => b.booking_status !== "cancelled")
    .reduce((sum, b) => sum + Number(b.total_amount || 0), 0);
  const totalNights = bookings.reduce((sum, b) => sum + Number(b.nights || 1), 0);
  const paidCount = bookings.filter((b) => b.payment_status === "paid").length;
  const confirmedCount = bookings.filter((b) => b.booking_status === "confirmed").length;

  const rows = [];

  // 1. Report Metadata Header
  rows.push([escapeCSV(HOTEL_INFO.name), escapeCSV("RESERVATION & REVENUE REPORT")].join(","));
  rows.push([escapeCSV("Report Title:"), escapeCSV(title)].join(","));
  rows.push([escapeCSV("Billing Period:"), escapeCSV(`${monthLabel} ${year}`)].join(","));
  rows.push([escapeCSV("Stay Policy:"), escapeCSV("22 Hours per night (Check-in 12:00 PM Noon to Check-out 10:00 AM Morning)")].join(","));
  rows.push([escapeCSV("Filter Criteria:"), escapeCSV(filterSummary)].join(","));
  rows.push([escapeCSV("Generated On:"), escapeCSV(exportDate)].join(","));
  rows.push([escapeCSV("Hotel Contact:"), escapeCSV(`${HOTEL_INFO.phone} | ${HOTEL_INFO.email}`)].join(","));
  rows.push(""); // blank line

  // 2. Financial & Reservation KPI Summary Block
  rows.push([escapeCSV("--- SUMMARY EXECUTIVE METRICS ---")].join(","));
  rows.push([escapeCSV("Total Reservations:"), escapeCSV(totalBookings)].join(","));
  rows.push([escapeCSV("Confirmed Bookings:"), escapeCSV(confirmedCount)].join(","));
  rows.push([escapeCSV("Paid Transactions:"), escapeCSV(paidCount)].join(","));
  rows.push([escapeCSV("Total Room Nights:"), escapeCSV(totalNights)].join(","));
  rows.push([escapeCSV("Verified Paid Revenue (INR):"), escapeCSV(`INR ${totalRevenue.toLocaleString("en-IN")}`)].join(","));
  rows.push([escapeCSV("Gross Potential Revenue (INR):"), escapeCSV(`INR ${totalPotentialRevenue.toLocaleString("en-IN")}`)].join(","));
  rows.push(""); // blank line

  // 3. Table Column Headers
  const headers = [
    "Booking Reference",
    "Booking Date",
    "Guest Full Name",
    "Guest Email",
    "Guest Phone",
    "Room / Suite Name",
    "Check-In Date",
    "Check-Out Date",
    "Nights",
    "Guests",
    "Rooms Count",
    "Room Subtotal (INR)",
    "Taxes & Fees (INR)",
    "Total Amount (INR)",
    "Payment Status",
    "Booking Status",
    "Razorpay Order ID",
    "Razorpay Payment ID",
    "Special Requests",
  ];
  rows.push(headers.map(escapeCSV).join(","));

  // 4. Data Rows
  if (bookings.length === 0) {
    rows.push([escapeCSV("No reservation records found for the selected period")].join(","));
  } else {
    bookings.forEach((b) => {
      const row = [
        b.booking_reference || "",
        b.created_at ? new Date(b.created_at).toISOString().split("T")[0] : "",
        b.customer_name || "",
        b.customer_email || "",
        b.customer_phone || "",
        b.room?.room_name || b.room_name || b.room_id || "Palace Suite",
        b.check_in || "",
        b.check_out || "",
        b.nights || 1,
        b.guests || 1,
        b.rooms_count || 1,
        b.room_subtotal || 0,
        b.taxes_and_fees || 0,
        b.total_amount || 0,
        (b.payment_status || "pending").toUpperCase(),
        (b.booking_status || "pending").toUpperCase(),
        b.razorpay_order_id || "N/A",
        b.razorpay_payment_id || "N/A",
        (b.special_requests || "").replace(/(\r\n|\n|\r)/gm, " "),
      ];
      rows.push(row.map(escapeCSV).join(","));
    });
  }

  // 5. Summary Footer Row
  rows.push(""); // blank line
  const footerTotalRow = [
    "TOTAL",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    totalNights,
    "",
    "",
    "",
    "",
    totalRevenue,
    `PAID (${paidCount}/${totalBookings})`,
    `CONFIRMED (${confirmedCount}/${totalBookings})`,
    "",
    "",
    "",
  ];
  rows.push(footerTotalRow.map(escapeCSV).join(","));

  // Join rows with CRLF for maximum Excel compatibility
  const csvContent = "\uFEFF" + rows.join("\r\n");

  // Create downloadable blob
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  // Clean filename: Rajmahal_Palace_Bookings_August_2026.csv
  const sanitizedMonth = monthLabel.replace(/[^a-zA-Z0-9_-]/g, "_");
  link.setAttribute("href", url);
  link.setAttribute("download", `Rajmahal_Palace_Bookings_${sanitizedMonth}_${year}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate a printable royal statement in a new window
 */
export function printMonthlyReport(bookings = [], options = {}) {
  const {
    title = "Monthly Bookings & Revenue Statement",
    monthLabel = "All Months",
    year = new Date().getFullYear(),
    filterSummary = "All Statuses",
  } = options;

  const exportDate = new Date().toLocaleString("en-IN", {
    dateStyle: "full",
    timeStyle: "short",
  });

  const totalBookings = bookings.length;
  const paidBookings = bookings.filter((b) => b.payment_status === "paid");
  const totalRevenue = paidBookings.reduce((sum, b) => sum + Number(b.total_amount || 0), 0);
  const totalNights = bookings.reduce((sum, b) => sum + Number(b.nights || 1), 0);
  const confirmedCount = bookings.filter((b) => b.booking_status === "confirmed").length;

  const printWindow = window.open("", "_blank", "width=1000,height=800");
  if (!printWindow) {
    alert("Please allow popups to open the printable booking statement.");
    return;
  }

  const tableRowsHtml = bookings
    .map(
      (b, idx) => `
      <tr style="border-bottom: 1px solid #e8e2d8; font-size: 11px;">
        <td style="padding: 8px 6px; text-align: center; color: #6b6357;">${idx + 1}</td>
        <td style="padding: 8px 6px; font-family: monospace; font-weight: bold; color: #8b2635;">${b.booking_reference}</td>
        <td style="padding: 8px 6px;">
          <div style="font-weight: 600; color: #1e1b18;">${b.customer_name}</div>
          <div style="font-size: 10px; color: #6b6357;">${b.customer_phone}</div>
        </td>
        <td style="padding: 8px 6px; color: #1e1b18;">${b.room?.room_name || b.room_name || "Palace Suite"}</td>
        <td style="padding: 8px 6px; font-family: monospace; text-align: center;">${b.check_in}</td>
        <td style="padding: 8px 6px; font-family: monospace; text-align: center;">${b.check_out}</td>
        <td style="padding: 8px 6px; text-align: center;">${b.nights}N / ${b.guests}G</td>
        <td style="padding: 8px 6px; font-weight: bold; font-family: monospace; text-align: right;">₹${Number(b.total_amount || 0).toLocaleString("en-IN")}</td>
        <td style="padding: 8px 6px; text-align: center;">
          <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: bold; text-transform: uppercase; background: ${
            b.payment_status === "paid" ? "#d1fae5; color: #065f46" : "#fef3c7; color: #92400e"
          };">
            ${b.payment_status}
          </span>
        </td>
        <td style="padding: 8px 6px; text-align: center;">
          <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: bold; text-transform: uppercase; background: ${
            b.booking_status === "confirmed"
              ? "#d1fae5; color: #065f46"
              : b.booking_status === "cancelled"
              ? "#fee2e2; color: #991b1b"
              : "#fef3c7; color: #92400e"
          };">
            ${b.booking_status}
          </span>
        </td>
      </tr>
    `
    )
    .join("");

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Hotel Rajmahal Palace - ${monthLabel} ${year} Bookings Ledger</title>
        <meta charset="utf-8" />
        <style>
          @page {
            size: A4 landscape;
            margin: 12mm;
          }
          body {
            font-family: 'Cinzel', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #1e1b18;
            background: #ffffff;
            margin: 0;
            padding: 20px;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .header-box {
            border-bottom: 2px solid #c5a880;
            padding-bottom: 14px;
            margin-bottom: 16px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          .hotel-title {
            font-size: 24px;
            font-weight: 700;
            color: #1e1b18;
            letter-spacing: 0.05em;
            margin: 0 0 4px 0;
          }
          .hotel-sub {
            font-size: 11px;
            color: #6b6357;
            margin: 0;
            line-height: 1.4;
          }
          .report-tag {
            text-align: right;
          }
          .kpi-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-bottom: 20px;
          }
          .kpi-card {
            background: #faf8f5;
            border: 1px solid #e8e2d8;
            padding: 10px 14px;
            border-radius: 6px;
          }
          .kpi-label {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #8b2635;
            font-weight: bold;
            margin-bottom: 4px;
          }
          .kpi-val {
            font-size: 18px;
            font-weight: bold;
            color: #1e1b18;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          th {
            background: #1e1b18;
            color: #f7f4ef;
            padding: 9px 6px;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            text-align: left;
          }
          .footer-sign {
            margin-top: 35px;
            display: flex;
            justify-content: space-between;
            padding-top: 20px;
            border-top: 1px solid #e8e2d8;
            font-size: 11px;
            color: #6b6357;
          }
          .signature-line {
            width: 200px;
            border-top: 1px dashed #1e1b18;
            margin-top: 30px;
            text-align: center;
            padding-top: 4px;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          @media print {
            .no-print { display: none !important; }
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="background: #1e1b18; color: #fff; padding: 10px 16px; border-radius: 6px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 12px;">Official Monthly Reservation Statement generated ready for print or saving as PDF.</span>
          <button onclick="window.print()" style="background: #c5a880; color: #1e1b18; border: none; padding: 6px 14px; font-weight: bold; border-radius: 4px; cursor: pointer; font-size: 12px;">
            🖨️ Print / Save PDF
          </button>
        </div>

        <div class="header-box">
          <div>
            <div style="font-size: 10px; letter-spacing: 0.2em; color: #8b2635; font-weight: bold; text-transform: uppercase;">
              ROYAL HERITAGE RESORT & HOSPITALITY
            </div>
            <h1 class="hotel-title">${HOTEL_INFO.name}</h1>
            <p class="hotel-sub">
              ${HOTEL_INFO.address}<br />
              Reservations: ${HOTEL_INFO.phone} | ${HOTEL_INFO.email}
            </p>
          </div>
          <div class="report-tag">
            <div style="font-size: 14px; font-weight: bold; color: #8b2635; text-transform: uppercase; letter-spacing: 0.05em;">
              ${title}
            </div>
            <div style="font-size: 16px; font-weight: bold; color: #1e1b18; margin-top: 2px;">
              Period: ${monthLabel} ${year}
            </div>
            <div style="font-size: 10px; color: #6b6357; margin-top: 4px;">
              Generated: ${exportDate}
            </div>
          </div>
        </div>

        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-label">Total Bookings</div>
            <div class="kpi-val">${totalBookings}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Confirmed Stays</div>
            <div class="kpi-val" style="color: #065f46;">${confirmedCount}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Total Room Nights</div>
            <div class="kpi-val">${totalNights} Nights</div>
          </div>
          <div class="kpi-card" style="background: #1e1b18; border-color: #c5a880;">
            <div class="kpi-label" style="color: #c5a880;">Verified Revenue</div>
            <div class="kpi-val" style="color: #ffffff; font-family: monospace;">₹${totalRevenue.toLocaleString("en-IN")}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 30px; text-align: center;">#</th>
              <th>Reference</th>
              <th>Guest Details</th>
              <th>Room Category</th>
              <th style="text-align: center;">Check-In</th>
              <th style="text-align: center;">Check-Out</th>
              <th style="text-align: center;">Stay</th>
              <th style="text-align: right;">Amount</th>
              <th style="text-align: center;">Payment</th>
              <th style="text-align: center;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${
              bookings.length === 0
                ? `<tr><td colspan="10" style="padding: 24px; text-align: center; color: #6b6357; font-style: italic;">No booking records found matching the criteria for ${monthLabel} ${year}.</td></tr>`
                : tableRowsHtml
            }
          </tbody>
        </table>

        <div class="footer-sign">
          <div>
            <strong>Confidential Business Ledger</strong><br />
            Stay Policy: 22 Hours/night (Check-in: 12:00 PM Noon • Check-out: 10:00 AM Morning)<br />
            This document is an authorized proprietary record of Hotel Rajmahal Palace management console.
          </div>
          <div class="signature-line">
            Authorized Signatory / General Manager
          </div>
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
}
