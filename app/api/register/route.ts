import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { Resend } from "resend";
import { eventConfig } from "@/lib/event-data";
import { supabaseAdmin } from "@/lib/supabase";
import { validateRegistrationInput } from "@/lib/validators";

const generateRegistrationId = () => {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `TECH-ROBO-${suffix}`;
};

const createEmailHtml = ({
  fullName,
  registrationId,
  branch,
  year,
  email,
  qrCodeDataUrl,
}: {
  fullName: string;
  registrationId: string;
  branch: string;
  year: string;
  email: string;
  qrCodeDataUrl: string;
}) => `
  <div style="font-family: Arial, sans-serif; background:#f5f5f4; padding:32px; color:#111827;">
    <div style="max-width:680px; margin:0 auto; background:#ffffff; border:1px solid #e5e7eb; border-radius:18px; overflow:hidden;">
      <div style="background:#111827; color:#ffffff; padding:28px 32px;">
        <p style="margin:0; letter-spacing:4px; font-size:11px; text-transform:uppercase; color:#d1d5db;">Techfest × KBTCOE</p>
        <h1 style="margin:18px 0 0; font-size:34px; line-height:1.1;">Robotics Workshop</h1>
      </div>

      <div style="padding:32px;">
        <p style="margin:0 0 18px; font-size:14px; color:#475569;">Your registration has been confirmed.</p>

        <div style="display:flex; gap:20px; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; background:#f8fafc; border:1px solid #e2e8f0; border-radius:16px; padding:20px; margin-bottom:22px;">
          <div>
            <p style="margin:0; font-size:12px; letter-spacing:3px; text-transform:uppercase; color:#64748b;">Participant</p>
            <p style="margin:10px 0 0; font-size:22px; font-weight:700; color:#0f172a;">${fullName}</p>
            <p style="margin:8px 0 0; font-size:14px; color:#475569;">${branch} • ${year}</p>
            <p style="margin:8px 0 0; font-size:14px; color:#475569;">${email}</p>
          </div>

          <div style="padding:12px 16px; background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; min-width:170px;">
            <p style="margin:0; font-size:11px; letter-spacing:3px; text-transform:uppercase; color:#64748b;">Registration ID</p>
            <p style="margin:8px 0 0; font-size:20px; font-weight:700; color:#111827;">${registrationId}</p>
          </div>
        </div>

        <div style="display:flex; gap:18px; align-items:center; justify-content:space-between; flex-wrap:wrap; margin-top:8px; padding:8px 0 0;">
          <div>
            <p style="margin:0; font-size:12px; letter-spacing:3px; text-transform:uppercase; color:#64748b;">Workshop</p>
            <p style="margin:10px 0 0; font-size:18px; font-weight:700; color:#111827;">${eventConfig.name}</p>
            <p style="margin:8px 0 0; font-size:14px; color:#475569;">${eventConfig.shortDescription}</p>
            <p style="margin:10px 0 0; font-size:13px; color:#475569;">Program: ${eventConfig.programName} • ${eventConfig.partner}</p>
          </div>

          <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:12px;">
            <img src="${qrCodeDataUrl}" alt="QR code" style="width:110px; height:110px; display:block; border-radius:8px;" />
          </div>
        </div>
      </div>

      <div style="padding:0 32px 28px; color:#475569; font-size:13px; line-height:1.7;">
        We look forward to seeing you at the workshop. Please keep this email for your registration record.
      </div>
    </div>
  </div>
`;

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    console.log("[register] request received", {
      email: typeof payload?.email === "string" ? payload.email : undefined,
      hasFullName: typeof payload?.fullName === "string",
      hasBranch: typeof payload?.branch === "string",
      hasYear: typeof payload?.year === "string",
    });

    const validationResult = validateRegistrationInput(payload);

    if (!validationResult.success) {
      console.error("[register] validation failed", validationResult.error);
      return NextResponse.json({ error: validationResult.error }, { status: 400 });
    }

    console.log("[register] validation passed", { email: validationResult.data.email });

    if (!supabaseAdmin) {
      console.error("[register] supabaseAdmin missing");
      return NextResponse.json(
        {
          error: "Supabase is not configured yet. Add the required environment variables and try again.",
        },
        { status: 503 },
      );
    }

    const registrationId = generateRegistrationId();
    console.log("[register] generated registrationId", { registrationId });

    console.log("[register] generating QR code");
    const qrCodeDataUrl = await QRCode.toDataURL(registrationId, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 220,
    });
    console.log("[register] QR code generated", { registrationId, qrLength: qrCodeDataUrl.length });

    console.log("[register] inserting registration into Supabase", {
      registrationId,
      email: validationResult.data.email,
    });

    const { data, error } = await supabaseAdmin
      .from("registrations")
      .insert({
        registration_id: registrationId,
        full_name: validationResult.data.fullName,
        branch: validationResult.data.branch,
        year: validationResult.data.year,
        email: validationResult.data.email,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        console.warn("[register] duplicate registration attempted", {
          email: validationResult.data.email,
          registrationId,
        });
        return NextResponse.json(
          { error: "This email is already registered for the Robotics Workshop." },
          { status: 409 },
        );
      }

      console.error("[register] Supabase insert error:", error);
      return NextResponse.json(
        {
          error: "We could not save your registration. Please try again in a few minutes.",
        },
        { status: 500 },
      );
    }

    console.log("[register] Supabase insert succeeded", {
      registrationId: data.registration_id,
      email: data.email,
    });

    const resendApiKey = process.env.RESEND_API_KEY?.trim();
    const emailFrom = process.env.EMAIL_FROM?.trim();

    console.log("[register] checking Resend configuration", {
      hasApiKey: Boolean(resendApiKey),
      hasFrom: Boolean(emailFrom),
      fromAddress: emailFrom ? emailFrom.replace(/(.{2}).*@/, "$1***@") : null,
    });

    if (!resendApiKey || !emailFrom) {
      const missingConfig = [
        !resendApiKey ? "RESEND_API_KEY" : null,
        !emailFrom ? "EMAIL_FROM" : null,
      ]
        .filter(Boolean)
        .join(", ");

      console.error("[register] Resend configuration missing:", missingConfig);

      return NextResponse.json(
        {
          message: "Registration saved successfully, but the confirmation email could not be sent.",
          registration: data,
          ticket: {
            qrCodeDataUrl,
            registrationId,
          },
          emailError: {
            message: `Missing Resend configuration: ${missingConfig}.`,
          },
        },
        { status: 201 },
      );
    }

    const resend = new Resend(resendApiKey);
    const html = createEmailHtml({
      fullName: data.full_name,
      registrationId: data.registration_id,
      branch: data.branch,
      year: data.year,
      email: data.email,
      qrCodeDataUrl,
    });

    console.log("[register] calling Resend emails.send", {
      to: data.email,
      from: emailFrom,
    });

    const emailResponse = await resend.emails.send({
      from: emailFrom,
      to: [data.email],
      subject: "Your Robotics Workshop registration is confirmed",
      html,
    });

    console.log("[register] Resend response received", {
      hasData: Boolean(emailResponse && "data" in emailResponse && emailResponse.data),
      hasError: Boolean(emailResponse && "error" in emailResponse && emailResponse.error),
      error: emailResponse && "error" in emailResponse ? emailResponse.error : null,
    });

    if (emailResponse.error) {
      console.error("[register] Resend email delivery failed:", {
        to: data.email,
        from: emailFrom,
        error: emailResponse.error,
      });

      return NextResponse.json(
        {
          message: "Registration successful. The confirmation email could not be sent.",
          registration: data,
          ticket: {
            qrCodeDataUrl,
            registrationId,
          },
          emailError: {
            message: emailResponse.error.message || "Unknown Resend error.",
            name: emailResponse.error.name || "ResendError",
            statusCode: emailResponse.error.statusCode || 502,
          },
        },
        { status: 201 },
      );
    }

    console.log("[register] email send succeeded", { registrationId, email: data.email });

    return NextResponse.json(
      {
        message: "Registration successful.",
        registration: data,
        ticket: {
          qrCodeDataUrl,
          registrationId,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[register] Registration API error:", error);
    return NextResponse.json(
      { error: "Invalid request. Please check the form and try again." },
      { status: 400 },
    );
  }
}
