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
    const businessEmailBody = {
      type: "new_date_hold_request",
      requested_at: new Date(requestTime).toISOString(),
      hold_expires_at: new Date(holdExpiryTime).toISOString(),
      hold_hours: 48,
      deposit_required: depositAmount,
      deposit_percentage: 10,
      payment_method: paymentMethod,
      event: {
        date: eventDate,
        performer: packageDetails.performer
      },
      package: {
        type: packageDetails.type,
        duration: packageDetails.duration,
        magicians: packageDetails.magicians || null,
        tier: packageDetails.tier,
        price: packageDetails.packagePrice
      },
      add_ons: packageDetails.addons && packageDetails.addons !== 'None' ? packageDetails.addons.split(', ') : [],
      pricing: {
        package_price: packageDetails.packagePrice,
        add_ons_total: totalInvestment - packageDetails.packagePrice,
        total: totalInvestment
      },
      customer: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone || null
      },
      notes: additionalNotes || null,
      next_steps: [
        paymentMethod === 'Stripe' ? 'Payment completed via Stripe – date secured' : `Contact client to collect $${depositAmount.toLocaleString()} deposit (${paymentMethod})`,
        "Secure the date",
        "Send confirmation email with payment details"
      ]
    };

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: 'hello@omnimagic.co',
      subject: `🗓️ New Date Hold Request (${formatDate(eventDate)})`,
      body: JSON.stringify(businessEmailBody, null, 2)
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