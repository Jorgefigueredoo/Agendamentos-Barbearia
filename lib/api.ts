const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_URL não configurado (.env.local)");
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
    ...options,
  });

  if (!res.ok) {
    // tenta ler mensagem do backend
    let msg = `Erro ${res.status}`;
    try {
      const body = await res.json();
      msg = body?.error || body?.message || msg;
    } catch {}
    throw new Error(msg);
  }

  return res.json() as Promise<T>;
}

// ---- Tipos (ajuste se quiser) ----
export type Servico = { id: number; name: string; durationMin: number; priceCents: number; active?: boolean };
export type Barbeiro = { id: number; name: string; active?: boolean };

export type HorarioDisponivel = { startTime: string; endTime: string; barbeiroId: number };

export type Agendamento = {
  id: number;
  status: "PENDENTE" | "CONFIRMADO" | "CANCELADO";
  clientName: string;
  clientPhone: string;
  notes?: string;
  servicoId: number;
  servicoNome: string;
  servicoDuracaoMin: number;
  barbeiroId: number;
  barbeiroNome: string;
  startTime: string;
  endTime: string;
};

export type CriarAgendamentoRequest = {
  servicoId: number;
  barbeiroId: number;
  startTime: string; // "2026-01-20T13:30:00" (sem Z)
  clientName: string;
  clientPhone: string;
  notes?: string;
};

// ---- Endpoints ----
export const api = {
  listarServicos: () => request<Servico[]>("/services"),
  listarBarbeiros: () => request<Barbeiro[]>("/barbers"),

  listarDisponibilidade: (params: { date: string; serviceId: number; barberId?: string | number }) => {
    const barber = params.barberId ?? "any";
    return request<HorarioDisponivel[]>(
      `/availability?date=${encodeURIComponent(params.date)}&serviceId=${params.serviceId}&barberId=${barber}`
    );
  },

  criarAgendamento: (payload: CriarAgendamentoRequest) =>
    request<Agendamento>("/agendamentos", { method: "POST", body: JSON.stringify(payload) }),

  listarAgendamentosPorTelefone: (phone: string) =>
    request<Agendamento[]>(`/agendamentos/por-telefone?phone=${encodeURIComponent(phone)}`),

  cancelarAgendamento: (id: number) =>
    request<Agendamento>(`/agendamentos/${id}/cancelar`, { method: "PATCH" }),

  confirmarAgendamento: (id: number) =>
    request<Agendamento>(`/agendamentos/${id}/confirmar`, { method: "PATCH" }),
};
