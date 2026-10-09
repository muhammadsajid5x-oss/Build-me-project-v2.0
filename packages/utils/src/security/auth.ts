export type AuthTokenProvider = () => Promise<string | null>;

export async function getAuthorizationHeader(
  getToken: AuthTokenProvider,
): Promise<Record<string, string>> {
  const token = await getToken();

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}
