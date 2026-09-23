import { Router, type IRouter } from "express";
import { listAppointments, updateAppointmentStatus } from "../lib/hospital-data.js";
import QRCode from "qrcode";

const router: IRouter = Router();

// ── GET /api/qr/:checkInCode.png ─────────────────────────────────────────────
// Returns the QR code as a PNG image — safe to use in emails (no data: URLs)

router.get("/qr/:checkInCode.png", async (req, res) => {
  const { checkInCode } = req.params;
  const apt = listAppointments().find(a => a.checkInCode === checkInCode);

  const scanUrl = apt
    ? `${process.env["APP_URL"] ?? "http://localhost:5000"}/api/scan/${checkInCode}?apt=${apt.appointmentNumber}&patient=${encodeURIComponent(apt.patientName)}`
    : `${process.env["APP_URL"] ?? "http://localhost:5000"}/api/scan/${checkInCode}`;

  try {
    const buffer = await QRCode.toBuffer(scanUrl, {
      width: 240,
      margin: 2,
      color: { dark: "#0A1F44", light: "#ffffff" },
      errorCorrectionLevel: "H",
    });
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(buffer);
  } catch {
    res.status(500).json({ error: "QR generation failed" });
  }
});

// ── GET /api/scan/:checkInCode ───────────────────────────────────────────────
// Called when a guard/doctor scans the QR code from the appointment email.
// Marks the patient as checked_in and returns appointment details + HTML page.

router.get("/scan/:checkInCode", (req, res) => {
  const { checkInCode } = req.params;
  const apt = listAppointments().find(a => a.checkInCode === checkInCode);

  if (!apt) {
    res.status(404).send(scanPage({
      success: false,
      title: "Invalid QR Code",
      message: "This code was not found. It may have already been used or is invalid.",
      checkInCode,
    }));
    return;
  }

  const alreadyCheckedIn = apt.status === "checked_in" || apt.status === "in_consultation" || apt.status === "completed";

  if (!alreadyCheckedIn) {
    updateAppointmentStatus(apt.id, "checked_in");
  }

  const scheduledDate = new Date(apt.scheduledAt).toLocaleString("en-IN", {
    weekday: "short", day: "numeric", month: "short",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });

  res.send(scanPage({
    success: true,
    title: alreadyCheckedIn ? "Already Checked In" : "Check-In Successful ✓",
    message: alreadyCheckedIn
      ? `${apt.patientName} was already checked in.`
      : `${apt.patientName} has been checked in successfully.`,
    checkInCode,
    details: {
      appointmentNumber: apt.appointmentNumber,
      patientName: apt.patientName,
      doctor: apt.doctorName,
      service: apt.serviceName,
      department: apt.department,
      scheduledAt: scheduledDate,
      visitType: apt.visitType.replace(/_/g, " "),
      status: apt.status,
      notes: apt.notes ?? "",
    },
    punchTime: new Date().toLocaleString("en-IN", {
      hour: "2-digit", minute: "2-digit", second: "2-digit",
      day: "numeric", month: "short", year: "numeric", hour12: true,
    }),
  }));
});

// ─── HTML response page ───────────────────────────────────────────────────────

interface ScanPageOptions {
  success: boolean;
  title: string;
  message: string;
  checkInCode: string;
  punchTime?: string;
  details?: {
    appointmentNumber: string;
    patientName: string;
    doctor: string;
    service: string;
    department: string;
    scheduledAt: string;
    visitType: string;
    status: string;
    notes: string;
  };
}

