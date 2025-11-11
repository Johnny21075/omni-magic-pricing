import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ExternalLink, ShoppingCart, ArrowLeft, PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AddonSelectionModal({ isOpen, onClose, onContinue, initialPackage, mode = 'package', availableAddons = [] }) {
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      // Reset selected addons when modal closes
      setSelectedAddons([]);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleCheckboxChange = (addonId) => {
    setSelectedAddons(prev =>
      prev.includes(addonId) ? prev.filter(id => id !== addonId) : [...prev, addonId]
    );
  };

  const currentSelectedAddonDetails = availableAddons.filter(addon => selectedAddons.includes(addon.id));
  const totalAddonCost = currentSelectedAddonDetails.reduce((sum, addon) => sum + addon.price, 0);

  const handleProceed = async () => {
    setIsSubmitting(true);
    
    if (mode === 'package') {
      // Pass package and selected addons to continue callback
      onContinue(initialPackage, currentSelectedAddonDetails);
    } else if (mode === 'inquiry') {
      // For inquiry mode, just pass the selected addons
      await onContinue(currentSelectedAddonDetails);
    }
    
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-amber-400/30 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
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
        `}</style>

        <DialogHeader>
          <DialogTitle className="luxury-serif text-xl md:text-2xl font-bold text-center text-white mb-2">
            {mode === 'package' ? 'Enhance Your Experience' : 'Inquire About Add-ons'}
          </DialogTitle>
          <p className="luxury-body text-sm md:text-base text-slate-400 text-center">
            {mode === 'package' 
              ? 'Select premium add-ons to customize your booking (optional).'
              : 'Choose one or more add-ons you are interested in. We will contact you to discuss further.'}
          </p>
        </DialogHeader>

        {mode === 'package' && initialPackage && (
          <div className="bg-slate-800/70 p-4 rounded-lg border border-slate-700 mb-4">
            <h3 className="text-amber-400 font-bold text-lg mb-2">Your Current Selection:</h3>
            <p className="text-white text-md">
              {initialPackage.type} - {initialPackage.performer} ({initialPackage.duration})
            </p>
            <p className="text-lg font-bold text-white mt-1">
              Base Investment: ${initialPackage.price.toLocaleString()}
            </p>
          </div>
        )}

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {availableAddons.map((addon) => (
            <motion.div
              key={addon.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`bg-slate-800/70 p-4 rounded-lg border-2 transition-all ${
                selectedAddons.includes(addon.id) 
                  ? 'border-amber-500 bg-amber-900/20' 
                  : 'border-slate-700 hover:border-slate-600'
              }`}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  id={addon.id}
                  checked={selectedAddons.includes(addon.id)}
                  onCheckedChange={() => handleCheckboxChange(addon.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <label htmlFor={addon.id} className="cursor-pointer">
                    <h4 className="luxury-serif text-base md:text-lg font-bold text-white mb-2">
                      {addon.label}
                    </h4>
                    <p className="luxury-body text-sm text-slate-300 mb-3">
                      {addon.tooltip}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="luxury-serif text-xl md:text-2xl font-bold text-amber-400">
                        +${addon.price.toLocaleString()}
                      </p>
                      {addon.preview_url && (
                        <a
                          href={addon.preview_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="luxury-body text-xs md:text-sm text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          📺 Watch Demo <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </label>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {selectedAddons.length > 0 && (
          <div className="bg-amber-900/30 border border-amber-500/50 rounded-lg p-4 mt-4">
            <div className="flex justify-between items-center">
              <span className="luxury-serif text-white font-bold">
                {selectedAddons.length} Add-on{selectedAddons.length > 1 ? 's' : ''} Selected
              </span>
              <span className="luxury-serif text-xl md:text-2xl font-bold text-amber-400">
                +${totalAddonCost.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          
          {mode === 'package' && (
            <Button
              onClick={handleProceed}
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-bold"
            >
              {isSubmitting ? (
                'Processing...'
              ) : selectedAddons.length > 0 ? (
                <>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Continue with {selectedAddons.length} Add-on{selectedAddons.length > 1 ? 's' : ''}
                </>
              ) : (
                'Skip Add-ons & Continue'
              )}
            </Button>
          )}

          {mode === 'inquiry' && (
            <Button
              onClick={handleProceed}
              disabled={isSubmitting || selectedAddons.length === 0}
              className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold"
            >
              {isSubmitting ? (
                'Sending...'
              ) : (
                <>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Send Inquiry for {selectedAddons.length} Add-on{selectedAddons.length > 1 ? 's' : ''}
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}