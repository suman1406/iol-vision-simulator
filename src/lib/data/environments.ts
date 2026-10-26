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
    id: 'day_mall',
    name: 'Daytime Shopping Mall (with Near Phone / Bill)',
    category: 'day',
    pupilMm: 3.0,
    lambdaUm: 0.555,
    fovDeg: 50,
    hdrGain: 1,
    credit: 'Vector & photographic composite: Grand Galleria Shopping Atrium with Near Smartphone Receipt & Directory Totem',
    notes: [
      'Photopic lighting (3.0 mm natural pupil)',
      'Near Layer (0.40 m / 2.50 D): Smartphone displaying shopping receipt & near visual acuity test chart (clinical near reading standard)',
      'Intermediate Layer (1.0 m / 1.00 D): Interactive directory kiosk with category text and directional arrows',
      'Far Layer (10.0 m / 0.10 D): High-vaulted mall atrium with luxury storefront signs (Tiffany & Co., Apple, Rolex)',
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
  {
    id: 'night_drive',
    name: 'Night Driving (Highway, Signs & Cockpit Dashboard)',
    category: 'night',
    pupilMm: 4.5,
    lambdaUm: 0.555,
    fovDeg: 50,
    hdrGain: 25,
    credit: 'Photographic & vector night composite: City Highway Gantry, Oncoming Traffic & Modern Vehicle Cockpit',
    notes: [
      'Mesopic dilated night pupil (4.5 mm aperture)',
      'Near/Intermediate Layer (0.85 m / 1.18 D): Car instrument cluster (digital speedometer 52 MPH) & GPS navigation screen',
      'Far Layer (15.0 m / 0.07 D): Highway asphalt, lane markings, overhead green signs (Exit 14A Downtown, I-90 West)',
      'Emissive Layer (HDR Gain ×25): Xenon headlights of oncoming vehicles, streetlamps, taillights to test halos, glare & starbursts',
    ],
    layers: [
      {
        id: 'night_far',
        label: 'Far — Highway road surface, overhead gantry signs & oncoming traffic (15.0 m / 0.07 D)',
        distanceM: 15.0,
        file: '/assets/layers/night_far_street.png',
        emissive: '/assets/layers/night_lights_new.png',
      },
      {
        id: 'night_intermediate',
        label: 'Intermediate — Vehicle steering wheel, digital speedometer & GPS map screen (0.85 m / 1.18 D)',
        distanceM: 0.85,
        file: '/assets/layers/night_intermediate_dashboard.png',
      },
    ],
  },
  {
    id: 'day_taxi_classic',
    name: 'Daytime Taxi (Classic Benchmark)',
    category: 'day',
    pupilMm: 3.0,
    lambdaUm: 0.555,
    fovDeg: 50,
    hdrGain: 1,
    credit: 'Photo: Vincent Desjardins, Chicago Cab 133, Flickr CC BY 2.0',
    notes: [
      'Photopic pupil 3.0 mm',
      'Far (10.0 m): Chicago street through windshield',
      'Intermediate (0.9 m): Taxi dashboard, fare meter, mirror',
      'Notice: Has no reading-distance target (0.4m)',
    ],
    layers: [
      {
        id: 'taxi_street',
        label: 'Far — Street, vehicles & buildings through windshield (~10.0 m / 0.10 D)',
        distanceM: 10.0,
        file: '/assets/layers/day_street.png',
      },
      {
        id: 'taxi_interior',
        label: 'Intermediate — Taxi dashboard, fare meter & mirror (~0.9 m / 1.11 D)',
        distanceM: 0.9,
        file: '/assets/layers/day_interior.png',
      },
    ],
  },
  {
    id: 'night_crete_classic',
    name: 'Night Crete Street (Classic Benchmark)',
    category: 'night',
    pupilMm: 4.5,
    lambdaUm: 0.555,
    fovDeg: 50,
    hdrGain: 25,
    credit: 'Photo: Jonashtand, Crete street at night, Wikimedia CC BY-SA 4.0',
    notes: [
      'Mesopic pupil 4.5 mm',
      'Single distance layer (15.0 m) with isolated emissive headlight cores (HDR gain 25)',
    ],
    layers: [
      {
        id: 'crete_street',
        label: 'Street, distant vehicles and light sources (15.0 m / 0.07 D)',
        distanceM: 15.0,
        file: '/assets/layers/night_street.png',
        emissive: '/assets/layers/night_lights.png',
      },
    ],
  },
];
