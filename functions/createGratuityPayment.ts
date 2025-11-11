import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import Stripe from 'npm:stripe@14.11.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Try to get user, but don't fail if not authenticated
        let user = null;
        try {
            user = await base44.auth.me();
        } catch (authError) {
            console.log('User not authenticated, proceeding with gratuity payment anyway');
        }

        const body = await req.json();
        const { amount, email, performerName, message } = body;

        console.log('Received gratuity payment request:', { amount, email, performerName });

        // Validate required fields
        if (!amount || !email) {
            console.error('Missing required fields:', { amount, email });
            return Response.json({ 
                error: 'Missing required fields: amount and email' 
            }, { status: 400 });
        }

        // Validate amount is a positive number
        if (typeof amount !== 'number' || amount < 1) {
            console.error('Invalid amount:', amount);
            return Response.json({ 
                error: 'Amount must be at least $1' 
            }, { status: 400 });
        }

        console.log('Creating Stripe payment intent for gratuity amount:', amount);

        // Create a payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency: 'usd',
            receipt_email: email,
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                payment_type: 'gratuity',
                performer_name: performerName || 'Omni Magic Entertainment',
                customer_email: email,
                customer_message: message || 'No message provided',
                user_id: user?.id || 'anonymous'
            },
            description: `Gratuity for ${performerName || 'Omni Magic Entertainment'}`
        });

        console.log('Gratuity payment intent created successfully:', paymentIntent.id);

        return Response.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });

    } catch (error) {
        console.error('Error creating gratuity payment intent:', error);
        console.error('Error details:', {
            message: error.message,
            type: error.type,
            stack: error.stack
        });
        
        return Response.json({ 
            error: error.message || 'Failed to create payment intent',
            details: error.type || 'unknown_error'
        }, { status: 500 });
    }
});