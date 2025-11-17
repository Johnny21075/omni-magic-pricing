
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Star, Gift, CheckCircle, DollarSign, ExternalLink, Play, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format, addHours } from 'date-fns';
import {
  calculateCloseUpPrice,
  calculateStagePrice,
  calculateBundlePrice,
  calculateVirtualPrice,
  calculateFinalPrice,
  isPeakDate,
  getAvailableTiers,
  TIER_DESCRIPTIONS
} from '../components/pricing/pricingCalculations';
import { pricingData } from '../components/pricing/pricingData';
import { createPageUrl } from '@/utils';

const backgroundImageUrl = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9fdb80e10eb3dae94dfbf/e620330f2_IMG_1641.jpg";
const zelleQRCodeUrl = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9fdb80e10eb3dae94dfbf/b227159ae_IMG_2995.jpg";

export default function PricingPage() {
  const [eventDate, setEventDate] = useState('');
  const [selectedService, setSelectedService] = useState(null);

  const [closeUpPerformer, setCloseUpPerformer] = useState('johnny_wu');
  const [closeUpDuration, setCloseUpDuration] = useState('');
  const [closeUpMagicians, setCloseUpMagicians] = useState('');
  const [closeUpTier, setCloseUpTier] = useState('');

  const [stagePerformer, setStagePerformer] = useState('johnny_wu');
  const [stageDuration, setStageDuration] = useState('');
  const [stageTier, setStageTier] = useState('');

  const [bundlePerformer, setBundlePerformer] = useState('johnny_wu');
  const [bundleCloseUpDuration, setBundleCloseUpDuration] = useState('');
  const [bundleNumMagicians, setBundleNumMagicians] = useState('');
  const [bundleStageDuration, setBundleStageDuration] = useState('');
  const [bundleTier, setBundleTier] = useState('');

  const [virtualDuration, setVirtualDuration] = useState('');

  const [selectedAddons, setSelectedAddons] = useState([]);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const [bookingOption, setBookingOption] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [holdExpiryTime, setHoldExpiryTime] = useState(null);

  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  
  const [showZelleModal, setShowZelleModal] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const eventType = urlParams.get('eventType');
  const eventSize = urlParams.get('eventSize');
  const eventScale = urlParams.get('eventScale');

  const availableTiers = getAvailableTiers(eventType, eventSize, eventScale);
  
  // Check if this is a kids birthday party
  const isKidsBirthdayParty = eventType === 'private' && eventScale === 'kids';

  const getServiceDescriptions = () => {
    if (eventType === 'wedding') {
      return {
        closeUp: 'Perfect for cocktail hour — the magician mingles with your guests, creating intimate moments of wonder.',
        stage: 'A captivating performance for your reception — everyone gathers to experience the impossible together.',
        bundle: 'Start with magic during cocktail hour, then transition into a show-stopping performance at your reception.'
      };
    }
    
    if (eventType === 'corporate') {
      return {
        closeUp: 'Ideal for team events, conferences, and networking — the magician creates connections through shared moments of amazement.',
        stage: 'Perfect for galas and conferences — a theatrical performance that brings your entire audience together.',
        bundle: 'Begin with intimate magic for your team event or conference networking, then deliver a powerful stage show for your gala or keynote.'
      };
    }
    
    return {
      closeUp: 'The magician roams through your event, creating jaw-dropping moments of wonder up close for small groups.',
      stage: 'A captivating, theatrical performance where everyone gathers together to experience the impossible as one audience.',
      bundle: 'Begin with intimate, mind-blowing magic up close — then bring everyone together for a show-stopping stage performance they will never forget.'
    };
  };

  const serviceDescriptions = getServiceDescriptions();

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    const today = getTodayDate();
    
    if (selectedDate >= today) {
      setEventDate(selectedDate);
    }
  };

  const filteredAddons = (pricingData?.app?.add_ons || []).filter((addon) => {
    if (eventType === 'virtual') {
      return addon.event_types && addon.event_types.includes('virtual');
    }
    if (!selectedService) return false;
    return addon.service_types && addon.service_types.includes(selectedService);
  });

  const getSelectedPackagePrice = () => {
    if (eventType === 'virtual' && virtualDuration) {
      const base = calculateVirtualPrice(virtualDuration);
      return calculateFinalPrice(base, eventDate);
    }

    if (selectedService === 'closeup' && closeUpDuration && closeUpMagicians && closeUpTier) {
      const base = calculateCloseUpPrice(closeUpPerformer, closeUpTier, closeUpDuration, closeUpMagicians, eventType, eventScale);
      return calculateFinalPrice(base, eventDate);
    }
    if (selectedService === 'stage' && stageDuration && stageTier) {
      const base = calculateStagePrice(stagePerformer, stageTier, stageDuration, eventType, eventScale);
      return calculateFinalPrice(base, eventDate);
    }
    if (selectedService === 'bundle' && bundleCloseUpDuration && bundleNumMagicians && bundleStageDuration && bundleTier) {
      const base = calculateBundlePrice(bundlePerformer, bundleTier, bundleCloseUpDuration, bundleNumMagicians, bundleStageDuration, eventType, eventScale);
      return calculateFinalPrice(base, eventDate);
    }
    return { price: 0, isPeakDate: false };
  };

  const selectedPackagePrice = getSelectedPackagePrice();
  
  const includesFreePoster = selectedService === 'stage' && bookingOption === 'confirm';
  
  const totalAddonsCost = selectedAddons.reduce((sum, id) => {
    const addon = pricingData?.app?.add_ons?.find((a) => a.id === id); 
    if (id === 'addon_poster' && includesFreePoster) {
      return sum;
    }
    return sum + (addon ? addon.price : 0);
  }, 0);
  
  const totalInvestment = selectedPackagePrice.price + totalAddonsCost;
  const depositAmount = Math.round(totalInvestment * 0.10);

  const handleAddonToggle = (addonId) => {
    setSelectedAddons((prev) =>
      prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]
    );
  };

  const handleServiceSelect = (serviceType) => {
    setSelectedService(serviceType);
    setSelectedAddons([]);
  };

  const handleVideoPlay = (url) => {
    let embedUrl = url;
    if (url.includes('youtu.be')) {
      const videoId = url.split('youtu.be/')[1].split('?')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1].split('&')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes('instagram.com/reel')) {
      embedUrl = url.replace('/reel/', '/p/') + 'embed';
    }
    
    setVideoUrl(embedUrl);
    setShowVideoModal(true);
  };

  const handleHoldDateClick = () => {
    setBookingOption('hold');
    setFullName('');
    setEmail('');
    setPhone('');
    setAdditionalNotes('');
    setShowContactModal(true);
  };

  const handleConfirmNowClick = () => {
    setBookingOption('confirm');
    setFullName('');
    setEmail('');
    setPhone('');
    setAdditionalNotes('');
    setShowContactModal(true);
  };

  const handleContactSubmit = async () => {
    if (!email || !fullName) {
      alert('Please enter your name and email');
      return;
    }

    setShowContactModal(false);

    if (bookingOption === 'hold') {
      await handleHoldDateRequest();
    } else if (bookingOption === 'confirm') {
      await handleConfirmNow();
    }
  };

  const handleHoldDateRequest = async () => {
    if (!email || !fullName) {
      alert('Please enter your contact details');
      return;
    }

    setIsSubmitting(true);
    const currentTime = new Date();
    const expiryTime = addHours(currentTime, 48); // 48 hours for the hold

    try {
      const addonsText = selectedAddons.length > 0 ?
        selectedAddons.map((id) => {
          const addon = pricingData?.app?.add_ons?.find((a) => a.id === id);
          if (id === 'addon_poster' && includesFreePoster) {
            return `  • ${addon.label} (Value: $200) - FREE`;
          }
          return `  • ${addon?.label} (+$${addon?.price.toLocaleString()})`;
        }).join('\n') :
        'None';

      let packageDetails;
      if (eventType === 'virtual') {
        packageDetails = {
          type: 'Virtual Experience',
          performer: 'Johnny Wu',
          duration: `${virtualDuration} Minutes`,
          tier: 'Virtual Show'
        };
      } else {
        const getPerformerName = (performerId) => {
          if (performerId === 'duo') return 'Johnny Wu & Dylan George (10% Duo Discount)';
          if (performerId === 'johnny_wu') return 'Johnny Wu';
          return 'Dylan George';
        };

        packageDetails = {
          type: selectedService === 'closeup' ? 'Close-Up Mingling Magic' :
                selectedService === 'stage' ? 'Stage Show' :
                selectedService === 'bundle' ? 'Bundle Package' :
                'Unknown',
          performer: selectedService === 'closeup' ? getPerformerName(closeUpPerformer) :
            selectedService === 'stage' ? getPerformerName(stagePerformer) :
            selectedService === 'bundle' ? getPerformerName(bundlePerformer) :
            'Unknown',
          duration: selectedService === 'closeup' ? `${closeUpDuration} ${parseInt(closeUpDuration) === 1 ? 'Hour' : 'Hours'}` :
            selectedService === 'stage' ? `${stageDuration} Minutes` :
            selectedService === 'bundle' ? `${bundleCloseUpDuration}hr Close-Up + ${bundleStageDuration}min Stage` :
            'Unknown',
          magicians: selectedService === 'closeup' ? (closeUpPerformer === 'duo' ? '2 (Duo)' : closeUpMagicians) : (selectedService === 'bundle' ? bundleNumMagicians : undefined),
          tier: selectedService === 'closeup' ? closeUpTier :
                selectedService === 'stage' ? stageTier :
                selectedService === 'bundle' ? bundleTier :
                'Unknown'
        };
      }

      await base44.integrations.Core.SendEmail({
        to: 'hello@omnimagic.co',
        subject: `🗓️ New Date Hold Request - ${packageDetails.type}`,
        body: `
═══════════════════════════════════════════════════════
                 NEW DATE HOLD REQUEST
═══════════════════════════════════════════════════════

REQUEST DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Request Time:          ${format(currentTime, 'PPpp')}
  Hold Until:            ${format(expiryTime, 'PPpp')}
                         (48 hours from request)
  Deposit Due:           $${depositAmount.toLocaleString()} (10% of total)

EVENT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Event Date:            ${eventDate || 'Not specified'}
  Performer:             ${packageDetails.performer}

PACKAGE SELECTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Service Type:          ${packageDetails.type}
  Duration:              ${packageDetails.duration}${packageDetails.magicians ? `\n  Number of Magicians:   ${packageDetails.magicians}` : ''}
  Experience Tier:       ${packageDetails.tier.charAt(0).toUpperCase() + packageDetails.tier.slice(1)}
  Package Price:         $${selectedPackagePrice.price.toLocaleString()}

ADD-ONS SELECTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${addonsText}

PRICING SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Package Price:         $${selectedPackagePrice.price.toLocaleString()}
  Add-ons Total:         $${totalAddonsCost.toLocaleString()}
  ───────────────────────────────────────────────────
  TOTAL INVESTMENT:      $${totalInvestment.toLocaleString()}

CUSTOMER INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Full Name:             ${fullName}
  Email:                 ${email}
  Phone:                 ${phone || 'Not provided'}${additionalNotes ? `\n  Notes:                 ${additionalNotes}` : ''}

═══════════════════════════════════════════════════════
⏰ NEXT STEPS: Contact the client to confirm their
   deposit via Zelle/Venmo and secure the date.
   Send confirmation email with payment details.
═══════════════════════════════════════════════════════

—
Omni Magic Pricing System
        `
      });

      // Send a confirmation email to the client
      await base44.integrations.Core.SendEmail({
        to: email,
        subject: `🗓️ Your Omni Magic Booking Request is Received!`,
        body: `
Dear ${fullName},

Thank you for your interest in Omni Magic Entertainment!

We have received your request to hold the date for your upcoming event.
To secure your booking, please complete your 10% deposit of $${depositAmount.toLocaleString()} within the next 48 hours.

Your selected package details:
------------------------------------------------------
  Service Type:          ${packageDetails.type}
  Event Date:            ${eventDate || 'Not specified'}
  Total Investment:      $${totalInvestment.toLocaleString()}
  10% Deposit Due:       $${depositAmount.toLocaleString()}
------------------------------------------------------

You can complete your deposit via Zelle or Venmo:

Zelle: Send to 626-242-7710
Venmo: Send to @johnnywumagic (https://venmo.com/u/johnnywumagic)

Once your deposit is received, your date will be fully secured, and we will reach out to finalize the booking details.

If you have any questions, please don't hesitate to reply to this email or call us at 626-242-7710.

We look forward to making your event truly magical!

Sincerely,

The Omni Magic Team
www.omnimagic.co
        `
      });

      setHoldExpiryTime(expiryTime); // Set expiry time for success modal display
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error sending hold request email:', error);
      alert(error.message || 'Failed to send hold request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleConfirmNow = async () => {
    if (!email || !fullName) {
      alert('Please enter your contact details');
      return;
    }

    setIsSubmitting(true);

    try {
      let packageDetails;
      
      if (eventType === 'virtual') {
        packageDetails = {
          type: 'Virtual Experience',
          performer: 'Johnny Wu',
          duration: `${virtualDuration} Minutes`,
          tier: 'Virtual Show'
        };
      } else {
        const getPerformerName = (performerId) => {
          if (performerId === 'duo') return 'Johnny Wu & Dylan George (10% Duo Discount)';
          if (performerId === 'johnny_wu') return 'Johnny Wu';
          return 'Dylan George';
        };

        packageDetails = {
          type: selectedService === 'closeup' ? 'Close-Up Mingling Magic' :
                selectedService === 'stage' ? 'Stage Show' :
                selectedService === 'bundle' ? 'Combination Package' :
                'Unknown',
          performer: selectedService === 'closeup' ? getPerformerName(closeUpPerformer) :
            selectedService === 'stage' ? getPerformerName(stagePerformer) :
            selectedService === 'bundle' ? getPerformerName(bundlePerformer) :
            'Unknown',
          duration: selectedService === 'closeup' ? `${closeUpDuration} ${parseInt(closeUpDuration) === 1 ? 'Hour' : 'Hours'}` :
            selectedService === 'stage' ? `${stageDuration}-Minute Show` :
            selectedService === 'bundle' ? `${bundleCloseUpDuration}hr Close-Up + ${bundleStageDuration}min Stage` :
            'Unknown',
          magicians: selectedService === 'closeup' ? (closeUpPerformer === 'duo' ? '2 (Duo)' : closeUpMagicians) : (selectedService === 'bundle' ? bundleNumMagicians : undefined),
          tier: selectedService === 'closeup' ? closeUpTier :
                selectedService === 'stage' ? stageTier :
                selectedService === 'bundle' ? bundleTier :
                'Unknown'
        };
      }

      const tierName = packageDetails.tier === 'Virtual Show' ? 'Virtual Show' : 
        packageDetails.tier.charAt(0).toUpperCase() + packageDetails.tier.slice(1);

      let eventTypeDisplay = 'Private Event';
      if (eventType === 'wedding') {
        eventTypeDisplay = 'Wedding';
      } else if (eventType === 'corporate') {
        if (eventScale === 'large' || eventScale === 'vip') {
          eventTypeDisplay = 'Corporate Gala';
        } else {
          eventTypeDisplay = 'Corporate Event';
        }
      } else if (eventType === 'virtual') {
        eventTypeDisplay = 'Virtual Event';
      }

      const eventDateFormatted = eventDate ? new Date(eventDate + 'T00:00:00').toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }) : 'Not specified';

      let addonsText = selectedAddons.length > 0 ?
        selectedAddons.map((id) => {
          const addon = pricingData?.app?.add_ons?.find((a) => a.id === id);
          if (id === 'addon_poster' && includesFreePoster) {
            return `  • ${addon.label} (Value: $200) - FREE`;
          }
          return `  • ${addon?.label} (+$${addon?.price.toLocaleString()})`;
        }).join('\n') :
        'None';

      if (includesFreePoster && !selectedAddons.includes('addon_poster')) {
        addonsText += (addonsText === 'None' ? '' : '\n') + '  • Impossible Poster Souvenir (Value: $200) - FREE';
      }

      await base44.integrations.Core.SendEmail({
        to: 'hello@omnimagic.co',
        subject: `📋 New Booking Request - ${packageDetails.type}`,
        body: `
═══════════════════════════════════════════════════════
              NEW BOOKING REQUEST RECEIVED
═══════════════════════════════════════════════════════

EVENT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Event Date:            ${eventDateFormatted}
  Event Type:            ${eventTypeDisplay}
  Performer:             ${packageDetails.performer}

PACKAGE SELECTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Service Type:          ${packageDetails.type}
  Duration:              ${packageDetails.duration}${packageDetails.magicians ? `\n  Number of Magicians:   ${packageDetails.magicians}` : ''}
  Experience Tier:       ${tierName}
  Package Price:         $${selectedPackagePrice.price.toLocaleString()}

ADD-ONS SELECTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${addonsText}

PRICING SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Package Price:         $${selectedPackagePrice.price.toLocaleString()}
  Add-ons Total:         $${totalAddonsCost.toLocaleString()}
  ───────────────────────────────────────────────────
  TOTAL INVESTMENT:      $${totalInvestment.toLocaleString()}

CUSTOMER INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Full Name:             ${fullName}
  Email:                 ${email}
  Phone:                 ${phone || 'Not provided'}${additionalNotes ? `\n  Notes / Comments:      ${additionalNotes}` : ''}

═══════════════════════════════════════════════════════
⏰ NEXT STEPS: Send official contract and invoice to
   ${email}
═══════════════════════════════════════════════════════

—
Omni Magic Pricing System
        `
      });

      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      alert('Failed to send booking request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMagicianOptions = (performerId) => {
    if (performerId === 'duo') {
      return [{ value: "2", label: "2 Magicians: Johnny Wu & Dylan George" }];
    }
    const performerName = performerId === 'johnny_wu' ? 'Johnny Wu' : 'Dylan George';
    return [
      { value: "1", label: `1 Magician: ${performerName}` },
      { value: "2", label: `2 Magicians: ${performerName} + Associate` },
      { value: "3", label: `3 Magicians: ${performerName} + 2 Associates` }
    ];
  };

  // Reset magicians to 2 when duo is selected
  useEffect(() => {
    if (closeUpPerformer === 'duo') {
      setCloseUpMagicians('2');
    }
  }, [closeUpPerformer]);

  const isFormValid = () => {
    if (!eventDate) return false;
    if (eventType === 'virtual') {
      return virtualDuration;
    }
    if (!selectedService) return false;
    if (selectedService === 'closeup' && (!closeUpDuration || !closeUpMagicians || !closeUpTier)) return false;
    if (selectedService === 'stage' && (!stageDuration || !stageTier)) return false;
    if (selectedService === 'bundle' && (!bundleCloseUpDuration || !bundleNumMagicians || !bundleStageDuration || !bundleTier)) return false;
    return true;
  };

  const getPackageSummary = () => {
    if (eventType === 'virtual' && virtualDuration) {
      return {
        type: 'Virtual Experience',
        performer: 'Johnny Wu',
        duration: `${virtualDuration} Minutes`,
        magicians: '',
        tier: 'Virtual Show'
      };
    }
    
    if (!selectedService) return null;
    
    let summary = {
      type: '',
      performer: '',
      duration: '',
      magicians: '',
      tier: ''
    };

    const getPerformerName = (performerId) => {
      if (performerId === 'duo') return 'Johnny Wu & Dylan George';
      if (performerId === 'johnny_wu') return 'Johnny Wu';
      return 'Dylan George';
    };

    if (selectedService === 'closeup') {
      summary.type = 'Close-Up Mingling Magic';
      summary.performer = getPerformerName(closeUpPerformer);
      summary.duration = `${closeUpDuration} ${parseInt(closeUpDuration) === 1 ? 'Hour' : 'Hours'}`;
      summary.magicians = closeUpPerformer === 'duo' ? '2 Magicians (Duo)' : (closeUpMagicians ? `${closeUpMagicians} ${parseInt(closeUpMagicians) === 1 ? 'Magician' : 'Magicians'}` : '');
      summary.tier = closeUpTier ? closeUpTier.charAt(0).toUpperCase() + closeUpTier.slice(1) : '';
    } else if (selectedService === 'stage') {
      summary.type = 'Stage Show';
      summary.performer = getPerformerName(stagePerformer);
      summary.duration = `${stageDuration} Minutes`;
      summary.tier = stageTier ? stageTier.charAt(0).toUpperCase() + stageTier.slice(1) : '';
    } else if (selectedService === 'bundle') {
      summary.type = 'Bundle Package';
      summary.performer = getPerformerName(bundlePerformer);
      summary.duration = `${bundleCloseUpDuration}hr Close-Up + ${bundleStageDuration}min Stage`;
      summary.magicians = bundleNumMagicians ? `${bundleNumMagicians} ${parseInt(bundleNumMagicians) === 1 ? 'Magician' : 'Magicians'}` : '';
      summary.tier = bundleTier ? bundleTier.charAt(0).toUpperCase() + bundleTier.slice(1) : '';
    }

    return summary;
  };

  const packageSummary = getPackageSummary();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap');
        
        body {
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          line-height: 1.5;
          letter-spacing: -0.01em;
        }
        
        h1, h2, h3, h4, h5, h6 {
          font-family: 'Playfair Display', serif;
          font-weight: 700;
          letter-spacing: -0.02em;
        }
        
        @media (max-width: 768px) {
          body {
            font-size: 14px;
          }
        }

        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
        }
        
        .luxury-gradient {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
        }
        
        .glass-effect {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .gold-shimmer {
          background: linear-gradient(135deg, #f6e05e 0%, #ecc94b 25%, #d69e2e 50%, #ecc94b 75%, #f6e05e 100%);
          background-size: 200% 100%;
          animation: shimmer 3s infinite;
        }
        
        @keyframes shimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>

      <div className="min-h-screen luxury-gradient relative">
        <div
          style={{ backgroundImage: `url(${backgroundImageUrl})` }}
          className="fixed inset-0 bg-cover bg-center filter brightness-[0.15] opacity-40 z-0"
        />

        {/* Elegant overlay pattern */}
        <div className="fixed inset-0 z-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(236, 201, 75, 0.08) 0%, transparent 50%), 
                           radial-gradient(circle at 80% 50%, rgba(236, 201, 75, 0.08) 0%, transparent 50%)`
        }}></div>

        <div className="relative z-10">
          <div className="min-h-[280px] flex flex-col items-center justify-center px-4 py-12">
            <a 
              href={createPageUrl('Home')}
              className="cursor-pointer group mb-8"
            >
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9fdb80e10eb3dae94dfbf/705652e3a_logowhitewordstransparent.png"
                alt="Omni Magic Entertainment"
                className="h-20 md:h-24 drop-shadow-2xl group-hover:scale-105 transition-transform duration-300"
              />
            </a>
            <h1 className="text-white text-[32px] md:text-[42px] font-bold text-center mb-4 tracking-tight">
              Craft Your <span className="gold-shimmer bg-clip-text text-transparent">Unforgettable</span> Experience
            </h1>
            <p className="text-slate-200 text-[16px] md:text-[18px] text-center max-w-2xl font-light">
              Select your service, personalize with premium add-ons, and secure your exclusive date
            </p>
          </div>

          <div className="max-w-[950px] mx-auto px-4 md:px-6 pb-32">
            {/* Event Date Section */}
            <div className="glass-effect rounded-2xl border-amber-500/20 mb-8 shadow-2xl overflow-hidden">
              <div className="p-6 md:p-8">
                <h2 className="text-white text-[24px] md:text-[28px] font-bold mb-2 text-center">
                  Event Date
                </h2>
                <p className="text-amber-400 text-[14px] md:text-[15px] text-center mb-6 font-medium">
                  * Required to calculate accurate pricing
                </p>
                
                <div className="max-w-lg mx-auto">
                  <Input
                    id="eventDate"
                    type="date"
                    value={eventDate}
                    onChange={handleDateChange}
                    min={getTodayDate()}
                    required
                    className="w-full bg-white/5 border-2 border-white/10 focus:border-amber-500 text-white text-[15px] md:text-[16px] h-12 md:h-14 px-4 rounded-xl transition-all hover:bg-white/8 shadow-lg"
                  />
                </div>

                {eventDate && isPeakDate(eventDate) && (
                  <div className="mt-5 p-4 bg-amber-500/20 border-2 border-amber-500/50 rounded-xl text-amber-300 text-[14px] text-center max-w-lg mx-auto shadow-lg">
                    <Sparkles className="inline w-5 h-5 mr-2" />
                    <span className="font-semibold">High demand date</span> — limited availability
                  </div>
                )}
              </div>
            </div>

            {/* Location Disclaimer */}
            <div className="glass-effect border-blue-500/30 rounded-2xl p-5 md:p-6 mb-8 shadow-xl">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-blue-300 font-semibold text-[15px] md:text-[16px] mb-2">
                    📍 Location Notice
                  </h3>
                  <p className="text-blue-100 text-[14px] md:text-[15px] leading-relaxed font-light">
                    Pricing shown is for events within <span className="font-semibold text-white">Southern California</span> (within 50 miles of Los Angeles). 
                    If your event is outside this area, please <a href="mailto:hello@omnimagic.co" className="text-blue-400 hover:text-blue-300 underline font-medium">contact us</a> for a custom quote including travel arrangements.
                  </p>
                </div>
              </div>
            </div>

            {/* Virtual Show Selection */}
            {eventType === 'virtual' ? (
              <div className="glass-effect rounded-2xl border-white/10 p-6 md:p-8 mb-6 shadow-2xl">
                <div className="text-center mb-8">
                  <h2 className="text-white text-[26px] md:text-[32px] font-bold mb-3">
                    Virtual Experience — Magic That Connects Anywhere
                  </h2>
                  <p className="text-slate-200 text-[15px] md:text-[17px] max-w-2xl mx-auto font-light">
                    Bring world-class magic, mind reading, and connection straight to your screen — designed for remote teams, virtual galas, and global audiences.
                  </p>
                </div>

                <div className="space-y-4 max-w-2xl mx-auto">
                  <h3 className="text-white text-[19px] font-semibold mb-4">Select Duration:</h3>
                  
                  <button
                    onClick={() => setVirtualDuration('30')}
                    className={`w-full text-left p-5 rounded-xl border-2 transition-all transform hover:scale-102 ${
                      virtualDuration === '30' ?
                        'border-amber-500 bg-amber-500/20 shadow-xl' :
                        'border-white/10 hover:border-white/20 bg-white/5'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-white text-[19px] font-bold">30 Minutes — $1,500</h4>
                    </div>
                    <p className="text-slate-200 text-[14px] font-light">
                      Perfect for team meetings or quick virtual celebrations.
                    </p>
                  </button>

                  <button
                    onClick={() => setVirtualDuration('45')}
                    className={`w-full text-left p-5 rounded-xl border-2 transition-all transform hover:scale-102 ${
                      virtualDuration === '45' ?
                        'border-amber-500 bg-amber-500/20 shadow-xl' :
                        'border-white/10 hover:border-white/20 bg-white/5'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-white text-[19px] font-bold">45 Minutes — $2,000</h4>
                      <span className="text-[11px] bg-blue-500 text-white px-3 py-1 rounded-full font-medium">
                        MOST POPULAR
                      </span>
                    </div>
                    <p className="text-slate-200 text-[14px] font-light">
                      Interactive, fast-paced, and unforgettable. Includes hypnosis and mind reading.
                    </p>
                  </button>

                  <button
                    onClick={() => setVirtualDuration('60')}
                    className={`w-full text-left p-5 rounded-xl border-2 transition-all transform hover:scale-102 ${
                      virtualDuration === '60' ?
                        'border-amber-500 bg-amber-500/20 shadow-xl' :
                        'border-white/10 hover:border-white/20 bg-white/5'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-white text-[19px] font-bold">60 Minutes — $2,500</h4>
                    </div>
                    <p className="text-slate-200 text-[14px] font-light">
                      45-minute full experience with hypnosis and mind reading + 15-minute magic masterclass where everyone learns from a master magician.
                    </p>
                  </button>
                </div>

                {eventDate && isPeakDate(eventDate) && (
                  <div className="mt-5 p-4 bg-amber-500/20 border-2 border-amber-500/50 rounded-xl text-amber-300 text-[14px] text-center max-w-2xl mx-auto">
                    📅 <span className="font-semibold">December Performance:</span> 1.5× premium automatically applied due to limited availability
                  </div>
                )}
              </div>
            ) : (
              /* Regular Service Selection for non-virtual events */
              <>
                {/* Service Type Selection */}
                {!selectedService && !isKidsBirthdayParty && (
                  <div className="glass-effect rounded-2xl border-white/10 p-6 md:p-8 mb-6 shadow-2xl">
                    <h2 className="text-white text-[24px] md:text-[30px] font-bold mb-6 text-center">
                      Choose Your Service
                    </h2>
                    
                    <div className="space-y-4 max-w-2xl mx-auto">
                      <button
                        onClick={() => handleServiceSelect('closeup')}
                        className="w-full text-left p-5 rounded-xl border-2 border-white/10 hover:border-amber-500 hover:bg-amber-500/10 transition-all transform hover:scale-102"
                      >
                        <h3 className="text-white text-[19px] font-bold mb-2">
                          Close-Up Mingling Magic
                        </h3>
                        <p className="text-slate-200 text-[15px] font-light">
                          {serviceDescriptions.closeUp}
                        </p>
                      </button>

                      <button
                        onClick={() => handleServiceSelect('stage')}
                        className="w-full text-left p-5 rounded-xl border-2 border-white/10 hover:border-amber-500 hover:bg-amber-500/10 transition-all transform hover:scale-102"
                      >
                        <h3 className="text-white text-[19px] font-bold mb-2">
                          Stage Show
                        </h3>
                        <p className="text-slate-200 text-[15px] font-light">
                          {serviceDescriptions.stage}
                        </p>
                      </button>

                      <button
                        onClick={() => handleServiceSelect('bundle')}
                        className="w-full text-left p-5 rounded-xl border-2 border-white/10 hover:border-amber-500 hover:bg-amber-500/10 transition-all transform hover:scale-102"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-white text-[19px] font-bold">
                            Bundle Package
                          </h3>
                          <span className="text-[12px] bg-green-500 text-white px-3 py-1 rounded-full font-medium">
                            10% OFF
                          </span>
                        </div>
                        <p className="text-slate-200 text-[15px] font-light">
                          {serviceDescriptions.bundle}
                        </p>
                      </button>
                    </div>
                  </div>
                )}
                
                {/* For kids birthday party, automatically select stage show */}
                {!selectedService && isKidsBirthdayParty && (
                  <div className="glass-effect rounded-2xl border-white/10 p-6 md:p-8 mb-6 shadow-2xl">
                    <h2 className="text-white text-[24px] md:text-[30px] font-bold mb-4 text-center">
                      Kids Birthday Party Stage Show
                    </h2>
                    <p className="text-slate-200 text-[15px] text-center mb-6 max-w-2xl mx-auto font-light">
                      For kids birthday parties, we offer an engaging stage show designed to captivate young audiences. Select your preferences below to get started.
                    </p>
                    <div className="text-center">
                      <button
                        onClick={() => handleServiceSelect('stage')}
                        className="inline-block px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-bold rounded-xl transition-all transform hover:scale-105 shadow-xl text-[15px]"
                      >
                        Configure Stage Show
                      </button>
                    </div>
                  </div>
                )}

                {/* Close-Up Configuration */}
                {selectedService === 'closeup' && (
                  <div className="glass-effect rounded-2xl border-white/10 p-6 md:p-8 mb-6 shadow-2xl">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-white text-[22px] font-bold">
                        Close-Up Mingling Magic
                      </h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedService(null);
                          setCloseUpDuration('');
                          setCloseUpMagicians('');
                          setCloseUpTier('');
                          setCloseUpPerformer('johnny_wu');
                        }}
                        className="text-slate-400 hover:text-white hover:bg-white/10"
                      >
                        Change Service
                      </Button>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <Label className="text-white text-[15px] mb-3 block font-medium">Select Performer</Label>
                        <Select value={closeUpPerformer} onValueChange={setCloseUpPerformer}>
                          <SelectTrigger className="bg-white/5 border-2 border-white/10 text-white h-12 rounded-xl hover:bg-white/8 transition-all">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-white/20">
                            <SelectItem value="johnny_wu">Johnny Wu</SelectItem>
                            <SelectItem value="dylan_george">Dylan George</SelectItem>
                            <SelectItem value="duo">
                              <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-amber-400" />
                                <span>Johnny Wu & Dylan George</span>
                                <span className="text-[11px] bg-green-500 text-white px-2 py-0.5 rounded-full ml-2">10% OFF</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-white text-[15px] mb-3 block font-medium">Duration</Label>
                        <Select value={closeUpDuration} onValueChange={setCloseUpDuration}>
                          <SelectTrigger className="bg-white/5 border-2 border-white/10 text-white h-12 rounded-xl hover:bg-white/8 transition-all">
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-white/20">
                            <SelectItem value="1">1 Hour (Great for 30-40 people)</SelectItem>
                            <SelectItem value="2">2 Hours (Great for 60-80 people)</SelectItem>
                            <SelectItem value="3">3 Hours (Great for 90-120 people)</SelectItem>
                            <SelectItem value="4">4 Hours (Great for 150+ people)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-white text-[15px] mb-3 block font-medium">Number of Magicians</Label>
                        <Select 
                          value={closeUpMagicians} 
                          onValueChange={setCloseUpMagicians}
                          disabled={closeUpPerformer === 'duo'}
                        >
                          <SelectTrigger className="bg-white/5 border-2 border-white/10 text-white h-12 rounded-xl hover:bg-white/8 transition-all disabled:opacity-50">
                            <SelectValue placeholder="Select number" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-white/20">
                            {getMagicianOptions(closeUpPerformer).map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-white text-[15px] mb-3 block font-medium">Experience Tier</Label>
                        <Select value={closeUpTier} onValueChange={setCloseUpTier}>
                          <SelectTrigger className="bg-white/5 border-2 border-white/10 text-white h-12 rounded-xl hover:bg-white/8 transition-all">
                            <SelectValue placeholder="Select tier" />
                          </SelectTrigger>
                          <SelectContent className="max-w-[calc(100vw-2rem)] md:max-w-2xl bg-slate-900 border-white/20">
                            {availableTiers.map((tier) => {
                              const tierDesc = TIER_DESCRIPTIONS.close_up[tier];
                              return (
                                <SelectItem key={tier} value={tier}>
                                  <div className="py-2 pr-2">
                                    <div className="font-semibold text-[15px]">{tierDesc?.title || tier.charAt(0).toUpperCase() + tier.slice(1)}</div>
                                    <div className="text-[12px] text-slate-400 mt-1 whitespace-normal font-light">{tierDesc?.description}</div>
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Stage Show Configuration */}
                {selectedService === 'stage' && (
                  <div className="glass-effect rounded-2xl border-white/10 p-6 md:p-8 mb-6 shadow-2xl">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-white text-[22px] font-bold">
                        Stage Show
                      </h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedService(null);
                          setStageDuration('');
                          setStageTier('');
                        }}
                        className="text-slate-400 hover:text-white hover:bg-white/10"
                      >
                        Change Service
                      </Button>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <Label className="text-white text-[15px] mb-3 block font-medium">Select Performer</Label>
                        <Select value={stagePerformer} onValueChange={setStagePerformer}>
                          <SelectTrigger className="bg-white/5 border-2 border-white/10 text-white h-12 rounded-xl hover:bg-white/8 transition-all">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-white/20">
                            <SelectItem value="johnny_wu">Johnny Wu</SelectItem>
                            <SelectItem value="dylan_george">Dylan George</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-white text-[15px] mb-3 block font-medium">Show Duration</Label>
                        <Select value={stageDuration} onValueChange={setStageDuration}>
                          <SelectTrigger className="bg-white/5 border-2 border-white/10 text-white h-12 rounded-xl hover:bg-white/8 transition-all">
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-white/20">
                            {eventType === 'wedding' ? (
                              <SelectItem value="20">20 Minutes</SelectItem>
                            ) : (
                              <>
                                <SelectItem value="30">30 Minutes</SelectItem>
                                <SelectItem value="45">45 Minutes</SelectItem>
                                <SelectItem value="60">60 Minutes</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-white text-[15px] mb-3 block font-medium">Experience Tier</Label>
                        <Select value={stageTier} onValueChange={setStageTier}>
                          <SelectTrigger className="bg-white/5 border-2 border-white/10 text-white h-12 rounded-xl hover:bg-white/8 transition-all">
                            <SelectValue placeholder="Select tier" />
                          </SelectTrigger>
                          <SelectContent className="max-w-[calc(100vw-2rem)] md:max-w-2xl bg-slate-900 border-white/20">
                            {availableTiers.map((tier) => {
                              const tierDesc = TIER_DESCRIPTIONS.stage[tier];
                              return (
                                <SelectItem key={tier} value={tier}>
                                  <div className="py-2 pr-2">
                                    <div className="font-semibold text-[15px]">{tierDesc?.title || tier.charAt(0).toUpperCase() + tier.slice(1)}</div>
                                    <div className="text-[12px] text-slate-400 mt-1 whitespace-normal font-light">{tierDesc?.description}</div>
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bundle Configuration */}
                {selectedService === 'bundle' && (
                  <div className="glass-effect rounded-2xl border-white/10 p-6 md:p-8 mb-6 shadow-2xl">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-white text-[22px] font-bold">
                        Bundle Package <span className="text-green-400 text-[15px]">(10% OFF)</span>
                      </h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedService(null);
                          setBundleCloseUpDuration('');
                          setBundleNumMagicians('');
                          setBundleStageDuration('');
                          setBundleTier('');
                        }}
                        className="text-slate-400 hover:text-white hover:bg-white/10"
                      >
                        Change Service
                      </Button>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <Label className="text-white text-[15px] mb-3 block font-medium">Select Performer</Label>
                        <Select value={bundlePerformer} onValueChange={setBundlePerformer}>
                          <SelectTrigger className="bg-white/5 border-2 border-white/10 text-white h-12 rounded-xl hover:bg-white/8 transition-all">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-white/20">
                            <SelectItem value="johnny_wu">Johnny Wu</SelectItem>
                            <SelectItem value="dylan_george">Dylan George</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="border-t border-white/10 pt-5">
                        <h3 className="text-white text-[17px] font-semibold mb-4">Close-Up Portion</h3>
                        
                        <div className="space-y-4">
                          <div>
                            <Label className="text-white text-[15px] mb-3 block font-medium">Duration</Label>
                            <Select value={bundleCloseUpDuration} onValueChange={setBundleCloseUpDuration}>
                              <SelectTrigger className="bg-white/5 border-2 border-white/10 text-white h-12 rounded-xl hover:bg-white/8 transition-all">
                                <SelectValue placeholder="Select duration" />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-900 border-white/20">
                                <SelectItem value="1">1 Hour (Great for 30-40 people)</SelectItem>
                                <SelectItem value="2">2 Hours (Great for 60-80 people)</SelectItem>
                                <SelectItem value="3">3 Hours (Great for 90-120 people)</SelectItem>
                                <SelectItem value="4">4 Hours (Great for 150+ people)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-white text-[15px] mb-3 block font-medium">Number of Magicians</Label>
                            <Select value={bundleNumMagicians} onValueChange={setBundleNumMagicians}>
                              <SelectTrigger className="bg-white/5 border-2 border-white/10 text-white h-12 rounded-xl hover:bg-white/8 transition-all">
                                <SelectValue placeholder="Select number" />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-900 border-white/20">
                                {getMagicianOptions(bundlePerformer).map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-white/10 pt-5">
                        <h3 className="text-white text-[17px] font-semibold mb-4">Stage Show Portion</h3>
                        
                        <div className="space-y-4">
                          <div>
                            <Label className="text-white text-[15px] mb-3 block font-medium">Show Duration</Label>
                            <Select value={bundleStageDuration} onValueChange={setBundleStageDuration}>
                              <SelectTrigger className="bg-white/5 border-2 border-white/10 text-white h-12 rounded-xl hover:bg-white/8 transition-all">
                                <SelectValue placeholder="Select duration" />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-900 border-white/20">
                                {eventType === 'wedding' ? (
                                  <SelectItem value="20">20 Minutes</SelectItem>
                                ) : (
                                  <>
                                    <SelectItem value="30">30 Minutes</SelectItem>
                                    <SelectItem value="45">45 Minutes</SelectItem>
                                    <SelectItem value="60">60 Minutes</SelectItem>
                                  </>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label className="text-white text-[15px] mb-3 block font-medium">Experience Tier</Label>
                        <Select value={bundleTier} onValueChange={setBundleTier}>
                          <SelectTrigger className="bg-white/5 border-2 border-white/10 text-white h-12 rounded-xl hover:bg-white/8 transition-all">
                            <SelectValue placeholder="Select tier" />
                          </SelectTrigger>
                          <SelectContent className="max-w-[calc(100vw-2rem)] md:max-w-2xl bg-slate-900 border-white/20">
                            {availableTiers.map((tier) => {
                              const closeUpDesc = TIER_DESCRIPTIONS.close_up[tier];
                              const stageDesc = TIER_DESCRIPTIONS.stage[tier];
                              return (
                                <SelectItem key={tier} value={tier}>
                                  <div className="py-2 pr-2">
                                    <div className="font-semibold text-[15px]">{tier.charAt(0).toUpperCase() + tier.slice(1)} Bundle</div>
                                    <div className="text-[12px] text-slate-400 mt-1 whitespace-normal font-light">Close-Up: ${closeUpDesc?.description}</div>
                                    <div className="text-[12px] text-slate-400 whitespace-normal font-light">Stage: ${stageDesc?.description}</div>
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Package Summary */}
            {(selectedService || eventType === 'virtual') && packageSummary && isFormValid() && (
              <div className="glass-effect rounded-2xl border-white/10 p-5 md:p-6 mb-6 shadow-2xl">
                <h2 className="text-white text-[20px] md:text-[22px] font-semibold mb-3">Your Selected Package</h2>
                
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-200 text-[15px] font-light">Service:</span>
                    <span className="text-white text-[15px] font-semibold">{packageSummary.type}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-200 text-[15px] font-light">Performer:</span>
                    <span className="text-white text-[15px] font-semibold">{packageSummary.performer}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-200 text-[15px] font-light">Duration:</span>
                    <span className="text-white text-[15px] font-semibold">{packageSummary.duration}</span>
                  </div>
                  {packageSummary.magicians && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-200 text-[15px] font-light">Magicians:</span>
                      <span className="text-white text-[15px] font-semibold">{packageSummary.magicians}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-200 text-[15px] font-light">Tier:</span>
                    <span className="text-white text-[15px] font-semibold">{packageSummary.tier}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                  <span className="text-white text-[17px] font-semibold">Package Price:</span>
                  <span className="text-amber-400 text-[22px] font-bold">
                    ${selectedPackagePrice.price.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Add-Ons Section */}
            {(selectedService || eventType === 'virtual') && filteredAddons.length > 0 && (
              <div className="glass-effect rounded-2xl border-white/10 p-5 md:p-6 mb-6 shadow-2xl">
                <h2 className="text-white text-[20px] md:text-[22px] font-semibold mb-4">Add-Ons (Optional)</h2>
                
                <div className="space-y-3">
                  {filteredAddons.map((addon) => {
                    const isFreePoster = addon.id === 'addon_poster' && includesFreePoster;
                    const displayPrice = isFreePoster ? 0 : addon.price;
                    
                    return (
                      <div
                        key={addon.id}
                        className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all bg-white/5 ${
                          selectedAddons.includes(addon.id) ?
                            'border-amber-500 bg-amber-500/20' :
                            'border-white/10'
                        }`}
                      >
                        <Checkbox
                          id={addon.id}
                          checked={selectedAddons.includes(addon.id)}
                          onCheckedChange={() => handleAddonToggle(addon.id)}
                          className="mt-1"
                        />
                        <label htmlFor={addon.id} className="flex-1 cursor-pointer">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white text-[15px] font-medium">{addon.label}</span>
                            {isFreePoster ? (
                              <span className="text-green-400 text-[15px] font-semibold">FREE 🎁</span>
                            ) : (
                              <span className="text-amber-400 text-[15px] font-semibold">
                                +${displayPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                          <p className="text-slate-200 text-[13px] mb-1 font-light">{addon.tooltip}</p>
                          {isFreePoster && (
                            <p className="text-green-300 text-[12px] font-semibold mt-1">
                              ✨ Complimentary with Stage Show + Confirm Now booking
                            </p>
                          )}
                          {addon.preview_url && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                handleVideoPlay(addon.preview_url);
                              }}
                              className="text-blue-400 text-[12px] hover:text-blue-300 inline-flex items-center gap-1 mt-1"
                            >
                              <Play className="w-3.5 h-3.5" /> Watch Demo
                            </button>
                          )}
                        </label>
                      </div>
                    );
                  })}
                </div>

                {selectedAddons.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                    <span className="text-slate-200 text-[14px] font-light">
                      {selectedAddons.length} add-on{selectedAddons.length > 1 ? 's' : ''} selected
                    </span>
                    <span className="text-amber-400 text-[17px] font-semibold">
                      +${totalAddonsCost.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Booking Options */}
            {(selectedService || eventType === 'virtual') && isFormValid() && (
              <div className="glass-effect rounded-2xl border-white/10 p-5 md:p-6 mb-6 shadow-2xl">
                <h2 className="text-white text-[20px] md:text-[22px] font-semibold mb-4">Complete Your Booking</h2>
                
                <div className="bg-white/5 rounded-xl p-4 mb-5 shadow-inner">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-200 text-[14px] font-light">Package</span>
                    <span className="text-white text-[15px]">
                      ${selectedPackagePrice.price.toLocaleString()}
                    </span>
                  </div>
                  {totalAddonsCost > 0 && (
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-200 text-[14px] font-light">Add-ons</span>
                      <span className="text-white text-[15px]">
                        +${totalAddonsCost.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {includesFreePoster && (
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-green-300 text-[14px] font-light">FREE Poster Bonus</span>
                      <span className="text-green-400 text-[15px]">+$200 (FREE)</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-white/10 flex justify-between items-center mt-3">
                    <span className="text-white text-[17px] font-semibold">Total Investment</span>
                    <span className="text-amber-400 text-[22px] font-bold">
                      ${totalInvestment.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 mb-5">
                  <Label className="text-slate-200 text-[14px] block font-light">Choose Booking Option</Label>
                  
                  <button
                    onClick={handleHoldDateClick}
                    className="w-full text-left p-4 rounded-xl border-2 border-white/10 hover:border-blue-500 hover:bg-blue-500/10 transition-all transform hover:scale-102"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-white text-[15px] font-medium">Hold the Date (10% Deposit)</span>
                      <span className="text-blue-400 text-[18px] font-semibold">
                        ${depositAmount.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-200 text-[13px] mt-1 font-light">Non-refundable • Holds your date for 48 hours</p>
                  </button>

                  <button
                    onClick={handleConfirmNowClick}
                    className="w-full text-left p-4 rounded-xl border-2 border-white/10 hover:border-green-500 hover:bg-green-500/10 transition-all transform hover:scale-102"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-white text-[15px] font-medium">Confirm Now</span>
                      <span className="text-green-400 text-[15px]">Contract & Invoice</span>
                    </div>
                    <p className="text-slate-200 text-[13px] mt-1 font-light">We will send you an official contract and invoice via email</p>
                    {includesFreePoster && (
                      <div className="mt-3 p-3 bg-green-900/40 border border-green-500/50 rounded-lg">
                        <p className="text-green-300 text-[13px] font-semibold">🎁 Complimentary Bonus: Impossible Poster Souvenir (Value: $200)</p>
                      </div>
                    )}
                  </button>
                </div>

                {bookingOption === 'hold' && !showContactModal && (
                  <div className="space-y-4 mt-5 pt-5 border-t border-white/10">
                    <Label className="text-slate-200 text-[14px] block font-light">Payment Options for Deposit</Label>
                    
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 shadow-inner">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-5.5 h-5.5 text-purple-400" />
                        <span className="text-white text-[15px] font-medium">Pay with Zelle</span>
                      </div>
                      <p className="text-slate-200 text-[13px] mb-3 font-light">
                        Send ${depositAmount.toLocaleString()} to: <span className="text-white font-medium">626-242-7710</span>
                      </p>
                      <img 
                        src={zelleQRCodeUrl} 
                        alt="Zelle QR Code" 
                        className="w-56 h-56 mx-auto rounded-lg shadow-xl cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setShowZelleModal(true)}
                      />
                      <p className="text-slate-400 text-[12px] text-center mt-2">Click to enlarge</p>
                    </div>

                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 shadow-inner">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-5.5 h-5.5 text-blue-400" />
                        <span className="text-white text-[15px] font-medium">Pay with Venmo</span>
                      </div>
                      <p className="text-slate-200 text-[13px] mb-2 font-light">
                        Send ${depositAmount.toLocaleString()} to:
                      </p>
                      <a
                        href="https://venmo.com/u/johnnywumagic"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 text-[14px] hover:text-blue-300 inline-flex items-center gap-1"
                      >
                        @johnnywumagic <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                    <p className="text-slate-400 text-[12px] mt-2 text-center">
                      After sending your deposit, we will confirm your booking via email.
                    </p>
                  </div>
                )}

                {bookingOption === 'confirm' && !showContactModal && (
                  <div className="mt-5 pt-5 border-t border-white/10">
                    <Button
                      onClick={handleConfirmNow}
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold text-[16px] h-12 rounded-xl transition-all transform hover:scale-102 shadow-xl"
                    >
                      {isSubmitting ? 'Sending Request...' : 'Send Booking Request'}
                    </Button>
                    <p className="text-slate-400 text-[12px] mt-2 text-center">
                      We will email you within 24 hours with your contract and invoice
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Information Modal */}
      <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
        <DialogContent className="glass-effect border-white/10 text-white max-w-md max-h-[90vh] overflow-y-auto rounded-2xl p-6 md:p-8 shadow-3xl">
          <DialogHeader>
            <DialogTitle className="text-[24px] font-bold text-center text-white mb-2">
              Enter Your Details
            </DialogTitle>
            <p className="text-slate-200 text-center text-[14px] font-light">
              {bookingOption === 'hold' ? 'To proceed with holding your date, please provide your contact information.' : 'To send your booking request, please provide your contact information.'}
            </p>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="modalFullName" className="text-slate-200 text-[14px] mb-1 block font-light">Full Name *</Label>
              <Input
                id="modalFullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Smith"
                required
                className="bg-white/5 border-2 border-white/10 text-white text-[15px] placeholder-slate-400 h-11 rounded-xl"
              />
            </div>

            <div>
              <Label htmlFor="modalEmail" className="text-slate-200 text-[14px] mb-1 block font-light">Email *</Label>
              <Input
                id="modalEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                required
                className="bg-white/5 border-2 border-white/10 text-white text-[15px] placeholder-slate-400 h-11 rounded-xl"
              />
            </div>

            <div>
              <Label htmlFor="modalPhone" className="text-slate-200 text-[14px] mb-1 block font-light">Phone (Optional)</Label>
              <Input
                id="modalPhone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 123-4567"
                className="bg-white/5 border-2 border-white/10 text-white text-[15px] placeholder-slate-400 h-11 rounded-xl"
              />
            </div>

            <div>
              <Label htmlFor="modalNotes" className="text-slate-200 text-[14px] mb-1 block font-light">
                Additional Notes (Optional)
              </Label>
              <textarea
                id="modalNotes"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Anything we should know about your event?"
                rows={3}
                className="w-full bg-white/5 border-2 border-white/10 text-white text-[15px] placeholder-slate-400 rounded-xl p-3"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowContactModal(false)}
                className="flex-1 border-white/10 text-slate-300 hover:bg-white/10 rounded-xl h-11">
                Cancel
              </Button>
              <Button
                onClick={handleContactSubmit}
                disabled={isSubmitting || !fullName || !email}
                className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-bold rounded-xl h-11">
                {isSubmitting ? 'Processing...' : 'Continue'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Video Modal */}
      <Dialog open={showVideoModal} onOpenChange={setShowVideoModal}>
        <DialogContent className="glass-effect border-white/10 text-white max-w-4xl max-h-[90vh] p-0 overflow-y-auto rounded-2xl shadow-3xl">
          <DialogHeader className="p-4">
            <DialogTitle className="text-[22px] font-semibold text-white">Add-on Preview</DialogTitle>
          </DialogHeader>
          <div className="relative pb-[56.25%] h-0">
            <iframe
              src={videoUrl}
              className="absolute top-0 left-0 w-full h-full rounded-xl"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="glass-effect border-white/10 text-white max-w-md overflow-y-auto rounded-2xl p-6 md:p-8 shadow-3xl">
          <div className="text-center py-6">
            <CheckCircle className="w-18 h-18 text-green-400 mx-auto mb-4" />
            <h3 className="text-[26px] font-semibold text-white mb-3">
              {bookingOption === 'hold' ? 'Hold Request Sent! 🎉' : 'Request Sent! 📧'}
            </h3>
            
            {bookingOption === 'hold' ? (
              <>
                <p className="text-[16px] text-slate-200 mb-4 font-light">
                  Thank you! Your request to hold the date has been received.
                  To secure your booking, please complete your 10% deposit of <span className="font-bold text-amber-400">${depositAmount.toLocaleString()}</span> via Zelle or Venmo within 48 hours.
                </p>
                {holdExpiryTime && (
                  <div className="bg-white/5 rounded-xl p-4 mb-4">
                    <p className="text-blue-400 text-[14px] mb-1 font-light">Your hold expires:</p>
                    <p className="text-white text-[18px] font-semibold">
                      {format(holdExpiryTime, 'PPpp')}
                    </p>
                    <p className="text-slate-400 text-[13px] mt-1 font-light">
                      Please send your deposit by this time to confirm.
                    </p>
                  </div>
                )}
                <div className="mt-4 text-left">
                  <p className="text-slate-200 text-[14px] mb-2 font-semibold">Payment Options:</p>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 mb-2">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-5.5 h-5.5 text-purple-400" />
                      <span className="text-white text-[15px] font-medium">Zelle</span>
                    </div>
                    <p className="text-slate-200 text-[13px]">
                      Send to: <span className="text-white font-medium">626-242-7710</span>
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowZelleModal(true)}
                      className="text-blue-400 text-[12px] hover:text-blue-300 inline-flex items-center gap-1 mt-1"
                    >
                      View QR Code <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-5.5 h-5.5 text-blue-400" />
                      <span className="text-white text-[15px] font-medium">Venmo</span>
                    </div>
                    <p className="text-slate-200 text-[13px]">
                      Send to: <a href="https://venmo.com/u/johnnywumagic" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1">@johnnywumagic <ExternalLink className="w-3.5 h-3.5" /></a>
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <p className="text-[16px] text-slate-200 mb-4 font-light">
                  We have received your booking request and will email you an official contract and invoice within 24 hours.
                </p>
                {includesFreePoster && (
                  <div className="bg-green-900/40 border border-green-500/50 rounded-xl p-4 mb-4">
                    <p className="text-green-300 text-[15px] font-semibold">
                      🎁 Your FREE Impossible Poster Souvenir ($200 value) will be included in your booking!
                    </p>
                  </div>
                )}
              </>
            )}
            
            <p className="text-[15px] text-slate-200 mb-4 mt-4 font-light">
              Check your email for confirmation details.
            </p>
            
            <Button
              onClick={() => window.location.reload()}
              className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-[16px] px-8 h-12 rounded-xl"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Zelle QR Modal */}
      <Dialog open={showZelleModal} onOpenChange={setShowZelleModal}>
        <DialogContent className="glass-effect border-white/10 text-white max-w-md overflow-y-auto rounded-2xl p-6 md:p-8 shadow-3xl">
          <DialogHeader>
            <DialogTitle className="text-[24px] font-semibold text-center text-white">Zelle Payment</DialogTitle>
          </DialogHeader>
          <div className="text-center">
            <p className="text-slate-200 text-[15px] mb-4 font-light">
              Scan this QR code in your bank app to send ${depositAmount.toLocaleString()}
            </p>
            <img 
              src={zelleQRCodeUrl} 
              alt="Zelle QR Code" 
              className="w-full max-w-sm mx-auto rounded-xl shadow-2xl"
            />
            <p className="text-white font-bold text-[18px] mt-4">
              Send to: 626-242-7710
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
