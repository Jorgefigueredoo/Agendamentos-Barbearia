const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function http<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    method: options?.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers || {}),
    },
    body: options?.body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Erro ${res.status}: ${text || "sem detalhes"}`);
  }

  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

export async function login(email: string, senha: string) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(`Login falhou (${res.status}): ${text}`);
  }

  // importante: converte
  const data = text ? JSON.parse(text) : null;

  // garante que veio token
  if (!data?.token) {
    throw new Error("Login OK, mas não veio 'token' na resposta.");
  }

  return data as { token: string };
}

export type AdminAgendamento = {
  id: number;
  status: "PENDENTE" | "CONFIRMADO" | "CANCELADO";
  clientName: string;
  clientPhone: string;
  servicoNome: string;
  barbeiroNome: string;
  startTime: string;
  endTime: string;
};

export const adminApi = {
  agendaDoDia: (date: string) =>
    http<AdminAgendamento[]>(`/admin/agendamentos?date=${encodeURIComponent(date)}`),

  confirmar: (id: number) =>
    http(`/admin/agendamentos/${id}/confirmar`, { method: "PATCH" }),

  cancelar: (id: number) =>
    http(`/admin/agendamentos/${id}/cancelar`, { method: "PATCH" }),
};
