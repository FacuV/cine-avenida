export const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3000';

export async function apiFetch(path, options = {}) {
  const { token, ...rest } = options;
  const headers = {
    'Content-Type': 'application/json',
    ...(rest.headers ?? {}),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers,
  });
  const contentType = response.headers.get('content-type') ?? '';
  const data = contentType.includes('application/json')
    ? await response.json()
    : null;

  if (!response.ok) {
    const message = data?.message ?? 'Error inesperado';
    throw new Error(message);
  }
  return data;
}
