"use client";

import { toggleGameInterest } from "@/lib/firebase/firestore";
import { teamColor } from "@/lib/utils/helpers";
import toast from "react-hot-toast";
import { Users, Star } from "lucide-react";
import type { Game, User } from "@/types";

interface Props {
  game: Game;
  currentUid: string;
  admins: User[];
  allUsers: User[];
}

export default function GameCard({ game, currentUid, admins, allUsers }: Props) {
  const interests = game.interests ?? [];
  const isInterested = interests.includes(currentUid);

  const interestedUsers = allUsers.filter((u) => interests.includes(u.uid));

  const handleToggle = async () => {
    try {
      await toggleGameInterest(game.id, currentUid, !isInterested);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
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
          {game.pointValue ?? 1} pt{(game.pointValue ?? 1) > 1 ? "s" : ""} por vitória
        </span>
      </div>


      {/* Interested users */}
      {interestedUsers.length > 0 && (
        <div className="flex items-center gap-2 pt-1 border-t border-coal-700/50">
          <div className="flex -space-x-1.5">
            {interestedUsers.slice(0, 5).map((u) => {
              const color = teamColor(u.team);
              return (
                <div
                  key={u.uid}
                  title={u.name}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border border-coal-900 shrink-0"
                  style={{ background: color + "40", color }}
                >
                  {u.name.charAt(0)}
                </div>
              );
            })}
          </div>
          <span className="text-coal-400 text-xs">
            {interestedUsers.length === 1
              ? `${interestedUsers[0].name.split(" ")[0]} quer jogar`
              : `${interestedUsers.slice(0, 2).map((u) => u.name.split(" ")[0]).join(", ")}${interestedUsers.length > 2 ? ` +${interestedUsers.length - 2}` : ""} querem jogar`}
          </span>
        </div>
      )}
    </div>
  );
}
