// Evidence records collected 2026-10-25. Only fields read from the source are filled. Requires data/defocusCurves.js.
// Defocus-curve points are stored only where digitised with a documented method (see each record);
// otherwise `points: []`. Clinical curves are never used as a pixel-blur lookup.
// Q1 journal status: not checked for any record.
window.EVIDENCE = {
  nct03274986: {
    kind: 'clinical',
    title: 'A Prospective, Randomized, Controlled, Multi-Center Clinical Study of the ACRYSOF IQ Extended Depth of Focus IOL',
    authors: 'Alcon Research (sponsor)', venue: 'ClinicalTrials.gov results record', year: 2020,
    link: 'https://clinicaltrials.gov/study/NCT03274986', location: 'Registry results, primary outcome "depth of focus"',
    lenses: 'DFT015 (AcrySof IQ Vivity) vs SN60WF (AcrySof IQ monofocal)',
    design: 'Prospective, randomised, controlled, multicentre; industry-sponsored. Analysed: 107 DFT015 eyes, 111 SN60WF eyes (first operative eye)',
    conditions: 'Monocular, photopic, 4 m, ETDRS, logMAR; Month 6',
    results: [
      'Depth of focus to 0.20 logMAR (linear interpolation on negative side of mean curve): DFT015 1.53 D; SN60WF 0.99 D (no SE/CI reported; no hypothesis test)',
      'DCIVA 66 cm: DFT015 0.148 logMAR (SE 0.012); SN60WF 0.312 (SE 0.012)',
      'BCDVA 4 m: DFT015 0.016 logMAR (SE 0.009); SN60WF −0.036 (SE 0.009)',
      'DCNVA 40 cm: DFT015 0.359 logMAR (SE 0.015); SN60WF 0.515 (SE 0.014)',
      'Severe halos (QUVID): 0.9% both groups; severe starbursts 3.8% vs 2.7%',
      'Mesopic contrast sensitivity, no glare (log units, mean ± SD): 6 cpd 1.340 ± 0.385 vs 1.548 ± 0.318; 12 cpd 0.840 ± 0.368 vs 1.003 ± 0.377; similar at 1.5 and 3 cpd'
    ],
    points: [], transcription: 'Values transcribed from registry text; no digitisation',
    limitations: 'Group means, not individual predictions. Defocus-curve shape not available as data.'
  },
  auffarth2026: {
    kind: 'clinical',
    title: 'Clinical Performance After Implantation of a New Purely Refractive Extended Depth of Field Intraocular Lens in Cataract Patients',
    authors: 'Auffarth GU, Negoescu AT, Kremser F, Chychko L, Vogormian L, Khoramnia R, Yildirim TM',
    venue: 'Clinical Ophthalmology, vol 20', year: 2026, link: 'https://doi.org/10.2147/OPTH.S583059',
    location: 'Results text; Figure 3 (curve, not digitised)',
    lenses: 'TECNIS PureSee (DEN00V / toric DET100–600)',
    design: 'Prospective, non-controlled, single-arm; 29 patients enrolled (58 eyes), 25 at 3 months; sponsored by Johnson & Johnson Vision',
    conditions: 'Binocular, distance-corrected, 4 m, ETDRS, photopic (85 cd/m²), +2.00 to −4.00 D; 3 months',
    results: [
      '≤0.10 logMAR from +1.0 to −1.5 D; ≤0.20 logMAR to −2.25 D (Results/Abstract)',
      'Inconsistency in source: Discussion gives +1.25 to −2.25 D; Figure 3 legend gives ~2.5 D at 0.10 and ~3.5 D at 0.20 logMAR'
    ],
    // Digitised from Figure 3 (dovepress figure image OPTH_A_583059_O_F0003g.jpg, 750 px wide) by reading point
    // centres against the gridlines (0.1 logMAR = ~34 px). Reading uncertainty ±0.02 logMAR. Error bars as drawn;
    // the figure does not state whether they are SD or SE.
    units: { defocus: 'D (spectacle plane, minus = near)', va: 'logMAR (binocular DCVA)' },
    points: [
      { d: 2.0, va: 0.41, lo: 0.33, hi: 0.50 }, { d: 1.5, va: 0.24, lo: 0.17, hi: 0.32 }, { d: 1.0, va: 0.10, lo: 0.06, hi: 0.16 },
      { d: 0.5, va: -0.01, lo: -0.10, hi: 0.07 }, { d: 0.0, va: -0.08, lo: -0.12, hi: -0.04 }, { d: -0.5, va: -0.03, lo: -0.06, hi: 0.01 },
      { d: -1.0, va: 0.03, lo: 0.00, hi: 0.07 }, { d: -1.5, va: 0.09, lo: 0.06, hi: 0.12 }, { d: -2.0, va: 0.15, lo: 0.11, hi: 0.18 },
      { d: -2.5, va: 0.27, lo: 0.23, hi: 0.31 }, { d: -3.0, va: 0.39, lo: 0.34, hi: 0.43 }, { d: -3.5, va: 0.47, lo: 0.43, hi: 0.51 },
      { d: -4.0, va: 0.55, lo: 0.49, hi: 0.60 }],
    transcription: 'Summary values transcribed from text; curve points digitised manually from Figure 3 (±0.02 logMAR reading uncertainty; error-bar type not stated in source)',
    limitations: 'Small, uncontrolled, sponsor-funded. Internal inconsistencies flagged above. Group mean, not an individual prediction.'
  },
  schmid2024: {
    kind: 'optical',
    title: 'Optical Bench Evaluation of the Latest Refractive Enhanced Depth of Focus Intraocular Lens',
    authors: 'Schmid R, Borkenstein AF', venue: 'Clinical Ophthalmology, vol 18, pp 1921–1932', year: 2024,
    link: 'https://doi.org/10.2147/OPTH.S469849', location: 'Fig 3A/3B (through-focus MTF), Fig 5 (simulated VA)',
    lenses: 'TECNIS PureSee ZEN00V, 22 D',
    design: 'Optical bench (OptiSpheric IOL PRO 2; WaveMaster IOL 2); ISO 11979 model eye, ISO-2 cornea; no funding declared',
    conditions: '546 nm; 3 mm and 4.5 mm apertures; MTF at 50 lp/mm',
    results: [
      'MTF at 50 lp/mm: 0.410 (3 mm), 0.621 (4.5 mm)',
      'Depth of focus ~2.2 D IOL plane ≈ 1.7 D spectacle plane (3 mm); near peak lost at 4.5 mm',
      'Simulated VA (3 mm): <0.1 logMAR to ~−2.25 D, <0.2 to ~−2.75 D',
      'Table 1: 34 Zernike coefficients to 10th order over a 4.51 mm aperture (fitted RMS 0.3046 µm); main terms A4,0 −0.6578, A6,0 0.2021, A8,0 −0.0769, A10,0 −0.0834 µm',
      'Fig 3A through-focus MTF (3 mm): peak ~0.41 at nominal power, secondary ~0.09 at ~+2.1 D (IOL plane)'
    ],
    points: [], transcription: 'Table 1 transcribed in full; Fig 7 radial OPD digitised by tracing red pixels against gridlines (used for rendering); Fig 3A/3B read manually for validation only',
    limitations: 'One lens (22 D) on a monochromatic bench. Zernike normalisation not stated; inferred as unnormalised because it reproduces the reported RMS (0.307 vs 0.3046 µm). The 10th-order Zernike fit does not reproduce the bench MTF, so the measured meridional OPD (Fig 7) is used instead. Whether the wavefront includes the model cornea is not stated.'
  },
  garzon2024: {
    kind: 'optical',
    title: 'Optical power profiles and aberrations of a non-diffractive wavefront-shaping extended depth of focus intraocular lens',
    authors: 'Garzón N, Gómez-Pedrero JA, Albarrán-Diego C, Fernández-Núñez S, Villanueva Gómez-Chacón C, García-Montero M',
    venue: 'Graefe\'s Archive for Clinical and Experimental Ophthalmology 262(9):2897–2906 (CC BY 4.0); dataset Zenodo 10.5281/zenodo.18084296 (CC BY 4.0)', year: 2024,
    link: 'https://doi.org/10.1007/s00417-024-06469-y', location: 'Open dataset "Power Profile" sheet (+20.00 D, centred, measurements M01–M10)',
    lenses: 'AcrySof IQ Vivity DFT015, +10 / +20 / +30 D',
    design: 'Laboratory power-profile and aberration measurement (NIMO TR1504, phase-shifting Schlieren); 10 repeat measurements per lens',
    conditions: '546 nm; profiles over a 4.5 mm optical zone (data to ±2.24 mm)',
    results: ['+20 D lens: central zone ≈ +1.2 D above nominal (r < 0.4 mm), dip to ≈ −0.7 D at 0.6 mm, periphery falling from ≈ −0.2 to −0.9 D (r 1.3–2.2 mm)',
      'Repeatability: SD ≤ 0.03 D across the 10 measurements',
      'Paper: central add ≈ +2 D within ±1.1 mm (text values internally inconsistent: 1 vs 1.25 D central increase)'],
    points: [], transcription: 'Dataset values extracted by tools/extract_vivity.py (mean of 10 measurements, half-meridians averaged; no smoothing)',
    limitations: 'Single lens per power; centred only. The instrument may smooth sharp zone edges. Paper text has small internal inconsistencies; the raw dataset is used instead.'
  },
  schmid2023: {
    kind: 'optical',
    title: 'Enhanced Depth of Focus Intraocular Lenses: Through Focus Evaluation of Wavefront-Shaping versus Diffractive Optics',
    authors: 'Schmid R, Borkenstein AF', venue: 'Biomedicine Hub 8(1):25–30 (CC BY-NC 4.0)', year: 2023,
    link: 'https://doi.org/10.1159/000529234', location: 'Results; Figs 3–4 (through-focus MTF)',
    lenses: 'AcrySof IQ Vivity DFT015 22 D (also Symfony, LuxSmart)',
    design: 'Optical bench (OptiSpheric IOL PRO 2), ISO 11979-2, ISO-2 eye model',
    conditions: '546 nm; 3 mm and 4.5 mm apertures; MTF at 50 lp/mm',
    results: ['3 mm: far peak MTF 0.325, intermediate 0.190; peaks 1.75 D apart (IOL plane)',
      '4.5 mm: far 0.350, intermediate 0.110; peaks 1.75 D apart'],
    points: [], transcription: 'Values transcribed from text; used only to validate the Garzón-based model',
    limitations: 'Different lens power (22 D) from the dataset (20 D). Validation: model far peaks match (0.33 vs 0.325 at 3 mm; 0.39 vs 0.35 at 4.5 mm); model intermediate peak is closer (≈1.3–1.4 D vs 1.75 D) and, at 3 mm, stronger (0.30 vs 0.19) than on this bench.'
  },
  panoptixDesign: {
    kind: 'design',
    title: 'Clareon PanOptix Trifocal IOL — professional product information (light allocation); TFNT00 add powers',
    authors: 'Alcon (manufacturer)', venue: 'myalcon.com professional site; ClinicalTrials.gov protocol NCT03268746', year: 2025,
    link: 'https://www.myalcon.com/professional/cataract-surgery/iols/clareon-panoptix/', location: 'Product page; trial protocol device description',
    lenses: 'AcrySof IQ PanOptix TFNT00 / Clareon PanOptix',
    design: 'Manufacturer specification (not an independent measurement)',
    conditions: '3 mm pupil',
    results: ['Light allocation 50% distance / 25% intermediate / 25% near; 88% total light utilisation at 3 mm',
      'Add powers +2.17 D (intermediate, 60 cm) and +3.25 D (near, 40 cm) at the IOL plane'],
    points: [], transcription: 'Values transcribed from manufacturer text',
    limitations: 'Manufacturer claims, not independently verified. Used only as reference values for the generic trifocal demonstration — not as a PanOptix simulation, and not for the imported trifocal.'
  },
  borkenstein2021: {
    kind: 'optical',
    title: 'Optical Bench Analysis of 2 Depth of Focus Intraocular Lenses',
    authors: 'Borkenstein AF, Borkenstein EM, Luedtke H, Schmid R', venue: 'Biomedicine Hub 6(3):77–85', year: 2021,
    link: 'https://doi.org/10.1159/000519139', location: 'Results text; Table 1 (MTF/Strehl); Fig 6 (wavefront)',
    lenses: 'AcrySof IQ Vivity DFT015 and LuxSmart Crystal',
    design: 'Optical bench (OptiSpheric IOL PRO 2, WaveMaster IOL 2), ISO 11979, ISO-2 cornea',
    conditions: '546 nm; 3.0 and 4.5 mm apertures',
    results: ['Central part of Vivity: SA4-0 −1.01 λ, SA6-0 0.27 λ, SA10-0 −0.21 λ (aperture for these values not stated)'],
    points: [], transcription: 'Values transcribed from text',
    limitations: 'Only three terms for the central zone and no stated aperture: insufficient to reconstruct the full wavefront, so not used for rendering.'
  },
  niknahad2025: {
    kind: 'optical',
    title: 'Evaluation of Clareon Vivity and PureSee intraocular lenses: optical quality, depth of focus and misalignment effects',
    authors: 'Niknahad et al.', venue: 'Scientific Reports 15, 26943', year: 2025,
    link: 'https://doaj.org/article/19b733bb0da349d582a45f8e35506a31', location: 'Abstract only — full text not yet reviewed',
    lenses: 'Clareon Vivity and TECNIS PureSee',
    design: 'Optical bench per ISO 11979-2; MTF and USAF 1951; 0.5 mm decentration, 5° tilt',
    conditions: '3.0 and 4.5 mm apertures',
    results: [
      'Predicted VA at 0 D: Vivity −0.04, PureSee −0.05 logMAR; at −1.50 D: 0.05 vs 0.07 logMAR',
      'Both showed minimal halo patterns; decentration reduced optical quality for both'
    ],
    points: [], transcription: 'From search-index summary; NOT yet verified against full text',
    limitations: 'Needs full-text verification before use. Clareon Vivity is a different platform from AcrySof IQ Vivity.'
  },
  fdaSsedVivity: {
    kind: 'clinical',
    title: 'Summary of Safety and Effectiveness Data (SSED), PMA P930014/S126 — AcrySof IQ Vivity Extended Vision IOL',
    authors: 'US Food and Drug Administration; applicant Alcon Laboratories, Inc.', venue: 'FDA PMA database (public-domain US government document)', year: 2020,
    link: 'https://www.accessdata.fda.gov/cdrh_docs/pdf/P930014S126B.pdf', location: 'Figure 9 (p.45, mean with 95% CI) and Figure 10 (p.46, ±1 SD); text p.44',
    lenses: 'AcrySof IQ Vivity DFT015 (same randomised US trial as NCT03274986)',
    design: 'Prospective, randomised, controlled, multicentre; bilateral implantation; industry-sponsored. Binocular defocus curve: n = 106 Vivity subjects',
    conditions: 'Binocular, photopic, distance-corrected, 4 m, computerised CTS (M&S Technologies), logMAR; 6 months; all implanted',
    results: ['Mean binocular logMAR: −0.025 at 0 D; 0.066 at −1.0 D; 0.101 at −1.5 D; 0.195 at −2.0 D; 0.366 at −2.5 D',
      'Vivity better than monofocal from −1.0 D to −2.5 D (e.g. −2.0 D: 0.195 vs 0.380); monofocal better from +1.5 D to −0.5 D'],
    units: { defocus: 'D (spectacle plane, minus = near)', va: 'logMAR (binocular, distance corrected)' },
    errorBars: '95% confidence interval (Fig 9); SD from Fig 10',
    points: window.DEFOCUS_CURVES.vivity.points,
    transcription: 'Extracted from the vector drawing coordinates of Figs 9–10 by tools/extract_fda_defocus.py (axis calibration ±0.003 logMAR). Check passed: drawn 95% CI = 1.96·SD/√n at every point',
    limitations: 'Group mean of one sponsor trial; not an individual prediction. Same trial as the registry record, so not independent of it.'
  },
  fdaSsedSN60WF: {
    kind: 'clinical',
    title: 'Summary of Safety and Effectiveness Data (SSED), PMA P930014/S126 — monofocal control arm (AcrySof IQ SN60WF)',
    authors: 'US Food and Drug Administration; applicant Alcon Laboratories, Inc.', venue: 'FDA PMA database (public-domain US government document)', year: 2020,
    link: 'https://www.accessdata.fda.gov/cdrh_docs/pdf/P930014S126B.pdf', location: 'Figure 9 (p.45) and Figure 10 (p.46)',
    lenses: 'AcrySof IQ SN60WF monofocal (control arm)',
    design: 'Control arm of the same randomised trial; binocular defocus curve n = 111 subjects',
    conditions: 'Binocular, photopic, distance-corrected, 4 m, CTS, logMAR; 6 months; all implanted',
    results: ['Mean binocular logMAR: −0.078 at 0 D; 0.116 at −1.0 D; 0.251 at −1.5 D; 0.380 at −2.0 D; 0.540 at −2.5 D'],
    units: { defocus: 'D (spectacle plane, minus = near)', va: 'logMAR (binocular, distance corrected)' },
    errorBars: '95% confidence interval (Fig 9); SD from Fig 10',
    points: window.DEFOCUS_CURVES.monofocal.points,
    transcription: 'Extracted from vector drawing coordinates by tools/extract_fda_defocus.py; same checks as the Vivity curve',
    limitations: 'One specific monofocal model (SN60WF); shown for context only, not as data for the generic monofocal profile.'
  }
};

