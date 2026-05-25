import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, ExternalLink, Play, CreditCard, CheckCircle, Table2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format, addHours } from 'date-fns';
import {
  calculatePackagePrice,
  calculateBundlePrice,
  calculateFinalPrice,
  isPeakDate,
  BUNDLES,
  KIDS_PRICING,
  VIRTUAL_PRICING,
  getPricingCategory,
} from '../components/pricing/pricingCalculations';
import { pricingData } from '../components/pricing/pricingData';
import { magicExperiencesComparison } from '../components/pricing/tierComparisonData';
import TierComparisonTable from '../components/pricing/TierComparisonTable';
import { createPageUrl } from '@/utils';

const backgroundImageUrl = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9fdb80e10eb3dae94dfbf/e620330f2_IMG_1641.jpg";
const zelleQRCodeUrl = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9fdb80e10eb3dae94dfbf/b227159ae_IMG_2995.jpg";

// Determine if a date string falls on a weekend (Fri–Sun)
const isWeekend = (dateString) => {
  if (!dateString) return false;
  const d = new Date(dateString + 'T00:00:00');
  const day = d.getDay(); // 0=Sun, 5=Fri, 6=Sat
  return day === 0 || day === 5 || day === 6;
};

export default function PricingPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const eventType = urlParams.get('eventType');
  const eventSize = urlParams.get('eventSize');
  const eventScale = urlParams.get('eventScale');

  const isKidsBirthday = eventType === 'private' && eventScale === 'kids';
  const isVirtual = eventType === 'virtual';
  const isAdult = !isKidsBirthday && !isVirtual;

  // Shared state
  const [eventDate, setEventDate] = useState('');

  // Adult bundle state
  const [performer, setPerformer] = useState('johnny_wu');
  const [bundleType, setBundleType] = useState(''); // 'standard' | 'premium'
  const [extraCloseUpMinutes, setExtraCloseUpMinutes] = useState(0); // 0, 30, 60 (standard only)
  const [stageDuration, setStageDuration] = useState(30);             // 30, 45, 60

  // Kids state
  const [kidsCloseUpAddon, setKidsCloseUpAddon] = useState(false);

  // Virtual state
  const [virtualDuration, setVirtualDuration] = useState('');

  // Add-ons
  const [selectedAddons, setSelectedAddons] = useState([]);

  // Booking / contact
  const [bookingOption, setBookingOption] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [holdExpiryTime, setHoldExpiryTime] = useState(null);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Misc UI
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [showZelleModal, setShowZelleModal] = useState(false);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  const getTodayDate = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  };

  const handleDateChange = (e) => {
    if (e.target.value >= getTodayDate()) setEventDate(e.target.value);
  };

  // ── Price Calculation ──────────────────────────────────────────────────────

  const getSelectedPackagePrice = () => {
    if (isVirtual && virtualDuration) {
      const base = VIRTUAL_PRICING[parseInt(virtualDuration)] || 0;
      return calculateFinalPrice(base, eventDate);
    }

    if (isKidsBirthday && eventDate) {
      const base = isWeekend(eventDate) ? KIDS_PRICING.weekend : KIDS_PRICING.weekday;
      return calculateFinalPrice(base, eventDate);
    }

    if (isAdult && performer && bundleType) {
      return calculatePackagePrice({
        performer,
        bundleType,
        eventType,
        eventScale,
        extraCloseUpMinutes,
        stageDuration,
        dateString: eventDate,
      });
    }

    return { price: 0, multiplier: 1 };
  };

  const selectedPackagePrice = getSelectedPackagePrice();

  // For kids: base + optional close-up add-on
  const kidsAddonCost = isKidsBirthday && kidsCloseUpAddon ? KIDS_PRICING.closeup_addon : 0;

  const isCorporateGala = eventType === 'corporate' && (eventScale === 'large' || eventScale === 'vip');

  const getAddonPrice = (addon) => isCorporateGala ? addon.price * 2 : addon.price;

  const filteredAddons = (pricingData?.app?.add_ons || []).filter((addon) => {
    if (isVirtual) return addon.event_types && addon.event_types.includes('virtual');
    if (isAdult && bundleType) return addon.service_types && addon.service_types.includes('bundle');
    return false;
  });

  const totalAddonsCost = selectedAddons.reduce((sum, id) => {
    const addon = pricingData?.app?.add_ons?.find((a) => a.id === id);
    return sum + (addon ? getAddonPrice(addon) : 0);
  }, 0);

  const totalInvestment = selectedPackagePrice.price + totalAddonsCost + kidsAddonCost;
  const depositAmount = Math.round(totalInvestment * 0.10);

  // ── Form Validity ──────────────────────────────────────────────────────────

  const isFormValid = () => {
    if (!eventDate) return false;
    if (isVirtual) return !!virtualDuration;
    if (isKidsBirthday) return true;
    return !!(performer && bundleType);
  };

  // ── Booking Handlers ───────────────────────────────────────────────────────

  const openBookingModal = (option) => {
    setBookingOption(option);
    setFullName(''); setEmail(''); setPhone('');
    setEventTime(''); setVenueAddress(''); setAdditionalNotes('');
    setShowContactModal(true);
  };

  const handleContactSubmit = async () => {
    if (!email || !fullName) { alert('Please enter your name and email'); return; }
    setShowContactModal(false);
    if (bookingOption === 'hold') {
      setShowPaymentOptions(true);
    } else {
      await handleConfirmNow();
    }
  };

  const buildPackageDetails = () => {
    if (isVirtual) {
      return {
        type: 'Virtual Experience',
        performer: 'Johnny Wu',
        duration: `${virtualDuration} Minutes`,
        tier: 'Virtual Show',
        packagePrice: selectedPackagePrice.price,
        addons: 'None',
        magicians: '',
        totalInvestment,
      };
    }
    if (isKidsBirthday) {
      return {
        type: "Kids Birthday Stage Show",
        performer: "Dylan George",
        duration: "30 Minutes",
        tier: "Kids Show",
        packagePrice: selectedPackagePrice.price,
        addons: kidsCloseUpAddon ? '+30m Close-Up Add-on ($250)' : 'None',
        magicians: '',
        totalInvestment,
      };
    }
    const baseCloseUpMin = bundleType === 'standard' ? 60 : 120;
    const totalCloseUpMin = baseCloseUpMin + extraCloseUpMinutes;
    const bundleLabel = bundleType === 'standard' ? 'Signature Bundle' : 'Premium Bundle';
    return {
      type: bundleLabel,
      performer: performer === 'johnny_wu' ? 'Johnny Wu' : 'Dylan George',
      duration: `${totalCloseUpMin} min Close-Up + ${stageDuration} min Stage`,
      tier: 'Signature',
      packagePrice: selectedPackagePrice.price,
      addons: selectedAddons.length > 0
        ? selectedAddons.map((id) => pricingData?.app?.add_ons?.find((a) => a.id === id)?.label).join(', ')
        : 'None',
      magicians: '1',
      totalInvestment,
    };
  };

  const handleStripePayment = async () => {
    setIsProcessingPayment(true);
    try {
      const response = await base44.functions.invoke('createHoldDateCheckout', {
        amount: depositAmount,
        customerEmail: email,
        customerName: fullName,
        packageDetails: buildPackageDetails(),
        eventDate,
        phone,
        additionalNotes,
      });
      if (response.data.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Stripe error:', error);
      alert('Failed to create payment session. Please try again or use Zelle/Venmo.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleManualPaymentConfirmation = async (paymentMethod) => {
    if (!email || !fullName) { alert('Please enter your contact details'); return; }
    setIsSubmitting(true);
    setShowPaymentOptions(false);
    const currentTime = new Date();
    const expiryTime = addHours(currentTime, 48);

    try {
      await base44.functions.invoke('sendHoldDateConfirmation', {
        customerName: fullName,
        customerEmail: email,
        customerPhone: phone,
        eventDate,
        packageDetails: buildPackageDetails(),
        depositAmount,
        totalInvestment,
        eventTime,
        venueAddress,
        additionalNotes,
        holdExpiryTime: expiryTime.toISOString(),
        requestTime: currentTime.toISOString(),
        paymentMethod,
      });
      setHoldExpiryTime(expiryTime);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Hold date error:', error);
      setHoldExpiryTime(expiryTime);
      setShowSuccessModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmNow = async () => {
    if (!email || !fullName) { alert('Please enter your contact details'); return; }
    setIsSubmitting(true);
    try {
      const pkg = buildPackageDetails();
      const eventDateFormatted = eventDate
        ? new Date(eventDate + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'Not specified';

      let eventTypeDisplay = 'Private Event';
      if (eventType === 'wedding') eventTypeDisplay = 'Wedding';
      else if (eventType === 'bar_bat_mitzvah') eventTypeDisplay = 'Bar/Bat Mitzvah';
      else if (eventType === 'corporate') eventTypeDisplay = isCorporateGala ? 'Corporate Gala' : 'Corporate Event';
      else if (isVirtual) eventTypeDisplay = 'Virtual Event';
      else if (isKidsBirthday) eventTypeDisplay = "Kids Birthday Party";

      const bookingEmailBody = `
<!DOCTYPE html><html><head><style>
body{font-family:'Courier New',monospace;background:#f5f5f5;padding:20px;}
.container{background:white;padding:30px;max-width:700px;margin:0 auto;border:2px solid #333;}
.header{text-align:center;border-top:3px solid #333;border-bottom:3px solid #333;padding:15px 0;margin-bottom:30px;font-size:20px;font-weight:bold;}
.section{margin-bottom:25px;}
.section-title{font-size:16px;font-weight:bold;margin-bottom:10px;}
.section-content{margin-left:20px;line-height:1.8;}
.highlight{background:#fff3cd;padding:2px 5px;}
</style></head><body><div class="container">
<div class="header">📋 NEW BOOKING REQUEST</div>
<div class="section"><div class="section-title">📅 EVENT DETAILS</div>
<div class="section-content">
<div><strong>Date:</strong> ${eventDateFormatted}</div>
${eventTime ? `<div><strong>Time:</strong> ${eventTime}</div>` : ''}
${venueAddress ? `<div><strong>Venue:</strong> ${venueAddress}</div>` : ''}
<div><strong>Type:</strong> ${eventTypeDisplay}</div>
<div><strong>Performer:</strong> ${pkg.performer}</div>
</div></div>
<div class="section"><div class="section-title">🎭 PACKAGE</div>
<div class="section-content">
<div><strong>Bundle:</strong> ${pkg.type}</div>
<div><strong>Duration:</strong> ${pkg.duration}</div>
<div><strong>Tier:</strong> ${pkg.tier}</div>
<div><strong>Package Price:</strong> $${pkg.packagePrice.toLocaleString()}</div>
</div></div>
<div class="section"><div class="section-title">✨ ADD-ONS</div>
<div class="section-content">${pkg.addons}</div></div>
<div class="section"><div class="section-title">💰 PRICING SUMMARY</div>
<div class="section-content">
<div>Package: $${pkg.packagePrice.toLocaleString()}</div>
<div>Add-ons: $${totalAddonsCost.toLocaleString()}</div>
<div style="border-top:2px solid #333;margin:10px 0;padding-top:10px;"><strong>TOTAL: <span class="highlight">$${totalInvestment.toLocaleString()}</span></strong></div>
</div></div>
<div class="section"><div class="section-title">👤 CUSTOMER</div>
<div class="section-content">
<div><strong>Name:</strong> ${fullName}</div>
<div><strong>Email:</strong> ${email}</div>
<div><strong>Phone:</strong> ${phone || 'Not provided'}</div>
</div></div>
${additionalNotes ? `<div class="section"><div class="section-title">📝 NOTES</div><div class="section-content">${additionalNotes}</div></div>` : ''}
</div></body></html>`;

      await base44.integrations.Core.SendEmail({
        to: 'hello@omnimagic.co',
        subject: `📋 New Booking Request – ${pkg.type}`,
        body: bookingEmailBody,
      });

      await base44.integrations.Core.SendEmail({
        to: email,
        subject: `✨ Your Omni Magic Booking Request Received!`,
        body: `<p>Hi ${fullName},</p><p>We've received your booking request and will send you an official contract and invoice within 24 hours.</p><p>Questions? Email us at <a href="mailto:hello@omnimagic.co">hello@omnimagic.co</a></p><p>– The Omni Magic Team</p>`,
      });

      setShowSuccessModal(true);
    } catch (error) {
      console.error('Confirm now error:', error);
      setShowSuccessModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Stripe success redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    const sessionId = params.get('session_id');
    if (paymentStatus === 'success' && sessionId) {
      base44.functions.invoke('handleStripeSuccess', { sessionId }).then((res) => {
        if (res.data?.success) {
          setHoldExpiryTime(new Date(res.data.expiryTime));
          setEmail(res.data.customerEmail);
          setShowSuccessModal(true);
        }
      }).catch(() => setShowSuccessModal(true));
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('payment');
      newUrl.searchParams.delete('session_id');
      window.history.replaceState({}, document.title, newUrl.toString());
    }
  }, []);

  const handleVideoPlay = (url) => {
    let embedUrl = url;
    if (url.includes('youtu.be')) {
      embedUrl = `https://www.youtube.com/embed/${url.split('youtu.be/')[1].split('?')[0]}`;
    } else if (url.includes('youtube.com/watch')) {
      embedUrl = `https://www.youtube.com/embed/${url.split('v=')[1].split('&')[0]}`;
    }
    setVideoUrl(embedUrl);
    setShowVideoModal(true);
  };

  // ── Bundle price preview helper ────────────────────────────────────────────
  const getBundlePreviewPrice = (perf, type) => {
    const result = calculateBundlePrice(perf, 'signature', type === 'standard' ? 1 : 2, 1, 30, eventType, eventScale, eventDate);
    return result.price;
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; font-size: 15px; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); }
      `}</style>

      <div className="min-h-screen bg-slate-900">
        <div style={{ backgroundImage: `url(${backgroundImageUrl})` }}
          className="fixed inset-0 bg-cover bg-center filter brightness-[0.3] z-0" />

        <div className="relative z-10">
          {/* Header */}
          <div className="h-[200px] md:h-[250px] flex flex-col items-center justify-center px-4">
            <a href={createPageUrl('Home')} className="cursor-pointer">
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9fdb80e10eb3dae94dfbf/705652e3a_logowhitewordstransparent.png"
                alt="Omni Magic Entertainment"
                className="h-16 md:h-20 mb-3 drop-shadow-2xl hover:opacity-80 transition-opacity" />
            </a>
            <h1 className="text-white text-[22px] md:text-[28px] font-semibold text-center mb-2">Reserve Your Experience</h1>
            <p className="text-slate-200 text-[13px] md:text-[15px] text-center max-w-2xl mb-3">
              Select your package and secure your date
            </p>
            <a href="https://omnimagic.co" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-medium text-[13px] rounded-lg transition-all">
              Visit Omnimagic.co <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <div className="max-w-[900px] mx-auto px-4 pb-24">

            {/* Event Date */}
            <div className="bg-slate-800/90 rounded-xl border-2 border-slate-600 mb-6 shadow-xl overflow-hidden">
              <div className="p-4 md:p-6">
                <h2 className="text-white text-[18px] md:text-[22px] font-bold mb-1 text-center">Event Date</h2>
                <p className="text-amber-400 text-[13px] text-center mb-4">* Required to calculate accurate pricing</p>
                <div className="max-w-md mx-auto">
                  <Input type="date" value={eventDate} onChange={handleDateChange} min={getTodayDate()} required
                    className="w-full bg-slate-700 border-2 border-slate-500 focus:border-amber-500 text-white text-[13px] md:text-[14px] h-10 px-3 rounded-lg" />
                </div>
                {eventDate && isPeakDate(eventDate) && (
                  <div className="mt-3 p-3 bg-amber-500/20 border-2 border-amber-500/40 rounded-lg text-amber-300 text-[13px] text-center max-w-md mx-auto">
                    🔥 <span className="font-semibold">High demand date</span> — 1.5× pricing applies
                  </div>
                )}
                {isKidsBirthday && eventDate && (
                  <div className="mt-3 p-3 bg-slate-700/50 border border-slate-500 rounded-lg text-slate-200 text-[13px] text-center max-w-md mx-auto">
                    {isWeekend(eventDate) ? '📅 Weekend rate: $695' : '📅 Weekday rate: $595'}
                  </div>
                )}
              </div>
            </div>

            {/* Location Notice */}
            <div className="bg-blue-900/30 border-2 border-blue-500/50 rounded-xl p-4 mb-6 shadow-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="text-blue-200 text-[13px] md:text-[14px] leading-relaxed">
                  Pricing shown is for events within <span className="font-semibold text-white">Southern California</span> (within 50 miles of Los Angeles).
                  Outside this area? <a href="mailto:hello@omnimagic.co" className="text-blue-400 hover:text-blue-300 underline font-medium">Contact us</a> for a custom quote.
                </p>
              </div>
            </div>

            {/* ── VIRTUAL ───────────────────────────────────────────────────── */}
            {isVirtual && (
              <div className="bg-slate-800/90 rounded-lg border border-slate-700 p-4 md:p-6 mb-4 shadow-sm">
                <div className="text-center mb-6">
                  <h2 className="text-white text-[22px] md:text-[26px] font-bold mb-2">Virtual Magic & Mentalism Show</h2>
                  <p className="text-slate-200 text-[14px] max-w-2xl mx-auto">
                    World-class magic, mind reading, and connection straight to your screen — no travel required.
                  </p>
                </div>

                <div className="space-y-3 max-w-2xl mx-auto">
                  {[
                    { value: '30', label: 'Virtual Experience 30m', price: 1499, desc: 'Perfect for team meetings or quick virtual celebrations.' },
                    { value: '45', label: 'Virtual Experience 45m', price: 1999, badge: 'MOST POPULAR', desc: 'Interactive, fast-paced, and unforgettable. Includes hypnosis and mind reading.' },
                    { value: '60', label: 'Virtual Experience 60m', price: 2499, desc: 'Full experience with hypnosis, mind reading + 15-min magic masterclass.' },
                  ].map((opt) => (
                    <button key={opt.value} onClick={() => setVirtualDuration(opt.value)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${virtualDuration === opt.value ? 'border-amber-500 bg-amber-500/10' : 'border-slate-600 hover:border-slate-500'}`}>
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="text-white text-[17px] font-bold">{opt.label} — ${opt.price.toLocaleString()}</h4>
                        {opt.badge && <span className="text-[11px] bg-blue-500 text-white px-2 py-1 rounded font-medium">{opt.badge}</span>}
                      </div>
                      <p className="text-slate-200 text-[13px]">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── KIDS BIRTHDAY ─────────────────────────────────────────────── */}
            {isKidsBirthday && (
              <div className="bg-slate-800/90 rounded-lg border border-slate-700 p-4 md:p-6 mb-4 shadow-sm">
                <h2 className="text-white text-[20px] md:text-[24px] font-bold mb-2 text-center">Kids' Birthday Magic (Dylan George)</h2>
                <p className="text-slate-300 text-[14px] text-center mb-6 max-w-2xl mx-auto">
                  A high‑energy, kid‑friendly show that parents love and kids talk about for weeks.
                </p>

                <div className="max-w-md mx-auto space-y-4">
                  <div className="bg-slate-700/60 rounded-lg p-4 border border-slate-600">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-white font-semibold text-[16px]">30-Minute Stage Show</p>
                        <p className="text-slate-300 text-[13px]">Performer: Dylan George</p>
                      </div>
                      <div className="text-right">
                        <p className="text-amber-400 font-bold text-[20px]">
                          ${eventDate ? (isWeekend(eventDate) ? KIDS_PRICING.weekend : KIDS_PRICING.weekday).toLocaleString() : '595–695'}
                        </p>
                        <p className="text-slate-400 text-[11px]">{eventDate ? (isWeekend(eventDate) ? 'Weekend' : 'Weekday') : 'Weekday / Weekend'}</p>
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => setKidsCloseUpAddon(!kidsCloseUpAddon)}
                    className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${kidsCloseUpAddon ? 'border-amber-500 bg-amber-500/10' : 'border-slate-600 hover:border-slate-500'}`}>
                    <Checkbox checked={kidsCloseUpAddon} onCheckedChange={setKidsCloseUpAddon} className="mt-0.5" />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="text-white text-[14px] font-medium">Add +30 Minutes Close-Up Magic</span>
                        <span className="text-amber-400 text-[14px] font-semibold">+$250</span>
                      </div>
                      <p className="text-slate-300 text-[12px] mt-1">Intimate magic mingling before or after the show.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── ADULT BUNDLE SELECTOR ─────────────────────────────────────── */}
            {isAdult && (
              <div className="bg-slate-800/90 rounded-lg border border-slate-700 p-4 md:p-6 mb-4 shadow-sm">
                <h2 className="text-white text-[20px] md:text-[24px] font-bold mb-1 text-center">Choose Your Package</h2>
                <p className="text-slate-300 text-[13px] text-center mb-4">Every bundle includes close-up mingling magic + a stage show</p>

                {/* Elite Experience anchor card */}
                <div className="mb-6 p-4 rounded-lg border-2 border-amber-500/40 bg-gradient-to-br from-amber-900/20 to-slate-800/60">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] bg-amber-500/30 text-amber-300 px-2 py-0.5 rounded font-semibold tracking-wide uppercase">Elite Experience</span>
                      </div>
                      <p className="text-white font-bold text-[15px] mb-1">Fully Custom Luxury Production – from $9,500</p>
                      <p className="text-slate-300 text-[13px]">Reserved for luxury brands, high-profile galas, and celebrity-level events. Fully bespoke scripting, expanded cast, and premium production design. <a href="mailto:hello@omnimagic.co" className="text-amber-400 hover:text-amber-300 underline">Contact us to inquire.</a></p>
                    </div>
                  </div>
                </div>

                {/* Performer Selection */}
                <div className="mb-6">
                  <Label className="text-white text-[14px] mb-3 block font-semibold">Select Performer</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      {
                        id: 'johnny_wu',
                        name: 'Johnny Wu',
                        title: 'Johnny Wu – Founder & Headlining Magician',
                        subhead: 'Ideal for galas, luxury weddings, and high‑profile corporate events.',
                        badge: 'Premium',
                        bullets: [
                          'Celebrity magician featured on Netflix and The Kardashians',
                          'Trusted by dozens of Fortune 500 companies for their biggest events',
                          'Elite magic, mentalism, and hypnosis with limited annual availability',
                        ],
                        pricing: [
                          'Signature Bundle: 1 hour close‑up + 30 minute stage show – from $3,500',
                          'Premium Bundle: 2 hours close‑up + 30 minute stage show – from $5,000',
                        ],
                        cta: 'Request Johnny for My Event',
                      },
                      {
                        id: 'dylan_george',
                        name: 'Dylan George',
                        title: 'Dylan George – Lead Magician & Crowd Favorite',
                        subhead: 'Ideal for weddings, private parties, and corporate events that want the Omni Magic experience with more date availability.',
                        badge: 'Most Booked',
                        bullets: [
                          'Delivers the same Omni Magic style and routines as seen with Johnny',
                          'Personally trained and directed by Johnny Wu',
                          'Perfect for most events, with more flexible scheduling',
                        ],
                        pricing: [
                          'Signature Bundle: 1 hour close‑up + 30 minute stage show – $1,750',
                          'Premium Bundle: 2 hours close‑up + 30 minute stage show – $2,250',
                        ],
                        cta: 'Book Dylan for My Event',
                      },
                    ].map((p) => (
                      <button key={p.id} onClick={() => { setPerformer(p.id); setExtraCloseUpMinutes(0); setStageDuration(30); }}
                        className={`p-5 rounded-lg border-2 text-left transition-all ${performer === p.id ? 'border-amber-500 bg-amber-500/10' : 'border-slate-600 hover:border-slate-500'}`}>
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-white font-bold text-[15px] leading-snug pr-2">{p.title}</p>
                          <span className={`text-[11px] px-2 py-1 rounded font-medium whitespace-nowrap flex-shrink-0 ${p.badge === 'Premium' ? 'bg-amber-500/20 text-amber-300' : 'bg-green-600/70 text-white'}`}>
                            {p.badge}
                          </span>
                        </div>
                        <p className="text-slate-300 text-[13px] mb-3 italic">{p.subhead}</p>
                        <ul className="space-y-1 mb-3">
                          {p.bullets.map((b, i) => (
                            <li key={i} className="text-slate-200 text-[12px] flex items-start gap-2">
                              <span className="text-amber-400 mt-0.5">✓</span>{b}
                            </li>
                          ))}
                        </ul>
                        <div className="space-y-1 mb-3 border-t border-slate-600 pt-3">
                          {p.pricing.map((line, i) => (
                            <p key={i} className="text-amber-300 text-[12px] font-medium">{line}</p>
                          ))}
                        </div>
                        <div className={`text-center text-[13px] font-semibold px-3 py-2 rounded transition-all ${performer === p.id ? 'bg-amber-500 text-slate-900' : 'bg-slate-700 text-white'}`}>
                          {p.cta}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bundle Type Selection */}
                <div>
                  <Label className="text-white text-[14px] mb-3 block font-semibold">Select Bundle</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      {
                        key: 'standard',
                        label: 'Signature Bundle',
                        sub: '1 Hour Close-Up + 30 Min Stage',
                        badge: '⭐ Most Popular',
                      },
                      {
                        key: 'premium',
                        label: 'Premium Bundle',
                        sub: '2 Hours Close-Up + 30 Min Stage',
                      },
                    ].map((b) => {
                      const previewPrice = getBundlePreviewPrice(performer, b.key);
                      return (
                        <button key={b.key} onClick={() => { setBundleType(b.key); setExtraCloseUpMinutes(0); setStageDuration(30); }}
                          className={`p-4 rounded-lg border-2 text-left transition-all ${bundleType === b.key ? 'border-amber-500 bg-amber-500/10' : 'border-slate-600 hover:border-slate-500'}`}>
                          <div className="flex justify-between items-start mb-1">
                            <p className="text-white font-bold text-[15px]">{b.label}</p>
                            {b.badge && <span className="text-[10px] bg-green-600/80 text-white px-2 py-1 rounded font-medium">{b.badge}</span>}
                          </div>
                          <p className="text-slate-300 text-[13px] mb-2">{b.sub}</p>
                          <p className="text-amber-400 font-bold text-[18px]">
                            {previewPrice > 0 ? `$${previewPrice.toLocaleString()}` : '—'}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Customize Your Time */}
                {bundleType && (
                  <div className="mt-6 border-t border-slate-600 pt-5 space-y-5">
                    <h3 className="text-white text-[16px] font-bold">Customize Your Time</h3>

                    {/* Close-up add-on — only for Standard (Premium already at 2h max) */}
                    {bundleType === 'standard' ? (
                      <div>
                        <Label className="text-slate-200 text-[13px] mb-2 block">Add more mingling magic?</Label>
                        <div className="space-y-2">
                          {[
                            { value: 0,  label: 'Keep it at 1 hour (included)', extra: null },
                            { value: 30, label: '+30 min close‑up magic → 1.5 hours total', extra: performer === 'johnny_wu' ? 750 : 300 },
                            { value: 60, label: '+60 min close‑up magic → 2 hours total',   extra: performer === 'johnny_wu' ? 1500 : 600 },
                          ].map((opt) => (
                            <button key={opt.value} onClick={() => setExtraCloseUpMinutes(opt.value)}
                              className={`w-full text-left px-4 py-2.5 rounded border-2 text-[13px] transition-all flex justify-between items-center ${extraCloseUpMinutes === opt.value ? 'border-amber-500 bg-amber-500/10 text-white font-medium' : 'border-slate-600 hover:border-slate-500 text-slate-300'}`}>
                              <span>{opt.label}</span>
                              {opt.extra && <span className="text-amber-400 font-semibold">+${opt.extra.toLocaleString()}</span>}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-slate-700/40 rounded border border-slate-600">
                        <p className="text-slate-300 text-[13px]">✓ Premium bundle already includes the maximum 2 hours of close‑up magic.</p>
                      </div>
                    )}

                    {/* Stage upgrade */}
                    <div>
                      <Label className="text-slate-200 text-[13px] mb-1 block">Extend the stage show?</Label>
                      <p className="text-slate-400 text-[12px] mb-2">All bundles include a 30‑minute feature show.</p>
                      <div className="space-y-2">
                        {[
                          { value: 30, label: '30 minutes (included)',          extra: null },
                          { value: 45, label: 'Upgrade to 45 minutes',          extra: performer === 'johnny_wu' ? 500  : 250 },
                          { value: 60, label: 'Upgrade to 60 minutes',          extra: performer === 'johnny_wu' ? 1000 : 500 },
                        ].map((opt) => (
                          <button key={opt.value} onClick={() => setStageDuration(opt.value)}
                            className={`w-full text-left px-4 py-2.5 rounded border-2 text-[13px] transition-all flex justify-between items-center ${stageDuration === opt.value ? 'border-amber-500 bg-amber-500/10 text-white font-medium' : 'border-slate-600 hover:border-slate-500 text-slate-300'}`}>
                            <span>{opt.label}</span>
                            {opt.extra && <span className="text-amber-400 font-semibold">+${opt.extra.toLocaleString()}</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── WHY OMNI MAGIC ────────────────────────────────────────────── */}
            {isAdult && (
              <div className="bg-slate-800/90 rounded-lg border border-slate-700 p-5 md:p-6 mb-4">
                <h2 className="text-white text-[20px] md:text-[24px] font-bold mb-1">Why Omni Magic Isn't Like "Top‑Hat" Magicians</h2>
                <p className="text-slate-300 text-[14px] mb-5">Modern, cinematic magic and mentalism trusted by the world's most demanding clients.</p>
                <div className="space-y-4">
                  {[
                    {
                      icon: '⭐',
                      title: '2,100+ Five‑Star Reviews',
                      body: "Between Yelp and Google, we've earned over 2,100 five‑star reviews from couples, planners, and corporate teams. That's thousands of real people betting their reputation on us — and winning.",
                    },
                    {
                      icon: '🎬',
                      title: 'Proven on Netflix & The Kardashians',
                      body: "Our magic has been featured on Netflix and The Kardashians, and on stages for household‑name brands. This isn't kids' party magic scaled up; it's world‑class entertainment built for TV, VIP rooms, and high‑stakes events.",
                    },
                    {
                      icon: '🏢',
                      title: 'Fortune 500 Trusted',
                      body: "We've performed for dozens of Fortune 500 companies who can hire anyone they want. They keep bringing us back because we're easy to work with, on time, and obsess over making them look like heroes.",
                    },
                    {
                      icon: '🧠',
                      title: 'Modern Mentalism, Not Cheesy Tricks',
                      body: "No rabbits, no clown suits, no awkward top hats. You get sophisticated psychological illusions, mind‑reading, and interactive moments your guests actually care about.",
                    },
                    {
                      icon: '🤝',
                      title: 'White‑Glove, Turnkey Experience',
                      body: "We coordinate with your planner, AV team, and venue so the show feels seamless. You pick the date and the package — we handle the details.",
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-3">
                      <span className="text-[20px] flex-shrink-0 mt-0.5">{item.icon}</span>
                      <div>
                        <p className="text-white font-semibold text-[14px] mb-0.5">{item.title}</p>
                        <p className="text-slate-300 text-[13px] leading-relaxed">{item.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── PROOF BAND ────────────────────────────────────────────────── */}
            {isAdult && bundleType && (
              <div className="bg-slate-800/80 rounded-lg border border-slate-600 p-4 mb-4">
                <p className="text-white font-bold text-[15px] text-center mb-1">2,100+ Five‑Star Reviews.</p>
                <p className="text-slate-300 text-[13px] text-center mb-4">Trusted by Netflix, The Kardashians, and Fortune 500 companies.</p>
                <div className="flex flex-wrap justify-center gap-4 mb-4 text-center">
                  <div className="text-slate-200 text-[13px]">⭐⭐⭐⭐⭐ <span className="font-semibold text-white">2,100+ Five-Star Reviews</span></div>
                  <div className="text-slate-400 hidden sm:block">|</div>
                  <div className="text-slate-200 text-[13px]">🎬 <span className="font-semibold text-white">Netflix & The Kardashians</span></div>
                  <div className="text-slate-400 hidden sm:block">|</div>
                  <div className="text-slate-200 text-[13px]">🏢 <span className="font-semibold text-white">Fortune 500 Trusted</span></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  {[
                    { quote: "Johnny left our entire gala speechless. Even our CEO, who's seen everything, couldn't stop talking about it.", name: "Sarah K.", event: "Corporate Gala, 400 guests" },
                    { quote: "Our wedding guests are still texting us about Dylan. Best decision we made for the reception.", name: "Michael & Jess T.", event: "Wedding, Newport Beach" },
                    { quote: "We've hired entertainment for 15+ company events. Omni Magic is on a completely different level.", name: "David L.", event: "Annual Holiday Party" },
                  ].map((t, i) => (
                    <div key={i} className="bg-slate-700/50 rounded p-3 border border-slate-600">
                      <p className="text-slate-200 text-[12px] italic mb-2">"{t.quote}"</p>
                      <p className="text-amber-400 text-[12px] font-semibold">{t.name}</p>
                      <p className="text-slate-400 text-[11px]">{t.event}</p>
                    </div>
                  ))}
                </div>
                {/* Micro guarantee */}
                <div className="bg-slate-700/40 border border-slate-500 rounded p-3 text-center">
                  <p className="text-slate-200 text-[12px] leading-relaxed">
                    <span className="text-amber-400 font-semibold">Our Promise:</span> If your guests don't rave about the magic, email us within 24 hours and we'll jump on a call to make it right — including a credit toward a future performance.
                  </p>
                </div>
              </div>
            )}

            {/* ── PACKAGE SUMMARY ───────────────────────────────────────────── */}
            {isFormValid() && selectedPackagePrice.price > 0 && (
              <div className="bg-slate-800/90 rounded-lg border border-slate-700 p-4 md:p-5 mb-4 shadow-sm">
                <h2 className="text-white text-[18px] font-semibold mb-3">Your Selected Package</h2>

                <div className="space-y-2 mb-3 text-[14px]">
                  {isAdult && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Performer</span>
                        <span className="text-white font-medium">{performer === 'johnny_wu' ? 'Johnny Wu' : 'Dylan George'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Bundle</span>
                        <span className="text-white font-medium">{bundleType === 'standard' ? 'Signature Bundle' : 'Premium Bundle'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Close-Up</span>
                        <span className="text-white font-medium">{(bundleType === 'standard' ? 60 : 120) + extraCloseUpMinutes} min mingling magic</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Stage Show</span>
                        <span className="text-white font-medium">{stageDuration} minutes</span>
                      </div>
                    </>
                  )}
                  {isVirtual && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Service</span>
                        <span className="text-white font-medium">Virtual Experience {virtualDuration}m</span>
                      </div>
                    </>
                  )}
                  {isKidsBirthday && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Service</span>
                        <span className="text-white font-medium">30-Minute Kids Stage Show</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Performer</span>
                        <span className="text-white font-medium">Dylan George</span>
                      </div>
                    </>
                  )}
                  {selectedPackagePrice.multiplier > 1 && (
                    <div className="flex justify-between text-amber-300">
                      <span>Peak Date Multiplier</span>
                      <span>×{selectedPackagePrice.multiplier}</span>
                    </div>
                  )}
                </div>

                {kidsCloseUpAddon && (
                  <div className="flex justify-between text-[14px] mb-2">
                    <span className="text-slate-300">+30m Close-Up Add-on</span>
                    <span className="text-amber-400 font-medium">+${KIDS_PRICING.closeup_addon.toLocaleString()}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-600 flex justify-between items-center">
                  <span className="text-white text-[15px] font-semibold">Package Price</span>
                  <span className="text-amber-400 text-[22px] font-bold">
                    ${(selectedPackagePrice.price + kidsAddonCost).toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* ── ADD-ONS ───────────────────────────────────────────────────── */}
            {isFormValid() && filteredAddons.length > 0 && (
              <div className="bg-slate-800/90 rounded-lg border border-slate-700 p-4 md:p-5 mb-4 shadow-sm">
                <h2 className="text-white text-[18px] font-semibold mb-3">Add-Ons (Optional)</h2>
                <div className="space-y-2">
                  {filteredAddons.map((addon) => (
                    <div key={addon.id}
                      className={`flex items-start gap-3 p-3 rounded border-2 transition-all bg-slate-700/70 ${selectedAddons.includes(addon.id) ? 'border-amber-500 bg-amber-500/10' : 'border-slate-500'}`}>
                      <Checkbox id={addon.id} checked={selectedAddons.includes(addon.id)}
                        onCheckedChange={() => setSelectedAddons((prev) => prev.includes(addon.id) ? prev.filter((id) => id !== addon.id) : [...prev, addon.id])}
                        className="mt-0.5" />
                      <label htmlFor={addon.id} className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white text-[14px] font-medium">{addon.label}</span>
                          <span className="text-amber-400 text-[14px] font-semibold">+${getAddonPrice(addon).toLocaleString()}</span>
                        </div>
                        <p className="text-slate-200 text-[12px]">{addon.tooltip}</p>
                        {addon.preview_url && (
                          <button type="button" onClick={(e) => { e.preventDefault(); handleVideoPlay(addon.preview_url); }}
                            className="text-blue-400 text-[11px] hover:text-blue-300 inline-flex items-center gap-1 mt-1">
                            <Play className="w-3 h-3" /> Watch Demo
                          </button>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
                {selectedAddons.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-600 flex justify-between items-center">
                    <span className="text-slate-200 text-[13px]">{selectedAddons.length} add-on{selectedAddons.length > 1 ? 's' : ''} selected</span>
                    <span className="text-amber-400 text-[15px] font-semibold">+${totalAddonsCost.toLocaleString()}</span>
                  </div>
                )}
              </div>
            )}

            {/* ── BOOKING OPTIONS ───────────────────────────────────────────── */}
            {isFormValid() && selectedPackagePrice.price > 0 && (
              <div className="bg-slate-800/90 rounded-lg border border-slate-700 p-4 md:p-5 mb-4 shadow-sm">
                <h2 className="text-white text-[18px] font-semibold mb-3">Complete Your Booking</h2>

                <div className="bg-slate-700/50 rounded p-3 mb-4">
                  <div className="flex justify-between text-[13px] mb-1">
                    <span className="text-slate-200">Package</span>
                    <span className="text-white">${(selectedPackagePrice.price + kidsAddonCost).toLocaleString()}</span>
                  </div>
                  {totalAddonsCost > 0 && (
                    <div className="flex justify-between text-[13px] mb-1">
                      <span className="text-slate-200">Add-ons</span>
                      <span className="text-white">+${totalAddonsCost.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-600 flex justify-between items-center">
                    <span className="text-white text-[15px] font-semibold">Total Investment</span>
                    <span className="text-amber-400 text-[18px] font-bold">${totalInvestment.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button onClick={() => openBookingModal('hold')}
                    className="w-full text-left p-3 rounded border-2 border-slate-600 hover:border-blue-500 hover:bg-blue-500/10 transition-all">
                    <div className="flex justify-between items-center">
                      <span className="text-white text-[14px] font-medium">Hold the Date (10% Deposit)</span>
                      <span className="text-blue-400 text-[16px] font-semibold">${depositAmount.toLocaleString()}</span>
                    </div>
                    <p className="text-slate-300 text-[12px] mt-1">Non-refundable · Holds your date for 48 hours</p>
                  </button>

                  <button onClick={() => openBookingModal('confirm')}
                    className="w-full text-left p-3 rounded border-2 border-slate-600 hover:border-green-500 hover:bg-green-500/10 transition-all">
                    <div className="flex justify-between items-center">
                      <span className="text-white text-[14px] font-medium">Confirm Now</span>
                      <span className="text-green-400 text-[14px]">Contract & Invoice</span>
                    </div>
                    <p className="text-slate-300 text-[12px] mt-1">We'll send you an official contract and invoice via email</p>
                  </button>
                </div>

                {/* Payment options (after hold) */}
                {showPaymentOptions && (
                  <div className="space-y-4 mt-4 pt-4 border-t border-slate-600">
                    <Label className="text-white text-[16px] block font-semibold">Choose Payment Method</Label>

                    <div className="p-4 bg-gradient-to-br from-indigo-900/30 to-slate-800/70 rounded-lg border-2 border-indigo-500/50">
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="w-6 h-6 text-indigo-400" />
                        <span className="text-white text-[16px] font-semibold">Credit Card / Apple Pay</span>
                      </div>
                      <p className="text-slate-200 text-[13px] mb-3">Secure payment with Stripe · Instant confirmation</p>
                      <Button onClick={handleStripePayment} disabled={isProcessingPayment}
                        className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-semibold">
                        {isProcessingPayment ? 'Processing...' : `Pay $${depositAmount.toLocaleString()} Now`}
                      </Button>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-600"></div></div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-slate-900 text-slate-400">Or pay manually</span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-700/50 rounded border border-slate-600">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-5 h-5 text-purple-400" />
                        <span className="text-white text-[14px] font-medium">Pay with Zelle</span>
                      </div>
                      <p className="text-slate-200 text-[12px] mb-3">Send ${depositAmount.toLocaleString()} to: <span className="text-white font-medium">626-242-7710</span></p>
                      <img src={zelleQRCodeUrl} alt="Zelle QR Code"
                        className="w-48 h-48 mx-auto rounded cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setShowZelleModal(true)} />
                      <p className="text-slate-400 text-[11px] text-center mt-2">Click to enlarge</p>
                    </div>

                    <div className="p-3 bg-slate-700/50 rounded border border-slate-600">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-5 h-5 text-blue-400" />
                        <span className="text-white text-[14px] font-medium">Pay with Venmo</span>
                      </div>
                      <a href="https://venmo.com/u/johnnywumagic" target="_blank" rel="noopener noreferrer"
                        className="text-blue-400 text-[13px] hover:text-blue-300 inline-flex items-center gap-1">
                        @johnnywumagic <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    <div className="pt-4 border-t border-slate-600">
                      <p className="text-amber-400 text-[13px] mb-3 text-center font-semibold">
                        ⚠️ After completing Zelle or Venmo payment, click below:
                      </p>
                      <div className="flex gap-3">
                        <Button onClick={() => handleManualPaymentConfirmation('Zelle')} disabled={isSubmitting}
                          className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white font-semibold">
                          {isSubmitting ? 'Processing...' : 'I Paid with Zelle'}
                        </Button>
                        <Button onClick={() => handleManualPaymentConfirmation('Venmo')} disabled={isSubmitting}
                          className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-semibold">
                          {isSubmitting ? 'Processing...' : 'I Paid with Venmo'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Contact Modal */}
      <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
        <DialogContent className="bg-slate-900 border-2 border-amber-500/50 text-white max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[22px] font-bold text-center text-white mb-1">Enter Your Details</DialogTitle>
            <p className="text-slate-200 text-center text-[13px]">
              {bookingOption === 'hold' ? 'Provide your info to hold this date.' : 'Provide your info to send a booking request.'}
            </p>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label className="text-slate-200 text-[13px] mb-1 block">Full Name *</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Smith"
                className="bg-slate-700 border-slate-600 text-white text-[14px] placeholder-slate-500 h-9" />
            </div>
            <div>
              <Label className="text-slate-200 text-[13px] mb-1 block">Email *</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com"
                className="bg-slate-700 border-slate-600 text-white text-[14px] placeholder-slate-500 h-9" />
            </div>
            <div>
              <Label className="text-slate-200 text-[13px] mb-1 block">Phone</Label>
              <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 123-4567"
                className="bg-slate-700 border-slate-600 text-white text-[14px] placeholder-slate-500 h-9" />
            </div>
            <div>
              <Label className="text-slate-200 text-[13px] mb-1 block">Event Time</Label>
              <Input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white text-[14px] h-9" />
            </div>
            <div>
              <Label className="text-slate-200 text-[13px] mb-1 block">Venue Address</Label>
              <Input value={venueAddress} onChange={(e) => setVenueAddress(e.target.value)} placeholder="123 Main St, Los Angeles, CA"
                className="bg-slate-700 border-slate-600 text-white text-[14px] placeholder-slate-500 h-9" />
            </div>
            <div>
              <Label className="text-slate-200 text-[13px] mb-1 block">Additional Notes</Label>
              <textarea value={additionalNotes} onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Anything we should know?" rows={3}
                className="w-full bg-slate-700 border border-slate-600 text-white text-[14px] placeholder-slate-500 rounded-md p-2" />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowContactModal(false)} className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800">Cancel</Button>
              <Button onClick={handleContactSubmit} disabled={isSubmitting || !fullName || !email}
                className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-medium">
                {isSubmitting ? 'Processing...' : 'Continue'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="bg-slate-900 border-amber-400/30 text-white max-w-md overflow-y-auto">
          <div className="text-center py-6">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-[22px] font-semibold text-white mb-3">
              {bookingOption === 'hold' ? 'Hold Request Sent! 🎉' : 'Request Sent! 📧'}
            </h3>
            {bookingOption === 'hold' ? (
              <>
                <p className="text-[15px] text-slate-200 mb-4">
                  Complete your <span className="font-bold text-amber-400">${depositAmount.toLocaleString()}</span> deposit via Stripe, Zelle, or Venmo within 48 hours to confirm your date.
                </p>
                {holdExpiryTime && (
                  <div className="bg-blue-900/30 rounded p-3 mb-4">
                    <p className="text-blue-400 text-[13px] mb-1">Your hold expires:</p>
                    <p className="text-white text-[16px] font-semibold">{format(holdExpiryTime, 'PPpp')}</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-[15px] text-slate-200 mb-4">
                We've received your booking request and will email you a contract and invoice within 24 hours.
              </p>
            )}
            <Button onClick={() => window.location.reload()}
              className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-medium px-6 h-10">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Video Modal */}
      <Dialog open={showVideoModal} onOpenChange={setShowVideoModal}>
        <DialogContent className="bg-slate-900 border-amber-400/30 text-white max-w-4xl p-0 overflow-y-auto">
          <DialogHeader className="p-4"><DialogTitle className="text-[20px] font-semibold text-white">Add-on Preview</DialogTitle></DialogHeader>
          <div className="relative pb-[56.25%] h-0">
            <iframe src={videoUrl} className="absolute top-0 left-0 w-full h-full rounded-b-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
          </div>
        </DialogContent>
      </Dialog>

      {/* Zelle QR Modal */}
      <Dialog open={showZelleModal} onOpenChange={setShowZelleModal}>
        <DialogContent className="bg-slate-900 border-amber-400/30 text-white max-w-md">
          <DialogHeader><DialogTitle className="text-[20px] font-semibold text-center text-white">Zelle Payment</DialogTitle></DialogHeader>
          <div className="text-center">
            <p className="text-slate-200 text-[14px] mb-4">Scan this QR code to send ${depositAmount.toLocaleString()}</p>
            <img src={zelleQRCodeUrl} alt="Zelle QR Code" className="w-full max-w-sm mx-auto rounded-lg shadow-2xl" />
            <p className="text-white font-bold text-[16px] mt-4">Send to: 626-242-7710</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}