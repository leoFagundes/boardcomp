"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createGame } from "@/lib/firebase/firestore";
import toast from "react-hot-toast";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NovoJogoPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [minPlayers, setMinPlayers] = useState(2);
  const [maxPlayers, setMaxPlayers] = useState(6);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (minPlayers > maxPlayers) { toast.error("Mínimo não pode ser maior que máximo"); return; }
    if (!user) return;
    setLoading(true);
    try {
      await createGame({ name, description: description || undefined, minPlayers, maxPlayers }, user.uid);
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
