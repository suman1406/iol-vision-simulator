import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Resvg } from '@resvg/resvg-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'public', 'assets', 'layers');
fs.mkdirSync(OUT, { recursive: true });

const W = 960;
const H = 640;

// --- DAY SCENE: SHOPPING MALL ---
// 1. Far Layer: Shopping Mall Grand Atrium (10.0 m)
const dayFarSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#bfdbfe"/>
      <stop offset="60%" stop-color="#e0f2fe"/>
      <stop offset="100%" stop-color="#f8fafc"/>
    </linearGradient>
    <linearGradient id="atriumGlass" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#93c5fd" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.95"/>
    </linearGradient>
    <linearGradient id="wallGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f1f5f9"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </linearGradient>
    <linearGradient id="marbleFloor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#e2e8f0"/>
      <stop offset="40%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </linearGradient>
    <radialGradient id="sunbeam" cx="50%" cy="10%" r="70%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.6"/>
      <stop offset="50%" stop-color="#fef08a" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Sky & Glass Vaulted Atrium -->
  <rect x="0" y="0" width="${W}" height="${H}" fill="url(#wallGrad)"/>
  <path d="M 120 0 Q 480 180 840 0 Z" fill="url(#skyGrad)"/>
  <path d="M 120 0 Q 480 180 840 0" stroke="#334155" stroke-width="6" fill="none"/>
  
  <!-- Steel Atrium Ribs -->
  <line x1="240" y1="0" x2="320" y2="105" stroke="#475569" stroke-width="3"/>
  <line x1="360" y1="0" x2="400" y2="128" stroke="#475569" stroke-width="3"/>
  <line x1="480" y1="0" x2="480" y2="135" stroke="#475569" stroke-width="3"/>
  <line x1="600" y1="0" x2="560" y2="128" stroke="#475569" stroke-width="3"/>
  <line x1="720" y1="0" x2="640" y2="105" stroke="#475569" stroke-width="3"/>
  <circle cx="480" cy="180" r="420" fill="url(#sunbeam)"/>

  <!-- Upper Tier Storefronts (Level 3) -->
  <rect x="80" y="110" width="800" height="90" fill="#334155"/>
  <rect x="90" y="115" width="780" height="80" fill="#1e293b"/>
  <!-- Level 3 Signage -->
  <rect x="140" y="125" width="200" height="35" rx="4" fill="#0f172a" stroke="#d97706" stroke-width="1.5"/>
  <text x="240" y="148" font-family="Arial, sans-serif" font-size="15" font-weight="bold" fill="#fef08a" text-anchor="middle" letter-spacing="3">TIFFANY &amp; CO.</text>
  
  <rect x="380" y="125" width="200" height="35" rx="4" fill="#0f172a" stroke="#e2e8f0" stroke-width="1.5"/>
  <text x="480" y="148" font-family="Arial, sans-serif" font-size="15" font-weight="bold" fill="#ffffff" text-anchor="middle" letter-spacing="4">GUCCI GALLERIA</text>

  <rect x="620" y="125" width="200" height="35" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5"/>
  <text x="720" y="148" font-family="Arial, sans-serif" font-size="15" font-weight="bold" fill="#38bdf8" text-anchor="middle" letter-spacing="3">APPLE STORE</text>

  <!-- Level 3 Glass Balustrade -->
  <rect x="70" y="195" width="820" height="25" fill="#94a3b8" opacity="0.6"/>
  <line x1="70" y1="195" x2="890" y2="195" stroke="#cbd5e1" stroke-width="2"/>
  <line x1="70" y1="220" x2="890" y2="220" stroke="#64748b" stroke-width="3"/>

  <!-- Middle Tier Storefronts (Level 2) -->
  <rect x="40" y="220" width="880" height="110" fill="#475569"/>
  <rect x="50" y="225" width="860" height="100" fill="#0f172a"/>
  <!-- Level 2 Signage -->
  <rect x="100" y="240" width="220" height="42" rx="5" fill="#1e293b" stroke="#eab308" stroke-width="2"/>
  <text x="210" y="267" font-family="Georgia, serif" font-size="17" font-weight="bold" fill="#fde047" text-anchor="middle" letter-spacing="2">ROLEX ATELIER</text>

  <rect x="360" y="240" width="240" height="42" rx="5" fill="#1e293b" stroke="#fb7185" stroke-width="2"/>
  <text x="480" y="267" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle" letter-spacing="3">NESPRESSO BOUTIQUE</text>

  <rect x="640" y="240" width="220" height="42" rx="5" fill="#1e293b" stroke="#4ade80" stroke-width="2"/>
  <text x="750" y="267" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#86efac" text-anchor="middle" letter-spacing="2">SEPHORA PARIS</text>

  <!-- Level 2 Glass Balustrade -->
  <rect x="30" y="325" width="900" height="30" fill="#94a3b8" opacity="0.5"/>
  <line x1="30" y1="325" x2="930" y2="325" stroke="#f1f5f9" stroke-width="3"/>
  <line x1="30" y1="355" x2="930" y2="355" stroke="#475569" stroke-width="4"/>

  <!-- Level 1 Ground Marble Floor & Atrium Plaza -->
  <polygon points="0,355 ${W},355 ${W},${H} 0,${H}" fill="url(#marbleFloor)"/>
  <!-- Tile grid lines -->
  <line x1="100" y1="355" x2="0" y2="${H}" stroke="#cbd5e1" stroke-width="1.5"/>
  <line x1="280" y1="355" x2="160" y2="${H}" stroke="#cbd5e1" stroke-width="1.5"/>
  <line x1="480" y1="355" x2="480" y2="${H}" stroke="#cbd5e1" stroke-width="1.5"/>
  <line x1="680" y1="355" x2="800" y2="${H}" stroke="#cbd5e1" stroke-width="1.5"/>
  <line x1="860" y1="355" x2="960" y2="${H}" stroke="#cbd5e1" stroke-width="1.5"/>

  <!-- Distant Shoppers and Planters -->
  <ellipse cx="260" cy="400" rx="14" ry="4" fill="#64748b" opacity="0.4"/>
  <rect x="254" y="372" width="12" height="26" rx="4" fill="#3b82f6"/>
  <circle cx="260" cy="368" r="5" fill="#fdba74"/>

  <ellipse cx="680" cy="410" rx="15" ry="4" fill="#64748b" opacity="0.4"/>
  <rect x="674" y="380" width="12" height="28" rx="4" fill="#ec4899"/>
  <circle cx="680" cy="375" r="5" fill="#fbcfe8"/>

  <ellipse cx="710" cy="405" rx="15" ry="4" fill="#64748b" opacity="0.4"/>
  <rect x="704" y="375" width="12" height="28" rx="4" fill="#10b981"/>
  <circle cx="710" cy="370" r="5" fill="#fed7aa"/>

  <!-- Central Hanging Chandelier / Mobile -->
  <line x1="480" y1="0" x2="480" y2="80" stroke="#94a3b8" stroke-width="2"/>
  <circle cx="480" cy="90" r="18" fill="#fef08a" stroke="#ca8a04" stroke-width="2"/>
  <line x1="460" y1="100" x2="500" y2="100" stroke="#ca8a04" stroke-width="2"/>
