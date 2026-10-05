---
name: Quethink
description: A calm mobile learning lab for understanding relational data through reading, visual schemas, and SQL.
colors:
  background: "#f8f7fc"
  foreground: "#25223d"
  primary: "#4f46e5"
  primary-foreground: "#ffffff"
  secondary: "#eeecfb"
  secondary-foreground: "#302b5b"
  muted: "#f1f0f7"
  muted-foreground: "#625e78"
  border: "#dedce9"
  input: "#b0acbf"
  ring: "#4f46e5"
  destructive: "#b42335"
  code-surface: "#ffffff"
  code-foreground: "#302b5b"
  live: "#c56a25"
  live-surface: "#fff0e3"
  card: "#ffffff"
  selection: "#dcd8ff"
  scrollbar-thumb: "#b8b3cc"
typography:
  display:
    fontFamily: "var(--font-dm-sans), ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.65rem"
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "var(--font-dm-sans), ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  title:
    fontFamily: "var(--font-dm-sans), ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: "2rem"
    letterSpacing: "-0.025em"
  body:
    fontFamily: "var(--font-dm-sans), ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: "2rem"
  label:
    fontFamily: "var(--font-dm-sans), ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: "1.25rem"
  mono:
    fontFamily: "var(--font-geist-mono), ui-monospace, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: "1.5rem"
rounded:
  md: "0.75rem"
  lg: "1rem"
  inline-code: "0.25rem"
  full: "9999px"
spacing:
  1: "4px"
  2: "8px"
  3: "12px"
  4: "16px"
  5: "20px"
  6: "24px"
  8: "32px"
  12: "48px"
  16: "64px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 20px"
    height: "44px"
  button-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 20px"
    height: "44px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 20px"
    height: "44px"
  input:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
    height: "44px"
    width: "100%"
  mobile-nav-active:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: "0 4px"
    height: "56px"
  lesson-state:
    textColor: "{colors.foreground}"
  panel:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: "24px"
  schema-node:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    width: "224px"
  question-nav-active:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary-foreground}"
    rounded: "{rounded.md}"
    padding: "8px 4px"
  cms-nav-active:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
---

# Design System: Quethink

## Overview

**Creative North Star: "The Calm Learning Lab"**

Quethink uses the approved Eduline-inspired Indigo–apricot direction: welcoming, educational, and calm. Light lavender ground, white panels, generous reading space, and clear indigo actions help a beginner recognize the next step without decoding a dense interface.

Rounded controls and quiet dividers give the interface a friendly, practical character. Warm apricot highlights learning examples; compact 2D table diagrams connect the visual explanation with SQL and actual records. The interface remains focused on learning, with restrained motion and clear written states.

**Key Characteristics:**

- Light lavender ground with flat white panels.
- Indigo actions and navigation; apricot learning accents.
- DM Sans reading and interface text; Geist Mono SQL and identifiers.
- Touch sized controls and five mobile destinations.
- Local 2D schema diagrams with written learning states.

## Colors

The palette combines cool indigo structure with a warm apricot teaching accent and softly tinted neutrals. Frontmatter values are the normative record of the implemented palette.

### Primary

- **Learning Indigo** (`primary`): primary buttons, active navigation, links, query keywords, caret, and keyboard focus. `ring` shares this value; the implementation's accent and live-ink aliases also resolve to it.
- **White Action Ink** (`primary-foreground`): text on filled indigo controls.

### Secondary

- **Warm Apricot** (`live`): learning emphasis and the in-progress lesson marker.
- **Apricot Ground** (`live-surface`): highlighted schema columns, the warm preview table header, and example result surfaces.

### Neutral

- **Lavender Paper** (`background`): page ground and standard field background.
- **Deep Plum Ink** (`foreground`): headings, body copy, and completed lesson marks.
- **Pale Indigo** (`secondary`): selected navigation, schema headers, and support sections.
- **Indigo Ink** (`secondary-foreground`, `code-foreground`): selected question labels and code text.
- **Quiet Lavender** (`muted`): subdued blocks, hover surfaces, and empty progress tracks.
- **Muted Plum** (`muted-foreground`): supporting text, placeholders, and inactive navigation.
- **Lavender Divider** (`border`): panel boundaries and section dividers.
- **Field Stroke** (`input`): visible input and schema-node boundaries.
- **White Surface** (`card`, `code-surface`): panels and SQL surfaces.
- **Selection Lavender** (`selection`): selected text, paired with foreground ink.
- **Scrollbar Lavender** (`scrollbar-thumb`): thin scrollbar thumb on the page ground.

