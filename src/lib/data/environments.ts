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
    name: 'Daytime Drive & Interior (Street, Dashboard & Near Phone)',
    category: 'day',
    pupilMm: 3.0,
    lambdaUm: 0.555,
    fovDeg: 50,
    hdrGain: 1,
    credit: 'Photographic Multi-Plane Composite: Chicago Streetscape (Flickr CC BY 2.0) & Mobile Acuity Device',
    notes: [
      'Photopic lighting (3.0 mm photopic pupil)',
      'Far Layer (10.0 m / 0.10 D): Street, distant vehicles, traffic signals & architecture viewed through windshield',
      'Intermediate Layer (0.85 m / 1.18 D): Vehicle dashboard, fare meter, dashboard instruments & rearview mirror',
      'Near Layer (0.40 m / 2.50 D): Smartphone in foreground displaying shopping bill & standard near visual acuity test chart',
    ],
    layers: [
      {
        id: 'drive_street',
        label: 'Far — Street, vehicles & architecture through windshield (10.0 m / 0.10 D)',
        distanceM: 10.0,
        file: '/assets/layers/day_street.png',
      },
      {
        id: 'drive_interior',
        label: 'Intermediate — Vehicle dashboard, fare meter & mirror (0.85 m / 1.18 D)',
        distanceM: 0.85,
        file: '/assets/layers/day_interior.png',
      },
      {
        id: 'drive_near_phone',
        label: 'Near — Smartphone displaying shopping bill & acuity test (0.40 m / 2.50 D)',
        distanceM: 0.40,
        file: '/assets/layers/day_near_phone_bill.png',
      },
    ],
  },
  {
    id: 'night_photo_drive',
    name: 'Night Driving (Highway, Xenon Lights, Cockpit & Phone)',
    category: 'night',
    pupilMm: 4.5,
    lambdaUm: 0.555,
    fovDeg: 50,
    hdrGain: 25,
    credit: 'Photographic & Night Multi-Plane Composite: Night Streetscape (Wikimedia CC BY-SA 4.0) & Cockpit Instruments',
    notes: [
      'Mesopic dilated night pupil (4.5 mm aperture)',
      'Far Layer (15.0 m / 0.07 D): Night roadway, traffic, street lighting & building facades',
      'Emissive Layer (HDR Gain ×25): Xenon headlights of oncoming vehicles & streetlamps for dysphotopsia evaluation',
      'Intermediate Layer (0.85 m / 1.18 D): Vehicle cockpit with digital instrument cluster & speedometer',
      'Near Layer (0.40 m / 2.50 D): Illuminated smartphone screen with high-contrast text & acuity test',
    ],
    layers: [
      {
        id: 'night_street_far',
        label: 'Far — Night roadway, oncoming vehicles & street illumination (15.0 m / 0.07 D)',
        distanceM: 15.0,
        file: '/assets/layers/night_street.png',
        emissive: '/assets/layers/night_lights.png',
      },
      {
        id: 'night_cockpit_int',
        label: 'Intermediate — Vehicle steering wheel & digital instrument cluster (0.85 m / 1.18 D)',
        distanceM: 0.85,
        file: '/assets/layers/night_intermediate_dashboard.png',
      },
      {
        id: 'night_phone_near',
        label: 'Near — Illuminated smartphone screen & near acuity test (0.40 m / 2.50 D)',
        distanceM: 0.40,
        file: '/assets/layers/day_near_phone_bill.png',
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
    credit: 'Vector & photographic composite: Grand Galleria Shopping Atrium with Near Smartphone Receipt & Directory Totem',
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
