"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useMatch } from "@/lib/hooks/useMatches";
import { useRanking } from "@/lib/hooks/useRanking";
import { useGames } from "@/lib/hooks/useGames";
import {
  joinMatch,
  leaveMatch,
  finalizeMatch,
  getUsersByIds,
  addComment,
  deleteComment,
  updateComment,
  subscribeComments,
} from "@/lib/firebase/firestore";
import { formatDate, teamLabel, teamColor, statusLabel } from "@/lib/utils/helpers";
import toast from "react-hot-toast";
import Link from "next/link";
import type { User, Comment } from "@/types";
import {
  ArrowLeft, Users, Trophy, Clock, Swords, MessageCircle,
  Send, Pencil, Trash2, Check, X, Gamepad2, MoreHorizontal,
} from "lucide-react";
import UserAvatar from "@/components/UserAvatar";

export default function MatchDetailPage({ params }: { params: { matchId: string } }) {
  const { user } = useAuth();
  const { match, loading } = useMatch(params.matchId);
  const { users: allUsers } = useRanking();
  const { games } = useGames();
  const [players, setPlayers] = useState<User[]>([]);
  const [selectedWinners, setSelectedWinners] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [showResultForm, setShowResultForm] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (match?.players?.length) getUsersByIds(match.players).then(setPlayers);
  }, [match?.players?.join(",")]);

  useEffect(() => {
    const unsub = subscribeComments(params.matchId, setComments);
    return unsub;
  }, [params.matchId]);

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments.length]);

  if (!user) return null;

  if (loading) {
    return <div className="text-center py-20 text-coal-500">Carregando partida...</div>;
  }

  if (!match) {
    return (
      <div className="text-center py-20">
        <p className="text-coal-400">Partida não encontrada</p>
        <Link href="/jogos" className="btn-primary mt-4 inline-block">Voltar</Link>
      </div>
    );
  }

  const isIn = match.players.includes(user.uid);
  const isAdmin = user.role === "admin";
  const winners = players.filter((p) => match.winners.includes(p.uid));
  const game = games.find((g) => g.id === match.gameId);

  const handleJoin = async () => {
    setActionLoading(true);
    try {
      await joinMatch(match.id, user.uid);
      toast.success("Inscrito na partida!");
    } catch (e: any) { toast.error(e.message); }
    finally { setActionLoading(false); }
  };

  const handleLeave = async () => {
    setActionLoading(true);
    try {
      await leaveMatch(match.id, user.uid);
      toast.success("Saiu da partida");
    } catch (e: any) { toast.error(e.message); }
    finally { setActionLoading(false); }
  };

  const handleFinalize = async () => {
    if (selectedWinners.length === 0) { toast.error("Selecione pelo menos um vencedor"); return; }
    setActionLoading(true);
    try {
      await finalizeMatch({ matchId: match.id, winnerIds: selectedWinners });
      toast.success("Partida finalizada! Pontos distribuídos.");
      setShowResultForm(false);
    } catch (e: any) { toast.error(e.message); }
    finally { setActionLoading(false); }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSendingComment(true);
    try {
      await addComment(match.id, user.uid, commentText);
      setCommentText("");
    } catch (e: any) { toast.error(e.message); }
    finally { setSendingComment(false); }
  };

  const handleDeleteComment = async (commentId: string) => {
    setOpenMenuId(null);
    try { await deleteComment(match.id, commentId); }
    catch (e: any) { toast.error(e.message); }
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editingText.trim()) return;
    try {
      await updateComment(match.id, commentId, editingText);
      setEditingId(null);
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto pb-8">
      <Link href="/jogos" className="btn-ghost inline-flex items-center gap-2 mb-5 -ml-2">
        <ArrowLeft size={16} /> Voltar
      </Link>

      {/* ── Header ── */}
      <div className="card p-5 mb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <h1 className="font-display text-3xl text-gradient tracking-wide leading-tight break-words">
              {match.gameName}
            </h1>
            <span className={`badge-${match.status} inline-flex items-center gap-1 mt-2`}>
              {match.status === "waiting" && <Clock size={12} />}
              {match.status === "active" && <Swords size={12} />}
              {match.status === "finished" && <Trophy size={12} />}
              {statusLabel(match.status)}
            </span>
          </div>
          <div className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium shrink-0">
            <Trophy size={11} />
            {match.pointValue ?? 1} pt{(match.pointValue ?? 1) > 1 ? "s" : ""}
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-coal-700 text-xs">
          <div>
            <div className="text-coal-600 mb-0.5">Criado em</div>
            <div className="text-coal-300">{formatDate(match.createdAt)}</div>
          </div>
          {match.startedAt && (
            <div>
              <div className="text-coal-600 mb-0.5">Iniciado em</div>
              <div className="text-coal-300">{formatDate(match.startedAt)}</div>
            </div>
          )}
          {match.finishedAt && (
            <div className="col-span-2 sm:col-span-1">
              <div className="text-coal-600 mb-0.5">Finalizado em</div>
              <div className="text-coal-300">{formatDate(match.finishedAt)}</div>
            </div>
          )}
        </div>

        {/* Action button — full width on mobile */}
        {match.status !== "finished" && (
          <div className="mt-4">
            {isIn ? (
              <button
                onClick={handleLeave}
                disabled={actionLoading}
                className="w-full py-3 rounded-xl border border-red-400/30 text-red-400 text-sm font-medium hover:bg-red-400/10 transition-all active:scale-95 disabled:opacity-50"
              >
                {actionLoading ? "..." : "Sair da Partida"}
              </button>
            ) : match.status === "waiting" ? (
              <button
                onClick={handleJoin}
                disabled={actionLoading}
                className="btn-primary w-full py-3 text-base active:scale-95"
              >
                {actionLoading ? "..." : "Inscrever-se"}
              </button>
            ) : null}
          </div>
        )}
      </div>

      {/* ── Game info ── */}
      {game && (
        <div className="card p-5 mb-4">
          <h2 className="font-semibold text-coal-200 text-sm mb-3 flex items-center gap-2">
            <Gamepad2 size={15} className="text-coal-400" />
            Sobre o Jogo
          </h2>
          {game.description && (
            <p className="text-coal-400 text-sm mb-3 leading-relaxed">{game.description}</p>
          )}
          <div className="flex flex-wrap gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-coal-800 border border-coal-700 text-coal-400 text-xs flex items-center gap-1">
              <Users size={11} />
              {game.minPlayers === game.maxPlayers
                ? `${game.minPlayers} jogadores`
                : `${game.minPlayers}–${game.maxPlayers} jogadores`}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-center gap-1">
              <Trophy size={11} />
              {game.pointValue ?? 1} pt{(game.pointValue ?? 1) > 1 ? "s" : ""} por vitória
            </span>
          </div>
        </div>
      )}

      {/* ── Winners ── */}
      {match.status === "finished" && winners.length > 0 && (
        <div
          className="card p-5 mb-4 border-amber-500/30"
          style={{ background: "linear-gradient(135deg, #F59E0B10, #0A0A0A)" }}
        >
          <h2 className="font-bold text-amber-400 mb-3 flex items-center gap-2">
            <Trophy size={16} /> Vencedores
          </h2>
          <div className="space-y-3">
            {winners.map((w) => (
              <div key={w.uid} className="flex items-center gap-3">
                <UserAvatar user={w} className="w-10 h-10 rounded-full text-sm" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-coal-100 truncate">{w.name}</div>
                  <div className="text-xs" style={{ color: teamColor(w.team) }}>{teamLabel(w.team)}</div>
                </div>
                <span className="text-amber-400 font-bold text-sm shrink-0">
                  +{match.pointValue ?? 1} pt{(match.pointValue ?? 1) > 1 ? "s" : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Players ── */}
      <div className="card p-5 mb-4">
        <h2 className="font-bold text-coal-100 mb-3 flex items-center gap-2">
          <Users size={16} className="text-coal-400" />
          Jogadores ({players.length})
        </h2>
        {players.length === 0 ? (
          <p className="text-coal-500 text-sm text-center py-4">Nenhum jogador inscrito ainda</p>
        ) : (
          <div className="space-y-1">
            {players.map((p) => {
              const isWinner = match.winners.includes(p.uid);
              return (
                <div key={p.uid} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-coal-800 transition-all">
                  <UserAvatar user={p} className="w-10 h-10 rounded-full text-sm shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-coal-100 text-sm truncate">{p.name}</div>
                    <div className="text-xs" style={{ color: teamColor(p.team) }}>{teamLabel(p.team)}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-coal-500">{p.points} pts</span>
                    {isWinner && <span className="text-base">🏆</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Comments ── */}
      <div className="card p-5 mb-4">
        <h2 className="font-bold text-coal-100 mb-4 flex items-center gap-2">
          <MessageCircle size={16} className="text-coal-400" />
          Comentários ({comments.length})
        </h2>

        <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
          {comments.length === 0 ? (
            <p className="text-coal-500 text-sm text-center py-6">Nenhum comentário ainda. Seja o primeiro!</p>
          ) : (
            comments.map((c) => {
              const author = allUsers.find((u) => u.uid === c.uid);
              const isMe = c.uid === user.uid;
              const isEditing = editingId === c.id;
              const menuOpen = openMenuId === c.id;
              return (
                <div key={c.id} className={`flex gap-2.5 ${isMe ? "flex-row-reverse" : ""}`}>
                  {author && (
                    <UserAvatar user={author} className="w-8 h-8 rounded-full text-xs shrink-0 mt-1" />
                  )}
                  <div className={`flex flex-col gap-1 min-w-0 max-w-[78%] ${isMe ? "items-end" : ""}`}>
                    <div className={`flex items-center gap-1.5 ${isMe ? "flex-row-reverse" : ""}`}>
                      <span className="text-coal-500 text-xs truncate">
                        {author?.name.split(" ")[0] ?? "?"} · {formatDate(c.createdAt)}
                      </span>
                      {isMe && !isEditing && (
                        <button
                          onClick={() => setOpenMenuId(menuOpen ? null : c.id)}
                          className="p-0.5 text-coal-700 hover:text-coal-400 transition-colors shrink-0"
                        >
                          <MoreHorizontal size={13} />
                        </button>
                      )}
                    </div>

                    {menuOpen && !isEditing && (
                      <div className="flex items-center gap-1 mb-0.5">
                        <button
                          onClick={() => { setEditingId(c.id); setEditingText(c.text); setOpenMenuId(null); }}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-coal-800 border border-coal-700 text-coal-300 text-xs hover:text-coal-100 transition-colors"
                        >
                          <Pencil size={11} /> Editar
                        </button>
                        <button
                          onClick={() => handleDeleteComment(c.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-coal-800 border border-coal-700 text-red-400 text-xs hover:text-red-300 transition-colors"
                        >
                          <Trash2 size={11} /> Apagar
                        </button>
                      </div>
                    )}

                    {isEditing ? (
                      <div className="flex items-center gap-1.5 w-full">
                        <input
                          autoFocus
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveEdit(c.id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          maxLength={300}
                          className="flex-1 bg-coal-800 border border-amber-500/50 text-coal-100 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500 min-w-0"
                        />
                        <button onClick={() => handleSaveEdit(c.id)} className="p-2 text-emerald-400 hover:text-emerald-300 shrink-0">
                          <Check size={15} />
                        </button>
                        <button onClick={() => setEditingId(null)} className="p-2 text-coal-500 hover:text-coal-300 shrink-0">
                          <X size={15} />
                        </button>
                      </div>
                    ) : (
                      <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isMe
                          ? "bg-amber-500/20 border border-amber-500/30 text-coal-100 rounded-tr-sm"
                          : "bg-coal-800 border border-coal-700/80 text-coal-200 rounded-tl-sm"
                      }`}>
                        {c.text}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={commentsEndRef} />
        </div>

        <form onSubmit={handleComment} className="flex gap-2">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Escreva um comentário..."
            maxLength={300}
            className="input flex-1 text-sm py-3"
            disabled={sendingComment}
          />
          <button
            type="submit"
            disabled={!commentText.trim() || sendingComment}
            className="btn-primary px-4 py-3 shrink-0 disabled:opacity-40 active:scale-95"
          >
            <Send size={16} />
          </button>
        </form>
      </div>

      {/* ── Admin: Finalize ── */}
      {isAdmin && match.status === "active" && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-coal-100">Registrar Resultado</h2>
            <button onClick={() => setShowResultForm(!showResultForm)} className="btn-secondary text-sm">
              {showResultForm ? "Cancelar" : "Finalizar"}
            </button>
          </div>
          {showResultForm && (
            <div className="animate-slide-up">
              <p className="text-coal-400 text-sm mb-3">Selecione os vencedores:</p>
              <div className="space-y-2 mb-4">
                {players.map((p) => (
                  <label
                    key={p.uid}
                    className="flex items-center gap-3 p-4 rounded-xl bg-coal-800 cursor-pointer active:bg-coal-700 transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={selectedWinners.includes(p.uid)}
                      onChange={() => setSelectedWinners((prev) =>
                        prev.includes(p.uid) ? prev.filter((id) => id !== p.uid) : [...prev, p.uid]
                      )}
                      className="w-5 h-5 accent-amber-500 shrink-0"
                    />
                    <UserAvatar user={p} className="w-9 h-9 rounded-full text-sm shrink-0" />
                    <span className="text-coal-100 text-sm font-medium flex-1 min-w-0 truncate">{p.name}</span>
                    <span className="text-xs shrink-0" style={{ color: teamColor(p.team) }}>{teamLabel(p.team)}</span>
                  </label>
                ))}
              </div>
              <button
                onClick={handleFinalize}
                disabled={actionLoading || selectedWinners.length === 0}
                className="btn-primary w-full py-3 text-base active:scale-95 disabled:opacity-50"
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
