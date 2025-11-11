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
            console.log('User not authenticated, proceeding with payment anyway');
        }

        const body = await req.json();
        const { amount, email, packageDetails, eventDetails } = body;

        console.log('Creating payment intent for hold deposit:', { amount, email });

        // Validate required fields
        if (!amount || !email) {
            return Response.json({ 
                error: 'Missing required fields: amount and email' 
            }, { status: 400 });
        }

        // Validate amount is a positive number
        if (typeof amount !== 'number' || amount <= 0) {
            return Response.json({ 
                error: 'Amount must be a positive number' 
            }, { status: 400 });
        }

        // Create payment intent metadata
        const metadata = {
            payment_type: 'hold_deposit',
            customer_email: email,
            user_id: user?.id || 'anonymous',
            event_date: eventDetails?.eventDate || 'N/A',
            package_type: packageDetails?.type || 'N/A',
            package_performer: packageDetails?.performer || 'N/A',
            package_duration: packageDetails?.duration || 'N/A',
            package_tier: packageDetails?.tier || 'N/A',
            package_magicians: packageDetails?.magicians || 'N/A',
            package_price: String(packageDetails?.price || 'N/A'),
            total_investment: String(packageDetails?.totalWithAddons || 'N/A')
        };

        // Add addons to metadata if they exist
        if (packageDetails?.addons && packageDetails.addons.length > 0) {
            packageDetails.addons.forEach((addon, index) => {
                if (index < 10) { // Stripe metadata has limits
                    metadata[`addon_${index + 1}`] = `${addon.label} - $${addon.price}${addon.isFree ? ' (FREE)' : ''}`;
                }
            });
        }

        // Create a payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency: 'usd',
            receipt_email: email,
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: metadata,
            description: `Hold Deposit (10%) - ${packageDetails?.type || 'Event'} - ${eventDetails?.eventDate || 'TBD'}`
        });

        console.log('Payment intent created successfully:', paymentIntent.id);

        return Response.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });

    } catch (error) {
        console.error('Error creating payment intent:', error);
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