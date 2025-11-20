import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

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
    const addonsText = packageDetails.addons && packageDetails.addons !== 'None' 
      ? packageDetails.addons.split(', ').map(addon => `  - ${addon}`).join('\n')
      : '  None';

    const nextStepsText = paymentMethod === 'Stripe'
      ? `  - Payment completed via Stripe ($${depositAmount.toLocaleString()})
  - Date secured for 48 hours
  - Send confirmation email to customer`
      : `  - Collect $${depositAmount.toLocaleString()} deposit via ${paymentMethod}
  - Date held for 48 hours (expires: ${formatDateTime(holdExpiryTime)})
  - Send payment instructions to customer`;

    const businessEmailBody = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🗓️  NEW DATE HOLD REQUEST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 REQUEST DETAILS
  Type: Hold Request
  Requested At: ${new Date(requestTime).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}
  Deposit Required: $${depositAmount.toLocaleString()} (10% of total)
  Payment Method: ${paymentMethod}

📅 EVENT DETAILS
  Date: ${formatDate(eventDate)}
  Performer: ${packageDetails.performer}

🎭 PACKAGE DETAILS
  Service Type: ${packageDetails.type}
  Duration: ${packageDetails.duration}
  ${packageDetails.magicians ? `Magicians: ${packageDetails.magicians}` : ''}
  Tier: ${packageDetails.tier}
  Package Price: $${packageDetails.packagePrice.toLocaleString()}

✨ ADD-ONS
${addonsText}

💰 PRICING SUMMARY
  Package Price: $${packageDetails.packagePrice.toLocaleString()}
  Add-ons Total: $${(totalInvestment - packageDetails.packagePrice).toLocaleString()}
  ─────────────────────
  TOTAL INVESTMENT: $${totalInvestment.toLocaleString()}

👤 CUSTOMER INFORMATION
  Name: ${customerName}
  Email: ${customerEmail}
  Phone: ${customerPhone || 'Not provided'}

📝 NOTES
  ${additionalNotes || 'None'}

📌 NEXT STEPS
${nextStepsText}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Omni Magic Entertainment System
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: 'hello@omnimagic.co',
      subject: `🗓️ New Date Hold Request (${formatDate(eventDate)})`,
      body: businessEmailBody
    });

    // Send email to customer
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: customerEmail,
      subject: `🗓️ Your Omni Magic Date Hold Confirmation`,
      body: `
Dear ${customerName},

Thank you for choosing Omni Magic Entertainment!

${paymentMethod === 'Stripe' 
  ? `Your deposit payment of $${depositAmount.toLocaleString()} has been successfully processed.` 
  : `We have received your request to hold the date. Please complete your deposit payment of $${depositAmount.toLocaleString()} via ${paymentMethod}.`
}

Your selected package details:
------------------------------------------------------
  Service Type:          ${packageDetails.type}
  Event Date:            ${formatDate(eventDate)}
  Total Investment:      $${totalInvestment.toLocaleString()}
  Deposit Amount:        $${depositAmount.toLocaleString()}
------------------------------------------------------

${paymentMethod !== 'Stripe' ? `
Payment Instructions:

${paymentMethod === 'Zelle' ? 'Zelle: Send to 626-242-7710' : 'Venmo: Send to @johnnywumagic (https://venmo.com/u/johnnywumagic)'}

Please complete your payment within 48 hours to secure your booking.
` : ''}

Your date is now held until ${formatDateTime(holdExpiryTime)}.

We will reach out shortly to finalize all the details for your event.

If you have any questions, please don't hesitate to reply to this email or call us at 626-242-7710.

We look forward to making your event truly magical!

Sincerely,

The Omni Magic Team
www.omnimagic.co
`
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