</svg>
`;

// 2. Intermediate Layer: Mall Directory Kiosk & Glass Railing (1.0 m)
const dayIntermediateSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="kioskBody" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="50%" stop-color="#334155"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <linearGradient id="screenGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0284c7"/>
      <stop offset="10%" stop-color="#0369a1"/>
      <stop offset="100%" stop-color="#082f49"/>
    </linearGradient>
    <linearGradient id="glassRailing" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f8fafc" stop-opacity="0.5"/>
      <stop offset="50%" stop-color="#94a3b8" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#cbd5e1" stop-opacity="0.6"/>
    </linearGradient>
  </defs>

  <!-- Clear glass balustrade in front (right and center) -->
  <path d="M 440 380 L 960 410 L 960 640 L 440 640 Z" fill="url(#glassRailing)"/>
  <!-- Polished Steel Railing Bar -->
  <line x1="435" y1="380" x2="960" y2="410" stroke="#f1f5f9" stroke-width="12" stroke-linecap="round"/>
  <line x1="435" y1="382" x2="960" y2="412" stroke="#475569" stroke-width="4"/>

  <!-- Left Side: Interactive Mall Directory Totem at 1.0 m -->
  <!-- Shadow on floor -->
  <ellipse cx="230" cy="625" rx="140" ry="18" fill="#0f172a" opacity="0.45"/>

  <!-- Kiosk Pillar Stand -->
  <rect x="110" y="240" width="240" height="380" rx="12" fill="url(#kioskBody)" stroke="#64748b" stroke-width="3"/>
  <rect x="120" y="250" width="220" height="340" rx="8" fill="url(#screenGrad)" stroke="#38bdf8" stroke-width="2"/>

  <!-- Kiosk Header -->
  <rect x="120" y="250" width="220" height="42" rx="8" fill="#0284c7"/>
  <text x="230" y="278" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle" letter-spacing="2">MALL DIRECTORY</text>

  <!-- Directory Search Bar -->
  <rect x="130" y="300" width="200" height="24" rx="4" fill="#ffffff" opacity="0.95"/>
  <text x="140" y="316" font-family="Arial, sans-serif" font-size="11" fill="#64748b">Search stores or brands...</text>

  <!-- Category Entries with Crisp Icons & Text -->
  <!-- Level 3 -->
  <g transform="translate(130, 335)">
    <rect x="0" y="0" width="200" height="40" rx="4" fill="#0c4a6e" stroke="#0284c7" stroke-width="1"/>
    <text x="10" y="18" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#38bdf8">L3 • Fine Dining &amp; Cinema</text>
    <text x="10" y="32" font-family="Arial, sans-serif" font-size="10" fill="#bae6fd">Bistro, IMAX Theater, Rooftop Bar</text>
    <text x="185" y="25" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#38bdf8" text-anchor="end">➔</text>
  </g>

  <!-- Level 2 -->
  <g transform="translate(130, 385)">
    <rect x="0" y="0" width="200" height="40" rx="4" fill="#0c4a6e" stroke="#0284c7" stroke-width="1"/>
    <text x="10" y="18" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#38bdf8">L2 • High Fashion &amp; Beauty</text>
    <text x="10" y="32" font-family="Arial, sans-serif" font-size="10" fill="#bae6fd">Designer Apparel, Cosmetics, Spa</text>
    <text x="185" y="25" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#38bdf8" text-anchor="end">➔</text>
  </g>

  <!-- Level 1 -->
  <g transform="translate(130, 435)">
    <rect x="0" y="0" width="200" height="40" rx="4" fill="#0c4a6e" stroke="#0284c7" stroke-width="1"/>
    <text x="10" y="18" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#38bdf8">L1 • Jewelry &amp; Electronics</text>
    <text x="10" y="32" font-family="Arial, sans-serif" font-size="10" fill="#bae6fd">Watches, Tech Lounge, Atrium Cafe</text>
    <text x="185" y="25" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#38bdf8" text-anchor="end">➔</text>
  </g>

  <!-- Services & Amenities -->
  <g transform="translate(130, 485)">
    <rect x="0" y="0" width="200" height="38" rx="4" fill="#075985"/>
    <text x="10" y="16" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#ffffff">Services &amp; Information</text>
    <text x="10" y="30" font-family="Arial, sans-serif" font-size="9" fill="#e0f2fe">Restrooms, ATM, Guest Concierge</text>
  </g>

  <!-- Footer Info on Kiosk -->
  <text x="230" y="542" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#e0f2fe" text-anchor="middle">Distance to Reader: 1.0 m</text>
  <text x="230" y="556" font-family="Arial, sans-serif" font-size="8.5" fill="#bae6fd" text-anchor="middle">Intermediate Focus • Touch Screen to Navigate</text>
</svg>
`;

