import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore, type AuthUser } from "./use-auth-store";

import { API_BASE as BASE, STALE_TIMES } from "~/lib/api";

const API_BASE = `${BASE}/auth`;

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
    queryFn: async ({ signal }) => {
      try {
        const data = await fetchJson<{ user: AuthUser }>(`${API_BASE}/me`, { signal });
        setUser(data.user);
        return data.user;
      } catch {
        setUser(null);
        return null;
      }
    },
    staleTime: STALE_TIMES.AUTH,
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
