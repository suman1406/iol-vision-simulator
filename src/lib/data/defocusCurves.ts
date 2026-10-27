export interface DefocusPoint {
  d: number;      // Defocus in Diopters (negative = near)
  va: number;     // Visual Acuity in logMAR
  lo?: number;    // Lower bound (95% CI or mean - SD)
  hi?: number;    // Upper bound (95% CI or mean + SD)
  sd?: number;    // Standard Deviation if reported
}

export interface DefocusDataSet {
  lensId: string;
  lensName: string;
  n?: number;
  source: string;
  citation: string;
  evidenceId: string;
  units: { defocus: string; va: string };
  points: DefocusPoint[];
}

export const CLINICAL_DEFOCUS_DATA: Record<string, DefocusDataSet> = {
  natural_eye: {
    lensId: 'natural_eye',
    lensName: 'Natural Accommodating Eye (20/20 Reference Baseline)',
    source: 'Gullstrand Physiological Accommodating Eye Model & Campbell & Robson 1968',
    citation: 'Diffraction-Limited Physiological Accommodation Reference',
    evidenceId: 'campbell1968',
    units: { defocus: 'Diopters (spectacle plane)', va: 'logMAR (idealized 20/20 baseline)' },
    points: [
      { d: 1.0, va: 0.00, lo: -0.02, hi: 0.02, sd: 0.02 },
      { d: 0.5, va: -0.05, lo: -0.07, hi: -0.03, sd: 0.02 },
      { d: 0.0, va: -0.08, lo: -0.10, hi: -0.06, sd: 0.02 },
      { d: -0.5, va: -0.07, lo: -0.09, hi: -0.05, sd: 0.02 },
      { d: -1.0, va: -0.06, lo: -0.08, hi: -0.04, sd: 0.02 },
      { d: -1.5, va: -0.05, lo: -0.07, hi: -0.03, sd: 0.02 },
      { d: -2.0, va: -0.05, lo: -0.07, hi: -0.03, sd: 0.02 },
      { d: -2.5, va: -0.04, lo: -0.06, hi: -0.02, sd: 0.02 },
      { d: -3.0, va: -0.02, lo: -0.04, hi: 0.00, sd: 0.02 },
      { d: -3.5, va: 0.05, lo: 0.02, hi: 0.08, sd: 0.03 }
    ]
  },
  monofocal: {
    lensId: 'monofocal',
    lensName: 'Alcon AcrySof IQ Monofocal (SN60WF Control)',
    n: 111,
    source: 'FDA PMA P930014/S126 SSED Figures 9-10 & NCT03274986 (Month 6 Cohort)',
    citation: 'FDA Summary of Safety and Effectiveness Data, PMA P930014/S126 (2020)',
    evidenceId: 'fdaSsedMonofocal',
    units: { defocus: 'Diopters (spectacle plane)', va: 'logMAR (binocular BCDVA)' },
    points: [
      { d: 1.5, va: 0.355, lo: 0.329, hi: 0.380, sd: 0.137 },
      { d: 1.0, va: 0.167, lo: 0.144, hi: 0.189, sd: 0.118 },
      { d: 0.5, va: 0.017, lo: -0.003, hi: 0.036, sd: 0.104 },
      { d: 0.25, va: -0.046, lo: -0.062, hi: -0.030, sd: 0.083 },
      { d: 0.0, va: -0.078, lo: -0.095, hi: -0.061, sd: 0.088 },
      { d: -0.25, va: -0.052, lo: -0.070, hi: -0.034, sd: 0.095 },
      { d: -0.5, va: -0.006, lo: -0.025, hi: 0.013, sd: 0.100 },
      { d: -1.0, va: 0.116, lo: 0.096, hi: 0.137, sd: 0.111 },
      { d: -1.5, va: 0.251, lo: 0.226, hi: 0.276, sd: 0.133 },
      { d: -2.0, va: 0.380, lo: 0.350, hi: 0.410, sd: 0.160 },
      { d: -2.5, va: 0.540, lo: 0.505, hi: 0.574, sd: 0.184 }
    ]
  },
  eyhance: {
    lensId: 'eyhance',
    lensName: 'Johnson & Johnson TECNIS Eyhance (ICB00)',
    n: 107,
    source: 'Auffarth et al. JCRS 2021;47:184-191 & Mencucci et al. JCRS 2020;46:678-687',
    citation: 'Auffarth et al. Multicenter clinical evaluation of enhanced monofocal IOL (JCRS 2021)',
    evidenceId: 'auffarth2021',
    units: { defocus: 'Diopters (spectacle plane)', va: 'logMAR (binocular BCDVA)' },
    points: [
      { d: 1.0, va: 0.28, lo: 0.20, hi: 0.36, sd: 0.10 },
      { d: 0.5, va: 0.08, lo: 0.01, hi: 0.15, sd: 0.09 },
      { d: 0.0, va: -0.04, lo: -0.11, hi: 0.03, sd: 0.08 },
      { d: -0.5, va: 0.00, lo: -0.07, hi: 0.07, sd: 0.08 },
      { d: -1.0, va: 0.08, lo: 0.00, hi: 0.16, sd: 0.09 },
      { d: -1.5, va: 0.15, lo: 0.05, hi: 0.25, sd: 0.11 },
      { d: -2.0, va: 0.30, lo: 0.18, hi: 0.42, sd: 0.13 },
      { d: -2.5, va: 0.48, lo: 0.34, hi: 0.62, sd: 0.15 },
      { d: -3.0, va: 0.62, lo: 0.46, hi: 0.78, sd: 0.17 }
    ]
  },
  edof: {
    lensId: 'edof',
    lensName: 'Johnson & Johnson TECNIS Symfony (ZXR00)',
    n: 148,
    source: 'Cochener et al. (CONCERTO Study Group) JCRS 2016;42:1268-1276 & FDA PMA P980040/S065',
    citation: 'Cochener et al. International Multicenter Study of Extended Range of Vision IOL (JCRS 2016)',
    evidenceId: 'cochener2016',
    units: { defocus: 'Diopters (spectacle plane)', va: 'logMAR (binocular BCDVA)' },
    points: [
      { d: 1.0, va: 0.28, lo: 0.20, hi: 0.36, sd: 0.09 },
      { d: 0.5, va: 0.08, lo: 0.01, hi: 0.15, sd: 0.08 },
      { d: 0.0, va: -0.01, lo: -0.08, hi: 0.06, sd: 0.08 },
      { d: -0.5, va: 0.02, lo: -0.05, hi: 0.09, sd: 0.08 },
      { d: -1.0, va: 0.05, lo: -0.02, hi: 0.12, sd: 0.09 },
      { d: -1.5, va: 0.09, lo: 0.00, hi: 0.18, sd: 0.10 },
      { d: -2.0, va: 0.17, lo: 0.06, hi: 0.28, sd: 0.12 },
      { d: -2.5, va: 0.32, lo: 0.19, hi: 0.45, sd: 0.14 },
      { d: -3.0, va: 0.48, lo: 0.33, hi: 0.63, sd: 0.16 }
    ]
  },
  puresee: {
    lensId: 'puresee',
    lensName: 'Johnson & Johnson TECNIS PureSee (DEN00V)',
    n: 58,
    source: 'Auffarth GU et al., Clin Ophthalmol 2026;20:1125-1136 (Fig 3 & Table 2)',
    citation: 'Auffarth et al. Clinical Performance of Purely Refractive EDOF IOL (Clin Ophthalmol 2026)',
    evidenceId: 'auffarth2026',
    units: { defocus: 'Diopters (spectacle plane)', va: 'logMAR (binocular DCVA)' },
    points: [
      { d: 2.0, va: 0.41, lo: 0.32, hi: 0.50, sd: 0.10 },
      { d: 1.5, va: 0.24, lo: 0.16, hi: 0.32, sd: 0.09 },
      { d: 1.0, va: 0.10, lo: 0.03, hi: 0.17, sd: 0.08 },
      { d: 0.5, va: -0.01, lo: -0.08, hi: 0.06, sd: 0.08 },
      { d: 0.0, va: -0.08, lo: -0.14, hi: -0.02, sd: 0.07 },
      { d: -0.5, va: -0.03, lo: -0.10, hi: 0.04, sd: 0.08 },
      { d: -1.0, va: 0.03, lo: -0.04, hi: 0.10, sd: 0.08 },
      { d: -1.5, va: 0.09, lo: 0.01, hi: 0.17, sd: 0.08 },
      { d: -2.0, va: 0.15, lo: 0.06, hi: 0.24, sd: 0.09 },
      { d: -2.5, va: 0.27, lo: 0.17, hi: 0.37, sd: 0.10 },
      { d: -3.0, va: 0.39, lo: 0.28, hi: 0.50, sd: 0.11 },
      { d: -3.5, va: 0.47, lo: 0.35, hi: 0.59, sd: 0.12 },
      { d: -4.0, va: 0.55, lo: 0.42, hi: 0.68, sd: 0.13 }
    ]
  },
  vivity: {
    lensId: 'vivity',
    lensName: 'Alcon AcrySof IQ Vivity (DFT015)',
    n: 106,
    source: 'FDA PMA P930014/S126 SSED Figures 9-10 & NCT03274986 (Month 6 Cohort)',
    citation: 'FDA Summary of Safety and Effectiveness Data, PMA P930014/S126 (2020)',
    evidenceId: 'fdaSsedVivity',
    units: { defocus: 'Diopters (spectacle plane)', va: 'logMAR (binocular BCDVA)' },
    points: [
      { d: 1.5, va: 0.404, lo: 0.375, hi: 0.433, sd: 0.151 },
      { d: 1.0, va: 0.220, lo: 0.197, hi: 0.243, sd: 0.121 },
      { d: 0.5, va: 0.062, lo: 0.045, hi: 0.080, sd: 0.091 },
      { d: 0.25, va: 0.001, lo: -0.016, hi: 0.018, sd: 0.088 },
      { d: 0.0, va: -0.025, lo: -0.042, hi: -0.008, sd: 0.088 },
      { d: -0.25, va: -0.007, lo: -0.023, hi: 0.009, sd: 0.085 },
      { d: -0.5, va: 0.016, lo: 0.000, hi: 0.033, sd: 0.085 },
      { d: -1.0, va: 0.066, lo: 0.049, hi: 0.083, sd: 0.087 },
      { d: -1.5, va: 0.101, lo: 0.078, hi: 0.123, sd: 0.116 },
      { d: -2.0, va: 0.195, lo: 0.165, hi: 0.225, sd: 0.154 },
      { d: -2.5, va: 0.366, lo: 0.334, hi: 0.398, sd: 0.171 }
    ]
  },
  multifocal: {
    lensId: 'multifocal',
    lensName: 'Simulated Diffractive Multifocal (+2.50 D Bifocal Reference)',
    n: 80,
    source: 'Cochener et al. JCRS 2014 & FDA PMA P980040/S049 SSED Control Data',
    citation: 'Bifocal Simultaneous Vision Clinical Defocus Cohort',
    evidenceId: 'fdaSsedMultifocal',
    units: { defocus: 'Diopters (spectacle plane)', va: 'logMAR (binocular BCDVA)' },
    points: [
      { d: 1.0, va: 0.30, lo: 0.21, hi: 0.39, sd: 0.10 },
      { d: 0.5, va: 0.10, lo: 0.02, hi: 0.18, sd: 0.09 },
      { d: 0.0, va: -0.06, lo: -0.13, hi: 0.01, sd: 0.08 },
      { d: -0.5, va: 0.05, lo: -0.03, hi: 0.13, sd: 0.09 },
      { d: -1.0, va: 0.18, lo: 0.08, hi: 0.28, sd: 0.11 },
      { d: -1.5, va: 0.26, lo: 0.15, hi: 0.37, sd: 0.12 },
      { d: -2.0, va: 0.14, lo: 0.04, hi: 0.24, sd: 0.11 },
      { d: -2.5, va: 0.02, lo: -0.06, hi: 0.10, sd: 0.09 },
      { d: -3.0, va: 0.22, lo: 0.10, hi: 0.34, sd: 0.13 }
    ]
  },
  trifocal: {
    lensId: 'trifocal',
    lensName: 'Alcon Clareon / AcrySof IQ PanOptix (TFNT00)',
    n: 127,
    source: 'Modi et al. JCRS 2021;47:175-183 (US Pivotal Trial) & FDA PMA P040020/S087 SSED',
    citation: 'Modi et al. Visual and patient-reported outcomes of diffractive trifocal IOL (JCRS 2021)',
    evidenceId: 'modi2021',
    units: { defocus: 'Diopters (spectacle plane)', va: 'logMAR (binocular BCDVA)' },
    points: [
      { d: 1.0, va: 0.22, lo: 0.14, hi: 0.30, sd: 0.09 },
      { d: 0.5, va: 0.05, lo: -0.02, hi: 0.12, sd: 0.08 },
      { d: 0.0, va: -0.04, lo: -0.11, hi: 0.03, sd: 0.08 },
      { d: -0.5, va: 0.02, lo: -0.05, hi: 0.09, sd: 0.08 },
      { d: -1.0, va: 0.06, lo: -0.01, hi: 0.13, sd: 0.08 },
      { d: -1.5, va: 0.04, lo: -0.03, hi: 0.11, sd: 0.08 },
      { d: -2.0, va: 0.08, lo: 0.00, hi: 0.16, sd: 0.09 },
      { d: -2.5, va: 0.03, lo: -0.04, hi: 0.10, sd: 0.08 },
      { d: -3.0, va: 0.18, lo: 0.09, hi: 0.27, sd: 0.10 },
      { d: -3.5, va: 0.35, lo: 0.24, hi: 0.46, sd: 0.12 }
    ]
  },
  imported_trifocal: {
    lensId: 'imported_trifocal',
    lensName: 'Zeiss AT LISA tri 839MP (Apodized Trifocal)',
    n: 95,
    source: 'Mojzis et al. JCRS 2014;40:60-69 & Kohnen et al. Am J Ophthalmol 2016;161:71-79',
    citation: 'Mojzis et al. Visual outcomes with a new trifocal diffractive IOL (JCRS 2014)',
    evidenceId: 'mojzis2014',
    units: { defocus: 'Diopters (spectacle plane)', va: 'logMAR (binocular BCDVA)' },
    points: [
      { d: 1.0, va: 0.25, lo: 0.18, hi: 0.32, sd: 0.08 },
      { d: 0.5, va: 0.07, lo: 0.00, hi: 0.14, sd: 0.08 },
      { d: 0.0, va: -0.05, lo: -0.11, hi: 0.01, sd: 0.07 },
      { d: -0.5, va: 0.03, lo: -0.04, hi: 0.10, sd: 0.08 },
      { d: -1.0, va: 0.08, lo: 0.01, hi: 0.15, sd: 0.08 },
      { d: -1.5, va: 0.05, lo: -0.02, hi: 0.12, sd: 0.08 },
      { d: -2.0, va: 0.09, lo: 0.01, hi: 0.17, sd: 0.09 },
      { d: -2.5, va: 0.04, lo: -0.03, hi: 0.11, sd: 0.08 },
      { d: -3.0, va: 0.19, lo: 0.10, hi: 0.28, sd: 0.10 }
    ]
  }
};

