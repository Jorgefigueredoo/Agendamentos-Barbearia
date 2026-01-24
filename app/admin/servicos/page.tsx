"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi, type AdminServico } from "@/lib/adminApi";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

function formatPriceBR(cents: number) {
  return (cents / 100).toFixed(2).replace(".", ",");
}

function parsePriceToCents(v: string) {
  // aceita "35,00" ou "35.00"
  const normalized = v.replace(".", "").replace(",", ".");
  const num = Number(normalized);
  if (Number.isNaN(num)) return 0;
  return Math.round(num * 100);
}

export default function AdminServicosPage() {
  const router = useRouter();

  const [items, setItems] = useState<AdminServico[]>([]);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  // form (criar/editar)
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [durationMin, setDurationMin] = useState(30);
  const [price, setPrice] = useState("35,00");
  const [active, setActive] = useState(true);

  const isEditing = useMemo(() => editingId !== null, [editingId]);

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
      const data = await adminApi.listarServicos();
      setItems(data);
    } catch (e: any) {
      setErro(e?.message || "Erro ao carregar serviços");
      // se token inválido, volta pro login
      if (String(e?.message || "").includes("401") || String(e?.message || "").includes("403")) {
        localStorage.removeItem("token");
        router.replace("/admin/login");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function resetForm() {
    setEditingId(null);
    setName("");
    setDurationMin(30);
    setPrice("35,00");
    setActive(true);
  }

  function startEdit(s: AdminServico) {
    setEditingId(s.id);
    setName(s.name);
    setDurationMin(s.durationMin);
    setPrice(formatPriceBR(s.priceCents));
    setActive(!!s.active);
    setErro("");
    // scroll até o formulário
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onSave() {
    setErro("");

    if (!name.trim()) {
      setErro("Informe o nome do serviço.");
      return;
    }

    const payload = {
      name: name.trim(),
      durationMin,
      priceCents: parsePriceToCents(price),
      active,
    };

    try {
      if (editingId === null) {
        await adminApi.criarServico(payload);
      } else {
        await adminApi.atualizarServico(editingId, payload);
      }

      resetForm();
      await load();
    } catch (e: any) {
      setErro(e?.message || "Erro ao salvar serviço");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />

      <main className="lg:ml-64 pt-14 lg:pt-0 p-6 max-w-5xl space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Serviços</h1>
          <button className="border rounded p-2" onClick={load}>
            Atualizar
          </button>
        </div>

        {erro && <div className="text-red-600 text-sm">{erro}</div>}

        {/* FORM Criar/Editar */}
        <div className="border rounded p-4 space-y-3 bg-card">
          <div className="flex items-center justify-between">
            <div className="font-medium">
              {isEditing ? "Editar serviço" : "Criar serviço"}
            </div>

            {isEditing && (
              <button className="border rounded px-3 py-1" onClick={resetForm}>
                Cancelar edição
              </button>
            )}
          </div>

          <input
            className="border rounded p-2 w-full bg-background"
            placeholder="Nome do serviço"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
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

            <label className="border rounded p-2 bg-background flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
              />
              Ativo
            </label>

            <button
              className="rounded bg-primary text-primary-foreground p-2 disabled:opacity-50"
              onClick={onSave}
              disabled={!name.trim()}
            >
              {isEditing ? "Atualizar" : "Salvar"}
            </button>
          </div>
        </div>

        {/* LISTA */}
        {loading ? (
          <div className="text-sm opacity-70">Carregando...</div>
        ) : (
          <div className="space-y-2">
            {items.map((s) => {
              const isActive = !!s.active;

              return (
                <div key={s.id} className="border rounded p-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{s.name}</div>

                    <div className="text-sm opacity-80 flex items-center gap-2">
                      <span>{s.durationMin} min</span>
                      <span>•</span>
                      <span>R$ {(s.priceCents / 100).toFixed(2)}</span>
                      <span>•</span>

                      <span
                        className={
                          "px-2 py-0.5 rounded-full text-xs font-medium " +
                          (isActive
                            ? "bg-green-500/15 text-green-400 border border-green-500/30"
                            : "bg-zinc-500/15 text-zinc-300 border border-zinc-500/30")
                        }
                      >
                        {isActive ? "ATIVO" : "INATIVO"}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      className="border rounded px-3 py-1"
                      onClick={() => startEdit(s)}
                    >
                      Editar
                    </button>

                    <button
                      className={
                        "border rounded px-3 py-1 font-medium transition-colors " +
                        (isActive
                          ? "border-red-500/40 text-red-300 hover:bg-red-500/10"
                          : "border-green-500/40 text-green-300 hover:bg-green-500/10")
                      }
                      onClick={async () => {
                        await adminApi.toggleServico(s.id);
                        load();
                      }}
                    >
                      {isActive ? "Desativar" : "Ativar"}
                    </button>
                  </div>
                </div>
              );
            })}

            {items.length === 0 && (
              <div className="text-sm opacity-70">Nenhum serviço cadastrado.</div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}