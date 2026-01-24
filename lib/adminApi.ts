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

  const data = text ? JSON.parse(text) : null;

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

// ✅ ADICIONADO: tipo que estava faltando
export type AdminServico = {
  id: number;
  name: string;
  durationMin: number;
  priceCents: number;
  active: boolean;
};

export type HorarioTrabalho = {
  id: number;
  dayOfWeek: number;
  startTime: string; // "09:00:00" ou "09:00"
  endTime: string;
  active: boolean;
  barber: { id: number; name: string };
};

export const adminApi = {
  agenda: (range: "today" | "7d" | "30d" | "all") =>
  http<AdminAgendamento[]>(`/admin/agendamentos?range=${range}`),

  confirmar: (id: number) => http(`/admin/agendamentos/${id}/confirmar`, { method: "PATCH" }),
  cancelar: (id: number) => http(`/admin/agendamentos/${id}/cancelar`, { method: "PATCH" }),

  listarServicos: () => http<AdminServico[]>(`/admin/servicos`),

  criarServico: (payload: { name: string; durationMin: number; priceCents: number; active?: boolean }) =>
    http<AdminServico>(`/admin/servicos`, { method: "POST", body: JSON.stringify(payload) }),

  atualizarServico: (id: number, payload: { name: string; durationMin: number; priceCents: number; active?: boolean }) =>
    http<AdminServico>(`/admin/servicos/${id}`, { method: "PUT", body: JSON.stringify(payload) }),

  toggleServico: (id: number) =>
    http<AdminServico>(`/admin/servicos/${id}/toggle-active`, { method: "PATCH" }),

   listarBarbeiros: () => http<{ id: number; name: string }[]>(`/barbers`),

  listarHorarios: (barberId: number) =>
    http<HorarioTrabalho[]>(`/admin/horarios?barberId=${barberId}`),

  salvarHorario: (payload: {
    barberId: number;
    dayOfWeek: number;
    startTime: string; // "09:00:00"
    endTime: string;   // "18:00:00"
    active: boolean;
  }) => http(`/admin/horarios`, { method: "POST", body: JSON.stringify(payload) }),
};
