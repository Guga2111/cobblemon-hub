import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore, type AuthUser } from "./use-auth-store";

const API_BASE = "http://localhost:3001/api/auth";

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error ?? "Erro desconhecido");
  }

  return data as T;
}

export function useCurrentUser() {
  const { setUser } = useAuthStore();

  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      try {
        const data = await fetchJson<{ user: AuthUser }>(`${API_BASE}/me`);
        setUser(data.user);
        return data.user;
      } catch {
        setUser(null);
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();

  return useMutation({
    mutationFn: (input: { email: string; password: string }) =>
      fetchJson<{ user: AuthUser }>(`${API_BASE}/login`, {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.setQueryData(["auth", "me"], data.user);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();

  return useMutation({
    mutationFn: (input: {
      email: string;
      displayName: string;
      password: string;
    }) =>
      fetchJson<{ user: AuthUser }>(`${API_BASE}/register`, {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.setQueryData(["auth", "me"], data.user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();

  return useMutation({
    mutationFn: () =>
      fetchJson<{ ok: boolean }>(`${API_BASE}/logout`, {
        method: "POST",
      }),
    onSuccess: () => {
      setUser(null);
      queryClient.setQueryData(["auth", "me"], null);
    },
  });
}
