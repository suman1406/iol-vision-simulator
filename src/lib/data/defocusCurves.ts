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
  }
};
