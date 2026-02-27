import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { createPageUrl } from '@/utils';

export default function DepositPaymentThankYou() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [depositData, setDepositData] = useState(null);
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
          setDepositData({
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
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mb-4"></div>
          <p className="text-white text-lg">Processing your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800/90 border-2 border-amber-500/50 rounded-xl p-8 text-center">
        {error ? (
          <>
            <div className="text-red-400 text-5xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-white mb-4">Payment Processing</h1>
            <p className="text-slate-200 mb-6">{error}</p>
          </>
        ) : (
          <>
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Hold Request Sent! 🎉</h1>
            <p className="text-slate-200 text-sm mb-6">
              Thank you! Your request to hold the date has been received.
            </p>

            <div className="bg-blue-900/30 border border-blue-500/40 rounded-lg p-4 mb-6">
              <p className="text-blue-400 text-xs mb-2">Your deposit of</p>
              <p className="text-white text-2xl font-bold mb-3">
                ${depositData?.amount.toLocaleString()}
              </p>
              <p className="text-blue-300 text-xs mb-1">has been received</p>
            </div>

            {holdExpiryTime && (
              <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
                <p className="text-slate-300 text-xs mb-2">Your booking is reserved until:</p>
                <p className="text-white text-lg font-semibold">
                  {format(holdExpiryTime, 'PPpp')}
                </p>
              </div>
            )}

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6">
              <p className="text-amber-200 text-sm">
                ✉️ A confirmation email has been sent to <span className="font-semibold">{depositData?.email}</span>
              </p>
              <p className="text-amber-200 text-xs mt-2">
                Be sure to check your spam folder if you don't see it in your inbox.
              </p>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-4 mb-6 text-left">
              <p className="text-slate-300 text-sm font-semibold mb-3">Next Steps:</p>
              <ul className="text-slate-200 text-sm space-y-2">
                <li>• Look for the confirmation email from Omni Magic Entertainment</li>
                <li>• Review your booking details and payment receipt</li>
                <li>• We'll reach out within 24 hours to confirm your event</li>
              </ul>
            </div>
          </>
        )}

        <Button
          onClick={() => window.location.href = createPageUrl('Home')}
          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-medium">
          Back to Home
        </Button>
      </div>
    </div>
  );
}