The destructive token supplies red error copy and error borders. Apricot carries learning emphasis rather than error or completion meaning.

**The Written State Rule.** Pair learning and assessment states with visible text or a distinct mark; color alone must never carry the meaning.

## Typography

**Display Font:** DM Sans with UI sans-serif and system fallbacks.

**Body Font:** DM Sans, locally loaded from the bundled variable font with swap display.

**Label/Mono Font:** Geist Mono with UI monospace fallback for SQL, data values, and compact schema identifiers.

**Character:** DM Sans keeps headings and explanatory prose in one approachable voice. Mono text identifies code and data without turning the surrounding interface into a console.

### Hierarchy

- **Display:** semibold, tightly tracked landing headline; the mobile size is recorded in frontmatter and expands to 3.75rem at the small breakpoint while retaining its compact line height.
- **Headline:** semibold page and section headings. Reading-page titles expand to 2.25rem at the small breakpoint.
- **Title:** semibold reading subheads and task titles; smaller section titles also use 1.25rem and 1.125rem where the hierarchy requires them.
- **Body:** regular reading prose with a maximum measure of 72ch. General supporting copy uses a 1.75rem line height; smaller supporting copy uses 0.875rem with a 1.5rem or 1.75rem line height.
- **Label:** semibold button labels. Mobile navigation uses 0.75rem medium text with a compact line height; schema metadata may use smaller mono labels within the diagram.
- **Mono:** query and code blocks use the recorded role; SQL fields remain 1rem on phones and become 0.875rem from the small breakpoint.

**The Reading Measure Rule.** Keep long learning prose in one column with the observed 72ch maximum; allow data tables to scroll within their own region.

## Layout

Learner headers, landing sections, dashboard, and material list share a centered 72rem maximum container. Reading and test introduction pages use a 48rem maximum. Admin workspaces expand to 80rem. Horizontal page padding starts at 20px and becomes 32px from 640px. Common content gaps use 16px, 24px, and 32px; larger section separations use 48px and 64px. Dashboard panels use 24px padding, expanding the main task panel to 32px at the small breakpoint.

Below 1024px, the protected shell places Beranda, Materi, Lab, Tes, and Profil in five equal bottom-navigation columns. Lab occupies the center. The bar reserves the device safe area, and content reserves bottom space. At 1024px, account navigation moves into the header. Public headers wrap their actions when needed.

Reading remains one column. Lab stacks schema, query, and results; table and canvas overflow stays inside the relevant region. Schema modeling uses Susun, Diagram, and Periksa tabs below 1024px and shows the working regions together above it. Schema-node positions use a compact stack below a 480px canvas viewport.

Assessment questions use five columns of numbered controls below 768px, then a 12rem side navigator beside the question. Each number can show the written Terisi state. CMS navigation uses two columns on phones, three from 640px, and one side column from 1024px. These controls wrap within the available width.

## Elevation & Depth

Most surfaces are flat: white or pale tinted backgrounds, borders, and spacing establish grouping. The shared diffuse surface shadow is reserved for overlays and the keyboard skip link. The assessment confirmation dialog uses a dark translucent backdrop. No decorative depth is required on normal learning panels.

### Shadow Vocabulary

- **Surface:** `0 1px 2px hsl(var(--shadow-color) / 0.06), 0 8px 24px -12px hsl(var(--shadow-color) / 0.12)`. The shadow tint is the implemented HSL channel value `245 22% 25%`.

**The Flat Panel Rule.** Use borders, spacing, and tonal surfaces for ordinary panels; reserve the shared shadow for surfaces that actually float.

## Shapes

Controls use the medium radius and grouped panels use the larger radius recorded in frontmatter. Inline code uses a small radius; numbered journey markers and progress marks use fully rounded ends. Borders are generally a single quiet stroke. Schema nodes remain compact rectangles with readable headers and rows; the teaching canvas confines its dotted grid to the diagram region.

## Components

### Buttons

Clear, friendly actions with a consistent touch target.

- Primary buttons use indigo with white text; outline buttons use the page ground and a divider border; ghost buttons use foreground text over a transparent ground.
- The default control has a 44px height and minimum height, 20px horizontal padding, and 14px semibold text. The small size retains the 44px minimum with 16px horizontal padding; the large size is 48px high with 24px padding.
- Primary hover reduces background opacity to 90%; outline and ghost hover use the muted surface. Keyboard focus is a 2px indigo outline offset by 2px. Disabled buttons prevent pointer interaction and use 50% opacity.

