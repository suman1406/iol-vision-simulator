# IOL Vision Simulation Tool — Developer Problem Statement

## 1. Project Overview

Build a web-based intraocular lens (IOL) vision simulator that helps an ophthalmologist explain how different IOL designs may affect a patient's visual experience across common viewing situations.

The doctor should be able to select an IOL profile and an environment. The simulator should render the same reference scene differently according to the selected lens profile, so that a patient can compare the *illustrative* visual characteristics associated with each lens type.

The goal is a simple, realistic, doctor-led patient-education tool—not a generic image-blur demo. The rendering should be driven by traceable clinical and optical evidence wherever suitable data are available. Unsupported blur, red-shift, halo, glare, or other effects must not be invented and presented as real lens behaviour.

**Initial intended use:** patient education and discussion during an ophthalmology consultation. The first version is not an eyesight test, diagnostic tool, automated lens recommender, or validated predictor of an individual patient's postoperative result.

## 2. Main Function of the Tool

The core workflow should be:

1. The doctor selects an IOL profile.
2. The doctor selects a viewing environment.
3. The application displays the selected environment through the chosen simulation profile.
4. The doctor can switch profiles while keeping the environment and source image fixed, enabling a like-for-like comparison.
5. The doctor can explain that the output is illustrative and that real outcomes vary by patient, eye, lens model, and clinical factors.

Keep the initial UI limited to **two primary controls**:
- **IOL / lens profile**
- **Environment**

Do not add dashboards, metrics charts, debug target inspectors, arbitrary effect-strength sliders, cataract overlays, unnecessary settings, or other controls that distract from this workflow.

## 3. Lens Profiles to Include

Provide these selectable categories/profiles:

1. **Monofocal**
2. **EDOF** — extended depth of focus
3. **Premium EDOF — TECNIS PureSee**
4. **Premium EDOF — Alcon Vivity**
5. **Multifocal / bifocal** — distance and near
6. **Trifocal** — distance, intermediate, and near
7. **Imported trifocal** — exact make/model to be confirmed

PureSee and Vivity must be separate selectable profiles; do not merge them into a single generic Premium EDOF rendering.

The imported trifocal must not be silently treated as PanOptix or another product. Until the exact manufacturer and model are confirmed, label it as “Imported trifocal — model not confirmed” and either leave its evidence-based simulation unavailable or clearly mark any generic demonstration as generic rather than product-specific.

Each profile should have a source/evidence record and a clear status, such as:
- Evidence available and traceable
- Partial evidence; limited illustrative rendering
- Evidence insufficient; profile not yet rendered

Do not show fabricated data or imply that a profile has been clinically validated when it has not.

## 4. Required Viewing Environments

### Environment A — Daytime / Everyday Scene (initial priority)

Create one high-quality, photorealistic daytime scene to use for all lens profiles. It should include meaningful targets at different distances:
- **Far distance:** objects/signage with clear edges and moderate detail
- **Intermediate distance:** people or objects at conversational / screen distance
- **Near distance:** a book, phone, product label, or other near object

Use one fixed source image for every lens comparison in this environment. Do not generate a different scene for each lens. Avoid relying on tiny AI-generated text as a measurement target because generated text may be inaccurate or illegible.

Suggested scene: a realistic everyday public or indoor environment with near, intermediate, and far objects visible together. The scene should have adequate lighting, varied textures, and high-contrast as well as lower-contrast detail.

### Environment B — Night Driving (second priority)

Create a separate, photorealistic night-driving scene with:
- Road and lane markings
- Distant headlights and streetlights
- Vehicles at different distances
- Road signs or other structured targets
- Both bright point lights and darker surrounding regions

Use one fixed night scene across all lens profiles. Do not use a vector/SVG road illustration as the main scene if the objective is realistic patient-facing simulation. SVG is fine for UI elements and masks, but the environment itself should be a consistent photorealistic source image.

Night driving is a separate environment, not a different source image for each lens. Include this environment after a defensible rendering method for night effects is available.

### Future environments (optional, not required for first prototype)

Consider additional scenes only if they serve a defined patient-education need and suitable evidence exists—for example, reading, computer/screen use, or low-contrast everyday tasks. Do not expand the environment list without a clear use case.

## 5. Defocus Curves and Evidence-Driven Rendering

A major requirement is to use **lens-specific clinical defocus curves** as evidence for how visual performance changes with defocus. Research and collect curves for the exact lens model wherever available. Each data set must retain its source citation and provenance.

However, a clinical defocus curve (typically visual acuity versus induced defocus in diopters) does **not directly define a pixel blur radius, a red-shift, a halo diameter, or a unique point-spread function**. Therefore, do not directly convert defocus-curve points into arbitrary blur amounts or colour filters.

The implementation must separate the following:

### A. Clinical defocus model

- Store defocus-curve data for each supported lens profile.
- Preserve the defocus values, visual-acuity values and units, test conditions, study details, sample size, uncertainty where reported, and source figure/table.
- Identify whether values were transcribed from a table or digitised from a published graph.
- Record the digitisation method and uncertainty if curve points are extracted from figures.
- Use these curves to represent relative through-focus visual performance and to inform the simulation design, not as a direct pixel-blur lookup table.
- Do not invent missing curve points, extrapolate without labelling it, or treat group-average clinical results as an individual patient's outcome.

### B. Optical rendering model

To generate defensible image blur and light-spread effects, investigate whether suitable lens-specific optical data are available, such as:
- Through-focus point-spread function (PSF)
- Modulation transfer function (MTF) and/or optical transfer function (OTF)
- Wavefront or other optical bench measurements
- Relevant published optical simulations with clearly described methods

