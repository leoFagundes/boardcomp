"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useMatches } from "@/lib/hooks/useMatches";
import { joinMatch, leaveMatch } from "@/lib/firebase/firestore";
import Link from "next/link";
import toast from "react-hot-toast";
import { formatDate, statusLabel } from "@/lib/utils/helpers";
import { Users, Clock, Swords, CheckCircle, Plus } from "lucide-react";
import type { MatchStatus } from "@/types";

const filters: { value: MatchStatus | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "waiting", label: "Aguardando" },
  { value: "active", label: "Em andamento" },
  { value: "finished", label: "Finalizados" },
];

export default function JogosPage() {
  const { user } = useAuth();
  const { matches, loading } = useMatches();
  const [filter, setFilter] = useState<MatchStatus | "all">("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  if (!user) return null;

  const filtered = filter === "all" ? matches : matches.filter((m) => m.status === filter);

  const handleJoin = async (matchId: string) => {
    setActionLoading(matchId);
    try {
      await joinMatch(matchId, user.uid);
      toast.success("Você se inscreveu na partida!");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleLeave = async (matchId: string) => {
    setActionLoading(matchId);
    try {
      await leaveMatch(matchId, user.uid);
      toast.success("Você saiu da partida");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const statusIcon = (s: string) => s === "waiting" ? <Clock size={14} /> : s === "active" ? <Swords size={14} /> : <CheckCircle size={14} />;

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-4xl text-gradient tracking-wide">PARTIDAS</h1>
          <p className="text-coal-400 text-sm mt-1">Inscreva-se e compete</p>
        </div>
        {user.role === "admin" && (
          <Link href="/admin/partidas" className="btn-primary flex items-center gap-2 self-start">
            <Plus size={16} />
            Nova Partida
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              filter === f.value
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                : "bg-coal-800 text-coal-400 border border-coal-700 hover:text-coal-200"
            }`}
          >
            {f.label}
            <span className="ml-2 text-xs opacity-60">
              ({f.value === "all" ? matches.length : matches.filter((m) => m.status === f.value).length})
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-coal-500">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🎲</div>
          <p className="text-coal-400">Nenhuma partida encontrada</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((match) => {
            const isIn = match.players.includes(user.uid);
            const isFull = match.players.length >= 10; // fallback
            const isLoading = actionLoading === match.id;

            return (
              <div key={match.id} className="card-hover p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Link href={`/jogos/${match.id}`} className="font-bold text-coal-100 hover:text-amber-400 transition-colors text-lg">
                      {match.gameName}
                    </Link>
                    <span className={`badge-${match.status} flex items-center gap-1`}>
                      {statusIcon(match.status)}
                      {statusLabel(match.status)}
                    </span>
                    {isIn && (
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold px-2 py-0.5 rounded-full">
                        Inscrito
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-coal-400">
                    <span className="flex items-center gap-1">
                      <Users size={13} />
                      {match.players.length} jogadores inscritos
                    </span>
                    <span>{formatDate(match.createdAt)}</span>
                  </div>
                  {match.status === "finished" && match.winners.length > 0 && (
                    <div className="mt-2 flex items-center gap-1.5 text-sm text-amber-400">
                      🏆 <span>{match.winners.length} vencedor(es)</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/jogos/${match.id}`} className="btn-secondary text-sm">
                    Detalhes
                  </Link>
                  {match.status === "waiting" && (
                    isIn ? (
                      <button
                        onClick={() => handleLeave(match.id)}
                        disabled={isLoading}
                        className="btn-ghost text-sm text-red-400 hover:text-red-300 border border-red-400/20 hover:border-red-400/40 px-4 py-2"
                      >
                        {isLoading ? "..." : "Sair"}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleJoin(match.id)}
                        disabled={isLoading}
                        className="btn-primary text-sm"
                      >
                        {isLoading ? "..." : "Inscrever-se"}
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
