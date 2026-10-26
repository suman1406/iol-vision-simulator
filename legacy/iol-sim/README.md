# IOL Vision Simulator (prototype)

Clinician-led patient-education tool. Illustrative only — not an acuity test, diagnostic, recommender, or individual prediction.

## Run

Serve the folder over http. Opening `index.html` directly from disk will not work, because browsers block reading pixels from local image files:

```bash
python -m http.server 8123 --directory iol-sim
```

Then open http://localhost:8123. A profile's first render takes about 4–5 s; after that it is cached.

Optical engine checks: `node validate.js`.

## Structure

| File | Role |
|---|---|
| `data/lensProfiles.js` | Profiles, evidence status, links to evidence and optical model; environments (pupil, wavelength, field of view, HDR gain) |
| `data/evidence.js` | Source records: citation, design, conditions, results, digitised curve points, data handling, limitations |
| `data/opticalModels.js` | Optical models used for rendering, each with its assumptions |
| `optics.js` | Fourier-optics PSF (pupil function → FFT → PSF), multi-focus incoherent sum, MTF, best-focus search |
| `render.js` | Depth-layer convolution in linear light (FFT), far→near compositing |
| `scene.js` | Loads the fixed photographic depth layers declared in `ENVIRONMENTS` |
| `assets/source/` | Original photographs (see `assets/ATTRIBUTION.md` for licences) |
| `assets/layers/` | Depth layers and the night light-source layer, produced by `tools/prepare_scenes.py` |
| `tools/prepare_scenes.py` | Reproducible layer split: hand-traced polygon masks, number-plate blurring, light-source extraction |
| `app.js` | UI: two selectors, simulation view, methodology/evidence modal |
| `validate.js` | Checks against analytic theory and published bench data |

## Rendering method (same for every profile)

1. Pupil wavefront = lens wavefront (if measured) + defocus for the layer's vergence and each lens focus.
2. PSF = |FFT(pupil function)|², summed over foci by light weight, binned to screen pixels (50° across 960 px).
3. Each depth layer is convolved with its PSF in linear light and composited far → near. Halos and contrast loss come only from the PSF. No colour shift is applied (the model is monochromatic, 555 nm, and no colour evidence has been loaded).

Clinical defocus curves are stored and shown as clinical evidence. They are **not** converted to blur.

## Scenes

| Environment | Photo | Licence | Depth layers |
|---|---|---|---|
| Daytime | Chicago street seen from inside a taxi: dashboard, fare meter, mirror, traffic and buildings (Vincent Desjardins, Flickr) | CC BY 2.0 | Street through the windshield ~10 m; interior ~0.9 m |
| Night driving | Street in Crete at dusk/night, with streetlights, headlights and signs (Jonashtand, Wikimedia) | CC BY-SA 4.0 | One layer: everything is ≥ ~6 m away (modelled as 15 m). Clipped light pixels become the HDR light layer |

Limitations of the photos:

- Photos were chosen to be sharp. Candidates with background bokeh, long-exposure light trails or starburst spikes were rejected, because those would build fake blur or glare into every profile.
- Neither scene contains a 40 cm reading target, so near vision is not shown.
- The night photo has no dashboard, so night intermediate vision is not shown.
- Small camera artefacts remain in the originals: a faint flare streak and a slight spike on one headlight in the night photo.
- Depths are estimates, not measurements.
- Masks were traced by hand and are approximate at object edges.

To regenerate the layers: `python tools/prepare_scenes.py` (requires Pillow).

## Profiles

| Profile | Status | Rendering |
|---|---|---|
| No IOL selected (aphakic eye) | Physical reference (default) | No lens in the eye: everything defocused by about +11 D (assumed typical aphakic refraction). Not a cataract simulation |
| Monofocal | Generic reference | Aberration-free lens, distance focus |
| EDOF (generic) | Insufficient | Not rendered (EDOF designs differ too much for one generic model) |
| TECNIS PureSee | Evidence available, approximate | Measured radial wavefront (Schmid & Borkenstein 2024, Fig 7), digitised |
| Alcon Vivity | Evidence available, approximate | Measured radial power profile of a +20 D lens (Garzón et al. 2024, open CC BY 4.0 dataset), integrated to a wavefront |
| Multifocal / bifocal | Generic demonstration | Ideal half-wave diffractive kinoform, +2.5 D add, sinc² order efficiencies (textbook; no verified product-specific split found) |
| Trifocal | Generic demonstration | 3 foci using published PanOptix design values: +2.17 / +3.25 D at the IOL plane, 50/25/25 split, 88% light use (manufacturer claims). Labelled generic, not a PanOptix simulation |
| Imported trifocal | Insufficient | Not rendered until the model is confirmed |

## Evidence and digitisation

