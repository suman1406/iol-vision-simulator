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
  layers: LayerDef[];
}

export const ENVIRONMENTS: Environment[] = [
  {
    id: 'day_photo_drive',
    name: 'Daytime Driver POV (Street, Cockpit & Phone)',
    category: 'day',
    pupilMm: 3.0,
    lambdaUm: 0.555,
    fovDeg: 50,
    hdrGain: 1,
    credit: 'High-Resolution First-Person Driver POV Photograph (Canon EOS R5 / 35mm f/4 aesthetic)',
    notes: [
      'Photopic lighting (3.0 mm natural pupil)',
      'Far Layer (10.0 m / 0.10 D): Multi-lane highway, distant traffic, gantry signs & skyline through windshield',
      'Intermediate Layer (0.85 m / 1.18 D): Cockpit interior, leather steering wheel, instrument cluster (60 km/h) & GPS screen',
      'Near Layer (0.40 m / 2.50 D): Driver holding sleek smartphone vertically showing Snellen acuity chart (large E) & text',
    ],
    layers: [
      {
        id: 'pov_day_far',
        label: 'Far — Highway road surface, overhead gantry & skyline through windshield (10.0 m / 0.10 D)',
        distanceM: 10.0,
        file: '/assets/layers/pov_day_far.png',
      },
      {
        id: 'pov_day_interior',
        label: 'Intermediate — Cockpit dashboard, steering wheel, 60 km/h cluster & GPS (0.85 m / 1.18 D)',
        distanceM: 0.85,
        file: '/assets/layers/pov_day_interior.png',
      },
      {
        id: 'pov_day_near_phone',
        label: 'Near — Smartphone displaying Snellen eye chart & legible text (0.40 m / 2.50 D)',
        distanceM: 0.40,
        file: '/assets/layers/pov_day_near_phone.png',
      },
    ],
  },
  {
    id: 'night_photo_drive',
    name: 'Nighttime Driver POV (Xenon Lights, Cockpit & Phone)',
    category: 'night',
    pupilMm: 4.5,
    lambdaUm: 0.555,
    fovDeg: 50,
    hdrGain: 25,
    credit: 'Authentic First-Person Night POV Photograph (35mm f/2.0 ISO 800 night exposure)',
    notes: [
      'Mesopic dilated night pupil (4.5 mm aperture)',
      'Far Layer (15.0 m / 0.07 D): Night asphalt highway, overhead lighted signs, and street illumination',
      'Emissive Layer (HDR Gain ×25): Xenon headlights of oncoming vehicles & taillights to evaluate optical halos',
      'Intermediate Layer (0.85 m / 1.18 D): Cockpit ambient glow, digital speedometer cluster & night-mode GPS',
      'Near Layer (0.40 m / 2.50 D): Dark-mode illuminated smartphone screen displaying high-contrast Snellen chart',
    ],
    layers: [
      {
        id: 'pov_night_far',
        label: 'Far — Night highway roadway & distant oncoming traffic (15.0 m / 0.07 D)',
        distanceM: 15.0,
        file: '/assets/layers/pov_night_far.png',
        emissive: '/assets/layers/pov_night_lights.png',
      },
      {
        id: 'pov_night_interior',
        label: 'Intermediate — Ambient cockpit, glowing instrument cluster & night GPS (0.85 m / 1.18 D)',
        distanceM: 0.85,
        file: '/assets/layers/pov_night_interior.png',
      },
      {
        id: 'pov_night_near_phone',
        label: 'Near — Illuminated smartphone screen with Snellen eye chart (0.40 m / 2.50 D)',
        distanceM: 0.40,
        file: '/assets/layers/pov_night_near_phone.png',
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
