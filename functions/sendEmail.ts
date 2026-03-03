// Shared email sending utility using Resend
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

export async function sendEmail({ to, subject, body }) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: "Omni Magic <noreply@omnimagic.co>",
      to: [to],
      subject,
      html: body
    })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Email send failed: ${JSON.stringify(err)}`);
  }

  return await res.json();
}