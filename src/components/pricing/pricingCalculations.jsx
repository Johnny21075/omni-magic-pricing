// --- Core Pricing Data Structure (kept for fallback/admin use) ---
export const PRICING = {
  johnny_wu: {
    private: {
      gold: { close_up_per_hr: 1499, stage_30: 1499, stage_45: 1999, stage_60: 2499 },
      signature: { close_up_per_hr: 2499, stage_30: 1999, stage_45: 2499, stage_60: 2999 },
      diamond: { close_up_per_hr: 7499, stage_30: 5999, stage_45: 7499, stage_60: 8999 }
    },
    wedding: {
      gold: { close_up_per_hr: 1499, stage_20: 1499 },
      signature: { close_up_per_hr: 2999, stage_20: 2999 },
      diamond: { close_up_per_hr: 8999, stage_20: 8999 }
    },
    corporate_small: {
      gold: { close_up_per_hr: 1499, stage_30: 1499, stage_45: 1999, stage_60: 2499 },
      signature: { close_up_per_hr: 2499, stage_30: 1999, stage_45: 2499, stage_60: 2999 },
      diamond: { close_up_per_hr: 7499, stage_30: 5999, stage_45: 7499, stage_60: 8999 }
    },
    corporate_gala: {
      gold: { close_up_per_hr: 2999, stage_30: 2999, stage_45: 4499, stage_60: 5999 },
      signature: { close_up_per_hr: 3999, stage_30: 3999, stage_45: 5499, stage_60: 6999 },
      diamond: { close_up_per_hr: 11999, stage_30: 11999, stage_45: 16499, stage_60: 20999 }
    },
    kids_birthday: {
      gold: { stage_30: 1499, stage_45: 1999, stage_60: 2499 },
      signature: { stage_30: 1999, stage_45: 2499, stage_60: 2999 },
      diamond: { stage_30: 5999, stage_45: 7499, stage_60: 8999 }
    },
    bar_bat_mitzvah: {
      gold: { close_up_per_hr: 1500, stage_30: 1999, stage_45: 2499, stage_60: 2999 },
      signature: { close_up_per_hr: 3000, stage_30: 2999, stage_45: 3999, stage_60: 4999 },
      diamond: { close_up_per_hr: 5000, stage_30: 6999, stage_45: 8999, stage_60: 10999 }
    }
  },
  dylan_george: {
    private: {
      gold: { close_up_per_hr: 849, stage_30: 849, stage_45: 1249, stage_60: 1499 },
      signature: { close_up_per_hr: 1499, stage_30: 1499, stage_45: 1999, stage_60: 2499 },
      diamond: { close_up_per_hr: 2999, stage_30: 2999, stage_45: 4499, stage_60: 5999 }
    },
    wedding: {
      gold: { close_up_per_hr: 999, stage_20: 999 },
      signature: { close_up_per_hr: 1999, stage_20: 1999 },
      diamond: { close_up_per_hr: 2999, stage_20: 2999 }
    },
    corporate_small: {
      gold: { close_up_per_hr: 849, stage_30: 849, stage_45: 1249, stage_60: 1499 },
      signature: { close_up_per_hr: 1499, stage_30: 1499, stage_45: 1999, stage_60: 2499 },
      diamond: { close_up_per_hr: 2999, stage_30: 2999, stage_45: 4499, stage_60: 5999 }
    },
    corporate_gala: {
      gold: { close_up_per_hr: 1849, stage_30: 1849, stage_45: 2749, stage_60: 3849 },
      signature: { close_up_per_hr: 2449, stage_30: 2449, stage_45: 3349, stage_60: 4249 },
      diamond: { close_up_per_hr: 2999, stage_30: 2999, stage_45: 4499, stage_60: 5999 }
    },
    kids_birthday: {
      gold: { stage_30: 649, stage_45: 749, stage_60: 849 },
      signature: { stage_30: 999, stage_45: 1099, stage_60: 1199 },
      diamond: { stage_30: 1499, stage_45: 1799, stage_60: 1999 }
    },
    bar_bat_mitzvah: {
      gold: { close_up_per_hr: 1500, stage_30: 1299, stage_45: 1699, stage_60: 1999 },
      signature: { close_up_per_hr: 3000, stage_30: 1799, stage_45: 2299, stage_60: 2799 },
      diamond: { close_up_per_hr: 5000, stage_30: 2999, stage_45: 3999, stage_60: 4999 }
    }
  }
};

