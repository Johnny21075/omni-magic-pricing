
import React from 'react';

export default function LogoMarquee() {
  const logos = [
    {
      name: "Apple",
      url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9fdb80e10eb3dae94dfbf/159725910_apple-logo.png"
    },
    {
      name: "Google", 
      url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9fdb80e10eb3dae94dfbf/13f85f608_Google_2015_logosvg.png"
    },
    {
      name: "Netflix",
      url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9fdb80e10eb3dae94dfbf/20a89d21e_Logonetflix.png"
    },
    {
      name: "Rolex",
      url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9fdb80e10eb3dae94dfbf/5c9864dc2_Logo_da_Rolex.png"
    },
    {
      name: "Rolls Royce",
      url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9fdb80e10eb3dae94dfbf/ed3db74de_rolls-royce-logo-png_seeklogo-299337.png"
    },
    {
      name: "Hermes",
      url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9fdb80e10eb3dae94dfbf/8b9e33ef1_hd-hermes-paris-logo-transparent-png-7017516947138953cme7mlxrb.png"
    },
    {
      name: "Allianz",
      url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9fdb80e10eb3dae94dfbf/3fe662ad7_Allianz-logo.png"
    },
    {
      name: "Prologis",
      url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9fdb80e10eb3dae94dfbf/6eadf9634_Prologis_logosvg.png"
    }
  ];

  // Triple the logos for ultra-smooth seamless loop
  const duplicatedLogos = [...logos, ...logos, ...logos];

  return (
    <div className="relative py-6 overflow-hidden">
      <div className="text-center mb-8">
        <p className="luxury-body text-slate-400 text-lg italic">Trusted by Fortune 500 Companies</p>
      </div>
      
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
        .marquee-container {
          animation: marquee 20s linear infinite;
        }
        .marquee-container:hover {
          animation-play-state: paused;
        }
      `}</style>
      
      <div className="flex marquee-container">
        {duplicatedLogos.map((logo, index) => (
          <div
            key={`${logo.name}-${index}`}
            className="flex-shrink-0 w-40 h-16 flex items-center justify-center px-4"
          >
            <img
              src={logo.url}
              alt={logo.name}
              className="max-h-8 max-w-32 object-contain opacity-60 hover:opacity-100 transition-opacity duration-300 filter grayscale hover:grayscale-0"
            />
          </div>
        ))}
      </div>
      
      {/* Gradient overlays for smooth fade */}
      <div className="absolute top-0 left-0 bottom-0 w-32 bg-gradient-to-r from-slate-900 to-transparent pointer-events-none z-10"></div>
      <div className="absolute top-0 right-0 bottom-0 w-32 bg-gradient-to-l from-slate-900 to-transparent pointer-events-none z-10"></div>
    </div>
  );
}
