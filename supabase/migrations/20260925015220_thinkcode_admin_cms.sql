alter table public.learning_paths add column position integer not null default 1;
create index learning_paths_position_idx on public.learning_paths (position, slug);

-- CMS writes are performed only by server routes after role verification.
revoke insert, update, delete on public.learning_paths, public.chapters, public.lessons,
  public.exercises, public.test_cases, public.assessments, public.assessment_items
from anon, authenticated;
