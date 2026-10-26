// Optical models used by the renderer. Each states whether it is lens-specific (measured) or a labelled assumption.
(function (root) {
  // Schmid & Borkenstein 2024, Table 1: TECNIS PureSee ZEN00V 22 D, WaveMaster IOL 2, 546 nm, 4.51 mm aperture.
  // Coefficients in µm. Convention verified as UNNORMALISED (peak-amplitude) Zernike: the RMS computed from
  // this table under that convention reproduces the paper's fitted RMS of 0.3046 µm (see validate.js).
  const PURESEE_ZERNIKE = [
    [2, 2, 0.008377], [2, -2, 0.013709], [3, 1, 0.044488], [3, -1, -0.03631],
    [4, 0, -0.657752], [3, 3, -0.013926], [3, -3, -0.003916], [4, 2, -0.005125], [4, -2, 0.003177],
    [5, 1, -0.025228], [5, -1, 0.003796], [6, 0, 0.202057], [4, 4, 0.002069], [4, -4, -0.001785],
    [5, 3, -0.001116], [5, -3, 0.002878], [6, 2, 0.0051], [6, -2, -0.000705], [7, 1, 0.016878],
    [7, -1, 0.001205], [8, 0, -0.076947], [5, 5, -0.004074], [5, -5, -0.003719], [6, 4, 0.011709],
    [6, -4, 0.000626], [7, 3, -0.003427], [7, -3, 0.002719], [8, 2, -0.00431], [8, -2, 0.001618],
    [9, 1, 0.00022], [9, -1, 0.016646], [10, 0, -0.083359]
  ].map(([n, m, c]) => ({ n, m, c }));
  // Excluded on purpose: tilt (A1±1, image shift only) and defocus A2,0 (focus reference, −0.0026 µm).

  // Ideal half-wave kinoform: order efficiency eta_m = sinc^2(0.5 - m) (scalar diffraction, design wavelength).
  const sinc2 = x => x === 0 ? 1 : (Math.sin(Math.PI * x) / (Math.PI * x)) ** 2;
  const BIFOCAL_ADD = 2.5; // spectacle-plane add (assumption, ≈ +3.0–3.25 D at IOL plane)
  // Orders -1..2 carry 90% of the light; the remaining ~3% per side (|m|>=2 beyond) is redistributed proportionally.
  const bifocalFoci = [-1, 0, 1, 2].map(m => ({ addD: m * BIFOCAL_ADD, weight: sinc2(0.5 - m) }));

  // Radial power profile (D vs IOL-plane radius in mm) -> OPD (µm) in the renderer's sign convention:
  // W(r) = -∫ (P - Pref) ρ dρ  (1 D × 1 mm² = 1 µm), trapezoidal integration, no smoothing.
  function opdFromPower(rMm, powerD, refD) {
    const w = [0];
    for (let i = 1; i < rMm.length; i++) {
      const a = (powerD[i - 1] - refD) * rMm[i - 1], b = (powerD[i] - refD) * rMm[i];
      w.push(w[i - 1] - (a + b) / 2 * (rMm[i] - rMm[i - 1]));
    }
    return w;
  }
  const VP = root.VIVITY_POWER_PROFILE;

  root.OPTICAL_MODELS = {
    aphakic: {
      kind: 'generic-assumption', label: 'Aphakic eye — no lens in the eye (natural lens removed, no IOL implanted)',
      // Missing ~+11 D of focusing power at the spectacle plane: every object is defocused by (vergence + 11 D).
      foci: [{ addD: -11, weight: 1 }],
      assumptions: ['Aphakic refraction of about +11 D at the spectacle plane, typical for an eye of average length (assumption; real values vary with eye length and cornea)',
        'No accommodation; otherwise an aberration-free eye (corneal aberrations not added)',
        'Shows uncorrected aphakia only — not a cataract, and not vision with aphakic spectacles or contact lenses']
    },
    monofocal: {
      kind: 'generic-assumption', label: 'Aberration-free monofocal IOL focused for distance',
      foci: [{ addD: 0, weight: 1 }],
      assumptions: ['Lens wavefront aberrations set to zero (diffraction-limited reference)', 'Corneal and other ocular aberrations not modelled']
    },
    bifocal: {
      kind: 'generic-assumption', label: 'Idealised diffractive bifocal (half-wave kinoform)',
      foci: bifocalFoci,
      assumptions: [`Near add ${BIFOCAL_ADD} D at spectacle plane (≈40 cm)`,
        'Light split from scalar diffraction theory for an ideal half-wave kinoform: 40.5% distance, 40.5% near, ~19% to other orders (defocused). Consistent with the equal far/near split described for full-aperture diffractive bifocals; no verified product-specific split was found',
        'Not any specific product']
    },
    trifocal: {
      kind: 'generic-assumption', label: 'Trifocal reference model using published PanOptix design values (incoherent three-focus model)',
      // Adds +2.17 / +3.25 D at the IOL plane (published), × 1.7/2.2 → +1.68 / +2.51 D at the spectacle plane (≈60 / 40 cm).
      // Split 50/25/25 of the 88% of light the manufacturer states is used at a 3 mm pupil; the other 12% is not modelled.
      foci: [{ addD: 0, weight: 0.44 }, { addD: 2.17 * 1.7 / 2.2, weight: 0.22 }, { addD: 3.25 * 1.7 / 2.2, weight: 0.22 }],
      assumptions: ['Adds +2.17 D / +3.25 D (IOL plane), converted to +1.68 / +2.51 D at the spectacle plane by the same 1.7/2.2 factor used elsewhere',
        'Light split 50/25/25 at 3 mm, with 88% total light use (manufacturer claim, not independently verified); applied at every pupil size',
        'The 12% of light not used by the three foci is omitted (the render is renormalised), so contrast loss may be understated',
        'Ideal foci: the lens\'s real diffraction pattern and aberrations are not modelled',
        'A generic trifocal demonstration that borrows published design values; it is not a validated PanOptix simulation and is not the imported lens']
    },
    vivity: VP && {
      kind: 'lens-specific-measured', label: 'Measured AcrySof IQ Vivity radial power profile (Garzón et al. 2024, open dataset)',
      // OPD in µm (lambdaUm 1, sign 1: already in renderer convention), from the +20 D NIMO profile relative to nominal 20 D.
      radialOpd: { lambdaUm: 1, sign: 1, rMm: VP.rMm, waves: opdFromPower(VP.rMm, VP.powerD, 20.0) },
      // Same IOL-plane -> entrance-pupil mapping as PureSee (sqrt(2.2/1.7)); data reach 2.24 mm at the IOL (5.1 mm pupil).
      pupilToIolScale: Math.sqrt(2.2 / 1.7),
      focusPerPupil: true,
      foci: [{ addD: 0, weight: 1 }],
      assumptions: ['Power profile of a +20 D lens (NIMO TR1504, 546 nm), mean of 10 measurements; ±0.03 D repeatability',
        'Rotationally symmetric; measured centred (no decentration or tilt)',
        'Profile converted to wavefront by radial integration; the instrument\'s spatial resolution may smooth the sharp zone edges of the design',
        'IOL-plane radius mapped to entrance pupil by sqrt(2.2/1.7), the same conversion used for PureSee',
        'Corneal aberrations not added; eye focused at the MTF peak for each pupil size',
        'Validated against an independent bench study of a 22 D Vivity (Schmid & Borkenstein 2023): see validate.js']
    },
    puresee: {
      kind: 'lens-specific-measured', label: 'Measured TECNIS PureSee radial wavefront (Schmid & Borkenstein 2024, Fig 7)',
      // Mean meridional OPD (red curve, Fig 7), digitised by tracing red pixels in the published image against the
      // gridlines (x: 154 px/mm; y: 214 px/wave); left and right halves averaged (they agree within 0.005 waves).
      // Used instead of the Table 1 Zernike fit: a 10th-order fit smooths the lens's sharp zone edge and, when
      // rendered, puts best focus at 3 mm and 4.5 mm 1.6 D apart, contradicting the paper's Fig 3A/3B.
      radialOpd: {
        lambdaUm: 0.546, sign: -1, // sign fixed by validate.js: the only choice placing near-side light on the near side
        rMm: Array.from({ length: 43 }, (_, i) => +(i * 0.05).toFixed(2)),
        waves: [0, -0.002, -0.007, -0.012, -0.016, -0.021, -0.026, -0.026, -0.026, -0.021, -0.012, 0.009, 0.044, 0.111,
          0.215, 0.343, 0.537, 0.773, 1.023, 1.232, 1.432, 1.561, 1.627, 1.661, 1.671, 1.671, 1.675, 1.678, 1.68, 1.678,
          1.671, 1.658, 1.639, 1.607, 1.567, 1.519, 1.453, 1.371, 1.277, 1.182, 1.061, 0.928, 0.814]
      },
      zernikeTable: PURESEE_ZERNIKE, // kept for traceability; not used for rendering (see above)
      // Entrance-pupil radius = IOL-plane radius × sqrt(2.2/1.7), from the paper's own IOL→spectacle depth-of-focus
      // conversion (2.2 D → 1.7 D) and conservation of optical path difference. Data reach 2.1 mm at the IOL,
      // i.e. a 4.78 mm entrance pupil; larger pupils would need extrapolation and are not used.
      pupilToIolScale: Math.sqrt(2.2 / 1.7),
      // Best focus: the through-focus MTF peak (50 lp/mm) for the environment's pupil, found at render time
      // (+0.19 D at 3 mm IOL aperture). Per-pupil focus reproduces the bench finding (Fig 3A vs 3B) that the
      // peak does not move with aperture; the uncorrected model would drift −0.5 D (IOL plane) at 4.2 mm.
      focusPerPupil: true,
      foci: [{ addD: 0, weight: 1 }],
      assumptions: ['Single 22 D lens measured on a bench at 546 nm; one sample, power-dependence not modelled',
        'Rotationally averaged (meridional) wavefront; non-symmetric aberrations omitted',
        'Bench wavefront treated as the whole-eye wavefront; corneal aberrations not added',
        'IOL-plane radius mapped to entrance pupil by sqrt(2.2/1.7), derived from the paper',
        'Wavefront digitised from a published figure (≈ ±0.01 wave tracing precision)',
        'Eye focused at the MTF peak for each pupil size (matches bench Fig 3A/3B)',
        'Validation: 3 mm through-focus MTF peak 0.38 vs bench 0.41, near-side secondary 0.13 vs 0.09 at +2.1 D; at 4.2 mm the model peak (0.33) is lower and broader than the bench (0.61), so night distance clarity may be understated']
    }
  };

  // Versioning: bump modelVersion whenever a model's data or assumptions change, and say what changed.
  const V = {
    aphakic: { modelVersion: '1.0', date: '2026-10-25', derivedFrom: 'assumption (+11 D aphakic refraction)' },
    monofocal: { modelVersion: '1.0', date: '2026-10-25', derivedFrom: 'physics only (aberration-free lens)' },
    bifocal: { modelVersion: '1.1', date: '2026-10-25', derivedFrom: 'scalar diffraction theory', changes: '1.1: orders −1..2 only, renormalised' },
    trifocal: { modelVersion: '2.0', date: '2026-10-25', derivedFrom: 'panoptixDesign', changes: '2.0: published add powers and 88% light use replaced assumed values' },
    vivity: { modelVersion: '1.0', date: '2026-10-25', derivedFrom: 'garzon2024 (data/vivityPowerProfile.js via tools/extract_vivity.py); validated against schmid2023' },
    puresee: { modelVersion: '2.1', date: '2026-10-25', derivedFrom: 'schmid2024 Fig 7', changes: '2.0: Fig 7 radial OPD replaced Zernike fit; 2.1: per-pupil best focus' }
  };
  for (const [id, v] of Object.entries(V)) if (root.OPTICAL_MODELS[id]) root.OPTICAL_MODELS[id].version = v;
})(this);
