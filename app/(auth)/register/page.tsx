"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import type { Team } from "@/types";

export default function RegisterPage() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [team, setTeam] = useState<Team | "">("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!team) { toast.error("Escolha uma equipe"); return; }
    setLoading(true);
    try {
      await signUp({ name, email, password, team: team as Team });
      toast.success("Conta criada! Bem-vindo à competição!");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  const teams = [
    { id: "antigos", label: "Funcionários Antigos", emoji: "🏅", color: "amber" },
    { id: "novos", label: "Funcionários Novos", emoji: "⚡", color: "blue" },
  ] as const;

  return (
    <div className="card p-8 shadow-2xl animate-slide-up">
      <h2 className="text-2xl font-bold text-coal-100 mb-1">Criar Conta</h2>
      <p className="text-coal-400 text-sm mb-6">Junte-se à competição</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Nome completo</label>
          <input
            type="text"
            className="input"
            placeholder="Seu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
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
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </div>

        <div>
          <label className="label">Escolha sua equipe</label>
          <div className="grid grid-cols-2 gap-3">
            {teams.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTeam(t.id)}
                className={`p-4 rounded-xl border-2 text-center transition-all duration-150 ${
                  team === t.id
                    ? t.id === "antigos"
                      ? "border-amber-500 bg-amber-500/10 text-amber-400"
                      : "border-blue-500 bg-blue-500/10 text-blue-400"
                    : "border-coal-700 bg-coal-800 text-coal-300 hover:border-coal-600"
                }`}
              >
                <div className="text-2xl mb-1">{t.emoji}</div>
                <div className="text-xs font-semibold leading-tight">{t.label}</div>
              </button>
            ))}
          </div>
        </div>

        <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
          {loading ? "Criando conta..." : "Criar conta"}
        </button>
      </form>

      <p className="text-center text-coal-400 text-sm mt-6">
        Já tem conta?{" "}
        <Link href="/login" className="text-amber-400 hover:text-amber-300 font-medium">
          Entrar
        </Link>
      </p>
    </div>
  );
}
