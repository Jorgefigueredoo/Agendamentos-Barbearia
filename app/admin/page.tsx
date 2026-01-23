"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi, type AdminAgendamento } from "@/lib/adminApi";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

function hhmm(iso: string) {
  return iso?.includes("T") ? iso.substring(11, 16) : iso;
}

function ddmmyyyy(iso: string) {
  if (!iso) return "";
  const datePart = iso.split("T")[0]; // YYYY-MM-DD
  const [y, m, d] = datePart.split("-");
  return `${d}/${m}/${y}`;
}

function statusBadge(status: AdminAgendamento["status"]) {
  if (status === "CONFIRMADO")
    return "bg-green-500/15 text-green-400 border border-green-500/30";
  if (status === "CANCELADO")
    return "bg-red-500/15 text-red-300 border border-red-500/30";
  return "bg-yellow-500/15 text-yellow-300 border border-yellow-500/30";
}

export default function AdminPage() {
  const router = useRouter();

  const [items, setItems] = useState<AdminAgendamento[]>([]);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  // range: today | 7d | 30d | all
  const [range, setRange] = useState<"today" | "7d" | "30d" | "all">("today");

  // filtros locais
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"TODOS" | AdminAgendamento["status"]>("TODOS");

  function requireAuth() {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/admin/login");
      return false;
    }
    return true;
  }

  async function load() {
    if (!requireAuth()) return;

    setLoading(true);
    setErro("");

    try {
      const data = await adminApi.agenda(range);
      setItems(data);
    } catch (e: any) {
      setErro(e?.message || "Erro ao carregar agendamentos");
      if (String(e?.message || "").includes("401") || String(e?.message || "").includes("403")) {
        localStorage.removeItem("token");
        router.replace("/admin/login");
      }
    } finally {
      setLoading(false);
    }
  }

  // recarrega quando mudar o range
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  const filtered = useMemo(() => {
    let list = [...items];

    if (statusFilter !== "TODOS") {
      list = list.filter((a) => a.status === statusFilter);
    }

    const query = q.trim().toLowerCase();
    if (query) {
      list = list.filter((a) => {
        return (
          a.clientName?.toLowerCase().includes(query) ||
          a.clientPhone?.toLowerCase().includes(query) ||
          a.servicoNome?.toLowerCase().includes(query) ||
          a.barbeiroNome?.toLowerCase().includes(query)
        );
      });
    }

    list.sort((a, b) => (a.startTime > b.startTime ? 1 : -1));
    return list;
  }, [items, q, statusFilter]);

  const pendentes = filtered.filter((x) => x.status === "PENDENTE").length;

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />

      <main className="lg:ml-64 pt-14 lg:pt-0 p-6 max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Agendamentos</h1>
            <div className="text-sm opacity-70">
              Total: {filtered.length} • Pendentes: {pendentes}
            </div>
          </div>

          <div className="flex gap-2 items-center">
            <select
              className="border rounded p-2 bg-background w-56"
              value={range}
              onChange={(e) => setRange(e.target.value as any)}
            >
              <option value="today">Hoje</option>
              <option value="7d">Próximos 7 dias</option>
              <option value="30d">Próximos 30 dias</option>
              <option value="all">Todos</option>
            </select>

            <button className="border rounded p-2" onClick={load}>
              Atualizar
            </button>
          </div>
        </div>

        {erro && <div className="text-red-600 text-sm">{erro}</div>}

        <div className="border rounded p-3 bg-card flex gap-2">
          <input
            className="border rounded p-2 bg-background flex-1"
            placeholder="Buscar por nome, telefone, serviço..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          <select
            className="border rounded p-2 bg-background w-44"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="TODOS">Todos</option>
            <option value="PENDENTE">Pendente</option>
            <option value="CONFIRMADO">Confirmado</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
        </div>

        {loading ? (
          <div className="text-sm opacity-70">Carregando...</div>
        ) : (
          <div className="space-y-2">
            {filtered.map((a) => {
              const canConfirm = a.status === "PENDENTE";
              const canCancel = a.status !== "CANCELADO";

              return (
                <div key={a.id} className="border rounded p-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">
                      {ddmmyyyy(a.startTime)} • {hhmm(a.startTime)} • {a.clientName} ({a.clientPhone})
                    </div>

                    <div className="text-sm opacity-80 flex items-center gap-2">
                      <span>{a.servicoNome}</span>
                      <span>•</span>
                      <span className="text-muted-foreground">{a.barbeiroNome}</span>

                      <span
                        className={
                          "ml-2 px-2 py-0.5 rounded-full text-xs font-medium " + statusBadge(a.status)
                        }
                      >
                        {a.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      className="border rounded px-3 py-1 disabled:opacity-40"
                      disabled={!canConfirm}
                      onClick={async () => {
                        await adminApi.confirmar(a.id);
                        load();
                      }}
                    >
                      Confirmar
                    </button>

                    <button
                      className="border rounded px-3 py-1 disabled:opacity-40"
                      disabled={!canCancel}
                      onClick={async () => {
                        await adminApi.cancelar(a.id);
                        load();
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="text-sm opacity-70">
                Nenhum agendamento encontrado para os filtros selecionados.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
