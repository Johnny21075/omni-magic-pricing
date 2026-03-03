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

    const { 
      customerName,
      customerEmail,
      customerPhone,
      eventDate,
      packageDetails,
      depositAmount,
      totalInvestment,
      additionalNotes,
      holdExpiryTime,
      requestTime,
      paymentMethod
    } = await req.json();

    if (!customerName || !customerEmail || !packageDetails || !depositAmount) {
      return Response.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    const formatDate = (dateStr) => {
      if (!dateStr) return 'Not specified';
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    };

    const formatDateTime = (dateStr) => {
      if (!dateStr) return 'Not specified';
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    };

    // Send email to business
    const addonsHtml = packageDetails.addons && packageDetails.addons !== 'None' 
      ? packageDetails.addons.split(', ').map(addon => `<div style="margin-left: 20px;">• ${addon}</div>`).join('')
      : '<div style="margin-left: 20px;">None</div>';

    const nextStepsHtml = paymentMethod === 'Stripe'
      ? `<div style="margin-left: 20px;">• Payment completed via Stripe ($${depositAmount.toLocaleString()})</div>
         <div style="margin-left: 20px;">• Date secured for 48 hours</div>
         <div style="margin-left: 20px;">• Send confirmation email to customer</div>`
      : `<div style="margin-left: 20px;">• Collect $${depositAmount.toLocaleString()} deposit via ${paymentMethod}</div>
         <div style="margin-left: 20px;">• Date held for 48 hours (expires: ${formatDateTime(holdExpiryTime)})</div>
         <div style="margin-left: 20px;">• Send payment instructions to customer</div>`;

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
      🗓️ NEW DATE HOLD REQUEST
    </div>

    <div class="section">
      <div class="section-title">📋 REQUEST DETAILS</div>
      <div class="section-content">
        <div><strong>Type:</strong> Hold Request</div>
        <div><strong>Requested At:</strong> ${new Date(requestTime).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</div>
        <div><strong>Deposit Required:</strong> <span class="highlight">$${depositAmount.toLocaleString()}</span> (10% of total)</div>
        <div><strong>Payment Method:</strong> ${paymentMethod}</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">📅 EVENT DETAILS</div>
      <div class="section-content">
        <div><strong>Date:</strong> ${formatDate(eventDate)}</div>
        <div><strong>Performer:</strong> ${packageDetails.performer}</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">🎭 PACKAGE DETAILS</div>
      <div class="section-content">
        <div><strong>Service Type:</strong> ${packageDetails.type}</div>
        <div><strong>Duration:</strong> ${packageDetails.duration}</div>
        ${packageDetails.magicians ? `<div><strong>Magicians:</strong> ${packageDetails.magicians}</div>` : ''}
        <div><strong>Tier:</strong> ${packageDetails.tier}</div>
        <div><strong>Package Price:</strong> $${packageDetails.packagePrice.toLocaleString()}</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">✨ ADD-ONS</div>
      ${addonsHtml}
    </div>

    <div class="section">
      <div class="section-title">💰 PRICING SUMMARY</div>
      <div class="section-content">
        <div>Package Price: $${packageDetails.packagePrice.toLocaleString()}</div>
        <div>Add-ons Total: $${(totalInvestment - packageDetails.packagePrice).toLocaleString()}</div>
        <div style="border-top: 2px solid #333; margin: 10px 0; padding-top: 10px;">
          <strong>TOTAL INVESTMENT: <span class="highlight">$${totalInvestment.toLocaleString()}</span></strong>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">👤 CUSTOMER INFORMATION</div>
      <div class="section-content">
        <div><strong>Name:</strong> ${customerName}</div>
        <div><strong>Email:</strong> ${customerEmail}</div>
        <div><strong>Phone:</strong> ${customerPhone || 'Not provided'}</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">📝 NOTES</div>
      <div class="section-content">
        ${additionalNotes || 'None'}
      </div>
    </div>

    <div class="section">
      <div class="section-title">📌 NEXT STEPS</div>
      ${nextStepsHtml}
    </div>

    <div class="footer">
      Omni Magic Entertainment System
    </div>
  </div>
</body>
</html>
`;

    await sendEmail({
      to: 'hello@omnimagic.co',
      subject: `🗓️ New Date Hold Request (${formatDate(eventDate)})`,
      body: businessEmailBody
    });

    // Send email to customer with same HTML format
    const customerEmailBody = `
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
      🗓️ NEW DATE HOLD REQUEST
    </div>

    <div class="section">
      <div class="section-title">📋 REQUEST DETAILS</div>
      <div class="section-content">
        <div><strong>Type:</strong> Hold Request</div>
        <div><strong>Requested At:</strong> ${new Date(requestTime).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</div>
        <div><strong>Deposit Required:</strong> <span class="highlight">$${depositAmount.toLocaleString()}</span> (10% of total)</div>
        <div><strong>Payment Method:</strong> ${paymentMethod}</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">📅 EVENT DETAILS</div>
      <div class="section-content">
        <div><strong>Date:</strong> ${formatDate(eventDate)}</div>
        <div><strong>Performer:</strong> ${packageDetails.performer}</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">🎭 PACKAGE DETAILS</div>
      <div class="section-content">
        <div><strong>Service Type:</strong> ${packageDetails.type}</div>
        <div><strong>Duration:</strong> ${packageDetails.duration}</div>
        ${packageDetails.magicians ? `<div><strong>Magicians:</strong> ${packageDetails.magicians}</div>` : ''}
        <div><strong>Tier:</strong> ${packageDetails.tier}</div>
        <div><strong>Package Price:</strong> $${packageDetails.packagePrice.toLocaleString()}</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">✨ ADD-ONS</div>
      ${addonsHtml}
    </div>

    <div class="section">
      <div class="section-title">💰 PRICING SUMMARY</div>
      <div class="section-content">
        <div>Package Price: $${packageDetails.packagePrice.toLocaleString()}</div>
        <div>Add-ons Total: $${(totalInvestment - packageDetails.packagePrice).toLocaleString()}</div>
        <div style="border-top: 2px solid #333; margin: 10px 0; padding-top: 10px;">
          <strong>TOTAL INVESTMENT: <span class="highlight">$${totalInvestment.toLocaleString()}</span></strong>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">👤 CUSTOMER INFORMATION</div>
      <div class="section-content">
        <div><strong>Name:</strong> ${customerName}</div>
        <div><strong>Email:</strong> ${customerEmail}</div>
        <div><strong>Phone:</strong> ${customerPhone || 'Not provided'}</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">📝 NOTES</div>
      <div class="section-content">
        ${additionalNotes || 'None'}
      </div>
    </div>

    <div class="section">
      <div class="section-title">📌 NEXT STEPS</div>
      ${paymentMethod === 'Stripe'
        ? `<div style="margin-left: 20px;">• Payment completed via Stripe ($${depositAmount.toLocaleString()})</div>
           <div style="margin-left: 20px;">• Date secured for 48 hours</div>
           <div style="margin-left: 20px;">• We will reach out shortly to finalize event details</div>`
        : `<div style="margin-left: 20px;">• Complete your $${depositAmount.toLocaleString()} deposit via ${paymentMethod}</div>
           <div style="margin-left: 20px;">• Date held for 48 hours (expires: ${formatDateTime(holdExpiryTime)})</div>
           <div style="margin-left: 20px;">• Send payment confirmation to hello@omnimagic.co</div>`
      }
    </div>

    <div class="footer">
      Omni Magic Entertainment System
    </div>
  </div>
</body>
</html>
`;

    await sendEmail({
      to: customerEmail,
      subject: `🗓️ Your Omni Magic Date Hold Confirmation`,
      body: customerEmailBody
    });

    return Response.json({ 
      success: true,
      message: 'Confirmation emails sent successfully'
    });
  } catch (error) {
    console.error('Error sending confirmation emails:', error);
    return Response.json({ 
      error: error.message || 'Failed to send confirmation emails' 
    }, { status: 500 });
  }
});