-- Rebrand learner-visible copy and public fixtures. Stable slugs and
-- server-only assessment answer keys/test cases are intentionally unchanged.

update public.learning_paths
set title = replace(title, 'ThinkCode', 'Quethink'),
    description = replace(description, 'ThinkCode', 'Quethink')
where title ilike '%ThinkCode%' or description ilike '%ThinkCode%';

update public.chapters
set title = replace(title, 'ThinkCode', 'Quethink'),
    description = replace(description, 'ThinkCode', 'Quethink')
where title ilike '%ThinkCode%' or description ilike '%ThinkCode%';

update public.lessons
set title = replace(title, 'ThinkCode', 'Quethink'),
    summary = replace(summary, 'ThinkCode', 'Quethink'),
    content = replace(content, 'ThinkCode', 'Quethink'),
    example_source_code = replace(example_source_code, 'ThinkCode', 'Quethink')
where title ilike '%ThinkCode%'
   or summary ilike '%ThinkCode%'
   or content ilike '%ThinkCode%'
   or example_source_code ilike '%ThinkCode%';

update public.exercises
set title = replace(title, 'ThinkCode', 'Quethink'),
    prompt = replace(prompt, 'ThinkCode', 'Quethink'),
    starter_code = replace(starter_code, 'ThinkCode', 'Quethink')
where title ilike '%ThinkCode%'
   or prompt ilike '%ThinkCode%'
   or starter_code ilike '%ThinkCode%';

update public.exercises
set config = jsonb_set(
  config,
  '{public}',
  replace((config -> 'public')::text, 'ThinkCode', 'Quethink')::jsonb
)
where (config -> 'public')::text ilike '%ThinkCode%';

update public.test_cases
set stdin = replace(stdin, 'ThinkCode', 'Quethink'),
    expected_output = replace(expected_output, 'ThinkCode', 'Quethink')
where not is_hidden
  and (stdin ilike '%ThinkCode%' or expected_output ilike '%ThinkCode%');

update public.assessments
set title = replace(title, 'ThinkCode', 'Quethink'),
    instructions = replace(instructions, 'ThinkCode', 'Quethink')
where title ilike '%ThinkCode%' or instructions ilike '%ThinkCode%';

update public.assessment_items
set title = replace(title, 'ThinkCode', 'Quethink'),
    topic = replace(topic, 'ThinkCode', 'Quethink'),
    prompt = replace(prompt, 'ThinkCode', 'Quethink'),
    starter_code = replace(starter_code, 'ThinkCode', 'Quethink'),
    public_config = replace(public_config::text, 'ThinkCode', 'Quethink')::jsonb
where title ilike '%ThinkCode%'
   or topic ilike '%ThinkCode%'
   or prompt ilike '%ThinkCode%'
   or starter_code ilike '%ThinkCode%'
   or public_config::text ilike '%ThinkCode%';
