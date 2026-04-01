"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createGame } from "@/lib/firebase/firestore";
import toast from "react-hot-toast";
import Link from "next/link";
import { ArrowLeft, Swords } from "lucide-react";

export default function NovoJogoPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duoOnly, setDuoOnly] = useState(false);
  const [minPlayers, setMinPlayers] = useState(2);
  const [maxPlayers, setMaxPlayers] = useState(6);
  const [pointValue, setPointValue] = useState(1);
  const [loading, setLoading] = useState(false);

  const effectiveMin = duoOnly ? 2 : minPlayers;
  const effectiveMax = duoOnly ? 2 : maxPlayers;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!duoOnly && minPlayers > maxPlayers) { toast.error("Mínimo não pode ser maior que máximo"); return; }
    if (!user) return;
    setLoading(true);
    try {
      await createGame({ name, description: description || undefined, minPlayers: effectiveMin, maxPlayers: effectiveMax, pointValue }, user.uid);
      toast.success("Jogo cadastrado!");
      router.push("/admin/jogos");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-lg">
      <Link href="/admin/jogos" className="btn-ghost flex items-center gap-2 mb-6 -ml-2 w-fit">
        <ArrowLeft size={16} /> Voltar
      </Link>

      <h1 className="font-display text-4xl text-gradient tracking-wide mb-8">NOVO JOGO</h1>

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Nome do Jogo *</label>
            <input
              type="text"
              className="input"
              placeholder="ex: Catan, Ticket to Ride..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">Descrição (opcional)</label>
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="Breve descrição do jogo..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Número de Jogadores *</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDuoOnly(false)}
                className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  !duoOnly
                    ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                    : "border-coal-600 text-coal-400 hover:border-coal-500 hover:text-coal-300"
                }`}
              >
                Variável
              </button>
              <button
                type="button"
                onClick={() => setDuoOnly(true)}
                className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                  duoOnly
                    ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                    : "border-coal-600 text-coal-400 hover:border-coal-500 hover:text-coal-300"
                }`}
              >
                <Swords size={14} /> Apenas 2 jogadores
              </button>
            </div>
          </div>

          {!duoOnly && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Mínimo de Jogadores *</label>
                <input
                  type="number"
                  className="input"
                  min={1}
                  max={20}
                  value={minPlayers}
                  onChange={(e) => setMinPlayers(Number(e.target.value))}
                  required
                />
              </div>
              <div>
                <label className="label">Máximo de Jogadores *</label>
                <input
                  type="number"
                  className="input"
                  min={1}
                  max={20}
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(Number(e.target.value))}
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="label">Pontuação por Vitória *</label>
            <div className="flex gap-2">
              {[1, 2, 3].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setPointValue(v)}
                  className={`flex-1 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                    pointValue === v
                      ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
                      : "border-coal-600 text-coal-400 hover:border-coal-500 hover:text-coal-300"
                  }`}
                >
                  {v} pt{v > 1 ? "s" : ""}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Link href="/admin/jogos" className="btn-secondary flex-1 text-center">
              Cancelar
            </Link>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? "Salvando..." : "Cadastrar Jogo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
