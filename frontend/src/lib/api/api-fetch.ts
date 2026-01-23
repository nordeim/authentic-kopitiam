function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

export function getApiRootUrl(): string {
  return normalizeBaseUrl(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api');
}

export function getApiV1BaseUrl(): string {
  return `${getApiRootUrl()}/v1`;
}

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getApiV1BaseUrl()}${normalizedPath}`;
}

export async function apiFetch(
  path: string,
  init: RequestInit = {},
  options: { includeAuth?: boolean } = {},
): Promise<Response> {
  const url = path.startsWith('http://') || path.startsWith('https://') ? path : apiUrl(path);

  const headers = new Headers(init.headers);
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  const includeAuth = options.includeAuth ?? true;
  if (includeAuth) {
    const token = getAuthToken();
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  return fetch(url, {
    ...init,
    headers,
    credentials: 'omit',
  });
}
