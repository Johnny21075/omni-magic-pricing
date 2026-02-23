import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Heart, DollarSign, CheckCircle, ExternalLink, BriefcaseBusiness, Package, CreditCard } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';

const backgroundImageUrl = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9fdb80e10eb3dae94dfbf/e620330f2_IMG_1641.jpg";
const zelleQRCodeUrl = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9fdb80e10eb3dae94dfbf/b227159ae_IMG_2995.jpg";

const TIER_AMOUNTS = [25, 50, 100];
const POSTER_THRESHOLD = 100;

export default function GratuityPage() {
  const [amount, setAmount] = useState('');
  const [email, setEmail] = useState('');
  const [performerName, setPerformerName] = useState('');
  const [message, setMessage] = useState('');
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  
  const [isCorporateEvent, setIsCorporateEvent] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [wantsPoster, setWantsPoster] = useState(false);

  const [error, setError] = useState('');
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [showZelleModal, setShowZelleModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    const numericAmount = parseInt(amount);
    if (numericAmount >= 1 && email.trim() !== '') {
      setShowPaymentOptions(true);
    } else {
      setShowPaymentOptions(false);
    }

    if (numericAmount >= POSTER_THRESHOLD) {
      setWantsPoster(false);
    }
  }, [amount, email]);

  const handleCustomAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setSelectedTier('custom');
    setAmount(value);
    setError('');
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setError('');
  };

  const resetForm = () => {
    setAmount('');
    setSelectedTier(null);
    setEmail('');
    setPerformerName('');
    setMessage('');
    setIsCorporateEvent(false);
    setCompanyName('');
    setWantsPoster(false);
    setShowPaymentOptions(false);
    setError('');
    setShowSuccess(false);
  };

  const handleStripePayment = async () => {
    setIsProcessingPayment(true);
    setError('');

    try {
      const response = await base44.functions.invoke('createGratuityPayment', {
        amount: parseInt(amount),
        customerEmail: email,
        performerName: performerName || 'Unknown',
        companyName: isCorporateEvent ? companyName : null,
        message: message,
        wantsPoster: wantsPoster
      });

      if (response.data.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error creating Stripe checkout:', error);
      setError('Failed to process payment. Please try again or use Zelle/Venmo.');
    } finally {
      setIsProcessingPayment(false);
    }
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
                    <div className="p-4 bg-amber-500/20 rounded-full">
                      <Heart className="w-12 h-12 text-amber-400" />
                    </div>
                  </div>
                  <CardTitle className="luxury-serif text-3xl md:text-4xl font-bold text-white mb-2">
                    Show Your Appreciation
                  </CardTitle>
                  <p className="luxury-body text-base md:text-lg text-slate-100">
                    Had an amazing experience? Leave a gratuity for your performer
                  </p>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="amount" className="luxury-body text-white mb-2 block text-lg">
                      Select Gratuity Amount *
                    </Label>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                      {TIER_AMOUNTS.map((tier) => (
                        <Button
                          key={tier}
                          onClick={() => handleTierSelect(tier)}
                          className={`
                            bg-slate-800 border-2 text-white font-bold text-lg py-3 rounded-lg
                            hover:bg-amber-600 hover:border-amber-600 transition-all
                            ${selectedTier === tier ? 'border-amber-500 bg-amber-700/50' : 'border-slate-600'}
                          `}
                        >
                          ${tier}
                        </Button>
                      ))}
                      <Button
                          onClick={() => handleTierSelect('custom')}
                          className={`
                            bg-slate-800 border-2 text-white font-bold text-lg py-3 rounded-lg
                            hover:bg-amber-600 hover:border-amber-600 transition-all
                            ${selectedTier === 'custom' ? 'border-amber-500 bg-amber-700/50' : 'border-slate-600'}
                          `}
                      >
                          Custom
                      </Button>
                    </div>

                    {selectedTier === 'custom' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.3 }}
                      >
                        <Label htmlFor="customAmount" className="luxury-body text-white mb-2 block text-sm">
                          Enter Custom Amount
                        </Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-300" />
                          <Input
                            id="customAmount"
                            type="text"
                            value={amount}
                            onChange={handleCustomAmountChange}
                            placeholder="Enter amount"
                            className="bg-slate-800 border-slate-600 text-white text-lg pl-10 placeholder-slate-400"
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email" className="luxury-body text-white mb-2 block text-lg">
                      Your Email * <span className="text-slate-300 text-sm font-normal">(for confirmation)</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={handleEmailChange}
                      placeholder="your@email.com"
                      required
                      className="bg-slate-800 border-slate-600 text-white text-lg placeholder-slate-400"
                    />
                  </div>

                  {parseInt(amount) >= 1 && email && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4 pt-4 border-t border-slate-600"
                    >
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="isCorporateEvent"
                          checked={isCorporateEvent}
                          onChange={(e) => setIsCorporateEvent(e.target.checked)}
                          className="h-5 w-5 text-amber-500 bg-slate-800 border-slate-600 rounded focus:ring-amber-500"
                        />
                        <Label htmlFor="isCorporateEvent" className="luxury-body text-white text-lg flex items-center">
                          <BriefcaseBusiness className="w-5 h-5 mr-2 text-amber-400" /> This is for a corporate event
                        </Label>
                      </div>

                      {isCorporateEvent && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          transition={{ duration: 0.3 }}
                        >
                          <Label htmlFor="companyName" className="luxury-body text-white mb-2 block">
                            Company Name <span className="text-slate-400 text-sm">(optional)</span>
                          </Label>
                          <Input
                            id="companyName"
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="e.g. Acme Corp"
                            className="bg-slate-800 border-slate-600 text-white placeholder-slate-400"
                          />
                        </motion.div>
                      )}

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
                          className="bg-slate-800 border-slate-600 text-white placeholder-slate-400"
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
                          className="w-full bg-slate-800 border-slate-600 text-white rounded-md p-3 luxury-body border placeholder-slate-400"
                        />
                      </div>

                      {parseInt(amount) >= POSTER_THRESHOLD && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          transition={{ duration: 0.3 }}
                          className="mt-4 p-4 bg-amber-900/20 border border-amber-500/50 rounded-lg"
                        >
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="wantsPoster"
                              checked={wantsPoster}
                              onChange={(e) => setWantsPoster(e.target.checked)}
                              className="h-5 w-5 text-amber-500 bg-slate-800 border-amber-600 rounded focus:ring-amber-500"
                            />
                            <Label htmlFor="wantsPoster" className="luxury-body text-white text-lg flex items-center">
                              <Package className="w-5 h-5 mr-2 text-amber-400" /> Yes, I'd like a FREE Omni Magic poster!
                            </Label>
                          </div>
                          <p className="text-xs text-slate-300 mt-2 ml-7">
                            We'll contact you for shipping details.
                          </p>
                        </motion.div>
                      )}

                      {showPaymentOptions && (
                        <div className="pt-6">
                          <h3 className="luxury-serif text-xl md:text-2xl font-bold text-white mb-4 text-center">
                            Send Gratuity
                          </h3>

                          <div className="grid md:grid-cols-3 gap-4">
                            <Card className="bg-slate-800/70 border-2 border-slate-600 hover:border-indigo-500/50 transition-all">
                              <CardContent className="p-6 text-center flex flex-col justify-center h-full">
                                <CreditCard className="w-12 h-12 mx-auto text-indigo-400 mb-3" />
                                <h4 className="luxury-serif text-lg font-bold text-white mb-3">Credit Card</h4>
                                <Button
                                  onClick={handleStripePayment}
                                  disabled={isProcessingPayment}
                                  className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-semibold"
                                >
                                  {isProcessingPayment ? 'Processing...' : `Pay $${parseInt(amount).toLocaleString()}`}
                                </Button>
                                <p className="text-xs text-slate-300 mt-2">Secure Stripe payment</p>
                              </CardContent>
                            </Card>

                            <Card className="bg-slate-800/70 border-2 border-slate-600 hover:border-purple-500/50 transition-all">
                              <CardContent className="p-6 text-center">
                                <img 
                                  src={zelleQRCodeUrl} 
                                  alt="Zelle QR Code" 
                                  className="w-full max-w-[200px] mx-auto mb-4 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() => setShowZelleModal(true)}
                                />
                                <h4 className="luxury-serif text-lg font-bold text-white mb-2">Pay with Zelle</h4>
                                <p className="luxury-body text-sm text-slate-200 mb-2">
                                  Scan the QR code in your bank's app
                                </p>
                                <p className="text-sm font-bold text-white">
                                  Send to: 626-242-7710
                                </p>
                                <p className="text-xs text-slate-400 mt-1">Click QR to enlarge</p>
                              </CardContent>
                            </Card>

                            <Card className="bg-slate-800/70 border-2 border-slate-600 hover:border-blue-500/50 transition-all">
                              <CardContent className="p-6 text-center flex flex-col justify-center h-full">
                                <div className="mb-4">
                                  <svg className="w-16 h-16 mx-auto" viewBox="0 0 24 24" fill="#3D95CE">
                                    <path d="M23.5 4.1c.4 1.1.6 2.3.6 3.6 0 8.1-6.9 18.3-12.5 18.3h-5L2 4.2l6.5-.6 3.1 17.4c2.5-3.6 5.9-10.4 5.9-14.8 0-1.3-.2-2.5-.6-3.5l6.6-.6z"/>
                                  </svg>
                                </div>
                                <h4 className="luxury-serif text-lg font-bold text-white mb-3">Pay with Venmo</h4>
                                <a
                                  href="https://venmo.com/u/OmniMagicCo"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-bold px-6 py-3 rounded-lg transition-all"
                                >
                                  Open Venmo <ExternalLink className="w-4 h-4" />
                                </a>
                                <p className="text-xs text-slate-300 mt-2">
                                  @OmniMagicCo
                                </p>
                              </CardContent>
                            </Card>
                          </div>

                          <div className="mt-6 p-4 bg-blue-900/30 border border-blue-500/40 rounded-lg">
                            <p className="text-blue-200 text-sm text-center">
                              💡 <strong>After sending payment</strong>, please email us at{' '}
                              <a href="mailto:hello@omnimagic.co" className="text-blue-400 hover:text-blue-300 underline font-semibold">
                                hello@omnimagic.co
                              </a>
                              {' '}with your payment confirmation so we can ensure your gratuity reaches the performer.
                            </p>
                          </div>

                          {error && (
                            <div className="mt-4 p-3 bg-red-900/30 border border-red-500 rounded-lg text-red-300 text-sm">
                              {error}
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}

                  <div className="border-t border-amber-500/30 pt-6">
                    <p className="luxury-body text-sm text-slate-200 text-center italic">
                      100% of your gratuity goes directly to your performer. Thank you for your generosity!
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-gradient-to-br from-amber-900/30 to-slate-800/90 border-2 border-amber-500/50">
                <CardContent className="text-center py-12">
                  <CheckCircle className="w-20 h-20 text-amber-400 mx-auto mb-6" />
                  <h3 className="luxury-serif text-3xl font-bold text-white mb-4">
                    Thank You! 🎉
                  </h3>
                  <p className="luxury-body text-lg text-slate-100 mb-6">
                    Your ${parseInt(amount).toLocaleString()} gratuity has been noted. Your generosity is deeply appreciated!
                  </p>
                  {parseInt(amount) >= POSTER_THRESHOLD && wantsPoster && (
                    <p className="luxury-body text-md text-amber-300 mb-6 font-semibold">
                      We'll be in touch shortly to arrange delivery of your complimentary poster!
                    </p>
                  )}
                  <Button
                    onClick={resetForm}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-8"
                  >
                    Leave Another Gratuity
                  </Button>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>

      <Dialog open={showZelleModal} onOpenChange={setShowZelleModal}>
        <DialogContent className="bg-slate-900 border-amber-400/30 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="luxury-serif text-2xl font-bold text-center text-white">Zelle Payment</DialogTitle>
          </DialogHeader>
          <div className="text-center">
            <p className="luxury-body text-slate-300 text-base mb-4">
              Scan this QR code in your bank's app to send ${parseInt(amount).toLocaleString()}
            </p>
            <img 
              src={zelleQRCodeUrl} 
              alt="Zelle QR Code" 
              className="w-full max-w-sm mx-auto rounded-lg shadow-2xl"
            />
            <p className="text-white font-bold text-lg mt-4">
              Send to: 626-242-7710
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Please note: Zelle payments can take up to 3 business days to process.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}