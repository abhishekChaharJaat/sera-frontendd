const ANON_KEY = "anon_user_id";

export const getOrCreateAnonId = (): string => {
  let id = localStorage.getItem(ANON_KEY);
  if (!id) {
    id = `anon_${crypto.randomUUID()}`;
    localStorage.setItem(ANON_KEY, id);
  }
  return id;
};

export function buildAuth(): { headers: Record<string, string>; anonParam: string } {
  const token = localStorage.getItem("authToken");
  if (token) {
    return { headers: { Authorization: `Bearer ${token}` }, anonParam: "" };
  }
  const anonId = getOrCreateAnonId();
  return { headers: {}, anonParam: `?anon_id=${anonId}` };
}
