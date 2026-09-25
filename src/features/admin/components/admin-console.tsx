"use client";

import { useCallback, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Check, Eye, FilePlus2, LoaderCircle, Sparkles } from "lucide-react";
import { LessonContent } from "@/features/learning/components/lesson-content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Resource = "paths" | "chapters" | "lessons" | "exercises" | "assessments" | "assessment-items" | "assessment-test-cases" | "users";
type RecordRow = Record<string, unknown> & { id: string; title?: string; email?: string; is_published?: boolean; position?: number };
type Counts = { users: number; paths: number; chapters: number; lessons: number; exercises: number; assessments: number; published: number; drafts: number };
type Field = { name: string; label: string; kind?: "text" | "textarea" | "number" | "boolean" | "select" | "json"; options?: string[]; required?: boolean };

const navigation: { id: Resource | "overview"; label: string; heading: string }[] = [
  { id: "overview", label: "Dashboard", heading: "Ringkasan" },
  { id: "paths", label: "Learning Paths", heading: "Learning paths" },
  { id: "chapters", label: "Chapters", heading: "Chapters" },
  { id: "lessons", label: "Lessons", heading: "Lessons" },
  { id: "exercises", label: "Exercises", heading: "Exercises" },
  { id: "assessments", label: "Assessments", heading: "Assessments" },
  { id: "assessment-items", label: "Assessment Items", heading: "Assessment items" },
  { id: "users", label: "User Management", heading: "Users" },
];
const exerciseTypes = ["CODE_COMPLETION", "PREDICT_OUTPUT", "DEBUGGING", "PROBLEM_SOLVING", "PSEUDOCODE", "FLOWCHART"];
const fieldsByResource: Partial<Record<Resource, Field[]>> = {
  paths: [{ name: "title", label: "Title", required: true }, { name: "slug", label: "Slug", required: true }, { name: "description", label: "Description", kind: "textarea" }, { name: "position", label: "Position", kind: "number", required: true }],
  chapters: [{ name: "learning_path_id", label: "Learning path", kind: "select", required: true }, { name: "title", label: "Title", required: true }, { name: "description", label: "Description", kind: "textarea" }, { name: "position", label: "Position", kind: "number", required: true }, { name: "is_required", label: "Required", kind: "boolean" }],
  lessons: [{ name: "chapter_id", label: "Chapter", kind: "select", required: true }, { name: "title", label: "Title", required: true }, { name: "slug", label: "Slug", required: true }, { name: "summary", label: "Summary", kind: "textarea" }, { name: "content", label: "Lesson content (Markdown)", kind: "textarea", required: true }, { name: "example_source_code", label: "JavaScript example", kind: "textarea" }, { name: "position", label: "Position", kind: "number", required: true }, { name: "is_required", label: "Required", kind: "boolean" }, { name: "is_preview", label: "Guest preview", kind: "boolean" }],
  exercises: [{ name: "lesson_id", label: "Lesson", kind: "select", required: true }, { name: "type", label: "Exercise type", kind: "select", options: exerciseTypes, required: true }, { name: "title", label: "Title", required: true }, { name: "prompt", label: "Prompt", kind: "textarea", required: true }, { name: "starter_code", label: "Starter code (main.js)", kind: "textarea" }, { name: "position", label: "Position", kind: "number", required: true }, { name: "is_required", label: "Required practice", kind: "boolean" }],
  assessments: [{ name: "learning_path_id", label: "Learning path", kind: "select", required: true }, { name: "type", label: "Assessment type", kind: "select", options: ["CHECKPOINT", "FINAL"], required: true }, { name: "title", label: "Title", required: true }, { name: "slug", label: "Slug", required: true }, { name: "instructions", label: "Instructions", kind: "textarea" }, { name: "gate_after_chapter", label: "Gate after chapter", kind: "number", required: true }, { name: "passing_score", label: "Passing score (0–100)", kind: "number", required: true }, { name: "position", label: "Position", kind: "number", required: true }],
  "assessment-items": [{ name: "assessment_id", label: "Assessment", kind: "select", required: true }, { name: "type", label: "Question type", kind: "select", options: exerciseTypes, required: true }, { name: "title", label: "Title", required: true }, { name: "topic", label: "Topic", required: true }, { name: "prompt", label: "Prompt", kind: "textarea", required: true }, { name: "starter_code", label: "Starter code", kind: "textarea" }, { name: "weight", label: "Weight", kind: "number", required: true }, { name: "position", label: "Position", kind: "number", required: true }, { name: "public_config", label: "Learner-visible configuration (JSON)", kind: "json" }, { name: "answer_config", label: "Private answer key (JSON)", kind: "json" }, { name: "entry_function", label: "Entry function", kind: "text" }],
};
const emptyCounts: Counts = { users: 0, paths: 0, chapters: 0, lessons: 0, exercises: 0, assessments: 0, published: 0, drafts: 0 };

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, headers: { "content-type": "application/json", ...init?.headers } });
  const body = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(body.error ?? "Could not complete that action.");
  return body;
}

