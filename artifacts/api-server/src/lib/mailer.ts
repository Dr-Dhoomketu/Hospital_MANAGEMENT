import nodemailer from "nodemailer";
import { logger } from "./logger.js";

// ─── Transport ───────────────────────────────────────────────────────────────

function createTransport() {
  const user = process.env["SMTP_USER"];
  const pass = process.env["SMTP_PASS"];
  const host = process.env["SMTP_HOST"] ?? "smtp.gmail.com";
  const port = Number(process.env["SMTP_PORT"] ?? 587);

  if (!user || !pass) {
    logger.warn("[mailer] SMTP_USER / SMTP_PASS not set — emails will be logged only");
    return null;
  }

  return nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
}

async function sendMail(to: string, subject: string, html: string): Promise<void> {
  const transport = createTransport();
  const from = process.env["SMTP_USER"] ?? "noreply@ashokacare.in";

  if (!transport) {
    logger.info({ to, subject }, "[mailer] (no SMTP) would send email");
    return;
  }

  try {
    await transport.sendMail({ from: `"ASHOKA Care Hospital" <${from}>`, to, subject, html });
    logger.info({ to, subject }, "[mailer] email sent");
  } catch (err) {
    logger.error({ err, to, subject }, "[mailer] failed to send email");
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  }).format(d);
}

// ─── Template ────────────────────────────────────────────────────────────────

