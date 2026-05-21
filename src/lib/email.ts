import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const emailFrom = process.env.EMAIL_FROM || "noreply@ethicall.com";

export async function sendVerificationEmail(
  email: string,
  code: string,
  orgName: string
) {
  if (!resend) {
    console.log(`[DEV] Verification code for ${email}: ${code}`);
    return;
  }

  await resend.emails.send({
    from: emailFrom,
    to: email,
    subject: `${orgName} - Doğrulama Kodunuz / Your Verification Code`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Doğrulama Kodunuz / Your Verification Code</h2>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; background: #f3f4f6; padding: 20px; border-radius: 8px;">${code}</p>
        <p>Bu kod 10 dakika içinde geçerliliğini yitirecektir.</p>
        <p style="color: #6b7280;">This code will expire in 10 minutes.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="font-size: 12px; color: #9ca3af;">EthicAll - Anonim Etik İhbar Platformu</p>
      </div>
    `,
  });
}

export async function sendTeamInviteEmail(
  email: string,
  name: string,
  orgName: string,
  token: string,
  appUrl: string
) {
  const inviteUrl = `${appUrl}/auth/accept-invite?token=${token}`;

  if (!resend) {
    console.log(`[DEV] Team invite for ${email}: ${inviteUrl}`);
    return;
  }

  await resend.emails.send({
    from: emailFrom,
    to: email,
    subject: `${orgName} - Ekip Davetiyesi`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Merhaba ${name},</h2>
        <p>${orgName} sizi EthicAll etik ihbar platformuna davet ediyor.</p>
        <p>Davetinizi kabul etmek ve hesabinizi olusturmak icin asagidaki butona tiklayin:</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${inviteUrl}" style="background: #059669; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">Daveti Kabul Et</a>
        </div>
        <p style="font-size: 12px; color: #6b7280;">Bu davet 7 gun icerisinde gecerliliğini yitirecektir.</p>
        <p style="font-size: 12px; color: #6b7280;">Link calismiyorsa bu URL'yi kopyalayin: ${inviteUrl}</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="font-size: 12px; color: #9ca3af;">EthicAll - Anonim Etik Ihbar Platformu</p>
      </div>
    `,
  });
}