// 3. Near Layer: Smartphone displaying crisp digital store bill / receipt at 0.40 m (approx 40 cm reading)
const dayNearSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <filter id="phoneShadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="15" stdDeviation="16" flood-color="#000000" flood-opacity="0.55"/>
    </filter>
    <linearGradient id="phoneBody" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="50%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <linearGradient id="receiptCard" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#f8fafc"/>
    </linearGradient>
  </defs>

  <!-- Hand holding phone from lower right -->
  <path d="M 600 ${H} C 580 520, 560 450, 530 400 C 510 360, 480 355, 470 380 C 460 405, 480 440, 500 480 C 530 530, 550 590, 560 ${H} Z" fill="#e2a373" opacity="0.95"/>
  <path d="M 880 ${H} C 840 540, 800 450, 780 390 C 770 360, 740 370, 735 410 C 730 460, 750 540, 770 ${H} Z" fill="#cca075"/>

  <!-- Smartphone Case / Bezel (Centered at near right) -->
  <g transform="translate(480, 80)" filter="url(#phoneShadow)">
    <!-- Titanium Outer Rim -->
    <rect x="-6" y="-6" width="452" height="562" rx="36" fill="#64748b" stroke="#94a3b8" stroke-width="2.5"/>
    <!-- Outer Bezel -->
    <rect x="0" y="0" width="440" height="550" rx="30" fill="url(#phoneBody)"/>
    
    <!-- Phone Screen (High-Resolution OLED Display) -->
    <rect x="10" y="10" width="420" height="530" rx="22" fill="url(#receiptCard)"/>

    <!-- Dynamic Island / Speaker Pill -->
    <rect x="165" y="18" width="90" height="18" rx="9" fill="#020617"/>
    <!-- Status Bar -->
    <text x="35" y="32" font-family="'Helvetica Neue', Arial, sans-serif" font-size="11" font-weight="bold" fill="#0f172a">09:41</text>
    <text x="385" y="32" font-family="'Helvetica Neue', Arial, sans-serif" font-size="10.5" font-weight="bold" fill="#0f172a" text-anchor="end">5G 98% 🔋</text>

    <!-- Bill Content Area (Crisp, High-Contrast Typography for Acuity Evaluation) -->
    <g transform="translate(25, 46)">
      <!-- Store Header -->
      <text x="185" y="22" font-family="'Helvetica Neue', Arial, sans-serif" font-size="18" font-weight="900" fill="#0f172a" text-anchor="middle" letter-spacing="1.5">GRAND GALLERIA MALL</text>
      <text x="185" y="38" font-family="Arial, sans-serif" font-size="12" font-weight="700" fill="#0284c7" text-anchor="middle" letter-spacing="0.5">PURCHASE RECEIPT &amp; TAX INVOICE</text>
      <line x1="10" y1="46" x2="360" y2="46" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="4,4"/>

      <!-- Meta Info -->
      <text x="10" y="64" font-family="monospace" font-size="10" font-weight="bold" fill="#334155">DATE: 26-OCT-2026 14:38</text>
      <text x="360" y="64" font-family="monospace" font-size="10" font-weight="bold" fill="#334155" text-anchor="end">ORDER: #98421</text>
      <text x="10" y="79" font-family="monospace" font-size="10" font-weight="bold" fill="#0369a1">NEAR TARGET: 0.40m (2.50 D)</text>
      <text x="360" y="79" font-family="monospace" font-size="10" font-weight="bold" fill="#16a34a" text-anchor="end">PAID VIA APPLE PAY</text>
      <line x1="10" y1="87" x2="360" y2="87" stroke="#94a3b8" stroke-width="1.5"/>

      <!-- Itemized Table Header -->
      <text x="10" y="103" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#0f172a">ITEM DESCRIPTION</text>
      <text x="270" y="103" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#0f172a" text-anchor="end">QTY</text>
      <text x="360" y="103" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#0f172a" text-anchor="end">PRICE</text>
      <line x1="10" y1="109" x2="360" y2="109" stroke="#cbd5e1" stroke-width="1"/>

      <!-- Item 1 -->
      <text x="10" y="128" font-family="Arial, sans-serif" font-size="12" font-weight="700" fill="#0f172a">Italian Silk Scarf</text>
      <text x="10" y="141" font-family="Arial, sans-serif" font-size="9.5" fill="#64748b">SKU: #882190 • Navy Blue Edition</text>
      <text x="270" y="128" font-family="Arial, sans-serif" font-size="11.5" fill="#334155" text-anchor="end">1</text>
      <text x="360" y="128" font-family="Arial, sans-serif" font-size="12" font-weight="700" fill="#0f172a" text-anchor="end">$145.00</text>

      <!-- Item 2 -->
      <text x="10" y="161" font-family="Arial, sans-serif" font-size="12" font-weight="700" fill="#0f172a">Designer Sunglasses Frame</text>
      <text x="10" y="174" font-family="Arial, sans-serif" font-size="9.5" fill="#64748b">SKU: #554102 • Polarized Black</text>
      <text x="270" y="161" font-family="Arial, sans-serif" font-size="11.5" fill="#334155" text-anchor="end">1</text>
      <text x="360" y="161" font-family="Arial, sans-serif" font-size="12" font-weight="700" fill="#0f172a" text-anchor="end">$195.00</text>

      <!-- Highlight Total Box -->
      <rect x="5" y="185" width="360" height="38" rx="6" fill="#0284c7" opacity="0.12"/>
      <rect x="5" y="185" width="360" height="38" rx="6" fill="none" stroke="#0284c7" stroke-width="2"/>
      <text x="18" y="210" font-family="Arial, sans-serif" font-size="14" font-weight="900" fill="#0369a1">TOTAL CHARGED</text>
      <text x="350" y="211" font-family="Arial, sans-serif" font-size="17" font-weight="900" fill="#0369a1" text-anchor="end">$340.00</text>

      <!-- Snellen / Jaeger Near Visual Acuity Reading Strip -->
      <g transform="translate(5, 235)">
        <rect x="0" y="0" width="360" height="152" rx="6" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1.5"/>
        <text x="180" y="18" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#0f172a" text-anchor="middle" letter-spacing="1">NEAR VISUAL ACUITY TEST CHART (40 cm)</text>
        <line x1="15" y1="25" x2="345" y2="25" stroke="#94a3b8" stroke-width="1"/>

        <!-- 20/80 (J7) - High legibility -->
        <text x="15" y="44" font-family="Arial, sans-serif" font-size="13.5" font-weight="bold" fill="#0f172a">[20/80 • J7] 1 2 3 4 5 6 7 8 9</text>
        <text x="345" y="44" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#475569" text-anchor="end">LARGE PRINT</text>

        <!-- 20/50 (J5) - Newspaper / Menu -->
        <text x="15" y="68" font-family="Arial, sans-serif" font-size="11.5" font-weight="bold" fill="#0f172a">[20/50 • J5] STORE RETURN POLICY: 30 DAYS</text>
        <text x="345" y="68" font-family="Arial, sans-serif" font-size="9.5" font-weight="bold" fill="#475569" text-anchor="end">NEWSPAPER</text>

        <!-- 20/30 (J2) - Standard Book / Smartphone -->
        <text x="15" y="91" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#0f172a">[20/30 • J2] SMARTPHONE MESSAGE BODY TEXT</text>
        <text x="345" y="91" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#0284c7" text-anchor="end">SMARTPHONE</text>

        <!-- 20/20 (J1) - Fine print / Medicine leaflet -->
        <text x="15" y="112" font-family="Arial, sans-serif" font-size="8.5" font-weight="bold" fill="#0f172a">[20/20 • J1] RX PHARMACY LABEL &amp; FINE INGREDIENTS</text>
        <text x="345" y="112" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#16a34a" text-anchor="end">FINE PRINT</text>

        <!-- Acuity note -->
        <text x="180" y="138" font-family="Arial, sans-serif" font-size="8.5" fill="#64748b" text-anchor="middle">Trifocal reads 20/20 J1 • Monofocal requires +2.5D reading glasses</text>
      </g>

      <!-- Barcode / QR Section -->
      <g transform="translate(65, 400)">
        <!-- Barcode lines -->
        <rect x="0" y="0" width="3" height="34" fill="#0f172a"/>
        <rect x="5" y="0" width="1.5" height="34" fill="#0f172a"/>
        <rect x="9" y="0" width="4.5" height="34" fill="#0f172a"/>
        <rect x="17" y="0" width="2" height="34" fill="#0f172a"/>
        <rect x="22" y="0" width="5.5" height="34" fill="#0f172a"/>
        <rect x="31" y="0" width="2" height="34" fill="#0f172a"/>
        <rect x="36" y="0" width="3" height="34" fill="#0f172a"/>
        <rect x="43" y="0" width="1.5" height="34" fill="#0f172a"/>
        <rect x="48" y="0" width="4.5" height="34" fill="#0f172a"/>
        <rect x="56" y="0" width="2" height="34" fill="#0f172a"/>
        <rect x="62" y="0" width="6.5" height="34" fill="#0f172a"/>
        <rect x="73" y="0" width="2" height="34" fill="#0f172a"/>
        <rect x="79" y="0" width="3" height="34" fill="#0f172a"/>
        <rect x="85" y="0" width="4.5" height="34" fill="#0f172a"/>
        <rect x="94" y="0" width="2" height="34" fill="#0f172a"/>
        <rect x="100" y="0" width="5.5" height="34" fill="#0f172a"/>
        <rect x="110" y="0" width="2" height="34" fill="#0f172a"/>
        <rect x="116" y="0" width="4.5" height="34" fill="#0f172a"/>
        <rect x="124" y="0" width="1.5" height="34" fill="#0f172a"/>
        <rect x="130" y="0" width="5.5" height="34" fill="#0f172a"/>
        <rect x="141" y="0" width="2" height="34" fill="#0f172a"/>
        <rect x="147" y="0" width="4.5" height="34" fill="#0f172a"/>
        <rect x="155" y="0" width="3" height="34" fill="#0f172a"/>
        <rect x="164" y="0" width="5.5" height="34" fill="#0f172a"/>
        <rect x="175" y="0" width="2" height="34" fill="#0f172a"/>
        <rect x="181" y="0" width="4.5" height="34" fill="#0f172a"/>
        <rect x="189" y="0" width="2" height="34" fill="#0f172a"/>
        <rect x="195" y="0" width="4.5" height="34" fill="#0f172a"/>
        <rect x="203" y="0" width="3" height="34" fill="#0f172a"/>
        <rect x="211" y="0" width="5.5" height="34" fill="#0f172a"/>
        <text x="115" y="48" font-family="monospace" font-size="9.5" font-weight="bold" fill="#334155" text-anchor="middle" letter-spacing="2">0 49102 84920 4</text>
      </g>
    </g>
  </g>
