"use client";

import { useState } from "react";
import { toggleGameInterest } from "@/lib/firebase/firestore";
import {
  teamColor,
  teamLabel,
  formatDate,
  statusLabel,
} from "@/lib/utils/helpers";
import toast from "react-hot-toast";
import {
  Users,
  Star,
  Info,
  X,
  Trophy,
  Clock,
  Swords,
  CheckCircle,
} from "lucide-react";
import type { Game, User, Match } from "@/types";
import UserAvatar from "@/components/UserAvatar";

interface Props {
  game: Game;
  currentUid: string;
  admins: User[];
  allUsers: User[];
  matches: Match[];
}

const statusIcon = (s: string) =>
  s === "waiting" ? (
    <Clock size={12} />
  ) : s === "active" ? (
    <Swords size={12} />
  ) : (
    <CheckCircle size={12} />
  );

export default function GameCard({
  game,
  currentUid,
  admins,
  allUsers,
  matches,
}: Props) {
  const [showModal, setShowModal] = useState(false);

  const interests = game.interests ?? [];
  const isInterested = interests.includes(currentUid);
  const interestedUsers = allUsers.filter((u) => interests.includes(u.uid));
  const gameMatches = matches
    .filter((m) => m.gameId === game.id)
    .sort((a, b) => {
      const ta = a.createdAt?.seconds ?? 0;
      const tb = b.createdAt?.seconds ?? 0;
      return tb - ta;
    });

  const handleToggle = async () => {
    try {
      await toggleGameInterest(game.id, currentUid, !isInterested);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <>
      <div className="card p-4 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="font-bold text-coal-100">{game.name}</div>
            {game.description && (
              <div className="text-coal-400 text-xs mt-0.5 line-clamp-2">
                {game.description}
              </div>
            )}
          </div>
          <button
            onClick={handleToggle}
            className={`shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              isInterested
                ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                : "border-coal-600 text-coal-400 hover:border-amber-500/40 hover:text-amber-400"
            }`}
          >
            <Star size={12} fill={isInterested ? "currentColor" : "none"} />
            {isInterested ? "Interessado" : "Tenho interesse"}
          </button>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-coal-500">
          <span className="flex items-center gap-1">
            <Users size={11} />
            {game.minPlayers === game.maxPlayers
              ? `${game.minPlayers} jogadores`
              : `${game.minPlayers}–${game.maxPlayers} jogadores`}
          </span>
          <span className="text-amber-400/70 font-medium">
            {game.pointValue ?? 1} pt{(game.pointValue ?? 1) > 1 ? "s" : ""} por
            vitória
          </span>
        </div>

        {/* Footer: interested avatars + detalhes button */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-coal-700/50">
          {interestedUsers.length > 0 ? (
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1.5">
                {interestedUsers.slice(0, 5).map((u) => (
                  <UserAvatar
                    key={u.uid}
                    user={u}
                    className="w-6 h-6 rounded-full text-[10px] border border-coal-900"
                  />
                ))}
              </div>
              <span className="text-coal-400 text-xs">
                {interestedUsers.length === 1
                  ? `${interestedUsers[0].name.split(" ")[0]} quer jogar`
                  : `${interestedUsers
                      .slice(0, 2)
                      .map((u) => u.name.split(" ")[0])
                      .join(
                        ", ",
                      )}${interestedUsers.length > 2 ? ` +${interestedUsers.length - 2}` : ""} querem jogar`}
              </span>
            </div>
          ) : (
            <span className="text-coal-600 text-xs">
              Ninguém interessado ainda
            </span>
          )}

          <button
            onClick={() => setShowModal(true)}
            className="shrink-0 flex items-center gap-1 text-xs text-coal-400 hover:text-coal-200 transition-colors"
          >
            <Info size={13} /> Detalhes
          </button>
        </div>
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div className="bg-coal-900 border border-coal-700 rounded-2xl w-full max-w-lg shadow-2xl animate-slide-up flex flex-col max-h-[80vh]">
            {/* Modal header */}
            <div className="flex items-start justify-between p-5 border-b border-coal-700 shrink-0">
              <div>
                <h2 className="font-bold text-coal-100 text-lg">{game.name}</h2>
                {game.description && (
                  <p className="text-coal-400 text-sm mt-1">
                    {game.description}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-2 text-xs text-coal-500">
                  <span className="flex items-center gap-1">
                    <Users size={11} />
                    {game.minPlayers === game.maxPlayers
                      ? `${game.minPlayers} jogadores`
                      : `${game.minPlayers}–${game.maxPlayers} jogadores`}
                  </span>
                  <span className="text-amber-400/70 font-medium">
                    {game.pointValue ?? 1} pt
                    {(game.pointValue ?? 1) > 1 ? "s" : ""} por vitória
                  </span>
                  <span>
                    {gameMatches.length} partida
                    {gameMatches.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="btn-ghost p-2 text-coal-400 hover:text-coal-200 shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-5 space-y-5">
              {/* Interested users */}
              <div>
                <h3 className="font-semibold text-coal-200 text-sm mb-3 flex items-center gap-2">
                  <Star size={14} className="text-amber-400" />
                  Interessados ({interestedUsers.length})
                </h3>
                {interestedUsers.length === 0 ? (
                  <p className="text-coal-500 text-sm text-center py-4">
                    Ninguém demonstrou interesse ainda
                  </p>
                ) : (
                  <div className="space-y-2">
                    {interestedUsers.map((u) => {
                      const color = teamColor(u.team);
                      return (
                        <div key={u.uid} className="flex items-center gap-3">
                          <UserAvatar
                            user={u}
                            className="w-8 h-8 rounded-full text-sm"
                          />
                          <div>
                            <div className="text-coal-100 text-sm font-medium">
                              {u.name}
                            </div>
                            <div className="text-xs" style={{ color }}>
                              {teamLabel(u.team)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Match history */}
              <div>
                <h3 className="font-semibold text-coal-200 text-sm mb-3 flex items-center gap-2">
                  <Trophy size={14} className="text-coal-400" />
                  Histórico de Partidas ({gameMatches.length})
                </h3>
                {gameMatches.length === 0 ? (
                  <p className="text-coal-500 text-sm text-center py-4">
                    Nenhuma partida realizada ainda
                  </p>
                ) : (
                  <div className="space-y-2">
                    {gameMatches.map((m) => {
                      const winners = allUsers.filter((u) =>
                        m.winners.includes(u.uid),
                      );
                      return (
                        <div
                          key={m.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-coal-800 border border-coal-700/50 gap-3"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={`badge-${m.status} flex items-center gap-1 shrink-0`}
                            >
                              {statusIcon(m.status)}
                              {statusLabel(m.status)}
                            </span>
                            <span className="text-coal-500 text-xs truncate">
                              {formatDate(m.createdAt)}
                            </span>
                          </div>
                          <div className="text-right shrink-0">
                            {winners.length > 0 ? (
                              <div className="flex items-center gap-1 justify-end">
                                <Trophy size={11} className="text-amber-400" />
                                <span className="text-amber-400 text-xs font-medium">
                                  {winners
                                    .map((w) => w.name.split(" ")[0])
                                    .join(", ")}
                                </span>
                              </div>
                            ) : (
                              <span className="text-coal-500 text-xs">
                                {m.players.length} jogador
                                {m.players.length !== 1 ? "es" : ""}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
