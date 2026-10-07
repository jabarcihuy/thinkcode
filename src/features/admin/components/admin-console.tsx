"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Check, Eye, FilePlus2, LoaderCircle, Sparkles } from "lucide-react";
import { LessonContent } from "@/features/learning/components/lesson-content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { csvCell } from "@/features/admin/domain/gradebook";

type Resource = "paths" | "chapters" | "lessons" | "exercises" | "assessments" | "assessment-items" | "users";
type RecordRow = Record<string, unknown> & { id: string; title?: string; email?: string; is_published?: boolean; position?: number };
type Counts = { users: number; paths: number; chapters: number; lessons: number; exercises: number; assessments: number; published: number; drafts: number };
type Field = { name: string; label: string; kind?: "text" | "textarea" | "number" | "boolean" | "select" | "json"; options?: string[]; required?: boolean };

const navigation: { id: Resource | "overview"; label: string; heading: string }[] = [
  { id: "overview", label: "Dashboard", heading: "Ringkasan" },
  { id: "paths", label: "Jalur belajar", heading: "Jalur belajar" },
  { id: "chapters", label: "Chapter", heading: "Chapter" },
  { id: "lessons", label: "Lesson", heading: "Lesson" },
  { id: "exercises", label: "Latihan", heading: "Latihan" },
  { id: "assessments", label: "Assessment", heading: "Assessment" },
  { id: "assessment-items", label: "Soal assessment", heading: "Soal assessment" },
  { id: "users", label: "Manajemen pengguna", heading: "Pengguna" },
];
const exerciseTypes = ["PREDICT_OUTPUT", "PSEUDOCODE", "FLOWCHART"];
const fieldsByResource: Partial<Record<Resource, Field[]>> = {
  paths: [{ name: "title", label: "Judul", required: true }, { name: "slug", label: "Slug", required: true }, { name: "description", label: "Deskripsi", kind: "textarea" }, { name: "position", label: "Urutan", kind: "number", required: true }],
  chapters: [{ name: "learning_path_id", label: "Jalur belajar", kind: "select", required: true }, { name: "title", label: "Judul", required: true }, { name: "description", label: "Deskripsi", kind: "textarea" }, { name: "position", label: "Urutan", kind: "number", required: true }, { name: "is_required", label: "Wajib", kind: "boolean" }],
  lessons: [{ name: "chapter_id", label: "Chapter", kind: "select", required: true }, { name: "title", label: "Judul", required: true }, { name: "slug", label: "Slug", required: true }, { name: "summary", label: "Ringkasan", kind: "textarea" }, { name: "content", label: "Materi lesson (Markdown)", kind: "textarea", required: true }, { name: "example_sql", label: "Contoh query SQL", kind: "textarea" }, { name: "position", label: "Urutan", kind: "number", required: true }, { name: "is_required", label: "Wajib", kind: "boolean" }, { name: "is_preview", label: "Boleh dilihat tanpa login", kind: "boolean" }],
  exercises: [{ name: "lesson_id", label: "Lesson", kind: "select", required: true }, { name: "type", label: "Tipe latihan", kind: "select", options: exerciseTypes, required: true }, { name: "title", label: "Judul", required: true }, { name: "prompt", label: "Perintah", kind: "textarea", required: true }, { name: "starter_code", label: "Query SQL contoh", kind: "textarea" }, { name: "position", label: "Urutan", kind: "number", required: true }, { name: "is_required", label: "Latihan inti wajib", kind: "boolean" }],
  assessments: [{ name: "learning_path_id", label: "Jalur belajar", kind: "select", required: true }, { name: "type", label: "Tipe assessment", kind: "select", options: ["CHECKPOINT", "FINAL", "PRETEST"], required: true }, { name: "title", label: "Judul", required: true }, { name: "slug", label: "Slug", required: true }, { name: "instructions", label: "Petunjuk pengerjaan", kind: "textarea" }, { name: "gate_after_chapter", label: "Dibuka setelah chapter", kind: "number", required: true }, { name: "passing_score", label: "Skor kelulusan (0-100)", kind: "number", required: true }, { name: "course_weight_percent", label: "Bobot nilai mata kuliah (%)", kind: "number", required: true }, { name: "position", label: "Urutan", kind: "number", required: true }],
  "assessment-items": [{ name: "assessment_id", label: "Assessment", kind: "select", required: true }, { name: "type", label: "Tipe soal", kind: "select", options: [...exerciseTypes, "PROBLEM_SOLVING"], required: true }, { name: "title", label: "Judul", required: true }, { name: "topic", label: "Topik", required: true }, { name: "prompt", label: "Perintah", kind: "textarea", required: true }, { name: "starter_code", label: "Query SQL untuk ditinjau", kind: "textarea" }, { name: "weight", label: "Bobot", kind: "number", required: true }, { name: "position", label: "Urutan", kind: "number", required: true }, { name: "public_config", label: "Pilihan/konfigurasi untuk learner (JSON)", kind: "json" }, { name: "answer_config", label: "Kunci jawaban privat (JSON)", kind: "json" }],
};
const emptyCounts: Counts = { users: 0, paths: 0, chapters: 0, lessons: 0, exercises: 0, assessments: 0, published: 0, drafts: 0 };

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, headers: { "content-type": "application/json", ...init?.headers } });
  const body = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(body.error ?? "Tindakan itu belum dapat diselesaikan.");
  return body;
}