</svg>
`;

// --- NIGHT SCENE: HIGHWAY & STREET DRIVING ---
// 1. Far Layer: Road, signs, distant cars, skyline (15.0 m)
const nightFarSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="nightSky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#020617"/>
      <stop offset="60%" stop-color="#090d16"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <linearGradient id="roadSurface" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="50%" stop-color="#18202c"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
  </defs>

  <!-- Night Sky & Distant Skyline -->
  <rect x="0" y="0" width="${W}" height="${H}" fill="url(#nightSky)"/>
  
  <!-- Distant Skyscrapers with illuminated windows -->
  <rect x="80" y="160" width="70" height="180" fill="#090d16" stroke="#1e293b"/>
  <rect x="170" y="120" width="90" height="220" fill="#0b1120" stroke="#1e293b"/>
  <rect x="280" y="180" width="60" height="160" fill="#090d16"/>
  <rect x="680" y="140" width="80" height="200" fill="#0b1120" stroke="#1e293b"/>
  <rect x="780" y="170" width="100" height="170" fill="#090d16"/>

  <!-- Distant Lit Windows in Buildings -->
  <g fill="#fef08a" opacity="0.4">
    <rect x="185" y="135" width="4" height="6"/><rect x="195" y="135" width="4" height="6"/><rect x="215" y="135" width="4" height="6"/>
    <rect x="185" y="150" width="4" height="6"/><rect x="205" y="150" width="4" height="6"/><rect x="235" y="150" width="4" height="6"/>
    <rect x="195" y="170" width="4" height="6"/><rect x="225" y="170" width="4" height="6"/>
    <rect x="700" y="160" width="4" height="6"/><rect x="720" y="160" width="4" height="6"/>
    <rect x="710" y="180" width="4" height="6"/><rect x="730" y="180" width="4" height="6"/>
  </g>

  <!-- Overhead Highway Gantry & Signs at 15.0 m -->
  <rect x="140" y="80" width="680" height="14" fill="#334155" stroke="#475569"/>
  <line x1="150" y1="94" x2="150" y2="340" stroke="#475569" stroke-width="8"/>
  <line x1="810" y1="94" x2="810" y2="340" stroke="#475569" stroke-width="8"/>

  <!-- Green Highway Sign 1 -->
  <rect x="220" y="30" width="240" height="85" rx="6" fill="#14532d" stroke="#f8fafc" stroke-width="3"/>
  <text x="340" y="55" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">EXIT 14A • DOWNTOWN</text>
  <text x="340" y="75" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#86efac" text-anchor="middle">METRO AIRPORT  2 MI</text>
  <text x="430" y="98" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">➔</text>

  <!-- Green Highway Sign 2 -->
  <rect x="490" y="30" width="220" height="85" rx="6" fill="#14532d" stroke="#f8fafc" stroke-width="3"/>
  <text x="600" y="55" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">I-90 WEST • CITY CENTER</text>
  <text x="600" y="75" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#86efac" text-anchor="middle">SPEED LIMIT 55 MPH</text>
  <text x="600" y="98" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">KEEP LEFT</text>

  <!-- Asphalt Highway Road Surface -->
  <polygon points="120,340 840,340 ${W},${H} 0,${H}" fill="url(#roadSurface)"/>

  <!-- Road Shoulder & Guard Rails -->
  <line x1="120" y1="340" x2="0" y2="${H}" stroke="#64748b" stroke-width="3"/>
  <line x1="840" y1="340" x2="${W}" y2="${H}" stroke="#64748b" stroke-width="3"/>

  <!-- Dashed White Lane Markings -->
  <line x1="360" y1="340" x2="280" y2="${H}" stroke="#ffffff" stroke-width="4" stroke-dasharray="25,20"/>
  <line x1="480" y1="340" x2="480" y2="${H}" stroke="#eab308" stroke-width="5"/> <!-- Center double yellow -->
  <line x1="486" y1="340" x2="486" y2="${H}" stroke="#eab308" stroke-width="5"/>
  <line x1="600" y1="340" x2="680" y2="${H}" stroke="#ffffff" stroke-width="4" stroke-dasharray="25,20"/>

  <!-- Distant Oncoming SUV at 25m -->
  <rect x="420" y="325" width="44" height="24" rx="4" fill="#0f172a" stroke="#334155"/>
  <!-- Taillights of Leading Car at 18m -->
  <rect x="550" y="332" width="38" height="20" rx="3" fill="#0f172a"/>
  <circle cx="556" cy="342" r="4" fill="#dc2626"/>
  <circle cx="582" cy="342" r="4" fill="#dc2626"/>

  <!-- Street Lantern Poles along highway -->
  <line x1="170" y1="180" x2="170" y2="340" stroke="#64748b" stroke-width="3"/>
  <path d="M 170 180 Q 185 160 205 165" stroke="#64748b" stroke-width="3" fill="none"/>
  
  <line x1="790" y1="180" x2="790" y2="340" stroke="#64748b" stroke-width="3"/>
  <path d="M 790 180 Q 775 160 755 165" stroke="#64748b" stroke-width="3" fill="none"/>
</svg>
`;