// Versioning: what version of each source was used, when it was retrieved, and the version of our record.
// Bump recordVersion (and note the change) whenever a record's values or handling change.
window.EVIDENCE_SET_VERSION = '1.2.0 (2026-10-25)';
{
const RETRIEVED = '2026-10-25';
const VERSIONS = {
  nct03274986: { sourceVersion: 'Registry results first posted 2020-04-07', recordVersion: '1.0' },
  auffarth2026: { sourceVersion: 'Version of record, Clin Ophthalmol 2026; 20', recordVersion: '1.1', changes: '1.1: Fig 3 digitised' },
  schmid2024: { sourceVersion: 'Version of record, published 2024-07-03', recordVersion: '1.2', changes: '1.1: Table 1 transcribed; 1.2: Fig 7 OPD digitised' },
  garzon2024: { sourceVersion: 'Article: version of record (Sep 2024). Dataset: Zenodo 10.5281/zenodo.18084296, published 2025-12-29 (no version label)', recordVersion: '1.0' },
  schmid2023: { sourceVersion: 'Version of record, published 2023-02-28', recordVersion: '1.0' },
  panoptixDesign: { sourceVersion: 'Manufacturer web page as retrieved (undated) + NCT03268746 protocol', recordVersion: '1.0' },
  borkenstein2021: { sourceVersion: 'Version of record, published 2021-09-27', recordVersion: '1.0' },
  niknahad2025: { sourceVersion: 'Abstract/index entry only (full text not reviewed)', recordVersion: '0.1' },
  fdaSsedVivity: { sourceVersion: 'SSED for PMA P930014/S126, FDA approval 2020-02-26', recordVersion: '1.0' },
  fdaSsedSN60WF: { sourceVersion: 'SSED for PMA P930014/S126, FDA approval 2020-02-26', recordVersion: '1.0' }
};
for (const [id, v] of Object.entries(VERSIONS)) window.EVIDENCE[id].version = Object.assign({ retrieved: RETRIEVED }, v);
}
