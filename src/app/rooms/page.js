"use client";

import { useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import AdminLayout from "@/components/AdminLayout";
import { fetchRooms, updateRoomAvailability, updateRoomPrice } from "@/lib/bookingService";
import { ROOMS_DATA } from "@/data/rooms";
import {
  CheckCircle,
  XCircle,
  Wrench,
  RefreshCw,
  ShieldCheck,
  Edit3,
  Check,
  X,
  Tag,
} from "lucide-react";
import Image from "next/image";

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [editingPriceId, setEditingPriceId] = useState(null);
  const [priceInput, setPriceInput] = useState("");
  const [isSavingPrice, setIsSavingPrice] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const loadRooms = async () => {
    setLoading(true);
    try {
      const data = await fetchRooms();
      setRooms(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const handleStartEditPrice = (room) => {
    const currentPrice = room.price_per_night !== undefined ? room.price_per_night : (room.pricePerNight || 3000);
    setEditingPriceId(room.id);
    setPriceInput(String(currentPrice));
  };

  const handleSavePrice = async (roomId) => {
    if (!priceInput || isNaN(Number(priceInput)) || Number(priceInput) <= 0) {
      alert("Please enter a valid price greater than 0");
      return;
    }

    const newPrice = Number(priceInput);
    setIsSavingPrice(true);
    setSuccessMessage("");

    try {
      const res = await updateRoomPrice(roomId, newPrice);
      if (res.success) {
        setRooms((prev) =>
          prev.map((r) => (r.id === roomId ? { ...r, price_per_night: newPrice, pricePerNight: newPrice } : r))
        );
        setSuccessMessage(`Room price updated to ₹${newPrice.toLocaleString('en-IN')} / night. Live across the entire website.`);
        setEditingPriceId(null);
        setTimeout(() => setSuccessMessage(""), 5000);
      }
    } catch (err) {
      console.error("Failed to update room price:", err);
      alert("Failed to update room price. Please check your connection.");
    } finally {
      setIsSavingPrice(false);
    }
  };

  const handleStatusChange = async (roomId, newStatus) => {
    setUpdatingId(roomId);
    setSuccessMessage("");
    try {
      const res = await updateRoomAvailability(roomId, newStatus);
      if (res.success) {
        setRooms((prev) =>
          prev.map((r) => (r.id === roomId ? { ...r, availability_status: newStatus } : r))
        );
        setSuccessMessage(`Room status updated to '${newStatus.toUpperCase()}'. Changes applied live.`);
        setTimeout(() => setSuccessMessage(""), 4000);
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sandstone/20 pb-4">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-sandstone font-bold block">
                ROOM INVENTORY & AVAILABILITY
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif text-charcoal">
                Palace Accommodations Management
              </h2>
            </div>

            <button
              onClick={loadRooms}
              className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 bg-white border border-sandstone/30 text-sandstone text-xs font-serif rounded hover:bg-cream-muted transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Inventory</span>
            </button>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs rounded font-serif flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Info Notice */}
          <div className="p-4 rounded bg-cream-muted border border-gold/30 text-xs text-charcoal/80 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-gold shrink-0 mt-0.5" />
            <div>
              <strong className="text-sandstone block font-serif uppercase tracking-wider">
                Live Database Availability Enforcement
              </strong>
              <span>
                When a room is marked as <strong className="text-red-700 font-mono">UNAVAILABLE</strong> or{" "}
                <strong className="text-amber-700 font-mono">MAINTENANCE</strong>, it will immediately stop appearing as bookable on the public website and will be rejected by the booking availability engine.
              </span>
            </div>
          </div>

          {/* Single Master Room Management Card */}
          <div className="w-full max-w-4xl mx-auto">
            {(rooms && rooms.length > 0 ? [rooms[0]] : ROOMS_DATA).map((room) => {
              const status = room.availability_status || "available";
              const isUpdating = updatingId === room.id;

              return (
                <div
                  key={room.id}
                  className={`bg-white rounded-lg border shadow-sm overflow-hidden transition-all ${
                    status === "available"
                      ? "border-sandstone/20"
                      : status === "maintenance"
                      ? "border-amber-400 bg-amber-50/20"
                      : "border-red-300 bg-red-50/20"
                  }`}
                >
                  {/* Image & Header Overlay */}
                  <div className="relative h-48 w-full bg-charcoal">
                    {room.image_url || room.featuredImage ? (
                      <Image
                        src={room.image_url || room.featuredImage}
                        alt={room.room_name || room.name}
                        fill
                        className="object-cover opacity-90"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-cream/40 font-serif">
                        Palace Suite Image
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                    <div className="absolute top-3 left-3 bg-charcoal/90 text-gold border border-gold/40 px-2.5 py-1 rounded text-[11px] font-mono">
                      {room.view_type || room.view || "Palace View"}
                    </div>

                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-3 py-1 rounded text-xs font-serif font-bold uppercase tracking-wider shadow ${
                          status === "available"
                            ? "bg-emerald-600 text-white"
                            : status === "maintenance"
                            ? "bg-amber-600 text-white"
                            : "bg-red-700 text-white"
                        }`}
                      >
                        {status}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h3 className="text-xl font-serif">{room.room_name || room.name}</h3>
                      <p className="text-xs text-cream/80 font-sans line-clamp-1">
                        {room.room_type || room.slug}
                      </p>
                    </div>
                  </div>

                  {/* Card Content Details */}
                  <div className="p-5 space-y-4">
                    {/* Live Price Per Night Management Box */}
                    <div className="bg-cream-muted/70 border border-sandstone/25 rounded-lg p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10.5px] uppercase font-mono tracking-wider text-sandstone font-bold flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-sandstone" />
                          <span>NIGHTLY RATE (PRICE)</span>
                        </span>

                        {editingPriceId !== room.id && (
                          <button
                            type="button"
                            onClick={() => handleStartEditPrice(room)}
                            className="text-xs font-serif text-sandstone hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Update Price</span>
                          </button>
                        )}
                      </div>

                      {editingPriceId === room.id ? (
                        <div className="space-y-2.5 pt-1">
                          <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-serif text-charcoal font-bold">₹</span>
                              <input
                                type="number"
                                min="1"
                                step="100"
                                value={priceInput}
                                onChange={(e) => setPriceInput(e.target.value)}
                                placeholder="Enter price"
                                className="w-full bg-white border-2 border-sandstone focus:border-charcoal pl-7 pr-3 py-1.5 text-sm font-mono font-bold text-charcoal rounded focus:outline-none shadow-inner"
                                autoFocus
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => handleSavePrice(room.id)}
                              disabled={isSavingPrice}
                              className="px-3.5 py-2 bg-sandstone hover:bg-[#7a3224] text-white text-xs font-serif rounded flex items-center gap-1 cursor-pointer font-semibold shadow disabled:opacity-50"
                            >
                              {isSavingPrice ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                              <span>Save</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setEditingPriceId(null)}
                              disabled={isSavingPrice}
                              className="px-2.5 py-2 bg-white border border-sandstone/30 text-charcoal text-xs font-serif rounded hover:bg-cream-muted cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Quick Presets */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] text-charcoal/60 font-mono">Quick Set:</span>
                            {[2500, 3000, 3500, 4000, 4500, 5000].map((preset) => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => setPriceInput(String(preset))}
                                className="text-[10.5px] font-mono px-2 py-0.5 bg-white hover:bg-cream border border-sandstone/25 rounded text-charcoal/80 hover:text-sandstone cursor-pointer"
                              >
                                ₹{preset.toLocaleString('en-IN')}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-baseline justify-between pt-0.5">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl font-serif font-bold text-sandstone">
                              ₹{Number(room.price_per_night !== undefined ? room.price_per_night : (room.pricePerNight || 0)).toLocaleString('en-IN')}
                            </span>
                            <span className="text-xs text-charcoal/60 font-sans">
                              / night (+ 18% GST ₹{Math.round(Number(room.price_per_night !== undefined ? room.price_per_night : (room.pricePerNight || 0)) * 0.18).toLocaleString('en-IN')})
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs border-b border-sandstone/15 pb-3">
                      <div>
                        <span className="text-charcoal/60 block text-[10px]">Total Inventory</span>
                        <span className="font-semibold text-sandstone font-mono">8 Identical Rooms</span>
                      </div>
                      <div>
                        <span className="text-charcoal/60 block text-[10px]">Max Guests</span>
                        <span className="font-semibold text-charcoal">{room.max_guests || room.maxGuests} Guests</span>
                      </div>
                      <div>
                        <span className="text-charcoal/60 block text-[10px]">Bed Type</span>
                        <span className="font-semibold text-charcoal">{room.bed_type || room.bedType || "King Bed"}</span>
                      </div>
                    </div>

                    <p className="text-xs text-charcoal/70 line-clamp-2">
                      {room.description}
                    </p>

                    {/* Status Switch Actions */}
                    <div className="space-y-2 pt-1">
                      <span className="text-[11px] font-serif uppercase tracking-wider text-sandstone font-bold block">
                        Set Availability Status:
                      </span>

                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => handleStatusChange(room.id, "available")}
                          disabled={isUpdating || status === "available"}
                          className={`py-2 px-2 rounded text-[11px] font-serif uppercase tracking-wider flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                            status === "available"
                              ? "bg-emerald-700 text-white border-emerald-800 font-bold shadow"
                              : "bg-cream-muted text-charcoal hover:bg-emerald-100 border-sandstone/20"
                          }`}
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>AVAILABLE</span>
                        </button>

                        <button
                          onClick={() => handleStatusChange(room.id, "unavailable")}
                          disabled={isUpdating || status === "unavailable"}
                          className={`py-2 px-2 rounded text-[11px] font-serif uppercase tracking-wider flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                            status === "unavailable"
                              ? "bg-red-700 text-white border-red-800 font-bold shadow"
                              : "bg-cream-muted text-charcoal hover:bg-red-100 border-sandstone/20"
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>UNAVAILABLE</span>
                        </button>

                        <button
                          onClick={() => handleStatusChange(room.id, "maintenance")}
                          disabled={isUpdating || status === "maintenance"}
                          className={`py-2 px-2 rounded text-[11px] font-serif uppercase tracking-wider flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                            status === "maintenance"
                              ? "bg-amber-600 text-white border-amber-700 font-bold shadow"
                              : "bg-cream-muted text-charcoal hover:bg-amber-100 border-sandstone/20"
                          }`}
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          <span>MAINTAIN</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
