// Brevo Transactional Email Service
// Uses Brevo HTTP API v3 for reliable delivery

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
const BREVO_API_KEY = process.env.BREVO_API_KEY || "";
const EMAIL_FROM = process.env.EMAIL_FROM || "hasanyasargunes@gmail.com";
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || "EthicAll";
const APP_URL = process.env.APP_URL || process.env.AUTH_URL || "https://ethicall.vercel.app";

async function sendEmail(to: string, subject: string, htmlContent: string) {
  if (!BREVO_API_KEY) {
    console.log(`[DEV] Email to ${to}: ${subject}`);
    return;
  }

  const res = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      "accept": "application/json",
      "api-key": BREVO_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: EMAIL_FROM_NAME, email: EMAIL_FROM },
      to: [{ email: to }],
      subject,
      htmlContent,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Brevo email error:", err);
    throw new Error(`Email gonderimi basarisiz: ${res.status}`);
  }
}

// ─── Common HTML wrapper ────────────────────────────────────────────────
function emailWrapper(content: string, orgName?: string) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f8f9fa;font-family:'Inter',system-ui,-apple-system,sans-serif;">
  <div style="max-width:520px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
    <!-- Header -->
    <div style="background:#059669;padding:24px 32px;text-align:center;">
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">EthicAll</h1>
      ${orgName ? `<p style="margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">${orgName}</p>` : ""}
    </div>
    <!-- Content -->
    <div style="padding:32px;">
      ${content}
    </div>
    <!-- Footer -->
    <div style="padding:16px 32px;background:#f8f9fa;border-top:1px solid #e5e7eb;text-align:center;">
      <p style="margin:0;font-size:11px;color:#9ca3af;">EthicAll - Anonim Etik Ihbar Platformu</p>
      <p style="margin:4px 0 0;font-size:11px;color:#9ca3af;">Bu otomatik bir bildirimdir, lutfen yanit vermeyin.</p>
    </div>
  </div>
