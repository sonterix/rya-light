# Design System Specification: Editorial Precision

## 1. Overview & Creative North Star

### Creative North Star: "The Clinical Architect"
This design system is built for high-stakes, data-centric environments where clarity is paramount and every pixel must justify its existence. We are moving away from the "soft and bubbly" web of the last decade toward a style we call **Organic Brutalism**. 

The system prioritizes a high-density, editorial aesthetic that feels more like a premium technical journal than a standard SaaS dashboard. It rejects the generic "card-on-gray" layout in favor of a structured, monochromatic canvas where depth is communicated through tonal shifts rather than shadows. The result is an interface that feels intentional, authoritative, and surgically precise.

**Design Principles:**
*   **Intentional Asymmetry:** Use the 8-point grid to create layouts that feel balanced but not perfectly mirrored, giving the UI an editorial, "crafted" feel.
*   **Clinical Warmth:** The base of Stone and Warm Gray prevents the high-density data from feeling cold or intimidating.
*   **Data as Hero:** Typography and spacing are optimized for large datasets, ensuring readability without sacrificing sophistication.

---

## 2. Colors

The color strategy is strictly monochromatic and warm, punctuated only by a surgical application of **Crimson (#77080E)**. 

### Palette Strategy
*   **Primary (Crimson):** Use sparingly. Reserved for primary CTAs, active states, and critical data points. 
*   **Surface Hierarchy:** We utilize a "Nested Surface" approach.
    *   **Base Background:** `surface` (#f9f9f8). Apply a minimal grid texture (1px lines at 5% opacity) or 2% noise to eliminate "dead" white space.
    *   **Sidebar (Obsidian):** `#18101F`. High contrast against the stone canvas to ground the navigation.
*   **The "No-Line" Rule:** Prohibit the use of 1px solid borders for sectioning. Boundaries must be defined through background color shifts. For instance, a `surface-container-low` (#f2f4f3) block should sit directly on a `surface` background to create a "recessed" or "elevated" zone without a harsh structural line.

### Key Tokens
*   **Primary:** `#ac322e` (Crimson)
*   **Surface (Base):** `#f9f9f8` (Stone)
*   **Surface Container (Low):** `#f2f4f3`
*   **Surface Container (High):** `#e4e9e8`
*   **On-Surface:** `#2d3433` (Charcoal)

---

## 3. Typography: The Inter Grid

We use **Inter** exclusively. It is the gold standard for high-density UI due to its tall x-height and exceptional legibility at small scales.

*   **Display & Headlines:** Use `display-md` (2.75rem) and `headline-sm` (1.5rem) with tight letter-spacing (-0.02em) to create an editorial "header" feel. 
*   **The Technical Body:** Use `body-md` (0.875rem) for the majority of data points.
*   **Labels:** `label-sm` (0.6875rem) in all-caps with +0.05em tracking for metadata or table headers. This conveys a "clinical" look.

---

## 4. Elevation & Depth: Tonal Layering

Traditional drop shadows are forbidden. We communicate hierarchy through **Physical Stacking**.

*   **The Layering Principle:** Depth is achieved by stacking `surface-container` tiers. 
    *   *Level 0:* Background (`surface`).
    *   *Level 1:* Recessed content areas (`surface-container-low`).
    *   *Level 2:* Interactive modules or "cards" (`surface-container-lowest` / White).
*   **Ghost Borders:** If a boundary is required for accessibility in high-density tables, use a "Ghost Border": `outline-variant` (#adb3b2) at 15% opacity.
*   **The Obsidian Sidebar:** This is the only element that ignores the tonal rule. It should feel like a heavy, physical slab. The active indicator is a **2px Crimson (#77080E)** vertical stroke on the extreme left/right edge.

---

## 5. Components

### Buttons
*   **Primary:** Solid Crimson (`primary`). No gradient. White text. 8px rounding.
*   **Secondary:** Ghost style. No background, 1px Ghost Border (`outline-variant` at 20%), Stone text.
*   **Tertiary:** Text-only, underlined on hover.

### Inputs & Form Fields
*   **Styling:** Use `surface-container-highest` for the input background to make it feel "carved" into the surface.
*   **Focus State:** A crisp 2px border of `primary` (Crimson). No outer glow/halo.

### Data Tables (The Core)
*   **Headers:** `label-sm` typography, Slate-tinted background (`surface-container-high`).
*   **No Dividers:** Remove horizontal lines between rows. Use alternating row colors (`surface` vs `surface-container-low`) or 1.5 spacing (`spacing-1.5`) to separate data points.
*   **Density:** High. Cell padding should follow `spacing-2` (0.4rem) vertically and `spacing-4` (0.9rem) horizontally.

### Interactive "Glass" Chips
For filter tags, use semi-transparent backgrounds with a 4px backdrop-blur. 
*   **Token:** `surface-variant` at 40% opacity + 8px blur. This creates a "premium lens" effect over data visualizations.

---

## 6. Do's and Don'ts

### Do
*   **DO** use strict 8px spacing increments for all layout gaps.
*   **DO** lean into "Stone" and "Slate" for 90% of the UI; save Crimson for the final 10% of "action."
*   **DO** use high-contrast Obsidian for the sidebar to provide a visual anchor.
*   **DO** use the `surface-container` tiers to create hierarchy. A card should feel like it's sitting *on* a surface, not just outlined.

### Don't
*   **DON'T** use shadows. If it doesn't look deep through color alone, adjust the surface tones.
*   **DON'T** use blue or pink tones for success or error states. Use Crimson for errors and Charcoal/Slate for neutral success states.
*   **DON'T** use 1px black or high-contrast borders. They break the editorial flow.
*   **DON'T** use default Inter tracking. Tighten headlines and loosen labels to create a custom feel.