# Quethink Design System

## Direction

Mobile-first LMS, inspired by the clarity of Eduline. Indigo–apricot replaces the previous dark/orange film identity. Calm, educational, welcoming. The product is a database learning platform, not a generic editor.

## Tokens

Background #F8F7FC; surface #FFFFFF; text #25223D; muted text #625E78; indigo #4F46E5 primary/active/focus; apricot #C56A25 accent for learning illustrations; apricot ground #FFF0E3. Indigo text/actions on light backgrounds; white text on indigo primary buttons. Apricot never substitutes for error or completion meaning.

Typography: DM Sans interface/prose and Geist Mono SQL. Controls radius 12px, grouped panels 16px. Spacing 4/8/12/16/24/32/48/64px. Minimum touch control 44px. One primary action per screen; generous white space and short supporting copy.

## Mobile shell

Bottom navigation: Beranda, Materi, Menu, Tes, Profil (maximum five); Menu central, Profil right. Menu expands upward into a compact two-column panel above the bar: Lab Materi, SQLab, Chatbot, Pre-test and Post-test, plus Admin CMS for ADMIN only and an explicit Keluar action. Keep short labels, at least 44px touch targets, safe-area padding and a scrollable panel on short screens. Menu closes on selection, outside tap, Escape, its close button, or switching to desktop width; keyboard focus returns to the trigger on Escape. Respect reduced motion. Desktop uses header navigation. Dashboard resumes active test or current reading/core step. Reading is one column. Lab stacks schema, query and result; only required core exercises are displayed. Relasi modeling uses Susun/Diagram/Periksa tabs and labeled forms. Result tables scroll within their region.

## Landing

Simple hero, clear value proposition and real compact 2D schema preview. Follow with the pre-test → Materi → Lab Materi → post-test flow, three content groups, visual Lab, tutor and tests, then a dedicated SQLab section and CTA. Distinguish required course Labs from optional independent SQLab; describe downloadable PDFs, selectively available Indonesian videos, and name-only guest access with device-local progress. SQLab previews stay static and lightweight; do not load the runner or AI on the public landing page. No invented statistics, large decorative illustration, excessive gradient, glassmorphism or endless cards.

## States and accessibility

Show Belum dibaca, Lab inti, Tuntas and Terkunci with text, not color alone. Visible keyboard focus, associated labels, meaningful loading/error states, reduced-motion support. SQL canvas remains a conceptual model beside actual SQLite results, not a physical query plan.

## Source

Learning rules: 03-LEARNING_SYSTEM.md. Token/implementation record: ../DESIGN.md. User approved Indigo–apricot and the focused mobile LMS direction.

## Responsive edge cases

Landing and dashboard must reflow at 320px and 200% text size. Use bounded grid columns, allow long names/headings to wrap, and let progress labels stack. Bottom-navigation captions must wrap within their own target when text is enlarged; never force them onto a single line. The expanded panel uses the measured navigation height (including safe-area padding), so wrapping captions cannot make the panel overlap the bar. The landing schema preview stacks tables below 480px; every column used by its example query must be visible in the preview.

## SQLab workspace
Mobile has four labeled tabs: Skema, Data, Query, AI. Schema forms precede the 2D diagram; SQL precedes result tables. Desktop may place schema forms beside the diagram. Reuse the existing modeling forms, key labels, zoom and focus controls. Data editing uses labeled per-column inputs and accessible scroll regions. AI drafts show schema and sample records before explicit replacement. Keep reset and replacement confirmations inline; label local-only storage clearly.


## Mobile Lab density and shell

Lab Materi uses a short introduction, compact Tabel/Query/Hasil/Latihan links, and a collapsed exploration disclosure before the core task. The opened lab remains vertical: table → query → output. Do not remove full question context to shorten the page. SQLab stays a separate playground.

Icon controls, navigation links and auth links use a minimum 44px touch area. Table scrollers expose a named keyboard-focusable region. The bottom navigation adjusts to font scaling and safe-area insets; mobile text entry temporarily hides it. Chat follows new messages only while the learner is near the bottom; scrolling up preserves the reading position and reveals a latest-message action.


## Mobile sign-in

Login is an app entry rather than a blank form: brand, a concise database-learning introduction, a lightweight 2D Campus Mini relation preview, and the sign-in fields. Keep Masuk primary, Daftar inline, and Coba sebagai tamu secondary. Mobile uses one scrollable column without a carousel or fixed form; desktop may place the introduction beside the form. The preview is explanatory geometry only and does not load SQL, AI, or an interactive canvas.

## SVG assets

Reusable vectors live in `public/assets/quethink/`: `quethink-mark.svg` (Q with two connected table nodes), `database-relations.svg` (Campus Mini PK/FK), `query-filter.svg` (SELECT/WHERE), `data-update.svg` (targeted UPDATE), and `sqlab-schema.svg` (Katalog Buku), and `app-icon.svg` (padded application icon). Indigo marks query/relationship structure; apricot grounds results and the brand connector. The app icon uses a white Q on solid indigo; the header mark uses indigo on a transparent ground. Keep the paired table nodes and short apricot tail clear at small sizes. These are static explanatory diagrams, not interactive controls or physical query plans. Each diagram includes an Indonesian title/description; supply a meaningful alt when used through an image component. Assets have transparent outer backgrounds, explicit viewBox dimensions, no scripts or external resources. Shared headers use the mark; login reuses the relation diagram. The remaining diagrams are available for lesson/support visuals without automatically changing curriculum content. The previous cylinder logo is replaced: favicon, Apple/PWA icons and Android source exports use the new Q mark. `scripts/render-quethink-icons.mjs` reproduces the PNG exports from `app-icon.svg`; its padding keeps the symbol inside the maskable safe area. Installed Android APKs require a rebuild to update bundled launcher/splash graphics.

## Guest parity and local recovery
Account and guest share header/bottom navigation, dashboard, material list, reading/PDF/video, Lab, SQLab, chatbot, test introduction/questions and results components. Guest uses the same local learning sequence. Add one concise storage notice: “Mode tamu · progres tersimpan di perangkat ini”, with explicit failure/invalid states. Guest Profile keeps the account layout and adds local reset confirmation; results are marked unofficial. Reset must not clear account drafts.

## Learner terminology

Display the diagnostic pre-test as **Tes Awal** and the post-test as **Tes Akhir** throughout navigation, actions, instructions and result screens. Preserve existing route URLs, database types/slugs and scoring rules. Normalize legacy assessment titles/instructions at the display boundary. In the material list, use sequence number + title and a short **Baca** action; do not repeat “Materi” for every entry. The navigation destination remains **Materi**.
