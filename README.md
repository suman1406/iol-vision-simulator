# IOL Vision Simulator — Clinical Consultation Suite

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2.35-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![Fourier Optics Validated](https://img.shields.io/badge/Optics-Fourier%20Wave%20Physics-emerald?style=flat)](./OPTICS_METHODOLOGY_AND_SPECIFICATION.md)
[![CI Verification](https://github.com/suman1406/iol-vision-simulator/actions/workflows/ci.yml/badge.svg)](https://github.com/suman1406/iol-vision-simulator/actions/workflows/ci.yml)

A high-fidelity, physically validated intraocular lens (IOL) vision simulation workstation designed for ophthalmologists and refractive surgeons during pre-operative cataract consultations. 

Built with **100% Next.js 14, React 18, and TypeScript**, the simulator replaces arbitrary Gaussian filters with **real-time 2D Fast Fourier Transform (FFT) wave optics** to accurately reproduce optical transfer functions (OTFs), point spread functions (PSFs), through-focus defoci, diffractive halos, and foveal neural contrast constancy across clinical viewing distances.

---

## Key Clinical Features

- **Physically Validated Wave Optics Engine:** Computes monochromatic complex pupil wavefields ($U = \exp(i 2\pi W / \lambda)$) and 2D FFT PSFs from measured optical path differences (OPD) and published ISO 11979-2 model eye bench data.
- **Clinician's 6-Category IOL Portfolio:**
  1. **Monofocal Control:** Standard aspheric distance monofocal (Alcon Clareon / AcrySof SN60WF).
  2. **EDOF:** Diffractive echelette profile extending depth of focus by $+1.75\,\text{D}$ (TECNIS Symfony ZXR00).
  3. **Premium EDOF (PureSee & Vivity):**
     - **TECNIS PureSee (ZEN00V):** Refractive continuous wavefront shaping measured via OptiSpheric IOL PRO 2 (Schmid & Borkenstein 2024).
     - **Alcon Vivity (DFT015):** Non-diffractive X-WAVE™ optical power profile measured on NIMO TR1504 phase-shifting deflectometry (Garzón et al. 2024).
  4. **Multifocal (Distance & Near):** Classic simultaneous vision half-wave kinoform bifocal ($+2.50\,\text{D}$ near add).
  5. **Trifocal Lenses (Full Range):** Dedicated $+1.68\,\text{D}$ ($60\,\text{cm}$) intermediate and $+2.51\,\text{D}$ ($40\,\text{cm}$) near focal peaks (Alcon PanOptix TFNT00).
  6. **Imported Trifocal (Apodized):** Step-apodized diffractive design engineered to suppress night halo ring luminance by $\approx 45\%$ (Zeiss AT LISA tri 839MP).
  - **Reference Baselines:**
    - **`0. Natural Eye (20/20 Reference)`:** Accommodating crystalline lens providing a pristine gold-standard baseline.
    - **`Aphakic Eye (+11D)`:** Uncorrected post-cataract surgical state demonstrating why an IOL implant is medically required.
- **Calibrated Multi-Depth Environments:**
  - **Daytime Grand Galleria Mall (3.0 mm photopic pupil):** Far atrium ($10.0\,\text{m}$ / $0.10\,\text{D}$), intermediate directory totem ($1.0\,\text{m}$ / $1.00\,\text{D}$), and near smartphone with an **ETDRS Snellen/Jaeger acuity test chart** ($0.40\,\text{m}$ / $2.50\,\text{D}$).
  - **Night Highway Driving (4.5 mm mesopic pupil):** Distant road & signs ($15.0\,\text{m}$ / $0.07\,\text{D}$), cockpit dashboard ($0.85\,\text{m}$ / $1.18\,\text{D}$), and high-dynamic-range ($25\times$ gain) oncoming headlight glare.
- **Foveal Neural Contrast Constancy:** Accurately accounts for human cortical adaptation (Campbell & Robson 1968, Watson 2000), preventing the out-of-focus background veil of diffractive multifocal IOLs from artificially washing out high-frequency reading text.
- **Modern Colorful Workstation UI:** Features an interactive clinical defocus curve SVG visualizer, visual acuity progress scorecards, side-by-side monofocal comparison mode, and quick distance zoom presets.

---

## Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 14 (App Router) | High-performance React server and client components |
| **Language** | TypeScript 5.7 (Strict) | End-to-end type safety across optics and UI models |
| **Styling** | Tailwind CSS 3.4 | Responsive, compact medical workstation layout |
| **Optics Engine** | Radix-2 2D FFT & Fourier Optics | Complex wavefront wave propagation, PSF calculation & convolution |
| **Icons** | Lucide React | Modern medical and UI iconography |
| **Scene Engine** | High-resolution SVG & Resvg | Vector-rendered multi-depth photographic & clinical chart layers |
| **Testing** | TSX & Custom Optical Assertions | Verifies MTF against analytic diffraction limits and published bench papers |

---

## Getting Started

### Prerequisites

- **Node.js**: v18.18+ or v20+ (v24 LTS tested)
- **npm**: v9+

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/suman1406/iol-vision-simulator.git
cd iol-vision-simulator

# 2. Install dependencies
npm install
```

### Development Server

Run the development server locally:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build & Execution

To test the optimized production build:

```bash
# Build the application
npm run build

# Start the production server
npm run start
```

---

## Automated Verification & Optics Testing

The project includes strict automated checks for optical fidelity, TypeScript type safety, and production build readiness:

```bash
# 1. Type-check all TypeScript files
npm run type-check

# 2. Run the Fourier wave optics test suite
npm run test

# 3. Complete CI pipeline check (Type-check + Optics tests + Production build)
npm run check
```

### Optical Test Verification Metrics

```text
====================================================
IOL VISION SIMULATOR — OPTICAL SUITE VERIFICATION
====================================================
[PASS] Test 1: Diffraction-Limited MTF (3mm, 835 c/rad): 0.804 (Analytic Target: 0.807, Error: 0.28%)
[PASS] Test 2: PureSee Best Focus (3mm, 546nm): 0.375 D (Published Target: ~0.38 D)
[PASS] Test 3: Vivity Best Focus (3mm, 546nm): 0.813 D (Published Target: ~0.81 D)
[PASS] Test 4: PanOptix Transmitted Energy: 88.0% (Published Target: ~88%)
[PASS] Test 5: Near PSF Central Peak:
       • Monofocal (Out-of-Focus): 0.01631 (Wide 29px blur disc)
       • Trifocal (In-Focus Order): 0.51954 (31.8x higher peak intensity)
       • Natural Eye (20/20 Reference): 0.91649
[PASS] Test 6: Doctor Portfolio Completeness (All 9 Profiles Active)
[PASS] Test 7: Scene Layer Vergence Verification (Photopic & Mesopic)
✓ ALL 7 TEST SUITES PASSED — ZERO ERRORS DETECTED
```

---

## Mathematical Formulation

Detailed optical derivations, Zernike polynomial tables, Fresnel-Kirchhoff scalar diffraction equations, and neural contrast constancy formulas are comprehensively documented in [OPTICS_METHODOLOGY_AND_SPECIFICATION.md](./OPTICS_METHODOLOGY_AND_SPECIFICATION.md).

---

## Q1 Peer-Reviewed Literature Citations

1. **Carson et al. (2016):** *"Optical bench performance of 3 trifocal intraocular lenses."* *Journal of Cataract & Refractive Surgery*, 42(9):1361–1367. [DOI: 10.1016/j.jcrs.2016.06.036](https://doi.org/10.1016/j.jcrs.2016.06.036)
2. **Schmid & Borkenstein (2024):** *"Optical Bench Evaluation of the Latest Refractive Enhanced Depth of Focus Intraocular Lens."* *Clinical Ophthalmology*, 18:1921–1932. [DOI: 10.2147/OPTH.S469849](https://doi.org/10.2147/OPTH.S469849)
3. **Garzón et al. (2024):** *"Optical power profiles and aberrations of a non-diffractive wavefront-shaping extended depth of focus intraocular lens."* *Graefe's Archive for Clinical and Experimental Ophthalmology*, 262(9):2897–2906. [DOI: 10.1007/s00417-024-06469-y](https://doi.org/10.1007/s00417-024-06469-y)
4. **Gatinel & Loicq (2016):** *"Comparison of the through-focus optical quality of diffractive trifocal and extended depth of focus intraocular lenses."* *Journal of Cataract & Refractive Surgery*, 42(10):1498–1504. [DOI: 10.1016/j.jcrs.2016.08.019](https://doi.org/10.1016/j.jcrs.2016.08.019)
5. **Auffarth et al. (2021):** *"Clinical evaluation of a new monofocal IOL with enhanced intermediate function in cataract patients."* *Journal of Cataract & Refractive Surgery*, 47(2):184–191. [DOI: 10.1097/j.jcrs.0000000000000399](https://doi.org/10.1097/j.jcrs.0000000000000399)
6. **Mencucci et al. (2020):** *"Clinical outcomes, visual quality, and patient satisfaction with a new extended depth-of-focus monofocal intraocular lens."* *Journal of Cataract & Refractive Surgery*, 46(5):678–687. [DOI: 10.1097/j.jcrs.0000000000000142](https://doi.org/10.1097/j.jcrs.0000000000000142)
7. **Cochener et al. (2016):** *"Clinical outcomes of a new extended range of vision intraocular lens: International Multicenter Study."* *Journal of Cataract & Refractive Surgery*, 42(9):1268–1276. [DOI: 10.1016/j.jcrs.2016.06.033](https://doi.org/10.1016/j.jcrs.2016.06.033)
8. **Modi et al. (2021):** *"Visual and patient-reported outcomes of a diffractive trifocal intraocular lens: Results of the pivotal US clinical trial."* *Journal of Cataract & Refractive Surgery*, 47(2):175–183. [DOI: 10.1097/j.jcrs.0000000000000408](https://doi.org/10.1097/j.jcrs.0000000000000408)
9. **Mojzis et al. (2014):** *"Visual outcomes and contrast sensitivity with a new trifocal diffractive intraocular lens."* *Journal of Cataract & Refractive Surgery*, 40(1):60–69. [DOI: 10.1016/j.jcrs.2013.06.025](https://doi.org/10.1016/j.jcrs.2013.06.025)
10. **Auffarth et al. (2026):** *"Clinical Performance After Implantation of a New Purely Refractive Extended Depth of Field Intraocular Lens in Cataract Patients."* *Clinical Ophthalmology*, 20:1125–1136. [DOI: 10.2147/OPTH.S583059](https://doi.org/10.2147/OPTH.S583059)
11. **Alarcon et al. (2016):** *"Prediction of visual acuity through focus in eyes implanted with intraocular lenses."* *Journal of Biomedical Optics*, 21(7):076013. [DOI: 10.1117/1.JBO.21.7.076013](https://doi.org/10.1117/1.JBO.21.7.076013)
12. **Campbell & Robson (1968):** *"Application of Fourier analysis to the visibility of gratings."* *The Journal of Physiology*, 197(3):551–566. [DOI: 10.1113/jphysiol.1968.sp008574](https://doi.org/10.1113/jphysiol.1968.sp008574)

---

## Clinical Disclaimer

This simulator is intended solely for **patient education and illustrative consultation purposes**. It does not constitute a medical diagnosis, surgical prediction, or visual acuity test. Actual postoperative visual outcomes depend on individual corneal aberrations, pupil dynamics, axial length, astigmatism, ocular health, and cortical neuroadaptation.

---

## License

MIT License. Designed and maintained for clinical and academic cataract consultation.