function scanPage(opts: ScanPageOptions): string {
  const { success, title, message, punchTime, details } = opts;
  const color = success ? "#16a34a" : "#dc2626";
  const bgLight = success ? "rgba(22,163,74,0.08)" : "rgba(220,38,38,0.08)";
  const icon = success ? "✓" : "✗";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta name="color-scheme" content="light dark"/>
  <title>${title} — ASHOKA Care</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0;}
    body{min-height:100vh;background:#F4F7FC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;display:flex;align-items:center;justify-content:center;padding:24px;}
    @media(prefers-color-scheme:dark){
      body{background:#0d1117;}
      .card{background:#161b22!important;border-color:rgba(255,255,255,0.08)!important;}
      .label{color:#8b949e!important;}
      .value{color:#f0f6fc!important;}
      h1{color:#f0f6fc!important;}
      .punch{color:#8b949e!important;}
      .row{border-bottom-color:rgba(255,255,255,0.06)!important;}
    }
  </style>
</head>
<body>
  <div style="width:100%;max-width:480px;">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-flex;align-items:center;gap:10px;background:#0A1F44;border-radius:12px;padding:10px 20px;">
        <span style="font-size:20px;">🏥</span>
        <div style="text-align:left;">
          <div style="font-size:15px;font-weight:900;color:#fff;letter-spacing:-0.02em;">ASHOKA</div>
          <div style="font-size:8px;font-weight:700;color:rgba(255,255,255,0.45);text-transform:uppercase;letter-spacing:0.2em;">Care Hospital</div>
        </div>
      </div>
    </div>

    <!-- Status card -->
    <div class="card" style="background:#fff;border-radius:20px;border:1px solid rgba(10,31,68,0.08);box-shadow:0 4px 32px rgba(10,31,68,0.08);overflow:hidden;">

      <!-- Top stripe -->
      <div style="height:5px;background:${color};"></div>

      <!-- Status -->
      <div style="padding:32px 32px 24px;text-align:center;">
        <div style="width:72px;height:72px;border-radius:50%;background:${bgLight};display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:32px;font-weight:900;color:${color};">${icon}</div>
        <h1 style="font-size:22px;font-weight:900;color:#0A1F44;letter-spacing:-0.03em;margin-bottom:8px;">${title}</h1>
        <p style="font-size:14px;color:#6B7FA3;line-height:1.5;">${message}</p>
        ${punchTime ? `<p class="punch" style="font-size:12px;color:#A0AEC0;margin-top:8px;font-weight:600;">Punch time: ${punchTime}</p>` : ""}
      </div>

      ${details ? `
      <!-- Details table -->
      <div style="padding:0 32px 28px;">
        <div style="font-size:10px;font-weight:800;color:#A0AEC0;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:12px;">Appointment Details</div>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${[
            ["Appointment", details.appointmentNumber],
            ["Patient", details.patientName],
            ["Doctor", details.doctor],
            ["Service", details.service],
            ["Department", details.department],
            ["Scheduled", details.scheduledAt],
            ["Visit Type", details.visitType],
            ["Status", details.status.replace(/_/g, " ")],
            ...(details.notes ? [["Notes", details.notes]] : []),
          ].map(([label, value], i, arr) => `
          <tr class="row" style="border-bottom:${i < arr.length - 1 ? "1px solid rgba(10,31,68,0.06)" : "none"};">
            <td class="label" style="padding:9px 0;font-size:11px;font-weight:600;color:#A0AEC0;width:38%;vertical-align:top;">${label}</td>
            <td class="value" style="padding:9px 0;font-size:12px;font-weight:700;color:#0A1F44;vertical-align:top;">${value}</td>
          </tr>`).join("")}
        </table>
      </div>` : ""}

      <!-- Actions -->
      <div style="padding:0 32px 28px;display:flex;gap:10px;">
        <a href="/api/scan/${opts.checkInCode}"
          style="flex:1;display:block;text-align:center;background:rgba(10,31,68,0.06);color:#0A1F44;font-size:12px;font-weight:700;text-decoration:none;padding:11px 16px;border-radius:10px;border:1px solid rgba(10,31,68,0.1);">
          🔄 Refresh
        </a>
        <a href="javascript:window.close()"
          style="flex:1;display:block;text-align:center;background:#0A1F44;color:#fff;font-size:12px;font-weight:700;text-decoration:none;padding:11px 16px;border-radius:10px;">
          ✓ Done
        </a>
      </div>

    </div>

    <p style="text-align:center;font-size:11px;color:#A0AEC0;margin-top:16px;">ASHOKA Care Hospital Staff Portal · Scan Check-In</p>
  </div>
</body>
</html>`;
}

export default router;
