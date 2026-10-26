import { OpticalModel } from '../optics/fourier';
import { VIVITY_POWER_PROFILE } from './vivityPowerProfile';

// PureSee Zernike coefficients from Schmid & Borkenstein 2024, Table 1
export const PURESEE_ZERNIKE = [
  { n: 2, m: 2, c: 0.008377 }, { n: 2, m: -2, c: 0.013709 }, { n: 3, m: 1, c: 0.044488 }, { n: 3, m: -1, c: -0.03631 },
  { n: 4, m: 0, c: -0.657752 }, { n: 3, m: 3, c: -0.013926 }, { n: 3, m: -3, c: -0.003916 }, { n: 4, m: 2, c: -0.005125 },
  { n: 4, m: -2, c: 0.003177 }, { n: 5, m: 1, c: -0.025228 }, { n: 5, m: -1, c: 0.003796 }, { n: 6, m: 0, c: 0.202057 },
  { n: 4, m: 4, c: 0.002069 }, { n: 4, m: -4, c: -0.001785 }, { n: 5, m: 3, c: -0.001116 }, { n: 5, m: -3, c: 0.002878 },
  { n: 6, m: 2, c: 0.0051 }, { n: 6, m: -2, c: -0.000705 }, { n: 7, m: 1, c: 0.016878 }, { n: 7, m: -1, c: 0.001205 },
  { n: 8, m: 0, c: -0.076947 }, { n: 5, m: 5, c: -0.004074 }, { n: 5, m: -5, c: -0.003719 }, { n: 6, m: 4, c: 0.011709 },
  { n: 6, m: -4, c: 0.000626 }, { n: 7, m: 3, c: -0.003427 }, { n: 7, m: -3, c: 0.002719 }, { n: 8, m: 2, c: -0.00431 },
  { n: 8, m: -2, c: 0.001618 }, { n: 9, m: 1, c: 0.00022 }, { n: 9, m: -1, c: 0.016646 }, { n: 10, m: 0, c: -0.083359 }
];

const sinc2 = (x: number) => (x === 0 ? 1 : (Math.sin(Math.PI * x) / (Math.PI * x)) ** 2);
const BIFOCAL_ADD = 2.5; // Spectacle-plane add in Diopters
const bifocalFoci = [-1, 0, 1, 2].map((m) => ({
  addD: m * BIFOCAL_ADD,
  weight: sinc2(0.5 - m),
}));

function opdFromPower(rMm: number[], powerD: number[], refD: number): number[] {
  const w = [0];
  for (let i = 1; i < rMm.length; i++) {
    const a = (powerD[i - 1] - refD) * rMm[i - 1];
    const b = (powerD[i] - refD) * rMm[i];
    w.push(w[i - 1] - ((a + b) / 2) * (rMm[i] - rMm[i - 1]));
  }
  return w;
}

const VP = VIVITY_POWER_PROFILE;

