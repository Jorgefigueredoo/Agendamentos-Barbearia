"use client";

import { useEffect, useState } from "react";
import { login } from "@/lib/adminApi";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ se já estiver logado, vai direto para /admin
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      window.location.href = "/admin";
    }
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const data = await login(email, senha);
      localStorage.setItem("token", data.token);
      window.location.href = "/admin";
    } catch (err: any) {
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
            placeholder="Digite seu email"
            autoComplete="username"
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
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !email.trim() || !senha.trim()}
          className="w-full rounded bg-primary text-primary-foreground p-2 disabled:opacity-50"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
