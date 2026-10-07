import Image from "next/image";

/** A lightweight preview of the Campus Mini relation, not an interactive lab. */
export function LoginIntroduction() {
  return <section aria-labelledby="login-introduction-title" className="min-w-0 lg:py-8">
    <h1 id="login-introduction-title" className="max-w-[16ch] text-[1.75rem] font-semibold leading-tight tracking-tight [overflow-wrap:anywhere] sm:text-4xl lg:text-5xl">
      Pahami data.<br />Lihat relasinya.
    </h1>
    <p className="mt-3 max-w-[38ch] text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">Belajar basis data lewat materi, visualisasi tabel, dan praktik SQL.</p>
    <div className="mt-4 max-w-sm rounded-lg bg-live-surface p-3 sm:mt-6 sm:p-5">
      <Image src="/assets/quethink/database-relations.svg" width={320} height={144}
        alt="Primary key student_id pada students terhubung ke foreign key student_id pada enrollments. Satu mahasiswa dapat memiliki banyak pendaftaran."
        className="block h-auto w-full" unoptimized />
    </div>
  </section>;
}
