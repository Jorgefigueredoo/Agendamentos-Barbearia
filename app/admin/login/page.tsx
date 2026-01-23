"use client";

import { useState } from "react";
import { login } from "@/lib/adminApi";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("admin@barbearia.com");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      console.log("[LOGIN] tentando...", { email });

      const data = await login(email, senha); // ✅ chama 1 vez só

      console.log("[LOGIN] resposta:", data);

      localStorage.setItem("token", data.token);

      console.log("[LOGIN] token salvo:", localStorage.getItem("token"));

      // ✅ redireciona (1 vez)
      window.location.href = "/admin";
    } catch (err: any) {
      console.error("[LOGIN] erro:", err);
      setErro(err?.message || "Erro ao logar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm space-y-4 border rounded-lg p-6 bg-card"
      >
        <h1 className="text-xl font-semibold">Área do Barbeiro</h1>

        {erro && <div className="text-red-600 text-sm">{erro}</div>}

        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <input
            className="w-full border rounded p-2 bg-background"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@barbearia.com"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Senha</label>
          <input
            className="w-full border rounded p-2 bg-background"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="********"
          />
        </div>

        {/* ✅ sem onClick, só submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-primary text-primary-foreground p-2 disabled:opacity-50"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
