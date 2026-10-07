# Quethink Design System

## Direction

Mobile-first LMS, inspired by the clarity of Eduline. Indigo–apricot replaces the previous dark/orange film identity. Calm, educational, welcoming. The product is a database learning platform, not a generic editor.

## Tokens

Background #F8F7FC; surface #FFFFFF; text #25223D; muted text #625E78; indigo #4F46E5 primary/active/focus; apricot #C56A25 accent for learning illustrations; apricot ground #FFF0E3. Indigo text/actions on light backgrounds; white text on indigo primary buttons. Apricot never substitutes for error or completion meaning.

Typography: DM Sans interface/prose and Geist Mono SQL. Controls radius 12px, grouped panels 16px. Spacing 4/8/12/16/24/32/48/64px. Minimum touch control 44px. One primary action per screen; generous white space and short supporting copy.

## Mobile shell

Bottom navigation: Beranda, Materi, Menu, Tes, Profil (maximum five); Menu central, Profil right. Menu expands upward into a compact two-column panel above the bar: Lab Materi, SQLab, Pembuat Skema, Chatbot, Pre-test and Post-test, plus Admin CMS for ADMIN only and an explicit Keluar action. Keep short labels, at least 44px touch targets, safe-area padding and a scrollable panel on short screens. Menu closes on selection, outside tap, Escape, its close button, or switching to desktop width; keyboard focus returns to the trigger on Escape. Respect reduced motion. Desktop uses header navigation. Dashboard resumes active test or current reading/core step. Reading is one column. Lab stacks schema, query and result; only required core exercises are displayed. Relasi modeling uses Susun/Diagram/Periksa tabs and labeled forms. Result tables scroll within their region.

## Landing

Simple hero, clear value proposition and real compact 2D schema preview. Follow with learning flow, three content groups, visual Lab, tutor and tests, then CTA. No invented statistics, large decorative illustration, excessive gradient, glassmorphism or endless cards.

## States and accessibility

Show Belum dibaca, Lab inti, Tuntas and Terkunci with text, not color alone. Visible keyboard focus, associated labels, meaningful loading/error states, reduced-motion support. SQL canvas remains a conceptual model beside actual SQLite results, not a physical query plan.

## Source

Learning rules: 03-LEARNING_SYSTEM.md. Token/implementation record: ../DESIGN.md. User approved Indigo–apricot and the focused mobile LMS direction.

## Responsive edge cases

Landing and dashboard must reflow at 320px and 200% text size. Use bounded grid columns, allow long names/headings to wrap, and let progress labels stack. Bottom-navigation captions must wrap within their own target when text is enlarged; never force them onto a single line. The expanded panel uses the measured navigation height (including safe-area padding), so wrapping captions cannot make the panel overlap the bar. The landing schema preview stacks tables below 480px; every column used by its example query must be visible in the preview.