// --- Bundle Pricing Map (new architecture) ---
// One standard bundle (1h CU + 30m stage) and one premium bundle (2h CU + 30m stage).
// Categories must match getPricingCategory return values.
export const BUNDLES = {
  johnny_wu: {
    private: {
      standard: { closeUpHours: 1, stageDuration: 30, basePrice: 3500 },
      premium:  { closeUpHours: 2, stageDuration: 30, basePrice: 5000 },
    },
    wedding: {
      standard: { closeUpHours: 1, stageDuration: 30, basePrice: 3500 },
      premium:  { closeUpHours: 2, stageDuration: 30, basePrice: 5000 },
    },
    corporate_small: {
      standard: { closeUpHours: 1, stageDuration: 30, basePrice: 3500 },
      premium:  { closeUpHours: 2, stageDuration: 30, basePrice: 5000 },
    },
    corporate_gala: {
      standard: { closeUpHours: 1, stageDuration: 30, basePrice: 4500 },
      premium:  { closeUpHours: 2, stageDuration: 30, basePrice: 6500 },
    },
    bar_bat_mitzvah: {
      standard: { closeUpHours: 1, stageDuration: 30, basePrice: 3500 },
      premium:  { closeUpHours: 2, stageDuration: 30, basePrice: 5000 },
    },
  },
  dylan_george: {
    private: {
      standard: { closeUpHours: 1, stageDuration: 30, basePrice: 1750 },
      premium:  { closeUpHours: 2, stageDuration: 30, basePrice: 2250 },
    },
    wedding: {
      standard: { closeUpHours: 1, stageDuration: 30, basePrice: 1750 },
      premium:  { closeUpHours: 2, stageDuration: 30, basePrice: 2250 },
    },
    corporate_small: {
      standard: { closeUpHours: 1, stageDuration: 30, basePrice: 1750 },
      premium:  { closeUpHours: 2, stageDuration: 30, basePrice: 2250 },
    },
    corporate_gala: {
      standard: { closeUpHours: 1, stageDuration: 30, basePrice: 2250 },
      premium:  { closeUpHours: 2, stageDuration: 30, basePrice: 3000 },
    },
    bar_bat_mitzvah: {
      standard: { closeUpHours: 1, stageDuration: 30, basePrice: 1750 },
      premium:  { closeUpHours: 2, stageDuration: 30, basePrice: 2250 },
    },
  },
};

// --- Extra Time Add-On Pricing ---
// Per 30-minute block of additional close-up magic, by performer.
export const EXTRA_CLOSEUP_PRICING = {
  johnny_wu:    { default: 750 },
  dylan_george: { default: 300 },
};

// Stage show upgrades from the base 30 minutes.
export const STAGE_UPGRADE_PRICING = {
  johnny_wu:    { to45: 500,  to60: 1000 },
  dylan_george: { to45: 250,  to60: 500  },
};

// --- Single unified pricing function ---
export const calculatePackagePrice = ({
  performer,
  bundleType,           // 'standard' | 'premium'
  eventType,
  eventScale,
  extraCloseUpMinutes,  // 0, 30, 60 (only for standard; premium locked to 0)
  stageDuration,        // 30, 45, 60
  dateString,
}) => {
  const category = getPricingCategory(eventType, eventScale);
  const bundle = BUNDLES[performer]?.[category]?.[bundleType];
  if (!bundle) throw new Error('Invalid bundle selection');

  let subtotal = bundle.basePrice;

  // Extra close-up (in 30-min blocks)
  const extraBlocks = Math.round((extraCloseUpMinutes || 0) / 30);
  if (extraBlocks > 0) {
    const perBlock = EXTRA_CLOSEUP_PRICING[performer]?.default || 0;
    subtotal += perBlock * extraBlocks;
  }

  // Stage upgrade
  if (stageDuration === 45) {
    subtotal += STAGE_UPGRADE_PRICING[performer].to45;
  } else if (stageDuration === 60) {
    subtotal += STAGE_UPGRADE_PRICING[performer].to60;
  }

  const { price, multiplier } = calculateFinalPrice(subtotal, dateString);
  return { price, multiplier };
};

