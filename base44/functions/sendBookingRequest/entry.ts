const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

async function sendEmail({ to, subject, body }) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: "Omni Magic <hello@omnimagic.co>",
      to: [to],
      subject,
      html: body
    })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Email failed: ${JSON.stringify(err)}`);
  }
  return res.json();
}

Deno.serve(async (req) => {
  try {
    const { businessEmailBody, customerName, customerEmail, subject } = await req.json();

    if (!customerEmail || !businessEmailBody) {
      return Response.json({ error: 'Missing required fields: businessEmailBody, customerEmail' }, { status: 400 });
    }

    const bizSubject = subject || '📋 New Booking Request';

    // Notify the business inbox
    await sendEmail({ to: 'hello@omnimagic.co', subject: bizSubject, body: businessEmailBody });
    await sendEmail({ to: 'johnnywuevents@gmail.com', subject: bizSubject, body: businessEmailBody });

    // Send confirmation to the customer
    const customerBody = `
<!DOCTYPE html><html><head><style>
body{font-family:'Inter',Arial,sans-serif;background:#f5f5f5;padding:20px;color:#333;}
.container{background:white;padding:30px;max-width:600px;margin:0 auto;border-radius:8px;box-shadow:0 2px 6px rgba(0,0,0,0.05);}
h1{font-size:22px;color:#333;margin-top:0;}
a{color:#d97706;}
</style></head><body><div class="container">
<h1>✨ Hi ${customerName},</h1>
<p>We've received your booking request and will send you an official contract and invoice within 24 hours.</p>
<p>Questions? Email us at <a href="mailto:hello@omnimagic.co">hello@omnimagic.co</a></p>
<p>– The Omni Magic Team</p>
</div></body></html>`;

    await sendEmail({ to: customerEmail, subject: '✨ Your Omni Magic Booking Request Received!', body: customerBody });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error sending booking request emails:', error);
    return Response.json({ error: error.message || 'Failed to send emails' }, { status: 500 });
  }
});