"use client";

import { useState } from "react";
import { useRanking } from "@/lib/hooks/useRanking";
import { useAuth } from "@/context/AuthContext";
import { useMatches } from "@/lib/hooks/useMatches";
import { teamLabel, teamColor } from "@/lib/utils/helpers";
import { Users } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import UserProfileModal from "@/components/UserProfileModal";
import type { User } from "@/types";

const medals = ["🥇", "🥈", "🥉"];

export default function RankingPage() {
  const { user } = useAuth();
  const { users, teams, loading } = useRanking();
  const { matches } = useMatches();
  const [tab, setTab] = useState<"individual" | "equipes">("equipes");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [battleMetric, setBattleMetric] = useState<"points" | "wins">("points");

  const antigos = teams.find((t) => t.id === "antigos");
  const novos = teams.find((t) => t.id === "novos");
  const totalPoints = (antigos?.points || 0) + (novos?.points || 0);
  const totalWins = (antigos?.wins || 0) + (novos?.wins || 0);

  const memberCount = (teamId: string) =>
    users.filter((u) => u.team === teamId).length;
  const antigosMetricValue = battleMetric === "points" ? (antigos?.points || 0) : (antigos?.wins || 0);
  const novosMetricValue = battleMetric === "points" ? (novos?.points || 0) : (novos?.wins || 0);
  const totalMetric = battleMetric === "points" ? totalPoints : totalWins;
  const antigosPercent = totalMetric > 0 ? (antigosMetricValue / totalMetric) * 100 : 50;

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-4xl text-gradient tracking-wide">
          RANKINGS
        </h1>
        <p className="text-coal-400 text-sm mt-1">
          Classificação em tempo real
        </p>
      </div>

      {/* Team battle bar */}
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-coal-100 flex items-center gap-2">
            <Users size={16} className="text-coal-400" />
            Batalha de Equipes
          </h2>
          <div className="flex gap-1">
            {(["points", "wins"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setBattleMetric(m)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  battleMetric === m
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                    : "bg-coal-800 text-coal-400 border border-coal-700 hover:text-coal-200"
                }`}
              >
                {m === "points" ? "Pontos" : "Vitórias"}
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-between text-sm mb-3">
          <div>
            <span className="font-bold text-amber-400">
              {antigos?.name || "Brasilberg"}
            </span>
            <span className="text-coal-400 ml-2">
              {antigosMetricValue} {battleMetric === "points" ? "pts" : "vit."}
            </span>
          </div>
          <div className="text-right">
            <span className="font-bold text-blue-400">
              {novos?.name || "Hidromel"}
            </span>
            <span className="text-coal-400 ml-2">
              {novosMetricValue} {battleMetric === "points" ? "pts" : "vit."}
            </span>
          </div>
        </div>
        <div className="h-4 rounded-full overflow-hidden bg-blue-500/30 flex">
          <div
            className="h-full bg-amber-500 rounded-full transition-all duration-700"
            style={{ width: `${antigosPercent}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-coal-500">
          <span>{antigos?.wins || 0} vitórias · {antigos?.points || 0} pts</span>
          <span>{novos?.wins || 0} vitórias · {novos?.points || 0} pts</span>
        </div>

        {/* Team cards */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          {[antigos, novos].map((team) => {
            if (!team) return null;
            const color = teamColor(team.id);
            return (
              <div
                key={team.id}
                className="rounded-xl p-3 sm:p-4"
                style={{
                  background: color + "10",
                  border: `1px solid ${color}30`,
                }}
              >
                <div
                  className="font-bold mb-3 text-sm sm:text-base truncate"
                  style={{ color }}
                >
                  {team.name}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-2 text-center">
                  <div className="rounded-lg p-2 ">
                    <div className="text-xl sm:text-2xl font-bold text-coal-100">
                      {team.points}
                    </div>
                    <div className="text-[10px] sm:text-xs text-coal-500">
                      Pontos
                    </div>
                  </div>

                  <div className="rounded-lg p-2 ">
                    <div className="text-xl sm:text-2xl font-bold text-coal-100">
                      {team.wins}
                    </div>
                    <div className="text-[10px] sm:text-xs text-coal-500">
                      Vitórias
                    </div>
                  </div>

                  <div className="rounded-lg p-2 ">
                    <div className="text-xl sm:text-2xl font-bold text-coal-100">
                      {memberCount(team.id)}
                    </div>
                    <div className="text-[10px] sm:text-xs text-coal-500">
                      Membros
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {[
          { id: "equipes", label: "Por Equipe" },
          { id: "individual", label: "Individual" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                : "bg-coal-800 text-coal-400 border border-coal-700 hover:text-coal-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-coal-500">
          Carregando ranking...
        </div>
      ) : tab === "individual" ? (
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-coal-700 grid grid-cols-12 text-xs text-coal-500 font-semibold uppercase tracking-wider">
            <span className="col-span-1">#</span>
            <span className="col-span-6">Jogador</span>
            <span className="col-span-2 text-center">Vitórias</span>
            <span className="col-span-3 text-right">Pontos</span>
          </div>
          {users.length === 0 ? (
            <div className="text-center py-12 text-coal-500">
              Nenhum jogador ainda
            </div>
          ) : (
            users.map((u, i) => {
              const isMe = u.uid === user?.uid;
              const color = teamColor(u.team);
              return (
                <div
                  key={u.uid}
                  onClick={() => setSelectedUser(u)}
                  className={`p-4 grid grid-cols-12 items-center border-b border-coal-700/50 transition-all cursor-pointer ${
                    isMe
                      ? "bg-amber-500/5 border-amber-500/20"
                      : "hover:bg-coal-800/50"
                  }`}
                >
                  <span className="col-span-1 text-lg">
                    {i < 3 ? (
                      medals[i]
                    ) : (
                      <span className="text-coal-500 text-sm font-mono">
                        {i + 1}
                      </span>
                    )}
                  </span>
                  <div className="col-span-6 flex items-center gap-3">
                    <UserAvatar
                      user={u}
                      className="w-9 h-9 rounded-full text-sm"
                    />
                    <div>
                      <div
                        className={`font-semibold text-sm ${isMe ? "text-amber-400" : "text-coal-100"}`}
                      >
                        {u.name}{" "}
                        {isMe && (
                          <span className="text-xs font-normal">(você)</span>
                        )}
                      </div>
                      <div className="text-xs" style={{ color }}>
                        {teamLabel(u.team)}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2 text-center text-coal-300 text-sm font-medium">
                    {u.wins}
                  </div>
                  <div className="col-span-3 text-right">
                    <span
                      className={`font-bold text-lg ${i === 0 ? "text-amber-400" : i === 1 ? "text-coal-200" : i === 2 ? "text-amber-700" : "text-coal-300"}`}
                    >
                      {u.points}
                    </span>
                    <span className="text-coal-500 text-xs ml-1">pts</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {[antigos, novos]
            .filter(Boolean)
            .sort((a, b) => (b?.points || 0) - (a?.points || 0))
            .map((team, i) => {
              if (!team) return null;
              const color = teamColor(team.id);
              const teamUsers = users.filter((u) => u.team === team.id);
              return (
                <div
                  key={team.id}
                  className="card overflow-hidden"
                  style={{ borderTop: `3px solid ${color}` }}
                >
                  <div className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{i === 0 ? "🥇" : "🥈"}</span>
                      <div>
                        <div className="font-bold text-lg" style={{ color }}>
                          {team.name}
                        </div>
                        <div className="text-coal-500 text-sm">
                          {memberCount(team.id)} membros
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-coal-100">
                        {team.points}
                      </div>
                      <div className="text-coal-500 text-sm">pontos</div>
                    </div>
                  </div>
                  <div className="border-t border-coal-700 p-4">
                    <div className="text-xs text-coal-500 mb-3 font-semibold uppercase tracking-wider">
                      Top jogadores
                    </div>
                    <div className="space-y-2">
                      {teamUsers.map((u, idx) => (
                        <div
                          key={u.uid}
                          onClick={() => setSelectedUser(u)}
                          className="flex items-center justify-between text-sm cursor-pointer hover:bg-coal-800/50 rounded-lg px-2 -mx-2 transition-all"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-coal-500 w-4 text-xs font-mono">
                              {idx + 1}
                            </span>
                            <UserAvatar
                              user={u}
                              className="w-8 h-8 rounded-full text-sm"
                            />
                            <span className="text-coal-200">{u.name}</span>
                          </div>
                          <span className="font-semibold" style={{ color }}>
                            {u.points} pts
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}
      {selectedUser && (
        <UserProfileModal
          user={selectedUser}
          matches={matches}
          allUsers={users}
          currentUid={user?.uid ?? ""}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}
