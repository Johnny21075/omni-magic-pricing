import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Star, Crown, Gem } from 'lucide-react';
import { motion } from 'framer-motion';
import { PRICING, isPeakDate } from './pricingCalculations';

export default function TierComparison({ eventDate }) {
  const [selectedPerformer, setSelectedPerformer] = useState('johnny_wu');

  // Determine pricing for selected performer
  const performerPricing = PRICING[selectedPerformer];

  // Check if the event date is a peak date and apply multiplier
  const isPeak = eventDate ? isPeakDate(eventDate) : false;
  const multiplier = isPeak ? 1.5 : 1;

  const tierData = [
    {
      id: 'platinum',
      name: 'Platinum',
      subtitle: 'Bespoke Immersive Experience',
      icon: Gem,
      iconColor: 'text-cyan-400',
      borderColor: 'border-cyan-500',
      bgColor: 'bg-slate-800',
      description: 'The ultimate level of customization. Every illusion, prediction, and routine is built exclusively around your story, brand, or event theme. Includes creative development, rehearsal day, travel, and exclusive effects performed only for you. Limited to a handful of performances each year for the most discerning clients.',
      tone: 'Luxury, one-of-a-kind, fully tailored production.',
      closeUpStarting: Math.round(performerPricing.platinum.close_up_per_hr * multiplier),
      stageStarting: Math.round(performerPricing.platinum.stage_30 * multiplier)
    },
    {
      id: 'elite',
      name: 'Elite',
      subtitle: 'Signature Headliner Experience',
      icon: Crown,
      iconColor: 'text-purple-400',
      borderColor: 'border-purple-500',
      bgColor: 'bg-slate-800',
      description: 'The Signature Omni Magic experience. A cinematic, high-impact performance featuring telepathy, hypnosis-style moments, and emotionally charged storytelling. Designed to feel like a world-class headliner performance with professional sound, lighting, and pacing.',
      tone: 'Sophisticated, awe-inspiring, ideal for galas, conferences, and VIP clients.',
      closeUpStarting: Math.round(performerPricing.elite.close_up_per_hr * multiplier),
      stageStarting: Math.round(performerPricing.elite.stage_30 * multiplier)
    },
    {
      id: 'gold',
      name: 'Gold',
      subtitle: 'Magic + Mentalism',
      icon: Star,
      iconColor: 'text-amber-400',
      borderColor: 'border-amber-500',
      bgColor: 'bg-slate-800',
      description: 'A step beyond classic magic — this tier blends sleight-of-hand with mind-reading, predictions, and audience participation. Creates deeper, more personal moments while keeping the energy high and the humor clean.',
      tone: 'Smart, modern, and ideal for weddings, private events, or small corporate teams.',
      closeUpStarting: Math.round(performerPricing.gold.close_up_per_hr * multiplier),
      stageStarting: Math.round(performerPricing.gold.stage_30 * multiplier)
    },
    {
      id: 'silver',
      name: 'Silver',
      subtitle: 'Classic Magic',
      icon: Sparkles,
      iconColor: 'text-slate-300',
      borderColor: 'border-slate-400',
      bgColor: 'bg-slate-800',
      description: 'The perfect starting point for unforgettable entertainment. Engaging, interactive, and visual magic performed right in front of your guests. Ideal for birthdays, cocktail hours, and smaller gatherings that want big reactions without production requirements.',
      tone: 'Fun, personable, family-friendly, high interaction.',
      closeUpStarting: Math.round((selectedPerformer === 'johnny_wu' ? performerPricing.silver.close_up_1hr : performerPricing.silver.close_up_per_hr) * multiplier),
      stageStarting: Math.round(performerPricing.silver.stage_30 * multiplier)
    }
  ];

  return (
    <div>
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

      <div className="text-center mb-8 md:mb-12 px-4">
        <h2 className="luxury-serif text-3xl md:text-5xl font-bold text-white mb-4">
          Understanding Our <span className="text-amber-400">Experience Tiers</span>
        </h2>
        <p className="luxury-body text-base md:text-xl text-slate-200 max-w-3xl mx-auto mb-4">
          Each tier is designed to match your event's style, audience, and goals — from classic entertainment to fully customized luxury experiences.
        </p>
        
        {/* Performer Selection Dropdown */}
        <div className="flex justify-center items-center gap-3 mb-6">
          <label className="luxury-sans text-sm md:text-base text-slate-300">View pricing for:</label>
          <Select value={selectedPerformer} onValueChange={setSelectedPerformer}>
            <SelectTrigger className="w-48 bg-slate-800 border-slate-600 text-white">
              <SelectValue placeholder="Select performer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="johnny_wu">Johnny Wu</SelectItem>
              <SelectItem value="dylan_george">Dylan George</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 md:gap-6 px-4">
        {tierData.map((tier, index) => {
          const IconComponent = tier.icon;
          return (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`${tier.bgColor} border-2 ${tier.borderColor} h-full hover:shadow-2xl transition-all duration-300`}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <IconComponent className={`w-8 md:w-10 h-8 md:h-10 ${tier.iconColor}`} />
                      <div>
                        <CardTitle className="luxury-serif text-xl md:text-3xl font-bold text-white">
                          {tier.name}
                        </CardTitle>
                        <p className="luxury-sans text-xs md:text-sm text-slate-200 mt-1">{tier.subtitle}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Starting Investment */}
                  <div className="bg-slate-700/50 rounded-lg p-3 mb-4">
                    <p className="luxury-sans text-xs text-slate-400 mb-2">Investment starts at:</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="luxury-body text-xs text-slate-300">Close-Up (1hr)</p>
                        <p className="luxury-serif text-lg font-bold text-amber-400">${tier.closeUpStarting.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="luxury-body text-xs text-slate-300">Stage (30min)</p>
                        <p className="luxury-serif text-lg font-bold text-amber-400">${tier.stageStarting.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="luxury-body text-sm md:text-base text-white leading-relaxed">
                    {tier.description}
                  </p>
                  
                  <div className="pt-4 border-t border-slate-600">
                    <p className="luxury-sans text-xs md:text-sm text-slate-300 mb-2 font-semibold">Best For:</p>
                    <p className="luxury-body text-sm md:text-base text-slate-100 italic">
                      {tier.tone}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8 md:mt-12 text-center px-4">
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-4 md:p-6 max-w-4xl mx-auto">
          <p className="luxury-body text-sm md:text-lg text-white">
            <span className="text-amber-400 font-bold">Not sure which tier is right for you?</span> Our team can help you choose the perfect experience based on your event type, audience size, and goals. All tiers can be customized to your needs.
          </p>
        </div>
      </div>
    </div>
  );
}