# Venture Atlas

**Venture Atlas** is a highly interactive, fluid D3.js and React-based data visualization platform. It explores and maps out corporate and startup ecosystems into beautifully ordered hierarchical treemaps.

## Features

- **Fluid Zooming:** Smooth, GSAP-powered spatial continuous zooming scaling seamlessly through infinite hierarchical levels without browser rendering distortion.
- **Paradigm-Style Typography:** A rigorously built custom D3 padding mapping system ensures text is never squished, wrapped incorrectly, or artificially forced out of frame. 
   - Metadata and Category tags are rendered with explicitly constrained `font-mono`, uppercase muted colors, snapping flush to their designated allocation space.
   - Companies are aggressively presented as data payload, anchoring securely with dense, high-contrast, `font-sans` weights.
- **Ecosystem Rendering:** Supports categorizing data by overarching standard ecosystem sectors (e.g. Fintech, Healthcare), isolating nested verticals, and visualizing their raw monetary impacts geographically.
- **Physical Bounding Math:** The treemap avoids D3's typical "absolute dimension locking" flaw during continuous zoom states. It intercepts abstract layouts dynamically and restricts headers via customized React recursive math—capping structural layers to `15%` maximum footprint so data payload (the companies) dominantly scales at up to 500x magnification without clipping.
- **Hover Overlays:** Rich framer-motion powered follow-mouse hovering tooltips instantly inject complete data profiles of companies onto the viewport smoothly.

## Technologies Used

- **React / Vite**: Core rendering framework.
- **D3.js**: Calculates squarified treemap hierarchies and scale domains dynamically based on value inputs (e.g., millions of euros).
- **GSAP**: Executes multi-threaded matrix transforms (`tween()`) across the component lifecycle for 60fps zooming without causing expensive HTML layout repaints.
- **Tailwind CSS**: Strict, atomic functional design styling defining the physical typography matrices and border layouts.
- **Framer Motion**: Orchestrates organic, mass/spring fluid layout changes and tooltip interpolations.

## Running Locally

To start the platform up via the development server:
```bash
npm install
npm run dev
```

To build for an optimized static production release:
```bash
npm run build
```
