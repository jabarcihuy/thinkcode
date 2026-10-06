# Database Fundamentals Curriculum

## Audience and prerequisites

Beginning university learners. No prior programming or SQL experience is required. The course teaches relational data and SQL, not a programming language or a mapping to a specific institution.

## Learning outcomes

Learners can:

1. Read a small relational schema and distinguish tables, rows, columns, and records.
2. Identify primary and foreign keys and explain one-to-many and many-to-many relationships.
3. Translate a data question into a source table, selected columns, and row conditions.
4. Write basic `SELECT`/`FROM`/`WHERE` queries, sort and limit results, join related tables, and create simple grouped summaries.
5. Add one valid record and carefully update or delete a targeted record in a synthetic database.
6. Predict and explain query results and changes, recognize basic constraint errors, and reset practice data.

## Three main topics and learning order

The three requested content groups are **Relasi**, **Write**, and **Read**. They are curriculum categories, while prerequisites set the learner sequence: **Relasi → Read → Write**. Read is placed before Write because targeted updates and deletions depend on selecting and checking the intended rows.

Learner navigation is a flat list **Materi 1–11**. Each material is one reading unit, not a container of separately navigated submateri. Concept headings are prose structure only. Reading contains explanation, static examples/tables, summary and optional video, and is downloadable as an A4 PDF. Interactive tables, prediction, queries, results, AI and exercises are on a separate practice page for that material. Existing chapter/lesson records remain internal grouping and identity metadata; completion history is preserved; historical checkpoints are unpublished and no longer gate reading.

### 1. Relasi

| Material / lesson | Concept coverage | Learning evidence |
|---|---|---|
| Membaca Bentuk Data | Database and table; schema vs records; row/record and column/attribute; inspect the Campus Mini tables | Correctly identify a table, one record, a column, and the schema |
| Key dan Hubungan Antar Tabel | Primary key; foreign key; one-to-many; many-to-many through a bridge table; follow `students → enrollments → courses` | Identify PK/FK pairs and explain why enrollments connects students with courses |

### 2. Read — query untuk membaca data

| Material / lesson | Concept coverage | Learning evidence |
|---|---|---|
| Mengambil Data dengan `SELECT` | `SELECT`, `FROM`, choosing requested columns, `*` for initial inspection | Return the requested columns from the correct table |
| Memilih Baris dengan `WHERE` | Comparisons, boundaries, `AND`, `OR`, parentheses | Predict and explain which records satisfy the condition |
| Mengurutkan dan Membatasi Hasil | `ORDER BY`, `ASC`, `DESC`, tie-breakers, `LIMIT` | Produce a repeatable ordered subset |
| Membaca Relasi dengan `JOIN` | `INNER JOIN`, `ON`, PK/FK pair, one-to-many result multiplicity | Choose the correct relationship path and explain repeated entities |
| Membuat Ringkasan Data | `COUNT`, `AVG`, `GROUP BY`, what each output row represents | Calculate and interpret one aggregate row per group |
| Tantangan Query Kampus | Combine source selection, filters, joins, ordering, and simple aggregation | Solve a new data question and justify each clause |

### 3. Write — perintah untuk mengubah data

| Material / lesson | Concept coverage | Learning evidence |
|---|---|---|
| Menambahkan Record dengan `INSERT` | One row; explicit column list; `VALUES`; required values; primary/foreign key constraints | Insert one valid row and explain a rejected duplicate or invalid foreign key |
| Mengubah Record dengan `UPDATE` | `SET`; select target rows first; `WHERE` with a primary key; inspect affected rows | Preview the target, update only the intended row, and verify the resulting value |
| Menghapus Record dengan `DELETE` | Select target first; `WHERE` with a primary key; foreign-key restriction; reset | Delete one permitted practice row, explain a foreign-key rejection, and restore seed data |

The Write sequence is intentionally conservative: `INSERT` first, then `UPDATE`, then `DELETE`. For `UPDATE` and `DELETE`, the learner previews the target using a `SELECT` with the same predicate before confirming. No lesson teaches an unbounded update/delete as an acceptable action.

## Separate practice: Investigasi Kampus Mini

Each material pairs with one required server-checked core in Lab. Supporting concept checks and transfer activities remain optional. Reading acknowledgement plus core success completes the material.

The 2D schema visualizer connects named PK/FK columns. Select tables and records to follow real relationships, including confirmed local mutations. SQL-free Relasi lessons do not introduce query syntax.

