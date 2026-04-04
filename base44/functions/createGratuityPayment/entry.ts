import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import Stripe from 'npm:stripe@14.11.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        let user = null;
        try {
            user = await base44.auth.me();
        } catch (authError) {
            console.log('User not authenticated, proceeding with gratuity payment anyway');
        }

        const body = await req.json();
        const { amount, customerEmail, address, performerName, companyName, message, wantsPoster } = body;

        if (!amount || !customerEmail) {
            return Response.json({ 
                error: 'Missing required fields: amount and customerEmail' 
            }, { status: 400 });
        }

        if (typeof amount !== 'number' || amount < 1) {
            return Response.json({ 
                error: 'Amount must be at least $1' 
            }, { status: 400 });
        }

        const refererUrl = req.headers.get('referer') || 'https://omnimagic.co';
        const baseUrl = refererUrl.split('?')[0];
        const successUrl = `${baseUrl}?payment=success&type=gratuity`;
        const cancelUrl = `${baseUrl}?payment=cancelled&type=gratuity`;

        const metadata = {
            payment_type: 'gratuity',
            performer_name: performerName || 'Omni Magic Entertainment',
            customer_email: customerEmail,
            customer_address: address || 'Not provided',
            customer_message: message || 'No message provided',
            user_id: user?.id || 'anonymous',
            wants_poster: wantsPoster ? 'true' : 'false'
        };

        if (companyName) {
            metadata.company_name = companyName;
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `Gratuity for ${performerName || 'Omni Magic Entertainment'}`,
                        },
                        unit_amount: Math.round(amount * 100),
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: successUrl,
            cancel_url: cancelUrl,
            customer_email: customerEmail,
            metadata: metadata,
        });

        return Response.json({ url: session.url });

    } catch (error) {
        console.error('Error creating gratuity checkout session:', error);
        return Response.json({ 
            error: error.message || 'Failed to create checkout session' 
        }, { status: 500 });
    }
});