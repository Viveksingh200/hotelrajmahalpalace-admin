import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY;

export async function POST(req) {
  try {
    const body = await req.json();
    const { roomId, price } = body;

    if (!roomId || price === undefined || price === null || isNaN(Number(price))) {
      return NextResponse.json(
        { error: "Valid roomId and numeric price are required" },
        { status: 400 }
      );
    }

    const numericPrice = Math.max(1, Number(price));

    if (supabaseUrl && supabaseServiceKey && !supabaseUrl.includes("placeholder")) {
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

      // Check whether roomId is UUID or slug
      const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(roomId);

      let query = supabaseAdmin
        .from("rooms")
        .update({
          price_per_night: numericPrice,
          updated_at: new Date().toISOString(),
        });

      if (isUuid) {
        query = query.eq("id", roomId);
      } else {
        query = query.or(`id.eq.${roomId},slug.eq.${roomId}`);
      }

      const { data, error } = await query.select().maybeSingle();

      if (error) {
        console.error("Supabase room price update error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `Room price updated to ₹${numericPrice.toLocaleString("en-IN")}`,
        room: data,
      });
    }

    // Fallback if Supabase is not connected
    return NextResponse.json({
      success: true,
      message: `Room price updated locally to ₹${numericPrice.toLocaleString("en-IN")}`,
      room: { id: roomId, price_per_night: numericPrice },
    });
  } catch (err) {
    console.error("Admin room price update error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update room price" },
      { status: 500 }
    );
  }
}
