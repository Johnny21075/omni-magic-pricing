
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DollarSign, CheckCircle, CreditCard } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';

const backgroundImageUrl = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9fdb80e10eb3dae94dfbf/e620330f2_IMG_1641.jpg";
const zelleQRCodeUrl = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9fdb80e10eb3dae94dfbf/b227159ae_IMG_2995.jpg";

const CREDIT_CARD_FEE_PERCENTAGE = 0.035; // 3.5%

// Stripe promise will be initialized after fetching the key
let stripePromise = null;

function StripePaymentForm({ amount, email, fullName, description, onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isReady, setIsReady] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements || !isReady) {
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
          receipt_email: email
        },
        redirect: 'if_required'
      });

      if (error) {
        setErrorMessage(error.message);
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        await onSuccess(paymentIntent.id);
      } else {
        setErrorMessage('Payment could not be completed. Please try again.');
        setIsProcessing(false);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setErrorMessage(err.message || 'An unexpected error occurred.');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <PaymentElement
        onReady={() => {
          console.log('Payment Element ready');
          setIsReady(true);
        }}
        onLoadError={(error) => {
          console.error('Payment Element load error:', error);
          setErrorMessage(error?.error?.message || error?.message || 'Failed to load payment form. Please try again.');
        }}
      />

      {!isReady && !errorMessage && (
        <div className="text-center py-3">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-amber-400"></div>
          <p className="text-slate-400 text-xs mt-2">Loading payment form...</p>
        </div>
      )}

      {errorMessage && (
        <div className="p-2 bg-red-900/30 border border-red-500 rounded text-red-300 text-xs">
          {errorMessage}
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800 text-sm h-9">
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || !isReady || isProcessing}
          className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-medium text-sm h-9">
          {isProcessing ? 'Processing...' : `Pay $${amount.toLocaleString()}`}
        </Button>
      </div>
    </form>
  );
}

