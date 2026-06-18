import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false, // STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send an invite email. The link contains a one-time token.
 * Subject line is deliberately vague — no mention of the platform.
 */
export async function sendInviteEmail(opts: {
  to: string;
  name: string;
  token: string;
}): Promise<void> {
  const link = `${process.env.NEXT_PUBLIC_APP_URL}/${process.env.VAULT_SLUG}/join/${opts.token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: opts.to,
    // Deliberately generic subject — no platform name
    subject: "You have been invited",
    text: `
Hi ${opts.name},

You have been invited to join a private space.

Click the link below to set up your access. This link is personal to you and expires in 72 hours.

${link}

Do not share this link with anyone.

If you did not expect this email, you can ignore it.
    `.trim(),
    html: `
<p>Hi ${opts.name},</p>
<p>You have been invited to join a private space.</p>
<p>
  <a href="${link}" style="
    display:inline-block;
    padding:12px 24px;
    background:#1a1a1a;
    color:#fff;
    text-decoration:none;
    border-radius:6px;
  ">Accept Invitation</a>
</p>
<p style="font-size:13px;color:#666;">
  This link is personal to you and expires in 72 hours.<br>
  Do not share it with anyone.
</p>
<p style="font-size:13px;color:#999;">
  If you did not expect this email, you can ignore it.
</p>
    `,
  });
}