| Material | Optional practice A | Optional practice B | Core consolidation (except Materi 2: schema model) |
|---|---|---|---|
| Membaca Bentuk Data | Tabel: Temukan tabel yang tepat | Kolom: Kolom atau nilai? | Record dan schema: Bedakan isi dan struktur |
| Key dan Hubungan Antar Tabel | Primary key: Identitas bukan nama | Foreign key: Ikuti foreign key | Model Peminjaman Buku: susun tabel, PK, dan FK |
| Mengambil Data dengan SELECT | FROM: Pilih sumber informasi | SELECT: Pilih atribut | Bentuk hasil: Bangun query pertama |
| Memilih Baris dengan WHERE | Batas perbandingan: Uji nilai batas | AND dan OR: Gabungkan dua syarat | Record hasil: Tentukan record yang lolos |
| Mengurutkan dan Membatasi Hasil | Arah urutan: Lihat urutan menaik | Tie-breaker: Pecahkan nilai seri | LIMIT: Temukan dua nilai tertinggi |
| Membaca Relasi dengan JOIN | Pasangan JOIN: Pasangkan key, bukan urutan | Satu-ke-banyak: Mengapa Alya muncul dua kali? | Jalur tiga tabel: Temukan peserta Basis Data |
| Membuat Ringkasan Data | COUNT: Hitung pendaftaran | GROUP BY: Pahami anggota grup | AVG: Bandingkan jumlah dan rata-rata |
| Investigasi Query Kampus | Terjemahkan permintaan: Gunakan tabel yang dibutuhkan | Filter dan grup: Susun alur penyelidikan | Verifikasi laporan: Selesaikan laporan kampus |
| Menambahkan Record dengan INSERT | Kolom dan nilai: Pasangkan INSERT dan VALUES | Constraint: Uji rujukan enrollment | Verifikasi INSERT: Tambahkan Eka dengan aman |
| Mengubah Record dengan UPDATE | Target UPDATE: Target satu pendaftaran | SET dan dampak: Bandingkan sebelum dan sesudah | Verifikasi UPDATE: Perbaiki nilai dengan bukti |
| Menghapus Record dengan DELETE | Target DELETE: Pilih target DELETE | Foreign key: Mengapa induk ditolak? | Verifikasi DELETE: Batalkan lalu periksa |

Keep existing exercise IDs, attempts and historical completions. Each material has one mandatory server-checked core; other checks are optional. Reading plus core success completes the material. Incorrect checks return concept-specific hints without answer keys. SQL result predictions accept spaces around separators and numerically equivalent number cells, while preserving column count, row order, text, and incorrect values.

## Synthetic dataset registry

Campus Mini remains the anchor example and optional practice context:

- `students(student_id, name, cohort)`
- `courses(course_id, course_code, course_name, credits)`
- `enrollments(enrollment_id, student_id, course_id, score)`

`enrollments` links students to courses and contains a score for each enrollment. Seed values must be synthetic, small, stable for exercises, and valid under foreign-key constraints. No learner data or production Supabase rows enter this database.

The same concepts also appear in two transfer contexts:

| Context | Tables | Shape / application |
|---|---|---|
| Katalog Buku | `authors(author_id, name, city)`, `books(book_id, title, author_id, stock)` | Two tables, one-to-many; table/column identification, SELECT, stock filtering, author-book JOIN, safe INSERT and DELETE |
| Toko Mini | `customers(customer_id, name, city)`, `orders(order_id, customer_id, status)`, `products(product_id, name, price)`, `order_items(item_id, order_id, product_id, quantity)` | Four tables, chained and bridging relationships; key navigation, price sorting, counting orders, grouped quantity totals, targeted UPDATE |

Relasi practice pages let learners compare all three schemas without SQL. Read/Write labs offer the original campus task and one concept-aligned transfer task. Each lesson has an optional position-4 transfer exercise with an explicit public `datasetId`; its private answer remains server-side. Existing exercise IDs are preserved; reading acknowledgement plus trusted core controls progression. SQL Playground offers all three contexts. The interface uses one compact schema selector, not several canvases at once; changing schema resets lab data, source query, prediction, selection, and results.

For Write lessons, seed data should include a clearly designated practice record or disposable copy so required lessons can be repeated without relying on destructive changes to shared course state. Reset restores a known seed.

## Learning rhythm and assessments

