# Flutter UI audit — 14 October 2026

Scope: native Login, Home, Materials, reading, core Lab, schema preview, Progress,
Profile, confirmations and native Android launch/window appearance. Source audit
plus Flutter widget/layout tests; no connected Android device was available.

## Findings addressed

| Priority | Finding | Change |
| --- | --- | --- |
| P1 | `ThemeMode.system` changed the app with Android night mode. | App policy is fixed light Indigo–apricot; no wallpaper/dynamic-color provider. |
| P2 | Night-mode Android launch/normal themes used a black parent. | Day/night resources use the same light window, splash background and Force Dark opt-out. |
| P2 | Login and app bars relied on implicit system-bar icon contrast. | Explicit dark icons on the app's light surfaces, including bootstrap failure. |
| P2 | Diagram relied on pinch/pan and an unlabeled reset workflow. | 48dp zoom buttons, labeled Show all and Focus table, table selector before canvas. |
| P2 | Diagram key relationships had no spoken connection description. | Relationship descriptions exposed to accessibility semantics. |
| P2 | Large text/multi-row schemas could exceed the old minimum zoom. | Show all fits actual table bounds; zoom can reach 10%; resizing refits. |

## Practices retained

- Native Material navigation: four destinations on phones; rail on wider windows.
- Native Back, SafeArea, scrolling and keyboard inset behavior remain enabled.
- Text scaling remains controlled by accessibility settings; it is not forced to 1.
- Material color roles, labeled form fields, loading/error/retry states.
- Vertical table → SQL → output → core task; reading stays separate.
- Diagram gestures remain available alongside one-handed controls. Selection
  updates records; guided modeling preview supports selecting/focusing each table.
- No changes to authentication, database schema, grading or progression.

## Evidence and remaining verification

- Widget regression changes Android brightness dark → light while the actual
  Quethink root app retains the same light color scheme and enlarged text.
- Android day/night resource consistency checked; APK resource compilation tested.
- Responsive widget coverage at 320/360/768 pixels and 200% text for schema/data.
- Tests exercise zoom center, selected-table focus, Show all restoration, 48dp
  control size and spoken relationships.
- Host-rendered Flutter previews are layout evidence, not Android device captures.
- Before release: test TalkBack traversal, OEM night/Force Dark overrides, Android
  gesture/three-button bars, keyboard, rotation and startup timing on a physical
  device. Do not claim universal OEM behavior or a perfect usability score.
- Android's keyboard, accessibility features and external apps keep their own
  settings. A debug APK is for testing; release signing is still required.

## Validation result

`flutter analyze`: PASS, no issues. `flutter test`: PASS, 40 tests.
Android ARM64 debug APK build: PASS. Native widget host previews inspected.
Physical-device / emulator capture: NOT RUN (no connected device).
