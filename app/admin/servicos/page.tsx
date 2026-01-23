"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi, type AdminServico } from "@/lib/adminApi";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default function AdminServicosPage() {
  const router = useRouter();

  const [items, setItems] = useState<AdminServico[]>([]);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [durationMin, setDurationMin] = useState(30);
  const [price, setPrice] = useState("35,00");

  function requireAuth() {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/admin/login");
      return false;
    }
    return true;
  }

  function parsePriceToCents(v: string) {
    // aceita "35,00" ou "35.00"
    const normalized = v.replace(".", "").replace(",", ".");
    const num = Number(normalized);
    if (Number.isNaN(num)) return 0;
    return Math.round(num * 100);
  }

  async function load() {
    if (!requireAuth()) return;

    setLoading(true);
    setErro("");
    try {
      setItems(await adminApi.listarServicos());
    } catch (e: any) {
      setErro(e?.message || "Erro ao carregar serviços");
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
  }, []);

  async function create() {
    if (!name.trim()) {
      setErro("Informe o nome do serviço.");
      return;
    }

    setErro("");
    try {
      await adminApi.criarServico({
        name: name.trim(),
        durationMin,
        priceCents: parsePriceToCents(price),
      });

      setName("");
      setDurationMin(30);
      setPrice("35,00");
      load();
    } catch (e: any) {
      setErro(e?.message || "Erro ao criar serviço");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />

      <main className="lg:ml-64 pt-14 lg:pt-0 p-6 max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Serviços</h1>
          <button className="border rounded p-2" onClick={load}>
            Atualizar
          </button>
        </div>

        {erro && <div className="text-red-600 text-sm">{erro}</div>}

        <div className="border rounded p-4 space-y-3 bg-card">
          <div className="font-medium">Criar serviço</div>

          <input
            className="border rounded p-2 w-full bg-background"
            placeholder="Nome do serviço"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              className="border rounded p-2 bg-background"
              type="number"
              min={5}
              value={durationMin}
              onChange={(e) => setDurationMin(Number(e.target.value))}
              placeholder="Duração (min)"
            />

            <input
              className="border rounded p-2 bg-background"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Preço (ex: 35,00)"
            />

            <button className="border rounded p-2" onClick={create}>
              Salvar
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-sm opacity-70">Carregando...</div>
        ) : (
          <div className="space-y-2">
            {items.map((s) => (
              <div key={s.id} className="border rounded p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{s.name}</div>
                  <div className="text-sm opacity-80">
                    {s.durationMin} min • R$ {(s.priceCents / 100).toFixed(2)} •{" "}
                    <span className="font-medium">{s.active ? "ATIVO" : "INATIVO"}</span>
                  </div>
                </div>

                <button
                  className="border rounded px-3 py-1"
                  onClick={async () => {
                    await adminApi.toggleServico(s.id);
                    load();
                  }}
                >
                  Ativar/Desativar
                </button>
              </div>
            ))}

            {items.length === 0 && <div className="text-sm opacity-70">Nenhum serviço cadastrado.</div>}
          </div>
        )}
      </main>
    </div>
  );
}
