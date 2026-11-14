const TOKEN_KEY = 'postproject-token';

function safe<T>(action: () => T, fallback: T): T {
  try {
    return action();
  } catch {
    return fallback;
  }
}

export function getToken(): string | null {
  return safe(() => localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY), null);
}

export function saveToken(token: string, remember: boolean) {
  clearToken();
  safe(() => (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token), undefined);
}

export function clearToken() {
  safe(() => {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  }, undefined);
}
