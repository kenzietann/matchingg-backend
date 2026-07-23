import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function verificationEmailHtml(link: string): string {
  return `
<!DOCTYPE html>
<html>
  <body style="margin:0; padding:0; background-color:#e2e8f0; font-family: 'Montserrat', 'Helvetica Neue', Arial, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#e2e8f0; padding: 40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px; width:100%; background-color:#e2e8f0; border-radius:14px; box-shadow: 6px 6px 16px #b8c2cc, -6px -6px 16px #ffffff;">
            <tr>
              <td style="padding: 36px 36px 28px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="width:40px; height:40px; background-color:#e2e8f0; border-radius:8px; box-shadow: 3px 3px 8px #b8c2cc, -3px -3px 8px #ffffff; text-align:center; vertical-align:middle;">
                      <span style="font-size:18px; font-weight:700; color:#1e293b;">M</span>
                    </td>
                    <td style="padding-left:10px;">
                      <span style="font-size:17px; font-weight:700; color:#1e293b; letter-spacing:-0.5px;">matchin<span style="color:#0f766e;">gg</span></span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 0 36px;">
                <h1 style="margin:0 0 12px; font-size:22px; font-weight:800; color:#1e293b;">Verify your email</h1>
                <p style="margin:0 0 24px; font-size:14px; line-height:1.6; color:#64748b;">
                  Thanks for signing up for Matchingg. Click the button below to verify your email address and activate your account. This link expires in 15 minutes.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 0 36px;">
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td align="center" style="border-radius:6px; background-color:#0f766e;">
                      <a href="${link}" style="display:block; padding:13px 24px; font-size:14px; font-weight:700; color:#ffffff; text-decoration:none;">
                        Verify email address &rarr;
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 24px 36px 8px;">
                <p style="margin:0; font-size:12px; line-height:1.6; color:#94a3b8;">
                  Or copy and paste this link into your browser:<br>
                  <a href="${link}" style="color:#0f766e; word-break:break-all;">${link}</a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 20px 36px 32px;">
                <p style="margin:0; font-size:12px; color:#94a3b8;">
                  If you didn't create a Matchingg account, you can safely ignore this email.
                </p>
              </td>
            </tr>
          </table>
          <p style="margin:20px 0 0; font-size:11px; color:#94a3b8;">&copy; ${new Date().getFullYear()} Matchingg. All rights reserved.</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendVerificationEmail(email: string, link: string){
  const result = await resend.emails.send({
    from: process.env.MATCHINGG_EMAIL!,
    to: email,
    subject: 'Verify your Matchingg account',
    html: verificationEmailHtml(link)
  });

  if (result.error) {
    throw new Error(`Failed to send verification email: ${result.error.message}`);
  }
}

function passwordResetEmailHtml(link: string): string {
  return `
<!DOCTYPE html>
<html>
  <body style="margin:0; padding:0; background-color:#e2e8f0; font-family: 'Montserrat', 'Helvetica Neue', Arial, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#e2e8f0; padding: 40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px; width:100%; background-color:#e2e8f0; border-radius:14px; box-shadow: 6px 6px 16px #b8c2cc, -6px -6px 16px #ffffff;">
            <tr>
              <td style="padding: 36px 36px 28px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="width:40px; height:40px; background-color:#e2e8f0; border-radius:8px; box-shadow: 3px 3px 8px #b8c2cc, -3px -3px 8px #ffffff; text-align:center; vertical-align:middle;">
                      <span style="font-size:18px; font-weight:700; color:#1e293b;">M</span>
                    </td>
                    <td style="padding-left:10px;">
                      <span style="font-size:17px; font-weight:700; color:#1e293b; letter-spacing:-0.5px;">matchin<span style="color:#0f766e;">gg</span></span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 0 36px;">
                <h1 style="margin:0 0 12px; font-size:22px; font-weight:800; color:#1e293b;">Reset your password</h1>
                <p style="margin:0 0 24px; font-size:14px; line-height:1.6; color:#64748b;">
                  We received a request to reset your Matchingg password. Click the button below to choose a new one. This link expires in 15 minutes.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 0 36px;">
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td align="center" style="border-radius:6px; background-color:#0f766e;">
                      <a href="${link}" style="display:block; padding:13px 24px; font-size:14px; font-weight:700; color:#ffffff; text-decoration:none;">
                        Reset password &rarr;
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 24px 36px 8px;">
                <p style="margin:0; font-size:12px; line-height:1.6; color:#94a3b8;">
                  Or copy and paste this link into your browser:<br>
                  <a href="${link}" style="color:#0f766e; word-break:break-all;">${link}</a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 20px 36px 32px;">
                <p style="margin:0; font-size:12px; color:#94a3b8;">
                  If you didn't request a password reset, you can safely ignore this email — your password will not be changed.
                </p>
              </td>
            </tr>
          </table>
          <p style="margin:20px 0 0; font-size:11px; color:#94a3b8;">&copy; ${new Date().getFullYear()} Matchingg. All rights reserved.</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendPasswordResetEmail(email: string, link: string){
  const result = await resend.emails.send({
    from: process.env.MATCHINGG_EMAIL!,
    to: email,
    subject: 'Reset your Matchingg password',
    html: passwordResetEmailHtml(link)
  });

  if (result.error) {
    throw new Error(`Failed to send password reset email: ${result.error.message}`);
  }
}

function contactEmailHtml(fromEmail: string, message: string): string {
  const escaped = message
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');

  return `
<!DOCTYPE html>
<html>
  <body style="margin:0; padding:0; background-color:#e2e8f0; font-family: 'Montserrat', 'Helvetica Neue', Arial, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#e2e8f0; padding: 40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px; width:100%; background-color:#e2e8f0; border-radius:14px; box-shadow: 6px 6px 16px #b8c2cc, -6px -6px 16px #ffffff;">
            <tr>
              <td style="padding: 36px 36px 28px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="width:40px; height:40px; background-color:#e2e8f0; border-radius:8px; box-shadow: 3px 3px 8px #b8c2cc, -3px -3px 8px #ffffff; text-align:center; vertical-align:middle;">
                      <span style="font-size:18px; font-weight:700; color:#1e293b;">M</span>
                    </td>
                    <td style="padding-left:10px;">
                      <span style="font-size:17px; font-weight:700; color:#1e293b; letter-spacing:-0.5px;">matchin<span style="color:#0f766e;">gg</span></span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 0 36px;">
                <h1 style="margin:0 0 12px; font-size:22px; font-weight:800; color:#1e293b;">New contact form message</h1>
                <p style="margin:0 0 4px; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:#94a3b8;">From</p>
                <p style="margin:0 0 20px; font-size:14px; color:#1e293b;">${fromEmail}</p>
                <p style="margin:0 0 4px; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:#94a3b8;">Message</p>
                <p style="margin:0 0 24px; font-size:14px; line-height:1.6; color:#64748b;">${escaped}</p>
              </td>
            </tr>
          </table>
          <p style="margin:20px 0 0; font-size:11px; color:#94a3b8;">&copy; ${new Date().getFullYear()} Matchingg. All rights reserved.</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendContactMessage(fromEmail: string, message: string){
  const result = await resend.emails.send({
    from: process.env.MATCHINGG_EMAIL!,
    to: process.env.CONTACT_EMAIL || 'tandera.kenzie@gmail.com',
    replyTo: fromEmail,
    subject: `New contact form message from ${fromEmail}`,
    html: contactEmailHtml(fromEmail, message)
  });

  if (result.error) {
    throw new Error(`Failed to send contact message: ${result.error.message}`);
  }
}