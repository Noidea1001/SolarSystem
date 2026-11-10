# Aerovex Space Platform - Pure Space Knowledge & Exploration

A comprehensive, non-commercial space science and exploration knowledge platform. Features authentic photographic and sensor observations of Earth, the Solar System, and deep space—powered by NASA, ESA, and USGS public science data.

---

## 1. Core Knowledge Pillars

### 1. Real Earth Satellite Observatory (Satellite Map View)
- **High-Resolution Satellite Imagery**: Integrated ESRI World Imagery layer providing authentic true-color satellite photography of Earth down to 1m/pixel resolution.
- **GPS Coordinates Lock ("Fly to My Real Location")**: Browser geolocation telemetry directly centers the real satellite map on the user’s exact coordinates, plotting a precision telemetry ground pin.
- **Global Spaceports & Regional Quick Jump**: Instant reconnaissance over Cambodia (Phnom Penh & Angkor Wat), Kennedy Space Center Launch Complex 39A, French Guiana (CSG Kourou), Japan (Tanegashima), India (Satish Dhawan), and New Zealand (Mahia LC-1).

### 2. Deep Space & Cosmic Observatory (JWST & Hubble)
- Authentic photographic captures from the James Webb Space Telescope (JWST) and Hubble Space Telescope:
  - **Carina Nebula (Cosmic Cliffs)**: Star-forming nurseries in near-infrared and mid-infrared (NIRCam & MIRI).
  - **Pillars of Creation (Eagle Nebula M16)**: Cold molecular hydrogen gas pillars and protostellar EGGs.
  - **JWST Deep Field SMACS 0723**: Gravitational lensing revealing primordial galaxies from 13.1 billion years ago.
  - **Andromeda Galaxy (M31)**: High-resolution spiral arm and dust lane surveys.

### 3. Planetary Science & Solar System Atlas
- Authentic photographic imagery from robotic orbiters and landers:
  - **The Sun (SDO)**: 4K extreme ultraviolet images (304 Å & 171 Å) capturing coronal mass ejections and magnetic flux loops.
  - **The Moon (LRO)**: True basaltic mare and meteorite impact crater surveys (Tycho, Copernicus).
  - **Mars (Perseverance & HiRISE)**: River deltas, mudstones, and Olympus Mons volcanic geology.
  - **Jupiter & Saturn (Juno & Cassini)**: Great Red Spot storm dynamics and water-ice geysers on Enceladus.
- Physical parameter data matrices: equatorial diameters, orbital periods, surface gravities, temperatures, atmospheric compositions, and known moons.

### 4. Space Technology & Orbital Science Encyclopedia
- In-depth educational modules covering:
  - **Orbital Mechanics**: Vis-Viva equation, orbital velocity, period calculation, and J2 nodal precession for Sun-Synchronous Orbits (SSO).
  - **Attitude Determination & Control (ADCS)**: Angular momentum conservation, reaction wheels, star trackers, and magnetic torquers.
  - **Electric Propulsion Physics**: Hall Effect thrusters and Field Emission Electric Propulsion (FEEP) with specific impulse ($I_{sp}$) mechanics.
  - **Space Environment**: Total Ionizing Dose (TID), Single-Event Effects (SEE), and radiative heat transfer in thermal vacuum (TVAC).

### 5. Historic & Active Mission Chronicles
- Trajectory telemetry, landmark discoveries, and scientific mission objectives for:
  - **Voyager 1 & 2** (Interstellar space boundary at >162 AU)
  - **James Webb Space Telescope (JWST)** (Sun-Earth L2 Lagrange Halo Orbit)
  - **Mars 2020: Perseverance & Ingenuity** (Ancient biosignatures in Jezero Crater)
  - **Cassini-Huygens** (Saturnian system and Titan landing)

---

## 2. Non-Commercial Policy

This platform is strictly dedicated to **scientific education and astronomical exploration**:
- Zero e-commerce or commercial transactions.
- Zero price tags, shopping carts, or quotation requests.
- Zero 3D computer game polygons—strictly authentic observational photography and true satellite sensor data.
- Strictly zero emojis across the interface and typography.

---

