
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Heart, DollarSign, CheckCircle, CreditCard, ArrowLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { motion } from 'framer-motion';

const STRIPE_PUBLISHABLE_KEY = 'pk_live_6Nc8XGyb1hjYhBXPXTM6wWWB00csFwk1ZG';
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

// Payment Form Component
function GratuityPaymentForm({ amount, email, performerName, onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isReady, setIsReady] = useState(false);

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
      const { error: submitError } = await elements.submit();
      
      if (submitError) {
        setErrorMessage(submitError.message);
        setIsProcessing(false);
        return;
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href,
          receipt_email: email,
        },
        redirect: 'if_required',
      });

      if (error) {
        console.error('Stripe payment error:', error);
        setErrorMessage(error.message);
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        await onSuccess();
      } else {
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
          console.error('PaymentElement load error:', error);
          setErrorMessage('Failed to load payment form. Please try again.');
        }}
      />
      
      {!isReady && !errorMessage && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
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
          disabled={!stripe || !isReady || isProcessing}
          className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold"
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

export default function GratuityPayment() {
  const [modalOpen, setModalOpen] = useState(false);
  const [screen, setScreen] = useState(1);
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [email, setEmail] = useState('');
  const [performerName, setPerformerName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState('');

  const presetAmounts = [20, 50, 100, 200, 500];

  const handleAmountSelect = (value) => {
    setAmount(value.toString());
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setCustomAmount(value);
    setAmount(value);
  };

  const handleCreatePaymentIntent = async () => {
    const finalAmount = parseInt(amount);
    
    if (!finalAmount || finalAmount < 1) {
      setError('Please enter a valid amount (minimum $1)');
      return;
    }

    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    try {
      const response = await base44.functions.invoke('createGratuityPayment', {
        amount: finalAmount,
        email: email,
        performerName: performerName || 'Omni Magic Entertainment',
        message: message || ''
      });

      if (!response.data || response.data.error) {
        throw new Error(response.data?.error || 'Failed to initialize payment');
      }

      setClientSecret(response.data.clientSecret);
      setScreen(3);
    } catch (error) {
      console.error('Error creating payment intent:', error);
      setError(error.message || 'Failed to initialize payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      await base44.integrations.Core.SendEmail({
        to: 'hello@omnimagic.co',
        subject: `💝 Gratuity Received - $${amount}`,
        body: `
A gratuity payment has been received!

Payment Details:
- Amount: $${amount}
- Performer: ${performerName || 'Not specified'}
- From: ${email}
- Message: ${message || 'No message provided'}
- Payment Time: ${new Date().toLocaleString()}

Thank you for your generosity!

Best regards,
Omni Magic Pricing System
        `
      });

      setScreen(4);
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      setScreen(4);
    }
  };

  const resetModal = () => {
    setModalOpen(false);
    setScreen(1);
    setAmount('');
    setCustomAmount('');
    setEmail('');
    setPerformerName('');
    setMessage('');
    setClientSecret('');
    setError('');
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap');
        
        .luxury-serif {
          font-family: 'Oswald', sans-serif;
          font-weight: 500;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        
        .luxury-body {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 400;
          line-height: 1.8;
          font-size: 1.125rem;
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-amber-900/30 to-slate-800/90 border-2 border-amber-500/50 max-w-2xl mx-auto">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-amber-500/20 rounded-full">
                <Heart className="w-12 h-12 text-amber-400" />
              </div>
            </div>
            <CardTitle className="luxury-serif text-3xl md:text-4xl font-bold text-white mb-2">
              Show Your Appreciation
            </CardTitle>
            <p className="luxury-body text-base md:text-lg text-slate-200">
              Had an amazing experience? Leave a gratuity for your performer
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center">
              <Button
                onClick={() => setModalOpen(true)}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-bold text-lg px-8 py-6"
              >
                <Heart className="w-5 h-5 mr-2" />
                Leave a Gratuity
              </Button>
            </div>

            <div className="border-t border-amber-500/30 pt-6">
              <p className="luxury-body text-sm text-slate-300 text-center italic">
                100% of your gratuity goes directly to your performer. Thank you for your generosity!
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Gratuity Modal */}
      <Dialog open={modalOpen} onOpenChange={resetModal}>
        <DialogContent className="bg-slate-900 border-amber-400/30 text-white max-w-md md:max-w-xl max-h-[90vh] overflow-y-auto">
          {/* Screen 1: Amount Selection */}
          {screen === 1 && (
            <>
              <DialogHeader>
                <DialogTitle className="luxury-serif text-2xl md:text-3xl font-bold text-center text-white mb-2">
                  Choose Your Gratuity Amount
                </DialogTitle>
                <p className="luxury-body text-sm md:text-base text-slate-300 text-center">
                  Every bit of appreciation means the world to us
                </p>
              </DialogHeader>

              <div className="space-y-6">
                {/* Preset Amounts */}
                <div className="grid grid-cols-3 gap-3">
                  {presetAmounts.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => handleAmountSelect(preset)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        amount === preset.toString()
                          ? 'border-amber-500 bg-amber-500/20'
                          : 'border-slate-600 bg-slate-800 hover:border-amber-500/50'
                      }`}
                    >
                      <p className="luxury-serif text-2xl font-bold text-amber-400">${preset}</p>
                    </button>
                  ))}
                </div>

                {/* Custom Amount */}
                <div>
                  <Label htmlFor="customAmount" className="luxury-body text-white mb-2 block">
                    Or Enter Custom Amount
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="customAmount"
                      type="text"
                      value={customAmount}
                      onChange={handleCustomAmountChange}
                      placeholder="Enter amount"
                      className="bg-slate-800 border-slate-600 text-white text-lg pl-10"
                    />
                  </div>
                </div>

                <Button
                  onClick={() => setScreen(2)}
                  disabled={!amount || parseInt(amount) < 1}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-bold text-lg py-6"
                >
                  Continue
                </Button>
              </div>
            </>
          )}

          {/* Screen 2: Details */}
          {screen === 2 && (
            <>
              <Button
                variant="ghost"
                onClick={() => setScreen(1)}
                className="text-slate-400 hover:text-white mb-4 w-fit"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>

              <DialogHeader>
                <DialogTitle className="luxury-serif text-2xl md:text-3xl font-bold text-center text-white mb-2">
                  Your Details
                </DialogTitle>
              </DialogHeader>

              <div className="bg-amber-500/20 border border-amber-500/50 rounded-lg p-4 mb-6 text-center">
                <p className="luxury-body text-amber-200 text-sm mb-1">Gratuity Amount</p>
                <p className="luxury-serif text-4xl font-bold text-amber-400">${amount}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="email" className="luxury-body text-white mb-2 block">
                    Your Email * <span className="text-slate-400 text-sm">(for receipt)</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="performerName" className="luxury-body text-white mb-2 block">
                    Performer Name <span className="text-slate-400 text-sm">(optional)</span>
                  </Label>
                  <Input
                    id="performerName"
                    type="text"
                    value={performerName}
                    onChange={(e) => setPerformerName(e.target.value)}
                    placeholder="e.g. Johnny Wu"
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="luxury-body text-white mb-2 block">
                    Leave a Message <span className="text-slate-400 text-sm">(optional)</span>
                  </Label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share your thoughts..."
                    rows={3}
                    className="w-full bg-slate-800 border-slate-600 text-white rounded-md p-3 luxury-body"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-900/30 border border-red-500 rounded-lg text-red-300 text-sm">
                    {error}
                  </div>
                )}

                <Button
                  onClick={handleCreatePaymentIntent}
                  disabled={isSubmitting || !email}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-bold text-lg py-6"
                >
                  {isSubmitting ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      Continue to Payment
                    </>
                  )}
                </Button>
              </div>
            </>
          )}

          {/* Screen 3: Payment Form */}
          {screen === 3 && clientSecret && (
            <>
              <Button
                variant="ghost"
                onClick={() => {
                  setClientSecret('');
                  setScreen(2);
                }}
                className="text-slate-400 hover:text-white mb-4 w-fit"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>

              <DialogHeader>
                <DialogTitle className="luxury-serif text-2xl md:text-3xl font-bold text-center text-white mb-2">
                  Complete Payment
                </DialogTitle>
              </DialogHeader>

              <div className="bg-amber-500/20 border border-amber-500/50 rounded-lg p-4 mb-6 text-center">
                <p className="luxury-body text-amber-200 text-sm mb-1">Amount to Pay</p>
                <p className="luxury-serif text-4xl font-bold text-amber-400">${amount}</p>
              </div>

              <Elements 
                stripe={stripePromise} 
                options={{
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
                }}
              >
                <GratuityPaymentForm
                  amount={parseInt(amount)}
                  email={email}
                  performerName={performerName}
                  onSuccess={handlePaymentSuccess}
                  onCancel={() => {
                    setClientSecret('');
                    setScreen(2);
                  }}
                />
              </Elements>
            </>
          )}

          {/* Screen 4: Success */}
          {screen === 4 && (
            <div className="text-center py-8">
              <CheckCircle className="w-20 h-20 text-amber-400 mx-auto mb-6" />
              <h3 className="luxury-serif text-3xl font-bold text-white mb-4">
                Thank You! 🎉
              </h3>
              <p className="luxury-body text-lg text-slate-200 mb-6">
                Your ${amount} gratuity has been received. Your generosity is deeply appreciated!
              </p>
              <p className="luxury-body text-sm text-slate-300 mb-6">
                A receipt has been sent to {email}
              </p>
              <Button
                onClick={resetModal}
                className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-8"
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
