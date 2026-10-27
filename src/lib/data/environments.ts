export interface LayerDef {
  id: string;
  label: string;
  distanceM: number;
  file: string;
  emissive?: string;
}

export interface Environment {
  id: string;
  name: string;
  category: 'day' | 'night';
  pupilMm: number;
  lambdaUm: number;
  fovDeg: number;
  hdrGain?: number;
  credit: string;
  notes: string[];
  renderMode?: 'depth-blend' | 'layered';
  baseImage?: string;
  emissiveImage?: string;
  layers: LayerDef[];
}

export const ENVIRONMENTS: Environment[] = [
  {
    id: 'day_photo_drive',
    name: 'Daytime Driver POV (Hosur Rd 10m, CarPlay 0.85m, Phone 0.40m)',
    category: 'day',
    pupilMm: 3.0,
    lambdaUm: 0.555,
    fovDeg: 50,
    hdrGain: 1,
    renderMode: 'depth-blend',
    baseImage: '/assets/scenes/daytime_driver_pov.jpg',
    credit: 'High-Resolution First-Person Driver POV Photograph (Toyota cockpit with Apple CarPlay & Snellen Eye Chart)',
    notes: [
      'Photopic lighting (3.0 mm natural pupil)',
      'Far Plane (10.0 m / 0.10 D): Multi-lane highway, overhead gantry signs (Bengaluru, Electronic City, Hosur Rd) & traffic ahead',
      'Intermediate Plane (0.85 m / 1.18 D): Cockpit interior, Toyota steering wheel, 60 km/h speedometer & Apple CarPlay GPS map',
      'Near Plane (0.40 m / 2.50 D): Hand holding iPhone displaying clinical Snellen acuity chart (Lines 1-8: E, FP, TOZ, LPED...)',
    ],
    layers: [
      {
        id: 'pov_far',
        label: 'Far — Highway road surface, overhead gantry & skyline through windshield (10.0 m / 0.10 D)',
        distanceM: 10.0,
        file: '/assets/scenes/daytime_driver_pov.jpg',
      },
      {
        id: 'pov_int',
        label: 'Intermediate — Cockpit dashboard, steering wheel, 60 km/h cluster & GPS (0.85 m / 1.18 D)',
        distanceM: 0.85,
        file: '/assets/scenes/daytime_driver_pov.jpg',
      },
      {
        id: 'pov_near',
        label: 'Near — Smartphone displaying Snellen eye chart & legible text (0.40 m / 2.50 D)',
        distanceM: 0.40,
        file: '/assets/scenes/daytime_driver_pov.jpg',
      },
    ],
  },
  {
    id: 'night_photo_drive',
    name: 'Nighttime Driver POV (Hosur Rd 10m, CarPlay 0.85m, Phone 0.40m)',
    category: 'night',
    pupilMm: 4.5,
    lambdaUm: 0.555,
    fovDeg: 50,
    hdrGain: 25,
    renderMode: 'depth-blend',
    baseImage: '/assets/scenes/nighttime_driver_pov.jpg',
    emissiveImage: '/assets/layers/pov_night_lights.png',
    credit: 'Authentic First-Person Toyota Cockpit Night POV with Xenon Headlight Bloom & Diffractive Halo Rendering',
    notes: [
      'Mesopic dilated night pupil (4.5 mm aperture)',
      'Far Plane (10.0 m / 0.10 D): Night highway roadway, oncoming vehicle headlights, illuminated overhead signs (Bengaluru, Electronic City, Hosur Rd)',
      'Emissive Cores (HDR Gain ×25): Xenon headlights, red taillights, illuminated signs to simulate optical dysphotopsia & halo rings',
      'Intermediate Plane (0.85 m / 1.18 D): Cockpit ambient glow, digital speedometer cluster (60 km/h) & night-mode Apple CarPlay GPS map',
      'Near Plane (0.40 m / 2.50 D): Handheld illuminated smartphone displaying Snellen acuity chart (Lines 1-8)',
    ],
    layers: [
      {
        id: 'pov_night_far',
        label: 'Far — Night highway roadway & oncoming headlights (10.0 m / 0.10 D)',
        distanceM: 10.0,
        file: '/assets/scenes/nighttime_driver_pov.jpg',
        emissive: '/assets/layers/pov_night_lights.png',
      },
      {
        id: 'pov_night_int',
        label: 'Intermediate — Cockpit dashboard, 60 km/h cluster & night GPS (0.85 m / 1.18 D)',
        distanceM: 0.85,
        file: '/assets/scenes/nighttime_driver_pov.jpg',
      },
      {
        id: 'pov_night_near',
        label: 'Near — Illuminated smartphone screen with Snellen chart (0.40 m / 2.50 D)',
        distanceM: 0.40,
        file: '/assets/scenes/nighttime_driver_pov.jpg',
      },
    ],
  },
];