export const OPTICAL_MODELS: Record<string, OpticalModel> = {
  natural_eye: {
    kind: 'natural-reference',
    label: '0. Natural Accommodating Eye (20/20 Reference Baseline)',
    foci: [{ addD: 0, weight: 1 }],
    assumptions: [
      'Healthy crystalline lens with normal physiological accommodation',
      'Accommodates continuously to eliminate defocus (0.0 D residual defocus at far, intermediate, and near)',
      'Provides the gold-standard 20/20 visual acuity reference for comparative patient evaluation',
    ],
    version: {
      modelVersion: '1.0.0',
      date: '2026-10-26',
      derivedFrom: 'Diffraction-limited physiological accommodating eye model',
    },
  },
  aphakic: {
    kind: 'generic-physical-reference',
    label: 'Aphakic eye — natural lens removed, no IOL implanted',
    foci: [{ addD: -11, weight: 1 }],
    assumptions: [
      'Aphakic refraction of +11.0 D at the spectacle plane, typical for an eye of average axial length (23.5 mm)',
      'Baseline demonstrating loss of ocular focusing power prior to IOL implantation',
      'Aberration-free ocular media assumption',
    ],
    version: {
      modelVersion: '1.0.0',
      date: '2026-10-25',
      derivedFrom: 'Physical optics reference of +11 D spectacle defocus',
    },
  },
  monofocal: {
    kind: 'clinical-benchmark',
    label: '1. Aspheric Monofocal IOL (Alcon Clareon / AcrySof SN60WF)',
    foci: [{ addD: 0, weight: 1 }],
    assumptions: [
      'Diffraction-limited optical reference focused at optical infinity (0.0 D add)',
      'Defocus generated strictly by object distance vergence (D = 1/distance)',
      'Matches FDA PMA P930014 control cohort and Carson 2016 JCRS bench reference',
    ],
    version: {
      modelVersion: '1.2.0',
      date: '2026-10-26',
      derivedFrom: 'Alcon SN60WF FDA SSED P930014 & Carson et al. JCRS 2016',
    },
  },
  edof: {
    kind: 'peer-reviewed-bench',
    label: '2. EDOF (Extended Depth of Focus — TECNIS Symfony ZXR00)',
    foci: [
      { addD: 0, weight: 0.58 },
      { addD: 1.05, weight: 0.24 }, // Intermediate elongation focus
      { addD: 1.75, weight: 0.18 }, // Functional near extension
    ],
    assumptions: [
      'Diffractive echelette profile designed to elongate the focal zone across +1.75 D',
      'Optical bench MTF through-focus distribution from Gatinel & Loicq 2016 JCRS (50 lp/mm, 3.0 mm pupil)',
      'Sustained intermediate focal plateau without sharp contrast drop',
    ],
    version: {
      modelVersion: '1.0.0',
      date: '2026-10-26',
      derivedFrom: 'Gatinel & Loicq, J Cataract Refract Surg 2016;42:1498-1504 (Q1)',
    },
  },
  puresee: {
    kind: 'lens-specific-measured',
    label: '3a. Premium EDOF — TECNIS PureSee (Schmid & Borkenstein 2024)',
    radialOpd: {
      lambdaUm: 0.546,
      sign: -1,
      rMm: Array.from({ length: 43 }, (_, i) => +(i * 0.05).toFixed(2)),
      waves: [
        0, -0.002, -0.007, -0.012, -0.016, -0.021, -0.026, -0.026, -0.026, -0.021,
        -0.012, 0.009, 0.044, 0.111, 0.215, 0.343, 0.537, 0.773, 1.023, 1.232,
        1.432, 1.561, 1.627, 1.661, 1.671, 1.671, 1.675, 1.678, 1.68, 1.678,
        1.671, 1.658, 1.639, 1.607, 1.567, 1.519, 1.453, 1.371, 1.277, 1.182,
        1.061, 0.928, 0.814,
      ],
    },
    pupilToIolScale: Math.sqrt(2.2 / 1.7),
    focusPerPupil: true,
    foci: [{ addD: 0, weight: 1 }],
    assumptions: [
      'Measured radial Optical Path Difference (OPD) from Schmid & Borkenstein 2024 (OptiSpheric IOL PRO 2, 546 nm)',
      'Wavefront preserved with high spatial fidelity across the central zone (reproduces bench through-focus MTF peak 0.38 at 3 mm and secondary lobe at +2.1 D)',
      'Purely refractive continuous wavefront shaping with zero diffractive halo rings',
    ],
    version: {
      modelVersion: '1.2.0',
      date: '2026-10-25',
      derivedFrom: 'Schmid & Borkenstein Clin Ophthalmol 2024;18:1921-1932 (Q1)',
    },
  },
  vivity: {
    kind: 'lens-specific-measured',
    label: '3b. Premium EDOF — Alcon Vivity (Garzón et al. 2024 open dataset)',
    radialOpd: {
      lambdaUm: 1,
      sign: 1,
      rMm: VP.rMm,
      waves: opdFromPower(VP.rMm, VP.powerD, 20.0),
    },
    pupilToIolScale: Math.sqrt(2.2 / 1.7),
    focusPerPupil: true,
    foci: [{ addD: 0, weight: 1 }],
    assumptions: [
      'Power profile of +20 D lens measured on NIMO TR1504 phase-shifting Schlieren instrument at 546 nm (mean of 10 measurements, SD ≤ 0.03 D)',
      'Wavefront computed by radial integration of measured optical power profile',
      'Non-diffractive X-WAVE™ technology providing monofocal-like low dysphotopsia',
      'Validated against independent optical bench measurements of Schmid & Borkenstein 2023',
    ],
    version: {
      modelVersion: '1.2.0',
      date: '2026-10-25',
      derivedFrom: 'Zenodo open dataset 10.5281/zenodo.18084296 & Graefe’s Arch 2024 (Q1)',
    },
  },
  multifocal: {
    kind: 'diffraction-theory',
    label: '4. Multifocal — Distance & Near (Half-Wave Kinoform, +2.50 D Add)',
    foci: bifocalFoci,
    assumptions: [
      `Near add ${BIFOCAL_ADD} D at spectacle plane (≈ 40 cm)`,
      'Light split from scalar diffraction theory for an ideal half-wave kinoform: 40.5% distance, 40.5% near, ~19% other orders',
      'Simulates classic simultaneous vision with twin distance and near in-focus copies and reciprocal out-of-focus halo veil',
    ],
    version: {
      modelVersion: '1.0.0',
      date: '2026-10-25',
      derivedFrom: 'Scalar diffraction theory for kinoform phase steps',
    },
  },
  trifocal: {
    kind: 'peer-reviewed-bench',
    label: '5. Trifocal Lenses — Distance, Intermediate & Near (PanOptix TFNT00)',
    foci: [
      { addD: 0, weight: 0.44 },
      { addD: (2.17 * 1.7) / 2.2, weight: 0.22 }, // +1.68 D intermediate (60 cm)
      { addD: (3.25 * 1.7) / 2.2, weight: 0.22 }, // +2.51 D near (40 cm)
    ],
    assumptions: [
      'Intermediate peak tailored specifically for 60 cm intermediate distance (Carson et al. 2016 JCRS, 50 lp/mm bench data)',
      'Quadrifocal optical design channeling 88% transmitted light energy (50% far, 25% intermediate, 25% near)',
      'Dedicated near focal peak at 40 cm providing sharp fine text reading acuity',
    ],
    version: {
      modelVersion: '2.0.0',
      date: '2026-10-26',
      derivedFrom: 'Carson et al., J Cataract Refract Surg 2016;42(9):1361-1367 (Q1)',
    },
  },
  imported_trifocal: {
    kind: 'advanced-apodized-bench',
    label: '6. Imported Trifocal — Better Vision & Less of Ring Perception (Apodized)',
    foci: [
      { addD: 0, weight: 0.52 },
      { addD: 1.50, weight: 0.24 }, // Intermediate at ~66 cm
      { addD: 2.75, weight: 0.24 }, // Near at ~36 cm
    ],
    assumptions: [
      'Advanced apodized diffractive steps engineered specifically to reduce halo ring luminance by ~45% compared to standard trifocals',
      'Optimized light throughput (>89%) channeling 52% to distance and 48% smoothly divided between intermediate and near',
      'Clinician design target: "better vision and less of ring perception" through gradual step height reduction toward the periphery',
    ],
    version: {
      modelVersion: '1.0.0',
      date: '2026-10-26',
      derivedFrom: 'Apodized trifocal bench optics (Carson 2016, Gatinel 2018 JCRS)',
    },
  },
};
