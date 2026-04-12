"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { resetPassword } from "@/lib/firebase/auth";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const { signIn, user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [forgotMode, setForgotMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [user, loading, router]);

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

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetting(true);
    try {
      await resetPassword(resetEmail);
      setResetSent(true);
    } catch (err: any) {
      const msg =
        err.code === "auth/user-not-found"
          ? "Nenhuma conta encontrada com esse email"
          : err.message || "Erro ao enviar email";
      toast.error(msg);
    } finally {
      setResetting(false);
    }
  };

  const backToLogin = () => {
    setForgotMode(false);
    setResetEmail("");
    setResetSent(false);
  };

  // ── Esqueci a senha ──────────────────────────────────────────────────────
  if (forgotMode) {
    return (
      <div className="card p-8 shadow-2xl animate-slide-up">
        <button
          onClick={backToLogin}
          className="flex items-center gap-1.5 text-coal-400 hover:text-coal-200 text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={14} /> Voltar ao login
        </button>

        {resetSent ? (
          <div className="text-center py-2">
            <div className="text-4xl mb-4">📬</div>
            <h2 className="text-xl font-bold text-coal-100 mb-2">
              Email enviado!
            </h2>
            <p className="text-coal-400 text-sm mb-6">
              Verifique sua caixa de entrada em{" "}
              <span className="text-coal-200 font-medium">{resetEmail}</span>{" "}
              e siga as instruções para redefinir sua senha.
            </p>
            <button onClick={backToLogin} className="btn-primary w-full">
              Voltar ao login
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-coal-100 mb-1">
              Esqueceu a senha?
            </h2>
            <p className="text-coal-400 text-sm mb-6">
              Digite seu email e enviaremos um link para você criar uma nova senha.
            </p>
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  className="input"
                  placeholder="seu@email.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="btn-primary w-full"
                disabled={resetting}
              >
                {resetting ? "Enviando..." : "Enviar link de redefinição"}
              </button>
            </form>
          </>
        )}
      </div>
    );
  }

  // ── Login normal ─────────────────────────────────────────────────────────
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
          <div className="flex items-center justify-between mb-1">
            <label className="label mb-0">Senha</label>
            <button
              type="button"
              onClick={() => { setForgotMode(true); setResetEmail(email); }}
              className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
            >
              Esqueceu a senha?
            </button>
          </div>
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
