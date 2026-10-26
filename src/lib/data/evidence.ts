export interface EvidenceRecord {
  kind: 'clinical' | 'optical' | 'design';
  title: string;
  authors: string;
  venue: string;
  year: number;
  link: string;
  location: string;
  lenses: string;
  design: string;
  conditions: string;
  results: string[];
  transcription: string;
  limitations: string;
  journalRank?: string;
  units?: { defocus: string; va: string };
  points?: Array<{ d: number; va: number; lo: number; hi: number; sd?: number }>;
  version?: {
    sourceVersion: string;
    retrieved: string;
    recordVersion: string;
    changes?: string;
  };
}

export const EVIDENCE_RECORDS: Record<string, EvidenceRecord> = {
  carson2016: {
    kind: 'optical',
    title: 'Optical bench performance of 3 trifocal intraocular lenses',
    authors: 'Carson D, Xu Z, Alexander E, Choi M, Zhao Z, Hong X',
    venue: 'Journal of Cataract & Refractive Surgery 42(9):1361–1367 (Q1 Ophthalmology)',
    year: 2016,
    link: 'https://doi.org/10.1016/j.jcrs.2016.06.036',
    location: 'Figures 2–5 (through-focus MTF, Badal images, halo profiles)',
    lenses: 'AcrySof IQ PanOptix (TFNT00), AT LISA tri 839MP, FineVision Micro F',
    design: 'Standardized optical bench testing (Optikos system) complying with ISO 11979-2',
    conditions: 'Model eye with average corneal spherical aberration, 546 nm, 3.0 mm and 4.5 mm apertures, MTF at 50 lp/mm and 100 lp/mm',
    results: [
      'PanOptix intermediate peak tailored to 60 cm (+1.68 D spectacle) vs 80 cm for AT LISA tri and FineVision',
      'Distance and near MTF peaks were comparable across all three trifocal lenses',
      'Continuous range of functional vision maintained through intermediate computer distance (60 cm)',
      'Photic halo diameter and intensity were equivalent across all 3 diffractive designs'
    ],
    transcription: 'Through-focus MTF peaks and focal allocations transcribed directly from Carson 2016 Table 1 & Figures 2-4',
    limitations: 'In vitro optical bench setup at monochromatic 546 nm; does not model neural adaptation.',
    journalRank: 'Q1 (Journal of Cataract & Refractive Surgery)',
    version: { sourceVersion: 'JCRS 42(9):1361–1367', retrieved: '2026-10-26', recordVersion: '1.0.0' }
  },
  gatinel2016: {
    kind: 'optical',
    title: 'Comparison of the through-focus optical quality of diffractive trifocal and extended depth of focus intraocular lenses',
    authors: 'Gatinel D, Loicq J',
    venue: 'Journal of Cataract & Refractive Surgery 42(10):1498–1504 (Q1 Ophthalmology)',
    year: 2016,
    link: 'https://doi.org/10.1016/j.jcrs.2016.08.019',
    location: 'Figures 1–4 (Through-focus MTF & optical quality)',
    lenses: 'TECNIS Symfony (ZXR00) vs FineVision diffractive trifocal',
    design: 'Optical bench evaluation using PMTF optical bench system with polychromatic and monochromatic light',
    conditions: '3.0 mm and 4.5 mm pupil apertures; through-focus MTF evaluated at 50 lp/mm',
    results: [
      'TECNIS Symfony demonstrated a sustained plateau of intermediate MTF without an isolated dip',
      'Depth of focus elongated across approximately +1.75 D',
      'Near optical quality (> +2.0 D) was lower than dedicated trifocal designs',
      'Halo diameter was comparable to diffractive multifocal optics'
    ],
    transcription: 'Through-focus MTF curves transcribed from Gatinel & Loicq 2016 Figures 2 and 3',
    limitations: 'In vitro bench comparison; neural contrast sensitivity not represented.',
    journalRank: 'Q1 (Journal of Cataract & Refractive Surgery)',
    version: { sourceVersion: 'JCRS 42(10):1498–1504', retrieved: '2026-10-26', recordVersion: '1.0.0' }
  },
  schmid2024: {
    kind: 'optical',
    title: 'Optical Bench Evaluation of the Latest Refractive Enhanced Depth of Focus Intraocular Lens',
    authors: 'Schmid R, Borkenstein AF',
    venue: 'Clinical Ophthalmology 18:1921–1932 (Q1 Ophthalmology)',
    year: 2024,
    link: 'https://doi.org/10.2147/OPTH.S469849',
    location: 'OptiSpheric IOL PRO 2 & WaveMaster bench data (Table 1 & Fig 7)',
    lenses: 'TECNIS PureSee ZEN00V 22 D',
    design: 'Bench testing under ISO 11979 model eye with ISO-2 cornea at 546 nm',
    conditions: '3.0 mm and 4.5 mm apertures; MTF measured at 50 lp/mm',
    results: [
      'MTF at 50 lp/mm: 0.410 (3.0 mm pupil), 0.621 (4.5 mm pupil)',
      'Depth of focus ~2.2 D at IOL plane ≈ 1.7 D spectacle plane',
      'Radial optical path difference profile measured across 4.51 mm optical zone'
    ],
    transcription: 'Table 1 transcribed; Fig 7 radial OPD digitized for wave optics rendering',
    limitations: 'In vitro optical bench model at monochromatic 546 nm.',
    journalRank: 'Q1 (Clinical Ophthalmology)',
    version: { sourceVersion: 'Clin Ophthalmol 2024;18', retrieved: '2026-10-25', recordVersion: '1.2.0' }
  },
  garzon2024: {
    kind: 'optical',
    title: 'Optical power profiles and aberrations of a non-diffractive wavefront-shaping extended depth of focus intraocular lens',
    authors: 'Garzón N, Gómez-Pedrero JA, Albarrán-Diego C, Fernández-Núñez S, Villanueva Gómez-Chacón C, García-Montero M',
    venue: 'Graefe\'s Archive for Clinical and Experimental Ophthalmology 262(9):2897–2906 (Q1 Ophthalmology)',
    year: 2024,
    link: 'https://doi.org/10.1007/s00417-024-06469-y',
    location: 'Open dataset Zenodo 10.5281/zenodo.18084296 (CC BY 4.0)',
    lenses: 'AcrySof IQ Vivity DFT015 (+20 D)',
    design: 'NIMO TR1504 phase-shifting Schlieren deflectometry power profile measurements',
    conditions: '546 nm, 10 repeat measurements per lens across 4.5 mm aperture',
    results: [
      'Smooth central power elevation (+1.2 D above nominal) tapering smoothly outward',
      'Smooth continuous wavefront transition without phase step rings',
      'Repeatability standard deviation ≤ 0.03 D'
    ],
    transcription: 'Extracted from Zenodo open dataset, mean of 10 repeat measurements',
    limitations: 'Radial profile measurement.',
    journalRank: 'Q1 (Graefe\'s Archive for Clinical and Experimental Ophthalmology)',
    version: { sourceVersion: 'Zenodo 10.5281/zenodo.18084296', retrieved: '2026-10-25', recordVersion: '1.0.0' }
  },
  schmid2023: {
    kind: 'optical',
    title: 'Enhanced Depth of Focus Intraocular Lenses: Through Focus Evaluation of Wavefront-Shaping versus Diffractive Optics',
    authors: 'Schmid R, Borkenstein AF',
    venue: 'Biomedicine Hub 8(1):25–30',
    year: 2023,
    link: 'https://doi.org/10.1159/000529234',
    location: 'Through-focus MTF curves',
    lenses: 'AcrySof IQ Vivity DFT015 22 D',
    design: 'Optical bench evaluation under ISO 11979-2 conditions',
    conditions: '546 nm, 3.0 mm and 4.5 mm pupils, MTF at 50 lp/mm',
    results: [
      '3.0 mm: Distance peak MTF 0.325, intermediate peak 0.190',
      '4.5 mm: Distance peak MTF 0.350, intermediate peak 0.110'
    ],
    transcription: 'Transcribed values used to validate the Vivity optical model',
    limitations: 'Monochromatic bench test.',
    version: { sourceVersion: 'Biomed Hub 2023', retrieved: '2026-10-25', recordVersion: '1.0.0' }
  },
  fdaSsedVivity: {
    kind: 'clinical',
    title: 'FDA Summary of Safety and Effectiveness Data: AcrySof IQ Vivity Extended Vision IOL',
    authors: 'U.S. Food and Drug Administration / Alcon',
    venue: 'FDA PMA P930014/S126',
    year: 2020,
    link: 'https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpma/pma.cfm?id=P930014S126',
    location: 'Figures 9 & 10 (Binocular defocus curves)',
    lenses: 'AcrySof IQ Vivity (DFT015) vs AcrySof IQ Monofocal (SN60WF)',
    design: 'Pivotal clinical trial cohort of 106 Vivity and 111 Monofocal subjects at Month 6',
    conditions: 'Photopic binocular visual acuity across +1.50 D to -2.50 D defocus in 0.5 D / 0.25 D steps',
    results: [
      'Statistically superior intermediate vision across -1.0 D to -1.5 D',
      'Clinically comparable distance visual acuity (-0.025 logMAR vs -0.078 logMAR)',
      'Clinically meaningful improvement in near vision without glasses at -2.0 D to -2.5 D'
    ],
    transcription: 'Extracted from FDA vector figures with high precision (±0.003 logMAR)',
    limitations: 'Monocular and binocular trial averages.',
    version: { sourceVersion: 'PMA SSED P930014/S126', retrieved: '2026-10-25', recordVersion: '1.1.0' }
  },
  auffarth2026: {
    kind: 'clinical',
    title: 'Clinical Performance After Implantation of a New Purely Refractive Extended Depth of Field Intraocular Lens in Cataract Patients',
    authors: 'Auffarth GU, Negoescu AT, Kremser F, Chychko L, Vogormian L, Khoramnia R, Yildirim TM',
    venue: 'Clinical Ophthalmology vol 20 (Q1 Ophthalmology)',
    year: 2026,
    link: 'https://doi.org/10.2147/OPTH.S583059',
    location: 'Results text & Figure 3',
    lenses: 'TECNIS PureSee (DEN00V / toric DET100–600)',
    design: 'Prospective clinical study of 58 eyes (29 patients), 3 months post-op',
    conditions: 'Binocular, distance-corrected, 4 m, ETDRS, photopic (85 cd/m²), +2.00 to −4.00 D',
    results: [
      'Visual acuity ≤0.10 logMAR from +1.0 D to −1.5 D',
      'Visual acuity ≤0.20 logMAR out to −2.25 D',
      'High rate of patient spectacle independence at intermediate distance'
    ],
    transcription: 'Digitized from published Fig 3 data curves',
    limitations: 'Single-arm prospective study.',
    journalRank: 'Q1 (Clinical Ophthalmology)',
    version: { sourceVersion: 'Dovepress OPTH.S583059', retrieved: '2026-10-25', recordVersion: '1.0.0' }
  },
  nct03274986: {
    kind: 'clinical',
    title: 'A Prospective, Randomized, Controlled, Multi-Center Clinical Study of the ACRYSOF IQ Extended Depth of Focus IOL',
    authors: 'Alcon Research (sponsor)',
    venue: 'ClinicalTrials.gov results record NCT03274986',
    year: 2020,
    link: 'https://clinicaltrials.gov/study/NCT03274986',
    location: 'Registry results, primary outcome depth of focus',
    lenses: 'DFT015 (AcrySof IQ Vivity) vs SN60WF (AcrySof IQ monofocal)',
    design: 'Prospective, randomised, controlled, multicentre (107 DFT015 eyes, 111 SN60WF eyes)',
    conditions: 'Monocular, photopic, 4 m, ETDRS, logMAR; Month 6',
    results: [
      'Depth of focus to 0.20 logMAR: DFT015 1.53 D vs SN60WF 0.99 D',
      'Distance-corrected intermediate visual acuity (DCIVA 66 cm): DFT015 0.148 logMAR vs SN60WF 0.312',
      'Best-corrected distance visual acuity (BCDVA 4 m): DFT015 0.016 logMAR vs SN60WF −0.036',
      'Distance-corrected near visual acuity (DCNVA 40 cm): DFT015 0.359 logMAR vs SN60WF 0.515',
      'Severe halos: 0.9% in both groups; severe starbursts: 3.8% vs 2.7%',
      'Mesopic contrast sensitivity without glare: comparable to monofocal at lower frequencies (1.5, 3 cpd)'
    ],
    transcription: 'Values transcribed directly from ClinicalTrials.gov registry results',
    limitations: 'Group clinical means, not individual predictive guarantee.',
    version: { sourceVersion: 'Final registry record', retrieved: '2026-10-25', recordVersion: '1.0.0' }
  },
  panoptixDesign: {
    kind: 'design',
    title: 'Clareon PanOptix Trifocal IOL — Design & Light Distribution Specifications',
    authors: 'Alcon Research / FDA PMA',
    venue: 'myalcon.com & ClinicalTrials.gov NCT03268746',
    year: 2025,
    link: 'https://www.myalcon.com',
    location: 'Product monographs',
    lenses: 'Clareon PanOptix TFNT00',
    design: 'Quadrifocal diffractive design channeling intermediate focus at 60 cm',
    conditions: 'Light allocation 50% distance, 25% intermediate, 25% near of 88% transmitted energy',
    results: [
      'Intermediary add +2.17 D (IOL plane) ≈ +1.68 D (spectacle plane, 60 cm)',
      'Near add +3.25 D (IOL plane) ≈ +2.51 D (spectacle plane, 40 cm)'
    ],
    transcription: 'Transcribed from official manufacturer specifications',
    limitations: 'Manufacturer published design specifications.',
    version: { sourceVersion: 'Alcon Technical Specifications', retrieved: '2026-10-25', recordVersion: '1.1.0' }
  }
};
