import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

async function sendEmail({ to, subject, body }) {
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
    throw new Error(`Email failed: ${JSON.stringify(err)}`);
  }
  return res.json();
}

Deno.serve(async (req) => {
  try {

    const { sessionId } = await req.json();

    if (!sessionId) {
      return Response.json({ error: 'Missing session ID' }, { status: 400 });
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return Response.json({ 
        error: 'Payment not completed',
        status: session.payment_status 
      }, { status: 400 });
    }

    // Verify the session is valid and hasn't been processed before
    // (Optional: could add a stored record check here in future)

    // Extract booking details from metadata
    const metadata = session.metadata;
    const currentTime = new Date();
    const expiryTime = new Date(currentTime.getTime() + 48 * 60 * 60 * 1000); // 48 hours

    const packageDetails = {
      type: metadata.package_type || 'Unknown',
      performer: metadata.package_performer || 'Unknown',
      duration: metadata.package_duration || 'Unknown',
      tier: metadata.package_tier || 'Unknown',
      magicians: metadata.package_magicians || '',
      packagePrice: parseFloat(metadata.package_price || '0'),
      addons: metadata.addons || 'None',
      totalInvestment: parseFloat(metadata.total_investment || '0')
    };

    const depositAmount = parseFloat(metadata.deposit_amount);
    const remainingBalance = packageDetails.totalInvestment - depositAmount;

    // Email to customer
    const addonsDisplay = metadata.addons && metadata.addons !== 'None' 
      ? metadata.addons 
      : 'None';
    
    const customerEmailBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Inter', sans-serif; background-color: #f5f5f5; padding: 20px; color: #333; }
    .container { background-color: white; padding: 30px; max-width: 600px; margin: 0 auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.05); }
    .header { text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eee; margin-bottom: 20px; }
    .header img { max-width: 150px; margin-bottom: 15px; }
    .header h1 { font-size: 24px; color: #333; margin: 0; }
    .section { margin-bottom: 20px; }
    .section-title { font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #333; }
    .section-content { margin-left: 20px; line-height: 1.6; }
    .detail-row { margin-bottom: 8px; }
    .highlight { background-color: #fff3cd; padding: 5px 10px; border-radius: 4px; }
    .hold-expiry { background-color: #ffe6e6; padding: 15px; border-left: 4px solid #e74c3c; border-radius: 4px; margin-top: 10px; }
    .footer { text-align: center; padding-top: 20px; margin-top: 30px; border-top: 1px solid #eee; font-size: 12px; color: #777; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9fdb80e10eb3dae94dfbf/705652e3a_logowhitewordstransparent.png" alt="Omni Magic Entertainment">
      <h1>Date Hold Confirmed! 🎉</h1>
    </div>

    <div class="section">
      <div class="section-title">🎭 Your Selected Package</div>
      <div class="section-content">
        <div class="detail-row"><strong>Service Type:</strong> ${metadata.package_type || 'N/A'}</div>
        <div class="detail-row"><strong>Performer:</strong> ${metadata.package_performer || 'N/A'}</div>
        <div class="detail-row"><strong>Duration:</strong> ${metadata.package_duration || 'N/A'}</div>
        <div class="detail-row"><strong>Experience Tier:</strong> ${metadata.package_tier || 'N/A'}</div>
        ${metadata.package_magicians ? `<div class="detail-row"><strong>Number of Magicians:</strong> ${metadata.package_magicians}</div>` : ''}
        <div class="detail-row"><strong>Package Price:</strong> $${parseFloat(metadata.package_price || '0').toLocaleString()}</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">✨ Add-Ons</div>
      <div class="section-content">
        <div class="detail-row">${addonsDisplay}</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">📅 Event Details</div>
      <div class="section-content">
        <div class="detail-row"><strong>Event Date:</strong> ${metadata.event_date || 'N/A'}</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">💰 Payment Summary</div>
      <div class="section-content">
        <div class="detail-row"><strong>Deposit Paid:</strong> <span class="highlight">$${depositAmount.toLocaleString()}</span></div>
        <div class="detail-row"><strong>Remaining Balance:</strong> $${remainingBalance.toLocaleString()}</div>
        <div class="detail-row"><strong>Total Investment:</strong> $${parseFloat(metadata.total_investment || '0').toLocaleString()}</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">⏰ Your Hold Expires In 48 Hours</div>
      <div class="hold-expiry">
        <p style="margin: 0 0 10px 0; font-weight: bold; color: #e74c3c;">
          Your date hold expires on:
        </p>
        <p style="margin: 0; font-size: 18px; font-weight: bold; color: #333;">
          ${expiryTime.toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </p>
        <p style="margin: 10px 0 0 0; font-size: 13px; color: #666;">
          Please complete your full payment before this time to secure your booking.
        </p>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Next Steps</div>
      <div class="section-content">
        <p>To finalize your booking and secure your date:</p>
        <div style="background-color: #f0f4ff; padding: 15px; border-left: 4px solid #3b82f6; border-radius: 4px; margin-top: 10px;">
          <p><strong>1.</strong> Complete the remaining balance of <strong>$${remainingBalance.toLocaleString()}</strong></p>
          <p><strong>2.</strong> Contact us at <a href="mailto:hello@omnimagic.co">hello@omnimagic.co</a> to finalize payment</p>
          <p><strong>3.</strong> We'll send you the official contract once payment is received</p>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Questions?</div>
      <div class="section-content">
        <p>If you have any questions about your booking or need to make changes, please contact us:</p>
        <p><strong>Email:</strong> <a href="mailto:hello@omnimagic.co">hello@omnimagic.co</a></p>
      </div>
    </div>

    <div class="footer">
      &copy; 2025 Omni Magic Entertainment. All rights reserved.
    </div>
  </div>
</body>
</html>
    `;

    // Send confirmation email to customer (use service role to allow external recipients)
    await sendEmail({
      to: metadata.customer_email,
      subject: `✨ Your Date Hold Confirmed - Omni Magic Entertainment`,
      body: customerEmailBody
    });

    await sendEmail({
      to: 'hello@omnimagic.co',
      subject: `✨ Date Hold Confirmation - ${metadata.customer_name}`,
      body: customerEmailBody
    });

    // Email to business
    const businessEmailBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Courier New', monospace; background-color: #f5f5f5; padding: 20px; }
    .container { background-color: white; padding: 30px; max-width: 700px; margin: 0 auto; border: 2px solid #333; }
    .header { text-align: center; border-top: 3px solid #333; border-bottom: 3px solid #333; padding: 15px 0; margin-bottom: 30px; font-size: 20px; font-weight: bold; }
    .section { margin-bottom: 25px; }
    .section-title { font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #333; }
    .section-content { margin-left: 20px; line-height: 1.8; }
    .highlight { background-color: #fff3cd; padding: 2px 5px; }
    .footer { text-align: center; border-top: 3px solid #333; border-bottom: 3px solid #333; padding: 15px 0; margin-top: 30px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      💳 NEW DEPOSIT PAYMENT RECEIVED
    </div>

    <div class="section">
      <div class="section-title">💰 Payment Details</div>
      <div class="section-content">
        <div><strong>Deposit Amount:</strong> <span class="highlight">$${depositAmount.toLocaleString()}</span></div>
        <div><strong>Payment Method:</strong> Stripe (Credit Card)</div>
        <div><strong>Status:</strong> ✓ Paid</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">👤 Customer Information</div>
      <div class="section-content">
        <div><strong>Name:</strong> ${metadata.customer_name}</div>
        <div><strong>Email:</strong> ${metadata.customer_email}</div>
        <div><strong>Phone:</strong> ${metadata.customer_phone || 'N/A'}</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">📅 Event Details</div>
      <div class="section-content">
        <div><strong>Date:</strong> ${metadata.event_date || 'N/A'}</div>
        <div><strong>Service Type:</strong> ${metadata.package_type || 'N/A'}</div>
        <div><strong>Performer:</strong> ${metadata.package_performer || 'N/A'}</div>
        <div><strong>Duration:</strong> ${metadata.package_duration || 'N/A'}</div>
        <div><strong>Tier:</strong> ${metadata.package_tier || 'N/A'}</div>
        ${metadata.package_magicians ? `<div><strong>Magicians:</strong> ${metadata.package_magicians}</div>` : ''}
      </div>
    </div>

    <div class="section">
      <div class="section-title">💵 Pricing Breakdown</div>
      <div class="section-content">
        <div><strong>Package Price:</strong> $${parseFloat(metadata.package_price || '0').toLocaleString()}</div>
        <div><strong>Add-ons:</strong> ${metadata.addons || 'None'}</div>
        <div><strong>Total Investment:</strong> $${parseFloat(metadata.total_investment || '0').toLocaleString()}</div>
        <div style="border-top: 2px solid #333; margin: 10px 0; padding-top: 10px;">
          <strong>Deposit Received: <span class="highlight">$${depositAmount.toLocaleString()}</span></strong>
        </div>
        <div><strong>Remaining Balance:</strong> $${remainingBalance.toLocaleString()}</div>
      </div>
    </div>

    ${metadata.additional_notes ? `
    <div class="section">
      <div class="section-title">📝 Customer Notes</div>
      <div class="section-content">
        ${metadata.additional_notes}
      </div>
    </div>
    ` : ''}

    <div class="footer">
      Omni Magic Entertainment System
    </div>
  </div>
</body>
</html>
    `;

    await sendEmail({
      to: 'johnnywuevents@gmail.com',
      subject: `💳 Deposit Received - ${metadata.customer_name} (${metadata.event_date || 'Date TBD'})`,
      body: businessEmailBody
    });

    return Response.json({ 
      success: true,
      expiryTime: expiryTime.toISOString(),
      customerEmail: metadata.customer_email,
      depositAmount: parseFloat(metadata.deposit_amount)
    });
  } catch (error) {
    console.error('Error handling Stripe success:', error);
    return Response.json({ 
      error: error.message || 'Failed to process payment confirmation' 
    }, { status: 500 });
  }
});