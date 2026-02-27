import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
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

    // Extract gratuity details from metadata
    const metadata = session.metadata;
    const amount = session.amount_total / 100; // Convert from cents

    // Send notification email to business
    const emailBody = `New Gratuity Payment Received\n\nCustomer Email: ${metadata.customer_email}\nGratuity Amount: $${amount}\nPerformer Name: ${metadata.performer_name || 'Omni Magic Entertainment'}\n${metadata.company_name ? `Company Name: ${metadata.company_name}\n` : ''}Customer Message: ${metadata.customer_message || 'No message provided'}\nWants Poster: ${metadata.wants_poster === 'true' ? 'Yes' : 'No'}`;
    
    await base44.integrations.Core.SendEmail({
      to: 'hello@omnimagic.co',
      subject: `Gratuity Payment Received - ${metadata.customer_email}`,
      body: emailBody
    });

    return Response.json({ 
      success: true,
      customerEmail: metadata.customer_email,
      amount: amount
    });
  } catch (error) {
    console.error('Error handling gratuity success:', error);
    return Response.json({ 
      error: error.message || 'Failed to process payment confirmation' 
    }, { status: 500 });
  }
});