export default function DepositPaymentPage() {
  const [amount, setAmount] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');

  const [stripeModalOpen, setStripeModalOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [stripeLoaded, setStripeLoaded] = useState(false);
  const [showZelleModal, setShowZelleModal] = useState(false);

  // Calculate credit card fee
  const baseAmount = parseInt(amount) || 0;
  const creditCardFee = Math.ceil(baseAmount * CREDIT_CARD_FEE_PERCENTAGE);
  const totalWithFee = baseAmount + creditCardFee;

  // Fetch Stripe publishable key on component mount
  useEffect(() => {
    const initStripe = async () => {
      try {
        const response = await base44.functions.invoke('getStripePublishableKey');
        if (response.data && response.data.publishableKey) {
          stripePromise = loadStripe(response.data.publishableKey);
          setStripeLoaded(true);
        } else {
          console.error('Failed to get Stripe publishable key');
        }
      } catch (error) {
        console.error('Error initializing Stripe:', error);
      }
    };
    
    initStripe();
  }, []);

  // Parse URL parameters on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const amountParam = urlParams.get('amount');
    const emailParam = urlParams.get('clientEmail');
    const descParam = urlParams.get('description');

    if (amountParam) setAmount(amountParam);
    if (emailParam) setEmail(emailParam);
    if (descParam) setDescription(decodeURIComponent(descParam));
  }, []);

  const handleCreatePaymentIntent = async () => {
    const finalAmount = totalWithFee; // Use total with fee
    
    if (!baseAmount || baseAmount < 1) {
      setError('Please enter a valid amount (minimum $1)');
      return;
    }

    if (!email || !email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address');
      return;
    }

    if (!fullName || fullName.trim() === '') {
      setError('Please enter your full name');
      return;
    }

    if (!stripeLoaded) {
      setError('Payment system is still loading. Please wait a moment and try again.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    setClientSecret('');
    setStripeModalOpen(false);

    try {
      console.log('Creating payment intent for deposit...');

      const response = await base44.functions.invoke('createCustomDepositPayment', {
        amount: finalAmount,
        email: email,
        fullName: fullName,
        description: description || 'Hold Date Deposit',
        message: message || '',
        feeBreakdown: {
          baseAmount: baseAmount,
          creditCardFee: creditCardFee,
          total: totalWithFee
        }
      });

      console.log('Response:', response);

      if (!response.data) {
        throw new Error('No response received from server');
      }

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      if (!response.data.clientSecret) {
        console.error('Missing client secret in response:', response.data);
        throw new Error('Invalid response from payment server');
      }

      const secret = response.data.clientSecret;
      console.log('Client secret received');

      setClientSecret(secret);
      setPaymentIntentId(response.data.paymentIntentId);
      
      // Small delay to ensure state updates
      await new Promise(resolve => setTimeout(resolve, 200));
      setStripeModalOpen(true);

    } catch (error) {
      console.error('Error creating payment intent:', error);
      setError(error.message || 'Failed to initialize payment. Please try again.');
      setClientSecret('');
      setPaymentIntentId('');
      setStripeModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = async (paymentId) => {
    try {
      await base44.integrations.Core.SendEmail({
        to: 'hello@omnimagic.co',
        subject: `💳 Deposit Payment Received - $${totalWithFee.toLocaleString()}`,
        body: `
DEPOSIT PAYMENT SUCCESSFULLY PROCESSED

Payment Details:
- Base Amount: $${baseAmount.toLocaleString()}
- Credit Card Fee (3.5%): $${creditCardFee.toLocaleString()}
- Total Charged: $${totalWithFee.toLocaleString()}
- Payment ID: ${paymentId}
- Payment Time: ${new Date().toLocaleString()}
- Description: ${description || 'Hold Date Deposit'}

Customer Information:
- Full Name: ${fullName}
- Email: ${email}
${message ? `- Message: ${message}` : ''}

NEXT STEPS: Contact the client within 24 hours to finalize booking details.

Best regards,
Omni Magic Pricing System
        `
      });

      await base44.integrations.Core.SendEmail({
        to: email,
        subject: `Payment Confirmation - Omni Magic Entertainment`,
        body: `
Dear ${fullName},

Thank you for your payment!

Payment Details:
- Deposit Amount: $${baseAmount.toLocaleString()}
- Credit Card Processing Fee (3.5%): $${creditCardFee.toLocaleString()}
- Total Charged: $${totalWithFee.toLocaleString()}
- Description: ${description || 'Hold Date Deposit'}
- Date: ${new Date().toLocaleDateString()}
- Payment ID: ${paymentId}

${message ? `Your Message:\n"${message}"\n\n` : ''}We will contact you shortly to finalize the details of your event.

If you have any questions, please don't hesitate to reach out.

Warmest regards,
The Omni Magic Entertainment Team

Website: https://www.omnimagic.co
Instagram: https://instagram.com/johnnywumagic
Email: hello@omnimagic.co
        `
      });
      
      setStripeModalOpen(false);
      setShowSuccess(true);
    } catch (error) {
      console.error('Error sending confirmation emails:', error);
      setStripeModalOpen(false);
      setShowSuccess(true);
    }
  };

  const resetForm = () => {
    // Don't reset amount/description if they came from URL
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.get('amount')) setAmount('');
    if (!urlParams.get('description')) setDescription('');
    if (!urlParams.get('clientEmail')) setEmail('');
    
    setFullName('');
    setMessage('');
    setClientSecret('');
    setPaymentIntentId('');
    setError('');
    setShowSuccess(false);
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

      <div className="bg-slate-900 min-h-screen">
        <div
          style={{ backgroundImage: `url(${backgroundImageUrl})` }}
          className="fixed inset-0 bg-cover bg-center filter brightness-[0.3] z-0" />

        <div className="relative z-10 flex items-center justify-center min-h-screen p-4 py-12 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-3xl"
          >
            {!showSuccess ? (
              <Card className="bg-gradient-to-br from-amber-900/30 to-slate-800/90 border-2 border-amber-500/50">
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <a href={createPageUrl('Home')} className="cursor-pointer">
                      <img
                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9fdb80e10eb3dae94dfbf/705652e3a_logowhitewordstransparent.png"
                        alt="Omni Magic Entertainment"
                        className="h-16 md:h-20 drop-shadow-2xl hover:opacity-80 transition-opacity"
                      />
                    </a>
                  </div>
                  <CardTitle className="luxury-serif text-3xl md:text-4xl font-bold text-white mb-2">
                    Hold Date Deposit
                  </CardTitle>
                  <p className="luxury-body text-base md:text-lg text-slate-100">
                    Non-refundable deposit to hold your date for 48 hours
                  </p>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {description && (
                    <div className="bg-amber-500/20 border border-amber-500/50 rounded-lg p-4 text-center">
                      <p className="luxury-body text-amber-200 text-sm mb-1">Deposit For:</p>
                      <p className="luxury-serif text-xl text-white font-bold">{description}</p>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="amount" className="luxury-body text-white mb-2 block text-lg">
                      Deposit Amount *
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <Input
                        id="amount"
                        type="text"
                        value={amount}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          setAmount(value);
                          setError('');
                        }}
                        placeholder="Enter amount"
                        required
                        className="bg-slate-800 border-slate-600 text-white text-lg pl-10 placeholder-slate-400"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="fullName" className="luxury-body text-white mb-2 block text-lg">
                      Full Name *
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        setError('');
                      }}
                      placeholder="John Smith"
                      required
                      className="bg-slate-800 border-slate-600 text-white text-lg placeholder-slate-400"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="luxury-body text-white mb-2 block text-lg">
                      Email * <span className="text-slate-300 text-sm font-normal">(for receipt)</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                      }}
                      placeholder="your@email.com"
                      required
                      className="bg-slate-800 border-slate-600 text-white text-lg placeholder-slate-400"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message" className="luxury-body text-white mb-2 block">
                      Message <span className="text-slate-400 text-sm">(optional)</span>
                    </Label>
                    <textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Any additional notes or questions..."
                      rows={3}
                      className="w-full bg-slate-800 border-slate-600 text-white rounded-md p-3 luxury-body border placeholder-slate-400"
                    />
                  </div>

                  {error && (
                    <div className="p-3 bg-red-900/30 border border-red-500 rounded-lg text-red-300 text-sm">
                      {error}
                    </div>
                  )}

                  {/* Payment Methods Section */}
                  <div className="pt-4 border-t border-amber-500/30">
                    <h3 className="luxury-serif text-xl text-white mb-4 text-center">Choose Payment Method</h3>
                    
                    <div className="space-y-4">
                      {/* Credit Card with Fee Display */}
                      <div>
                        {baseAmount >= 1 && (
                          <div className="mb-3 p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                            <div className="flex justify-between items-center text-sm text-slate-200 mb-1">
                              <span>Deposit Amount:</span>
                              <span>${baseAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm text-slate-200 mb-2">
                              <span>Credit Card Fee (3.5%):</span>
                              <span>+${creditCardFee.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-base font-bold text-white pt-2 border-t border-slate-600">
                              <span>Total with Card:</span>
                              <span className="text-amber-400">${totalWithFee.toLocaleString()}</span>
                            </div>
                          </div>
                        )}
                        
                        <Button
                          onClick={handleCreatePaymentIntent}
                          disabled={isSubmitting || !amount || !email || !fullName || !stripeLoaded}
                          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-bold text-lg h-12 flex items-center justify-center gap-2"
                        >
                          <CreditCard className="w-5 h-5" />
                          {isSubmitting ? 'Processing...' : stripeLoaded ? `Pay $${totalWithFee.toLocaleString()} with Card` : 'Loading...'}
                        </Button>
                        <p className="text-xs text-slate-400 mt-2 text-center">
                          Secure payment • Supports Apple Pay & Google Pay
                        </p>
                      </div>

                      {/* Divider */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-slate-600"></div>
                        <span className="text-slate-400 text-sm">OR PAY WITHOUT FEE</span>
                        <div className="flex-1 h-px bg-slate-600"></div>
                      </div>

                      {/* Zelle */}
                      <div className="p-4 bg-slate-800/70 rounded-lg border border-slate-600">
                        <div className="flex items-center gap-2 mb-3">
                          <DollarSign className="w-5 h-5 text-purple-400" />
                          <span className="luxury-serif text-lg text-white">Pay with Zelle</span>
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded font-semibold">NO FEE</span>
                        </div>
                        <p className="luxury-body text-sm text-slate-200 mb-3">
                          Send ${baseAmount.toLocaleString()} to: <span className="text-white font-bold">626-242-7710</span>
                        </p>
                        <img 
                          src={zelleQRCodeUrl} 
                          alt="Zelle QR Code" 
                          className="w-48 h-48 mx-auto rounded cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => setShowZelleModal(true)}
                        />
                        <p className="text-slate-400 text-xs text-center mt-2">Click to enlarge</p>
                      </div>

                      {/* Venmo */}
                      <div className="p-4 bg-slate-800/70 rounded-lg border border-slate-600">
                        <div className="flex items-center gap-2 mb-3">
                          <DollarSign className="w-5 h-5 text-blue-400" />
                          <span className="luxury-serif text-lg text-white">Pay with Venmo</span>
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded font-semibold">NO FEE</span>
                        </div>
                        <p className="luxury-body text-sm text-slate-200 mb-2">
                          Send ${baseAmount.toLocaleString()} to:
                        </p>
                        <a
                          href="https://venmo.com/u/johnnywumagic"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-base font-semibold"
                        >
                          @johnnywumagic
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-amber-500/30 pt-6">
                    <p className="luxury-body text-sm text-slate-200 text-center italic">
                      Your deposit secures your date with Omni Magic Entertainment. Thank you for choosing us!
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-gradient-to-br from-amber-900/30 to-slate-800/90 border-2 border-amber-500/50">
                <CardContent className="text-center py-12">
                  <CheckCircle className="w-20 h-20 text-amber-400 mx-auto mb-6" />
                  <h3 className="luxury-serif text-3xl font-bold text-white mb-4">
                    Payment Successful! 🎉
                  </h3>
                  <p className="luxury-body text-lg text-slate-100 mb-6">
                    Your ${totalWithFee.toLocaleString()} payment has been received.
                  </p>
                  <p className="luxury-body text-sm text-slate-200 mb-6">
                    A receipt has been sent to {email}
                  </p>
                  <p className="luxury-body text-base text-amber-300 mb-8">
                    We'll be in touch shortly to finalize your event details!
                  </p>
                  <Button
                    onClick={resetForm}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-8"
                  >
                    Make Another Payment
                  </Button>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>

      {/* Stripe Payment Modal */}
      <Dialog open={stripeModalOpen} onOpenChange={(open) => {
        if (!open) {
          setStripeModalOpen(false);
          setClientSecret('');
          setPaymentIntentId('');
        }
      }}>
        <DialogContent className="bg-slate-900 border-2 border-amber-500/50 text-white max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[22px] md:text-[24px] font-bold text-center text-white mb-2">
              Complete Payment
            </DialogTitle>
            <p className="text-slate-200 text-center text-[13px] md:text-[14px]">
              Secure payment via Stripe
            </p>
          </DialogHeader>

          <div className="bg-amber-500/20 border border-amber-500/50 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center text-sm text-slate-200 mb-1">
              <span>Deposit:</span>
              <span>${baseAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-slate-200 mb-2">
              <span>Processing Fee (3.5%):</span>
              <span>+${creditCardFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-amber-500/30">
              <p className="text-amber-200 text-sm font-semibold">Total Amount</p>
              <p className="text-3xl font-bold text-amber-400">${totalWithFee.toLocaleString()}</p>
            </div>
            {description && (
              <p className="text-slate-300 text-[13px] mt-2 text-center">{description}</p>
            )}
          </div>

          {clientSecret && stripePromise ? (
            <Elements 
              key={clientSecret}
              stripe={stripePromise} 
              options={{
                clientSecret: clientSecret,
                appearance: {
                  theme: 'night',
                  variables: {
                    colorPrimary: '#d4af37',
                    colorBackground: '#1e293b',
                    colorText: '#ffffff',
                    colorDanger: '#ef4444',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    borderRadius: '8px'
                  }
                }
              }}
            >
              <StripePaymentForm
                amount={totalWithFee}
                email={email}
                fullName={fullName}
                description={description}
                onSuccess={handlePaymentSuccess}
                onCancel={() => {
                  setStripeModalOpen(false);
                  setClientSecret('');
                  setPaymentIntentId('');
                }}
              />
            </Elements>
          ) : (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
              <p className="text-slate-400 text-sm mt-3">Initializing payment...</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Zelle QR Code Enlargement Modal */}
      <Dialog open={showZelleModal} onOpenChange={setShowZelleModal}>
        <DialogContent className="bg-slate-900 border-amber-400/30 text-white max-w-md overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="luxury-serif text-2xl font-semibold text-center text-white">Zelle Payment</DialogTitle>
          </DialogHeader>
          <div className="text-center">
            <p className="luxury-body text-base text-slate-200 mb-4">
              Scan this QR code in your bank's app to send ${baseAmount.toLocaleString()}
            </p>
            <img 
              src={zelleQRCodeUrl} 
              alt="Zelle QR Code" 
              className="w-full max-w-sm mx-auto rounded-lg shadow-2xl"
            />
            <p className="luxury-serif text-xl text-white font-bold mt-4">
              Send to: 626-242-7710
            </p>
            <div className="mt-4 p-3 bg-green-500/20 border border-green-500/40 rounded-lg">
              <p className="text-green-300 text-sm font-semibold">
                ✓ No processing fee with Zelle
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
