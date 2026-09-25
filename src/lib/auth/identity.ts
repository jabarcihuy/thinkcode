export interface ClaimsReader {
  getClaims(): Promise<{ data: { claims: { sub: string } | null } | null; error: unknown }>;
}

export async function readAuthenticatedUserId(auth: ClaimsReader): Promise<string | null> {
  const { data, error } = await auth.getClaims();
  if (error || !data?.claims?.sub) return null;
  return data.claims.sub;
}
