"use client";

import { useState } from "react";
import { useMatches } from "@/lib/hooks/useMatches";
import { useGames } from "@/lib/hooks/useGames";
import { useAuth } from "@/context/AuthContext";
import { createMatch, deleteMatch } from "@/lib/firebase/firestore";
import Link from "next/link";
import toast from "react-hot-toast";
import { formatDate, statusLabel } from "@/lib/utils/helpers";
import { Plus, Users, X, Trash2, Trophy, History } from "lucide-react";
import type { Match } from "@/types";
import Loading from "@/components/loading";

export default function AdminPartidasPage() {
  const { user } = useAuth();
  const { matches, loading } = useMatches();
  const { games } = useGames();
  const [showForm, setShowForm] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingMatch, setDeletingMatch] = useState<Match | null>(null);
  const [deleting, setDeleting] = useState(false);

  const selectedGame = games.find((g) => g.id === selectedGameId);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGame || !user) return;
    setCreating(true);
    try {
      await createMatch(
        { gameId: selectedGame.id, gameName: selectedGame.name },
        user.uid,
      );
      toast.success("Partida criada!");
      setShowForm(false);
      setSelectedGameId("");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (revertPoints: boolean) => {
    if (!deletingMatch) return;
    setDeleting(true);
    try {
      await deleteMatch(deletingMatch.id, revertPoints);
      toast.success(
        revertPoints
          ? "Partida excluída e pontos revertidos!"
          : "Partida excluída (pontos mantidos)",
      );
      setDeletingMatch(null);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setDeleting(false);
    }
  };

  const isFinished =
    deletingMatch?.status === "finished" &&
    (deletingMatch?.winners?.length ?? 0) > 0;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl text-gradient tracking-wide">
            PARTIDAS
          </h1>
          <p className="text-coal-400 text-sm mt-1">
            {matches.length} partidas no total
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? "Fechar" : "Nova Partida"}
        </button>
      </div>

      {/* Create match form */}
      {showForm && (
        <div className="card p-6 mb-6 animate-slide-up border-amber-500/30">
          <h2 className="font-bold text-coal-100 mb-4">Criar Nova Partida</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="label">Selecionar Jogo *</label>
              <select
                className="input"
                value={selectedGameId}
                onChange={(e) => setSelectedGameId(e.target.value)}
                required
              >
                <option value="">Escolha um jogo...</option>
                {games.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.minPlayers}–{g.maxPlayers} jogadores)
                  </option>
                ))}
              </select>
            </div>
            {selectedGame && (
              <div className="p-3 rounded-lg bg-coal-800 border border-coal-700 text-sm">
                <div className="font-medium text-coal-200">
                  {selectedGame.name}
                </div>
                {selectedGame.description && (
                  <div className="text-coal-400 mt-1">
                    {selectedGame.description}
                  </div>
                )}
                <div className="text-coal-500 mt-1">
                  {selectedGame.minPlayers}–{selectedGame.maxPlayers} jogadores
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={creating || !selectedGameId}
                className="btn-primary flex-1"
              >
                {creating ? "Criando..." : "Criar Partida"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deletingMatch && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-coal-900 border border-coal-700 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-slide-up">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                <Trash2 size={18} />
              </div>
              <div>
                <h3 className="font-bold text-coal-100 mb-1">
                  Excluir partida
                </h3>
                <p className="text-coal-400 text-sm">
                  Partida de{" "}
                  <span className="text-coal-200 font-medium">
                    "{deletingMatch.gameName}"
                  </span>
                </p>
              </div>
            </div>

            {isFinished ? (
              <>
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-5">
                  <p className="text-amber-400 text-sm font-medium flex items-center gap-2 mb-1">
                    <Trophy size={14} /> Esta partida tem{" "}
                    {deletingMatch.winners.length} vencedor(es)
                  </p>
                  <p className="text-coal-400 text-sm">
                    O que deseja fazer com os pontos dos vencedores?
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    onClick={() => handleDelete(true)}
                    disabled={deleting}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-red-500/40 bg-red-500/10 hover:bg-red-500/20 transition-all text-red-400"
                  >
                    <History size={20} />
                    <span className="text-sm font-semibold">
                      Reverter pontos
                    </span>
                    <span className="text-xs text-red-400/70 text-center">
                      Remove -1 pt de cada vencedor e da equipe
                    </span>
                  </button>
                  <button
                    onClick={() => handleDelete(false)}
                    disabled={deleting}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-coal-600 bg-coal-800 hover:bg-coal-700 transition-all text-coal-300"
                  >
                    <Trophy size={20} />
                    <span className="text-sm font-semibold">Manter pontos</span>
                    <span className="text-xs text-coal-500 text-center">
                      Exclui só o histórico da partida
                    </span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-coal-400 text-sm mb-5">
                  Esta partida não possui vencedores registrados. Ela será
                  excluída sem afetar nenhuma pontuação.
                </p>
                <button
                  onClick={() => handleDelete(false)}
                  disabled={deleting}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 w-full py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 font-medium mb-3"
                >
                  <Trash2 size={15} />{" "}
                  {deleting ? "Excluindo..." : "Confirmar exclusão"}
                </button>
              </>
            )}

            <button
              onClick={() => setDeletingMatch(null)}
              disabled={deleting}
              className="btn-secondary w-full"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <Loading />
      ) : (
        <div className="grid gap-3">
          {matches.map((match) => (
            <div
              key={match.id}
              className="card p-4 flex items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-coal-100">
                    {match.gameName}
                  </span>
                  <span className={`badge-${match.status}`}>
                    {statusLabel(match.status)}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-coal-500">
                  <span className="flex items-center gap-1">
                    <Users size={11} /> {match.players.length} inscritos
                  </span>
                  {match.winners.length > 0 && (
                    <span>🏆 {match.winners.length} vencedor(es)</span>
                  )}
                  <span>{formatDate(match.createdAt)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/jogos/${match.id}`}
                  className="btn-secondary text-sm"
                >
                  Ver detalhes
                </Link>
                <button
                  onClick={() => setDeletingMatch(match)}
                  className="btn-ghost p-2 text-coal-400 hover:text-red-400"
                  title="Excluir partida"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
