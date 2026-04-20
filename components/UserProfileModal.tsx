"use client";

import { useState, useEffect } from "react";
import { teamColor, teamLabel, formatDate, statusLabel } from "@/lib/utils/helpers";
import { X, Trophy, TrendingUp, Gamepad2, ThumbsUp, ThumbsDown } from "lucide-react";
import type { User, Match } from "@/types";
import UserAvatar from "@/components/UserAvatar";
import Link from "next/link";
import { toggleReaction } from "@/lib/firebase/firestore";
import toast from "react-hot-toast";
import Portal from "@/components/Portal";

interface Props {
  user: User;
  matches: Match[];
  allUsers: User[];
  currentUid: string;
  onClose: () => void;
}

export default function UserProfileModal({ user, matches, allUsers, currentUid, onClose }: Props) {
  const tc = teamColor(user.team);
  const myMatches = matches.filter((m) => m.players.includes(user.uid));
  const myWins = myMatches.filter((m) => m.winners.includes(user.uid));
  const finishedCount = myMatches.filter((m) => m.status === "finished").length;
  const winRate =
    finishedCount > 0 ? Math.round((myWins.length / finishedCount) * 100) : 0;

  const [localLikes, setLocalLikes] = useState<string[]>(user.likes ?? []);
  const [localDislikes, setLocalDislikes] = useState<string[]>(user.dislikes ?? []);

  useEffect(() => {
    setLocalLikes(user.likes ?? []);
    setLocalDislikes(user.dislikes ?? []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(user.likes), JSON.stringify(user.dislikes)]);

  const isSelf = currentUid === user.uid;
  const myReaction = localLikes.includes(currentUid)
    ? "like"
    : localDislikes.includes(currentUid)
    ? "dislike"
    : null;

  const handleReaction = async (type: "like" | "dislike") => {
    if (isSelf) return;
    const isActive = type === "like" ? localLikes.includes(currentUid) : localDislikes.includes(currentUid);
    const add = !isActive;

    if (type === "like") {
      setLocalLikes(add ? [...localLikes, currentUid] : localLikes.filter((id) => id !== currentUid));
      if (add) setLocalDislikes(localDislikes.filter((id) => id !== currentUid));
    } else {
      setLocalDislikes(add ? [...localDislikes, currentUid] : localDislikes.filter((id) => id !== currentUid));
      if (add) setLocalLikes(localLikes.filter((id) => id !== currentUid));
    }

    try {
      await toggleReaction(user.uid, currentUid, type, add);
    } catch (e: any) {
      setLocalLikes(user.likes ?? []);
      setLocalDislikes(user.dislikes ?? []);
      toast.error(e.message);
    }
  };

  const likeUsers = allUsers.filter((u) => localLikes.includes(u.uid));
  const dislikeUsers = allUsers.filter((u) => localDislikes.includes(u.uid));

  return (
    <Portal>
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-coal-900 border border-coal-700 rounded-2xl w-full max-w-sm shadow-2xl animate-slide-up flex flex-col max-h-[90vh]">
        {/* Header */}
        <div
          className="flex items-center justify-between p-5 border-b border-coal-700 shrink-0"
          style={{ borderTop: `3px solid ${tc}`, borderRadius: "1rem 1rem 0 0" }}
        >
          <div className="flex items-center gap-3">
            <UserAvatar user={user} className="w-12 h-12 rounded-2xl text-xl" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-coal-100">{user.name}</span>
                {user.role === "admin" && (
                  <span className="bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-semibold px-2 py-0.5 rounded-full">
                    Admin
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: tc }} />
                <span className="text-xs font-medium" style={{ color: tc }}>
                  {teamLabel(user.team)}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-ghost p-2 text-coal-400 hover:text-coal-200 shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-coal-800 rounded-xl p-3 text-center border border-coal-700/50">
              <div className="text-2xl font-bold text-coal-100">{user.points}</div>
              <div className="text-coal-500 text-xs mt-1 flex items-center justify-center gap-1">
                <Trophy size={10} /> Pontos
              </div>
            </div>
            <div className="bg-coal-800 rounded-xl p-3 text-center border border-coal-700/50">
              <div className="text-2xl font-bold text-coal-100">{user.wins}</div>
              <div className="text-coal-500 text-xs mt-1 flex items-center justify-center gap-1">
                <TrendingUp size={10} /> Vitórias
              </div>
            </div>
            <div className="bg-coal-800 rounded-xl p-3 text-center border border-coal-700/50">
              <div className="text-2xl font-bold text-coal-100">{myMatches.length}</div>
              <div className="text-coal-500 text-xs mt-1 flex items-center justify-center gap-1">
                <Gamepad2 size={10} /> Partidas
              </div>
            </div>
          </div>

          {/* Win rate */}
          {finishedCount > 0 && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-coal-400 text-sm">Taxa de vitória</span>
                <span className="text-coal-100 font-bold text-sm">{winRate}%</span>
              </div>
              <div className="h-2 bg-coal-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${winRate}%`, background: tc }}
                />
              </div>
            </div>
          )}

          {/* Reactions */}
          <div>
            <h3 className="font-semibold text-coal-200 text-sm mb-3">Reações</h3>
            <div className="flex gap-3 mb-4">
              <button
                onClick={() => handleReaction("like")}
                disabled={isSelf}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  myReaction === "like"
                    ? "bg-green-500/20 border-green-500/40 text-green-400"
                    : isSelf
                    ? "border-coal-700 text-coal-600 cursor-not-allowed"
                    : "border-coal-700 text-coal-400 hover:border-green-500/40 hover:text-green-400"
                }`}
              >
                <ThumbsUp size={15} fill={myReaction === "like" ? "currentColor" : "none"} />
                <span>{localLikes.length}</span>
              </button>
              <button
                onClick={() => handleReaction("dislike")}
                disabled={isSelf}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  myReaction === "dislike"
                    ? "bg-red-500/20 border-red-500/40 text-red-400"
                    : isSelf
                    ? "border-coal-700 text-coal-600 cursor-not-allowed"
                    : "border-coal-700 text-coal-400 hover:border-red-500/40 hover:text-red-400"
                }`}
              >
                <ThumbsDown size={15} fill={myReaction === "dislike" ? "currentColor" : "none"} />
                <span>{localDislikes.length}</span>
              </button>
            </div>

            {/* Reaction history */}
            {(likeUsers.length > 0 || dislikeUsers.length > 0) && (
              <div className="space-y-2">
                {likeUsers.map((u) => (
                  <div key={u.uid} className="flex items-center gap-2 px-1">
                    <UserAvatar user={u} className="w-6 h-6 rounded-full text-[10px]" />
                    <span className="text-coal-300 text-xs flex-1">{u.name.split(" ")[0]}</span>
                    <span className="text-green-400 text-xs flex items-center gap-1">
                      <ThumbsUp size={11} fill="currentColor" /> curtiu
                    </span>
                  </div>
                ))}
                {dislikeUsers.map((u) => (
                  <div key={u.uid} className="flex items-center gap-2 px-1">
                    <UserAvatar user={u} className="w-6 h-6 rounded-full text-[10px]" />
                    <span className="text-coal-300 text-xs flex-1">{u.name.split(" ")[0]}</span>
                    <span className="text-red-400 text-xs flex items-center gap-1">
                      <ThumbsDown size={11} fill="currentColor" /> não curtiu
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent matches */}
          {myMatches.length > 0 ? (
            <div>
              <h3 className="font-semibold text-coal-200 text-sm mb-3">Partidas Recentes</h3>
              <div className="space-y-2">
                {myMatches.slice(0, 5).map((m) => {
                  const won = m.winners.includes(user.uid);
                  return (
                    <Link
                      key={m.id}
                      href={`/jogos/${m.id}`}
                      onClick={onClose}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-coal-800 hover:bg-coal-700 transition-all border border-coal-700/50"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">
                          {won ? "🏆" : m.status === "active" ? "⚔️" : "🎲"}
                        </span>
                        <div>
                          <div className="font-medium text-coal-100 text-xs">{m.gameName}</div>
                          <div className="text-coal-500 text-xs">{formatDate(m.createdAt)}</div>
                        </div>
                      </div>
                      <span className={`badge-${m.status} text-xs shrink-0`}>
                        {statusLabel(m.status)}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-coal-500 text-sm text-center py-4">Nenhuma partida ainda</p>
          )}
        </div>
      </div>
    </div>
    </Portal>
  );
}
