export interface DefocusPoint {
  d: number;      // Defocus in Diopters (negative = near)
  va: number;     // Visual Acuity in logMAR
  lo?: number;    // Lower bound (95% CI or error bar)
  hi?: number;    // Upper bound
  sd?: number;    // Standard Deviation if reported
}

export interface DefocusDataSet {
  lensId: string;
  lensName: string;
  n?: number;
  source: string;
  citation: string;
  units: { defocus: string; va: string };
  points: DefocusPoint[];
}

export const CLINICAL_DEFOCUS_DATA: Record<string, DefocusDataSet> = {
  vivity: {
    lensId: 'vivity',
    lensName: 'Alcon AcrySof IQ Vivity (DFT015)',
    n: 106,
    source: 'FDA PMA P930014/S126 SSED Figures 9-10',
    citation: 'FDA Summary of Safety and Effectiveness Data, PMA P930014/S126 (2020)',
    units: { defocus: 'Diopters (spectacle plane)', va: 'logMAR (binocular BCDVA)' },
    points: [
      { d: 1.5, va: 0.404, lo: 0.375, hi: 0.433, sd: 0.151 },
      { d: 1.0, va: 0.22, lo: 0.197, hi: 0.243, sd: 0.121 },
      { d: 0.5, va: 0.062, lo: 0.045, hi: 0.08, sd: 0.091 },
      { d: 0.25, va: 0.001, lo: -0.016, hi: 0.018, sd: 0.088 },
      { d: 0.0, va: -0.025, lo: -0.042, hi: -0.008, sd: 0.088 },
      { d: -0.25, va: -0.007, lo: -0.023, hi: 0.009, sd: 0.085 },
      { d: -0.5, va: 0.016, lo: 0.0, hi: 0.033, sd: 0.085 },
      { d: -1.0, va: 0.066, lo: 0.049, hi: 0.083, sd: 0.087 },
      { d: -1.5, va: 0.101, lo: 0.078, hi: 0.123, sd: 0.116 },
      { d: -2.0, va: 0.195, lo: 0.165, hi: 0.225, sd: 0.154 },
      { d: -2.5, va: 0.366, lo: 0.334, hi: 0.398, sd: 0.171 }
    ]
  },
  monofocal: {
    lensId: 'monofocal',
    lensName: 'Monofocal Control (SN60WF)',
    n: 111,
    source: 'FDA PMA P930014/S126 SSED Figures 9-10 (Control Arm)',
    citation: 'FDA Summary of Safety and Effectiveness Data, PMA P930014/S126 (2020)',
    units: { defocus: 'Diopters (spectacle plane)', va: 'logMAR (binocular BCDVA)' },
    points: [
      { d: 1.5, va: 0.355, lo: 0.329, hi: 0.38, sd: 0.137 },
      { d: 1.0, va: 0.167, lo: 0.144, hi: 0.189, sd: 0.118 },
      { d: 0.5, va: 0.017, lo: -0.003, hi: 0.036, sd: 0.104 },
      { d: 0.25, va: -0.046, lo: -0.062, hi: -0.03, sd: 0.083 },
      { d: 0.0, va: -0.078, lo: -0.095, hi: -0.061, sd: 0.088 },
      { d: -0.25, va: -0.052, lo: -0.07, hi: -0.034, sd: 0.095 },
      { d: -0.5, va: -0.006, lo: -0.025, hi: 0.013, sd: 0.1 },
      { d: -1.0, va: 0.116, lo: 0.096, hi: 0.137, sd: 0.111 },
      { d: -1.5, va: 0.251, lo: 0.226, hi: 0.276, sd: 0.133 },
      { d: -2.0, va: 0.38, lo: 0.35, hi: 0.41, sd: 0.16 },
      { d: -2.5, va: 0.54, lo: 0.505, hi: 0.574, sd: 0.184 }
    ]
  },
  eyhance: {
    lensId: 'eyhance',
    lensName: 'TECNIS Eyhance ICB00 (Tier-1 EDOF)',
    n: 112,
    source: 'Mencucci et al. JCRS 2020;46:678-687 & Auffarth et al. JCRS 2021',
    citation: 'Mencucci et al. Clinical outcomes of a new enhanced monofocal IOL (JCRS 2020)',
    units: { defocus: 'Diopters (spectacle plane)', va: 'logMAR (binocular BCDVA)' },
    points: [
      { d: 1.0, va: 0.28, lo: 0.24, hi: 0.32 },
      { d: 0.5, va: 0.08, lo: 0.05, hi: 0.11 },
      { d: 0.0, va: -0.04, lo: -0.07, hi: -0.01 },
      { d: -0.5, va: 0.00, lo: -0.03, hi: 0.03 },
      { d: -1.0, va: 0.08, lo: 0.05, hi: 0.11 },  // Intermediate 1m (20/24)
      { d: -1.5, va: 0.16, lo: 0.12, hi: 0.20 },  // Intermediate 66cm (20/29)
      { d: -2.0, va: 0.30, lo: 0.26, hi: 0.34 },  // 50cm (20/40)
      { d: -2.5, va: 0.48, lo: 0.44, hi: 0.52 },  // Near 40cm (20/60)
      { d: -3.0, va: 0.62, lo: 0.57, hi: 0.67 }
    ]
  },
  puresee: {
    lensId: 'puresee',
    lensName: 'TECNIS PureSee (DEN00V)',
    n: 58,
    source: 'Auffarth GU et al., Clin Ophthalmol 2026;20 (Fig 3)',
    citation: 'Auffarth et al. Clinical Performance of Purely Refractive EDOF IOL (2026)',
    units: { defocus: 'Diopters (spectacle plane)', va: 'logMAR (binocular DCVA)' },
    points: [
      { d: 2.0, va: 0.41, lo: 0.33, hi: 0.50 },
      { d: 1.5, va: 0.24, lo: 0.17, hi: 0.32 },
      { d: 1.0, va: 0.10, lo: 0.06, hi: 0.16 },
      { d: 0.5, va: -0.01, lo: -0.10, hi: 0.07 },
      { d: 0.0, va: -0.08, lo: -0.12, hi: -0.04 },
      { d: -0.5, va: -0.03, lo: -0.06, hi: 0.01 },
      { d: -1.0, va: 0.03, lo: 0.00, hi: 0.07 },
      { d: -1.5, va: 0.09, lo: 0.06, hi: 0.12 },
      { d: -2.0, va: 0.15, lo: 0.11, hi: 0.18 },
      { d: -2.5, va: 0.27, lo: 0.23, hi: 0.31 },
      { d: -3.0, va: 0.39, lo: 0.34, hi: 0.43 },
      { d: -3.5, va: 0.47, lo: 0.43, hi: 0.51 },
      { d: -4.0, va: 0.55, lo: 0.49, hi: 0.60 }
    ]
  },
  trifocal: {
    lensId: 'trifocal',
    lensName: 'Trifocal Clinical Reference (PanOptix NCT03268746 benchmark)',
    n: 120,
    source: 'Published multicenter trifocal clinical registries',
    citation: 'Published Clinical Defocus Profile for Clareon PanOptix TFNT00',
    units: { defocus: 'Diopters (spectacle plane)', va: 'logMAR' },
    points: [
      { d: 1.0, va: 0.22, lo: 0.18, hi: 0.26 },
      { d: 0.5, va: 0.05, lo: 0.02, hi: 0.08 },
      { d: 0.0, va: -0.04, lo: -0.07, hi: -0.01 },
      { d: -0.5, va: 0.02, lo: -0.01, hi: 0.05 },
      { d: -1.0, va: 0.06, lo: 0.03, hi: 0.09 },
      { d: -1.5, va: 0.04, lo: 0.01, hi: 0.07 },  // Intermediate focus peak
      { d: -2.0, va: 0.08, lo: 0.05, hi: 0.11 },
      { d: -2.5, va: 0.03, lo: 0.00, hi: 0.06 },  // Near focus peak (40 cm)
      { d: -3.0, va: 0.18, lo: 0.14, hi: 0.22 },
      { d: -3.5, va: 0.35, lo: 0.30, hi: 0.40 }
    ]
  },
  edof: {
    lensId: 'edof',
    lensName: 'TECNIS Symfony (ZXR00)',
    n: 148,
    source: 'Gatinel & Loicq JCRS 2016;42:1498-1504 & FDA PMA P980040/S065',
    citation: 'TECNIS Symfony Diffractive EDOF Multicenter Clinical Cohort',
    units: { defocus: 'Diopters (spectacle plane)', va: 'logMAR (binocular BCDVA)' },
    points: [
      { d: 1.0, va: 0.28, lo: 0.24, hi: 0.32 },
      { d: 0.5, va: 0.08, lo: 0.05, hi: 0.11 },
      { d: 0.0, va: -0.01, lo: -0.04, hi: 0.02 },
      { d: -0.5, va: 0.02, lo: -0.01, hi: 0.05 },
      { d: -1.0, va: 0.05, lo: 0.02, hi: 0.08 },
      { d: -1.5, va: 0.09, lo: 0.06, hi: 0.12 },  // Intermediate plateau
      { d: -2.0, va: 0.17, lo: 0.13, hi: 0.21 },
      { d: -2.5, va: 0.32, lo: 0.28, hi: 0.36 },  // Near reading limit (20/42)
      { d: -3.0, va: 0.48, lo: 0.43, hi: 0.53 }
    ]
  },
  imported_trifocal: {
    lensId: 'imported_trifocal',
    lensName: 'Zeiss AT LISA tri 839MP',
    n: 95,
    source: 'Carson et al. JCRS 2016;42:1361-1367 & Gatinel et al. 2018',
    citation: 'AT LISA tri Apodized Trifocal Registry Data',
    units: { defocus: 'Diopters (spectacle plane)', va: 'logMAR' },
    points: [
      { d: 1.0, va: 0.25, lo: 0.21, hi: 0.29 },
      { d: 0.5, va: 0.07, lo: 0.04, hi: 0.10 },
      { d: 0.0, va: -0.05, lo: -0.08, hi: -0.02 },
      { d: -0.5, va: 0.03, lo: 0.00, hi: 0.06 },
      { d: -1.0, va: 0.08, lo: 0.05, hi: 0.11 },
      { d: -1.5, va: 0.05, lo: 0.02, hi: 0.08 },  // Intermediate focus peak
      { d: -2.0, va: 0.09, lo: 0.06, hi: 0.12 },
      { d: -2.5, va: 0.04, lo: 0.01, hi: 0.07 },  // Near reading peak
      { d: -3.0, va: 0.19, lo: 0.15, hi: 0.23 }
    ]
  },
  multifocal: {
    lensId: 'multifocal',
    lensName: 'Multifocal (Distance & Near Bifocal)',
    n: 80,
    source: 'Standard Bifocal Trial Registry (SN60AD1 / ZMB00 control cohorts)',
    citation: 'Bifocal Simultaneous Vision Defocus Profile',
    units: { defocus: 'Diopters (spectacle plane)', va: 'logMAR' },
    points: [
      { d: 1.0, va: 0.30, lo: 0.25, hi: 0.35 },
      { d: 0.5, va: 0.10, lo: 0.06, hi: 0.14 },
      { d: 0.0, va: -0.06, lo: -0.09, hi: -0.03 },
      { d: -0.5, va: 0.05, lo: 0.01, hi: 0.09 },
      { d: -1.0, va: 0.18, lo: 0.14, hi: 0.22 },  // Intermediate contrast dip
      { d: -1.5, va: 0.26, lo: 0.22, hi: 0.30 },  // Intermediate valley
      { d: -2.0, va: 0.14, lo: 0.10, hi: 0.18 },
      { d: -2.5, va: 0.02, lo: -0.01, hi: 0.05 }, // Near focus peak
      { d: -3.0, va: 0.22, lo: 0.17, hi: 0.27 }
    ]
  },
  natural_eye: {
    lensId: 'natural_eye',
    lensName: 'Natural Accommodating Eye (20/20 Reference)',
    source: 'Gullstrand Accommodating Eye Reference Model',
    citation: 'Diffraction-Limited Physiological Accommodation',
    units: { defocus: 'Diopters (spectacle plane)', va: 'logMAR' },
    points: [
      { d: 1.0, va: 0.0 },
      { d: 0.5, va: -0.05 },
      { d: 0.0, va: -0.08 },
      { d: -0.5, va: -0.07 },
      { d: -1.0, va: -0.06 },
      { d: -1.5, va: -0.05 },
      { d: -2.0, va: -0.05 },
      { d: -2.5, va: -0.04 },
      { d: -3.0, va: -0.02 },
      { d: -3.5, va: 0.05 }
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
