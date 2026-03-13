export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

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
