export async function fetchApi<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('dsa_access_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    if (res.status === 401) {
      // Clear expired credentials
      localStorage.removeItem('dsa_access_token');
      localStorage.removeItem('dsa_refresh_token');
      localStorage.removeItem('dsa_user_data');
      window.location.href = '/';
    }
    throw new Error(data.error || `API Request Failed (${res.status})`);
  }

  return data;
}
