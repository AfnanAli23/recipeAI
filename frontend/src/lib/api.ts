// One place that knows how to talk to the Nest.js backend.
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const TOKEN_KEY = 'recipe_token';

export type User = { id: string; email: string };

export type Draft = {
  title: string;
  description: string;
  ingredients: string[];
  steps: string[];
  cookTimeMinutes: number;
  imageUrl: string;
};

export type Recipe = Draft & {
  id: string;
  isFavorite: boolean;
  rating: number | null;
  createdAt: string;
};

type AuthResponse = { accessToken: string; user: User };

// --- token helpers (localStorage only exists in the browser) ---
export const getToken = () =>
  typeof window === 'undefined' ? null : localStorage.getItem(TOKEN_KEY);
export const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

// --- generic request helper: adds the JWT header and turns errors into Error objects ---
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    // Nest returns { message: string | string[] } for validation errors.
    const message = Array.isArray(body?.message) ? body.message.join(', ') : body?.message;
    throw new Error(message ?? `Request failed (${res.status})`);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

const post = (body: unknown): RequestInit => ({ method: 'POST', body: JSON.stringify(body) });
const patch = (body?: unknown): RequestInit => ({ method: 'PATCH', body: body ? JSON.stringify(body) : undefined });

export const api = {
  register: (email: string, password: string) => request<AuthResponse>('/auth/register', post({ email, password })),
  login: (email: string, password: string) => request<AuthResponse>('/auth/login', post({ email, password })),
  me: () => request<User>('/auth/me'),

  generate: (ingredients: string[]) => request<Draft[]>('/recipes/generate', post({ ingredients })),
  save: (draft: Draft) => {
    // Send only the fields the backend accepts (it rejects unknown ones, e.g. imageUrl).
    const { title, description, ingredients, steps, cookTimeMinutes } = draft;
    return request<Recipe>('/recipes', post({ title, description, ingredients, steps, cookTimeMinutes }));
  },
  list: (favoritesOnly = false) => request<Recipe[]>(`/recipes${favoritesOnly ? '?favorite=true' : ''}`),
  get: (id: string) => request<Recipe>(`/recipes/${id}`),
  toggleFavorite: (id: string) => request<Recipe>(`/recipes/${id}/favorite`, patch()),
  rate: (id: string, rating: number) => request<Recipe>(`/recipes/${id}/rating`, patch({ rating })),
  remove: (id: string) => request<void>(`/recipes/${id}`, { method: 'DELETE' }),
};
