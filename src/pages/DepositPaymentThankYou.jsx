import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { createPageUrl } from '@/utils';

export default function DepositPaymentThankYou() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const [holdExpiryTime, setHoldExpiryTime] = useState(null);

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
        <h1 className="text-3xl font-bold text-white mb-4">
          Payment Received 🎉
        </h1>

        {/* Main Message */}
        <p className="text-slate-200 text-sm leading-relaxed mb-6">
          Thank you for your payment. Your deposit has been successfully received and your event date is now reserved for the next 48 hours.
          <br /><br />
          During this time, we will finalize your booking details and agreement. Please complete any remaining balance within the 48-hour window to officially confirm and lock in your date.
          <br /><br />
          We're excited to create something unforgettable for you.
        </p>

        {/* Expiry Info */}
        {holdExpiryTime && (
          <div className="bg-blue-900/40 border border-blue-500/50 rounded-lg p-4 mb-6">
            <p className="text-blue-400 text-xs mb-1">
              Your temporary hold expires:
            </p>
            <p className="text-white text-lg font-bold">
              {format(holdExpiryTime, 'MMM d, yyyy, h:mm:ss a')}
            </p>
            <p className="text-blue-200 text-xs mt-2">
              After this time, the date may be released if the remaining balance is not completed.
            </p>
          </div>
        )}

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