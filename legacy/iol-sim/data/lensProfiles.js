// Lens profile registry. `optical` names an entry in OPTICAL_MODELS (null = not rendered).
// `renderKind`: 'lens-specific' (measured optical data for this model), 'generic' (labelled generic demonstration), null.
window.LENS_PROFILES = [
  { id: 'none', name: 'No IOL selected (aphakic eye)', model: 'Natural lens removed, no implant',
    status: 'partial', statusText: 'Physical reference; illustrative rendering', optical: 'aphakic', renderKind: 'reference',
    summary: 'What the eye sees with no lens inside it: about 11 D of focusing power is missing, so near and far are all strongly blurred. A baseline that shows why an IOL is needed.',
    defocusCurves: [], opticalProfiles: [], references: [] },
  { id: 'monofocal', name: 'Monofocal', model: 'Generic distance-focused monofocal (reference profile)',
    status: 'partial', statusText: 'Generic reference; illustrative rendering', optical: 'monofocal', renderKind: 'generic',
    summary: 'Sharp at distance; near and intermediate objects defocused. Rendered as an aberration-free lens, so real eyes will look somewhat softer.',
    defocusCurves: [], opticalProfiles: [], references: [],
    related: [{ id: 'fdaSsedSN60WF', note: 'Clinical defocus curve of one specific monofocal (SN60WF) — context only, not data for this generic profile' },
      { id: 'nct03274986', note: 'SN60WF control arm only — a specific monofocal model, not this generic profile' }] },
  { id: 'edof', name: 'EDOF (generic)', model: 'Generic extended depth of focus',
    status: 'insufficient', statusText: 'Evidence insufficient; profile not yet rendered', optical: null, renderKind: null,
    summary: 'EDOF lenses use different principles (spherical-aberration, diffractive, wavefront-shaping), so no single generic optical model is defensible. See the PureSee profile for a measured EDOF example.',
    defocusCurves: [], opticalProfiles: [], references: [] },
  { id: 'puresee', name: 'Premium EDOF — TECNIS PureSee', model: 'TECNIS PureSee (ZEN00V / DEN00V)',
    status: 'available', statusText: 'Evidence available and traceable; approximate rendering', optical: 'puresee', renderKind: 'lens-specific',
    summary: 'Rendered from a published bench wavefront of this lens model, validated against the same paper\'s through-focus MTF. Clinical defocus curve shown separately for comparison.',
    defocusCurves: ['auffarth2026'], opticalProfiles: ['schmid2024'], references: ['auffarth2026', 'schmid2024', 'niknahad2025'] },
  { id: 'vivity', name: 'Premium EDOF — Alcon Vivity', model: 'Alcon AcrySof IQ Vivity (DFT015)',
    status: 'available', statusText: 'Evidence available and traceable; approximate rendering', optical: 'vivity', renderKind: 'lens-specific',
    summary: 'Rendered from an open dataset of measured power profiles for this lens model, checked against an independent bench study. Randomised clinical results are shown separately.',
    defocusCurves: ['fdaSsedVivity', 'nct03274986'], opticalProfiles: ['garzon2024', 'schmid2023'],
    references: ['fdaSsedVivity', 'nct03274986', 'garzon2024', 'schmid2023', 'borkenstein2021'],
    related: [{ id: 'niknahad2025', note: 'Tests Clareon Vivity — a different platform version; not used as AcrySof IQ Vivity evidence' }] },
  { id: 'multifocal', name: 'Multifocal / bifocal', model: 'Generic diffractive bifocal (distance + near)',
    status: 'partial', statusText: 'Generic demonstration; not product-specific', optical: 'bifocal', renderKind: 'generic',
    summary: 'Textbook diffractive bifocal: light is split between distance and near foci, so each object is seen as a sharp image plus a faint defocused copy.',
    defocusCurves: [], opticalProfiles: [], references: [] },
  { id: 'trifocal', name: 'Trifocal', model: 'Generic trifocal (distance + intermediate + near)',
    status: 'partial', statusText: 'Generic demonstration; not product-specific', optical: 'trifocal', renderKind: 'generic',
    summary: 'Idealised three-focus lens using published design values of one commercial trifocal (add powers, light split). A generic demonstration, not a simulation of that product.',
    defocusCurves: [], opticalProfiles: [], references: ['panoptixDesign'] },
  { id: 'imported', name: 'Imported trifocal — model not confirmed', model: 'Unconfirmed manufacturer/model',
    status: 'insufficient', statusText: 'Evidence insufficient; profile not yet rendered', optical: null, renderKind: null,
    summary: 'Exact make/model must be confirmed. Not treated as PanOptix or any other product. Use the generic Trifocal profile for a generic demonstration.',
    defocusCurves: [], opticalProfiles: [], references: [] }
];

