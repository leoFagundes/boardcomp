"use client";

import { useMatches } from "@/lib/hooks/useMatches";
import { useGames } from "@/lib/hooks/useGames";
import { useRanking } from "@/lib/hooks/useRanking";
import Link from "next/link";
import { Gamepad2, Swords, Users, Trophy, ArrowRight } from "lucide-react";

export default function AdminPage() {
  const { matches } = useMatches();
  const { games } = useGames();
  const { users, teams } = useRanking();

  const waiting = matches.filter((m) => m.status === "waiting").length;
  const active = matches.filter((m) => m.status === "active").length;
  const finished = matches.filter((m) => m.status === "finished").length;

  const cards = [
    { label: "Jogos Cadastrados", value: games.length, icon: Gamepad2, href: "/admin/jogos", color: "#10B981" },
    { label: "Partidas Ativas", value: active, icon: Swords, href: "/admin/partidas", color: "#F59E0B" },
    { label: "Usuários", value: users.length, icon: Users, href: "/admin/usuarios", color: "#3B82F6" },
    { label: "Partidas Finalizadas", value: finished, icon: Trophy, href: "/admin/partidas", color: "#8B5CF6" },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-4xl text-gradient tracking-wide">PAINEL ADMIN</h1>
        <p className="text-coal-400 text-sm mt-1">Gerencie a competição</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, href, color }) => (
          <Link key={label} href={href} className="card-hover p-5 block">
            <div className="flex items-center justify-between mb-3">
              <span className="text-coal-400 text-sm">{label}</span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: color + "20" }}>
                <Icon size={16} style={{ color }} />
              </div>
            </div>
            <div className="text-3xl font-bold text-coal-100">{value}</div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="card p-6">
          <h2 className="font-bold text-coal-100 mb-4">Ações Rápidas</h2>
          <div className="space-y-2">
            <Link href="/admin/jogos/novo" className="flex items-center justify-between p-3 rounded-lg bg-coal-800 hover:bg-coal-700 transition-all">
              <span className="text-sm text-coal-200">Cadastrar novo jogo</span>
              <ArrowRight size={14} className="text-coal-500" />
            </Link>
            <Link href="/admin/partidas" className="flex items-center justify-between p-3 rounded-lg bg-coal-800 hover:bg-coal-700 transition-all">
              <span className="text-sm text-coal-200">Criar nova partida</span>
              <ArrowRight size={14} className="text-coal-500" />
            </Link>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-bold text-coal-100 mb-4">Status das Partidas</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="badge-waiting">Aguardando</span>
              <span className="font-bold text-coal-100">{waiting}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="badge-active">Em andamento</span>
              <span className="font-bold text-coal-100">{active}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="badge-finished">Finalizado</span>
              <span className="font-bold text-coal-100">{finished}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Team standings */}
      <div className="card p-6">
        <h2 className="font-bold text-coal-100 mb-4">Placar das Equipes</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {teams.map((team) => (
            <div key={team.id} className="p-4 rounded-xl" style={{ background: team.id === "antigos" ? "#F59E0B15" : "#3B82F615", border: `1px solid ${team.id === "antigos" ? "#F59E0B30" : "#3B82F630"}` }}>
              <div className="font-bold mb-2" style={{ color: team.id === "antigos" ? "#F59E0B" : "#3B82F6" }}>{team.name}</div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-2xl font-bold text-coal-100">{team.points}</div>
                  <div className="text-xs text-coal-500">Pontos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-coal-100">{team.wins}</div>
                  <div className="text-xs text-coal-500">Vitórias</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-coal-100">{team.memberCount}</div>
                  <div className="text-xs text-coal-500">Membros</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
