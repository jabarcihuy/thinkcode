import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { requireGuest } from "@/features/guest/server/session";
import { guestCatalog } from "@/features/guest/server/catalog";
import {
  startGuestTest,
  exitGuest,
  cancelGuestTest,
} from "@/features/guest/server/actions";
import { SqlabWorkspace } from "@/features/sqlab/components/sqlab-workspace";
import { TutorPanel } from "@/features/ai/components/tutor-panel";
export default async function GuestPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const guest = await requireGuest();
  const { view = "" } = await searchParams;
  if (guest.activeTest && ["materials", "sqlab", "chatbot"].includes(view))
    redirect(`/guest/tests/${guest.activeTest}`);
  const catalog = await guestCatalog();
  return (
    <main
      id="main-content"
      className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12"
    >
      <p className="text-sm font-medium text-primary">
        Mode tamu · tidak menyimpan progres
      </p>
      {view === "sqlab" ? (
        <>
          <h1 className="mt-3 text-3xl font-semibold">SQLab</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Susun skema, isi tabel, dan coba query. Perubahan hilang ketika
            meninggalkan halaman.
          </p>
          <SqlabWorkspace userId={guest.id} />
        </>
      ) : view === "chatbot" ? (
        <>
          <h1 className="mt-3 text-3xl font-semibold">Tutor AI</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Tanya konsep basis data. Percakapan hanya tersedia selama halaman
            ini terbuka.
          </p>
          {catalog.lessons[0] ? (
            <TutorPanel lessonId={catalog.lessons[0].id} />
          ) : (
            <p className="mt-6">Materi belum tersedia.</p>
          )}
        </>
      ) : view === "materials" ? (
        <>
          <h1 className="mt-3 text-3xl font-semibold">Materi</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Semua materi terbuka untuk dicoba.
          </p>
          <ol className="mt-7 divide-y divide-border">
            {catalog.lessons.map((lesson, i) => (
              <li key={lesson.id} className="py-5">
                <Link
                  href={`/guest/materials/${lesson.slug}`}
                  className="block min-h-11 text-lg font-semibold"
                >
                  {i + 1}. {lesson.title}
                </Link>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {lesson.summary}
                </p>
                <Link
                  href={`/guest/lab/${lesson.slug}`}
                  className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-primary"
                >
                  Coba Lab Materi →
                </Link>
              </li>
            ))}
          </ol>
        </>
      ) : view === "tests" ? (
        <>
          <h1 className="mt-3 text-3xl font-semibold">Tes percobaan</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Soal dan pemeriksaan sama dengan mode akun. Hasil bukan nilai resmi
            dan tidak disimpan.
          </p>
          {guest.activeTest && (
            <div className="mt-6">
              <Button asChild>
                <Link href={`/guest/tests/${guest.activeTest}`}>
                  Lanjutkan tes
                </Link>
              </Button>
              <form action={cancelGuestTest} className="mt-3">
                <Button variant="outline">Keluar dari tes</Button>
              </form>
            </div>
          )}
          <div className="mt-7 divide-y divide-border">
            {catalog.tests.map((test) => (
              <section key={test.id} className="py-5">
                <h2 className="text-lg font-semibold">{test.title}</h2>
                <form action={startGuestTest} className="mt-4">
                  <input type="hidden" name="testId" value={test.id} />
                  <Button
                    disabled={Boolean(
                      guest.activeTest && guest.activeTest !== test.id,
                    )}
                  >
                    Coba tes
                  </Button>
                </form>
              </section>
            ))}
          </div>
        </>
      ) : view === "profile" ? (
        <>
          <h1 className="mt-3 break-words text-3xl font-semibold">
            {guest.name}
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Nama hanya digunakan untuk sesi tamu ini. Buat akun untuk menyimpan
            progres belajar.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/register">Buat akun</Link>
            </Button>
            <form action={exitGuest}>
              <Button variant="outline">Keluar mode tamu</Button>
            </form>
          </div>
        </>
      ) : (
        <>
          <h1 className="mt-3 break-words text-3xl font-semibold">
            Halo, {guest.name}.
          </h1>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Pilih fitur yang ingin dicoba. Semua materi terbuka tanpa urutan
            wajib.
          </p>
          {guest.activeTest && (
            <Button asChild className="mt-5">
              <Link href={`/guest/tests/${guest.activeTest}`}>
                Lanjutkan tes percobaan
              </Link>
            </Button>
          )}
          <div className="mt-8 divide-y divide-border">
            {[
              [
                "materials",
                "Materi dan Lab",
                "Baca konsep, unduh PDF, lalu coba latihan.",
              ],
              [
                "sqlab",
                "SQLab",
                "Buat database lokal dari nol atau bersama AI.",
              ],
              [
                "chatbot",
                "Tutor AI",
                "Tanya konsep, query, dan hasil percobaan.",
              ],
              [
                "tests",
                "Tes percobaan",
                "Coba pre-test dan post-test tanpa mencatat nilai.",
              ],
            ].map(([key, title, description]) => (
              <Link
                href={`/guest?view=${key}`}
                key={key}
                className="flex min-h-20 flex-col justify-center py-5"
              >
                <h2 className="text-lg font-semibold">{title} →</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {description}
                </p>
              </Link>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