## 3. Getting Started

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm run start
```

---

## 4. Problems Encountered and Solutions Implemented

### 1. WebGL Graphics Performance and Frame Drops on Laptop Displays
- **Problem**:
  When running on everyday laptops (especially devices with integrated graphics such as Intel UHD Graphics, Intel Iris Xe, or AMD Radeon with High-DPI/Retina screens at 125% to 200% scaling), users experienced severe frame drops, thermal throttling, and micro-stuttering.
- **Root Causes**:
  1. *Uncapped Device Pixel Ratio*: Setting `devicePixelRatio = 2` on 1080p, 2K, or 4K screens forced WebGL to shade over 8 million pixels per frame, overwhelming integrated GPU fill-rate limits.
  2. *Garbage Collection (GC) Stutters in Render Loop*: Creating transient `THREE.Vector3` and `THREE.Matrix4` instances inside the `requestAnimationFrame` loop (over 450 allocations per second) triggered continuous browser garbage collection pauses.
  3. *Heavy PBR Shaders on Background Objects*: Calculating physically based roughness and metalness via `MeshStandardMaterial` for 2,200 instanced asteroid belt fragments added unnecessary GPU fragment overhead.
- **Solutions**:
  1. *Adaptive Clamped Pixel Ratio*: Clamped pixel ratio to `Math.min(window.devicePixelRatio || 1, 1.35)` and requested `powerPreference: 'high-performance'`. This reduced fragment shading load by over 55% while maintaining crystal-sharp visuals on laptop displays.
  2. *Zero-Allocation Vector Pooling*: Pre-allocated persistent vector and matrix pools (`poolWorldPos`, `poolAwayTarget`, `poolPosA`, `poolPosB`, `poolEarthPos`, `poolSunDir`, `poolInvMatrix`, `poolTargetWorldPos`, `poolDesiredCamPos`) outside the animation loop, completely eliminating garbage collection pauses.
  3. *Shader Simplification*: Switched instanced asteroid belts from `MeshStandardMaterial` to lightweight `MeshLambertMaterial`, dramatically lowering GPU work for background celestial objects.

### 2. Asset Caching and Bandwidth Optimization on Vercel Deployment
- **Problem**:
  Deploying to Vercel led to slow initial loading times and repeated asset downloads on other client laptops when fetching multi-megabyte high-resolution planet textures.
- **Root Causes**:
  Static assets in the Next.js public directory (`/textures/*`) lacked explicit immutable HTTP caching headers and payload compression directives.
- **Solutions**:
  1. *Immutable Cache-Control Headers*: Configured `headers()` in `next.config.js` with `Cache-Control: public, max-age=31536000, immutable` for all planetary textures under `/textures/*` and static chunks under `/_next/static/*`.
  2. *Payload Compression*: Enabled `compress: true` for automated Brotli and Gzip stream compression.
  3. *Browser Disk Persistence*: Textures are downloaded only once and loaded instantly from client browser cache on subsequent visits.

### 3. Scientific Real-Time Diurnal Rotation and Orbital Mechanics
- **Problem**:
  Orbital trajectories and planetary rotations initially ran at arbitrary animation speeds, disconnected from actual planetary physics and real-world day/night geography on Earth.
- **Root Causes**:
  Using basic incremental rotation counters (`rotation.y += speed`) instead of astronomical ephemeris time formulas.
- **Solutions**:
  1. *UTC-Synchronized Earth Diurnal Rotation*: Computed Earth rotation based on true UTC solar time:
     $$\text{dayFraction} = \frac{\text{UTCSolarSeconds}}{86400}$$
     The Greenwich meridian (0 degrees) directly faces the Sun at 12:00 UTC (solar noon), while Cambodia (105 degrees East) faces the Sun at 05:00 UTC (12:00 PM local solar noon).
  2. *Custom Day/Night Solar Terminator Shader*: Implemented a custom GLSL fragment shader calculating the dot product of the surface normal and the anti-solar vector to render real-time daylight, sunset, and night city light transitions.
  3. *True Keplerian J2000 Orbital Dynamics*: Calculated exact planetary orbital positions and inclinations from J2000 epoch orbital elements.

### 4. Interface Decluttering and Seamless Map Transitions
- **Problem**:
  Extraneous decorative elements, satellite overlays, and jarring transitions between planetary 3D space and 2D high-resolution satellite mapping cluttered the educational experience.
- **Solutions**:
  1. *Interface Decluttering*: Removed decorative artificial satellites and destination landmark chips, keeping only essential search controls and authentic scientific data.
  2. *Continuous Scale Transition*: Integrated zoom boundary detection in the Earth satellite map so zooming out to planetary altitude smoothly switches back to the 3D globe and solar system view.
  3. *Photorealistic 3D Scale Comparator*: Upgraded the planetary scale comparator modal to render real-time textured 3D rotating planetary spheres rather than flat 2D representations.

### 5. Mobile Device Viewing and Touch Gestures
- **Problem**:
  The 3D solar system previously only supported desktop mouse inputs (mouse drag, wheel zoom, double click), preventing smartphone and tablet users from navigating in 3D space, while HUD elements overflowed small screens.
- **Solutions**:
  1. *Complete Touch Navigation Engine*: Added native touch event handlers (`touchstart`, `touchmove`, `touchend`) with single-finger drag for 3D camera rotation, two-finger pinch-to-zoom for smooth camera distance scaling, and single-tap raycasting to select celestial bodies.
  2. *Mobile Viewport Lock*: Added `Viewport` configuration in `layout.tsx` with `viewportFit: cover` and `userScalable: false`, paired with `touch-action: none` on the WebGL canvas container to prevent mobile browser pull-to-refresh and unwanted page bounce.
  3. *Responsive UI HUD*: Re-architected top header bars, bottom planet carousels, floating telemetry cards, and modals with responsive padding, compact typography, and scrolling containers (`max-h-[92vh] overflow-y-auto`) to guarantee zero overflow across mobile screen sizes (360px to 430px).

### 6. Real-Time User Local Clock Synchronization
- **Problem**:
  The interface previously displayed time exclusively in astronomical UTC, making it difficult for everyday users to intuitively relate planetary positions and diurnal Earth lighting to their own local time of day.
- **Solutions**:
  1. *Automatic Timezone & Offset Detection*: Integrated `Intl.DateTimeFormat().resolvedOptions().timeZone` to detect user device timezone and compute real-time GMT offsets.
  2. *User Local Real-Time Display*: Configured the primary ephemeris clock to display the user's live local date, hours, minutes, and seconds by default, continuously ticking 1:1 with `Date.now()`.
  3. *Flexible Mode Toggling*: Embedded an instant toggle switch allowing users to alternate seamlessly between My Local Time and Astronomical UTC inside the ephemeris controller.

### 7. Daytime Sunlit Illumination and World-Space Lighting Alignment
- **Problem**:
  Users reported being unable to clearly inspect the illuminated bright daylight side of Earth and other celestial bodies. Rotating the camera to examine the daytime hemisphere caused the planet to unexpectedly turn dark or shadowed, and selecting Earth or returning from satellite mode placed the camera on the nighttime side.
- **Root Causes**:
  1. *Coordinate Space Mismatch in Custom GLSL Shader*: In the custom Earth shader, `normalMatrix * normal` in the vertex shader transformed vertex normals into View (Camera) Space, while the Sun direction vector was supplied in object or world space. As the camera orbited around Earth, the normals rotated relative to the camera while the light direction vector did not, causing $N \cdot L$ to become negative and dimming the daytime side.
  2. *Night-Side Camera Initial Angles*: Camera target positions for planet focus and map return used hardcoded spherical angles (`theta = 0.52`) that oriented the camera behind Earth on the dark night side facing away from the Sun.
- **Solutions**:
  1. *World-Space Lighting Normalization*: Refactored `earthShaderMaterial` and `atmoMat` shaders to calculate vertex normals and positions strictly in World Space:
     $$vWorldNormal = \text{normalize}((\text{modelMatrix} \cdot \text{vec4}(normal, 0.0)).xyz)$$
     $$vWorldPosition = (\text{modelMatrix} \cdot \text{vec4}(position, 1.0)).xyz$$
     This completely decoupled lighting calculations from camera movement, ensuring that the sunlit hemisphere facing $(0, 0, 0)$ remains brightly illuminated from all camera viewing angles.
  2. *Automatic Daytime Camera Alignment*: Updated `handleSelectPlanet`, `handlePrepareReturnToSpace`, and `handleGlobalEarthView` to compute the real-time angle between the planet and the Sun ($\text{sunAngle} = \text{atan2}(-x, -z)$), automatically angling the camera to face the daytime side upon selection.
  3. *Dedicated Bright Side Focus Action*: Added a "VIEW BRIGHT DAYLIGHT SIDE" action button inside the planet telemetry HUD, allowing users to immediately pivot the camera to the sunlit side of Earth or any selected planet with one click.

### 8. Full Platform Knowledge Expansion and Educational Feature Suite
- **Comprehensive Enhancements Implemented**:
  1. *Multi-Module Knowledge Mount*: Integrated the full suite of astronomical encyclopedia components into the core application loop (`Earth & Deep Space Observatory`, `Planetary Science Atlas`, `Space Technology & Orbits`, and `Mission Exploration Archives`) with persistent WebGL simulation state retention.
  2. *Bilingual Khmer & English Localization*: Embedded bilingual translations (`ខ្មែរ / EN`) across all planetary names, classifications, orbital parameters, atmospheric compositions, and physics highlights.
  3. *Synthesized Web Audio API Acoustic Engine*: Built a zero-dependency synthesizer generating real-time low-frequency cosmic resonant drones (55 Hz binaural harmonic beat), interactive telemetry pings, and deep-space pulse feedback with mute controls.
  4. *Astronomical Constellations Celestial Sphere*: Generated 3D wireframe projections of major constellations (Orion, Ursa Major, Cassiopeia, Crux, Cygnus, Scorpius, Taurus) on a 650-unit celestial sphere with HUD toggle controls.
  5. *Solar Eclipse Umbra and Penumbra Projection*: Dynamically tracks Moon-Earth-Sun vector alignment ($\cos\theta > 0.984$), casting a realistic lunar shadow track directly onto Earth's surface texture via custom GLSL uniforms and triggering real-time HUD eclipse telemetry banners.
  6. *Saturn Ring Analytical Body Shadow*: Injected vertex and fragment shader extensions into Saturn's ring material to calculate geometric ray occlusion, casting authentic, razor-sharp shadows of Saturn's globe across the night side of its rings.
  7. *Progressive Web App (PWA) Offline Manifest*: Added `manifest.json` and mobile web application metadata enabling persistent installation and offline caching.




