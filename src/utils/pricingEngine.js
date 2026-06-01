const FDM_DENSITIES = {
  pla: 1.24, petg: 1.27, abs: 1.04,
  asa: 1.07, tpu: 1.21, nylon: 1.14,
};

export const getDensity = (materialName, technology) => {
  if (technology === "sla") return null;
  const key = materialName.toLowerCase().replace(/[^a-z]/g, "");
  for (const [mat, den] of Object.entries(FDM_DENSITIES)) {
    if (key.includes(mat)) return den;
  }
  return 1.24;
};

// ── Commercial pricing ───────────────────────────────────────────────────────

export const COMMERCIAL_MARKUP = 2.5;

export const calculateSalePrice = (costReal, markup = COMMERCIAL_MARKUP, minimumPrice = 0) => {
  const raw     = costReal * markup;
  const rounded = Math.round(raw / 500) * 500;
  return Math.max(rounded, minimumPrice);
};

// ── Printer cost derivation ──────────────────────────────────────────────────

export const calculatePrinterCosts = (printer) => {
  const totalHours =
    printer.amortizationYears *
    printer.daysPerYear *
    printer.hoursPerDay;

  const amortPerHour = printer.purchasePriceCRC / totalHours;
  const elecPerHour  = (printer.wattsConsumption / 1000) * printer.electricityRateCRC;
  const profile      =
    printer.printSpeedProfiles[printer.defaultProfile] ||
    printer.printSpeedProfiles.standard;

  return {
    amortPerHour,
    elecPerHour,
    gPerHour:     profile.gPerHour,
    mlPerHour:    printer.slaSpeedMLPerHour || 17,
    operatorRate: printer.operatorRateCRC,
    prepHours:    printer.prepHours,
    postHours:    printer.postHours,
    failureRate:  printer.failureRate,
    profileLabel: profile.label,
    printerName:  printer.name,
    printerId:    printer.id,
  };
};

// ── FDM price calculation ────────────────────────────────────────────────────

export const calculateFDMPrice = ({
  weightGrams,
  pricePerGram,
  supportExtraMaterial = 0,
  supportExtraTime = 0,
  costs,
  markup = COMMERCIAL_MARKUP,
  minimumPrice = 0,
  supportLevel = "none",
}) => {
  const effectiveWeight = weightGrams * (1 + supportExtraMaterial);
  const basePrintHours  = weightGrams / costs.gPerHour;
  const printHours      = basePrintHours * (1 + supportExtraTime);

  const materialBase   = weightGrams * pricePerGram;
  const supportMatCost = (effectiveWeight - weightGrams) * pricePerGram;
  const materialCost   = materialBase + supportMatCost;
  const electricity    = printHours * costs.elecPerHour;
  const amortization   = printHours * costs.amortPerHour;
  const labor          = costs.operatorRate * (costs.prepHours + costs.postHours);
  const subtotal       = materialCost + electricity + amortization + labor;
  const failureCost    = subtotal * costs.failureRate;
  const costReal       = Math.round(subtotal + failureCost);
  const salePrice      = calculateSalePrice(costReal, markup, minimumPrice);

  return {
    // Admin only — never show to customer
    costReal,
    printHours,
    effectiveWeight,
    materialBase,
    supportMatCost,
    materialCost,
    electricity,
    amortization,
    labor,
    failureCost,
    subtotal,
    // Customer facing
    salePrice,
    margin:       0.60,
    markup,
    // Support info
    isSLA:        false,
    needsSupports: supportExtraMaterial > 0,
    supportLevel,
  };
};

// ── SLA price calculation ────────────────────────────────────────────────────

export const calculateSLAPrice = ({
  weightGrams,
  density,
  pricePerML,
  supportExtraMaterial = 0,
  supportExtraTime = 0,
  costs,
  markup = COMMERCIAL_MARKUP,
  minimumPrice = 0,
  supportLevel = "none",
}) => {
  const volumeML       = weightGrams / density;
  const effectiveVol   = volumeML * (1 + supportExtraMaterial);
  const basePrintHours = volumeML / costs.mlPerHour;
  const printHours     = basePrintHours * (1 + supportExtraTime);

  const materialBase   = volumeML * pricePerML;
  const supportMatCost = (effectiveVol - volumeML) * pricePerML;
  const materialCost   = materialBase + supportMatCost;
  const electricity    = printHours * costs.elecPerHour;
  const amortization   = printHours * costs.amortPerHour;
  const labor          = costs.operatorRate * (costs.prepHours + costs.postHours);
  const subtotal       = materialCost + electricity + amortization + labor;
  const failureCost    = subtotal * costs.failureRate;
  const costReal       = Math.round(subtotal + failureCost);
  const salePrice      = calculateSalePrice(costReal, markup, minimumPrice);

  return {
    // Admin only
    costReal,
    printHours,
    volumeML,
    effectiveVol,
    materialBase,
    supportMatCost,
    materialCost,
    electricity,
    amortization,
    labor,
    failureCost,
    subtotal,
    // Customer facing
    salePrice,
    margin:       0.60,
    markup,
    // Support info
    isSLA:        true,
    needsSupports: supportExtraMaterial > 0,
    supportLevel,
  };
};

// ── Display helpers ──────────────────────────────────────────────────────────

export const formatPrintTime = (hours) => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `~${m}m`;
  if (m === 0) return `~${h}h`;
  return `~${h}h ${m}m`;
};

export const formatCRC = (amount) =>
  "₡" + Math.round(amount).toLocaleString("es-CR");
