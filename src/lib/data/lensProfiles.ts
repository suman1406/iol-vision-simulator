import { interpolateLogMar, logMarToScore, logMarToSnellen } from './defocusCurves';

export interface LensRating {
  distance: number;       // 1 - 5
  intermediate: number;   // 1 - 5
  near: number;           // 1 - 5
  nightDysphotopsia: 'Minimal' | 'Very Low' | 'Mild Rings' | 'Concentric Halos' | 'Severe Blur' | 'Suppressed Rings';
  spectacleIndependence: 'Distance only (Readers needed)' | 'Distance + Intermediate' | 'Distance + Near (Intermediate gap)' | 'Full Range (Near, Int & Far)' | 'None (Aphakic)';
  snellenDistance?: string;
  snellenIntermediate?: string;
  snellenNear?: string;
}

export interface EffectEvidence {
  status: 'modelled' | 'not modelled';
  basis: string;
  evidence: string[];
}

export interface LensProfile {
  id: string;
  docIndex: string;       // e.g. "0", "1", "2", "3", "4a", "4b", "5", "6", "7"
  name: string;
  shortName: string;
  category: 'Natural' | 'Monofocal' | 'EDOF' | 'Premium EDOF' | 'Multifocal' | 'Trifocal' | 'Imported Trifocal';
  colorTheme: string;
  model: string;
  status: 'available' | 'clinical-ref';
  statusText: string;
  optical: string;
  renderKind: 'lens-specific' | 'bench-validated' | 'reference';
  summary: string;
  patientHighlight: string;
  ratings: LensRating;
  defocusCurves: string[];
  opticalProfiles: string[];
  references: string[];
  related?: Array<{ id: string; note: string }>;
  effects: {
    blur: EffectEvidence;
    contrast: EffectEvidence;
    halo: EffectEvidence;
    colour: EffectEvidence;
  };
}

const NO_COLOUR: EffectEvidence = {
  status: 'not modelled',
  basis: 'Monochromatic calculation at 555 nm (photopic peak). No arbitrary tint is applied.',
  evidence: [],
};

// Helper to compute ratings directly from Q1 clinical defocus curves
export function computeRatingsForLens(
  lensId: string,
  nightDysphotopsia: LensRating['nightDysphotopsia'],
  spectacleIndependence: LensRating['spectacleIndependence']
): LensRating {
  const dLogMar = interpolateLogMar(lensId, 0.0);
  const iLogMar = interpolateLogMar(lensId, -1.5); // 66 cm arm's length
  const nLogMar = interpolateLogMar(lensId, -2.5); // 40 cm near reading

  return {
    distance: logMarToScore(dLogMar),
    intermediate: logMarToScore(iLogMar),
    near: logMarToScore(nLogMar),
    nightDysphotopsia,
    spectacleIndependence,
    snellenDistance: logMarToSnellen(dLogMar),
    snellenIntermediate: logMarToSnellen(iLogMar),
    snellenNear: logMarToSnellen(nLogMar),
  };
}

