import React from "react";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function BookingSummary({ data, onClose }) {
  const {
    customerName,
    customerEmail,
    eventDate,
    packageDetails,
    depositAmount,
    totalInvestment,
    remainingBalance,
    expiryTime,
    paymentMethod,
  } = data;

  const formattedEventDate = eventDate
    ? new Date(eventDate + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Not specified";

  const formattedExpiry = expiryTime
    ? format(new Date(expiryTime), "PPpp")
    : null;

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-white text-[26px] font-bold mb-1">
            {paymentMethod ? "Hold Confirmed! 🎉" : "Booking Request Sent! 📧"}
          </h1>
          {customerName && (
            <p className="text-slate-300 text-[15px]">Thank you, {customerName}!</p>
          )}
          {customerEmail && (
            <p className="text-slate-400 text-[13px] mt-1">
              A confirmation has been sent to <span className="text-white">{customerEmail}</span>
            </p>
          )}
        </div>

        {/* Summary Card */}
        <div className="bg-slate-800/90 rounded-xl border border-slate-600 overflow-hidden shadow-2xl">

          {/* Event Details */}
          <div className="p-5 border-b border-slate-700">
            <h2 className="text-amber-400 text-[12px] font-semibold tracking-widest uppercase mb-3">Event Details</h2>
            <div className="space-y-2 text-[14px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Date</span>
                <span className="text-white font-medium">{formattedEventDate}</span>
              </div>
              {packageDetails?.performer && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Performer</span>
                  <span className="text-white font-medium">{packageDetails.performer}</span>
                </div>
              )}
            </div>
          </div>

          {/* Package Details */}
          <div className="p-5 border-b border-slate-700">
            <h2 className="text-amber-400 text-[12px] font-semibold tracking-widest uppercase mb-3">Package</h2>
            <div className="space-y-2 text-[14px]">
              {packageDetails?.type && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Type</span>
                  <span className="text-white font-medium">{packageDetails.type}</span>
                </div>
              )}
              {packageDetails?.duration && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Duration</span>
                  <span className="text-white font-medium">{packageDetails.duration}</span>
                </div>
              )}
              {packageDetails?.addons && packageDetails.addons !== "None" && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Add-ons</span>
                  <span className="text-white font-medium text-right max-w-[60%]">{packageDetails.addons}</span>
                </div>
              )}
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="p-5 border-b border-slate-700">
            <h2 className="text-amber-400 text-[12px] font-semibold tracking-widest uppercase mb-3">Pricing</h2>
            <div className="space-y-2 text-[14px]">
              {packageDetails?.packagePrice > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Package Price</span>
                  <span className="text-white">${packageDetails.packagePrice.toLocaleString()}</span>
                </div>
              )}
              {totalInvestment > 0 && (
                <div className="flex justify-between font-semibold text-[15px] pt-1 border-t border-slate-600 mt-1">
                  <span className="text-white">Total Investment</span>
                  <span className="text-amber-400">${totalInvestment.toLocaleString()}</span>
                </div>
              )}
              {depositAmount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>{paymentMethod ? `Deposit Paid (${paymentMethod})` : "Deposit Paid"}</span>
                  <span className="font-semibold">–${depositAmount.toLocaleString()}</span>
                </div>
              )}
              {remainingBalance > 0 && (
                <div className="flex justify-between text-[14px]">
                  <span className="text-slate-400">Remaining Balance</span>
                  <span className="text-white font-medium">${remainingBalance.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Hold Expiry */}
          {formattedExpiry && (
            <div className="p-5 border-b border-slate-700 bg-amber-900/20">
              <h2 className="text-amber-400 text-[12px] font-semibold tracking-widest uppercase mb-2">Hold Expires</h2>
              <p className="text-white text-[14px] font-medium">{formattedExpiry}</p>
              <p className="text-slate-400 text-[12px] mt-1">
                Complete the remaining balance before this time to confirm your booking.
              </p>
            </div>
          )}

          {/* Next Steps */}
          <div className="p-5">
            <h2 className="text-amber-400 text-[12px] font-semibold tracking-widest uppercase mb-3">Next Steps</h2>
            <div className="space-y-2 text-[13px] text-slate-300">
              <p>✓ Confirmation sent to your email</p>
              <p>✓ Our team will reach out within 24 hours</p>
              <p>✓ Questions? Email <a href="mailto:hello@omnimagic.co" className="text-amber-400 hover:text-amber-300">hello@omnimagic.co</a></p>
            </div>
          </div>
        </div>

        {/* Back button */}
        <div className="text-center mt-6">
          <Button
            onClick={onClose}
            className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold px-8 py-3"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}