"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { useAuth } from "@/context/AuthContext";
import { useMatch } from "@/lib/hooks/useMatches";
import {
  joinMatch,
  leaveMatch,
  finalizeMatch,
  getUsersByIds,
} from "@/lib/firebase/firestore";
import {
  formatDate,
  teamLabel,
  teamColor,
  statusLabel,
} from "@/lib/utils/helpers";
import toast from "react-hot-toast";
import Link from "next/link";
import type { User } from "@/types";
import { ArrowLeft, Users, Trophy, Clock, Swords } from "lucide-react";

export default function MatchDetailPage({
  params,
}: {
  params: { matchId: string };
}) {
  const { user } = useAuth();
  const { match, loading } = useMatch(params.matchId);
  const [players, setPlayers] = useState<User[]>([]);
  const [selectedWinners, setSelectedWinners] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [showResultForm, setShowResultForm] = useState(false);

  useEffect(() => {
    if (match?.players?.length) {
      getUsersByIds(match.players).then(setPlayers);
    }
  }, [match?.players?.join(",")]);

  if (!user) return null;

  if (loading) {
    return (
      <div className="text-center py-20 text-coal-500">
        Carregando partida...
      </div>
    );
  }

  if (!match) {
    return (
      <div className="text-center py-20">
        <p className="text-coal-400">Partida não encontrada</p>
        <Link href="/jogos" className="btn-primary mt-4 inline-block">
          Voltar
        </Link>
      </div>
    );
  }

  const isIn = match.players.includes(user.uid);
  const isAdmin = user.role === "admin";
  const winners = players.filter((p) => match.winners.includes(p.uid));

  const handleJoin = async () => {
    setActionLoading(true);
    try {
      await joinMatch(match.id, user.uid);
      toast.success("Inscrito na partida!");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    setActionLoading(true);
    try {
      await leaveMatch(match.id, user.uid);
      toast.success("Saiu da partida");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleFinalize = async () => {
    if (selectedWinners.length === 0) {
      toast.error("Selecione pelo menos um vencedor");
      return;
    }
    setActionLoading(true);
    try {
      await finalizeMatch({ matchId: match.id, winnerIds: selectedWinners });
      toast.success("Partida finalizada! Pontos distribuídos.");
      setShowResultForm(false);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const toggleWinner = (uid: string) => {
    setSelectedWinners((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid],
    );
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <Link
        href="/jogos"
        className="btn-ghost flex items-center gap-2 mb-6 -ml-2 w-fit"
      >
        <ArrowLeft size={16} /> Voltar
      </Link>

      {/* Header */}
      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-4xl text-gradient tracking-wide mb-2">
              {match.gameName}
            </h1>
            <span
              className={`badge-${match.status} inline-flex items-center gap-1`}
            >
              {match.status === "waiting" && <Clock size={12} />}
              {match.status === "active" && <Swords size={12} />}
              {match.status === "finished" && <Trophy size={12} />}
              {statusLabel(match.status)}
            </span>
          </div>
          {match.status === "waiting" &&
            (isIn ? (
              <button
                onClick={handleLeave}
                disabled={actionLoading}
                className="btn-secondary text-red-400 border-red-400/20"
              >
                {actionLoading ? "..." : "Sair da Partida"}
              </button>
            ) : (
              <button
                onClick={handleJoin}
                disabled={actionLoading}
                className="btn-primary"
              >
                {actionLoading ? "..." : "Inscrever-se"}
              </button>
            ))}
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-coal-700">
          <div>
            <div className="text-coal-500 text-xs mb-1">Criado em</div>
            <div className="text-coal-200 text-sm">
              {formatDate(match.createdAt)}
            </div>
          </div>
          {match.startedAt && (
            <div>
              <div className="text-coal-500 text-xs mb-1">Iniciado em</div>
              <div className="text-coal-200 text-sm">
                {formatDate(match.startedAt)}
              </div>
            </div>
          )}
          {match.finishedAt && (
            <div>
              <div className="text-coal-500 text-xs mb-1">Finalizado em</div>
              <div className="text-coal-200 text-sm">
                {formatDate(match.finishedAt)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Winners */}
      {match.status === "finished" && winners.length > 0 && (
        <div
          className="card p-6 mb-6 border-amber-500/30"
          style={{ background: "linear-gradient(135deg, #F59E0B10, #0A0A0A)" }}
        >
          <h2 className="font-bold text-amber-400 mb-3 flex items-center gap-2">
            <Trophy size={16} /> Vencedores
          </h2>
          <div className="space-y-2">
            {winners.map((w) => (
              <div key={w.uid} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-sm">
                  {w.name.charAt(0)}
                </div>
                <div>
                  <div className="font-medium text-coal-100">{w.name}</div>
                  <div className="text-xs" style={{ color: teamColor(w.team) }}>
                    {teamLabel(w.team)}
                  </div>
                </div>
                <span className="ml-auto text-amber-400 font-bold text-sm">
                  +1 pt
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Players */}
      <div className="card p-6 mb-6">
        <h2 className="font-bold text-coal-100 mb-4 flex items-center gap-2">
          <Users size={16} className="text-coal-400" />
          Jogadores Inscritos ({players.length})
        </h2>
        {players.length === 0 ? (
          <p className="text-coal-500 text-sm text-center py-4">
            Nenhum jogador inscrito ainda
          </p>
        ) : (
          <div className="space-y-2">
            {players.map((p) => {
              const isWinner = match.winners.includes(p.uid);
              return (
                <div
                  key={p.uid}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-coal-800 transition-all"
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
                    style={{
                      background: teamColor(p.team) + "30",
                      color: teamColor(p.team),
                    }}
                  >
                    {p.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-coal-100 text-sm">
                      {p.name}
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: teamColor(p.team) }}
                    >
                      {teamLabel(p.team)}
                    </div>
                  </div>
                  <div className="text-xs text-coal-400">{p.points} pts</div>
                  {isWinner && (
                    <span className="text-amber-400 text-sm">🏆</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Admin: Finalize */}
      {isAdmin && match.status === "active" && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-coal-100">Registrar Resultado</h2>
            <button
              onClick={() => setShowResultForm(!showResultForm)}
              className="btn-secondary text-sm"
            >
              {showResultForm ? "Cancelar" : "Finalizar Partida"}
            </button>
          </div>
          {showResultForm && (
            <div className="animate-slide-up">
              <p className="text-coal-400 text-sm mb-4">
                Selecione os vencedores desta partida:
              </p>
              <div className="space-y-2 mb-4">
                {players.map((p) => (
                  <label
                    key={p.uid}
                    className="flex items-center gap-3 p-3 rounded-lg bg-coal-800 cursor-pointer hover:bg-coal-700 transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={selectedWinners.includes(p.uid)}
                      onChange={() => toggleWinner(p.uid)}
                      className="w-4 h-4 accent-amber-500"
                    />
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                      style={{
                        background: teamColor(p.team) + "30",
                        color: teamColor(p.team),
                      }}
                    >
                      {p.name.charAt(0)}
                    </div>
                    <span className="text-coal-100 text-sm font-medium">
                      {p.name}
                    </span>
                    <span
                      className="text-xs ml-auto"
                      style={{ color: teamColor(p.team) }}
                    >
                      {teamLabel(p.team)}
                    </span>
                  </label>
                ))}
              </div>
              <button
                onClick={handleFinalize}
                disabled={actionLoading || selectedWinners.length === 0}
                className="btn-primary w-full"
              >
                {actionLoading
                  ? "Finalizando..."
                  : `Confirmar (${selectedWinners.length} vencedor${selectedWinners.length !== 1 ? "es" : ""})`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
