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
  We’re excited to create something unforgettable for you.
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