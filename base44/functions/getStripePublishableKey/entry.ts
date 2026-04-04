import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve((req) => {
    try {
        const publishableKey = Deno.env.get('STRIPE_PUBLISHABLE_KEY');
        
        if (!publishableKey) {
            return Response.json({ 
                error: 'Stripe publishable key not configured' 
            }, { status: 500 });
        }

        return Response.json({
            publishableKey: publishableKey
        });

    } catch (error) {
        console.error('Error getting Stripe publishable key:', error);
        return Response.json({ 
            error: error.message || 'Failed to get publishable key'
        }, { status: 500 });
    }
});