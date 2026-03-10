"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { signIn, user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Se já está logado, redireciona direto
  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  // Enquanto verifica sessão, não renderiza nada
  if (loading || user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await signIn(email, password);
      toast.success("Bem-vindo de volta!");
      router.replace("/dashboard");
    } catch (err: any) {
      const msg =
        err.code === "auth/invalid-credential"
          ? "Email ou senha incorretos"
          : err.message || "Erro ao entrar";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card p-8 shadow-2xl animate-slide-up">
      <h2 className="text-2xl font-bold text-coal-100 mb-1">Entrar</h2>
      <p className="text-coal-400 text-sm mb-6">
        Acesse sua conta para participar
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            className="input"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label">Senha</label>
          <input
            type="password"
            className="input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="btn-primary w-full mt-2"
          disabled={submitting}
        >
          {submitting ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p className="text-center text-coal-400 text-sm mt-6">
        Não tem conta?{" "}
        <Link
          href="/register"
          className="text-amber-400 hover:text-amber-300 font-medium"
        >
          Cadastre-se
        </Link>
      </p>
    </div>
  );
}