// 2. Intermediate Layer: Car Dashboard, Instrument Cluster & Navigation Screen at 0.85 m
const nightIntermediateSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="dashLeather" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#090d16"/>
      <stop offset="40%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <linearGradient id="clusterBezel" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#334155"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <linearGradient id="screenMap" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
  </defs>

  <!-- Car Hood / Cowl edge visible at bottom of windshield -->
  <polygon points="0,480 ${W},480 ${W},${H} 0,${H}" fill="url(#dashLeather)"/>
  <path d="M 0 480 Q 480 440 ${W} 480 L ${W} ${H} L 0 ${H} Z" fill="url(#dashLeather)"/>

  <!-- Steering Wheel Top Arc (Left Side) -->
  <path d="M 140 ${H} C 140 450, 360 450, 360 ${H}" stroke="#1e293b" stroke-width="28" fill="none" stroke-linecap="round"/>
  <path d="M 140 ${H} C 140 450, 360 450, 360 ${H}" stroke="#334155" stroke-width="4" fill="none"/>

  <!-- Instrument Cluster Binnacle (Behind Steering Wheel at 0.85 m) -->
  <rect x="160" y="460" width="180" height="95" rx="10" fill="#020617" stroke="#475569" stroke-width="2"/>
  
  <!-- Digital Speedometer Cluster -->
  <text x="250" y="495" font-family="'Helvetica Neue', Arial, sans-serif" font-size="28" font-weight="900" fill="#38bdf8" text-anchor="middle">52</text>
  <text x="250" y="509" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#94a3b8" text-anchor="middle">MPH</text>
  
  <!-- Cluster Indicators -->
  <rect x="175" y="520" width="24" height="16" rx="3" fill="#0369a1"/>
  <text x="187" y="532" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">D</text>

  <text x="250" y="532" font-family="Arial, sans-serif" font-size="10" font-weight="600" fill="#38bdf8" text-anchor="middle">CRUISE 52</text>
  
  <text x="315" y="532" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#4ade80" text-anchor="middle">68°F</text>

  <!-- Center Console Navigation Screen (Mounted at 0.85 m) -->
  <g transform="translate(420, 440)">
    <rect x="-6" y="-6" width="252" height="162" rx="14" fill="url(#clusterBezel)" stroke="#64748b" stroke-width="2"/>
    <rect x="0" y="0" width="240" height="150" rx="10" fill="url(#screenMap)"/>

    <!-- GPS Navigation Top Banner -->
    <rect x="0" y="0" width="240" height="38" rx="10" fill="#15803d"/>
    <text x="15" y="24" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#ffffff">➔</text>
    <text x="40" y="18" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#ffffff">In 500 feet, turn right</text>
    <text x="40" y="30" font-family="Arial, sans-serif" font-size="9.5" fill="#dcfce7">onto Grand Avenue</text>

    <!-- Map Roads -->
    <line x1="30" y1="120" x2="200" y2="60" stroke="#334155" stroke-width="14"/>
    <line x1="80" y1="140" x2="160" y2="40" stroke="#38bdf8" stroke-width="8"/> <!-- GPS Route -->
    
    <!-- Vehicle Location Arrow -->
    <circle cx="105" cy="110" r="10" fill="#0284c7" stroke="#ffffff" stroke-width="2"/>
    <polygon points="105,104 110,114 105,112 100,114" fill="#ffffff"/>

    <!-- Navigation ETA Footer -->
    <rect x="0" y="122" width="240" height="28" fill="#0f172a" opacity="0.95"/>
    <text x="15" y="141" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#ffffff">18 min</text>
    <text x="70" y="141" font-family="Arial, sans-serif" font-size="10" fill="#94a3b8">9.4 mi • 11:42 PM</text>
  </g>
