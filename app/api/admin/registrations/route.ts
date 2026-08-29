import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        {
          error: "Supabase is not configured for the organizer dashboard.",
        },
        { status: 503 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("registrations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Dashboard registrations query error:", error);
      return NextResponse.json(
        {
          error: "Unable to load registrations from Supabase.",
        },
        { status: 500 },
      );
    }

    const registrations = data ?? [];
    const checkedInCount = registrations.filter((row) => Boolean(row.checked_in)).length;
    const totalRegistrations = registrations.length;
    const notCheckedInCount = totalRegistrations - checkedInCount;
    const attendancePercentage =
      totalRegistrations === 0 ? 0 : (checkedInCount / totalRegistrations) * 100;

    return NextResponse.json(
      {
        registrations,
        stats: {
          totalRegistrations,
          checkedInCount,
          notCheckedInCount,
          attendancePercentage,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Dashboard registrations request error:", error);
    return NextResponse.json(
      {
        error: "Unable to load registrations right now.",
      },
      { status: 500 },
    );
  }
}
