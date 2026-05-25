import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Users, Heart, Cake, Instagram, Youtube, Globe, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import FAQ from '../components/pricing/FAQ';
import { createPageUrl } from '@/utils';

const backgroundImageUrl = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9fdb80e10eb3dae94dfbf/e620330f2_IMG_1641.jpg";

const eventTypes = [
{
  id: 'corporate',
  title: 'Corporate Event',
  icon: Building2,
  description: 'Corporate events, conferences, holiday parties',
  color: 'from-blue-500 to-blue-600'
},
{
  id: 'private',
  title: 'Private Event',
  icon: Users,
  description: 'Birthday parties, anniversaries, celebrations',
  color: 'from-purple-500 to-purple-600'
},
{
  id: 'wedding',
  title: 'Wedding',
  icon: Heart,
  description: 'Cocktail hour, reception dinner',
  color: 'from-pink-500 to-pink-600'
},
{
  id: 'bar_bat_mitzvah',
  title: 'Bar/Bat Mitzvah',
  icon: Cake,
  description: 'Coming of age celebration',
  color: 'from-amber-500 to-amber-600'
}
];


const socialLinks = [
{
  name: 'Instagram',
  icon: Instagram,
  url: 'https://www.instagram.com/johnnywumagic/',
  handle: '@johnnywumagic'
},
{
  name: 'YouTube',
  icon: Youtube,
  url: 'https://www.youtube.com/channel/UCdbSu6lwRyJFZhG2f7tpDyw',
  handle: 'Johnny Wu Magic'
},
{
  name: 'Website',
  icon: Globe,
  url: 'https://www.omnimagic.co/',
  handle: 'omnimagic.co'
},
{
  name: 'Yelp',
  icon: Star,
  url: 'https://www.yelp.com/biz/omni-magic-entertainment-los-angeles',
  handle: '1,000+ Reviews'
}];


