const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken()

  let res: Response
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    })
  } catch {
    throw new Error(
      'Unable to reach the server. Please check your connection and try again.',
    )
  }

  const data = res.status === 204 ? null : await res.json().catch(() => null)

  if (!res.ok) {
    if (res.status === 401 && !path.startsWith('/auth/')) {
      throw new Error('Your session has expired. Please log in again.')
    }

    const message = Array.isArray(data?.message)
      ? data.message.join(', ')
      : typeof data?.message === 'string'
        ? data.message
        : 'Something went wrong. Please try again.'
    throw new Error(message)
  }

  return data as T
}