// Kids birthday hardcoded public prices (Dylan George only on UI)
export const KIDS_PRICING = {
  weekday: 595,  // Mon–Thu
  weekend: 695,  // Fri–Sun
  closeup_addon: 250, // +30m close-up add-on
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

  if (eventType === 'bar_bat_mitzvah') {
    return 'bar_bat_mitzvah';
  }

  if (eventType === 'private') {
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

// Virtual show calculation — returns { price, multiplier }
export const calculateVirtualPrice = (duration, dateString) => {
  if (!duration) return { price: 0, multiplier: 1 };
  const base = VIRTUAL_PRICING[duration] || 0;
  return calculateFinalPrice(base, dateString);
};

// Filter available tiers based on event type and scale
export const getAvailableTiers = (eventType, eventSize, eventScale) => {
  if (eventScale === 'vip' || eventScale === 'elite') {
    return ['signature', 'diamond'];
  }
  return ['gold', 'signature', 'diamond'];
};

// 1. Close-Up Mingling Magic Calculation — returns { price, multiplier }
export const calculateCloseUpPrice = (performer, tier, closeUpHours, numMagicians, eventType, eventScale, dateString) => {
  if (!closeUpHours) return { price: 0, multiplier: 1 };
  const pricing = getPerformerPricing(performer, tier, eventType, eventScale);

  let basePrice = pricing.close_up_per_hr * parseFloat(closeUpHours);

  const magicianCount = parseInt(numMagicians);
  if (magicianCount > 1) {
    basePrice = basePrice + (basePrice * (magicianCount - 1) * 0.9);
  }

  return calculateFinalPrice(basePrice, dateString);
};

// 2. Stage Show Calculation — returns { price, multiplier }
export const calculateStagePrice = (performer, tier, stageDuration, eventType, eventScale, dateString) => {
  if (!stageDuration) return { price: 0, multiplier: 1 };
  const pricing = getPerformerPricing(performer, tier, eventType, eventScale);

  const category = getPricingCategory(eventType, eventScale);

  let basePrice;
  if (category === 'wedding') {
    basePrice = pricing.stage_20 || 0;
  } else {
    const stageKey = `stage_${stageDuration}`;
    basePrice = pricing[stageKey] || 0;
  }

  return calculateFinalPrice(basePrice, dateString);
};

// 3. Bundle Calculation — uses BUNDLES map for standard/premium, falls back to legacy logic
export const calculateBundlePrice = (
  performer,
  tier,
  closeUpHours,
  numMagicians,
  stageDuration,
  eventType,
  eventScale,
  dateString
) => {
  const category = getPricingCategory(eventType, eventScale);

  const isOnePlusThirty = parseInt(closeUpHours) === 1 && parseInt(stageDuration) === 30;
  const isTwoPlusThirty = parseInt(closeUpHours) === 2 && parseInt(stageDuration) === 30;
  const bundleKey = isOnePlusThirty ? 'standard' : isTwoPlusThirty ? 'premium' : null;

  let baseSubtotal;

  if (
    bundleKey &&
    BUNDLES[performer] &&
    BUNDLES[performer][category] &&
    BUNDLES[performer][category][bundleKey]
  ) {
    // Use fixed bundle pricing
    baseSubtotal = BUNDLES[performer][category][bundleKey].basePrice;
  } else {
    // Fallback: legacy per-hour logic with 10% bundle discount
    const closeUpResult = calculateCloseUpPrice(performer, tier, closeUpHours, numMagicians, eventType, eventScale);
    const stageResult = calculateStagePrice(performer, tier, stageDuration, eventType, eventScale);
    baseSubtotal = 0.9 * (closeUpResult.price + stageResult.price);
  }

  return calculateFinalPrice(baseSubtotal, dateString);
};

// Tier descriptions
export const TIER_DESCRIPTIONS = {
  close_up: {
    diamond: {
      title: "Diamond",
      description: "A fully customized magical experience designed specifically for your event.\nOften chosen by luxury brands, Fortune 500 companies, and high profile audiences.",
      startingPrice: 4999
    },
    signature: {
      title: "Signature ⭐ Most Popular",
      description: "Omni Magic's signature experience featuring advanced magic, mind reading, and interactive moments that create unforgettable reactions.\nMost requested for corporate events and upscale private celebrations.",
      startingPrice: 2499
    },
    gold: {
      title: "Gold",
      description: "Elegant sleight-of-hand magic performed inches from your guests using cards, rings, and everyday objects.\nPerfect for cocktail hours, mixers, and intimate gatherings.",
      startingPrice: 1499
    }
  },
  stage: {
    diamond: {
      title: "Diamond",
      description: "A fully customized stage show tailored to your audience, brand, or VIP guests.\nReserved for luxury productions and high profile events.",
      startingPrice: 4999
    },
    signature: {
      title: "Signature ⭐ Most Popular",
      description: "Omni Magic's signature stage experience featuring magic, mind reading, and powerful audience interaction.\nMost requested for corporate events, conferences, and gala audiences.",
      startingPrice: 1999
    },
    gold: {
      title: "Gold",
      description: "A high energy magic show with visual illusions and audience participation.\nPerfect for private events and smaller gatherings.",
      startingPrice: 1499
    }
  }
};