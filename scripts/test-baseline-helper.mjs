/** Synthetic-account setup for tests unrelated to diagnostic scoring. */
export async function completeTestBaseline(db, userId) {
  const test = await db.from('assessments').select('id').eq('slug', 'pre-test-basis-data').eq('is_published', true).single();
  if (test.error) throw test.error;
  const result = await db.from('assessment_sessions').insert({ user_id: userId, assessment_id: test.data.id, status: 'COMPLETED', completed_at: new Date().toISOString(), score: 0 });
  if (result.error) throw result.error;
}
