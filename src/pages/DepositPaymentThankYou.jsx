import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { CheckCircle, DollarSign, ExternalLink } from 'lucide-react';
import { format, addHours } from 'date-fns';
import { createPageUrl } from '@/utils';

export default function DepositPaymentThankYou() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const [holdExpiryTime, setHoldExpiryTime] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    const processPayment = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');

        if (!sessionId) {
          setError('No payment session found. Please try again.');
          setIsLoading(false);
          return;
        }

        // Retrieve session from Stripe via backend
        const stripe = (await import('npm:stripe@17.5.0')).default;
        // We need to get the session data - let's create a backend function to do this
        // For now, we'll call handleStripeSuccess to get the payment verification
        const response = await base44.functions.invoke('handleStripeSuccess', {
          sessionId: sessionId
        });

        if (response.data.success) {
          setSessionData({
            email: response.data.customerEmail,
            amount: response.data.depositAmount
          });
          setHoldExpiryTime(new Date(response.data.expiryTime));
        } else {
          setError('Payment verification failed. Please check your email for confirmation.');
        }
      } catch (err) {
        console.error('Error processing payment:', err);
        setError('Failed to confirm payment. Please check your email for details.');
      } finally {
        setIsLoading(false);
      }
    };

    processPayment();
  }, []);

  const handleCreditCardConfirmation = async () => {
    if (!sessionData?.email) return;

    setIsConfirming(true);
    try {
      const currentTime = new Date();
      const expiryTime = addHours(currentTime, 48);

      await base44.functions.invoke('sendHoldDateConfirmation', {
        customerName: sessionData.customerName || 'Valued Customer',
        customerEmail: sessionData.email,
        customerPhone: sessionData.customerPhone || '',
        eventDate: sessionData.eventDate || '',
        packageDetails: sessionData.packageDetails || {},
        depositAmount: sessionData.amount,
        totalInvestment: sessionData.totalInvestment || sessionData.amount,
        additionalNotes: '',
        holdExpiryTime: expiryTime.toISOString(),
        requestTime: currentTime.toISOString(),
        paymentMethod: 'Stripe'
      });

      alert('Confirmation email sent successfully!');
    } catch (err) {
      console.error('Error sending confirmation:', err);
      alert('Failed to send confirmation email. Please contact support.');
    } finally {
      setIsConfirming(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-400 mb-4"></div>
          <p className="text-white text-lg">Processing your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="text-red-400 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-4">Payment Error</h1>
          <p className="text-slate-200 mb-6">{error}</p>
          <Button
            onClick={() => window.location.href = createPageUrl('Home')}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-medium">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800/90 rounded-xl p-8 text-center">
        {/* Checkmark Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full border-4 border-green-400 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-white mb-4">Hold Request Sent! 🎉</h1>

        {/* Main Message */}
        <p className="text-slate-200 text-sm leading-relaxed mb-6">
          Payment received. Your deposit has been successfully processed, and your event date is now reserved for 48 hours. This temporary hold ensures your date is protected while we finalize your booking. To fully confirm your event, please complete the remaining balance within the 48-hour window. We look forward to delivering an extraordinary experience.
        </p>

        {/* Expiry Info */}
        {holdExpiryTime && (
          <div className="bg-blue-900/40 border border-blue-500/50 rounded-lg p-4 mb-6">
            <p className="text-blue-400 text-xs mb-1">Your hold expires:</p>
            <p className="text-white text-lg font-bold">{format(holdExpiryTime, 'MMM d, yyyy, h:mm:ss a')}</p>
            <p className="text-blue-200 text-xs mt-2">Please send your deposit by this time to confirm.</p>
          </div>
        )}

        {/* Payment Options Section */}
        <div className="mb-6">
          <h3 className="text-white text-sm font-bold text-left mb-3">Payment Options:</h3>

          {/* Zelle */}
          <div className="bg-slate-700/60 border border-slate-600 rounded-lg p-4 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-purple-400" />
              <span className="text-white font-semibold">Zelle</span>
            </div>
            <p className="text-slate-300 text-sm">Send to: <span className="text-slate-100 font-medium">626-242-7710</span></p>
            <button
              type="button"
              onClick={() => {/* Show QR code */}}
              className="text-blue-400 text-xs hover:text-blue-300 inline-flex items-center gap-1 mt-2">
              View QR Code <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {/* Venmo */}
          <div className="bg-slate-700/60 border border-slate-600 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-blue-400" />
              <span className="text-white font-semibold">Venmo</span>
            </div>
            <p className="text-slate-300 text-sm">
              Send to: <a href="https://venmo.com/u/johnnywumagic" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1">@johnnywumagic <ExternalLink className="w-3 h-3" /></a>
            </p>
          </div>
        </div>

        {/* Credit Card Button */}
        <Button
          onClick={handleCreditCardConfirmation}
          disabled={isConfirming}
          className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-semibold mb-3">
          {isConfirming ? 'Sending Confirmation...' : 'Please Click Here If You\'ve Already Made the Payment on Stripe'}
        </Button>

        {/* Email Reminder */}
        <p className="text-slate-300 text-sm mb-6">Check your email for confirmation details.</p>

        {/* Close Button */}
        <Button
          onClick={() => window.location.href = createPageUrl('Home')}
          className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold">
          Close
        </Button>
      </div>
    </div>
  );
}