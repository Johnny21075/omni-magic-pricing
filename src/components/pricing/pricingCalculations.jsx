// --- Core Pricing Data Structure ---
export const PRICING = {
  johnny_wu: {
    private: {
      gold: { close_up_per_hr: 1499, stage_30: 1499, stage_45: 1999, stage_60: 2499 },
      elite: { close_up_per_hr: 2499, stage_30: 1999, stage_45: 2499, stage_60: 2999 },
      platinum: { close_up_per_hr: 4999, stage_30: 4999, stage_45: 7499, stage_60: 9999 }
    },
    wedding: {
      gold: { close_up_per_hr: 1499, stage_20: 1499 },
      elite: { close_up_per_hr: 2499, stage_20: 2499 },
      platinum: { close_up_per_hr: 4999, stage_20: 4999 }
    },
    corporate_small: {
      gold: { close_up_per_hr: 1499, stage_30: 1499, stage_45: 1999, stage_60: 2499 },
      elite: { close_up_per_hr: 2499, stage_30: 1999, stage_45: 2499, stage_60: 2999 },
      platinum: { close_up_per_hr: 4999, stage_30: 4999, stage_45: 7499, stage_60: 9999 }
    },
    corporate_gala: {
      gold: { close_up_per_hr: 2999, stage_30: 2999, stage_45: 4499, stage_60: 5999 },
      elite: { close_up_per_hr: 3999, stage_30: 3999, stage_45: 5499, stage_60: 6999 },
      platinum: { close_up_per_hr: 4999, stage_30: 4999, stage_45: 7499, stage_60: 9999 }
    },
    kids_birthday: {
      gold: { stage_30: 1499, stage_45: 1999, stage_60: 2499 },
      elite: { stage_30: 1999, stage_45: 2499, stage_60: 2999 },
      platinum: { stage_30: 4999, stage_45: 7499, stage_60: 9999 }
    }
  },
  dylan_george: {
    private: {
      gold: { close_up_per_hr: 849, stage_30: 849, stage_45: 1249, stage_60: 1499 },
      elite: { close_up_per_hr: 1499, stage_30: 1499, stage_45: 1999, stage_60: 2499 },
      platinum: { close_up_per_hr: 2999, stage_30: 2999, stage_45: 4499, stage_60: 5999 }
    },
    wedding: {
      gold: { close_up_per_hr: 849, stage_20: 1249 },
      elite: { close_up_per_hr: 1499, stage_20: 1999 },
      platinum: { close_up_per_hr: 2999, stage_20: 2999 }
    },
    corporate_small: {
      gold: { close_up_per_hr: 849, stage_30: 849, stage_45: 1249, stage_60: 1499 },
      elite: { close_up_per_hr: 1499, stage_30: 1499, stage_45: 1999, stage_60: 2499 },
      platinum: { close_up_per_hr: 2999, stage_30: 2999, stage_45: 4499, stage_60: 5999 }
    },
    corporate_gala: {
      gold: { close_up_per_hr: 1849, stage_30: 1849, stage_45: 2749, stage_60: 3849 },
      elite: { close_up_per_hr: 2449, stage_30: 2449, stage_45: 3349, stage_60: 4249 },
      platinum: { close_up_per_hr: 2999, stage_30: 2999, stage_45: 4499, stage_60: 5999 }
    },
    kids_birthday: {
      gold: { stage_30: 649, stage_45: 749, stage_60: 849 },
      elite: { stage_30: 999, stage_45: 1099, stage_60: 1199 },
      platinum: { stage_30: 1499, stage_45: 1799, stage_60: 1999 }
    }
  }
};

// Virtual show pricing (flat rates, no performer selection)
export const VIRTUAL_PRICING = {
  30: 1499,
  45: 1999,
  60: 2499
};

// --- Helper function to determine pricing category from event type and scale ---
export const getPricingCategory = (eventType, eventScale) => {
  if (eventType === 'wedding') {
    return 'wedding';
  }
  
  if (eventType === 'private') {
    // Check if it's a kids birthday party
    if (eventScale === 'kids') {
      return 'kids_birthday';
    }
    return 'private';
  }
  
  if (eventType === 'corporate') {
    if (eventScale === 'small') {
      return 'corporate_small';
    }
    if (eventScale === 'large' || eventScale === 'vip') {
      return 'corporate_gala';
    }
  }
  
  // Default to private for any unhandled cases
  return 'private';
};

// --- Peak Date Logic ---
export const isPeakDate = (dateString) => {
  if (!dateString) return false;
  const checkDate = new Date(dateString + 'T00:00:00');
  const month = checkDate.getMonth();
  const day = checkDate.getDate();

  if (month === 9 && day >= 25 && day <= 31) return true;
  if (month === 11 && day >= 1 && day <= 14) return true;
  if (month === 11 && day === 31) return true;

  return false;
};

// --- Main Pricing Calculation Function ---
export const calculateFinalPrice = (basePrice, dateString) => {
  let multiplier = 1;

  if (dateString && isPeakDate(dateString)) {
    multiplier = 1.5;
  }
  
  const finalPrice = Math.round(basePrice * multiplier);
  
  // Round to nearest $100
  const roundedPrice = Math.round(finalPrice / 100) * 100;
  
  return { price: roundedPrice, multiplier };
};

// --- Deposit Calculation (10% hold) ---
export const calculateDepositAmount = (totalPrice) => {
  if (typeof totalPrice !== 'number' || totalPrice < 0) {
    console.warn('Invalid totalPrice provided for deposit calculation. Must be a non-negative number.');
    return 0;
  }
  return Math.round(totalPrice * 0.10);
};

