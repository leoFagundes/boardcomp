"use client";

import { useState } from "react";
import { useMatches } from "@/lib/hooks/useMatches";
import { useGames } from "@/lib/hooks/useGames";
import { useAuth } from "@/context/AuthContext";
import { createMatch, deleteMatch, editMatch, getUsers } from "@/lib/firebase/firestore";
import { useRanking } from "@/lib/hooks/useRanking";
import Link from "next/link";
import toast from "react-hot-toast";
import { formatDate, statusLabel, teamLabel, teamColor } from "@/lib/utils/helpers";
import { Plus, Users, X, Trash2, Trophy, History, Pencil, Check } from "lucide-react";
import type { Match, User, MatchStatus } from "@/types";
import Loading from "@/components/loading";

interface EditForm {
  gameId: string;
  gameName: string;
  pointValue: number;
  status: MatchStatus;
  players: string[];
  winners: string[];
}

export default function AdminPartidasPage() {
  const { user } = useAuth();
  const { matches, loading } = useMatches();
  const { games } = useGames();
  const { users: rankingUsers } = useRanking();

  const [showForm, setShowForm] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState("");
  const [creating, setCreating] = useState(false);

  const [deletingMatch, setDeletingMatch] = useState<Match | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [saving, setSaving] = useState(false);

  const selectedGame = games.find((g) => g.id === selectedGameId);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGame || !user) return;
    setCreating(true);
    try {
      await createMatch(
        { gameId: selectedGame.id, gameName: selectedGame.name, pointValue: selectedGame.pointValue ?? 1 },
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

  const openEdit = async (match: Match) => {
    setEditingMatch(match);
    setEditForm({
      gameId: match.gameId,
      gameName: match.gameName,
      pointValue: match.pointValue ?? 1,
      status: match.status,
      players: [...match.players],
      winners: [...match.winners],
    });
    setLoadingUsers(true);
    try {
      const users = await getUsers();
      setAllUsers(users);
    } finally {
      setLoadingUsers(false);
    }
  };

  const closeEdit = () => {
    setEditingMatch(null);
    setEditForm(null);
    setAllUsers([]);
  };

  const handleGameChange = (gameId: string) => {
    const game = games.find((g) => g.id === gameId);
    if (!game || !editForm) return;
    setEditForm({
      ...editForm,
      gameId: game.id,
      gameName: game.name,
      pointValue: game.pointValue ?? 1,
    });
  };

  const togglePlayer = (uid: string) => {
    if (!editForm) return;
    const isIn = editForm.players.includes(uid);
    const newPlayers = isIn
      ? editForm.players.filter((p) => p !== uid)
      : [...editForm.players, uid];
    // Remove from winners if removed from players
    const newWinners = editForm.winners.filter((w) => newPlayers.includes(w));
    setEditForm({ ...editForm, players: newPlayers, winners: newWinners });
  };

  const toggleWinner = (uid: string) => {
    if (!editForm) return;
    setEditForm({
      ...editForm,
      winners: editForm.winners.includes(uid)
        ? editForm.winners.filter((w) => w !== uid)
        : [...editForm.winners, uid],
    });
  };

  const handleSaveEdit = async () => {
    if (!editingMatch || !editForm) return;
    setSaving(true);
    try {
      await editMatch(editingMatch.id, editForm);
      toast.success("Partida atualizada!");
      closeEdit();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
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
            {selectedGame && (() => {
              const interested = rankingUsers.filter((u) =>
                (selectedGame.interests ?? []).includes(u.uid)
              );
              return (
                <div className="p-3 rounded-lg bg-coal-800 border border-coal-700 text-sm space-y-2">
                  <div className="font-medium text-coal-200">{selectedGame.name}</div>
                  {selectedGame.description && (
                    <div className="text-coal-400">{selectedGame.description}</div>
                  )}
                  <div className="text-coal-500">
                    {selectedGame.minPlayers}–{selectedGame.maxPlayers} jogadores
                    {" · "}
                    {selectedGame.pointValue ?? 1} pt{(selectedGame.pointValue ?? 1) > 1 ? "s" : ""} por vitória
                  </div>
                  {interested.length > 0 && (
                    <div className="pt-2 border-t border-coal-700">
                      <div className="text-coal-400 text-xs mb-1.5">
                        ⭐ {interested.length} {interested.length === 1 ? "pessoa quer" : "pessoas querem"} jogar esse jogo:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {interested.map((u) => {
                          const color = teamColor(u.team);
                          return (
                            <span
                              key={u.uid}
                              className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                              style={{ background: color + "20", color }}
                            >
                              {u.name.split(" ")[0]}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">
                Cancelar
              </button>
              <button type="submit" disabled={creating || !selectedGameId} className="btn-primary flex-1">
                {creating ? "Criando..." : "Criar Partida"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Edit modal ── */}
      {editingMatch && editForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-coal-900 border border-coal-700 rounded-2xl w-full max-w-xl shadow-2xl animate-slide-up my-4">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-coal-700">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <Pencil size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-coal-100">Editar Partida</h3>
                  <p className="text-coal-500 text-xs mt-0.5">{editingMatch.gameName}</p>
                </div>
              </div>
              <button onClick={closeEdit} className="btn-ghost p-2 text-coal-400 hover:text-coal-200">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Game */}
              <div>
                <label className="label">Jogo</label>
                <select
                  className="input"
                  value={editForm.gameId}
                  onChange={(e) => handleGameChange(e.target.value)}
                >
                  {games.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              {/* Status + pointValue */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Status</label>
                  <select
                    className="input"
                    value={editForm.status}
                    onChange={(e) => {
                      const s = e.target.value as MatchStatus;
                      // Clear winners if moving away from finished
                      setEditForm({ ...editForm, status: s, winners: s === "finished" ? editForm.winners : [] });
                    }}
                  >
                    <option value="waiting">Aguardando</option>
                    <option value="active">Em andamento</option>
                    <option value="finished">Finalizado</option>
                  </select>
                </div>
                <div>
                  <label className="label">Pts por vitória</label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setEditForm({ ...editForm, pointValue: v })}
                        className={`flex-1 py-2 rounded-xl border text-sm font-bold transition-all ${
                          editForm.pointValue === v
                            ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
                            : "border-coal-600 text-coal-400 hover:border-coal-500"
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Players */}
              <div>
                <label className="label">
                  Jogadores ({editForm.players.length} selecionados)
                </label>
                {loadingUsers ? (
                  <div className="text-coal-500 text-sm py-4 text-center">Carregando...</div>
                ) : (
                  <div className="max-h-52 overflow-y-auto rounded-xl border border-coal-700 divide-y divide-coal-700/50">
                    {allUsers.map((u) => {
                      const color = teamColor(u.team);
                      const isPlayer = editForm.players.includes(u.uid);
                      return (
                        <label
                          key={u.uid}
                          className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-coal-800 transition-all"
                        >
                          <input
                            type="checkbox"
                            checked={isPlayer}
                            onChange={() => togglePlayer(u.uid)}
                            className="w-4 h-4 accent-emerald-500 shrink-0"
                          />
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0"
                            style={{ background: color + "30", color }}
                          >
                            {u.name.charAt(0)}
                          </div>
                          <span className="text-coal-200 text-sm flex-1">{u.name}</span>
                          <span className="text-xs" style={{ color }}>{teamLabel(u.team)}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Winners — only when finished */}
              {editForm.status === "finished" && editForm.players.length > 0 && (
                <div>
                  <label className="label flex items-center gap-1.5">
                    <Trophy size={13} className="text-amber-400" />
                    Vencedores ({editForm.winners.length} selecionados)
                  </label>
                  <div className="rounded-xl border border-amber-500/20 divide-y divide-coal-700/50 bg-amber-500/5">
                    {allUsers
                      .filter((u) => editForm.players.includes(u.uid))
                      .map((u) => {
                        const color = teamColor(u.team);
                        const isWinner = editForm.winners.includes(u.uid);
                        return (
                          <label
                            key={u.uid}
                            className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-amber-500/10 transition-all"
                          >
                            <input
                              type="checkbox"
                              checked={isWinner}
                              onChange={() => toggleWinner(u.uid)}
                              className="w-4 h-4 accent-amber-500 shrink-0"
                            />
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0"
                              style={{ background: color + "30", color }}
                            >
                              {u.name.charAt(0)}
                            </div>
                            <span className="text-coal-200 text-sm flex-1">{u.name}</span>
                            {isWinner && (
                              <span className="text-amber-400 text-xs font-medium">
                                +{editForm.pointValue} pt{editForm.pointValue > 1 ? "s" : ""}
                              </span>
                            )}
                          </label>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-5 border-t border-coal-700">
              <button onClick={closeEdit} disabled={saving} className="btn-secondary flex-1">
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <Check size={14} />
                {saving ? "Salvando..." : "Salvar alterações"}
              </button>
            </div>
          </div>
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
                <h3 className="font-bold text-coal-100 mb-1">Excluir partida</h3>
                <p className="text-coal-400 text-sm">
                  Partida de{" "}
                  <span className="text-coal-200 font-medium">"{deletingMatch.gameName}"</span>
                </p>
              </div>
            </div>

            {isFinished ? (
              <>
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-5">
                  <p className="text-amber-400 text-sm font-medium flex items-center gap-2 mb-1">
                    <Trophy size={14} /> Esta partida tem {deletingMatch.winners.length} vencedor(es)
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
                    <span className="text-sm font-semibold">Reverter pontos</span>
                    <span className="text-xs text-red-400/70 text-center">
                      Remove -{deletingMatch.pointValue ?? 1} pt{(deletingMatch.pointValue ?? 1) > 1 ? "s" : ""} de cada vencedor e da equipe
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
                  Esta partida não possui vencedores registrados. Ela será excluída sem afetar nenhuma pontuação.
                </p>
                <button
                  onClick={() => handleDelete(false)}
                  disabled={deleting}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 w-full py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 font-medium mb-3"
                >
                  <Trash2 size={15} /> {deleting ? "Excluindo..." : "Confirmar exclusão"}
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
                  <span className="font-semibold text-coal-100">{match.gameName}</span>
                  <span className={`badge-${match.status}`}>{statusLabel(match.status)}</span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-coal-500">
                  <span className="flex items-center gap-1">
                    <Users size={11} /> {match.players.length} inscritos
                  </span>
                  {match.winners.length > 0 && (
                    <span>🏆 {match.winners.length} vencedor(es)</span>
                  )}
                  <span className="text-amber-400/60">{match.pointValue ?? 1} pt{(match.pointValue ?? 1) > 1 ? "s" : ""}</span>
                  <span>{formatDate(match.createdAt)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link href={`/jogos/${match.id}`} className="btn-secondary text-sm">
                  Ver detalhes
                </Link>
                <button
                  onClick={() => openEdit(match)}
                  className="btn-ghost p-2 text-coal-400 hover:text-blue-400"
                  title="Editar partida"
                >
                  <Pencil size={16} />
                </button>
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
