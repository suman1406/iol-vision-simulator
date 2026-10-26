export interface LensRating {
  distance: number;       // 1 - 5
  intermediate: number;   // 1 - 5
  near: number;           // 1 - 5
  nightDysphotopsia: 'Minimal' | 'Very Low' | 'Mild Rings' | 'Concentric Halos' | 'Severe Blur' | 'Suppressed Rings';
  spectacleIndependence: 'Distance only (Readers needed)' | 'Distance + Intermediate' | 'Distance + Near (Intermediate gap)' | 'Full Range (Near, Int & Far)' | 'None (Aphakic)';
}

export interface EffectEvidence {
  status: 'modelled' | 'not modelled';
  basis: string;
  evidence: string[];
}

export interface LensProfile {
  id: string;
  docIndex: string;       // e.g. "0", "1", "2", "3a", "3b", "4", "5", "6", "Ref"
  name: string;
  shortName: string;
  category: 'Natural' | 'Monofocal' | 'EDOF' | 'Premium EDOF' | 'Multifocal' | 'Trifocal' | 'Imported Trifocal' | 'Aphakia';
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
      'Natural healthy crystalline lens with active accommodation. All targets at far (10 m), intermediate (1 m), and near (40 cm) are in crisp, high-contrast 20/20 focus with zero halos.',
    patientHighlight: 'Pristine 20/20 clarity across all distances. Use as a gold-standard reference benchmark to evaluate what each IOL restores.',
    ratings: {
      distance: 5.0,
      intermediate: 5.0,
      near: 5.0,
      nightDysphotopsia: 'Minimal',
      spectacleIndependence: 'Full Range (Near, Int & Far)',
    },
    defocusCurves: ['monofocal'],
    opticalProfiles: [],
    references: [],
    effects: {
      blur: {
        status: 'modelled',
        basis: 'Active physiological accommodation matches object vergence dynamically, maintaining 0.0 D defocus at all viewing distances.',
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
    name: '1. Monofocal',
    shortName: '1. Monofocal',
    category: 'Monofocal',
    colorTheme: 'blue',
    model: 'Standard Aspheric Monofocal (Alcon Clareon SY60WF / AcrySof SN60WF)',
    status: 'clinical-ref',
    statusText: 'Clinical Control (FDA PMA P930014)',
    optical: 'monofocal',
    renderKind: 'reference',
    summary:
      'Standard monofocal distance-corrected IOL. Distant mall storefronts (10 m) are pin-sharp with zero night halos; intermediate directory (1 m) and near phone bill (0.38 m) show defocus blur requiring reading glasses (+2.5 D).',
    patientHighlight: 'Exceptional distance clarity for driving. Reading glasses are strictly required for smartphone, bill, and computer.',
    ratings: {
      distance: 5.0,
      intermediate: 2.0,
      near: 1.0,
      nightDysphotopsia: 'Minimal',
      spectacleIndependence: 'Distance only (Readers needed)',
    },
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
    id: 'edof',
    docIndex: '2',
    name: '2. EDOF (Extended Depth of Focus)',
    shortName: '2. EDOF',
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
    ratings: {
      distance: 4.8,
      intermediate: 4.5,
      near: 2.8,
      nightDysphotopsia: 'Mild Rings',
      spectacleIndependence: 'Distance + Intermediate',
    },
    defocusCurves: ['puresee'],
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
    docIndex: '3a',
    name: '3. Premium EDOF — TECNIS PureSee',
    shortName: '3a. PureSee EDOF',
    category: 'Premium EDOF',
    colorTheme: 'teal',
    model: 'Johnson & Johnson TECNIS PureSee (ZEN00V / DEN00V)',
    status: 'available',
    statusText: 'Bench Wavefront Validated (Schmid 2024)',
    optical: 'puresee',
    renderKind: 'lens-specific',
    summary:
      'Purely refractive continuous wavefront-shaping EDOF IOL. Convolved directly from published optical bench wavefront measurements across a 4.51 mm aperture (Schmid & Borkenstein 2024, Clin Ophthalmol).',
    patientHighlight: 'Zero diffractive halo rings at night. Continuous distance-to-intermediate clarity with functional near phone bill readability.',
    ratings: {
      distance: 5.0,
      intermediate: 4.5,
      near: 3.5,
      nightDysphotopsia: 'Very Low',
      spectacleIndependence: 'Distance + Intermediate',
    },
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
    docIndex: '3b',
    name: '3. Premium EDOF — Alcon Vivity',
    shortName: '3b. Vivity EDOF',
    category: 'Premium EDOF',
    colorTheme: 'emerald',
    model: 'Alcon AcrySof IQ Vivity (DFT015 / Clareon CCW015)',
    status: 'available',
    statusText: 'Deflectometry Validated (Garzón 2024)',
    optical: 'vivity',
    renderKind: 'lens-specific',
    summary:
      'Non-diffractive wavefront-shaping (X-WAVE™) EDOF IOL. Convolved from open optical dataset power profiles (Garzón et al. 2024, Graefe’s Archive) integrated to wavefront OPD.',
    patientHighlight: 'Monofocal-like low photic phenomena at night with crisp intermediate dashboard clarity.',
    ratings: {
      distance: 5.0,
      intermediate: 4.5,
      near: 2.8,
      nightDysphotopsia: 'Very Low',
      spectacleIndependence: 'Distance + Intermediate',
    },
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
    docIndex: '4',
    name: '4. Multifocal (Distance & Near)',
    shortName: '4. Multifocal',
    category: 'Multifocal',
    colorTheme: 'amber',
    model: 'Half-wave diffractive kinoform (+2.50 D Near Add / 40 cm)',
    status: 'clinical-ref',
    statusText: 'Diffraction Theory (Half-Wave Kinoform)',
    optical: 'multifocal',
    renderKind: 'reference',
    summary:
      'Classic simultaneous vision diffractive bifocal model. Divides light equally (40.5% distance, 40.5% near at +2.50 D spectacle add / 40 cm).',
    patientHighlight: 'Both distance and near reading are sharp, but intermediate (computer/kiosk) is blurred, and distinct night halos are visible.',
    ratings: {
      distance: 4.5,
      intermediate: 2.0,
      near: 4.5,
      nightDysphotopsia: 'Concentric Halos',
      spectacleIndependence: 'Distance + Near (Intermediate gap)',
    },
    defocusCurves: [],
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
    docIndex: '5',
    name: '5. Trifocal Lenses (Distance, Intermediate & Near)',
    shortName: '5. Trifocal Lenses',
    category: 'Trifocal',
    colorTheme: 'indigo',
    model: 'Alcon Clareon / AcrySof IQ PanOptix (TFNT00 / CNWET0)',
    status: 'available',
    statusText: 'Q1 Bench Validated (Carson 2016 JCRS)',
    optical: 'trifocal',
    renderKind: 'bench-validated',
    summary:
      'Quadrifocal diffractive design channeling 88% transmitted light across distance, 60 cm intermediate, and 40 cm near foci (Carson et al. 2016 JCRS).',
    patientHighlight: 'Full spectacle independence: phone bill and intermediate directory are both crisp. Standard diffractive halo rings around headlights at night.',
    ratings: {
      distance: 4.8,
      intermediate: 4.8,
      near: 4.8,
      nightDysphotopsia: 'Mild Rings',
      spectacleIndependence: 'Full Range (Near, Int & Far)',
    },
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
    docIndex: '6',
    name: '6. Imported Trifocal (Better Vision & Less Ring Perception)',
    shortName: '6. Imported Trifocal',
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
    ratings: {
      distance: 4.9,
      intermediate: 4.6,
      near: 4.7,
      nightDysphotopsia: 'Suppressed Rings',
      spectacleIndependence: 'Full Range (Near, Int & Far)',
    },
    defocusCurves: ['trifocal'],
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
  {
    id: 'none',
    docIndex: 'Aphakia',
    name: 'Aphakic Eye (Cataract Removed, No IOL, +11D)',
    shortName: 'Aphakia (+11D)',
    category: 'Aphakia',
    colorTheme: 'rose',
    model: 'Natural crystalline lens removed; uncorrected aphakic eye (+11 D severe hyperopic defocus)',
    status: 'clinical-ref',
    statusText: 'Uncorrected Aphakia (+11 D)',
    optical: 'aphakic',
    renderKind: 'reference',
    summary:
      'Vision without any intraocular lens implant after cataract extraction. The human eye has lost ~11 Diopters of refractive converging power, resulting in profound defocus blur across all distances until an IOL is implanted.',
    patientHighlight: 'Profound blur across all distances. Demonstrates to patients why cataract surgery requires an IOL implant.',
    ratings: {
      distance: 0.5,
      intermediate: 0.5,
      near: 0.5,
      nightDysphotopsia: 'Severe Blur',
      spectacleIndependence: 'None (Aphakic)',
    },
    defocusCurves: [],
    opticalProfiles: [],
    references: [],
    effects: {
      blur: {
        status: 'modelled',
        basis: 'Spectacle vergence error of +11.0 D through the entrance pupil.',
        evidence: [],
      },
      contrast: { status: 'modelled', basis: 'Severe contrast loss across all spatial frequencies.', evidence: [] },
      halo: { status: 'modelled', basis: 'Points of light disperse into expansive blur circles.', evidence: [] },
      colour: NO_COLOUR,
    },
  },
];
