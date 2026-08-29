import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const ticketId = typeof body?.ticketId === "string" ? body.ticketId.trim() : "";

    if (!ticketId) {
      return NextResponse.json(
        {
          error: "No registration ID was provided.",
        },
        { status: 400 },
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        {
          error: "Supabase is not configured for server-side check-in.",
        },
        { status: 503 },
      );
    }

    const checkedInAt = new Date().toISOString();
    const { data, error } = await supabaseAdmin
      .from("registrations")
      .update({
        checked_in: true,
        checked_in_at: checkedInAt,
      })
      .eq("registration_id", ticketId)
      .eq("checked_in", false)
      .select("*")
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        const { data: existingRegistration, error: lookupError } = await supabaseAdmin
          .from("registrations")
          .select("*")
          .eq("registration_id", ticketId)
          .maybeSingle();

        if (lookupError) {
          console.error("Check-in lookup error:", lookupError);
          return NextResponse.json(
            {
              error: "Check-in failed. Please try again.",
            },
            { status: 500 },
          );
        }

        if (!existingRegistration) {
          return NextResponse.json(
            {
              error: "INVALID TICKET",
            },
            { status: 404 },
          );
        }

        if (existingRegistration.checked_in) {
          return NextResponse.json(
            {
              error: "ALREADY CHECKED IN",
              message: "ALREADY CHECKED IN",
              checked_in_at: existingRegistration.checked_in_at,
              registration: existingRegistration,
            },
            { status: 409 },
          );
        }

        return NextResponse.json(
          {
            error: "Ticket could not be checked in. Please try again.",
            message: "CHECK-IN FAILED",
          },
          { status: 409 },
        );
      }

      console.error("Check-in update error:", error);
      return NextResponse.json(
        {
          error: "Check-in failed. Please try again.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        message: "CHECK-IN SUCCESSFUL",
        checked_in_at: data.checked_in_at,
        registration: data,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Check-in request error:", error);
    return NextResponse.json(
      {
        error: "Invalid check-in request.",
      },
      { status: 400 },
    );
  }
}