function makeSlug(value: string) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
function blankRecord(resource: Resource): Record<string, unknown> {
const defaults: Record<string, unknown> = { position: 1, is_required: true, passing_score: 75, course_weight_percent: 0, gate_after_chapter: 2, weight: 1, is_published: false, is_preview: false, type: resource === "assessments" ? "CHECKPOINT" : "PREDICT_OUTPUT", config: {}, public_config: {}, answer_config: {}, starter_code: "", content: "", description: "", summary: "", prompt: "", instructions: "" };
  for (const field of fieldsByResource[resource] ?? []) defaults[field.name] ??= "";
  return defaults;
}

export function AdminConsole({ initialCounts = emptyCounts }: { initialCounts?: Counts }) {
  const [section, setSection] = useState<Resource | "overview">("overview");
  const [items, setItems] = useState<RecordRow[]>([]);
  const [gradeColumns, setGradeColumns] = useState<{ slug: string; title: string; weight: number }[]>([]);
  const [options, setOptions] = useState<Record<Resource, RecordRow[]>>({ paths: [], chapters: [], lessons: [], exercises: [], assessments: [], "assessment-items": [], users: [] });
  const [selected, setSelected] = useState<RecordRow | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [counts, setCounts] = useState(initialCounts);
  const [filter, setFilter] = useState("");
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [aiTask, setAiTask] = useState("explanation");
  const [aiContext, setAiContext] = useState("");

  const refreshCounts = useCallback(async () => {
    try { const result = await api<{ counts: Counts }>("/api/admin/overview"); setCounts(result.counts); } catch { /* existing summary remains visible */ }
  }, []);

  const loadResource = useCallback(async (resource: Resource) => {
    setError(""); setNotice(""); setSelected(null); setForm({}); setPreview(false);
    if (resource === "users") {
      setBusy(true);
      try { const result = await api<{ items: RecordRow[]; assessments: { slug: string; title: string; weight: number }[] }>("/api/admin/users"); setItems(result.items); setGradeColumns(result.assessments); }
      catch (reason) { setError(reason instanceof Error ? reason.message : "Daftar pengguna belum dapat dimuat."); }
      finally { setBusy(false); }
      return;
    }
    setBusy(true);
    try {
      if (resource === "chapters" || resource === "lessons" || resource === "exercises" || resource === "assessment-items") {
        const parent = resource === "chapters" ? "paths" : resource === "lessons" ? "chapters" : resource === "exercises" ? "lessons" : "assessments";
        const lookup = await api<{ items: RecordRow[] }>(`/api/admin/${parent}`); setOptions((current) => ({ ...current, [parent]: lookup.items }));
      }
      if (resource === "assessments" || resource === "chapters") {
        const lookup = await api<{ items: RecordRow[] }>("/api/admin/paths"); setOptions((current) => ({ ...current, paths: lookup.items }));
      }
      const result = await api<{ items: RecordRow[]; tests?: RecordRow[] }>(`/api/admin/${resource}`);
      setItems(result.items);
      if (resource === "assessment-items") {
        const lookup = await api<{ items: RecordRow[] }>("/api/admin/assessments"); setOptions((current) => ({ ...current, assessments: lookup.items }));
      }
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Konten belum dapat dimuat."); }
    finally { setBusy(false); }
  }, []);

  const visibleItems = useMemo(() => items.filter((item) => `${item.title ?? item.email ?? ""} ${item.slug ?? ""}`.toLowerCase().includes(filter.toLowerCase())), [filter, items]);
  function exportGrades() {
    const header = ["Email", "Nama", "Role", "Lesson selesai", ...gradeColumns.map((column) => `${column.title} (${column.weight}%)`), "Poin diperoleh", "Poin tersedia"];
    const rows = visibleItems.map((user) => {
      const scores = user.scores as Record<string, number | null> | undefined;
      return [user.email, user.display_name, user.role, user.completed_lessons, ...gradeColumns.map((column) => scores?.[column.slug] ?? ""), user.grade_points, user.grade_possible];
    });
    const csv = `\uFEFF${[header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = "quethink-rekap-nilai.csv"; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const setField = (name: string, value: unknown) => setForm((current) => {
    const next = { ...current, [name]: value };
    if (name === "title" && !selected && (section === "paths" || section === "lessons" || section === "assessments")) next.slug = makeSlug(String(value));
    return next;
  });

  function edit(item: RecordRow | null) {
    setSelected(item);
    const next = item ? { ...item } : blankRecord(section as Resource);
    if (next.config && typeof next.config === "object") next.config = JSON.stringify(next.config, null, 2);
    if (next.public_config && typeof next.public_config === "object") next.public_config = JSON.stringify(next.public_config, null, 2);
    if (next.answer_config && typeof next.answer_config === "object") next.answer_config = JSON.stringify(next.answer_config, null, 2);
    setForm(next); setPreview(false); setError(""); setNotice("");
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!fieldsByResource[section as Resource]) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const payload: Record<string, unknown> = {};
      for (const field of fieldsByResource[section as Resource] ?? []) {
        const value = form[field.name];
        payload[field.name] = field.kind === "number" ? Number(value || 0)
          : field.kind === "boolean" ? Boolean(value)
          : field.kind === "json" ? JSON.parse(String(value || "{}"))
          : field.name === "starter_code" ? (value ? value : null)
          : value ?? "";
      }
      const result = await api<{ item: RecordRow }>(selected ? `/api/admin/${section}/${selected.id}` : `/api/admin/${section}`, {
        method: selected ? "PATCH" : "POST", body: JSON.stringify(selected ? { data: payload } : payload),
      });
      setNotice("Draft tersimpan. Pratinjau dulu, lalu publikasikan jika sudah siap."); setSelected(result.item); await loadResource(section as Resource); setSelected(result.item);
      await refreshCounts();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Draft belum dapat disimpan. Periksa kembali kolom JSON."); }
    finally { setBusy(false); }
  }

  async function publish(item: RecordRow, action: "publish" | "unpublish") {
    setBusy(true); setError(""); setNotice("");
    try { await api(`/api/admin/${section}/${item.id}`, { method: "PATCH", body: JSON.stringify({ action }) }); setNotice(action === "publish" ? "Konten dipublikasikan." : "Konten ditarik dari publikasi; progres learner tetap tersimpan."); await loadResource(section as Resource); await refreshCounts(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Status publikasi belum dapat diperbarui."); }
    finally { setBusy(false); }
  }

  async function reorder(item: RecordRow, offset: number) {
    const position = Math.max(1, (item.position ?? 1) + offset);
    try { await api(`/api/admin/${section}/${item.id}`, { method: "PATCH", body: JSON.stringify({ action: "reorder", position }) }); await loadResource(section as Resource); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Urutan item ini belum dapat diubah."); }
  }

  async function requestDraft(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const result = await api<{ draft: string }>("/api/admin/assistant", { method: "POST", body: JSON.stringify({ task: aiTask, context: aiContext, exerciseType: form.type }) });
      const generatedField = aiTask === "summary" ? "summary" : aiTask === "example" ? "example_sql" : aiTask === "exercise" ? "prompt" : "content";
      setField(generatedField, result.draft); setNotice("Saran AI dimasukkan sebagai draft yang belum dipublikasikan. Tinjau setiap detail sebelum menyimpan atau mempublikasikan.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Asisten draft sedang tidak tersedia."); }
    finally { setBusy(false); }
  }

  function fieldInput(field: Field) {
    const value = form[field.name];
    const common = { id: `admin-${field.name}`, value: typeof value === "string" || typeof value === "number" ? value : "", required: field.required, onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setField(field.name, event.target.value) };
    if (field.kind === "boolean") return <label className="flex min-h-11 items-center gap-3 text-sm"><input id={common.id} type="checkbox" checked={Boolean(value)} onChange={(event) => setField(field.name, event.target.checked)} className="size-4 accent-primary" />{field.label}</label>;
    if (field.kind === "textarea" || field.kind === "json") return <textarea {...common} rows={field.kind === "json" ? 7 : field.name === "content" ? 12 : 4} className="w-full rounded-md border border-input bg-background px-3 py-2 font-sans text-base leading-6 outline-none focus-visible:ring-2 focus-visible:ring-ring/30 sm:text-sm" spellCheck={field.kind !== "json"} />;
    if (field.kind === "select") {
      const source = field.name === "type" ? (field.options ?? []).map((item) => ({ id: item, title: item })) : options[field.name === "chapter_id" ? "chapters" : field.name === "lesson_id" ? "lessons" : field.name === "assessment_id" ? "assessments" : "paths"];
      const all = field.name === "type" ? source : [{ id: "", title: "Pilih…" }, ...source];
      return <select {...common} className="h-11 w-full rounded-md border border-input bg-background px-3 text-base sm:text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30">{all.map((item) => <option key={item.id} value={item.id}>{String(item.title ?? "")}</option>)}</select>;
    }
    return <Input {...common} type={field.kind === "number" ? "number" : "text"} min={field.kind === "number" ? 1 : undefined} />;
  }

  const activeHeading = navigation.find((item) => item.id === section)?.heading ?? "Admin";
  const editorFields = section === "exercises" ? [
    ...(fieldsByResource.exercises ?? []).map((field) => field.name === "starter_code" && form.type === "PREDICT_OUTPUT" ? { ...field, label: "Query SQL untuk diprediksi (hanya baca)" } : field),
    { name: "config", label: form.type === "PREDICT_OUTPUT" ? "Hasil yang benar, privat (JSON: answer.output)" : "Jawaban benar, privat (JSON: answer.order / choiceId / model)", kind: "json" as const },
    ...(["PSEUDOCODE", "FLOWCHART"].includes(String(form.type)) ? [{ name: "public_config", label: "Blok untuk learner (JSON: mode + blocks/options, atau mode schema)", kind: "json" as const }] : []),
  ] : fieldsByResource[section as Resource];

  return <div className="mx-auto grid max-w-7xl gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-12 lg:py-12">
    <aside aria-label="Admin navigation" className="min-w-0 lg:sticky lg:top-6 lg:self-start">
      <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Workspace</p>
      <nav className="grid grid-cols-2 gap-2 pb-2 sm:grid-cols-3 lg:grid-cols-1" aria-label="CMS sections">
        {navigation.map((item) => <button key={item.id} type="button" onClick={() => { setSection(item.id); if (item.id !== "overview") void loadResource(item.id); }} aria-current={section === item.id ? "page" : undefined} className={`min-h-11 shrink-0 rounded-md px-3 py-2.5 text-left text-sm font-medium focus-visible:outline-2 focus-visible:outline-ring ${section === item.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>{item.label}</button>)}
      </nav>
    </aside>

    <main id="main-content" className="min-w-0">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6"><h1 className="text-3xl font-semibold tracking-tight">{activeHeading}</h1>{editorFields && <Button type="button" onClick={() => edit(null)}><FilePlus2 size={16} aria-hidden="true" />Draft baru</Button>}</header>
      {error && <p role="alert" className="mb-5 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</p>}
      {notice && <p role="status" className="mb-5 rounded-md border border-primary/25 bg-primary/5 px-4 py-3 text-sm">{notice}</p>}

      {section === "overview" && <>
        <p className="max-w-2xl text-muted-foreground">Kelola materi dan publikasi pembelajaran dari satu tempat. Konten baru tetap berstatus draft sampai kamu publikasikan.</p>
        <div className="mt-8 grid gap-x-8 gap-y-6 border-y border-border py-7 sm:grid-cols-2 xl:grid-cols-4">{[["Pengguna", counts.users], ["Jalur belajar", counts.paths], ["Chapter", counts.chapters], ["Lesson", counts.lessons], ["Latihan", counts.exercises], ["Assessment", counts.assessments], ["Konten terbit", counts.published], ["Konten draft", counts.drafts]].map(([label, value]) => <div key={String(label)}><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 text-3xl font-semibold tabular-nums">{value}</p></div>)}</div>
        <section className="mt-8"><h2 className="font-semibold">Alur kerja konten</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Buat atau ubah draft, pratinjau Markdown yang akan dilihat learner, validasi kolom wajib, lalu publikasikan secara eksplisit. Progres learner yang sudah ada tetap tersimpan saat konten ditarik dari publikasi.</p></section>
      </>}

      {section === "users" && <>
        <p className="mb-5 max-w-2xl text-sm text-muted-foreground">Perubahan role sengaja hanya-baca pada MVP ini. Hanya operasi database/server tepercaya yang dapat menaikkan akun menjadi ADMIN.</p>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-y border-border py-4"><p className="text-sm text-muted-foreground">Nilai dari skor assessment tertinggi yang tersimpan di server. Practice tidak menambah nilai resmi.</p><Button type="button" variant="outline" size="sm" disabled={busy || !items.length} onClick={exportGrades}>Unduh rekap CSV</Button></div>
        <Input aria-label="Cari pengguna" value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Filter berdasarkan email atau nama tampilan" />
        {busy ? <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground"><LoaderCircle className="animate-spin" size={16} />Memuat pengguna…</p> : <div className="mt-5 divide-y divide-border border-y border-border">{visibleItems.map((user) => <div key={user.id} className="grid gap-2 py-4 sm:grid-cols-[minmax(0,1fr)_8rem_9rem_7rem]"><div><p className="font-medium">{String(user.display_name || user.email)}</p><p className="text-sm text-muted-foreground">{String(user.email ?? "")}</p><p className="mt-1 text-xs text-muted-foreground">{String(user.completed_lessons ?? 0)} lesson selesai</p></div><span className="text-sm">{String(user.role)}</span><div className="text-sm tabular-nums"><p>{String(user.grade_points ?? 0)} / {String(user.grade_possible ?? 0)} poin</p><p className="text-xs text-muted-foreground">{String(user.assessments_passed ?? 0)} / {gradeColumns.length} assessment lulus</p></div><time className="text-sm text-muted-foreground" dateTime={String(user.created_at)}>{new Date(String(user.created_at)).toLocaleDateString()}</time></div>)}</div>}
      </>}

      {editorFields && <div className="grid min-w-0 gap-8 xl:grid-cols-[minmax(15rem,0.8fr)_minmax(0,1.2fr)]">
        <section aria-label={`${activeHeading} list`} className="min-w-0">
          <div className="mb-4"><Input aria-label={`Filter ${activeHeading}`} value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Filter konten" /></div>
          {busy && items.length === 0 ? <p className="flex items-center gap-2 py-5 text-sm text-muted-foreground"><LoaderCircle className="animate-spin" size={16} />Memuat konten…</p> : <ul className="divide-y divide-border border-y border-border">{visibleItems.map((item) => <li key={item.id} className="py-4"><div className="flex items-start justify-between gap-2"><button type="button" onClick={() => edit(item)} className="min-w-0 flex-1 text-left focus-visible:outline-2 focus-visible:outline-ring"><span className="block truncate font-medium">{String(item.title ?? item.slug ?? item.email ?? "Tanpa judul")}</span><span className="mt-1 block text-xs text-muted-foreground">{item.is_published === undefined ? String(item.role ?? "") : item.is_published ? "Terbit" : "Draft"}{item.position ? ` · Urutan ${item.position}` : ""}</span></button>{item.position && <span className="flex shrink-0"><button type="button" onClick={() => void reorder(item, -1)} aria-label="Naikkan urutan" className="grid size-11 place-items-center rounded-md hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"><ArrowUp size={15} /></button><button type="button" onClick={() => void reorder(item, 1)} aria-label="Turunkan urutan" className="grid size-11 place-items-center rounded-md hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"><ArrowDown size={15} /></button></span>}</div><div className="mt-2 flex flex-wrap items-center gap-3">{section === "lessons" && <Link href={`/admin/lessons/${item.id}/preview`} className="inline-flex min-h-11 items-center gap-1.5 text-xs font-medium text-accent hover:underline focus-visible:outline-2 focus-visible:outline-ring"><Eye size={14} aria-hidden="true" />Buka pratinjau</Link>}{item.is_published === true && <button type="button" className="inline-flex min-h-11 items-center px-1 text-xs font-medium text-muted-foreground underline underline-offset-4" onClick={() => void publish(item, "unpublish")}>Tarik dari publikasi</button>}{item.is_published === false && <button type="button" className="inline-flex min-h-11 items-center px-1 text-xs font-medium text-accent underline underline-offset-4" onClick={() => void publish(item, "publish")}>Publikasikan</button>}</div></li>)}</ul>}
          {!busy && !visibleItems.length && <p className="py-8 text-sm text-muted-foreground">Belum ada konten di sini. Buat draft untuk memulai.</p>}
        </section>

        <section className="min-w-0 border-t border-border pt-6 xl:border-l xl:border-t-0 xl:pl-8 xl:pt-0">
          {!form || Object.keys(form).length === 0 ? <div className="py-10 text-sm text-muted-foreground">Pilih item untuk diedit atau buat draft baru.</div> : <>
            <div className="mb-5 flex items-center justify-between gap-3"><div><h2 className="font-semibold">{selected ? "Ubah konten" : "Draft baru"}</h2><p className="mt-1 text-xs text-muted-foreground">Status publikasi hanya berubah melalui tindakan Publikasikan.</p></div>{section === "lessons" && <Button type="button" variant={preview ? "default" : "outline"} size="sm" onClick={() => setPreview(!preview)}><Eye size={15} />{preview ? "Ubah" : "Pratinjau"}</Button>}</div>
            {preview && section === "lessons" ? <article className="rounded-lg border border-border p-5"><h2 className="text-2xl font-semibold">{String(form.title || "Judul lesson")}</h2><p className="mb-5 mt-1.5 text-xs text-muted-foreground">Pratinjau learner</p><LessonContent content={String(form.content || "Tulis materi Markdown untuk pratinjau lesson ini.")} /></article> : <form className="space-y-4" onSubmit={save}>
              {editorFields.map((field) => <div key={field.name} className={field.kind === "boolean" ? "border-b border-border pb-2" : "space-y-1.5"}>{field.kind !== "boolean" && <label htmlFor={`admin-${field.name}`} className="text-sm font-medium">{field.label}{field.required && <span aria-hidden="true"> *</span>}</label>}{fieldInput(field)}{field.kind === "json" && <p className="text-xs text-muted-foreground">JSON yang valid. Simpan jawaban yang diharapkan hanya di konfigurasi jawaban privat.</p>}</div>)}
              {section === "assessment-items" && <p className="rounded-md bg-muted px-3 py-2 text-xs leading-5 text-muted-foreground">Gunakan konfigurasi untuk learner sebagai tampilan soal dan kunci jawaban privat untuk penilaian di server. Urutan soal assessment dapat diubah lewat kontrol pada daftar.</p>}
              <div className="flex flex-wrap gap-2 border-t border-border pt-4"><Button type="submit" disabled={busy}>{busy ? <LoaderCircle className="animate-spin" size={16} /> : <Check size={16} />}Simpan draft</Button>{selected && <Button type="button" variant="outline" onClick={() => setSelected(null)}>Tutup</Button>}</div>
            </form>}
            {section !== "users" && section !== "overview" && <form onSubmit={requestDraft} className="mt-8 border-t border-border pt-5"><h3 className="flex items-center gap-2 font-semibold"><Sparkles size={16} />Asisten Konten AI</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">Hanya membuat saran. Tinjau, simpan sebagai draft, lalu publikasikan secara manual.</p><label className="mt-3 block text-xs font-medium" htmlFor="ai-task">Jenis draft</label><select id="ai-task" value={aiTask} onChange={(event) => setAiTask(event.target.value)} className="mt-1 h-11 w-full rounded-md border border-input bg-background px-3 text-base sm:text-sm">{[["explanation", "Penjelasan materi"], ["example", "Contoh query SQL"], ["exercise", "Perintah latihan"], ["summary", "Ringkasan lesson"]].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><label className="mt-3 block text-xs font-medium" htmlFor="ai-context">Konsep dan batasan</label><textarea id="ai-context" value={aiContext} onChange={(event) => setAiContext(event.target.value)} maxLength={4000} rows={3} required className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-base sm:text-sm" placeholder="Jelaskan konsep basis data dan tingkat learner" /><Button className="mt-3" size="sm" variant="outline" disabled={busy || !aiContext.trim()}><Sparkles size={14} />Buat saran draft</Button></form>}
          </>}
        </section>
      </div>}
    </main>
  </div>;
}
