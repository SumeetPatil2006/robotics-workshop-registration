import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const ticketId = typeof body?.ticketId === "string" ? body.ticketId.trim() : "";

    if (!ticketId) {
      return NextResponse.json(
        {
          valid: false,
          error: "No registration ID was provided.",
        },
        { status: 400 },
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        {
          valid: false,
          error: "Supabase is not configured for server-side verification.",
        },
        { status: 503 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("registrations")
      .select("*")
      .eq("registration_id", ticketId)
      .maybeSingle();

    if (error) {
      console.error("Ticket verification error:", error);
      return NextResponse.json(
        {
          valid: false,
          error: "Verification failed. Please try again.",
        },
        { status: 500 },
      );
    }

    if (!data) {
      return NextResponse.json(
        {
          valid: false,
          error: "INVALID TICKET",
        },
        { status: 404 },
      );
    }

    if (data.checked_in) {
      return NextResponse.json(
        {
          valid: false,
          already_checked_in: true,
          registration: data,
          checked_in_at: data.checked_in_at,
          message: "ALREADY CHECKED IN",
          error: "ALREADY CHECKED IN",
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        valid: true,
        registration: data,
        checked_in_at: null,
        message: "VALID TICKET",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Ticket verification request error:", error);
    return NextResponse.json(
      {
        valid: false,
        error: "Invalid verification request.",
      },
      { status: 400 },
    );
  }
}