- **Vivity clinical:** NCT03274986 registry results (randomised, n=107/111), values transcribed.
- **Vivity defocus curve:** binocular means at 11 steps (+1.5 to −2.5 D), with 95% CI and SD. Taken from the FDA Summary of Safety and Effectiveness Data, PMA P930014/S126, Figs 9–10 (same trial; n = 106 Vivity, 111 SN60WF). The figures are vector graphics, so `tools/extract_fda_defocus.py` reads the values from the drawing coordinates, accurate to ±0.003 logMAR. Check: the drawn 95% CI equals 1.96·SD/√n at every point. The SN60WF control curve is shown under Monofocal for context only.
- **Vivity optical:** Garzón 2024 dataset (`data/source/`). `tools/extract_vivity.py` averages the 10 measurements and both half-meridians, with no smoothing. Schmid & Borkenstein 2023 (22 D bench) is used only for validation. Borkenstein 2021 is recorded but not used.
- **Trifocal reference values:** Alcon product information and the NCT03268746 protocol (manufacturer claims).
- **PureSee clinical:** Auffarth 2026. Defocus curve digitised manually from Fig 3 (±0.02 logMAR); the type of error bar is not stated in the source.
- **PureSee optical:** Schmid & Borkenstein 2024.
  - Table 1 (34 Zernike terms) transcribed. Its normalisation was inferred as unnormalised because that reproduces the paper's RMS (0.307 vs 0.3046 µm).
  - Fig 7 radial OPD digitised by tracing red pixels against the gridlines. The two halves agree within 0.005 waves.
  - The Zernike fit is **not** used: rendered, it contradicts the paper's own MTF at 3 mm vs 4.5 mm.
- **Niknahad 2025:** recorded from its abstract only; the full text has not been verified.
- **Q1 journal status:** not checked for any source.

## Per-effect evidence

Each profile's methodology panel has a table that gives blur, contrast loss, halo/glare and colour/red shift their own status, basis and evidence (problem statement §5C). The data is in `LENS_PROFILES[].effects` in `data/lensProfiles.js`.

- **Blur, contrast and halos:** these are not independent settings. All three follow from one computed point-spread function, so none can be exaggerated on its own. Clinical data that corroborate them are listed where available, e.g. Vivity's mesopic contrast sensitivity and halo rates from the registry.
- **Colour / red shift:** not modelled for any profile, because no evidence for it has been loaded.

## Versioning

- **Evidence records** (`data/evidence.js`): each has `version.sourceVersion` (which edition of the source was used), `retrieved` (date) and `recordVersion` (our record, with a change note). `EVIDENCE_SET_VERSION` versions the whole set.
- **Optical models** (`data/opticalModels.js`): each has `version.modelVersion`, a date, what it was derived from, and a change note.
- **Generated data files:** `data/vivityPowerProfile.js` and `data/defocusCurves.js` are rebuilt from the stored source files by scripts in `tools/`.
- **Visibility and enforcement:** all of this appears in the methodology panel. `validate.js` fails the integrity check if any record or model lacks a version.

## Layout

Tested at 768×1024 and 820×1180 (tablet portrait), 1024×768 and 1180×820 (tablet landscape), and 1440×900 (desktop):

- No horizontal or vertical scrolling at any of these sizes.
- The image fills the space between the controls and the disclaimer.
- Controls are 44 px tall for touch.
- The methodology panel keeps its Close button pinned at the top, and also closes with a tap outside it.

## Validation (`node validate.js`)

- Data integrity: every referenced source exists, every profile has all four effect records, and every source record and model is versioned.
- Diffraction-limited MTF: 0.807 vs analytic 0.807.
- PureSee through-focus MTF at a 3 mm IOL aperture: peak 0.38 (bench 0.41); near-side secondary 0.13 at +2.1 D (bench 0.09 at +2.1 D).
- At a 4.2 mm aperture, the model's peak is lower and broader than the bench (0.33 vs 0.61), so PureSee night distance clarity may be understated.
- Vivity vs an independent bench (Schmid & Borkenstein 2023):
  - Distance peaks match: 0.33 vs 0.325 at 3 mm, and 0.39 vs 0.35 at 4.5 mm.
  - The intermediate peak sits about 1.3–1.4 D from distance, vs 1.75 D on the bench.
  - At 3 mm, the intermediate peak is stronger than measured (0.30 vs 0.19), so Vivity intermediate vision may be overstated.

## Key assumptions (need clinical advisor review)

- Pupil size: 3.0 mm by day, 4.5 mm at night. Single wavelength (555 nm). No corneal aberrations, scatter, or neural factors.
- IOL-plane radius = entrance-pupil radius / √(2.2/1.7), derived from the paper's IOL-to-spectacle depth-of-focus conversion.
- Eye focused at the MTF peak for the given pupil size.
- Night lamps are 25× display white before clipping, the same for every lens. Real luminance ratios are far higher.
- Generic bifocal/trifocal adds and light splits are labelled assumptions, not products.
- Depth is represented by a few discrete layers with hand-traced masks, so occlusion edges are approximate.

## Open items

1. Commission or source a photo with a true near target (book or phone at ~40 cm) plus intermediate and far content, and a night photo taken from the driver's seat that shows the dashboard. Each can drop in through `prepare_scenes.py`.
2. Confirm the imported trifocal's make and model, then source its data.
3. Best route to better scenes: take two photos at the clinic, which avoids licensing and gives true depths. (a) Daytime from the driver's or a desk seat, with a phone or book at ~40 cm, a screen or dashboard at ~60–70 cm, and a street beyond. (b) Night from the driver's seat, on a tripod at a short exposure, so there are no light trails or starbursts. Each drops in through `tools/prepare_scenes.py`.
4. Verify Niknahad 2025 against its full text. Check Q1 status if it is a project requirement.
5. Ophthalmologist review of the assumptions, wording, and disclaimer before any patient use.
