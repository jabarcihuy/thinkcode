# Quethink native Android

Native Flutter/Dart Android client, separate from the existing TWA in `/android`.
Application ID: `com.jabarcihuy.quethink_mobile`. Both apps can be installed together.
The website, Supabase database, Next.js backend and Admin CMS remain in place.

## Implemented first slice

Account email/password login → dashboard → flat published material list → reading
acknowledgement → required core Lab → verified progress → next material.

- Four native destinations: Home, Materials, Progress, Profile. Tablet uses a rail.
- English default / Indonesian, system light/dark theme, accessible native controls.
- Read-only Markdown materials; HTTPS video links open externally.
- Vertical Lab: 2D PK/FK schema and paginated records → SQL → output → core task.
  Relasi Labs have no query editor. Pinch/pan, Fit/Reset, named table selector.
- Core choices, ordering, output prediction and guided schema modeling reuse the
  published website content. Server checks answers; native SQL never grants scores.
- SQL on isolated synthetic in-memory SQLite, one statement, 4096 characters,
  SELECT in Read; single-row INSERT/UPDATE/DELETE in Write. Preview and explicit
  confirmation before applying changes; PK targeting, FK checks, Reset.
- 100 output rows / 16,000 characters / 500 characters per cell. SQLite authorizer
  denies schema, filesystem, extension and unsupported capabilities. Progress
  callback interrupts after 250,000 VM operations or 1500 ms; outer isolate is
  killed at 3 seconds. Isolates are concurrency boundaries, not OS security realms.
  No Dart/JavaScript evaluation, network, files, Auth clients or tokens are passed
  into the SQL isolate. Only validated synthetic datasets and SQL are passed.
- Tokens persisted with platform secure storage; role and ownership verified by
  the server. API errors, retry/loading/empty states and active-assessment gates.

Native registration, guest demo, independent SQLab/AI generation, Chatbot, Forum,
Final Challenge UI, PDF download and profile editing/photo upload are **not yet
ported**. They remain available on the website. Completing all native materials
is not course completion: the Final Challenge on the website must still be passed.
There is no offline progress queue; checking/saving reading requires internet.
Do not offer the website feature list as native parity.

## Setup

Requires Flutter 3.47.7 / Dart 3.13.5 or compatible newer stable, Android SDK/JDK,
and accepted Android SDK licenses. Never commit configuration or signing keys.

From repository root:

```sh
python3 flutter/tool/generate_config.py
cd flutter
flutter pub get
flutter run --dart-define-from-file=config.local.json
```

The generator reads only the two `NEXT_PUBLIC_SUPABASE_*` values. The three app
settings are `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `API_BASE_URL`. Public keys
are compiled into an APK and must remain public/anon only. Service-role, AI and
Cloudinary secrets belong only in Next.js, never in these files or Dart defines.
Copy `config.example.json` to ignored `config.local.json` if configuring manually.
Deploy `/api/mobile/v1` to Next.js before using the production-configured app.

Android emulator + local backend:

```sh
# Terminal 1, repository root
npm run dev -- --hostname 0.0.0.0
# Terminal 2, repository root
python3 flutter/tool/generate_config.py --emulator
cd flutter
flutter run --dart-define-from-file=config.emulator.json
```

Only debug Android builds allow HTTP loopback/emulator host; release requires
HTTPS. API endpoints verify bearer tokens, never use browser cookie identity.

## Verify/build

```sh
flutter analyze
flutter test
flutter build apk --debug --dart-define-from-file=config.local.json
```

Debug APK: `build/app/outputs/flutter-apk/app-debug.apk`. This is a test build.
Configure a private release signing key before Play Store distribution; generated
release signing currently uses the debug key. No iOS target was generated.

## SQLite build

Android builds SQLite 3.54.0 from verified, unmodified public-domain amalgamation
in `vendor/sqlite`. Package default binaries omit the authorizer/progress APIs and
must not replace this configuration. Native FFI guards are pinned to sqlite3 3.7.0;
verify their symbols after upgrades. Linux host tests use system `libsqlite3.so`
with authorization/progress enabled. Android execution still needs device tests;
host tests are not proof of an Android device run. Native/browser SQLite versions
may differ; supported SQL remains the documented course subset.

## Structure

`lib/core`: config, secure session storage, API, locale, shared theme/widgets.
`features/auth`: account login. `features/learning`: models, reading, navigation,
server progress. `features/lab`: native SQL policy/adapter, schema/data/output and
modular core answers. `features/profile`: account/language/sign-out.
`test`: SQL capability/limit/regression, bearer API and responsive widget tests.

No database migration is needed; existing RLS, guarded RPCs and trusted server
exercise grading remain authoritative. All learner SQL stays out of Supabase.

Optional live backend integration (repository root, local `.env` with server-only
service key; never run inside the APK):

```sh
npm run build
node --env-file=.env flutter/tool/check_backend.mjs
```

Creates temporary synthetic accounts, exercises all 11 published reading/core
steps via the native bearer API, checks ownership/forged scores/locked access and
active-assessment blocking, then deletes only those test accounts. This test reads
private grading keys server-side for its own submissions; it never embeds those
keys in app assets, API responses or logs.
