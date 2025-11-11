
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, CheckCircle, ArrowLeft, Clock, DollarSign, Gift, CreditCard, Users, Heart, Video } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { format, addHours } from 'date-fns';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Initialize Stripe with publishable key
// NOTE: Using TEST key for development - switch to LIVE key for production
const STRIPE_PUBLISHable_KEY = 'pk_test_51PcYa4HY2EmYepy7YJwU5iMQUlYlx9a1FNOx5WaVwMQXN6s3YC8BaIa9Oo4UJ4E4KqJ14SXxE5cTUpH0gQc2vJ00OB8XO1zJ';
const stripePromise = loadStripe(STRIPE_PUBLISHable_KEY);

// Payment Form Component
function StripePaymentForm({ amount, email, packageDetails, eventDetails, onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isReady, setIsReady] = useState(false); // New state to track PaymentElement readiness

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setErrorMessage('Payment system is still loading. Please wait a moment.');
      return;
    }

    if (!isReady) {
      setErrorMessage('Payment form is still loading. Please wait.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      // Submit the payment element to ensure all fields are complete and valid
      const { error: submitError } = await elements.submit();
      
      if (submitError) {
        setErrorMessage(submitError.message);
        setIsProcessing(false);
        return;
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href, // This can be a specific success page URL if needed
          receipt_email: email,
        },
        redirect: 'if_required', // Automatically handle 3D Secure or other redirects
      });

      if (error) {
        console.error('Stripe payment error:', error);
        setErrorMessage(error.message);
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded
        await onSuccess();
      } else {
        // Handle other payment statuses or unexpected outcomes
        setErrorMessage('Payment could not be completed. Please try again.');
        setIsProcessing(false);
      }
    } catch (err) {
      console.error('Payment submission error:', err);
      setErrorMessage(err.message || 'An unexpected error occurred.');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement 
        onReady={() => {
          console.log('PaymentElement is ready');
          setIsReady(true);
        }}
        onLoadError={(error) => {
          console.error('PaymentElement load error - Full object:', error);
          console.error('Error type:', typeof error);
          console.error('Error keys:', error ? Object.keys(error) : 'null');
          
          // Try to stringify the error
          try {
            console.error('Error JSON:', JSON.stringify(error, null, 2));
          } catch (e) {
            console.error('Could not stringify error');
          }
          
          // Try multiple ways to extract error message
          let errorMsg = 'Failed to load payment form. Please try again.';
          
          if (error) {
            if (typeof error === 'string') {
              errorMsg = error;
            } else if (error.message) {
              errorMsg = error.message;
            } else if (error.error && error.error.message) {
              errorMsg = error.error.message;
            } else if (error.toString && error.toString() !== '[object Object]') {
              errorMsg = error.toString();
            }
          }
          
          console.error('Final error message:', errorMsg);
          setErrorMessage(errorMsg);
        }}
      />
      
      {!isReady && !errorMessage && ( // Only show loading if not ready and no error
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          <p className="text-slate-400 text-sm mt-2">Loading payment form...</p>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-red-900/30 border border-red-500 rounded-lg text-red-300 text-sm">
          {errorMessage}
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || !isReady || isProcessing} // Disable if not ready
          className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold"
        >
          {isProcessing ? (
            <>Processing...</>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              Pay ${amount.toLocaleString()}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

export default function BookingModal({ isOpen, onClose, selectedPackage, eventType, eventDate, eventTime, eventAddress, selectedAddons = [] }) {
  const [screen, setScreen] = useState(6);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [holdExpiryTime, setHoldExpiryTime] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [error, setError] = useState('');

  // Define eventTypes here, as it's used in email formatting
  const eventTypes = {
    corporate_small: {
      icon: Users,
      label: "Corporate Event (Small Team)",
      description: "Internal meetings, team building, under 100 guests",
      subtypes: [{ value: "small_team", label: "Small Team Event", description: "Under 100 guests" }]
    },
    corporate_large: {
      icon: Users,
      label: "Corporate Event (Large Gala)",
      description: "Conferences, galas, 100+ guests",
      subtypes: [{ value: "large_gala", label: "Large Gala or Conference", description: "100+ guests" }]
    },
    private: {
      icon: Heart,
      label: "Private Celebration",
      description: "Birthdays, anniversaries, and celebrations",
      subtypes: [{ value: "standard", label: "Private Party", description: "Birthday, anniversary, or celebration" }]
    },
    wedding: {
      icon: Heart,
      label: "Wedding / Reception",
      description: "Elegant entertainment for your special day",
      subtypes: [{ value: "standard", label: "Wedding Reception", description: "Entertainment for your wedding day" }]
    },
    virtual: {
      icon: Video,
      label: "Virtual Show",
      description: "Online shows, Zoom events, live streams",
      subtypes: [{ value: "standard", label: "Virtual Event", description: "Online magic show" }]
    }
  };

  if (!selectedPackage) {
    return null;
  }

  const totalAddonsCost = selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
  const totalPackagePrice = selectedPackage.price + totalAddonsCost;
  const holdAmount = Math.round(totalPackagePrice * 0.2);

  const handleCreatePaymentIntent = async () => {
    if (!email) return;
    
    setIsSubmitting(true);
    setError('');

    try {
      console.log('Creating payment intent with amount:', holdAmount);
      console.log('Package details:', selectedPackage);
      
      const response = await base44.functions.invoke('createStripePayment', {
        amount: holdAmount,
        email: email,
        packageDetails: {
          type: selectedPackage.type,
          performer: selectedPackage.performer,
          duration: selectedPackage.duration,
          magicians: selectedPackage.magicians,
          tier: selectedPackage.tier,
          price: selectedPackage.price,
          addons: selectedAddons.map(addon => ({
            label: addon.label,
            price: addon.price
          })),
          totalWithAddons: totalPackagePrice
        },
        eventDetails: {
          eventType,
          eventDate,
          eventTime,
          eventAddress
        }
      });

      console.log('Payment intent response:', response);
      console.log('Response data:', response.data);

      if (!response.data) {
        throw new Error('No response data received from payment service');
      }

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      if (!response.data.clientSecret) {
        throw new Error('No client secret received from payment service');
      }

      console.log('Client secret received:', response.data.clientSecret.substring(0, 20) + '...');
      
      setClientSecret(response.data.clientSecret);
      setPaymentIntentId(response.data.paymentIntentId);
      setScreen(6.6); // Move to payment screen
    } catch (error) {
      console.error('Error creating payment intent:', error);
      console.error('Error details:', error.response?.data);
      setError(error.message || 'Failed to initialize payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = async () => {
    const currentTime = new Date();
    const expiryTime = addHours(currentTime, 48);
    setHoldExpiryTime(expiryTime);

    try {
      const addonsText = selectedAddons.length > 0 
        ? `\n\nSelected Add-ons:\n${selectedAddons.map(addon => `  • ${addon.label} (+$${addon.price.toLocaleString()})`).join('\n')}`
        : '\n\nNo add-ons selected.';

      const eventTypeLabel = eventType && eventTypes[eventType] ? eventTypes[eventType].label : 'Not specified';

      // Send confirmation email
      await base44.integrations.Core.SendEmail({
        to: 'hello@omnimagic.co',
        subject: `💳 20% Hold Payment Received - ${selectedPackage?.type || 'Package'}`,
        body: `
PAYMENT SUCCESSFULLY PROCESSED VIA STRIPE

Payment Details:
- Amount Paid: $${holdAmount.toLocaleString()} (20% Non-Refundable Hold)
- Payment ID: ${paymentIntentId}
- Payment Time: ${format(currentTime, 'PPpp')}
- Hold Expires: ${format(expiryTime, 'PPpp')} (48 hours from now)

Event Details:
- Event Type: ${eventTypeLabel}
- Event Date: ${eventDate || 'Not specified'}
- Event Time: ${eventTime || 'Not specified'}
- Event Address: ${eventAddress || 'Not specified'}
- Performer: ${selectedPackage?.performer || 'Not specified'}

Selected Package:
- Type: ${selectedPackage?.type || 'N/A'}
- Duration: ${selectedPackage?.duration || 'N/A'}${selectedPackage?.magicians ? `\n- Magicians: ${selectedPackage.magicians}` : ''}
- Tier: ${selectedPackage?.tier || 'N/A'}
- Base Investment: $${selectedPackage?.price?.toLocaleString() || 'N/A'}${addonsText}

TOTAL INVESTMENT: $${totalPackagePrice.toLocaleString()}

Customer Information:
- Email: ${email}

NEXT STEPS: Contact the client within 24 hours to finalize booking details.

Best regards,
Omni Magic Pricing System
        `
      });

      setScreen(7);
      setIsSuccess(true);
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      // Still show success to user even if email fails
      setScreen(7);
      setIsSuccess(true);
    }
  };

  const handleFullExperienceRequest = async () => {
    if (!email) return;
    setIsSubmitting(true);

    const isStageShow = selectedPackage.type === 'Stage Show';

    try {
      const addonsText = selectedAddons.length > 0 
        ? `\n\nRequested Add-ons:\n${selectedAddons.map(addon => `  • ${addon.label} (+$${addon.price.toLocaleString()})`).join('\n')}`
        : '\n\nNo add-ons requested.';

      const eventTypeLabel = eventType && eventTypes[eventType] ? eventTypes[eventType].label : 'Not specified';

      await base44.integrations.Core.SendEmail({
        to: 'hello@omnimagic.co',
        subject: `📅 Full Experience Request: ${selectedPackage?.type || 'Package'}`,
        body: `
New full experience request received:

Event Details:
- Event Type: ${eventTypeLabel}
- Event Date: ${eventDate || 'Not specified'}
- Event Time: ${eventTime || 'Not specified'}
- Event Address: ${eventAddress || 'Not specified'}
- Performer: ${selectedPackage?.performer || 'Not specified'}

Selected Package:
- Type: ${selectedPackage?.type || 'N/A'}
- Duration: ${selectedPackage?.duration || 'N/A'}${selectedPackage?.magicians ? `\n- Magicians: ${selectedPackage.magicians}` : ''}
- Tier: ${selectedPackage?.tier || 'N/A'}
- Base Investment: $${selectedPackage?.price?.toLocaleString() || 'N/A'}${addonsText}

${isStageShow ? '🎁 FREE BONUS: Impossible Poster Souvenir (+$500 value) included with Stage Show\n' : ''}TOTAL INVESTMENT: $${totalPackagePrice.toLocaleString()}

Customer Information:
- Email: ${email}

Client wants to proceed with full experience.

Best regards,
Omni Magic Pricing System
        `
      });

      setScreen(8);
      setIsSuccess(true);
    } catch (error) {
      console.error('Error sending email:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetModal = () => {
    setScreen(6);
    setEmail('');
    setIsSuccess(false);
    setHoldExpiryTime(null);
    setClientSecret('');
    setPaymentIntentId('');
    setError('');
    onClose();
  };

  // Screen 6: Hold Options - 20% Hold or Full Experience
  if (screen === 6) {
    const isStageShow = selectedPackage.type === 'Stage Show';

    return (
      <Dialog open={isOpen} onOpenChange={resetModal}>
        <DialogContent className="bg-slate-900 border-amber-400/30 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl font-bold text-center text-white mb-2">
              Secure Your Date
            </DialogTitle>
            <p className="text-sm md:text-base text-slate-400 text-center">
              Choose how you'd like to proceed with your experience
            </p>
          </DialogHeader>
          
          {/* Selected Package Summary */}
          <div className="bg-gradient-to-br from-slate-700/50 via-slate-800/70 to-slate-700/50 p-4 md:p-6 rounded-xl border-2 border-amber-500/40 mb-4 md:mb-6 shadow-2xl backdrop-blur-sm">
            <h4 className="text-amber-400 font-bold text-lg md:text-xl mb-3 md:mb-4 flex items-center gap-2">
              Your Selection
            </h4>
            <div className="space-y-2 md:space-y-3 text-white text-sm md:text-base">
              <div className="flex justify-between items-center py-2 border-b border-slate-600/50">
                <span className="text-slate-300 font-medium">Type:</span>
                <span className="font-bold text-base md:text-lg">{selectedPackage.type}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-600/50">
                <span className="text-slate-300 font-medium">Performer:</span>
                <span className="font-bold text-base md:text-lg">{selectedPackage.performer}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-600/50">
                <span className="text-slate-300 font-medium">Duration:</span>
                <span className="font-bold text-base md:text-lg">{selectedPackage.duration}</span>
              </div>
              {selectedPackage.magicians && (
                <div className="flex justify-between items-center py-2 border-b border-slate-600/50">
                  <span className="text-slate-300 font-medium">Magicians:</span>
                  <span className="font-bold text-base md:text-lg">{selectedPackage.magicians}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-2 border-b border-slate-600/50">
                <span className="text-slate-300 font-medium">Tier:</span>
                <span className="font-bold text-base md:text-lg">{selectedPackage.tier?.toUpperCase()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-600/50">
                <span className="text-slate-300 font-medium">Date:</span>
                <span className="font-bold text-base md:text-lg">{eventDate}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-600/50">
                <span className="text-slate-300 font-medium">Base Package:</span>
                <span className="font-bold text-base md:text-lg">${selectedPackage.price.toLocaleString()}</span>
              </div>
              
              {selectedAddons.length > 0 && (
                <>
                  <div className="pt-2">
                    <p className="text-amber-400 font-bold text-base md:text-lg mb-2">Selected Add-ons:</p>
                    {selectedAddons.map(addon => (
                      <div key={addon.id} className="flex justify-between items-center py-1 text-sm">
                        <span className="text-slate-300">{addon.label}</span>
                        <span className="text-amber-400">+${addon.price.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
              
              <div className="pt-3 md:pt-4 mt-2 border-t-2 border-amber-500/50">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 font-bold text-lg">Total Investment:</span>
                  <span className="text-2xl md:text-3xl font-bold text-amber-400">${totalPackagePrice.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            {isStageShow && (
              <div className="mt-4 md:mt-6 p-4 md:p-5 bg-gradient-to-r from-amber-600/30 via-yellow-600/30 to-amber-600/30 border-2 border-amber-400/60 rounded-xl shadow-lg">
                <p className="text-white font-bold text-sm md:text-lg flex items-center gap-2 md:gap-3">
                  <Gift className="w-5 md:w-7 h-5 md:h-7 flex-shrink-0 text-amber-300" />
                  <span>Secure now and receive the <span className="text-amber-300">Impossible Poster Souvenir</span> (+$500 value) complimentary</span>
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 20% Hold with Credit Card */}
            <div className="bg-slate-800/50 p-4 md:p-6 rounded-lg border-2 border-blue-500/50">
              <div className="flex items-center gap-2 md:gap-3 mb-3">
                <CreditCard className="w-6 md:w-8 h-6 md:h-8 text-blue-400" />
                <h3 className="text-white font-bold text-lg md:text-xl">Reserve with 20%</h3>
              </div>
              <p className="text-slate-300 mb-4 text-sm md:text-base">
                Non-refundable deposit that secures your date for 48 hours and is applied toward your total investment.
              </p>
              <div className="bg-blue-900/30 p-3 md:p-4 rounded-lg mb-4">
                <p className="text-blue-400 font-bold text-xl md:text-2xl">${holdAmount.toLocaleString()}</p>
                <p className="text-blue-300 text-xs md:text-sm">20% Hold • Applied to Total</p>
              </div>
              <Button
                onClick={() => setScreen(6.5)}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm md:text-base">
                Pay with Credit Card
              </Button>
            </div>

            {/* Full Experience */}
            <div className="bg-slate-800/50 p-4 md:p-6 rounded-lg border-2 border-green-500/50">
              <div className="flex items-center gap-2 md:gap-3 mb-3">
                <CheckCircle className="w-6 md:w-8 h-6 md:h-8 text-green-400" />
                <h3 className="text-white font-bold text-lg md:text-xl">Ready to Secure Now</h3>
              </div>
              <p className="text-slate-300 mb-4 text-sm md:text-base">
                Skip the hold and proceed directly to finalize your experience with our team.
              </p>
              <div className="bg-green-900/30 p-3 md:p-4 rounded-lg mb-4">
                <p className="text-green-400 font-bold text-xl md:text-2xl">Full Experience</p>
                <p className="text-green-300 text-xs md:text-sm">Contact team directly</p>
              </div>
              <Button
                onClick={() => setScreen(8.5)}
                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold text-sm md:text-base">
                Proceed to Full Experience
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Screen 6.5: Email Collection for Credit Card Payment
  if (screen === 6.5) {
    return (
      <Dialog open={isOpen} onOpenChange={resetModal}>
        <DialogContent className="bg-slate-900 border-amber-400/30 text-white max-w-md md:max-w-xl max-h-[90vh] overflow-y-auto">
          <Button
            variant="ghost"
            onClick={() => setScreen(6)}
            className="text-slate-400 hover:text-white mb-4 w-fit">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl font-bold text-center text-white mb-2">
              Enter Your Email
            </DialogTitle>
            <p className="text-sm md:text-base text-slate-300 text-center">
              We'll send your receipt and booking confirmation here
            </p>
          </DialogHeader>

          {/* Hold Amount Display */}
          <div className="bg-gradient-to-br from-blue-900/30 to-slate-800/70 p-4 md:p-6 rounded-lg border border-blue-500/50 mb-4 md:mb-6">
            <div className="text-center">
              <p className="text-blue-400 text-xs md:text-sm mb-2">20% Non-Refundable Hold • Applied to Total</p>
              <p className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">${holdAmount.toLocaleString()}</p>
              <p className="text-slate-300 text-xs md:text-sm">This secures your date for 48 hours</p>
            </div>
          </div>

          {/* Email Input */}
          <div className="mb-6">
            <Label htmlFor="email" className="text-white text-sm md:text-base mb-2 block">Your Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="bg-slate-800 border-slate-600 text-white placeholder-slate-400 text-sm md:text-base"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-900/30 border border-red-500 rounded-lg text-red-300 text-sm mb-4">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={handleCreatePaymentIntent}
              disabled={isSubmitting || !email}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold text-base md:text-lg py-5 md:py-6">
              {isSubmitting ? (
                <>
                  <CreditCard className="w-4 md:w-5 h-4 md:h-5 mr-2 animate-pulse" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 md:w-5 h-4 md:h-5 mr-2" />
                  Continue to Payment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Screen 6.6: Stripe Payment Form
  if (screen === 6.6 && clientSecret) {
    console.log('Rendering Stripe Elements with clientSecret:', clientSecret.substring(0, 20) + '...');
    
    const stripeOptions = {
      clientSecret,
      appearance: {
        theme: 'night',
        variables: {
          colorPrimary: '#d4af37',
          colorBackground: '#1e293b',
          colorText: '#ffffff',
          colorDanger: '#ef4444',
          fontFamily: 'system-ui, sans-serif',
          borderRadius: '8px',
        }
      }
    };

    return (
      <Dialog open={isOpen} onOpenChange={resetModal}>
        <DialogContent className="bg-slate-900 border-amber-400/30 text-white max-w-md md:max-w-xl max-h-[90vh] overflow-y-auto">
          <Button
            variant="ghost"
            onClick={() => {
              setClientSecret('');
              setPaymentIntentId('');
              setScreen(6.5);
            }}
            className="text-slate-400 hover:text-white mb-4 w-fit">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl font-bold text-center text-white mb-2">
              Complete Your Payment
            </DialogTitle>
            <p className="text-sm md:text-base text-slate-300 text-center">
              Secure payment processed by Stripe
            </p>
          </DialogHeader>

          {/* Hold Amount Display */}
          <div className="bg-gradient-to-br from-blue-900/30 to-slate-800/70 p-4 md:p-6 rounded-lg border border-blue-500/50 mb-4 md:mb-6">
            <div className="text-center">
              <p className="text-blue-400 text-xs md:text-sm mb-2">Amount to Pay</p>
              <p className="text-4xl md:text-5xl font-bold text-blue-400">${holdAmount.toLocaleString()}</p>
            </div>
          </div>

          {/* Stripe Payment Form */}
          <Elements stripe={stripePromise} options={stripeOptions}>
            <StripePaymentForm
              amount={holdAmount}
              email={email}
              packageDetails={selectedPackage}
              eventDetails={{ eventType, eventDate, eventTime, eventAddress }}
              onSuccess={handlePaymentSuccess}
              onCancel={() => {
                setClientSecret('');
                setPaymentIntentId('');
                setScreen(6.5);
              }}
            />
          </Elements>
        </DialogContent>
      </Dialog>
    );
  }

  // Screen 7: Payment Success
  if (screen === 7 && isSuccess && holdExpiryTime) {
    return (
      <Dialog open={isOpen} onOpenChange={resetModal}>
        <DialogContent className="bg-slate-900 border-amber-400/30 text-white max-w-md md:max-w-xl">
          <div className="text-center py-6 md:py-8">
            <CheckCircle className="w-16 md:w-20 h-16 md:h-20 text-blue-400 mx-auto mb-4 md:mb-6" />
            <h3 className="2xl md:text-3xl font-bold text-white mb-3">Payment Successful! 🎉</h3>
            <p className="text-base md:text-lg text-slate-300 mb-4 md:mb-6">
              Thank you! Your ${holdAmount.toLocaleString()} hold payment has been received.
            </p>

            <div className="bg-gradient-to-br from-blue-900/30 to-slate-800/70 p-4 md:p-6 rounded-lg border border-blue-500/50 mb-4 md:mb-6">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Clock className="w-5 md:w-6 h-5 md:h-6 text-blue-400" />
                <h4 className="text-white font-bold text-lg md:text-xl">Your Hold Expires:</h4>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-blue-400 mb-2">
                {format(holdExpiryTime, 'PPpp')}
              </p>
              <p className="text-slate-300 text-xs md:text-sm">48 hours from now</p>
            </div>

            <p className="text-sm md:text-base text-slate-300 mb-4 md:mb-6">
              Our team will contact you shortly to finalize your booking details. Check your email for the receipt.
            </p>
            
            <Button
              onClick={resetModal}
              className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-sm md:text-base px-6 md:px-8">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Screen 8.5: Full Experience Email Collection
  if (screen === 8.5) {
    const isStageShow = selectedPackage.type === 'Stage Show';

    return (
      <Dialog open={isOpen} onOpenChange={resetModal}>
        <DialogContent className="bg-slate-900 border-amber-400/30 text-white max-w-md md:max-w-xl">
          <Button
            variant="ghost"
            onClick={() => setScreen(6)}
            className="text-slate-400 hover:text-white mb-4 w-fit">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl font-bold text-center text-white mb-2">
              Confirm Your Experience Request
            </DialogTitle>
          </DialogHeader>

          {isStageShow && (
            <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-3 md:p-4 mb-4">
              <p className="text-green-300 font-bold text-sm md:text-base flex items-center gap-2">
                <Gift className="w-4 md:w-5 h-4 md:h-5" />
                Secure now and receive the Impossible Poster Souvenir (+$500 value) complimentary with your Stage Show
              </p>
            </div>
          )}

          <div className="py-4 md:py-6">
            <Label htmlFor="email-booking" className="text-white text-sm md:text-base mb-2 block">Your Email Address</Label>
            <Input
              id="email-booking"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="bg-slate-800 border-slate-600 text-white placeholder-slate-400 text-sm md:text-base"
            />
          </div>

          <DialogFooter>
            <Button
              onClick={handleFullExperienceRequest}
              disabled={isSubmitting || !email}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:bg-green-400 hover:to-green-500 text-white font-bold text-base md:text-lg py-5 md:py-6">
              {isSubmitting ? (
                <>
                  <Mail className="w-4 md:w-5 h-4 md:h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 md:w-5 h-4 md:h-5 mr-2" />
                  Submit Experience Request
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Screen 8: Full Experience Confirmation
  if (screen === 8 && isSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={resetModal}>
        <DialogContent className="bg-slate-900 border-amber-400/30 text-white max-w-md md:max-w-xl">
          <div className="text-center py-6 md:py-8">
            <CheckCircle className="w-16 md:w-20 h-16 md:h-20 text-green-400 mx-auto mb-4 md:mb-6" />
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">Experience Request Received</h3>
            <p className="text-base md:text-lg text-slate-300 mb-4 md:mb-6">
              Thank you for your interest in creating an unforgettable experience with Omni Magic Entertainment.
            </p>

            <div className="bg-gradient-to-br from-green-900/30 to-slate-800/70 p-4 md:p-6 rounded-lg border border-green-500/50 mb-4 md:mb-6">
              <h4 className="text-white font-bold text-lg md:text-xl mb-2">What's Next</h4>
              <p className="text-slate-300 text-sm md:text-base">
                Our team will contact you within 24 hours to discuss your event details and finalize your experience.
              </p>
            </div>
            
            <Button
              onClick={resetModal}
              className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-sm md:text-base px-6 md:px-8">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return null;
}
