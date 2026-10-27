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
    name: 'Nighttime Driver POV (Street 15m, Cockpit 0.85m, Phone 0.40m)',
    category: 'night',
    pupilMm: 4.5,
    lambdaUm: 0.555,
    fovDeg: 50,
    hdrGain: 25,
    renderMode: 'depth-blend',
    baseImage: '/assets/scenes/nighttime_driver_pov.jpg',
    emissiveImage: '/assets/layers/pov_night_lights.png',
    credit: 'Authentic First-Person Night POV Photograph with Multi-Plane Depth-of-Field Blending & Xenon HDR',
    notes: [
      'Mesopic dilated night pupil (4.5 mm aperture)',
      'Far Plane (15.0 m / 0.07 D): Night asphalt highway, overhead lighted signs, and street illumination',
      'Emissive Cores (HDR Gain ×25): Xenon headlights of oncoming vehicles & taillights to evaluate optical halos',
      'Intermediate Plane (0.85 m / 1.18 D): Cockpit ambient glow, digital speedometer cluster & night-mode GPS',
      'Near Plane (0.40 m / 2.50 D): Dark-mode illuminated smartphone screen displaying high-contrast Snellen chart',
    ],
    layers: [
      {
        id: 'pov_night_far',
        label: 'Far — Night highway roadway & distant oncoming traffic (15.0 m / 0.07 D)',
        distanceM: 15.0,
        file: '/assets/scenes/nighttime_driver_pov.jpg',
        emissive: '/assets/layers/pov_night_lights.png',
      },
      {
        id: 'pov_night_int',
        label: 'Intermediate — Ambient cockpit, glowing instrument cluster & night GPS (0.85 m / 1.18 D)',
        distanceM: 0.85,
        file: '/assets/scenes/nighttime_driver_pov.jpg',
      },
      {
        id: 'pov_night_near',
        label: 'Near — Illuminated smartphone screen with Snellen eye chart (0.40 m / 2.50 D)',
        distanceM: 0.40,
        file: '/assets/scenes/nighttime_driver_pov.jpg',
      },
    ],
  },
  {
    id: 'day_mall',
    name: 'Daytime Shopping Mall (Atrium, Directory & Phone)',
    category: 'day',
    pupilMm: 3.0,
    lambdaUm: 0.555,
    fovDeg: 50,
    hdrGain: 1,
    renderMode: 'layered',
    credit: 'Grand Galleria Shopping Atrium with Near Smartphone Receipt & Directory Totem',
    notes: [
      'Photopic lighting (3.0 mm natural pupil)',
      'Near Layer (0.40 m / 2.50 D): Smartphone displaying shopping receipt & near visual acuity test chart',
      'Intermediate Layer (1.0 m / 1.00 D): Interactive directory kiosk with category text and directional arrows',
      'Far Layer (10.0 m / 0.10 D): High-vaulted mall atrium with luxury storefront signs',
    ],
    layers: [
      {
        id: 'mall_far',
        label: 'Far — Grand mall atrium, glass dome & distant luxury storefronts (10.0 m / 0.10 D)',
        distanceM: 10.0,
        file: '/assets/layers/day_far_mall.png',
      },
      {
        id: 'mall_intermediate',
        label: 'Intermediate — Interactive directory totem & glass balustrade (1.0 m / 1.00 D)',
        distanceM: 1.0,
        file: '/assets/layers/day_intermediate_directory.png',
      },
      {
        id: 'mall_near',
        label: 'Near — Smartphone displaying shopping bill & acuity test (0.40 m / 2.50 D)',
        distanceM: 0.40,
        file: '/assets/layers/day_near_phone_bill.png',
      },
    ],
  },
];
