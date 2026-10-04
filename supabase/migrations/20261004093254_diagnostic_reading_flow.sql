-- Commit the enum addition before content in the next migration uses the value.
alter type public.assessment_type add value if not exists 'PRETEST';
