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
    const { action, currentEmail, newEmail, currentPassword, newPassword, userId } = body;

    if (!action || (!newEmail && !newPassword)) {
      return NextResponse.json(
        { error: "Action and either new email or new password are required" },
        { status: 400 }
      );
    }

    if (supabaseUrl && supabaseServiceKey && !supabaseUrl.includes("placeholder")) {
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });

      // 1. If updating password
      if (action === "update_password" || newPassword) {
        if (!newPassword || newPassword.length < 6) {
          return NextResponse.json(
            { error: "Password must be at least 6 characters long" },
            { status: 400 }
          );
        }

        // Find user by ID or by email
        let targetUserId = userId;

        if (!targetUserId && currentEmail) {
          const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
          const found = usersData?.users?.find(
            (u) => u.email?.toLowerCase() === currentEmail.toLowerCase()
          );
          if (found) {
            targetUserId = found.id;
          }
        }

        if (targetUserId) {
          const { data, error } = await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
            password: newPassword,
          });

          if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
          }

          return NextResponse.json({
            success: true,
            message: "Password updated successfully in Supabase Auth",
            user: { id: data.user.id, email: data.user.email },
          });
        } else if (currentEmail) {
          // If admin user doesn't exist yet in Supabase Auth, create them with new password!
          const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email: currentEmail,
            password: newPassword,
            email_confirm: true,
          });

          if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
          }

          return NextResponse.json({
            success: true,
            message: "Admin account initialized with new password in Supabase Auth",
            user: { id: data.user.id, email: data.user.email },
          });
        }
      }

      // 2. If updating email
      if (action === "update_email" || newEmail) {
        if (!newEmail || !newEmail.includes("@")) {
          return NextResponse.json(
            { error: "Valid new email address is required" },
            { status: 400 }
          );
        }

        let targetUserId = userId;

        if (!targetUserId && currentEmail) {
          const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
          const found = usersData?.users?.find(
            (u) => u.email?.toLowerCase() === currentEmail.toLowerCase()
          );
          if (found) {
            targetUserId = found.id;
          }
        }

        if (targetUserId) {
          const { data, error } = await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
            email: newEmail,
            email_confirm: true,
          });

          if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
          }

          return NextResponse.json({
            success: true,
            message: `Admin email updated to ${newEmail} in Supabase Auth`,
            user: { id: data.user.id, email: data.user.email },
          });
        } else if (currentEmail) {
          // Create user with new email
          const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email: newEmail,
            password: currentPassword || "rajmahal123",
            email_confirm: true,
          });

          if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
          }

          return NextResponse.json({
            success: true,
            message: `Admin account created with email ${newEmail}`,
            user: { id: data.user.id, email: data.user.email },
          });
        }
      }
    }

    // Fallback if operating offline/local
    return NextResponse.json({
      success: true,
      message: "Credentials updated locally",
      user: { email: newEmail || currentEmail },
    });
  } catch (err) {
    console.error("Update credentials error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update credentials" },
      { status: 500 }
    );
  }
}
