import { supabase, isSupabaseConfigured } from "./supabase/client";
import { ROOMS_DATA } from "@/data/rooms";

// Local state fallback storage key for offline prototype persistence
const LOCAL_BOOKINGS_KEY = "rajmahal_bookings_v6";
const LOCAL_ROOMS_KEY = "rajmahal_rooms_v6";

// Helper: Get offline rooms fallback
const getLocalRooms = () => {
  if (typeof window === "undefined") return ROOMS_DATA;
  const stored = localStorage.getItem(LOCAL_ROOMS_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length === ROOMS_DATA.length) {
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
  }
  const initial = ROOMS_DATA.map((r) => ({
    id: r.id,
    room_number: "",
    room_name: r.name,
    room_type: r.slug.replace("-room", "").replace("-suite", ""),
    slug: r.slug,
    description: r.description,
    price_per_night: r.pricePerNight,
    max_guests: r.maxGuests,
    max_adults: r.maxAdults || 3,
    max_children: r.maxChildren || 2,
    bed_type: r.bedType,
    view_type: r.view,
    image_url: r.featuredImage,
    gallery: r.gallery,
    amenities: r.amenities,
    highlights: r.highlights,
    availability_status: "available",
    is_active: true,
  }));
  localStorage.setItem(LOCAL_ROOMS_KEY, JSON.stringify(initial));
  return initial;
};

// Helper: Get offline bookings fallback
const getLocalBookings = () => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(LOCAL_BOOKINGS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
  }
  const pastDate1 = new Date(Date.now() - 86400000 * 10).toISOString().split("T")[0];
  const pastDate2 = new Date(Date.now() - 86400000 * 8).toISOString().split("T")[0];

  const sample = [
    {
      id: "demo-b1",
      booking_reference: "RMP-918234",
      customer_name: "Maharaja Vikramaditya Singh",
      customer_email: "vikram@rajmahal.in",
      customer_phone: "+91 98290 12345",
      special_requests: "High floor balcony suite, early morning high tea setup",
      room_id: "heritage-deluxe-room",
      check_in: pastDate1,
      check_out: pastDate2,
      guests: 3,
      rooms_count: 1,
      nights: 2,
      room_subtotal: 6000,
      taxes_and_fees: 1080,
      total_amount: 7080,
      payment_status: "paid",
      booking_status: "confirmed",
      razorpay_order_id: "order_N8291047192",
      razorpay_payment_id: "pay_P9182740192",
      created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
      room: ROOMS_DATA[0],
    },
  ];
  localStorage.setItem(LOCAL_BOOKINGS_KEY, JSON.stringify(sample));
  return sample;
};

/**
 * Fetch all rooms from Supabase (or fallback)
 */
export async function fetchRooms() {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .order("price_per_night", { ascending: true });
      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (err) {
      console.warn("Supabase rooms query fallback:", err);
    }
  }
  return getLocalRooms();
}

/**
 * Update Room Availability Status (Owner action)
 */
export async function updateRoomAvailability(roomId, newStatus) {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .update({ availability_status: newStatus })
        .eq("id", roomId)
        .select()
        .single();
      if (!error && data) return { success: true, room: data };
    } catch (err) {
      console.error("Supabase status update error:", err);
    }
  }

  // Local fallback update
  const rooms = getLocalRooms();
  const updated = rooms.map((r) => (r.id === roomId ? { ...r, availability_status: newStatus } : r));
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_ROOMS_KEY, JSON.stringify(updated));
  }
  return { success: true, room: updated.find((r) => r.id === roomId) };
}

/**
 * Update Room Price per night (Admin/Owner action)
 */
export async function updateRoomPrice(roomId, newPrice) {
  const numericPrice = Math.max(1, Number(newPrice));

  try {
    const res = await fetch("/api/admin/rooms/update-price", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId, price: numericPrice }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      const rooms = getLocalRooms();
      const updated = rooms.map((r) =>
        r.id === roomId || r.slug === roomId
          ? { ...r, price_per_night: numericPrice, pricePerNight: numericPrice }
          : r
      );
      if (typeof window !== "undefined") {
        localStorage.setItem(LOCAL_ROOMS_KEY, JSON.stringify(updated));
      }
      return { success: true, price: numericPrice, room: data.room };
    }
  } catch (err) {
    console.error("API price update fallback:", err);
  }

  // Direct Supabase fallback
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .update({ price_per_night: numericPrice })
        .eq("id", roomId)
        .select()
        .single();
      if (!error && data) {
        const rooms = getLocalRooms();
        const updated = rooms.map((r) =>
          r.id === roomId ? { ...r, price_per_night: numericPrice, pricePerNight: numericPrice } : r
        );
        if (typeof window !== "undefined") {
          localStorage.setItem(LOCAL_ROOMS_KEY, JSON.stringify(updated));
        }
        return { success: true, price: numericPrice, room: data };
      }
    } catch (err) {
      console.error("Direct Supabase price update error:", err);
    }
  }

  // Local storage fallback
  const rooms = getLocalRooms();
  const updated = rooms.map((r) =>
    r.id === roomId ? { ...r, price_per_night: numericPrice, pricePerNight: numericPrice } : r
  );
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_ROOMS_KEY, JSON.stringify(updated));
  }
  return { success: true, price: numericPrice, room: updated.find((r) => r.id === roomId) };
}

