const API_URL =
  typeof window === "undefined"
    ? process.env.API_URL_SERVER!
    : process.env.NEXT_PUBLIC_API_URL!;

export async function adminFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  if (res.status === 401) {
    throw new Error("SESSION_EXPIRED");
  }

  let data: unknown = null;

  try {
    data = await res.json();
  } catch {}

  if (!res.ok) {
    const message =
      data &&
      typeof data === "object" &&
      "message" in data &&
      typeof data.message === "string"
        ? data.message
        : `HTTP_${res.status}`;

    throw new Error(message);
  }

  return data as T;
}