export default function Home() {
  const [showCorporateModal, setShowCorporateModal] = useState(false);
  const [corporateSize, setCorporateSize] = useState(null);

  const [showPrivateModal, setShowPrivateModal] = useState(false);
  const [showWeddingModal, setShowWeddingModal] = useState(false);
  const [showMitzvahModal, setShowMitzvahModal] = useState(false);

  const handleEventTypeSelect = (eventType) => {
    if (eventType === 'corporate') {
      setShowCorporateModal(true);
      setCorporateSize(null);
    } else if (eventType === 'private') {
      setShowPrivateModal(true);
    } else if (eventType === 'wedding') {
      setShowWeddingModal(true);
    } else if (eventType === 'bar_bat_mitzvah') {
      setShowMitzvahModal(true);
    }
  };

  const handleCorporateSelection = (size, scale) => {
    window.location.href = `/Pricing?eventType=corporate&eventSize=${size}&eventScale=${scale}`;
  };

  const handlePrivateSelection = (scale) => {
    window.location.href = `/Pricing?eventType=private&eventScale=${scale}`;
  };

  const handleWeddingSelection = (scale) => {
    window.location.href = `/Pricing?eventType=wedding&eventScale=${scale}`;
  };

  const handleMitzvahSelection = (scale) => {
    window.location.href = `/Pricing?eventType=bar_bat_mitzvah&eventScale=${scale}`;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        body {
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          line-height: 1.3;
        }
        
        @media (max-width: 768px) {
          body {
            font-size: 14px;
          }
        }
      `}</style>

      <div className="min-h-screen bg-slate-900">
        <div
          style={{ backgroundImage: `url(${backgroundImageUrl})` }}
          className="fixed inset-0 bg-cover bg-center filter brightness-[0.3] z-0" />


        <div className="relative z-10">
          <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-12">
             <motion.img
               initial={{ opacity: 0, y: -20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6 }}
               src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9fdb80e10eb3dae94dfbf/705652e3a_logowhitewordstransparent.png"
               alt="Omni Magic Entertainment"
               className="h-20 md:h-24 mb-6 drop-shadow-2xl" />


             <motion.h1
               initial={{ opacity: 0, y: -20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 0.2 }}
               className="text-white text-[28px] md:text-[36px] font-bold text-center mb-3">

               What Type of Event Are You Planning?
             </motion.h1>

             <motion.p
               initial={{ opacity: 0, y: -20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 0.3 }}
               className="text-slate-200 text-[15px] md:text-[17px] text-center max-w-2xl mb-8">

               Select your event type to get started with personalized pricing and options
             </motion.p>

             <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-6xl w-full px-4">
               {eventTypes.map((type, index) => {
                 const IconComponent = type.icon;
                 return (
                   <motion.div
                     key={type.id}
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}>

                     <Card
                       onClick={() => handleEventTypeSelect(type.id)}
                       className="bg-slate-800/90 border-2 border-slate-600 hover:border-amber-500 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105 h-full flex flex-col">

                       <CardHeader className="text-center pb-3 flex-1 flex flex-col justify-center">
                         <div className={`w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br ${type.color} flex items-center justify-center`}>
                           <IconComponent className="w-8 h-8 text-white" />
                         </div>
                         <CardTitle className="text-white text-[18px] font-semibold">
                           {type.title}
                         </CardTitle>
                       </CardHeader>
                       <CardContent className="text-center pb-6">
                         <p className="text-slate-200 text-[13px]">{type.description}</p>
                       </CardContent>
                     </Card>
                   </motion.div>);

               })}
             </div>
           </div>

           <div className="max-w-4xl mx-auto px-4 py-12">
             <div className="flex justify-center gap-4 mb-8 flex-wrap">
               <Button
                 onClick={() => window.location.href = '/GratuityPage'}
                 className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-semibold px-8 py-6 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
               >
                 Leave a Gratuity
               </Button>
               <Button
                 onClick={() => window.location.href = '/Pricing'}
                 className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-8 py-6 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
               >
                 Deposit & Hold My Date
               </Button>
             </div>

             <h2 className="text-white text-[20px] md:text-[24px] font-semibold text-center mb-6">
               Connect With Us
             </h2>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {socialLinks.map((social) => {
                 const IconComponent = social.icon;
                 return (
                   <a
                     key={social.name}
                     href={social.url}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="bg-slate-800/90 border border-slate-600 rounded-lg p-4 hover:border-amber-500 transition-all duration-300 hover:shadow-lg text-center group">

                     <IconComponent className="w-8 h-8 mx-auto mb-2 text-slate-400 group-hover:text-amber-400 transition-colors" />
                     <p className="text-white text-[13px] font-medium mb-1">{social.name}</p>
                     <p className="text-slate-400 text-[11px]">{social.handle}</p>
                   </a>);

               })}
             </div>
           </div>

          <div className="max-w-4xl mx-auto px-4 py-12">
            <h2 className="text-white text-[20px] md:text-[24px] font-semibold text-center mb-8">
              Trusted by Industry Leaders
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start justify-items-center">
              {/* Google Recognition */}
              <div className="flex flex-col items-center text-center">
                <img src="https://media.base44.com/images/public/68b9fdb80e10eb3dae94dfbf/bc46bf2ad_Google_2015_logosvg1.png" alt="Google" className="h-10 mb-2" />
                <div className="flex mb-1">
                  <Star fill="#FBBF24" strokeWidth={0} className="w-5 h-5 text-yellow-400" />
                  <Star fill="#FBBF24" strokeWidth={0} className="w-5 h-5 text-yellow-400" />
                  <Star fill="#FBBF24" strokeWidth={0} className="w-5 h-5 text-yellow-400" />
                  <Star fill="#FBBF24" strokeWidth={0} className="w-5 h-5 text-yellow-400" />
                  <Star fill="#FBBF24" strokeWidth={0} className="w-5 h-5 text-yellow-400" />
                </div>
                <p className="text-slate-200 text-sm">5.0 Based on 1048 Reviews</p>
              </div>

              {/* Yelp Recognition */}
              <div className="flex flex-col items-center text-center">
                <img src="https://media.base44.com/images/public/68b9fdb80e10eb3dae94dfbf/36e8646f9_Yelp_Logosvg.png" alt="Yelp" className="h-10 mb-2" />
                <div className="flex mb-1">
                  <Star fill="#FBBF24" strokeWidth={0} className="w-5 h-5 text-yellow-400" />
                  <Star fill="#FBBF24" strokeWidth={0} className="w-5 h-5 text-yellow-400" />
                  <Star fill="#FBBF24" strokeWidth={0} className="w-5 h-5 text-yellow-400" />
                  <Star fill="#FBBF24" strokeWidth={0} className="w-5 h-5 text-yellow-400" />
                  <Star fill="#FBBF24" strokeWidth={0} className="w-5 h-5 text-yellow-400" />
                </div>
                <p className="text-slate-200 text-sm">5.0 Based on 1000 Reviews</p>
              </div>

              {/* Netflix Recognition */}
              <div className="flex flex-col items-center text-center">
                <img src="https://media.base44.com/images/public/68b9fdb80e10eb3dae94dfbf/77d485a14_Netflix_2015_logo.svg" alt="Netflix" className="h-10 mb-2" />
                <p className="text-slate-200 text-sm mt-5">As Seen On Netflix Star Search</p>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto px-4 py-12">
            <FAQ />
          </div>
        </div>
      </div>

      {/* Corporate Event Selection Modal */}
      <Dialog open={showCorporateModal} onOpenChange={setShowCorporateModal}>
        <DialogContent className="bg-slate-900 border-2 border-amber-500/50 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-[24px] md:text-[28px] font-bold text-center text-white">
              Tell Us About Your Corporate Event
            </DialogTitle>
            <p className="text-slate-200 text-center text-[14px] md:text-[15px] mt-2">
              Select the options that best describe your event
            </p>
          </DialogHeader>

          <div className="space-y-6 px-2 md:px-6 pb-4">
            {/* Step 1: Event Size */}
            <div className="space-y-3">
              <h3 className="text-[18px] md:text-[20px] font-bold text-white text-center mb-4">
                How many people will attend?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => setCorporateSize('under100')}
                  className={`
                    rounded-xl p-5 border-2 transition-all duration-300 hover:scale-102
                    ${corporateSize === 'under100' ?
                  'bg-gradient-to-br from-amber-500 to-amber-600 border-amber-400 shadow-lg' :
                  'bg-slate-800 border-slate-600 hover:border-slate-500'}
                  `
                  }>

                  <div className="text-center">
                    <p className={`font-bold text-[20px] mb-2 ${
                    corporateSize === 'under100' ? 'text-slate-900' : 'text-white'}`
                    }>
                      Under 100
                    </p>
                    <p className={`text-[14px] ${
                    corporateSize === 'under100' ? 'text-slate-800' : 'text-slate-200'}`
                    }>
                      Smaller gathering
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setCorporateSize('over100')}
                  className={`
                    rounded-xl p-5 border-2 transition-all duration-300 hover:scale-102
                    ${corporateSize === 'over100' ?
                  'bg-gradient-to-br from-amber-500 to-amber-600 border-amber-400 shadow-lg' :
                  'bg-slate-800 border-slate-600 hover:border-slate-500'}
                  `
                  }>

                  <div className="text-center">
                    <p className={`font-bold text-[20px] mb-2 ${
                    corporateSize === 'over100' ? 'text-slate-900' : 'text-white'}`
                    }>
                      Over 100
                    </p>
                    <p className={`text-[14px] ${
                    corporateSize === 'over100' ? 'text-slate-800' : 'text-slate-200'}`
                    }>
                      Larger audience
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Step 2: Event Type */}
            {corporateSize &&
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-3">

                <h3 className="text-[18px] md:text-[20px] font-bold text-white text-center mb-4">
                  What type of corporate event?
                </h3>
                <div className="space-y-3">
                  {/* Small Team Meeting */}
                  <button
                  onClick={() => handleCorporateSelection(corporateSize, 'small')}
                  className="w-full rounded-xl p-5 bg-slate-800 border-2 border-slate-600 hover:border-blue-500 hover:bg-slate-750 transition-all duration-300 text-left group">

                    <div>
                      <p className="font-bold text-[17px] md:text-[18px] text-white mb-2 group-hover:text-blue-400 transition-colors">
                        Small Team Meeting / Networking Event
                      </p>
                      <p className="text-[14px] text-slate-200 leading-relaxed">
                        Casual atmosphere, team building, smaller budget
                      </p>
                    </div>
                  </button>

                  {/* High-End Gala */}
                  <button
                  onClick={() => handleCorporateSelection(corporateSize, 'large')}
                  className="w-full rounded-xl p-5 bg-slate-800 border-2 border-slate-600 hover:border-purple-500 hover:bg-slate-750 transition-all duration-300 text-left group">

                    <div>
                      <p className="font-bold text-[17px] md:text-[18px] text-white mb-2 group-hover:text-purple-400 transition-colors">
                        High-End Gala / Conference
                      </p>
                      <p className="text-[14px] text-slate-200 leading-relaxed">
                        Formal atmosphere, VIP clients, premium experience
                      </p>
                    </div>
                  </button>

                  {/* VIP Option (only for under 100) */}
                  {corporateSize === 'under100' &&
                <button
                  onClick={() => handleCorporateSelection(corporateSize, 'vip')}
                  className="w-full rounded-xl p-5 bg-gradient-to-br from-amber-900/40 to-amber-800/40 border-2 border-amber-500 hover:border-amber-400 hover:shadow-lg transition-all duration-300 text-left group">

                      <div>
                        <p className="font-bold text-[17px] md:text-[18px] text-amber-300 mb-2 group-hover:text-amber-200 transition-colors">
                          High-End VIP Experience
                        </p>
                        <p className="text-[13px] md:text-[14px] text-white leading-relaxed">
                          An ultra-exclusive performance crafted for the most elite gatherings — think twenty billionaires in one private dinner, each leaving speechless. Every moment is custom-tailored, every illusion personal. This isn't just a magic show — it's a cinematic, mind-bending experience that transforms luxury entertainment into legend.
                        </p>
                      </div>
                    </button>
                }
                </div>
              </motion.div>
            }
          </div>
        </DialogContent>
      </Dialog>

      {/* Private Event Selection Modal */}
      <Dialog open={showPrivateModal} onOpenChange={setShowPrivateModal}>
        <DialogContent className="bg-slate-900 border-2 border-amber-500/50 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-[24px] md:text-[28px] font-bold text-center text-white">
              Select Your Private Event Experience
            </DialogTitle>
            <p className="text-slate-200 text-center text-[14px] md:text-[15px] mt-2">
              Choose the perfect entertainment for your celebration
            </p>
          </DialogHeader>

          <div className="space-y-3 px-2 md:px-6 pb-4">
            {/* Kids Birthday */}
            <button
              onClick={() => handlePrivateSelection('kids')}
              className="w-full rounded-xl p-5 bg-slate-800 border-2 border-slate-600 hover:border-pink-500 hover:bg-slate-750 transition-all duration-300 text-left group">

              <div>
                <p className="font-bold text-[17px] md:text-[18px] text-white mb-2 group-hover:text-pink-400 transition-colors">
                  Kids Birthday Party (mainly kids under 11 years old)
                </p>
                <p className="text-[14px] text-slate-200 leading-relaxed">
                  Playful, interactive, and family-friendly magic designed to create lifelong memories.
                </p>
              </div>
            </button>

            {/* Adult Celebration */}
            <button
              onClick={() => handlePrivateSelection('adult')}
              className="w-full rounded-xl p-5 bg-slate-800 border-2 border-slate-600 hover:border-purple-500 hover:bg-slate-750 transition-all duration-300 text-left group">

              <div>
                <p className="font-bold text-[17px] md:text-[18px] text-white mb-2 group-hover:text-purple-400 transition-colors">
                  Adult Celebration (over 12 years old)
                </p>
                <p className="text-[14px] text-slate-200 leading-relaxed">
                  Sophisticated entertainment tailored for birthdays, anniversaries, or milestone moments.
                </p>
              </div>
            </button>

            {/* VIP Experience */}
            <button
              onClick={() => handlePrivateSelection('vip')}
              className="w-full rounded-xl p-5 bg-gradient-to-br from-amber-900/40 to-amber-800/40 border-2 border-amber-500 hover:border-amber-400 hover:shadow-lg transition-all duration-300 text-left group">

              <div>
                <p className="font-bold text-[17px] md:text-[18px] text-amber-300 mb-2 group-hover:text-amber-200 transition-colors">
                  High-End VIP Experience
                </p>
                <p className="text-[12px] md:text-[13px] text-amber-400 mb-2 font-medium">
                  Elite & Platinum tiers only
                </p>
                <p className="text-[13px] md:text-[14px] text-white leading-relaxed">
                  The ultimate private performance for those who demand the extraordinary. Imagine an intimate dinner with twenty billionaires — every guest leaves astonished. Every illusion is personalized, every moment cinematic. This is our most exclusive experience, designed for clients who want nothing less than legendary.
                </p>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Wedding Event Selection Modal */}
      <Dialog open={showWeddingModal} onOpenChange={setShowWeddingModal}>
        <DialogContent className="bg-slate-900 border-2 border-amber-500/50 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-[24px] md:text-[28px] font-bold text-center text-white">
              Choose Your Wedding Experience
            </DialogTitle>
            <p className="text-slate-200 text-center text-[14px] md:text-[15px] mt-2">
              Make your special day truly unforgettable
            </p>
          </DialogHeader>

          <div className="space-y-3 px-2 md:px-6 pb-4">
            {/* Standard Experience */}
            <button
              onClick={() => handleWeddingSelection('standard')}
              className="w-full rounded-xl p-5 bg-slate-800 border-2 border-slate-600 hover:border-pink-500 hover:bg-slate-750 transition-all duration-300 text-left group">

              <div>
                <p className="font-bold text-[17px] md:text-[18px] text-white mb-2 group-hover:text-pink-400 transition-colors">
                  Standard Experience
                </p>
                <p className="text-[14px] text-slate-200 leading-relaxed">
                  Elegant, heartfelt, and beautifully integrated into your celebration.
                </p>
              </div>
            </button>

            {/* Elite Experience */}
            <button
              onClick={() => handleWeddingSelection('elite')}
              className="w-full rounded-xl p-5 bg-gradient-to-br from-amber-900/40 to-amber-800/40 border-2 border-amber-500 hover:border-amber-400 hover:shadow-lg transition-all duration-300 text-left group">

              <div>
                <p className="font-bold text-[17px] md:text-[18px] text-amber-300 mb-2 group-hover:text-amber-200 transition-colors">
                  Elite Experience
                </p>
                <p className="text-[12px] md:text-[13px] text-amber-400 mb-2 font-medium">
                  Elite & Platinum tiers only
                </p>
                <p className="text-[13px] md:text-[14px] text-white leading-relaxed">
                  Our signature luxury performance crafted to mesmerize your guests and elevate your wedding into an unforgettable story.
                </p>
              </div>
            </button>
          </div>
          </DialogContent>
          </Dialog>

          {/* Bar/Bat Mitzvah Event Selection Modal */}
          <Dialog open={showMitzvahModal} onOpenChange={setShowMitzvahModal}>
          <DialogContent className="bg-slate-900 border-2 border-amber-500/50 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-[24px] md:text-[28px] font-bold text-center text-white">
              Choose Your Bar/Bat Mitzvah Experience
            </DialogTitle>
            <p className="text-slate-200 text-center text-[14px] md:text-[15px] mt-2">
              Make this milestone celebration truly unforgettable
            </p>
          </DialogHeader>

          <div className="space-y-3 px-2 md:px-6 pb-4">
            {/* Standard Experience */}
            <button
              onClick={() => handleMitzvahSelection('standard')}
              className="w-full rounded-xl p-5 bg-slate-800 border-2 border-slate-600 hover:border-amber-500 hover:bg-slate-750 transition-all duration-300 text-left group">

              <div>
                <p className="font-bold text-[17px] md:text-[18px] text-white mb-2 group-hover:text-amber-400 transition-colors">
                  Standard Experience
                </p>
                <p className="text-[14px] text-slate-200 leading-relaxed">
                  Dynamic entertainment that engages guests of all ages and creates lasting memories.
                </p>
              </div>
            </button>

            {/* Premium Experience */}
            <button
              onClick={() => handleMitzvahSelection('premium')}
              className="w-full rounded-xl p-5 bg-gradient-to-br from-amber-900/40 to-amber-800/40 border-2 border-amber-500 hover:border-amber-400 hover:shadow-lg transition-all duration-300 text-left group">

              <div>
                <p className="font-bold text-[17px] md:text-[18px] text-amber-300 mb-2 group-hover:text-amber-200 transition-colors">
                  Premium Experience
                </p>
                <p className="text-[13px] md:text-[14px] text-white leading-relaxed">
                  Elevated entertainment with customized performances that celebrate this special milestone in unforgettable style.
                </p>
              </div>
            </button>
          </div>
          </DialogContent>
          </Dialog>
          </>);

          }