export function buildAppointmentEmail(apt: {
  appointmentNumber: string;
  patientName: string;
  email: string;
  doctorName: string;
  serviceName: string;
  department: string;
  scheduledAt: string;
  visitType: string;
  checkInCode: string;
  qrPayload: string;
  notes: string | null;
}): string {
  const visitLabel: Record<string, string> = {
    new: "First Visit", follow_up: "Follow-up", revisit: "Revisit",
  };
  const dateStr = formatDate(apt.scheduledAt);
  const visitTypeLabel = visitLabel[apt.visitType] ?? apt.visitType;

  // QR encodes a scan URL — served as a real PNG from the API (Gmail blocks data: URLs)
  const apiBase = process.env["APP_URL"] ?? "http://localhost:5000";
  const scanUrl = `${apiBase}/api/scan/${apt.checkInCode}?apt=${apt.appointmentNumber}&patient=${encodeURIComponent(apt.patientName)}`;
  const qrImageUrl = `${apiBase}/api/qr/${apt.checkInCode}.png`;

  const details = [
    { label: "Patient",    value: apt.patientName },
    { label: "Date & Time",value: dateStr },
    { label: "Doctor",     value: apt.doctorName },
    { label: "Service",    value: apt.serviceName },
    { label: "Department", value: apt.department },
    { label: "Visit Type", value: visitTypeLabel },
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="color-scheme" content="light dark"/>
<title>Appointment Confirmed — ASHOKA Care</title>
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  body{margin:0;padding:0;background-color:#F4F7FC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;}
  @media(prefers-color-scheme:dark){
    body,.email-wrapper{background-color:#0d1117!important;}
    .card{background-color:#161b22!important;border-color:rgba(255,255,255,0.08)!important;}
    .card-title{color:#f0f6fc!important;}
    .card-sub{color:#8b949e!important;}
    .detail-row{border-bottom-color:rgba(255,255,255,0.06)!important;}
    .detail-label{color:#8b949e!important;}
    .detail-value{color:#f0f6fc!important;}
    .before-box{background-color:rgba(255,255,255,0.04)!important;}
    .before-tip{color:#8b949e!important;}
    .qr-box{background-color:#161b22!important;border-color:rgba(255,255,255,0.08)!important;}
    .qr-label{color:#8b949e!important;}
    .footer-text{color:#8b949e!important;}
    .note-box{background-color:rgba(47,93,170,0.15)!important;border-color:rgba(47,93,170,0.3)!important;}
    .note-text{color:#a5c4f3!important;}
  }
</style>
</head>
<body class="email-wrapper" style="background-color:#F4F7FC;padding:32px 16px;">

<table width="100%" cellpadding="0" cellspacing="0" role="presentation">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;">

  <!-- Logo -->
  <tr><td style="padding:0 0 24px;" align="center">
    <table cellpadding="0" cellspacing="0" role="presentation">
      <tr><td style="background:#0A1F44;border-radius:16px;padding:14px 28px;" align="center">
        <table cellpadding="0" cellspacing="0" role="presentation"><tr>
          <td style="padding-right:12px;vertical-align:middle;">
            <div style="width:38px;height:38px;background:rgba(255,255,255,0.12);border-radius:10px;text-align:center;line-height:38px;font-size:18px;">🏥</div>
          </td>
          <td style="vertical-align:middle;">
            <div style="font-size:19px;font-weight:900;color:#fff;letter-spacing:-0.02em;line-height:1.1;">ASHOKA</div>
            <div style="font-size:8px;font-weight:700;color:rgba(255,255,255,0.45);text-transform:uppercase;letter-spacing:0.22em;margin-top:2px;">Care Hospital</div>
          </td>
        </tr></table>
      </td></tr>
    </table>
  </td></tr>

  <!-- Main card -->
  <tr><td>
    <table class="card" width="100%" cellpadding="0" cellspacing="0" role="presentation"
      style="background:#ffffff;border-radius:24px;border:1px solid rgba(10,31,68,0.08);box-shadow:0 4px 40px rgba(10,31,68,0.08);overflow:hidden;">

      <!-- Green top stripe -->
      <tr><td style="height:5px;background:linear-gradient(90deg,#16a34a,#22c55e,#4ade80);"></td></tr>

      <!-- Confirmed badge + headline -->
      <tr><td style="padding:36px 40px 28px;" align="center">
        <div style="display:inline-block;background:rgba(22,163,74,0.1);border-radius:999px;padding:6px 18px;margin-bottom:18px;">
          <span style="font-size:11px;font-weight:800;color:#16a34a;text-transform:uppercase;letter-spacing:0.15em;">✓ &nbsp;Booking Confirmed</span>
        </div>
        <h1 class="card-title" style="font-size:30px;font-weight:900;color:#0A1F44;letter-spacing:-0.04em;margin:0 0 10px;">You're on the list.</h1>
        <p class="card-sub" style="font-size:14px;color:#6B7FA3;line-height:1.65;margin:0;">
          Your appointment at ASHOKA Care Hospital has been confirmed.<br/>We look forward to seeing you.
        </p>
      </td></tr>

      <!-- Check-in code band -->
      <tr><td style="background:#0A1F44;padding:22px 40px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr>
          <td>
            <div style="font-size:9px;font-weight:800;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.22em;margin-bottom:6px;">Check-In Code</div>
            <div style="font-size:30px;font-weight:900;color:#fff;letter-spacing:0.14em;font-family:'Courier New',monospace;">${apt.checkInCode}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.35);margin-top:3px;">${apt.appointmentNumber}</div>
          </td>
          <td align="right" style="vertical-align:middle;">
            <div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.45);text-align:right;line-height:1.5;">Show at<br/>front desk</div>
          </td>
        </tr></table>
      </td></tr>

      <!-- QR Code + Details split -->
      <tr><td style="padding:28px 40px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr>

          <!-- QR code -->
          <td style="width:180px;vertical-align:top;">
            <table class="qr-box" cellpadding="0" cellspacing="0" role="presentation"
              style="background:#f8fafc;border:1px solid rgba(10,31,68,0.1);border-radius:16px;padding:16px;">
              <tr><td align="center">
                <img src="${qrImageUrl}" width="150" height="150" alt="Appointment QR Code"
                  style="display:block;border-radius:8px;"/>
              </td></tr>
              <tr><td style="padding-top:10px;" align="center">
                <div class="qr-label" style="font-size:10px;font-weight:700;color:#A0AEC0;text-transform:uppercase;letter-spacing:0.12em;text-align:center;">Scan to Check In</div>
              </td></tr>
              <tr><td style="padding-top:4px;" align="center">
                <div style="font-size:10px;color:#6B7FA3;text-align:center;line-height:1.4;">Staff / Doctor<br/>scan at entry</div>
              </td></tr>
            </table>
          </td>

          <td style="width:20px;"></td>

          <!-- Details -->
          <td style="vertical-align:top;">
            <div style="font-size:10px;font-weight:800;color:#A0AEC0;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:14px;">Appointment Details</div>
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              ${details.map((row, i) => `
              <tr class="detail-row" style="border-bottom:${i < details.length - 1 ? '1px solid rgba(10,31,68,0.06)' : 'none'};">
                <td class="detail-label" style="padding:9px 0;font-size:11px;font-weight:600;color:#A0AEC0;width:38%;vertical-align:top;">${row.label}</td>
                <td class="detail-value" style="padding:9px 0;font-size:12px;font-weight:700;color:#0A1F44;vertical-align:top;">${row.value}</td>
              </tr>`).join('')}
            </table>
          </td>

        </tr></table>
      </td></tr>

      <!-- Notes -->
      ${apt.notes ? `
      <tr><td style="padding:0 40px 24px;">
        <div class="note-box" style="background:rgba(47,93,170,0.06);border:1px solid rgba(47,93,170,0.15);border-radius:12px;padding:14px 18px;">
          <div style="font-size:9px;font-weight:800;color:#2F5DAA;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:5px;">Your Note</div>
          <p class="note-text" style="font-size:13px;color:#374151;line-height:1.6;margin:0;">${apt.notes}</p>
        </div>
      </td></tr>` : ''}

      <!-- Before you arrive -->
      <tr><td style="padding:0 40px 28px;">
        <table class="before-box" width="100%" cellpadding="0" cellspacing="0" role="presentation"
          style="background:rgba(10,31,68,0.03);border-radius:14px;padding:18px 20px;">
          <tr><td>
            <div style="font-size:10px;font-weight:800;color:#A0AEC0;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:12px;">Before You Arrive</div>
            ${[
              "Bring a valid photo ID and any previous medical reports.",
              "Arrive 15 minutes before your scheduled time.",
              "Show your QR code or check-in code at the front desk.",
            ].map(tip => `
            <table cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:8px;"><tr>
              <td style="vertical-align:top;padding-right:10px;color:#16a34a;font-size:14px;font-weight:700;">✓</td>
              <td class="before-tip" style="font-size:12px;color:#6B7FA3;line-height:1.5;">${tip}</td>
            </tr></table>`).join('')}
          </td></tr>
        </table>
      </td></tr>

      <!-- CTA -->
      <tr><td style="padding:0 40px 40px;" align="center">
        <a href="${process.env["APP_URL"] ?? "http://localhost:3000"}/portal/dashboard"
          style="display:inline-block;background:#0A1F44;color:#fff;font-size:12px;font-weight:700;letter-spacing:0.06em;text-decoration:none;padding:14px 36px;border-radius:12px;text-transform:uppercase;">
          View My Appointments →
        </a>
      </td></tr>

    </table>
  </td></tr>

  <!-- Emergency strip -->
  <tr><td style="padding:16px 0 0;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
      style="background:#dc2626;border-radius:12px;padding:14px 22px;">
      <tr><td>
        <span style="font-size:12px;font-weight:800;color:rgba(255,255,255,0.85);">🚨 Emergency? Call us 24/7: </span>
        <a href="tel:+919801685127" style="font-size:13px;font-weight:900;color:#fff;text-decoration:none;">+91 98016 85127</a>
      </td></tr>
    </table>
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:24px 0 16px;" align="center">
    <p class="footer-text" style="font-size:11px;color:#A0AEC0;line-height:1.8;margin:0;">
      ASHOKA Care Hospital · New Delhi, India<br/>
      This is an automated confirmation. Please do not reply to this email.<br/>
      <a href="${process.env["APP_URL"] ?? "http://localhost:3000"}" style="color:#2F5DAA;text-decoration:none;font-weight:600;">ashokacare.in</a>
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

// ─── Send appointment confirmation ───────────────────────────────────────────

export async function sendAppointmentConfirmation(
  apt: Parameters<typeof buildAppointmentEmail>[0] & { email: string }
): Promise<void> {
  if (!apt.email) return;
  const html = buildAppointmentEmail(apt);
  await sendMail(
    apt.email,
    `✅ Appointment Confirmed — ${apt.appointmentNumber} | ASHOKA Care`,
    html
  );
}