// --- Service-Specific Pricing Functions ---

export const getPerformerPricing = (performer, tier, eventType, eventScale) => {
  const category = getPricingCategory(eventType, eventScale);
  
  if (!PRICING[performer] || !PRICING[performer][category] || !PRICING[performer][category][tier]) {
    console.warn(`Pricing data missing for performer: ${performer}, category: ${category}, tier: ${tier}. Defaulting to private/gold.`);
    return PRICING.johnny_wu.private.gold;
  }
  
  return PRICING[performer][category][tier];
};

// Virtual show calculation
export const calculateVirtualPrice = (duration) => {
  if (!duration) return 0;
  return VIRTUAL_PRICING[duration] || 0;
};

// Filter available tiers based on event type and scale
export const getAvailableTiers = (eventType, eventSize, eventScale) => {
  // For high-end VIP events, only show elite and platinum
  if (eventScale === 'vip' || eventScale === 'elite') {
    return ['elite', 'platinum'];
  }

  // For all other events (including kids parties), show gold, elite, and platinum
  return ['gold', 'elite', 'platinum'];
};

// 1. Close-Up Mingling Magic Calculation
export const calculateCloseUpPrice = (performer, tier, closeUpHours, numMagicians, eventType, eventScale) => {
  if (!closeUpHours) return 0;
  
  // Handle duo performer (Johnny Wu + Dylan George)
  if (performer === 'duo') {
    const johnnyPricing = getPerformerPricing('johnny_wu', tier, eventType, eventScale);
    const dylanPricing = getPerformerPricing('dylan_george', tier, eventType, eventScale);
    
    const johnnyPrice = johnnyPricing.close_up_per_hr * parseInt(closeUpHours);
    const dylanPrice = dylanPricing.close_up_per_hr * parseInt(closeUpHours);
    
    const combinedPrice = johnnyPrice + dylanPrice;
    
    // Apply 10% duo discount
    return combinedPrice * 0.9;
  }
  
  const pricing = getPerformerPricing(performer, tier, eventType, eventScale);
  
  let basePrice = pricing.close_up_per_hr * parseInt(closeUpHours);
  
  // Apply team discount (10% off per additional magician)
  const magicianCount = parseInt(numMagicians);
  if (magicianCount > 1) {
    // First magician full price, additional magicians get 10% discount
    basePrice = basePrice + (basePrice * (magicianCount - 1) * 0.9);
  }
  
  return basePrice;
};

// 2. Stage Show Calculation
export const calculateStagePrice = (performer, tier, stageDuration, eventType, eventScale) => {
  if (!stageDuration) return 0;
  const pricing = getPerformerPricing(performer, tier, eventType, eventScale);
  
  const category = getPricingCategory(eventType, eventScale);
  
  // For weddings, use stage_20 pricing
  if (category === 'wedding') {
    return pricing.stage_20 || 0;
  }
  
  // For other events, use stage_30/45/60
  const stageKey = `stage_${stageDuration}`;
  return pricing[stageKey] || 0;
};

// 3. Bundle (Close-Up + Stage) Calculation - 10% discount
export const calculateBundlePrice = (performer, tier, closeUpHours, numMagicians, stageDuration, eventType, eventScale) => {
  if (!closeUpHours || !numMagicians || !stageDuration) return 0;
  
  const closeUpBase = calculateCloseUpPrice(performer, tier, closeUpHours, numMagicians, eventType, eventScale);
  const stageBase = calculateStagePrice(performer, tier, stageDuration, eventType, eventScale);
  
  const subtotal = closeUpBase + stageBase;
  const withDiscount = subtotal * 0.9; // 10% bundle discount
  
  return withDiscount;
};

// Tier descriptions - Updated with shorter, easier-to-read descriptions
export const TIER_DESCRIPTIONS = {
  close_up: {
    platinum: {
      title: "Bespoke (Platinum) — Close-Up Magic",
      description: "Ultra-exclusive experience with telepathy and instant hypnosis. Reserved for the most elite gatherings.",
      startingPrice: 4999
    },
    elite: {
      title: "Premier (Elite) — Close-Up Magic",
      description: "Advanced magic, mentalism, and telepathy. The most impactful experience we offer — unforgettable for years.",
      startingPrice: 2499
    },
    gold: {
      title: "Signature (Gold) — Close-Up Magic",
      description: "Sleight-of-hand combined with mind-reading. Predicting thoughts and creating magical moments.",
      startingPrice: 1499
    },
    silver: {
      title: "Essential (Silver) — Close-Up Magic",
      description: "Pure close-up magic with cards, rings, and visual impossibilities. Perfect for smaller gatherings.",
      startingPrice: 1500
    }
  },
  stage: {
    platinum: {
      title: "Bespoke (Platinum) — Stage Magic",
      description: "Fully customized production with branded illusions, personalized scripts, and your company's message.",
      startingPrice: 4999
    },
    elite: {
      title: "Premier (Elite) — Stage Magic",
      description: "World-class performance featuring hypnosis, telepathy, and the Golden Buzzer illusion from AGT.",
      startingPrice: 1999
    },
    gold: {
      title: "Signature (Gold) — Stage Magic",
      description: "Dynamic blend of magic and mentalism that amazes and engages your audience.",
      startingPrice: 1499
    },
    silver: {
      title: "Essential (Silver) — Stage Magic",
      description: "High-energy magic show with visual illusions and audience interaction. Pure entertainment.",
      startingPrice: 1500
    }
  }
};