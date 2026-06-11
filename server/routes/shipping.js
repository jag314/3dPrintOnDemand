import { Router } from 'express';
import supabase from '../lib/supabase.js';

const router = Router();

const GAM_PROVINCES = new Set(['San José', 'Alajuela', 'Cartago', 'Heredia']);

// GET /api/shipping/calculate?province=Heredia&weight_g=250
router.get('/calculate', async (req, res) => {
  try {
    const { province, weight_g } = req.query;

    if (!province || !weight_g) {
      return res.status(400).json({ error: 'province and weight_g are required' });
    }

    const weightG = parseInt(weight_g, 10);
    if (isNaN(weightG) || weightG <= 0) {
      return res.status(400).json({ error: 'weight_g must be a positive integer' });
    }

    const { data: config, error: cfgErr } = await supabase
      .from('shipping_config')
      .select('margin_percent, packaging_weight_g')
      .eq('carrier', 'correos_cr')
      .single();

    if (cfgErr || !config) {
      return res.status(500).json({ error: 'Shipping config not found' });
    }

    const zone = GAM_PROVINCES.has(province) ? 'GAM' : 'RESTO';

    const { data: rate, error: rateErr } = await supabase
      .from('shipping_rates')
      .select('first_kg_crc, additional_kg_crc')
      .eq('carrier', 'correos_cr')
      .eq('origin_zone', 'GAM')
      .eq('destination_zone', zone)
      .single();

    if (rateErr || !rate) {
      return res.status(500).json({ error: 'Shipping rate not found for zone: ' + zone });
    }

    const totalWeightG = weightG + config.packaging_weight_g;
    const weightKg     = totalWeightG / 1000;

    const base = weightKg <= 1
      ? Number(rate.first_kg_crc)
      : Number(rate.first_kg_crc) + Math.ceil(weightKg - 1) * Number(rate.additional_kg_crc);

    const margen = base * (Number(config.margin_percent) / 100);
    const total  = Math.round(base + margen);

    res.json({ base, margen: Math.round(margen), total, zone, weight_g_total: totalWeightG });
  } catch (err) {
    console.error('[GET /api/shipping/calculate]', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