The course can be used across eight weeks: Relasi (weeks 1–2), Read (weeks 3–5), Write (weeks 6–7), and review/post-test (week 8). These durations are planning estimates, not credit-hour claims. Pre-test comes before study and has no passing gate; post-test follows all required material completion and passes at 75/100. Historical checkpoints are unpublished instead of deleted. Materials remain sequential; paired core labs are mandatory and additional exploration is optional.

## Optional modeling and video support

After key/relationship concepts, learners can use `/schema-builder` to model Peminjaman buku or Pesanan toko. They add tables, typed columns, one PK per table, and FK links through labeled controls. Structural feedback and a reference explanation support reasoning; alternative meaningful names are acceptable. The standalone tool remains optional. Materi 2 reuses its editor for a required schema task with specified semantic table/column names and server-checked PK/FK relationships. Drafts remain local, and the diagram is not an executable schema.

Four optional Indonesian video references are curated for Membaca Bentuk Data, SELECT/FROM, WHERE, and INNER JOIN. Source metadata/descriptions were verified on 3 October 2026; full audiovisual review remains pending. Show a topic focus, MySQL/MariaDB-to-SQLite caveat, with each reference; reflection belongs to practice. Hold broader Write videos until an appropriate safe segment is reviewed. See [video evidence](research/2026-10-03-video-pendamping-basis-data.md).

## Question quality and case-based post-test — 6 October 2026

The complete reviewed question bank is in [bank soal lengkap](evaluation/2026-10-06-bank-soal-lengkap.md): 10 diagnostic pre-test questions, 45 practice checks and 16 post-test questions. Each question states the situation, relevant public seed tables and a specific answer task. Prediction questions specify columns, row ordering and answer format; they do not request an explanation that the checker cannot assess. Required early SELECT practice only tests SELECT/FROM; ORDER BY is introduced later.

Post-test keeps ten concept questions (25% total weight) and six independently answerable SQL cases (75%): a cooperative product display, a library catalog, an academic summary, a new customer record, a payment status correction, and book withdrawal. SQL tasks state explicit result/mutation criteria without supplying the solution. Concept questions avoid supplying the exact queries needed by SQL tasks. Only SQL tasks receive explicitly provided relationship diagrams where useful; PK/FK identification questions do not label the correct answer in their visual.

Assessment changes must wait until affected active sessions finish; never erase sessions, attempts or completion history. Student trials remain necessary before claiming reliability or difficulty calibration. See [question audit](evaluation/2026-10-06-audit-soal.md).

## Content boundaries

**Included:** relational structure, keys and relationships, read queries, basic aggregation, and constrained single-row `INSERT`/`UPDATE`/`DELETE` on synthetic SQLite data.

**Deferred:** DDL and schema changes, free-form database administration, transaction control, bulk or unbounded mutations, UPSERT, `INSERT ... SELECT`, `UPDATE FROM`, cascading deletion, formal normalization, indexes/query planning, subqueries/CTEs, outer joins, triggers, stored procedures, NoSQL, and queries against private or production databases. The 2D exercise canvas remains focused and predefined; schema and record exploration share the same data; no 3D, freeform canvas, or AR.

## Revisi alur wajib — 5 Oktober 2026

**Pre-test wajib sekali → Materi membaca → Lab latihan inti → materi berikutnya → Post-test (lulus ≥75) → selesai.**

Aturan aktif dan transisi pengguna lama mengikuti [03-LEARNING_SYSTEM.md](03-LEARNING_SYSTEM.md). Materi tetap halaman membaca/PDF; Lab, tes, dan AI berada di halaman terpisah.

## Assessment alignment — 6 October 2026

Pre-test retains ten diagnostic choice questions (Relasi 3, Read 4, Write 3), zero grade weight. The versioned post-test retains those ten concept coverage points and adds six independently authored SQL tasks: filtered/sorted/limited selection, book-author JOIN, grouped COUNT/AVG, explicit single-row INSERT, PK-targeted UPDATE and guarded DELETE. Concept items weigh 1 each; SQL items weigh 5 each (25%/75%). Passing remains 75/100.

Each SQL task uses the public synthetic seed plus a private variant, independently compared to a private reference query by the trusted server-only SQLite/WASM adapter. Equivalent query text and aliases are accepted; selected columns/cell types/order or complete mutation post-state determine correctness. Partial fixture success gives proportional task credit. Official scores therefore provide evidence of authoring the taught bounded SQL subset, while not claiming unrestricted SQL or real-database administration proficiency. Core Lab rules remain unchanged. See [SQL assessment blueprint](planning/2026-10-06-trusted-sql-post-test.md).
