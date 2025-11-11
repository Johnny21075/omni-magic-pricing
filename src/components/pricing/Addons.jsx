import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, ExternalLink } from 'lucide-react';

export default function Addons({ addons, onOpenInquiry }) {
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

      <div className="text-center mb-8 md:mb-12">
        <h2 className="luxury-serif text-3xl md:text-5xl font-bold text-white mb-4">
          Enhance Your <span className="text-amber-400">Experience</span>
        </h2>
        <p className="luxury-body text-lg md:text-xl text-slate-200 max-w-3xl mx-auto mb-6">
          Take your event to the next level with these premium add-ons
        </p>
        <Button 
          onClick={onOpenInquiry}
          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-bold text-base md:text-lg px-8 py-6"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Inquire About Add-ons
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {addons.map(addon => (
          <Card key={addon.id} className="bg-slate-800/90 border-2 border-slate-600 p-6 flex flex-col justify-between hover:border-amber-500/50 transition-all hover:shadow-2xl">
            <div>
              <div className="flex justify-between items-start mb-4">
                <h3 className="luxury-serif text-lg md:text-xl font-semibold text-white pr-4">{addon.label}</h3>
              </div>
              
              <p className="luxury-body text-sm text-slate-300 mb-4 leading-relaxed">{addon.tooltip}</p>
              
              <p className="luxury-serif text-2xl md:text-3xl font-bold text-amber-400 mb-4">+${addon.price.toLocaleString()}</p>
              
              {addon.preview_url && (
                <a 
                  href={addon.preview_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors mb-4 inline-flex items-center gap-1"
                >
                  📺 Watch Preview <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}