import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const ticketId = typeof body?.ticketId === "string" ? body.ticketId.trim() : "";
    const checkedIn = typeof body?.checkedIn === "boolean" ? body.checkedIn : null;

    if (!ticketId) {
      return NextResponse.json(
        {
          error: "No registration ID was provided.",
        },
        { status: 400 },
      );
    }

    if (checkedIn === null) {
      return NextResponse.json(
        {
          error: "Invalid status value provided.",
        },
        { status: 400 },
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        {
          error: "Supabase is not configured for server-side operations.",
        },
        { status: 503 },
      );
    }

    const updatePayload = checkedIn
      ? {
          checked_in: true,
          checked_in_at: new Date().toISOString(),
        }
      : {
          checked_in: false,
          checked_in_at: null,
        };

    const { data, error } = await supabaseAdmin
      .from("registrations")
      .update(updatePayload)
      .eq("registration_id", ticketId)
      .select("*")
      .single();

    if (error) {
      console.error("Status update error:", error);
      return NextResponse.json(
        {
          error: "Failed to update participant status. Please try again.",
        },
        { status: 500 },
      );
    }

    if (!data) {
      return NextResponse.json(
        {
          error: "Participant registration not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        message: `Status updated successfully to ${checkedIn ? "Checked in" : "Not checked in"}.`,
        registration: data,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Update status request error:", error);
    return NextResponse.json(
      {
        error: "Invalid update status request.",
      },
      { status: 400 },
    );
  }
}
