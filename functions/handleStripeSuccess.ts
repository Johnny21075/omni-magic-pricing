import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    // Send confirmation emails
    await base44.asServiceRole.functions.invoke('sendHoldDateConfirmation', {
      customerName: metadata.customer_name,
      customerEmail: metadata.customer_email,
      customerPhone: metadata.customer_phone,
      eventDate: metadata.event_date,
      packageDetails: packageDetails,
      depositAmount: parseFloat(metadata.deposit_amount),
      totalInvestment: packageDetails.totalInvestment,
      additionalNotes: metadata.additional_notes,
      holdExpiryTime: expiryTime.toISOString(),
      requestTime: currentTime.toISOString(),
      paymentMethod: 'Stripe'
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