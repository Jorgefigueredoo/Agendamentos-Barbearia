"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi, type HorarioTrabalho } from "@/lib/adminApi";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

const DAYS = [
  { n: 1, label: "Segunda" },
  { n: 2, label: "Terça" },
  { n: 3, label: "Quarta" },
  { n: 4, label: "Quinta" },
  { n: 5, label: "Sexta" },
  { n: 6, label: "Sábado" },
  { n: 7, label: "Domingo" },
];

type Row = { start: string; end: string; active: boolean };

function ensureSeconds(t: string) {
  if (!t) return "09:00:00";
  if (t.length === 5) return `${t}:00`;
  return t;
}

function requireAuthOrRedirect(router: ReturnType<typeof useRouter>) {
  const token = localStorage.getItem("token");
  if (!token) {
    router.replace("/admin/login");
    return false;
  }
  return true;
}

export default function AdminHorariosPage() {
  const router = useRouter();

  const [barbers, setBarbers] = useState<{ id: number; name: string }[]>([]);
  const [barberId, setBarberId] = useState<number | null>(null);

  const [horarios, setHorarios] = useState<HorarioTrabalho[]>([]);
  const [form, setForm] = useState<Record<number, Row>>({
    1: { start: "09:00", end: "18:00", active: true },
    2: { start: "09:00", end: "18:00", active: true },
    3: { start: "09:00", end: "18:00", active: true },
    4: { start: "09:00", end: "18:00", active: true },
    5: { start: "09:00", end: "18:00", active: true },
    6: { start: "09:00", end: "18:00", active: true },
    7: { start: "09:00", end: "18:00", active: true },
  });

  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [savingDay, setSavingDay] = useState<number | null>(null);

  async function loadBarbers() {
    if (!requireAuthOrRedirect(router)) return;
    setErro("");

    try {
      const b = await adminApi.listarBarbeiros();
      setBarbers(b);
      if (b.length > 0 && barberId === null) setBarberId(b[0].id);
    } catch (e: any) {
      console.error("[HORARIOS] erro ao carregar barbeiros:", e);
      setErro(e?.message || "Erro ao carregar barbeiros");
    }
  }

  async function loadHorarios(id: number) {
    if (!requireAuthOrRedirect(router)) return;

    setLoading(true);
    setErro("");

    try {
      const h = await adminApi.listarHorarios(id);
      console.log("[HORARIOS] carregados:", h);
      setHorarios(h);

      const next: Record<number, Row> = {};

      // defaults
      DAYS.forEach((d) => {
        next[d.n] = { start: "09:00", end: "18:00", active: true };
      });

      // aplica valores do backend
      h.forEach((row) => {
        next[row.dayOfWeek] = {
          start: (row.startTime || "09:00:00").substring(0, 5),
          end: (row.endTime || "18:00:00").substring(0, 5),
          active: row.active ?? true,
        };
      });

      setForm(next);
    } catch (e: any) {
      console.error("[HORARIOS] erro ao carregar horarios:", e);
      setErro(e?.message || "Erro ao carregar horários");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBarbers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (barberId !== null) loadHorarios(barberId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [barberId]);

  async function salvarDia(dayOfWeek: number) {
    if (!barberId) return;

    const row = form[dayOfWeek];
    if (!row) return;

    if (!row.start || !row.end) {
      setErro("Informe start e end.");
      return;
    }
    if (row.start >= row.end) {
      setErro("O horário inicial precisa ser menor que o final.");
      return;
    }

    setSavingDay(dayOfWeek);
    setErro("");

    const payload = {
      barberId,
      dayOfWeek,
      startTime: ensureSeconds(row.start),
      endTime: ensureSeconds(row.end),
      active: row.active,
    };

    try {
      console.log("[SALVAR] payload:", payload);

      const resp = await adminApi.salvarHorario(payload);

      console.log("[SALVAR] resposta:", resp);

      await loadHorarios(barberId);

      alert("Horário salvo ✅");
    } catch (e: any) {
      console.error("[SALVAR] erro:", e);
      setErro(e?.message || "Erro ao salvar horário");
    } finally {
      setSavingDay(null);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />

      <main className="lg:ml-64 pt-14 lg:pt-0 p-6 max-w-4xl mr-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Horários de Trabalho</h1>
          <button
            className="border rounded p-2"
            onClick={() => barberId && loadHorarios(barberId)}
          >
            Atualizar
          </button>
        </div>

        {erro && <div className="text-red-600 text-sm">{erro}</div>}

        <div className="border rounded p-3 bg-card flex gap-2 items-center min-w-0">
          <span className="text-sm opacity-80">Barbeiro:</span>
          <select
            className="border rounded p-2 bg-background flex-1 min-w-0"
            value={barberId ?? ""}
            onChange={(e) => setBarberId(Number(e.target.value))}
          >
            {barbers.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-sm opacity-70">Carregando...</div>
        ) : (
          <div className="space-y-2">
            {DAYS.map((d) => {
              const row = form[d.n];

              return (
                <div
                  key={d.n}
                  className="border rounded p-3 bg-card flex flex-wrap items-center justify-between gap-3 min-w-0"
                >
                  <div className="font-medium w-28">{d.label}</div>

                  <div className="flex flex-wrap gap-2 items-center flex-1 min-w-0">
                    <input
                      className="border rounded p-2 bg-background w-32"
                      type="time"
                      value={row.start}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          [d.n]: { ...prev[d.n], start: e.target.value },
                        }))
                      }
                    />

                    <span className="opacity-70">até</span>

                    <input
                      className="border rounded p-2 bg-background w-32"
                      type="time"
                      value={row.end}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          [d.n]: { ...prev[d.n], end: e.target.value },
                        }))
                      }
                    />

                    <label className="border rounded p-2 bg-background flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={row.active}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            [d.n]: { ...prev[d.n], active: e.target.checked },
                          }))
                        }
                      />
                      Ativo
                    </label>
                  </div>

                  <button
                    className="border rounded px-3 py-2 disabled:opacity-40"
                    disabled={savingDay === d.n}
                    onClick={() => salvarDia(d.n)}
                  >
                    {savingDay === d.n ? "Salvando..." : "Salvar"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
