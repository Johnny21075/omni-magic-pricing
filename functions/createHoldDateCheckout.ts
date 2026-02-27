import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  try {
    const { 
      amount, 
      customerEmail, 
      customerName,
      packageDetails,
      eventDate,
      phone,
      additionalNotes
    } = await req.json();

    if (!amount || !customerEmail || !customerName) {
      return Response.json({ 
        error: 'Missing required fields: amount, customerEmail, customerName' 
      }, { status: 400 });
    }

    // Get the app host from the request
    const host = req.headers.get('origin') || 'https://omnimagic.base44.com';
    
    // Construct the base URL for the pricing page
    const urlParams = new URL(req.headers.get('referer') || host);
    const eventType = urlParams.searchParams.get('eventType') || '';
    const eventSize = urlParams.searchParams.get('eventSize') || '';
    const eventScale = urlParams.searchParams.get('eventScale') || '';
    
    let pricingUrl = `${host}`;
    if (eventType) {
      const params = new URLSearchParams();
      params.set('eventType', eventType);
      if (eventSize) params.set('eventSize', eventSize);
      if (eventScale) params.set('eventScale', eventScale);
      pricingUrl = `${host}?${params.toString()}`;
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'us_bank_account'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Hold Date Deposit - ${packageDetails?.type || 'Event'}`,
              description: `10% deposit to hold your date for ${eventDate || 'your event'}`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${pricingUrl}${pricingUrl.includes('?') ? '&' : '?'}payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${pricingUrl}${pricingUrl.includes('?') ? '&' : '?'}payment=cancelled`,
      customer_email: customerEmail,
      metadata: {
        type: 'hold_date_deposit',
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: phone || '',
        event_date: eventDate || '',
        package_type: packageDetails?.type || '',
        package_performer: packageDetails?.performer || '',
        package_duration: packageDetails?.duration || '',
        package_tier: packageDetails?.tier || '',
        package_magicians: packageDetails?.magicians || '',
        package_price: packageDetails?.packagePrice || '',
        addons: packageDetails?.addons || '',
        total_investment: packageDetails?.totalInvestment || '',
        deposit_amount: amount.toString(),
        additional_notes: additionalNotes || '',
      },
    });

    return Response.json({ 
      sessionId: session.id,
      url: session.url 
    });
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    return Response.json({ 
      error: error.message || 'Failed to create checkout session' 
    }, { status: 500 });
  }
});