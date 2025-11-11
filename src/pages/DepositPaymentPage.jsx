import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DollarSign, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';

const backgroundImageUrl = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9fdb80e10eb3dae94dfbf/e620330f2_IMG_1641.jpg";
const zelleQRCodeUrl = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9fdb80e10eb3dae94dfbf/b227159ae_IMG_2995.jpg";

export default function DepositPaymentPage() {
  const [amount, setAmount] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');

  const [error, setError] = useState('');
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [showZelleModal, setShowZelleModal] = useState(false);

  const baseAmount = parseInt(amount) || 0;

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

  const resetForm = () => {
    // Don't reset amount/description if they came from URL
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.get('amount')) setAmount('');
    if (!urlParams.get('description')) setDescription('');
    if (!urlParams.get('clientEmail')) setEmail('');
    
    setFullName('');
    setMessage('');
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
                      Email * <span className="text-slate-300 text-sm font-normal">(for confirmation)</span>
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
                    <h3 className="luxury-serif text-xl text-white mb-4 text-center">Send Your Deposit</h3>
                    
                    <div className="space-y-4">
                      {/* Zelle */}
                      <div className="p-4 bg-slate-800/70 rounded-lg border border-slate-600">
                        <div className="flex items-center gap-2 mb-3">
                          <DollarSign className="w-5 h-5 text-purple-400" />
                          <span className="luxury-serif text-lg text-white">Pay with Zelle</span>
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

                      <div className="mt-4 p-4 bg-blue-900/30 border border-blue-500/40 rounded-lg">
                        <p className="text-blue-200 text-sm text-center">
                          💡 <strong>After sending payment</strong>, please email us at{' '}
                          <a href="mailto:hello@omnimagic.co" className="text-blue-400 hover:text-blue-300 underline font-semibold">
                            hello@omnimagic.co
                          </a>
                          {' '}with your payment confirmation. Include your name ({fullName || 'your full name'}) and the deposit amount (${baseAmount.toLocaleString()}).
                        </p>
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
                    Thank You! 🎉
                  </h3>
                  <p className="luxury-body text-lg text-slate-100 mb-6">
                    We're looking forward to your ${baseAmount.toLocaleString()} deposit payment.
                  </p>
                  <p className="luxury-body text-base text-amber-300 mb-8">
                    We'll be in touch shortly to finalize your event details!
                  </p>
                  <Button
                    onClick={resetForm}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-8"
                  >
                    Close
                  </Button>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>

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
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}