function makeSlug(value: string) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
function blankRecord(resource: Resource): Record<string, unknown> {
  const defaults: Record<string, unknown> = { position: 1, is_required: true, passing_score: 75, gate_after_chapter: 3, weight: 1, is_published: false, is_preview: false, type: resource === "assessments" ? "CHECKPOINT" : "CODE_COMPLETION", config: {}, public_config: {}, answer_config: {}, starter_code: "", solution_code: "", content: "", description: "", summary: "", prompt: "", instructions: "", entry_function: "" };
  for (const field of fieldsByResource[resource] ?? []) defaults[field.name] ??= "";
  return defaults;
}

export function AdminConsole({ initialCounts = emptyCounts }: { initialCounts?: Counts }) {
  const [section, setSection] = useState<Resource | "overview">("overview");
  const [items, setItems] = useState<RecordRow[]>([]);
  const [options, setOptions] = useState<Record<Resource, RecordRow[]>>({ paths: [], chapters: [], lessons: [], exercises: [], assessments: [], "assessment-items": [], "assessment-test-cases": [], users: [] });
  const [selected, setSelected] = useState<RecordRow | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [tests, setTests] = useState<RecordRow[]>([]);
  const [newTest, setNewTest] = useState({ stdin: "", expected_output: "", is_hidden: false, weight: 1 });
  const [newAssessmentTest, setNewAssessmentTest] = useState({ args: "[]", stdin: "", expected_output: "", is_hidden: true, weight: 1 });
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
      try { const result = await api<{ items: RecordRow[] }>("/api/admin/users"); setItems(result.items); }
      catch (reason) { setError(reason instanceof Error ? reason.message : "Could not load users."); }
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
      setItems(result.items); setTests(result.tests ?? []);
      if (resource === "assessment-items") {
        const lookup = await api<{ items: RecordRow[] }>("/api/admin/assessments"); setOptions((current) => ({ ...current, assessments: lookup.items }));
      }
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not load content."); }
    finally { setBusy(false); }
  }, []);

  const visibleItems = useMemo(() => items.filter((item) => `${item.title ?? item.email ?? ""} ${item.slug ?? ""}`.toLowerCase().includes(filter.toLowerCase())), [filter, items]);
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
          : field.name === "starter_code" || field.name === "entry_function" ? (value ? value : null)
          : value ?? "";
      }
      const result = await api<{ item: RecordRow }>(selected ? `/api/admin/${section}/${selected.id}` : `/api/admin/${section}`, {
        method: selected ? "PATCH" : "POST", body: JSON.stringify(selected ? { data: payload } : payload),
      });
      setNotice("Draft saved. Preview it, then publish when it is ready."); setSelected(result.item); await loadResource(section as Resource); setSelected(result.item);
      await refreshCounts();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not save this draft. Check any JSON fields."); }
    finally { setBusy(false); }
  }

  async function publish(item: RecordRow, action: "publish" | "unpublish") {
    setBusy(true); setError(""); setNotice("");
    try { await api(`/api/admin/${section}/${item.id}`, { method: "PATCH", body: JSON.stringify({ action }) }); setNotice(action === "publish" ? "Content published." : "Content unpublished; learner progress is preserved."); await loadResource(section as Resource); await refreshCounts(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Could not update publication state."); }
    finally { setBusy(false); }
  }

  async function reorder(item: RecordRow, offset: number) {
    const position = Math.max(1, (item.position ?? 1) + offset);
    try { await api(`/api/admin/${section}/${item.id}`, { method: "PATCH", body: JSON.stringify({ action: "reorder", position }) }); await loadResource(section as Resource); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Could not reorder this item."); }
  }

  async function addTest() {
    if (!selected) return;
    setBusy(true); setError("");
    try {
      await api("/api/admin/test-cases", { method: "POST", body: JSON.stringify({ exercise_id: selected.id, ...newTest, position: tests.filter((test) => test.exercise_id === selected.id).length + 1 }) });
      setNewTest({ stdin: "", expected_output: "", is_hidden: false, weight: 1 }); await loadResource("exercises");
      setNotice("Test case saved. Hidden values remain server-side and visible only in this admin workspace.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not save the test case."); }
    finally { setBusy(false); }
  }

  async function addAssessmentTest() {
    if (!selected) return;
    setBusy(true); setError("");
    try {
      await api("/api/admin/assessment-test-cases", { method: "POST", body: JSON.stringify({ assessment_item_id: selected.id, ...newAssessmentTest, args: JSON.parse(newAssessmentTest.args), position: tests.filter((test) => test.assessment_item_id === selected.id).length + 1 }) });
      setNewAssessmentTest({ args: "[]", stdin: "", expected_output: "", is_hidden: true, weight: 1 });
      await loadResource("assessment-items"); setNotice("Trusted grading case saved. Hidden case details remain server-only.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Check the test case JSON and values."); }
    finally { setBusy(false); }
  }

  async function requestDraft(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const result = await api<{ draft: string }>("/api/admin/assistant", { method: "POST", body: JSON.stringify({ task: aiTask, context: aiContext, exerciseType: form.type }) });
      const generatedField = aiTask === "summary" ? "summary" : aiTask === "example" ? "example_source_code" : aiTask === "visible_tests" || aiTask === "hidden_tests" ? "config" : aiTask === "exercise" ? "prompt" : "content";
      const generatedValue = generatedField === "config" ? JSON.stringify({ generatedTestCases: result.draft }, null, 2) : result.draft;
      setField(generatedField, generatedValue); setNotice("AI suggestion inserted as an unpublished draft. Review every detail before saving or publishing.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Draft assistant is unavailable."); }
    finally { setBusy(false); }
  }

  function fieldInput(field: Field) {
    const value = form[field.name];
    const common = { id: `admin-${field.name}`, value: typeof value === "string" || typeof value === "number" ? value : "", required: field.required, onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setField(field.name, event.target.value) };
    if (field.kind === "boolean") return <label className="flex min-h-11 items-center gap-3 text-sm"><input id={common.id} type="checkbox" checked={Boolean(value)} onChange={(event) => setField(field.name, event.target.checked)} className="size-4 accent-primary" />{field.label}</label>;
    if (field.kind === "textarea" || field.kind === "json") return <textarea {...common} rows={field.kind === "json" ? 7 : field.name === "content" ? 12 : 4} className="w-full rounded-md border border-input bg-background px-3 py-2 font-sans text-sm leading-6 outline-none focus-visible:ring-2 focus-visible:ring-ring/30" spellCheck={field.kind !== "json"} />;
    if (field.kind === "select") {
      const source = field.name === "type" ? (field.options ?? []).map((item) => ({ id: item, title: item })) : options[field.name === "chapter_id" ? "chapters" : field.name === "lesson_id" ? "lessons" : field.name === "assessment_id" ? "assessments" : "paths"];
      const all = field.name === "type" ? source : [{ id: "", title: "Select…" }, ...source];
      return <select {...common} className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30">{all.map((item) => <option key={item.id} value={item.id}>{String(item.title ?? "")}</option>)}</select>;
    }
    return <Input {...common} type={field.kind === "number" ? "number" : "text"} min={field.kind === "number" ? 1 : undefined} />;
  }

  const activeHeading = navigation.find((item) => item.id === section)?.heading ?? "Admin";
  const editorFields = section === "exercises" ? [
    ...(fieldsByResource.exercises ?? []).map((field) => field.name === "starter_code" && form.type === "DEBUGGING" ? { ...field, label: "Broken starter code (main.js)" } : field.name === "starter_code" && form.type === "PREDICT_OUTPUT" ? { ...field, label: "Read-only source shown to learner (main.js)" } : field),
    { name: "config", label: form.type === "PREDICT_OUTPUT" ? "Private expected output (JSON: answer.output)" : form.type === "PSEUDOCODE" ? "Private correct order/choice (JSON: answer.order or answer.choiceId)" : form.type === "FLOWCHART" ? "Private flowchart answer (JSON: answer.order or answer.choiceId)" : "Private deterministic answer config (JSON)", kind: "json" as const },
    ...(["PSEUDOCODE", "FLOWCHART"].includes(String(form.type)) ? [{ name: "public_config", label: "Learner-visible blocks (JSON: mode + blocks/options)", kind: "json" as const }] : []),
  ] : fieldsByResource[section as Resource];

  return <div className="mx-auto grid max-w-7xl gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-12 lg:py-12">
    <aside aria-label="Admin navigation" className="min-w-0 lg:sticky lg:top-6 lg:self-start">
      <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Workspace</p>
      <nav className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible" aria-label="CMS sections">
        {navigation.map((item) => <button key={item.id} type="button" onClick={() => { setSection(item.id); if (item.id !== "overview") void loadResource(item.id); }} aria-current={section === item.id ? "page" : undefined} className={`shrink-0 rounded-md px-3 py-2.5 text-left text-sm font-medium focus-visible:outline-2 focus-visible:outline-ring ${section === item.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>{item.label}</button>)}
      </nav>
    </aside>

    <main className="min-w-0">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6"><div><p className="text-sm text-muted-foreground">ThinkCode CMS</p><h1 className="mt-1 text-3xl font-bold tracking-tight">{activeHeading}</h1></div>{editorFields && <Button type="button" onClick={() => edit(null)}><FilePlus2 size={16} aria-hidden="true" />New draft</Button>}</header>
      {error && <p role="alert" className="mb-5 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</p>}
      {notice && <p role="status" className="mb-5 rounded-md border border-primary/25 bg-primary/5 px-4 py-3 text-sm">{notice}</p>}

      {section === "overview" && <>
        <p className="max-w-2xl text-muted-foreground">Manage learning content and publication from one place. New content stays in draft until you publish it.</p>
        <div className="mt-8 grid gap-x-8 gap-y-6 border-y border-border py-7 sm:grid-cols-2 xl:grid-cols-4">{[["Users", counts.users], ["Learning paths", counts.paths], ["Chapters", counts.chapters], ["Lessons", counts.lessons], ["Exercises", counts.exercises], ["Assessments", counts.assessments], ["Published content", counts.published], ["Draft content", counts.drafts]].map(([label, value]) => <div key={String(label)}><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 text-3xl font-semibold tabular-nums">{value}</p></div>)}</div>
        <section className="mt-8"><h2 className="font-semibold">Content workflow</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Create or edit a draft, preview the learner-facing Markdown, validate required fields, then publish explicitly. Existing learner progress is preserved when content is unpublished.</p></section>
      </>}

      {section === "users" && <>
        <p className="mb-5 max-w-2xl text-sm text-muted-foreground">Role changes are intentionally read-only in this MVP. Only trusted database/server operations can promote an account to ADMIN.</p>
        <Input aria-label="Search users" value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Filter by email or display name" />
        {busy ? <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground"><LoaderCircle className="animate-spin" size={16} />Loading users…</p> : <div className="mt-5 divide-y divide-border border-y border-border">{visibleItems.map((user) => <div key={user.id} className="grid gap-1 py-4 sm:grid-cols-[minmax(0,1fr)_8rem_12rem]"><div><p className="font-medium">{String(user.display_name || user.email)}</p><p className="text-sm text-muted-foreground">{String(user.email ?? "")}</p><p className="mt-1 text-xs text-muted-foreground">{String(user.completed_lessons ?? 0)} completed lessons</p></div><span className="text-sm">{String(user.role)}</span><time className="text-sm text-muted-foreground" dateTime={String(user.created_at)}>{new Date(String(user.created_at)).toLocaleDateString()}</time></div>)}</div>}
      </>}

      {editorFields && <div className="grid min-w-0 gap-8 xl:grid-cols-[minmax(15rem,0.8fr)_minmax(0,1.2fr)]">
        <section aria-label={`${activeHeading} list`} className="min-w-0">
          <div className="mb-4"><Input aria-label={`Filter ${activeHeading}`} value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Filter content" /></div>
          {busy && items.length === 0 ? <p className="flex items-center gap-2 py-5 text-sm text-muted-foreground"><LoaderCircle className="animate-spin" size={16} />Loading content…</p> : <ul className="divide-y divide-border border-y border-border">{visibleItems.map((item) => <li key={item.id} className="py-4"><div className="flex items-start justify-between gap-2"><button type="button" onClick={() => edit(item)} className="min-w-0 flex-1 text-left focus-visible:outline-2 focus-visible:outline-ring"><span className="block truncate font-medium">{String(item.title ?? item.slug ?? item.email ?? "Untitled")}</span><span className="mt-1 block text-xs text-muted-foreground">{item.is_published === undefined ? String(item.role ?? "") : item.is_published ? "Published" : "Draft"}{item.position ? ` · Position ${item.position}` : ""}</span></button>{item.position && <span className="flex shrink-0"><button type="button" onClick={() => void reorder(item, -1)} aria-label="Move up" className="grid size-9 place-items-center rounded hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"><ArrowUp size={15} /></button><button type="button" onClick={() => void reorder(item, 1)} aria-label="Move down" className="grid size-9 place-items-center rounded hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"><ArrowDown size={15} /></button></span>}</div><div className="mt-2 flex gap-2">{item.is_published === true && <button type="button" className="text-xs font-medium text-muted-foreground underline underline-offset-4" onClick={() => void publish(item, "unpublish")}>Unpublish</button>}{item.is_published === false && <button type="button" className="text-xs font-medium text-primary underline underline-offset-4" onClick={() => void publish(item, "publish")}>Publish</button>}</div></li>)}</ul>}
          {!busy && !visibleItems.length && <p className="py-8 text-sm text-muted-foreground">No content here yet. Create a draft to begin.</p>}
        </section>

        <section className="min-w-0 border-t border-border pt-6 xl:border-l xl:border-t-0 xl:pl-8 xl:pt-0">
          {!form || Object.keys(form).length === 0 ? <div className="py-10 text-sm text-muted-foreground">Select an item to edit or create a new draft.</div> : <>
            <div className="mb-5 flex items-center justify-between gap-3"><div><h2 className="font-semibold">{selected ? "Edit content" : "New draft"}</h2><p className="mt-1 text-xs text-muted-foreground">Publication state changes only through the explicit Publish action.</p></div>{section === "lessons" && <Button type="button" variant={preview ? "default" : "outline"} size="sm" onClick={() => setPreview(!preview)}><Eye size={15} />{preview ? "Edit" : "Preview"}</Button>}</div>
            {preview && section === "lessons" ? <article className="rounded-lg border border-border p-5"><p className="mb-5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Learner preview</p><h2 className="mb-5 text-2xl font-bold">{String(form.title || "Lesson title")}</h2><LessonContent content={String(form.content || "Write Markdown content to preview this lesson.")} /></article> : <form className="space-y-4" onSubmit={save}>
              {editorFields.map((field) => <div key={field.name} className={field.kind === "boolean" ? "border-b border-border pb-2" : "space-y-1.5"}>{field.kind !== "boolean" && <label htmlFor={`admin-${field.name}`} className="text-sm font-medium">{field.label}{field.required && <span aria-hidden="true"> *</span>}</label>}{fieldInput(field)}{field.kind === "json" && <p className="text-xs text-muted-foreground">Valid JSON. Keep expected answers in private answer config only.</p>}</div>)}
              {section === "exercises" && selected && <div className="border-t border-border pt-5"><h3 className="font-semibold">Test cases</h3><p className="mt-1 text-xs text-muted-foreground">Hidden inputs and expected output are visible only to administrators. Browser practice can publish visible tests only; trusted hidden grading belongs in an assessment.</p><ul className="mt-3 divide-y divide-border">{tests.filter((test) => test.exercise_id === selected.id).map((test) => <li key={test.id} className="grid gap-2 py-3 sm:grid-cols-2"><label className="text-xs font-medium">Input<Input value={String(test.stdin ?? "")} onChange={(event) => setTests((current) => current.map((row) => row.id === test.id ? { ...row, stdin: event.target.value } : row))} /></label><label className="text-xs font-medium">Expected output<Input value={String(test.expected_output ?? "")} onChange={(event) => setTests((current) => current.map((row) => row.id === test.id ? { ...row, expected_output: event.target.value } : row))} /></label><label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(test.is_hidden)} onChange={(event) => setTests((current) => current.map((row) => row.id === test.id ? { ...row, is_hidden: event.target.checked } : row))} />Hidden test</label><label className="text-xs font-medium">Weight<Input type="number" min={0.01} step={0.1} value={Number(test.weight ?? 1)} onChange={(event) => setTests((current) => current.map((row) => row.id === test.id ? { ...row, weight: Number(event.target.value) } : row))} /></label><label className="text-xs font-medium">Order<Input type="number" min={1} value={Number(test.position ?? 1)} onChange={(event) => setTests((current) => current.map((row) => row.id === test.id ? { ...row, position: Number(event.target.value) } : row))} /></label><div className="flex items-end gap-3"><button type="button" className="min-h-11 text-primary underline" onClick={async () => { await api(`/api/admin/test-cases/${test.id}`, { method: "PATCH", body: JSON.stringify({ data: { exercise_id: test.exercise_id, stdin: test.stdin ?? "", expected_output: test.expected_output ?? "", is_hidden: Boolean(test.is_hidden), weight: Number(test.weight), position: Number(test.position) } }) }); await loadResource("exercises"); setNotice("Test case updated."); }}>Save test</button><button type="button" className="min-h-11 text-destructive underline" onClick={async () => { await api(`/api/admin/test-cases/${test.id}`, { method: "DELETE" }); await loadResource("exercises"); }}>Remove test</button></div></li>)}</ul><div className="mt-4 grid gap-2"><label className="text-xs font-medium" htmlFor="case-input">Input</label><Input id="case-input" value={newTest.stdin} onChange={(event) => setNewTest({ ...newTest, stdin: event.target.value })} /><label className="text-xs font-medium" htmlFor="case-output">Expected output</label><Input id="case-output" value={newTest.expected_output} onChange={(event) => setNewTest({ ...newTest, expected_output: event.target.value })} /><label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={newTest.is_hidden} onChange={(event) => setNewTest({ ...newTest, is_hidden: event.target.checked })} />Hidden test</label><label className="text-xs font-medium" htmlFor="case-weight">Weight</label><Input id="case-weight" type="number" min={0.01} step={0.1} value={newTest.weight} onChange={(event) => setNewTest({ ...newTest, weight: Number(event.target.value) })} /><Button type="button" variant="outline" disabled={busy} onClick={() => void addTest()}>Add test case</Button></div></div>}
              {section === "assessment-items" && selected && <div className="border-t border-border pt-5"><h3 className="font-semibold">Trusted assessment tests</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">These inputs and expected results stay server-only. They never enter learner or AI payloads.</p><ul className="mt-3 divide-y divide-border">{tests.filter((test) => test.assessment_item_id === selected.id).map((test) => <li key={test.id} className="py-2 text-xs"><span className="font-medium">{test.is_hidden ? "Hidden" : "Visible"} · weight {String(test.weight)}</span><button type="button" className="ml-3 text-destructive underline" onClick={async () => { await api(`/api/admin/assessment-test-cases/${test.id}`, { method: "DELETE" }); await loadResource("assessment-items"); }}>Remove test</button></li>)}</ul><div className="mt-4 grid gap-2"><label className="text-xs font-medium" htmlFor="assessment-args">Function arguments (JSON array)</label><textarea id="assessment-args" value={newAssessmentTest.args} onChange={(event) => setNewAssessmentTest({ ...newAssessmentTest, args: event.target.value })} rows={3} className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm" /><label className="text-xs font-medium" htmlFor="assessment-stdin">Text input</label><Input id="assessment-stdin" value={newAssessmentTest.stdin} onChange={(event) => setNewAssessmentTest({ ...newAssessmentTest, stdin: event.target.value })} /><label className="text-xs font-medium" htmlFor="assessment-expected">Expected result</label><Input id="assessment-expected" value={newAssessmentTest.expected_output} onChange={(event) => setNewAssessmentTest({ ...newAssessmentTest, expected_output: event.target.value })} /><label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={newAssessmentTest.is_hidden} onChange={(event) => setNewAssessmentTest({ ...newAssessmentTest, is_hidden: event.target.checked })} />Hidden test</label><label className="text-xs font-medium" htmlFor="assessment-weight">Weight</label><Input id="assessment-weight" type="number" min={0.01} step={0.1} value={newAssessmentTest.weight} onChange={(event) => setNewAssessmentTest({ ...newAssessmentTest, weight: Number(event.target.value) })} /><Button type="button" variant="outline" disabled={busy} onClick={() => void addAssessmentTest()}>Add trusted test case</Button></div></div>}
              {section === "assessment-items" && <p className="rounded-md bg-muted px-3 py-2 text-xs leading-5 text-muted-foreground">Use learner-visible configuration for question rendering and private answer key for server grading. Assessment items can be reordered with the list controls.</p>}
              <div className="flex flex-wrap gap-2 border-t border-border pt-4"><Button type="submit" disabled={busy}>{busy ? <LoaderCircle className="animate-spin" size={16} /> : <Check size={16} />}Save draft</Button>{selected && <Button type="button" variant="outline" onClick={() => setSelected(null)}>Close</Button>}</div>
            </form>}
            {section !== "users" && section !== "overview" && <form onSubmit={requestDraft} className="mt-8 border-t border-border pt-5"><h3 className="flex items-center gap-2 font-semibold"><Sparkles size={16} />AI Content Assistant</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">Creates suggestions only. Review, save as draft, then publish manually.</p><label className="mt-3 block text-xs font-medium" htmlFor="ai-task">Draft type</label><select id="ai-task" value={aiTask} onChange={(event) => setAiTask(event.target.value)} className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm">{[["explanation", "Explanation"], ["example", "JavaScript example"], ["exercise", "Exercise prompt"], ["visible_tests", "Visible tests"], ["hidden_tests", "Hidden tests"], ["summary", "Summary"]].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><label className="mt-3 block text-xs font-medium" htmlFor="ai-context">Concept and constraints</label><textarea id="ai-context" value={aiContext} onChange={(event) => setAiContext(event.target.value)} maxLength={4000} rows={3} required className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Describe the concept and learner level" /><Button className="mt-3" size="sm" variant="outline" disabled={busy || !aiContext.trim()}><Sparkles size={14} />Generate draft suggestion</Button></form>}
          </>}
        </section>
      </div>}
    </main>
  </div>;
}