</svg>
`;

// 3. Emissive Light Sources Layer (High-intensity headlights, streetlamps for optical halo/glare)
const nightLightsSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <!-- High intensity oncoming xenon headlights (cores clipped white for HDR expansion) -->
  <circle cx="430" cy="336" r="6" fill="#ffffff"/>
  <circle cx="454" cy="336" r="6" fill="#ffffff"/>
  
  <!-- Leading car taillights -->
  <circle cx="556" cy="342" r="5" fill="#ff4d4d"/>
  <circle cx="582" cy="342" r="5" fill="#ff4d4d"/>

  <!-- Overhead streetlamp cores -->
  <circle cx="205" cy="165" r="7" fill="#ffffff"/>
  <circle cx="755" cy="165" r="7" fill="#ffffff"/>

  <!-- Distant streetlights along boulevard -->
  <circle cx="280" cy="280" r="3" fill="#ffffff"/>
  <circle cx="340" cy="300" r="3" fill="#ffffff"/>
  <circle cx="680" cy="300" r="3" fill="#ffffff"/>
  <circle cx="730" cy="280" r="3" fill="#ffffff"/>
</svg>
`;

async function buildAll() {
  console.log('Generating SVG files and rasterizing to PNG via Resvg...');

  const files = [
    { name: 'day_far_mall', svg: dayFarSvg },
    { name: 'day_intermediate_directory', svg: dayIntermediateSvg },
    { name: 'day_near_phone_bill', svg: dayNearSvg },
    { name: 'night_far_street', svg: nightFarSvg },
    { name: 'night_intermediate_dashboard', svg: nightIntermediateSvg },
    { name: 'night_lights_new', svg: nightLightsSvg },
  ];

  for (const item of files) {
    const svgPath = path.join(OUT, item.name + '.svg');
    const pngPath = path.join(OUT, item.name + '.png');
    fs.writeFileSync(svgPath, item.svg, 'utf-8');

    const resvg = new Resvg(item.svg, {
      fitTo: { mode: 'width', value: W },
      shapeRendering: 2, // geometricPrecision
      textRendering: 1,  // optimizeLegibility
      imageRendering: 0,
    });
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();
    fs.writeFileSync(pngPath, pngBuffer);
    console.log(`Rendered: ${item.name}.png (${pngBuffer.length} bytes)`);
  }

  // Also copy classic assets from iol-sim/assets/layers into public/assets/layers
  const oldLayers = path.join(ROOT, 'iol-sim', 'assets', 'layers');
  if (fs.existsSync(oldLayers)) {
    const list = fs.readdirSync(oldLayers);
    for (const f of list) {
      fs.copyFileSync(path.join(oldLayers, f), path.join(OUT, f));
      console.log(`Copied classic asset: ${f}`);
    }
  }

  console.log('All scene assets generated successfully!');
}

buildAll().catch(console.error);
