# Berlin Venture Atlas

**Berlin Venture Atlas** is a high-density, interactive data intelligence platform designed to map the heartbeat of the Berlin startup ecosystem. It transforms complex hierarchies of sectors, verticals, and companies into a fluid, research-grade visual experience.

Built for investors, founders, and policy-makers, the Atlas provides a macro-to-micro view of capital distribution and innovation clusters in Europe's most dynamic tech hub.

---

## The Intelligence Matrix

- **Active Capital Matrix**: A real-time (Feb 2026) validated database of the most active VC funds, ranked by AUM, deal velocity, and unicorn-backing performance.
- **Ecosystem Treemap**: A dense spatial map of every significant startup in Berlin, categorized by sector intensity.
- **Micro-to-Macro Navigation**: Fluid breadcrumb-based deep dives into specific verticals like *Defense AI*, *GovTech*, and *Quantum Computing*.
- **Brutalist Design Language**: A high-contrast, typographic aesthetic inspired by research journals and financial terminals, prioritizing data density and legibility.

---

## Solving the "Infinite Density" Visual Problem

The core of the Berlin Venture Atlas is a custom-engineered **D3.js Treemap** engine. Standard data visualizations often break when forced to display thousands of disparate data points with highly varied values (from €1M seed rounds to €10B public giants). 

We solved this through several key technical innovations:

### 1. Square Root Spatial Allocation
To prevent tiny startups from disappearing into single-pixel "dust," we implement a **Square Root Scaling** algorithm (`Math.pow(v, 0.5)`). This puffs up the visual footprint of smaller companies just enough to remain interactive and legible, while still maintaining the proportional weight of the market leaders.

### 2. Recursive Padding Architecture
One of the most complex challenges in nested treemaps is header maintenance. We developed a **Fixed-Header Padding System** that strictly reserves exactly `24px` at the top of every parent category, regardless of the current zoom depth. This ensures that the user always knows exactly which "Sector" and "Vertical" they are looking at in any zoom state.

### 3. Vertical Expansion Wheel-Interception
When a specific sector (like Fintech) is exceptionally dense, a standard screen-fitted treemap becomes unusable. Our engine intercepts **Wheel Events** to allow the map to "Expand Vertically" up to **800% of the viewport height**. This creates a "scrollable map" that maintains the squarify layout logic while providing enough physical space for every data point to breathe.

### 4. HTML-in-SVG Hybrid Rendering
We moved away from standard SVG `<text>` elements, which struggle with text-wrapping and complex CSS styling. Instead, the Atlas uses **SVG ForeignObjects** to inject scoped HTML/Tailwind containers into the D3 nodes. This allows us to use responsive typography, sophisticated overflow truncation, and hover states that are impossible with raw SVG.

---

## Data & Validation

All data in the Berlin Venture Atlas is sourced from high-fidelity intelligence feeds including **PitchBook**, **Sifted**, **EU-Startups**, and direct fund disclosures. The platform is calibrated to reflect the state of the market as of **Q1 2026**.

---

© 2026 Venture Intelligence Unit. All rights reserved.