</body>
</html>`;
}

// ─── 1. Ihbar Formu - Dogrulama Kodu ────────────────────────────────────
export async function sendVerificationEmail(
  email: string,
  code: string,
  orgName: string
) {
  if (!BREVO_API_KEY) {
    console.log(`[DEV] Verification code for ${email}: ${code}`);
    return;
  }

  const html = emailWrapper(`
    <h2 style="margin:0 0 8px;font-size:18px;color:#111827;">Dogrulama Kodunuz</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#6b7280;">Ihbar formunu doldurmak icin asagidaki kodu kullanin.</p>
    <div style="background:#f0fdf4;border:2px solid #059669;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px;">
      <p style="margin:0;font-size:36px;font-weight:800;letter-spacing:10px;color:#059669;font-family:monospace;">${code}</p>
    </div>
    <p style="margin:0 0 8px;font-size:13px;color:#6b7280;">Bu kod <strong>10 dakika</strong> icerisinde gecerliligi yitirecektir.</p>
    <p style="margin:0;font-size:13px;color:#6b7280;">Bu kodu siz talep etmediyseniz bu e-postayi goz ardi edebilirsiniz.</p>
  `, orgName);

  await sendEmail(email, `${orgName} - Dogrulama Kodunuz: ${code}`, html);
}

// ─── 2. Ekip Uyesi Davet Maili ──────────────────────────────────────────
export async function sendTeamInviteEmail(
  email: string,
  name: string,
  orgName: string,
  token: string,
  appUrl: string
) {
  const inviteUrl = `${appUrl}/auth/accept-invite?token=${token}`;

  if (!BREVO_API_KEY) {
    console.log(`[DEV] Team invite for ${email}: ${inviteUrl}`);
    return;
  }

  const html = emailWrapper(`
    <h2 style="margin:0 0 8px;font-size:18px;color:#111827;">Merhaba ${name},</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#6b7280;"><strong>${orgName}</strong> sizi EthicAll etik ihbar platformuna davet ediyor.</p>
    <div style="text-align:center;margin:0 0 24px;">
      <a href="${inviteUrl}" style="display:inline-block;background:#059669;color:#ffffff;padding:14px 40px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">Daveti Kabul Et</a>
    </div>
    <p style="margin:0 0 8px;font-size:13px;color:#6b7280;">Bu davet <strong>7 gun</strong> icerisinde gecerliligi yitirecektir.</p>
    <p style="margin:0;font-size:12px;color:#9ca3af;word-break:break-all;">Link calismiyorsa: ${inviteUrl}</p>
  `, orgName);

  await sendEmail(email, `${orgName} - Ekip Davetiyesi`, html);
}

// ─── 3. Sifre Degistirme Bildirimi ──────────────────────────────────────
export async function sendPasswordChangedEmail(
  email: string,
  userName: string
) {
  if (!BREVO_API_KEY) {
    console.log(`[DEV] Password changed notification for ${email}`);
    return;
  }

  const now = new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" });

  const html = emailWrapper(`
    <h2 style="margin:0 0 8px;font-size:18px;color:#111827;">Sifreniz Degistirildi</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#6b7280;">Merhaba ${userName}, hesabinizin sifresi basariyla degistirildi.</p>
    <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:0 0 24px;">
      <table style="width:100%;font-size:13px;color:#374151;">
        <tr><td style="padding:4px 0;color:#6b7280;">Tarih:</td><td style="padding:4px 0;text-align:right;font-weight:600;">${now}</td></tr>
        <tr><td style="padding:4px 0;color:#6b7280;">Hesap:</td><td style="padding:4px 0;text-align:right;font-weight:600;">${email}</td></tr>
      </table>
    </div>
    <div style="background:#fef3c7;border:1px solid #f59e0b;border-radius:8px;padding:12px;margin:0 0 16px;">
      <p style="margin:0;font-size:13px;color:#92400e;">Bu islem siz tarafindan yapilmadiysa hemen hesabinizi guvenlik altina alin ve yoneticinize bildirin.</p>
    </div>
  `);

  await sendEmail(email, "EthicAll - Sifreniz Degistirildi", html);
}

// ─── 4. Giris Bildirimi ─────────────────────────────────────────────────
export async function sendLoginNotificationEmail(
  email: string,
  userName: string,
  ipAddress?: string
) {
  if (!BREVO_API_KEY) {
    console.log(`[DEV] Login notification for ${email}`);
    return;
  }

  const now = new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" });

  const html = emailWrapper(`
    <h2 style="margin:0 0 8px;font-size:18px;color:#111827;">Yeni Giris Algilandi</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#6b7280;">Merhaba ${userName}, hesabiniza yeni bir giris yapildi.</p>
    <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:0 0 24px;">
      <table style="width:100%;font-size:13px;color:#374151;">
        <tr><td style="padding:4px 0;color:#6b7280;">Tarih:</td><td style="padding:4px 0;text-align:right;font-weight:600;">${now}</td></tr>
        <tr><td style="padding:4px 0;color:#6b7280;">Hesap:</td><td style="padding:4px 0;text-align:right;font-weight:600;">${email}</td></tr>
        ${ipAddress ? `<tr><td style="padding:4px 0;color:#6b7280;">IP Adresi:</td><td style="padding:4px 0;text-align:right;font-weight:600;">${ipAddress}</td></tr>` : ""}
      </table>
    </div>
    <p style="margin:0;font-size:13px;color:#6b7280;">Bu giris siz tarafindan yapilmadiysa lutfen sifrenizi hemen degistirin.</p>
  `);

  await sendEmail(email, "EthicAll - Yeni Giris Bildirimi", html);
}

// ─── 5. Giris Dogrulama Kodu (2FA) ──────────────────────────────────────
export async function sendLoginOtpEmail(
  email: string,
  code: string,
  userName: string
) {
  if (!BREVO_API_KEY) {
    console.log(`[DEV] Login OTP for ${email}: ${code}`);
    return;
  }

  const html = emailWrapper(`
    <h2 style="margin:0 0 8px;font-size:18px;color:#111827;">Giris Dogrulama Kodu</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#6b7280;">Merhaba ${userName}, hesabiniza giris yapmak icin asagidaki kodu kullanin.</p>
    <div style="background:#f0fdf4;border:2px solid #059669;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px;">
      <p style="margin:0;font-size:36px;font-weight:800;letter-spacing:10px;color:#059669;font-family:monospace;">${code}</p>
    </div>
    <p style="margin:0 0 8px;font-size:13px;color:#6b7280;">Bu kod <strong>5 dakika</strong> icerisinde gecerliligi yitirecektir.</p>
    <p style="margin:0;font-size:13px;color:#6b7280;">Bu kodu siz talep etmediyseniz sifrenizi degistirmenizi oneririz.</p>
  `);

  await sendEmail(email, `EthicAll - Giris Dogrulama Kodunuz: ${code}`, html);
}

// ─── 6. E-posta Degistirme Dogrulama Kodu ───────────────────────────────
export async function sendEmailChangeVerificationEmail(
  newEmail: string,
  code: string,
  userName: string
) {
  if (!BREVO_API_KEY) {
    console.log(`[DEV] Email change verification for ${newEmail}: ${code}`);
    return;
  }

  const html = emailWrapper(`
    <h2 style="margin:0 0 8px;font-size:18px;color:#111827;">E-posta Degisikligi Dogrulama</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#6b7280;">Merhaba ${userName}, e-posta adresinizi degistirmek icin asagidaki kodu kullanin.</p>
    <div style="background:#f0fdf4;border:2px solid #059669;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px;">
      <p style="margin:0;font-size:36px;font-weight:800;letter-spacing:10px;color:#059669;font-family:monospace;">${code}</p>
    </div>
    <p style="margin:0 0 8px;font-size:13px;color:#6b7280;">Bu kod <strong>10 dakika</strong> icerisinde gecerliligi yitirecektir.</p>
    <p style="margin:0;font-size:13px;color:#6b7280;">Bu istegi siz yapmadiyseniz bu e-postayi goz ardi edin.</p>
  `);

  await sendEmail(newEmail, "EthicAll - E-posta Degisikligi Dogrulamasi", html);
}

// ─── 6. Ihbar Alindi Bildirimi (ihbarciya) ──────────────────────────────
export async function sendReportConfirmationEmail(
  email: string,
  trackingCode: string,
  orgName: string
) {
  if (!BREVO_API_KEY) {
    console.log(`[DEV] Report confirmation for ${email}: ${trackingCode}`);
    return;
  }

  const trackUrl = `${APP_URL}/report/track`;

  const html = emailWrapper(`
    <h2 style="margin:0 0 8px;font-size:18px;color:#111827;">Ihbariniz Alindi</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#6b7280;">Ihbariniz basariyla iletildi. Asagidaki takip kodu ile ihbarinizin durumunu sorgulayabilirsiniz.</p>
    <div style="background:#f0fdf4;border:2px solid #059669;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px;">
      <p style="margin:0 0 4px;font-size:12px;color:#6b7280;">Takip Kodunuz</p>
      <p style="margin:0;font-size:28px;font-weight:800;letter-spacing:4px;color:#059669;font-family:monospace;">${trackingCode}</p>
    </div>
    <div style="text-align:center;margin:0 0 24px;">
      <a href="${trackUrl}" style="display:inline-block;background:#059669;color:#ffffff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">Ihbarimi Takip Et</a>
    </div>
    <div style="background:#fef3c7;border:1px solid #f59e0b;border-radius:8px;padding:12px;">
      <p style="margin:0;font-size:13px;color:#92400e;">Bu kodu guvenli bir yerde saklayin. Kimliginiz tamamen gizli tutulmaktadir.</p>
    </div>
  `, orgName);

  await sendEmail(email, `${orgName} - Ihbariniz Alindi (${trackingCode})`, html);
}

// ─── 7. Yeni Ihbar Bildirimi (yoneticilere) ─────────────────────────────
export async function sendNewReportNotificationEmail(
  email: string,
  managerName: string,
  reportTitle: string,
  category: string,
  severity: string,
  orgName: string
) {
  if (!BREVO_API_KEY) {
    console.log(`[DEV] New report notification for ${email}: ${reportTitle}`);
    return;
  }

  const severityLabels: Record<string, string> = {
    LOW: "Dusuk",
    MEDIUM: "Orta",
    HIGH: "Yuksek",
    CRITICAL: "Kritik",
  };
  const severityColors: Record<string, string> = {
    LOW: "#6b7280",
    MEDIUM: "#3b82f6",
    HIGH: "#f97316",
    CRITICAL: "#ef4444",
  };

  const dashUrl = `${APP_URL}/dashboard/reports`;

  const html = emailWrapper(`
    <h2 style="margin:0 0 8px;font-size:18px;color:#111827;">Yeni Ihbar Bildirildi</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#6b7280;">Merhaba ${managerName}, yeni bir etik ihbar alindi.</p>
    <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:0 0 24px;">
      <table style="width:100%;font-size:13px;color:#374151;">
        <tr><td style="padding:4px 0;color:#6b7280;">Baslik:</td><td style="padding:4px 0;text-align:right;font-weight:600;">${reportTitle}</td></tr>
        <tr><td style="padding:4px 0;color:#6b7280;">Kategori:</td><td style="padding:4px 0;text-align:right;font-weight:600;">${category}</td></tr>
        <tr><td style="padding:4px 0;color:#6b7280;">Ciddiyet:</td><td style="padding:4px 0;text-align:right;font-weight:600;color:${severityColors[severity] || "#6b7280"};">${severityLabels[severity] || severity}</td></tr>
      </table>
    </div>
    <div style="text-align:center;margin:0 0 16px;">
      <a href="${dashUrl}" style="display:inline-block;background:#059669;color:#ffffff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">Panelde Incele</a>
    </div>
  `, orgName);

  await sendEmail(email, `${orgName} - Yeni Ihbar: ${reportTitle}`, html);
}
