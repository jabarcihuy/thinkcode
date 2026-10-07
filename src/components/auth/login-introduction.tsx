/** A lightweight preview of the Campus Mini relation, not an interactive lab. */
export function LoginIntroduction() {
  return <section aria-labelledby="login-introduction-title" className="min-w-0 lg:py-8">
    <h1 id="login-introduction-title" className="max-w-[16ch] text-[1.75rem] font-semibold leading-tight tracking-tight [overflow-wrap:anywhere] sm:text-4xl lg:text-5xl">
      Pahami data.<br />Lihat relasinya.
    </h1>
    <p className="mt-3 max-w-[38ch] text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">Belajar basis data lewat materi, visualisasi tabel, dan praktik SQL.</p>
    <div className="mt-4 max-w-sm rounded-lg bg-live-surface p-3 sm:mt-6 sm:p-5">
      <svg role="img" aria-labelledby="login-schema-title login-schema-description" viewBox="0 0 300 108" className="block w-full text-foreground">
        <title id="login-schema-title">Contoh relasi tabel mahasiswa dan pendaftaran</title>
        <desc id="login-schema-description">Kolom student_id sebagai primary key pada students terhubung ke foreign key student_id pada enrollments.</desc>
        <path d="M132 70H168" fill="none" stroke="var(--primary)" strokeWidth="2" />
        <circle cx="132" cy="70" r="3" fill="var(--primary)" />
        <path d="M161 63L168 70L161 77" fill="none" stroke="var(--primary)" strokeWidth="2" />
        <rect x="1" y="8" width="131" height="92" rx="10" fill="var(--code-surface)" />
        <rect x="168" y="8" width="131" height="92" rx="10" fill="var(--code-surface)" />
        <path d="M1 42H132M168 42H299" stroke="var(--border)" />
        <g fill="currentColor" fontFamily="var(--font-geist-mono), monospace" fontSize="12">
          <text x="12" y="30" fontWeight="600">students</text>
          <text x="179" y="30" fontWeight="600">enrollments</text>
          <text x="12" y="73">student_id</text>
          <text x="179" y="73">student_id</text>
        </g>
        <g fontFamily="var(--font-dm-sans), sans-serif" fontSize="10" fontWeight="700">
          <text x="12" y="57" fill="var(--primary)">PK</text>
          <text x="179" y="57" fill="var(--foreground)">FK</text>
        </g>
      </svg>
    </div>
  </section>;
}
