"use client";

import { useGames } from "@/lib/hooks/useGames";
import Link from "next/link";
import { formatDate } from "@/lib/utils/helpers";
import { Plus, Users, Gamepad2 } from "lucide-react";

export default function AdminJogosPage() {
  const { games, loading } = useGames();

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl text-gradient tracking-wide">JOGOS</h1>
          <p className="text-coal-400 text-sm mt-1">{games.length} jogos cadastrados</p>
        </div>
        <Link href="/admin/jogos/novo" className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Novo Jogo
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-20 text-coal-500">Carregando...</div>
      ) : games.length === 0 ? (
        <div className="text-center py-20">
          <Gamepad2 size={40} className="text-coal-700 mx-auto mb-4" />
          <p className="text-coal-400 mb-4">Nenhum jogo cadastrado</p>
          <Link href="/admin/jogos/novo" className="btn-primary">Cadastrar primeiro jogo</Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {games.map((game) => (
            <div key={game.id} className="card p-5 flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <Gamepad2 size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-coal-100">{game.name}</h3>
                  {game.description && (
                    <p className="text-coal-400 text-sm mt-1">{game.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-coal-500">
                    <span className="flex items-center gap-1">
                      <Users size={12} /> {game.minPlayers}–{game.maxPlayers} jogadores
                    </span>
                    <span>{formatDate(game.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
