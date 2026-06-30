// Bidirectional conversion: Supabase snake_case DB rows ↔ camelCase JS objects.
// Used by App.jsx (read) and Dashboard.jsx + server/routes/admin.js (write).

// ── Printers ──────────────────────────────────────────────────────

export function mapPrinterFromDB(row) {
  return {
    id:                  row.id,
    name:                row.name,
    technology:          row.technology,
    status:              row.status,
    purchasePriceCRC:    Number(row.purchase_price_crc),
    amortizationYears:   Number(row.amortization_years),
    daysPerYear:         Number(row.days_per_year),
    hoursPerDay:         Number(row.hours_per_day),
    wattsConsumption:    Number(row.watts_consumption),
    electricityRateCRC:  Number(row.electricity_rate_crc),
    printSpeedProfiles:  row.print_speed_profiles,
    defaultProfile:      row.default_profile,
    buildVolume:         row.build_volume,
    maxTempNozzle:       row.max_temp_nozzle != null ? Number(row.max_temp_nozzle) : undefined,
    maxTempBed:          row.max_temp_bed    != null ? Number(row.max_temp_bed)    : undefined,
    hasEnclosure:        row.has_enclosure,
    operatorRateCRC:     Number(row.operator_rate_crc),
    prepHours:           Number(row.prep_hours),
    postHours:           Number(row.post_hours),
    failureRate:         Number(row.failure_rate),
    purchaseDate:        row.purchase_date || undefined,
    notes:               row.notes || '',
    slaSpeedMLPerHour:   row.sla_speed_ml_per_hour != null ? Number(row.sla_speed_ml_per_hour) : undefined,
  };
}

export function printerToSnakeCase(p) {
  const row = {
    id:                    p.id,
    name:                  p.name,
    technology:            p.technology,
    status:                p.status,
    purchase_price_crc:    p.purchasePriceCRC,
    amortization_years:    p.amortizationYears,
    days_per_year:         p.daysPerYear,
    hours_per_day:         p.hoursPerDay,
    watts_consumption:     p.wattsConsumption,
    electricity_rate_crc:  p.electricityRateCRC,
    print_speed_profiles:  p.printSpeedProfiles,
    default_profile:       p.defaultProfile,
    build_volume:          p.buildVolume,
    has_enclosure:         p.hasEnclosure,
    operator_rate_crc:     p.operatorRateCRC,
    prep_hours:            p.prepHours,
    post_hours:            p.postHours,
    failure_rate:          p.failureRate,
    purchase_date:         p.purchaseDate || null,
    notes:                 p.notes || null,
    updated_at:            new Date().toISOString(),
  };
  if (p.maxTempNozzle != null)      row.max_temp_nozzle       = p.maxTempNozzle;
  if (p.maxTempBed    != null)      row.max_temp_bed          = p.maxTempBed;
  if (p.slaSpeedMLPerHour != null)  row.sla_speed_ml_per_hour = p.slaSpeedMLPerHour;
  return row;
}

// ── Materials ─────────────────────────────────────────────────────

// Returns [name, materialObj] — use with Object.fromEntries()
export function mapMaterialFromDB(row) {
  const mat = {
    technology:   row.technology,
    spoolWeightG: Number(row.spool_weight_g),
    spoolPriceCRC: Number(row.spool_price_crc),
    pricePerGram: Number(row.price_per_gram),
    colors:       row.colors || [],
  };
  if (row.density    != null) mat.density    = Number(row.density);
  if (row.price_per_ml != null) mat.pricePerML = Number(row.price_per_ml);
  return [row.name, mat];
}

export function materialToSnakeCase(name, mat) {
  return {
    name,
    technology:      mat.technology,
    spool_weight_g:  mat.spoolWeightG,
    spool_price_crc: mat.spoolPriceCRC,
    price_per_gram:  mat.pricePerGram,
    density:         mat.density     ?? null,
    price_per_ml:    mat.pricePerML  ?? null,
    colors:          mat.colors      ?? [],
    updated_at:      new Date().toISOString(),
  };
}

// ── Settings ──────────────────────────────────────────────────────

export function mapSettingsFromDB(row) {
  return {
    businessName:        row.business_name,
    email:               row.email               || '',
    whatsapp:            row.whatsapp             || '',
    address:             row.address              || '',
    currency:            row.currency,
    applyVAT:            row.apply_vat,
    vatRate:             Number(row.vat_rate),
    commercialMarkup:    Number(row.commercial_markup),
    urgencySemi:         Number(row.urgency_semi),
    urgencyUrgent:       Number(row.urgency_urgent),
    minimumPrice:        Number(row.minimum_price),
    quoteValidDays:      Number(row.quote_valid_days),
    welcomeMessage:      row.welcome_message      || '',
    responseTimeH:       Number(row.response_time_h),
    notificationEmail:   row.notification_email   || '',
    lowStockAlert:       Number(row.low_stock_alert),
    supportLightMat:     Number(row.support_light_mat),
    supportLightTime:    Number(row.support_light_time),
    supportModerateMat:  Number(row.support_moderate_mat),
    supportModerateTime: Number(row.support_moderate_time),
    supportHeavyMat:     Number(row.support_heavy_mat),
    supportHeavyTime:    Number(row.support_heavy_time),
    infillWeightFactor:  Number(row.infill_weight_factor),
  };
}

export function settingsToSnakeCase(s) {
  return {
    business_name:         s.businessName,
    email:                 s.email,
    whatsapp:              s.whatsapp,
    address:               s.address,
    currency:              s.currency,
    apply_vat:             s.applyVAT,
    vat_rate:              s.vatRate,
    commercial_markup:     s.commercialMarkup,
    urgency_semi:          s.urgencySemi,
    urgency_urgent:        s.urgencyUrgent,
    minimum_price:         s.minimumPrice,
    quote_valid_days:      s.quoteValidDays,
    welcome_message:       s.welcomeMessage,
    response_time_h:       s.responseTimeH,
    notification_email:    s.notificationEmail,
    low_stock_alert:       s.lowStockAlert,
    support_light_mat:     s.supportLightMat,
    support_light_time:    s.supportLightTime,
    support_moderate_mat:  s.supportModerateMat,
    support_moderate_time: s.supportModerateTime,
    support_heavy_mat:     s.supportHeavyMat,
    support_heavy_time:    s.supportHeavyTime,
    infill_weight_factor:  s.infillWeightFactor,
  };
}