/**
 * Fetch Bookings for Admin Dashboard with filtering & search
 */
export async function fetchAdminBookings(filters = {}) {
  const { search, status, paymentStatus, roomId, dateFrom, dateTo } = filters;

  if (isSupabaseConfigured()) {
    try {
      let query = supabase
        .from("bookings")
        .select("*, room:rooms(*)")
        .order("created_at", { ascending: false });

      if (status && status !== "all") query = query.eq("booking_status", status);
      if (paymentStatus && paymentStatus !== "all") query = query.eq("payment_status", paymentStatus);
      if (roomId && roomId !== "all") query = query.eq("room_id", roomId);
      if (dateFrom) query = query.gte("check_in", dateFrom);
      if (dateTo) query = query.lte("check_out", dateTo);

      if (search && search.trim()) {
        const s = search.trim();
        query = query.or(
          `customer_name.ilike.%${s}%,customer_phone.ilike.%${s}%,booking_reference.ilike.%${s}%,customer_email.ilike.%${s}%`
        );
      }

      const { data, error } = await query;
      if (!error && data) return data;
    } catch (err) {
      console.warn("Supabase admin bookings fallback:", err);
    }
  }

  // Fallback filtering
  let bookings = getLocalBookings();

  if (status && status !== "all") {
    bookings = bookings.filter((b) => b.booking_status === status);
  }
  if (paymentStatus && paymentStatus !== "all") {
    bookings = bookings.filter((b) => b.payment_status === paymentStatus);
  }
  if (roomId && roomId !== "all") {
    bookings = bookings.filter((b) => b.room_id === roomId || b.room?.id === roomId);
  }
  if (dateFrom) {
    bookings = bookings.filter((b) => b.check_in >= dateFrom);
  }
  if (dateTo) {
    bookings = bookings.filter((b) => b.check_out <= dateTo);
  }
  if (search && search.trim()) {
    const term = search.trim().toLowerCase();
    bookings = bookings.filter(
      (b) =>
        b.customer_name?.toLowerCase().includes(term) ||
        b.customer_phone?.toLowerCase().includes(term) ||
        b.customer_email?.toLowerCase().includes(term) ||
        b.booking_reference?.toLowerCase().includes(term)
    );
  }

  return bookings;
}

/**
 * Update Booking Status (Owner action)
 */
export async function updateBookingStatus(bookingId, bookingStatus, paymentStatus) {
  const updates = {};
  if (bookingStatus) updates.booking_status = bookingStatus;
  if (paymentStatus) updates.payment_status = paymentStatus;

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .update(updates)
        .eq("id", bookingId)
        .select()
        .single();
      if (!error && data) return { success: true, booking: data };
    } catch (err) {
      console.error("Supabase booking update error:", err);
    }
  }

  // Local update fallback
  const bookings = getLocalBookings();
  const updated = bookings.map((b) => (b.id === bookingId ? { ...b, ...updates } : b));
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_BOOKINGS_KEY, JSON.stringify(updated));
  }
  return { success: true, booking: updated.find((b) => b.id === bookingId) };
}

/**
 * Fetch Overview Metrics for Hotel Dashboard
 */
export async function fetchDashboardMetrics() {
  const bookings = await fetchAdminBookings();
  const rooms = await fetchRooms();

  const today = new Date().toISOString().split("T")[0];

  const todayArrivals = bookings.filter((b) => b.check_in === today && b.booking_status !== "cancelled");
  const todayDepartures = bookings.filter((b) => b.check_out === today && b.booking_status !== "cancelled");

  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter((b) => b.booking_status === "confirmed").length;
  const pendingPayments = bookings.filter((b) => b.payment_status === "pending").length;

  const totalRevenue = bookings
    .filter((b) => b.payment_status === "paid")
    .reduce((sum, b) => sum + Number(b.total_amount || 0), 0);

  const TOTAL_ROOMS = 8;
  const isMasterAvailable = !rooms.some((r) => r.availability_status === "unavailable" || r.availability_status === "maintenance");

  // Calculate currently active bookings spanning today
  const currentlyOccupied = bookings.filter(
    (b) => b.booking_status === "confirmed" && b.check_in <= today && b.check_out > today
  ).length;

  const availableRoomsCount = isMasterAvailable ? Math.max(0, TOTAL_ROOMS - currentlyOccupied) : 0;
  const unavailableRoomsCount = TOTAL_ROOMS - availableRoomsCount;

  return {
    todayArrivalsCount: todayArrivals.length,
    todayDeparturesCount: todayDepartures.length,
    totalBookings,
    confirmedBookings,
    pendingPayments,
    totalRevenue,
    availableRoomsCount,
    unavailableRoomsCount,
    totalRoomsCount: TOTAL_ROOMS,
    todayArrivals,
    todayDepartures,
    recentBookings: bookings.slice(0, 5),
  };
}
