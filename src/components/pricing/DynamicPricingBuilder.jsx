
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Users, Star, Gift, ArrowRight, Info, ChevronDown, CalendarOff } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  calculateCloseUpPrice,
  calculateStagePrice,
  calculateBundlePrice,
  calculateFinalPrice,
  TIER_DESCRIPTIONS
} from './pricingCalculations';

export default function DynamicPricingBuilder({ eventType, eventSubtype, eventDate, onBookNow }) {
  // Close-Up States
  const [closeUpPerformer, setCloseUpPerformer] = useState('johnny_wu');
  const [closeUpDuration, setCloseUpDuration] = useState('');
  const [numMagicians, setNumMagicians] = useState('');
  const [closeUpTier, setCloseUpTier] = useState('');
  
  // Stage States
  const [stagePerformer, setStagePerformer] = useState('johnny_wu');
  const [stageDuration, setStageDuration] = useState('');
  const [stageTier, setStageTier] = useState('');
  
  // Bundle States
  const [bundlePerformer, setBundlePerformer] = useState('johnny_wu');
  const [bundleCloseUpDuration, setBundleCloseUpDuration] = useState('');
  const [bundleNumMagicians, setBundleNumMagicians] = useState('');
  const [bundleStageDuration, setBundleStageDuration] = useState('');
  const [bundleTier, setBundleTier] = useState('');

  // Check if Silver tier should be excluded (for Large Gala events)
  const isLargeGala = eventType === 'corporate_large';

  // State for past event date
  const [isPastEventDate, setIsPastEventDate] = useState(false);

  // Effect to check if eventDate is in the past
  useEffect(() => {
    if (eventDate) {
      const today = new Date();
      // Normalize today to start of day for comparison
      today.setHours(0, 0, 0, 0);
      
      const eventD = new Date(eventDate);
      // Normalize event date to start of day
      eventD.setHours(0, 0, 0, 0); 
      
      setIsPastEventDate(eventD < today);
    } else {
      setIsPastEventDate(false); // If no date provided, assume it's not in the past
    }
  }, [eventDate]);

  // Auto-adjust tier selection if Silver is selected but not available
  useEffect(() => {
    if (isLargeGala) {
      if (closeUpTier === 'silver') setCloseUpTier('gold');
      if (stageTier === 'silver') setStageTier('gold');
      if (bundleTier === 'silver') setBundleTier('gold');
    }
  }, [isLargeGala, closeUpTier, stageTier, bundleTier]);

  // Calculate prices
  const closeUpBase = calculateCloseUpPrice(closeUpPerformer, closeUpTier, closeUpDuration, numMagicians);
  const closeUpFinal = calculateFinalPrice(closeUpBase, eventDate);

  const stageBase = calculateStagePrice(stagePerformer, stageTier, stageDuration);
  const stageFinal = calculateFinalPrice(stageBase, eventDate);

  const bundleBase = calculateBundlePrice(bundlePerformer, bundleTier, bundleCloseUpDuration, bundleNumMagicians, bundleStageDuration);
  const bundleFinal = calculateFinalPrice(bundleBase, eventDate);

  const handleBookCloseUp = () => {
    if (isPastEventDate) return; // Prevent booking if date is in the past
    if (!closeUpDuration || !numMagicians || !closeUpTier || !closeUpPerformer) return;
    const performerName = closeUpPerformer === 'johnny_wu' ? 'Johnny Wu' : 'Dylan George';
    onBookNow({
      type: 'Close-Up Mingling Magic',
      performer: performerName,
      duration: `${closeUpDuration} ${parseInt(closeUpDuration) === 1 ? 'Hour' : 'Hours'}`,
      magicians: numMagicians,
      tier: closeUpTier,
      price: closeUpFinal.price,
      eventType,
      eventSubtype
    });
  };

  const handleBookStage = () => {
    if (isPastEventDate) return; // Prevent booking if date is in the past
    if (!stageDuration || !stageTier || !stagePerformer) return;
    const performerName = stagePerformer === 'johnny_wu' ? 'Johnny Wu' : 'Dylan George';
    onBookNow({
      type: 'Stage Show',
      performer: performerName,
      duration: `${stageDuration} Minutes`,
      tier: stageTier,
      price: stageFinal.price,
      eventType,
      eventSubtype
    });
  };

  const handleBookBundle = () => {
    if (isPastEventDate) return; // Prevent booking if date is in the past
    if (!bundleCloseUpDuration || !bundleNumMagicians || !bundleStageDuration || !bundleTier || !bundlePerformer) return;
    const performerName = bundlePerformer === 'johnny_wu' ? 'Johnny Wu' : 'Dylan George';
    onBookNow({
      type: 'Bundle Package',
      performer: performerName,
      duration: `${bundleCloseUpDuration}hr Close-Up + ${bundleStageDuration}min Stage`,
      magicians: bundleNumMagicians,
      tier: bundleTier,
      price: bundleFinal.price,
      eventType,
      eventSubtype
    });
  };

  const TierInfo = ({ tier, type }) => {
    const tierData = TIER_DESCRIPTIONS[type][tier];
    if (!tierData) return null;

    const scrollToTierComparison = () => {
      const tierSection = document.getElementById('tier-comparison-section');
      if (tierSection) {
        tierSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={scrollToTierComparison}
              className="inline-flex items-center gap-1 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
              title="Scroll down to see full tier comparison"
            >
              <Info className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs sm:max-w-sm bg-slate-800 border-slate-700 p-3 sm:p-4 text-xs sm:text-sm">
            <h4 className="font-bold text-amber-400 mb-1 sm:mb-2 text-base sm:text-lg">{tierData.title}</h4>
            <p className="text-slate-300 text-xs sm:text-sm mb-2 sm:mb-3">{tierData.description}</p>
            <p className="text-slate-400 text-xs italic flex items-center gap-1">
              <ChevronDown className="w-3 h-3" />
              Scroll down for full tier comparison
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  // Render tier select options based on event type
  const renderTierOptions = () => {
    return (
      <>
        <SelectItem value="platinum">Platinum – Bespoke</SelectItem>
        <SelectItem value="elite">Elite – Signature</SelectItem>
        <SelectItem value="gold">Gold – Magic + Mentalism</SelectItem>
        {!isLargeGala && <SelectItem value="silver">Silver – Classic</SelectItem>}
      </>
    );
  };

  // Get magician options based on selected performer
  const getMagicianOptions = (performerId) => {
    const performerName = performerId === 'johnny_wu' ? 'Johnny Wu' : 'Dylan George';
    return [
      { value: "1", label: `1 Magician: ${performerName}` },
      { value: "2", label: `2 Magicians: ${performerName} + Associate` },
      { value: "3", label: `3 Magicians: ${performerName} + 2 Associates` }
    ];
  };

  return (
    <div className="space-y-6 md:space-y-8">
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
        
        .luxury-sans {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 500;
          letter-spacing: 0.03em;
        }
      `}</style>

      {/* Header */}
      <div className="text-center mb-8 md:mb-12 px-4">
        <h2 className="luxury-serif text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-3 md:mb-4">
          Choose Your <span className="text-amber-400">Perfect Package</span>
        </h2>
        <p className="luxury-body text-base md:text-lg lg:text-xl text-slate-200 max-w-3xl mx-auto mb-2 md:mb-3">
          Select from three service options below. Investments update automatically as you customize.
        </p>
        <p className="luxury-body text-xs md:text-sm lg:text-base text-slate-400 italic max-w-2xl mx-auto">
          Performances are subject to change. Each performance is customized to suit and fit your specific event.
        </p>
        {isLargeGala && (
          <p className="luxury-body text-sm md:text-base lg:text-lg text-amber-400 mt-3 md:mt-4 font-semibold">
            Premium tiers only for your corporate gala event
          </p>
        )}
        {isPastEventDate && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-3 bg-red-600/20 border border-red-500 text-red-300 rounded-lg max-w-xl mx-auto flex items-center justify-center gap-2"
          >
            <CalendarOff className="w-5 h-5" />
            <p className="luxury-body text-sm md:text-base">
              The selected event date is in the past. Booking is disabled.
            </p>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 px-4">
        {/* Close-Up Mingling Magic */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-slate-800/90 border-2 border-slate-600 h-full flex flex-col">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-3">
                <Users className="w-7 h-7 sm:w-8 sm:h-8 text-blue-400" />
                <CardTitle className="luxury-serif text-xl md:text-2xl font-bold text-white">Close-Up Mingling Magic</CardTitle>
              </div>
              <p className="luxury-body text-sm md:text-base text-slate-200 mb-4">
                Interactive, up-close magic performed right in your guests' hands. Perfect for receptions, cocktail hours, dinners, and celebrations.
              </p>
              
              {/* YouTube Video */}
              <div className="relative w-full overflow-hidden rounded-lg mb-4" style={{ paddingTop: '56.25%' }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src="https://www.youtube.com/embed/PkjA2dtGNjk?si=5V9tn7XDV4C3QyFA"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Close-Up Mingling Magic Example"
                ></iframe>
              </div>
            </CardHeader>
            
            <CardContent className="flex-grow flex flex-col justify-between">
              <div className="space-y-4 mb-6">
                <div>
                  <label className="luxury-sans text-xs md:text-sm text-slate-300 block mb-2">Performer</label>
                  <Select value={closeUpPerformer} onValueChange={setCloseUpPerformer}>
                    <SelectTrigger className="bg-slate-700 border-slate-500 text-white text-sm md:text-base">
                      <SelectValue placeholder="Select performer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="johnny_wu">Johnny Wu</SelectItem>
                      <SelectItem value="dylan_george">Dylan George</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="luxury-sans text-xs md:text-sm text-slate-300 block mb-2">Duration</label>
                  <Select value={closeUpDuration} onValueChange={setCloseUpDuration}>
                    <SelectTrigger className="bg-slate-700 border-slate-500 text-white text-sm md:text-base">
                      <SelectValue placeholder="Select hours" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Hour</SelectItem>
                      <SelectItem value="2">2 Hours</SelectItem>
                      <SelectItem value="3">3 Hours</SelectItem>
                      <SelectItem value="4">4 Hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="luxury-sans text-xs md:text-sm text-slate-300 block mb-2">Number of Magicians</label>
                  <Select value={numMagicians} onValueChange={setNumMagicians}>
                    <SelectTrigger className="bg-slate-700 border-slate-500 text-white text-sm md:text-base">
                      <SelectValue placeholder="Select magicians" />
                    </SelectTrigger>
                    <SelectContent>
                      {getMagicianOptions(closeUpPerformer).map(option => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="luxury-sans text-xs md:text-sm text-slate-300 block mb-2 flex items-center gap-1">
                    <span 
                      className="cursor-pointer hover:text-amber-400 transition-colors"
                      title="Scroll down to see full tier comparison"
                      onClick={() => {
                        const tierSection = document.getElementById('tier-comparison-section');
                        if (tierSection) {
                          tierSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
                    >
                      Experience Tier
                    </span>
                    {closeUpTier && <TierInfo tier={closeUpTier} type="close_up" />}
                  </label>
                  <Select value={closeUpTier} onValueChange={setCloseUpTier}>
                    <SelectTrigger className="bg-slate-700 border-slate-500 text-white text-sm md:text-base">
                      <SelectValue placeholder="Select tier" />
                    </SelectTrigger>
                    <SelectContent>
                      {renderTierOptions()}
                    </SelectContent>
                  </Select>
                  <p className="luxury-body text-xs text-slate-400 mt-2 italic">
                    Each tier offers a unique level of personalization and impact.
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-600 pt-4">
                {closeUpDuration && numMagicians && closeUpTier && closeUpPerformer ? (
                  <>
                    <p className="luxury-serif text-base md:text-lg font-bold text-white mb-1">
                      {closeUpTier.charAt(0).toUpperCase() + closeUpTier.slice(1)} Experience
                    </p>
                    <p className="luxury-serif text-xl md:text-3xl font-bold text-amber-400 mb-2">
                      Investment: ${closeUpFinal.price.toLocaleString()}
                    </p>
                    <p className="luxury-body text-xs text-slate-400 mb-4">
                      {closeUpFinal.isPeakDate ? "Peak season/date rates apply for your chosen date." : "Availability is limited for your chosen date."}
                    </p>
                    <Button
                      onClick={handleBookCloseUp}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm md:text-base"
                      disabled={isPastEventDate}
                    >
                      Secure Close-Up Experience <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <p className="luxury-body text-sm md:text-base text-slate-400 text-center py-4">
                    Calculating your investment…
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stage Show */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-slate-800/90 border-2 border-slate-600 h-full flex flex-col">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-3">
                <Star className="w-7 h-7 sm:w-8 sm:h-8 text-purple-400" />
                <CardTitle className="luxury-serif text-xl md:text-2xl font-bold text-white">Stage Show</CardTitle>
              </div>
              <p className="luxury-body text-sm md:text-base text-slate-200 mb-4">
                A high-impact stage experience blending illusion, mentalism, and audience participation — perfect for conferences, galas, and celebrations.
              </p>
              
              {/* YouTube Video */}
              <div className="relative w-full overflow-hidden rounded-lg mb-4" style={{ paddingTop: '56.25%' }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src="https://www.youtube.com/embed/9YopnbOnWsg?start=46"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Stage Show Example"
                ></iframe>
              </div>
            </CardHeader>
            
            <CardContent className="flex-grow flex flex-col justify-between">
              <div className="space-y-4 mb-6">
                <div>
                  <label className="luxury-sans text-xs md:text-sm text-slate-300 block mb-2">Performer</label>
                  <Select value={stagePerformer} onValueChange={setStagePerformer}>
                    <SelectTrigger className="bg-slate-700 border-slate-500 text-white text-sm md:text-base">
                      <SelectValue placeholder="Select performer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="johnny_wu">Johnny Wu</SelectItem>
                      <SelectItem value="dylan_george">Dylan George</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="luxury-sans text-xs md:text-sm text-slate-300 block mb-2">Duration</label>
                  <Select value={stageDuration} onValueChange={setStageDuration}>
                    <SelectTrigger className="bg-slate-700 border-slate-500 text-white text-sm md:text-base">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 Minutes</SelectItem>
                      <SelectItem value="45">45 Minutes</SelectItem>
                      <SelectItem value="60">60 Minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="luxury-sans text-xs md:text-sm text-slate-300 block mb-2 flex items-center gap-1">
                    <span 
                      className="cursor-pointer hover:text-amber-400 transition-colors"
                      title="Scroll down to see full tier comparison"
                      onClick={() => {
                        const tierSection = document.getElementById('tier-comparison-section');
                        if (tierSection) {
                          tierSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
                    >
                      Experience Tier
                    </span>
                    {stageTier && <TierInfo tier={stageTier} type="stage" />}
                  </label>
                  <Select value={stageTier} onValueChange={setStageTier}>
                    <SelectTrigger className="bg-slate-700 border-slate-500 text-white text-sm md:text-base">
                      <SelectValue placeholder="Select tier" />
                    </SelectTrigger>
                    <SelectContent>
                      {renderTierOptions()}
                    </SelectContent>
                  </Select>
                  <p className="luxury-body text-xs text-slate-400 mt-2 italic">
                    Each tier offers a unique level of personalization and impact.
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-600 pt-4">
                {stageDuration && stageTier && stagePerformer ? (
                  <>
                    <p className="luxury-serif text-base md:text-lg font-bold text-white mb-1">
                      {stageTier.charAt(0).toUpperCase() + stageTier.slice(1)} Experience
                    </p>
                    <p className="luxury-serif text-xl md:text-3xl font-bold text-amber-400 mb-2">
                      Investment: ${stageFinal.price.toLocaleString()}
                    </p>
                    <p className="luxury-body text-xs text-slate-400 mb-4">
                      {stageFinal.isPeakDate ? "Peak season/date rates apply for your chosen date." : "Availability is limited for your chosen date."}
                    </p>
                    <Button
                      onClick={handleBookStage}
                      className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm md:text-base"
                      disabled={isPastEventDate}
                    >
                      Secure Stage Experience <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <p className="luxury-body text-sm md:text-base text-slate-400 text-center py-4">
                    Calculating your investment…
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bundle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-amber-900/50 to-slate-800/90 border-2 border-amber-500/60 h-full flex flex-col relative">
            <Badge className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-amber-500 text-slate-900 font-bold luxury-sans text-xs sm:text-sm">
              MOST POPULAR
            </Badge>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-3">
                <Gift className="w-7 h-7 sm:w-8 sm:h-8 text-amber-400" />
                <CardTitle className="luxury-serif text-xl md:text-2xl font-bold text-white">Bundle Package</CardTitle>
              </div>
              <p className="luxury-body text-sm md:text-base text-white">
                Our most popular package. Start with intimate strolling magic to warm up your guests, then end with a stage performance that leaves everyone talking.
              </p>
            </CardHeader>
            
            <CardContent className="flex-grow flex flex-col justify-between">
              <div className="space-y-4 mb-6">
                <div>
                  <label className="luxury-sans text-xs md:text-sm text-amber-100 block mb-2">Performer</label>
                  <Select value={bundlePerformer} onValueChange={setBundlePerformer}>
                    <SelectTrigger className="bg-slate-700 border-slate-500 text-white text-sm md:text-base">
                      <SelectValue placeholder="Select performer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="johnny_wu">Johnny Wu</SelectItem>
                      <SelectItem value="dylan_george">Dylan George</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="luxury-sans text-xs md:text-sm text-amber-100 block mb-2">Close-Up Duration</label>
                  <Select value={bundleCloseUpDuration} onValueChange={setBundleCloseUpDuration}>
                    <SelectTrigger className="bg-slate-700 border-slate-500 text-white text-sm md:text-base">
                      <SelectValue placeholder="Select hours" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Hour</SelectItem>
                      <SelectItem value="2">2 Hours</SelectItem>
                      <SelectItem value="3">3 Hours</SelectItem>
                      <SelectItem value="4">4 Hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="luxury-sans text-xs md:text-sm text-amber-100 block mb-2">Number of Magicians</label>
                  <Select value={bundleNumMagicians} onValueChange={setBundleNumMagicians}>
                    <SelectTrigger className="bg-slate-700 border-slate-500 text-white text-sm md:text-base">
                      <SelectValue placeholder="Select magicians" />
                    </SelectTrigger>
                    <SelectContent>
                      {getMagicianOptions(bundlePerformer).map(option => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="luxury-sans text-xs md:text-sm text-amber-100 block mb-2">Stage Show Duration</label>
                  <Select value={bundleStageDuration} onValueChange={setBundleStageDuration}>
                    <SelectTrigger className="bg-slate-700 border-slate-500 text-white text-sm md:text-base">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 Minutes</SelectItem>
                      <SelectItem value="45">45 Minutes</SelectItem>
                      <SelectItem value="60">60 Minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="luxury-sans text-xs md:text-sm text-amber-100 block mb-2 flex items-center gap-1">
                    <span 
                      className="cursor-pointer hover:text-amber-300 transition-colors"
                      title="Scroll down to see full tier comparison"
                      onClick={() => {
                        const tierSection = document.getElementById('tier-comparison-section');
                        if (tierSection) {
                          tierSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
                    >
                      Experience Tier
                    </span>
                    {bundleTier && <TierInfo tier={bundleTier} type="stage" />}
                  </label>
                  <Select value={bundleTier} onValueChange={setBundleTier}>
                    <SelectTrigger className="bg-slate-700 border-slate-500 text-white text-sm md:text-base">
                      <SelectValue placeholder="Select tier" />
                    </SelectTrigger>
                    <SelectContent>
                      {renderTierOptions()}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-t border-amber-500/40 pt-4">
                {bundleCloseUpDuration && bundleNumMagicians && bundleStageDuration && bundleTier && bundlePerformer ? (
                  <>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-amber-400" />
                      <p className="luxury-sans text-xs md:text-sm text-green-300">Save 10% automatically when combining close-up magic and stage performance</p>
                    </div>
                    <p className="luxury-serif text-base md:text-lg font-bold text-white mb-1">
                      {bundleTier.charAt(0).toUpperCase() + bundleTier.slice(1)} Experience
                    </p>
                    <p className="luxury-serif text-xl md:text-3xl font-bold text-amber-400 mb-2">
                      Investment: ${bundleFinal.price.toLocaleString()}
                    </p>
                    <p className="luxury-body text-xs text-amber-100 mb-4">
                      {bundleFinal.isPeakDate ? "Peak season/date rates apply for your chosen date." : "Availability is limited for your chosen date."}
                    </p>
                    <Button
                      onClick={handleBookBundle}
                      className="w-full bg-amber-600 hover:bg-amber-500 text-slate-900 font-bold text-sm md:text-base"
                      disabled={isPastEventDate}
                    >
                      Secure Bundle Experience <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <p className="luxury-body text-sm md:text-base text-white text-center py-4">
                    Calculating your investment…
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tier Scroll Hint */}
      <div className="mt-8 md:mt-12 text-center px-4">
        <p className="luxury-body text-sm md:text-base lg:text-lg text-slate-300 mb-2">Scroll down to explore all our entertainment tiers!</p>
        <ChevronDown className="w-6 md:w-8 h-6 md:h-8 mx-auto animate-bounce text-amber-500" />
      </div>
    </div>
  );
}
