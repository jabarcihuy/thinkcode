# SQLite amalgamation 3.54.0

Unmodified `sqlite3.c` and `sqlite3.h` from the SQLite public-domain distribution:
https://sqlite.org/2026/sqlite-amalgamation-3540000.zip

Archive SHA3-256:
`7b670a62fdfbd672b75fef004cb703c8a3e87d3a5cc7d675b4a08337004a2d93`

Verified before extraction. Copyright: https://sqlite.org/copyright.html

Android compiles this source using the sqlite3 package's documented build hook.
Default precompiled package binaries omit authorizer/progress callbacks, so they
cannot enforce this course's runtime policy. Our build keeps those callbacks and
disables extension loading. Linux host tests use system SQLite (authorizer and
progress functions required). Run the same SQL tests on Android before release.
Do not modify generated upstream C source to implement product rules.