export const LENS_PROFILES: LensProfile[] = [
  {
    id: 'natural_eye',
    docIndex: '0',
    name: '0. Natural Eye (20/20 Reference)',
    shortName: '0. Natural 20/20',
    category: 'Natural',
    colorTheme: 'emerald',
    model: 'Healthy Phakic Eye with Active Accommodation (Gullstrand Model)',
    status: 'clinical-ref',
    statusText: 'Gold-Standard 20/20 Baseline',
    optical: 'natural_eye',
    renderKind: 'reference',
    summary:
      'Natural healthy crystalline lens with active accommodation. All targets at far (10 m), intermediate (85 cm), and near (40 cm) are in crisp, high-contrast 20/20 focus with zero halos.',
    patientHighlight: 'Pristine 20/20 clarity across all distances. Use as a gold-standard reference benchmark to evaluate what each IOL restores.',
    ratings: computeRatingsForLens('natural_eye', 'Minimal', 'Full Range (Near, Int & Far)'),
    defocusCurves: ['natural_eye'],
    opticalProfiles: [],
    references: [],
    effects: {
      blur: {
        status: 'modelled',
        basis: 'Active physiological accommodation dynamically matches object vergence, maintaining 0.0 D defocus at all viewing distances.',
        evidence: [],
      },
      contrast: { status: 'modelled', basis: 'Full MTF contrast preserved across all distances.', evidence: [] },
      halo: { status: 'modelled', basis: 'Zero diffractive dysphotopsia or halos.', evidence: [] },
      colour: NO_COLOUR,
    },
  },
  {
    id: 'monofocal',
    docIndex: '1',
    name: '1. Standard Monofocal (Alcon Clareon SY60WF)',
    shortName: '1. Clareon Monofocal',
    category: 'Monofocal',
    colorTheme: 'blue',
    model: 'Standard Aspheric Monofocal (Alcon Clareon SY60WF / AcrySof SN60WF)',
    status: 'clinical-ref',
    statusText: 'Clinical Control (FDA PMA P930014)',
    optical: 'monofocal',
    renderKind: 'reference',
    summary:
      'Standard monofocal distance-corrected IOL. Distant traffic and signs (10 m) are pin-sharp (20/17) with zero night halos; intermediate dashboard (85 cm) has mild blur (20/36) and near phone reading (40 cm) is blurred (20/69), requiring +2.50 D reading glasses.',
    patientHighlight: 'Exceptional distance clarity for driving. Reading glasses are strictly required for smartphone, bill, and computer.',
    ratings: computeRatingsForLens('monofocal', 'Minimal', 'Distance only (Readers needed)'),
    defocusCurves: ['monofocal'],
    opticalProfiles: [],
    references: ['fdaSsedVivity', 'nct03274986', 'carson2016'],
    effects: {
      blur: {
        status: 'modelled',
        basis: 'Diffraction-limited optical pupil with defocus phase determined by object distance (D = 1/d).',
        evidence: ['fdaSsedVivity'],
      },
      contrast: { status: 'modelled', basis: 'Highest peak distance contrast (0.804 MTF); sharp drop with defocus.', evidence: ['carson2016'] },
      halo: { status: 'modelled', basis: 'Absence of diffractive dysphotopsia rings around headlights.', evidence: ['fdaSsedVivity'] },
      colour: NO_COLOUR,
    },
  },
  {
    id: 'eyhance',
    docIndex: '2',
    name: '2. Plain Tier-1 EDOF — TECNIS Eyhance (ICB00)',
    shortName: '2. Eyhance Tier-1 EDOF',
    category: 'EDOF',
    colorTheme: 'cyan',
    model: 'Enhanced Monofocal with Progressive Central Power (TECNIS Eyhance ICB00)',
    status: 'available',
    statusText: 'Q1 Peer-Reviewed Validated (Mencucci 2020 JCRS)',
    optical: 'eyhance',
    renderKind: 'bench-validated',
    summary:
      'Enhanced monofocal / plain Tier-1 EDOF IOL featuring a progressive power profile smoothly increasing power from periphery to center (+0.85 D). Delivers superior intermediate vision over standard monofocals without inducing diffractive dysphotopsia.',
    patientHighlight: 'Enhanced intermediate dashboard clarity (20/29 vs 20/36 in monofocal) with zero night halos. Reading glasses still needed for fine near print.',
    ratings: computeRatingsForLens('eyhance', 'Minimal', 'Distance + Intermediate'),
    defocusCurves: ['eyhance', 'monofocal'],
    opticalProfiles: [],
    references: ['mencucci2020', 'auffarth2021'],
    effects: {
      blur: {
        status: 'modelled',
        basis: 'Continuous anterior central power progression (+0.85 D) verified in Mencucci et al. JCRS 2020.',
        evidence: ['mencucci2020'],
      },
      contrast: { status: 'modelled', basis: 'Monofocal-equivalent distance MTF with extended depth-of-focus to 66 cm.', evidence: ['mencucci2020'] },
      halo: { status: 'modelled', basis: 'Purely refractive continuous surface; zero diffractive halo rings.', evidence: ['mencucci2020'] },
      colour: NO_COLOUR,
    },
  },
  {
    id: 'edof',
    docIndex: '3',
    name: '3. EDOF — TECNIS Symfony (ZXR00)',
    shortName: '3. Symfony EDOF',
    category: 'EDOF',
    colorTheme: 'sky',
    model: 'Diffractive Echelette EDOF (TECNIS Symfony ZXR00 benchmark)',
    status: 'available',
    statusText: 'Q1 Bench Validated (Gatinel 2016 JCRS)',
    optical: 'edof',
    renderKind: 'bench-validated',
    summary:
      'Diffractive echelette extended depth of focus IOL. Utilizes kinoform phase steps to elongate the focal zone across +1.75 D, providing continuous intermediate and functional near clarity.',
    patientHighlight: 'Continuous intermediate focus for dashboard and computer; mild diffractive rings around bright night headlights.',
    ratings: computeRatingsForLens('edof', 'Mild Rings', 'Distance + Intermediate'),
    defocusCurves: ['edof'],
    opticalProfiles: ['gatinel2016'],
    references: ['gatinel2016'],
    effects: {
      blur: {
        status: 'modelled',
        basis: 'Elongated through-focus MTF plateau profile from Gatinel & Loicq 2016 JCRS (50 lp/mm, 3.0 mm pupil).',
        evidence: ['gatinel2016'],
      },
      contrast: { status: 'modelled', basis: 'Sustained intermediate MTF with mild distance peak trade-off.', evidence: ['gatinel2016'] },
      halo: { status: 'modelled', basis: 'Diffractive echelette steps generate a mild starburst/halo ring at mesopic apertures.', evidence: ['gatinel2016'] },
      colour: NO_COLOUR,
    },
  },
  {
    id: 'puresee',
    docIndex: '4a',
    name: '4. Premium EDOF — TECNIS PureSee',
    shortName: '4a. PureSee EDOF',
    category: 'Premium EDOF',
    colorTheme: 'teal',
    model: 'Johnson & Johnson TECNIS PureSee (ZEN00V / DEN00V)',
    status: 'available',
    statusText: 'Bench Wavefront Validated (Schmid 2024)',
    optical: 'puresee',
    renderKind: 'lens-specific',
    summary:
      'Purely refractive continuous wavefront-shaping EDOF IOL. Convolved directly from published optical bench wavefront measurements across a 4.51 mm aperture (Schmid & Borkenstein 2024, Clin Ophthalmol).',
    patientHighlight: 'Zero diffractive halo rings at night. Continuous distance-to-intermediate clarity with functional near phone bill readability (20/37).',
    ratings: computeRatingsForLens('puresee', 'Very Low', 'Distance + Intermediate'),
    defocusCurves: ['puresee'],
    opticalProfiles: ['schmid2024'],
    references: ['auffarth2026', 'schmid2024'],
    effects: {
      blur: {
        status: 'modelled',
        basis: 'Digitized radial OPD wavefront (Schmid & Borkenstein 2024) convolved via 2D Fast Fourier Transform.',
        evidence: ['schmid2024'],
      },
      contrast: { status: 'modelled', basis: 'Through-focus MTF at 50 lp/mm (peak 0.38 at 3.0 mm pupil).', evidence: ['schmid2024'] },
      halo: { status: 'modelled', basis: 'Continuous refractive surface completely avoids diffractive ring dysphotopsia.', evidence: ['schmid2024'] },
      colour: NO_COLOUR,
    },
  },
  {
    id: 'vivity',
    docIndex: '4b',
    name: '4. Premium EDOF — Alcon Vivity',
    shortName: '4b. Vivity EDOF',
    category: 'Premium EDOF',
    colorTheme: 'emerald',
    model: 'Alcon AcrySof IQ Vivity (DFT015 / Clareon CCW015)',
    status: 'available',
    statusText: 'Deflectometry Validated (Garzón 2024)',
    optical: 'vivity',
    renderKind: 'lens-specific',
    summary:
      'Non-diffractive wavefront-shaping (X-WAVE™) EDOF IOL. Convolved from open optical dataset power profiles (Garzón et al. 2024, Graefe’s Archive) integrated to wavefront OPD.',
    patientHighlight: 'Monofocal-like low photic phenomena at night with crisp intermediate dashboard clarity (20/25). Near reading requires readers for fine print (20/46).',
    ratings: computeRatingsForLens('vivity', 'Very Low', 'Distance + Intermediate'),
    defocusCurves: ['vivity', 'monofocal'],
    opticalProfiles: ['garzon2024', 'schmid2023'],
    references: ['fdaSsedVivity', 'nct03274986', 'garzon2024', 'schmid2023'],
    effects: {
      blur: {
        status: 'modelled',
        basis: 'Radial power profile from phase-shifting Schlieren deflectometry integrated to wavefront.',
        evidence: ['garzon2024'],
      },
      contrast: { status: 'modelled', basis: 'Corroborated by NCT03274986 mesopic contrast sensitivity trial data.', evidence: ['nct03274986'] },
      halo: { status: 'modelled', basis: 'Smooth surface elevation avoids phase step rings (severe halos only 0.9% in FDA trial).', evidence: ['fdaSsedVivity'] },
      colour: NO_COLOUR,
    },
  },
  {
    id: 'multifocal',
    docIndex: '5',
    name: '5. Multifocal (Distance & Near)',
    shortName: '5. Multifocal',
    category: 'Multifocal',
    colorTheme: 'amber',
    model: 'Half-wave diffractive kinoform (+2.50 D Near Add / 40 cm)',
    status: 'clinical-ref',
    statusText: 'Diffraction Theory (Half-Wave Kinoform)',
    optical: 'multifocal',
    renderKind: 'reference',
    summary:
      'Classic simultaneous vision diffractive bifocal model. Divides light equally (40.5% distance, 40.5% near at +2.50 D spectacle add / 40 cm).',
    patientHighlight: 'Both distance and near reading are sharp (20/21), but intermediate dashboard (85 cm) has a contrast dip (20/36), and distinct night halos are visible.',
    ratings: computeRatingsForLens('multifocal', 'Concentric Halos', 'Distance + Near (Intermediate gap)'),
    defocusCurves: ['multifocal'],
    opticalProfiles: [],
    references: [],
    effects: {
      blur: {
        status: 'modelled',
        basis: 'Ideal half-wave kinoform order efficiency: 40.5% distance, 40.5% near (+2.50 D), ~19% other orders.',
        evidence: [],
      },
      contrast: { status: 'modelled', basis: 'Non-focusing order forms background veil that reduces contrast.', evidence: [] },
      halo: { status: 'modelled', basis: 'Out-of-focus near light forms an optical halo disc around night light sources.', evidence: [] },
      colour: NO_COLOUR,
    },
  },
  {
    id: 'trifocal',
    docIndex: '6',
    name: '6. Trifocal Lenses (Distance, Intermediate & Near)',
    shortName: '6. Trifocal (PanOptix)',
    category: 'Trifocal',
    colorTheme: 'indigo',
    model: 'Alcon Clareon / AcrySof IQ PanOptix (TFNT00 / CNWET0)',
    status: 'available',
    statusText: 'Q1 Bench Validated (Carson 2016 JCRS)',
    optical: 'trifocal',
    renderKind: 'bench-validated',
    summary:
      'Quadrifocal diffractive design channeling 88% transmitted light across distance, 60 cm intermediate, and 40 cm near foci (Carson et al. 2016 JCRS).',
    patientHighlight: 'Full spectacle independence: phone bill (20/21) and intermediate dashboard (20/22) are both crisp. Standard diffractive halo rings around headlights at night.',
    ratings: computeRatingsForLens('trifocal', 'Mild Rings', 'Full Range (Near, Int & Far)'),
    defocusCurves: ['trifocal'],
    opticalProfiles: ['carson2016'],
    references: ['carson2016', 'panoptixDesign'],
    effects: {
      blur: {
        status: 'modelled',
        basis: 'Discrete optical focal distribution (0 D, +1.68 D, +2.51 D) with published 50/25/25 energy split (Carson et al. 2016).',
        evidence: ['carson2016'],
      },
      contrast: { status: 'modelled', basis: 'Modest MTF reduction across 3 foci matching bench data.', evidence: ['carson2016'] },
      halo: { status: 'modelled', basis: 'Diffractive echelette rings generate circular night halos.', evidence: ['carson2016'] },
      colour: NO_COLOUR,
    },
  },
  {
    id: 'imported_trifocal',
    docIndex: '7',
    name: '7. Imported Trifocal (Better Vision & Less Ring Perception)',
    shortName: '7. Imported Trifocal',
    category: 'Imported Trifocal',
    colorTheme: 'purple',
    model: 'Advanced Apodized Trifocal (e.g. Zeiss AT LISA tri 839MP / FineVision HP)',
    status: 'available',
    statusText: 'Apodized Bench Validated (Carson 2016 / Gatinel 2018)',
    optical: 'imported_trifocal',
    renderKind: 'bench-validated',
    summary:
      'Doctor-specified imported trifocal with optimized step apodization: engineered to deliver sharp full-range vision with significantly suppressed halo ring perception.',
    patientHighlight: 'Doc-specified: "Better vision and less of ring perception". Apodized diffractive steps cut halo intensity by ~45% while preserving reading clarity.',
    ratings: computeRatingsForLens('imported_trifocal', 'Suppressed Rings', 'Full Range (Near, Int & Far)'),
    defocusCurves: ['imported_trifocal'],
    opticalProfiles: ['carson2016'],
    references: ['carson2016'],
    effects: {
      blur: {
        status: 'modelled',
        basis: 'Apodized diffractive profile channeling 52% distance, 24% intermediate (~66 cm), 24% near (~36 cm).',
        evidence: ['carson2016'],
      },
      contrast: { status: 'modelled', basis: 'High light throughput (>89%) providing superior contrast.', evidence: ['carson2016'] },
      halo: { status: 'modelled', basis: 'Gradual step height apodization toward periphery significantly suppresses halo perception.', evidence: ['carson2016'] },
      colour: NO_COLOUR,
    },
  },
];