Use these data only within the limits of the source and its assumptions. An MTF curve alone may not uniquely determine a PSF because phase information and other assumptions can matter. If appropriate optical data are unavailable, do not claim that the rendered blur is physically accurate for that lens.

### C. Blur, halos, glare and colour/red-shift

- Blur should be generated using a documented optical or image-formation method, not broad horizontal bands or a generic whole-image blur that is unrelated to lens evidence.
- Halo and glare effects should be included only where there is suitable lens-specific evidence and a defensible rendering method. Avoid decorative concentric circles around lights.
- **Red-shift / colour shift:** do not apply a red tint or colour shift merely because the defocus curve suggests reduced visual acuity. A colour shift is a separate optical/visual phenomenon and requires independent evidence for the lens and conditions. If no evidence supports it, omit it.
- Keep colour rendering, blur, contrast loss, and halo/glare as separate parameters with separate evidence records; do not bundle them into one arbitrary “lens effect.”
- Use depth-aware scene layers or depth maps if different distances must be affected differently. Do not assume that a single blur on the entire image can represent near, intermediate, and far vision simultaneously.
- Any approximation must be labelled as an approximation in the methodology panel.

### D. Evidence traceability

For every curve or optical data set, record:
- Full paper title and authors
- Journal, publication year, DOI or stable link
- Relevant figure/table/page
- Lens model and version
- Study design and sample size
- Testing conditions and units
- Whether the journal's Q1 status was checked for the relevant year/category, if Q1 ranking is a project requirement
- Any data digitisation, transformations, assumptions, and limitations

Do not use a paper for a different lens model as if it describes the selected lens. A general lens category can be used only for a clearly labelled generic reference profile.

## 6. Image and Rendering Requirements

- Use the same source image for all lens profiles within a given environment.
- Keep the base scene unchanged when switching profiles.
- Apply the profile's rendering parameters to the source scene in a consistent and repeatable manner.
- Prefer a layered/depth-aware scene with clear near, intermediate, and far regions.
- Do not rely on AI-generated embedded text for acuity measurement.
- Avoid obvious rendering artefacts such as horizontal blur bands, artificial circular rings, fake text, or inconsistent scene changes.
- Do not use arbitrary numerical blur strengths or colour values without a documented basis.
- Keep the scene photorealistic and the resulting differences subtle enough to remain plausible, while avoiding claims of clinical realism unless validated.
- Add a source/methodology view that explains which data support a profile and which aspects remain illustrative.

## 7. UI and Interaction Requirements

The initial screen should contain:
- Lens profile selector
- Environment selector
- Main simulation view
- A concise disclaimer
- A methodology/evidence detail view (for example, a modal or expandable panel)

Suggested disclaimer:

> Illustrative visual simulation only. Not a visual-acuity test or a clinically validated prediction of an individual's postoperative vision. Actual outcomes vary. Lens-specific effects are shown only to the extent supported by available evidence.

Do not display:
- Clinical-data-loaded badges unless the exact data source is visible and verified
- Fake accuracy percentages or clinical scores
- Unsupported trial claims
- Unnecessary controls such as effect strength, cataract toggle, debug inspectors, or playback controls for a static image
- Charts or metrics dashboards in the main interface

## 8. Technical Implementation Expectations

The developers may choose the final stack, but the implementation should support:
- A maintainable lens-profile data structure
- Separate clinical defocus data and optical-rendering data
- Reproducible rendering settings per profile and environment
- Source provenance and versioning for every data set
- Graceful handling of missing evidence
- Responsive desktop/tablet UI suitable for clinician-led consultation
- A clear separation between source images, lens profile data, and rendering code

Possible architecture:
- `lensProfiles`: names, lens models, evidence status, references
- `defocusCurves`: defocus values, visual-acuity values, units, study metadata
- `opticalProfiles`: supported PSF/MTF/OTF or other optical data, measurement conditions, source references
- `environmentScenes`: fixed source image, depth map/layers, target regions, lighting metadata
- `renderingMethod`: transformations applied, parameters, assumptions, and limitations

These are conceptual data groups, not a requirement to use these exact code names or a particular framework.

## 9. Expected Deliverable / Outcome

Deliver a working prototype that:
1. Lets the clinician select one of the specified IOL profiles.
2. Lets the clinician select the daytime scene and, when implemented, the night-driving scene.
3. Shows the same source scene consistently across lens comparisons.
4. Applies only evidence-supported or explicitly labelled approximate rendering effects.
5. Uses clinical defocus curves as clinical performance evidence, while using suitable optical evidence and a documented model for actual image blur and light spread.
6. Avoids invented blur, halos, glare, or red-shift.
7. Makes the evidence and limitations of each profile inspectable.
8. Clearly communicates that the simulation is an educational aid and not a diagnostic or individualized predictive tool.

## 10. Out of Scope for the Initial Version

- Measuring a patient's visual acuity
- Diagnosing eye disease
- Recommending an IOL automatically
- Predicting an individual patient's exact postoperative vision
- Claiming clinical validation without a validation study
- Treating group-average defocus curves as individual predictions
- Simulating effects for an exact lens model without adequate evidence

Any future move into clinical measurement, treatment guidance, or individualized prediction must be treated as a separate project phase with defined clinical protocols, validation, and regulatory review.

## 11. Open Items for the Project Owner / Clinical Advisor

1. Confirm the manufacturer and exact model of the imported trifocal.
2. Confirm whether a generic trifocal reference profile is acceptable while the imported lens is unidentified.
3. Agree on the first daytime scene and whether night driving is required in the first release or a later phase.
4. Identify which lens profiles have traceable defocus curves and which have usable optical bench data.
5. Agree on how to present profiles where the evidence is incomplete.
6. Have an ophthalmologist review the visual assumptions, language, and disclaimer before the tool is used with patients.
