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
        const { amount, email, fullName, description, message } = body;

        console.log('Creating custom deposit payment intent:', { amount, email, fullName, description });

        // Validate required fields
        if (!amount || !email || !fullName) {
            return Response.json({ 
                error: 'Missing required fields: amount, email, and fullName' 
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
            payment_type: 'custom_deposit',
            customer_email: email,
            customer_name: fullName,
            description: description || 'Hold Date Deposit',
            customer_message: message || 'No message provided',
            user_id: user?.id || 'anonymous'
        };

        // Create a payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency: 'usd',
            receipt_email: email,
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: metadata,
            description: `${description || 'Hold Date Deposit'} - ${fullName}`
        });

        console.log('Custom deposit payment intent created successfully:', paymentIntent.id);

        const emailBody = `New Custom Deposit Initiated\n\nCustomer Name: ${fullName}\nCustomer Email: ${email}\nDeposit Amount: $${amount}\nDescription: ${description || 'No description provided'}\nCustomer Message: ${message || 'No message provided'}`;
        
        await base44.integrations.Core.SendEmail({
            to: 'hello@omnimagic.co',
            subject: `New Custom Deposit - ${fullName}`,
            body: emailBody
        });

        return Response.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });

    } catch (error) {
        console.error('Error creating custom deposit payment intent:', error);
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