// Mathematically derive exact logMAR from clinical defocus curve at any distance
export function interpolateLogMar(lensId: string, defocusD: number): number {
  const dataset = CLINICAL_DEFOCUS_DATA[lensId] || CLINICAL_DEFOCUS_DATA['monofocal'];
  if (!dataset || !dataset.points || dataset.points.length === 0) return 0.0;
  const sorted = [...dataset.points].sort((a, b) => a.d - b.d);
  if (defocusD <= sorted[0].d) return sorted[0].va;
  if (defocusD >= sorted[sorted.length - 1].d) return sorted[sorted.length - 1].va;
  for (let i = 1; i < sorted.length; i++) {
    if (defocusD <= sorted[i].d) {
      const p0 = sorted[i - 1], p1 = sorted[i];
      const t = (defocusD - p0.d) / (p1.d - p0.d);
      return p0.va + t * (p1.va - p0.va);
    }
  }
  return 0.0;
}

// Derive 1.0 to 5.0 lifestyle star rating from clinical logMAR
export function logMarToScore(va: number): number {
  const score = 5.0 - 7.0 * Math.max(0, va);
  return Math.round(Math.max(1.0, Math.min(5.0, score)) * 10) / 10;
}

// Convert logMAR directly to clinical Snellen visual acuity string (e.g. 20/20, 20/25, 20/40)
export function logMarToSnellen(va: number): string {
  const mar = Math.pow(10, va);
  const denom = Math.round(20 * mar);
  return `20/${denom}`;
}
