"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi, type AdminAgendamento } from "@/lib/adminApi";
import { AdminSidebar } from "@/components/admin/admin-sidebar";


function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function hhmm(iso: string) {
  return iso?.includes("T") ? iso.substring(11, 16) : iso;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [date, setDate] = useState(todayISO());
  const [items, setItems] = useState<AdminAgendamento[]>([]);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  function requireAuth() {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/admin/login");
      return false;
    }
    return true;
  }

  async function load() {
    if (!requireAuth()) return;

    setLoading(true);
    setErro("");
    try {
      const data = await adminApi.agendaDoDia(date);
      setItems(data);
    } catch (e: any) {
      setErro(e?.message || "Erro ao carregar agenda");
      // token inválido/expirado → volta pro login
      if (String(e?.message || "").includes("401") || String(e?.message || "").includes("403")) {
        localStorage.removeItem("token");
        router.push("/admin/login");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />

      <main className="lg:ml-64 pt-14 lg:pt-0 p-6 max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Agendamentos</h1>
          <div className="flex gap-2 items-center">
            <input
              className="border rounded p-2 bg-background"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <button className="border rounded p-2" onClick={load}>
              Atualizar
            </button>
          </div>
        </div>

        {erro && <div className="text-red-600 text-sm">{erro}</div>}

        {loading ? (
          <div className="text-sm opacity-70">Carregando...</div>
        ) : (
          <div className="space-y-2">
            {items.map((a) => (
              <div key={a.id} className="border rounded p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">
                    {a.clientName} ({a.clientPhone})
                  </div>
                  <div className="text-sm opacity-80">
                    {hhmm(a.startTime)} • {a.servicoNome} • <span className="font-medium">{a.status}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    className="border rounded px-3 py-1"
                    onClick={async () => {
                      await adminApi.confirmar(a.id);
                      load();
                    }}
                  >
                    Confirmar
                  </button>

                  <button
                    className="border rounded px-3 py-1"
                    onClick={async () => {
                      await adminApi.cancelar(a.id);
                      load();
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ))}

            {items.length === 0 && (
              <div className="text-sm opacity-70">Sem agendamentos para este dia.</div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
