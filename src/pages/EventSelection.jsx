import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, Heart, Video, Instagram, Youtube, Globe, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import FAQ from '../components/pricing/FAQ';
import { createPageUrl } from '@/utils';

const backgroundImageUrl = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9fdb80e10eb3dae94dfbf/e620330f2_IMG_1641.jpg";

const eventTypes = [
  {
    id: 'corporate',
    title: 'Corporate Event',
    icon: Building2,
    description: 'Team building, conferences, product launches',
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
    description: 'Ceremony, reception, rehearsal dinner',
    color: 'from-pink-500 to-pink-600'
  },
  {
    id: 'virtual',
    title: 'Virtual Event',
    icon: Video,
    description: 'Online shows, virtual meetings, livestreams',
    color: 'from-green-500 to-green-600'
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
  }
];

export default function EventSelection() {
  const handleEventTypeSelect = (eventType) => {
    window.location.href = createPageUrl(`Pricing?eventType=${eventType}`);
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
          className="fixed inset-0 bg-cover bg-center filter brightness-[0.3] z-0"
        />

        <div className="relative z-10">
          <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-12">
            <motion.img
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9fdb80e10eb3dae94dfbf/705652e3a_logowhitewordstransparent.png"
              alt="Omni Magic Entertainment"
              className="h-20 md:h-24 mb-6 drop-shadow-2xl"
            />
            
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-white text-[28px] md:text-[36px] font-bold text-center mb-3"
            >
              What Type of Event Are You Planning?
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-slate-300 text-[15px] md:text-[17px] text-center max-w-2xl mb-8"
            >
              Select your event type to get started with personalized pricing and options
            </motion.p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl w-full px-4">
              {eventTypes.map((type, index) => {
                const IconComponent = type.icon;
                return (
                  <motion.div
                    key={type.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  >
                    <Card
                      onClick={() => handleEventTypeSelect(type.id)}
                      className="bg-slate-800/90 border-2 border-slate-600 hover:border-amber-500 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105"
                    >
                      <CardHeader className="text-center pb-3">
                        <div className={`w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br ${type.color} flex items-center justify-center`}>
                          <IconComponent className="w-8 h-8 text-white" />
                        </div>
                        <CardTitle className="text-white text-[18px] font-semibold">
                          {type.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-center pb-6">
                        <p className="text-slate-300 text-[13px]">{type.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="max-w-4xl mx-auto px-4 py-12">
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
                    className="bg-slate-800/90 border border-slate-600 rounded-lg p-4 hover:border-amber-500 transition-all duration-300 hover:shadow-lg text-center group"
                  >
                    <IconComponent className="w-8 h-8 mx-auto mb-2 text-slate-400 group-hover:text-amber-400 transition-colors" />
                    <p className="text-white text-[13px] font-medium mb-1">{social.name}</p>
                    <p className="text-slate-400 text-[11px]">{social.handle}</p>
                  </a>
                );
              })}
            </div>
          </div>

          <div className="max-w-4xl mx-auto px-4 py-12">
            <FAQ />
          </div>
        </div>
      </div>
    </>
  );
}