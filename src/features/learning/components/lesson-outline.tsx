type OutlineExercise = { id: string; title: string };

export function LessonOutline({
  hasLab,
  exercises,
}: {
  hasLab: boolean;
  exercises: OutlineExercise[];
}) {
  if (!hasLab && exercises.length === 0) return null;

  return (
    <nav aria-label="Navigasi materi">
      <h2 className="text-sm font-semibold">Di halaman ini</h2>
      <ul className="mt-3 space-y-1">
        {hasLab && (
          <li>
            <a className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring" href="#database-lab">
              Praktik di lab
            </a>
            <ul className="ml-3 space-y-1 border-l border-border pl-2">
              <li><a className="block rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring" href="#lab-tables">Tabel dan relasi</a></li>
              <li><a className="block rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring" href="#lab-query">Tulis query</a></li>
              <li><a className="block rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring" href="#lab-results">Hasil query</a></li>
            </ul>
          </li>
        )}
        {exercises.length > 0 && (
          <li className="pt-2">
            <a className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring" href="#lesson-practice">
              Latihan wajib
            </a>
            <ul className="ml-3 space-y-1 border-l border-border pl-2">
              {exercises.map((exercise) => (
                <li key={exercise.id}>
                  <a className="block rounded-md px-3 py-1.5 text-sm leading-5 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring" href={`#practice-${exercise.id}`}>
                    {exercise.title}
                  </a>
                </li>
              ))}
            </ul>
          </li>
        )}
      </ul>
    </nav>
  );
}