// Per-effect evidence (problem statement §5C): blur, contrast loss, halo/glare and colour each have their own status,
// basis and evidence. In the renderer, blur, contrast loss and halos are not separate dials: all three come from the
// same point-spread function, so they share an optical basis. Each effect still lists its own supporting
// (or corroborating) evidence. status: 'modelled' | 'not modelled' | 'not rendered'.
{
  const NOT_RENDERED = { status: 'not rendered', basis: 'Profile not rendered: insufficient evidence', evidence: [] };
  const NO_COLOUR = { status: 'not modelled', basis: 'Monochromatic model (555 nm); no evidence of a lens-specific colour shift has been loaded, so none is applied', evidence: [] };
  const E = {
    none: {
      blur: { status: 'modelled', basis: 'Defocus of about +11 D (assumed aphakic refraction) through an ideal pupil', evidence: [] },
      contrast: { status: 'modelled', basis: 'Follows from the same defocused PSF', evidence: [] },
      halo: { status: 'modelled', basis: 'Lights spread into large blur discs by the same defocus; no lens-specific halo', evidence: [] },
      colour: NO_COLOUR },
    monofocal: {
      blur: { status: 'modelled', basis: 'Diffraction-limited lens + defocus for each depth layer (generic)', evidence: [] },
      contrast: { status: 'modelled', basis: 'Follows from the same PSF; corneal aberrations and scatter not added', evidence: [] },
      halo: { status: 'modelled', basis: 'Only what defocus and diffraction produce; no halo design feature', evidence: [] },
      colour: NO_COLOUR },
    edof: { blur: NOT_RENDERED, contrast: NOT_RENDERED, halo: NOT_RENDERED, colour: NOT_RENDERED },
    puresee: {
      blur: { status: 'modelled', basis: 'Measured radial wavefront (Fig 7) + defocus; validated against bench through-focus MTF', evidence: ['schmid2024'] },
      contrast: { status: 'modelled', basis: 'Follows from the same PSF; bench MTF used as the check', evidence: ['schmid2024'] },
      halo: { status: 'modelled', basis: 'Light spread by the measured wavefront at the night pupil (4.5 mm). No clinical halo data loaded for this lens; bench halo reports not yet verified', evidence: ['schmid2024', 'niknahad2025'] },
      colour: NO_COLOUR },
    vivity: {
      blur: { status: 'modelled', basis: 'Measured power profile integrated to a wavefront + defocus; checked against an independent bench', evidence: ['garzon2024', 'schmid2023'] },
      contrast: { status: 'modelled', basis: 'Follows from the same PSF. Clinical corroboration: mesopic contrast sensitivity lower than the monofocal at 6–12 cpd', evidence: ['garzon2024', 'nct03274986'] },
      halo: { status: 'modelled', basis: 'From the same PSF at the night pupil. Clinical corroboration: severe halos 0.9% in both Vivity and monofocal groups', evidence: ['garzon2024', 'nct03274986'] },
      colour: NO_COLOUR },
    multifocal: {
      blur: { status: 'modelled', basis: 'Ideal diffractive bifocal: weighted sum of in-focus and defocused images (scalar diffraction theory)', evidence: [] },
      contrast: { status: 'modelled', basis: 'Loss from light sent to the out-of-focus order, from the same PSF', evidence: [] },
      halo: { status: 'modelled', basis: 'Defocused near-focus light forms a ring of light around bright sources (same PSF); generic, not product-specific', evidence: [] },
      colour: NO_COLOUR },
    trifocal: {
      blur: { status: 'modelled', basis: 'Three ideal foci with published add powers and light split', evidence: ['panoptixDesign'] },
      contrast: { status: 'modelled', basis: 'Light split across three foci reduces contrast (same PSF); the 12% of light not used by the foci is omitted', evidence: ['panoptixDesign'] },
      halo: { status: 'modelled', basis: 'Defocused intermediate and near light around bright sources (same PSF); generic', evidence: ['panoptixDesign'] },
      colour: NO_COLOUR },
    imported: { blur: NOT_RENDERED, contrast: NOT_RENDERED, halo: NOT_RENDERED, colour: NOT_RENDERED }
  };
  for (const p of window.LENS_PROFILES) p.effects = E[p.id];
}

// Fixed per-environment viewing assumptions (documented in the methodology panel).
// Source photos and licences: assets/ATTRIBUTION.md. Layers: tools/prepare_scenes.py (hand-traced masks).
window.ENVIRONMENTS = [
  { id: 'day', name: 'Daytime / Everyday', pupilMm: 3.0, lambdaUm: 0.555, fovDeg: 50, hdrGain: 1,
    credit: 'Photo: Vincent Desjardins, “Chicago (ILL) Downtown, Cab 133 ‘inside 6’”, Flickr — CC BY 2.0 (one number plate blurred; split into layers)',
    layers: [
      { id: 'street', label: 'Far — street, vehicles and buildings through the windshield (≥ ~5 m, modelled as 10 m)', distanceM: 10, file: 'assets/layers/day_street.png' },
      { id: 'interior', label: 'Intermediate — dashboard, fare meter, mirror, steering wheel (~0.8–1.0 m, modelled as 0.9 m)', distanceM: 0.9, file: 'assets/layers/day_interior.png' }],
    notes: ['Photopic pupil 3.0 mm (assumption)',
      'Taken from behind the front seats; depths are estimates from the scene geometry',
      'The photo has no reading-distance (≈40 cm) target, so near vision is not shown in this scene'] },
  { id: 'night', name: 'Night Driving', pupilMm: 4.5, lambdaUm: 0.555, fovDeg: 50, hdrGain: 25,
    credit: 'Photo: Jonashtand, “Driving at night on Crete 01”, Wikimedia Commons — CC BY-SA 4.0 (number plates blurred; split into layers)',
    layers: [
      { id: 'street', label: 'Street, vehicles and lights (all ≥ ~6 m, modelled as 15 m)', distanceM: 15,
        file: 'assets/layers/night_street.png', emissive: 'assets/layers/night_lights.png' }],
    notes: ['Mesopic pupil 4.5 mm (assumption; pseudophakic pupils at night commonly ~4–5 mm; also keeps the PureSee measured wavefront within its 4.78 mm data limit)',
      'Light sources = pixels clipped in the photo (brightest channel ≥ 245/255); they are added back at 25× display white before blur, then clipped. Real headlight-to-road luminance ratios are far larger; this fixed ratio is identical for every lens, so halo comparisons are like-for-like but not absolute.',
      'The photo is taken from road level without a dashboard, so night intermediate vision (instruments) is not shown'] }
];
