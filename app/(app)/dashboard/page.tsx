"use client";

import { useAuth } from "@/context/AuthContext";
import { useMatches } from "@/lib/hooks/useMatches";
import { useGames } from "@/lib/hooks/useGames";
import { useAdmins } from "@/lib/hooks/useAdmins";
import { useRanking } from "@/lib/hooks/useRanking";
import GameCard from "@/components/GameCard";
import Link from "next/link";
import {
  teamLabel,
  teamColor,
  statusLabel,
  formatDate,
} from "@/lib/utils/helpers";
import {
  Trophy,
  Gamepad2,
  Users,
  TrendingUp,
  ArrowRight,
  Clock,
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const { matches } = useMatches();
  const { games } = useGames();
  const admins = useAdmins();
  const { users: allUsers } = useRanking();

  if (!user) return null;

  const myMatches = matches.filter((m) => m.players.includes(user.uid));
  const myWins = myMatches.filter((m) => m.winners.includes(user.uid));
  const waitingMatches = matches
    .filter((m) => m.status === "waiting")
    .slice(0, 3);
  const activeMatches = matches
    .filter((m) => m.status === "active")
    .slice(0, 3);
  const tc = teamColor(user.team);

  const stats = [
    { label: "Pontos", value: user.points, icon: Trophy, color: "#F59E0B" },
    { label: "Vitórias", value: user.wins, icon: TrendingUp, color: "#10B981" },
    {
      label: "Partidas",
      value: myMatches.length,
      icon: Gamepad2,
      color: "#3B82F6",
    },
    {
      label: "Jogos Disponíveis",
      value: games.length,
      icon: Users,
      color: "#8B5CF6",
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div
        className="rounded-2xl p-8 mb-8 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${tc}15 0%, #0A0A0A 70%)`,
          border: `1px solid ${tc}30`,
        }}
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: tc }}
            />
            <span className="text-sm font-medium" style={{ color: tc }}>
              {teamLabel(user.team)}
            </span>
          </div>
          <h1 className="font-display text-5xl text-coal-100 tracking-wide mb-2">
            OLÁ, {user.name.split(" ")[0].toUpperCase()}!
          </h1>
          <p className="text-coal-400">Pronto para a próxima partida?</p>
        </div>
        <div className="absolute right-8 top-8 text-8xl opacity-10">🎲</div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-coal-400 text-sm">{label}</span>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: color + "20" }}
              >
                <Icon size={16} style={{ color }} />
              </div>
            </div>
            <div className="text-3xl font-bold text-coal-100">{value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Partidas aguardando */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-coal-100 flex items-center gap-2">
              <Clock size={18} className="text-amber-400" />
              Aguardando Jogadores
            </h2>
            <Link
              href="/jogos"
              className="text-amber-400 text-sm hover:text-amber-300 flex items-center gap-1"
            >
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>
          {waitingMatches.length === 0 ? (
            <p className="text-coal-500 text-sm text-center py-6">
              Nenhuma partida aguardando
            </p>
          ) : (
            <div className="space-y-3">
              {waitingMatches.map((m) => (
                <Link
                  key={m.id}
                  href={`/jogos/${m.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-coal-800 hover:bg-coal-700 transition-all border border-coal-700 hover:border-coal-600"
                >
                  <div>
                    <div className="font-medium text-coal-100 text-sm">
                      {m.gameName}
                    </div>
                    <div className="text-coal-400 text-xs mt-0.5">
                      {m.players.length} jogadores inscritos
                    </div>
                  </div>
                  <span className="badge-waiting">Aguardando</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Partidas ativas */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-coal-100 flex items-center gap-2">
              <Gamepad2 size={18} className="text-emerald-400" />
              Em Andamento
            </h2>
            <Link
              href="/jogos"
              className="text-amber-400 text-sm hover:text-amber-300 flex items-center gap-1"
            >
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>
          {activeMatches.length === 0 ? (
            <p className="text-coal-500 text-sm text-center py-6">
              Nenhuma partida em andamento
            </p>
          ) : (
            <div className="space-y-3">
              {activeMatches.map((m) => (
                <Link
                  key={m.id}
                  href={`/jogos/${m.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-coal-800 hover:bg-coal-700 transition-all border border-coal-700 hover:border-coal-600"
                >
                  <div>
                    <div className="font-medium text-coal-100 text-sm">
                      {m.gameName}
                    </div>
                    <div className="text-coal-400 text-xs mt-0.5">
                      {m.players.length} jogadores
                    </div>
                  </div>
                  <span className="badge-active">Em andamento</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Games catalog */}
      {games.length > 0 && (
        <div className="card p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-coal-100 flex items-center gap-2">
              <Gamepad2 size={18} className="text-purple-400" />
              Jogos Disponíveis
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {games.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                currentUid={user.uid}
                admins={admins}
                allUsers={allUsers}
              />
            ))}
          </div>
        </div>
      )}

      {/* My recent matches */}
      {myMatches.length > 0 && (
        <div className="card p-6 mt-6">
          <h2 className="font-bold text-coal-100 mb-4">
            Minhas Partidas Recentes
          </h2>
          <div className="space-y-2">
            {myMatches.slice(0, 5).map((m) => {
              const won = m.winners.includes(user.uid);
              return (
                <Link
                  key={m.id}
                  href={`/jogos/${m.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-coal-800 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">
                      {won ? "🏆" : m.status === "active" ? "⚔️" : "🎲"}
                    </span>
                    <div>
                      <div className="font-medium text-coal-100 text-sm">
                        {m.gameName}
                      </div>
                      <div className="text-coal-500 text-xs">
                        {formatDate(m.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {m.status === "finished" && won && (
                      <span className="text-amber-400 text-xs font-bold">
                        +1 pt
                      </span>
                    )}
                    <span className={`badge-${m.status}`}>
                      {statusLabel(m.status)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