### Chips / State Labels

Learning state labels are compact text with a short visual mark rather than large filled badges. Completed, available, in-progress, and locked labels carry explicit wording. The locked mark is dashed; in-progress uses an apricot mark with indigo text. These informational labels do not acquire button hover behavior.

### Cards / Containers

White panels use the larger radius, a divider border, and generous internal space. Main learning tasks can use a faint indigo border. Standard dashboard panels are flat at rest; grouped lists use dividers instead of a separate card for every row. A panel with an action uses the shared button or a visibly focused link inside it.

### Inputs / Fields

Fields use the page ground, a visible field stroke, and the control radius. Standard inputs are 44px high with 12px horizontal padding; mobile text is 16px, becoming 14px from 640px. Placeholder text uses muted plum. Focus changes the stroke to indigo and adds a 2px ring at 20% opacity. Disabled fields show reduced opacity and a blocked cursor. Error explanations use explicit text and the destructive token. SQL fields use mono text and the white code surface.

### Navigation

Mobile navigation pairs a 19px line icon with a short label in a 56px minimum target. Inactive items use muted plum; active and hovered items use pale indigo, with active text in indigo. Keyboard focus uses the shared outline. Current page is exposed through `aria-current`. Desktop navigation uses the shared ghost buttons.

Assessment navigation exposes the current step and written answer state. CMS navigation uses an indigo filled current item, quiet text for inactive items, muted hover, and a visible keyboard outline. Both adapt by changing their grid rather than shrinking their labels.

### Schema Nodes and Tables

Schema nodes are 224px wide, with 44px headers and column targets. Headers use pale indigo; query-related columns may use apricot ground. Names and values use mono text, keys retain PK/FK labels, and node selection strengthens the border. Column hover uses muted ground; keyboard focus stays within the node. The dotted canvas uses a 20px grid. Result tables have explicit headers and their own keyboard reachable scrolling region.

Loading uses a narrow indigo travel mark on a pale track. Reduced-motion users receive a static mark. Shared state transitions change color; no movement is required to understand an action.

## Do's and Don'ts

### Do:

- Do use the recorded Indigo–apricot palette and local DM Sans interface type.
- Do give each screen a clear primary next action and keep supporting copy short.
- Do retain visible labels, keyboard focus, and at least 44px touch controls.
- Do keep reading in one calm column and table overflow within its own region.
- Do pair status color with text or a distinct mark.
- Do keep the dotted grid and pan/zoom interaction inside the 2D schema workspace.

### Don't:

- Don't restore the discarded dark/orange film identity.
- Don't add decorative 3D, glassmorphism, excessive gradients, or an app-wide canvas.
- Don't turn every list row or reading paragraph into a separate card.
- Don't use apricot as a substitute for error or completion meaning.
- Don't hide the next action in an overflowing navigation strip.

<!-- Source record: observed implementation, 5 October 2026.
/home/ael/DATA/project on linux/webapp/ThinkCode/src/app/globals.css
/home/ael/DATA/project on linux/webapp/ThinkCode/src/app/layout.tsx
/home/ael/DATA/project on linux/webapp/ThinkCode/src/app/page.tsx
/home/ael/DATA/project on linux/webapp/ThinkCode/src/components/ui/button.tsx
/home/ael/DATA/project on linux/webapp/ThinkCode/src/components/ui/input.tsx
/home/ael/DATA/project on linux/webapp/ThinkCode/src/components/layout/mobile-bottom-navigation.tsx
/home/ael/DATA/project on linux/webapp/ThinkCode/src/features/learning/components/lesson-content.tsx
/home/ael/DATA/project on linux/webapp/ThinkCode/src/features/learning/components/lesson-state.tsx
/home/ael/DATA/project on linux/webapp/ThinkCode/src/features/database/components/schema-table-node.tsx
/home/ael/DATA/project on linux/webapp/ThinkCode/src/features/assessment/components/question-navigator.tsx
/home/ael/DATA/project on linux/webapp/ThinkCode/src/features/admin/components/admin-console.tsx
Approved visual direction: /home/ael/DATA/project on linux/webapp/ThinkCode/docs/10-DESIGN_SYSTEM.md
-->
