import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, link: string){
  const result = await resend.emails.send({
    from: process.env.MATCHINGG_EMAIL!,
    to: email,
    subject: 'This is your email verification link',
    html: `<p>${link}</p>`
  })
}