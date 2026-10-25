# Aerovex Space Platform (NewSpace OS)

Enterprise space mission architecture configurator, verified NewSpace subsystem catalog, and B2B orbital procurement marketplace with milestone-based escrow.

---

## 1. Core Platform Pillars

### 1. Mission Architect & Subsystem Configurator ("SpecForge")
- **Live 3D CAD & Digital Twin Viewer**: High-precision WebGL/Three.js rendering of satellite buses (1U to 16U / ESPA) with real-time exploded subassembly view, wireframe inspection, and solar wing deployment.
- **Orbital Mechanics Engine**: Real-time computation of orbital period, circular velocity, eclipse vs sunlight duration, and ground pass cadence for LEO SSO, Polar, Mid-Inclination, and GEO orbits.
- **Mass Budget Engine**: Real-time mass roll-up with standard AIAA/ECSS 20% engineering design reserve, checking against launch dispenser envelopes.
- **Power Balance Engine**: Day generation calculation based on multi-junction solar array efficiency vs cumulative bus load, validating net orbit energy balance (Wh) and battery depth-of-discharge.
- **Engineering Specification Export**: One-click download of the complete formal engineering specification and Bill of Materials (BOM).

### 2. Subsystems Directory & Research Engine
- Indexed aerospace components across all primary disciplines:
  - **ADCS**: Reaction wheels, magnetorquers, star trackers (e.g. BCT XACT-50, CubeADCS).
  - **Propulsion**: Electric FEEP and non-toxic green bi-propellant thrusters (e.g. ENPULSION Micro R3, Dawn Aerospace B20).
  - **Power & EPS**: Modular MPPT power distribution and triple-junction deployable arrays (e.g. GomSpace P31u, Spectrolab XTJ Prime).
  - **Avionics & OBC**: Radiation-tolerant LEON3-FT processors and edge AI inference computers (e.g. AAC Clyde Space Sirius, Unibap SpaceCloud).
  - **Communications / TT&C**: High-rate S-Band and X-Band downlinks (e.g. EnduroSat S-Band, IQ Wireless XLink).
  - **Optical Payloads**: Earth observation multispectral imagers (e.g. Simera Sense xScape100).
  - **Chassis & Thermal**: Space-grade aluminum 7075-T6 skeletons (e.g. NanoAvionics 6U).
- Strict export control classification tagging: **ITAR-Free**, **EAR99**, and **ITAR Category XV**.
- Technology Readiness Level validation (**TRL 1 through 9**) with verified flight heritage hours.

### 3. B2B Aerospace Marketplace & Milestone Escrow
- Commercial hardware queue with quantity adjustment and lead time tracking.
- Three-stage milestone escrow terms:
  - 25% Advance: Parts procurement and fabrication initiation.
  - 45% Acceptance: Passing Thermal Vacuum (TVAC) and random vibration qualification.
  - 30% Delivery: Cleanroom inspection and pre-integration sign-off.
- Bilateral Non-Disclosure Agreement (NDA) and formal RFQ transmission engine.

### 4. Launch Rideshare & Orbital Brokering
- Live manifest booking across SpaceX Falcon 9 Transporter rideshares, Rocket Lab Electron, and European launch vehicles.
- Real-time mass slot calculator ($/kg) with standard deployer compatibility checks (Exolaunch, Maxwell, ISRO).

### 5. Ground Station as a Service (GSaaS)
- Global parabolic dish network scheduling (Svalbard SvalSat, Inuvik Arctic, Puertollano Spain, Dongara Australia).
- Automatic pass throughput and downlink volume estimation (S-band, X-band, UHF).

### 6. Subsystem Trade Study Comparator
- Side-by-side spec comparison matrix evaluating mass, power, radiation hardness, interfaces, flight hours, and unit pricing.

### 7. Supplier Onboarding & Listing Studio
- Manufacturer portal for submitting new flight hardware, managing qualification dossiers (TVAC logs, vibration shaker profiles, TID reports), and issuing formal quotes.

---

## 2. Tech Stack & Future-Proof Full-Stack Architecture

```
┌────────────────────────────────────────────────────────┐
│               Frontend: Next.js + Three.js             │
│  (3D Satellite CAD, Interactive Budgets, Clean Dark UI)│
└───────────────────────────┬────────────────────────────┘
                            │ API / GraphQL
┌───────────────────────────┴────────────────────────────┐
│                    Full-Stack Core                     │
│    Next.js App Router (TypeScript) + Server Actions    │
│            (Marketplace, Auth, Escrow, RFQs)           │
└───────────────────────────┬────────────────────────────┘
                            │ Internal Microservice
┌───────────────────────────┴────────────────────────────┐
│                Python (FastAPI) AI Engine              │
│ (Astropy, Orbital mechanics, Spec Sheet RAG / Vector)  │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────┴────────────────────────────┐
│      PostgreSQL (pgvector) + Redis + Object Storage    │
└────────────────────────────────────────────────────────┘
```

1. **Frontend**: Next.js 14 / React 18, TypeScript, Three.js, Tailwind CSS, Lucide Icons.
2. **Backend**: TypeScript Node.js / Next.js Server Actions for transaction workflows + Python (FastAPI) for Astropy and datasheet RAG parsing.
3. **Database**: PostgreSQL with `pgvector` for semantic search across thousands of hardware datasheets and pinouts.

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
