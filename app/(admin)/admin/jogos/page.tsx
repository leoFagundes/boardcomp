"use client";

import { useState } from "react";
import { useGames } from "@/lib/hooks/useGames";
import { useRanking } from "@/lib/hooks/useRanking";
import { updateGame, deleteGame } from "@/lib/firebase/firestore";
import { teamColor } from "@/lib/utils/helpers";
import Link from "next/link";
import toast from "react-hot-toast";
import { formatDate } from "@/lib/utils/helpers";
import { Plus, Users, Gamepad2, Pencil, Trash2, X, Check } from "lucide-react";
import type { Game } from "@/types";
import Loading from "@/components/loading";

export default function AdminJogosPage() {
  const { games, loading } = useGames();
  const { users: allUsers } = useRanking();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Game>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const startEdit = (game: Game) => {
    setEditingId(game.id);
    setEditData({
      name: game.name,
      description: game.description || "",
      minPlayers: game.minPlayers,
      maxPlayers: game.maxPlayers,
      pointValue: game.pointValue ?? 1,
    });
  };

  const handleSave = async (gameId: string) => {
    if (!editData.name) {
      toast.error("Nome é obrigatório");
      return;
    }
    if ((editData.minPlayers || 0) > (editData.maxPlayers || 0)) {
      toast.error("Mínimo não pode ser maior que máximo");
      return;
    }
    setSaving(true);
    try {
      await updateGame(gameId, {
        name: editData.name,
        description: editData.description || undefined,
        minPlayers: editData.minPlayers,
        maxPlayers: editData.maxPlayers,
        pointValue: editData.pointValue ?? 1,
      });
      toast.success("Jogo atualizado!");
      setEditingId(null);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (gameId: string) => {
    try {
      await deleteGame(gameId);
      toast.success("Jogo excluído");
      setDeletingId(null);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl text-gradient tracking-wide">
            JOGOS
          </h1>
          <p className="text-coal-400 text-sm mt-1">
            {games.length} jogos cadastrados
          </p>
        </div>
        <Link
          href="/admin/jogos/novo"
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} /> Novo Jogo
        </Link>
      </div>

      {loading ? (
        <Loading />
      ) : games.length === 0 ? (
        <div className="text-center py-20">
          <Gamepad2 size={40} className="text-coal-700 mx-auto mb-4" />
          <p className="text-coal-400 mb-4">Nenhum jogo cadastrado</p>
          <Link href="/admin/jogos/novo" className="btn-primary">
            Cadastrar primeiro jogo
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {games.map((game) => (
            <div key={game.id} className="card p-5">
              {editingId === game.id ? (
                <div className="animate-slide-up space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Nome *</label>
                      <input
                        type="text"
                        className="input"
                        value={editData.name || ""}
                        onChange={(e) =>
                          setEditData({ ...editData, name: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="label">Descrição</label>
                      <input
                        type="text"
                        className="input"
                        value={editData.description || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 max-w-xs">
                    <div>
                      <label className="label">Mín. jogadores</label>
                      <input
                        type="number"
                        className="input"
                        min={1}
                        max={20}
                        value={editData.minPlayers || 2}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            minPlayers: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="label">Máx. jogadores</label>
                      <input
                        type="number"
                        className="input"
                        min={1}
                        max={20}
                        value={editData.maxPlayers || 6}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            maxPlayers: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label">Pontuação por vitória</label>
                    <div className="flex gap-2 max-w-xs">
                      {[1, 2, 3].map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setEditData({ ...editData, pointValue: v })}
                          className={`flex-1 py-2 rounded-xl border text-sm font-bold transition-all ${
                            (editData.pointValue ?? 1) === v
                              ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
                              : "border-coal-600 text-coal-400 hover:border-coal-500 hover:text-coal-300"
                          }`}
                        >
                          {v} pt{v > 1 ? "s" : ""}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSave(game.id)}
                      disabled={saving}
                      className="btn-primary flex items-center gap-2 text-sm"
                    >
                      <Check size={14} /> {saving ? "Salvando..." : "Salvar"}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="btn-secondary flex items-center gap-2 text-sm"
                    >
                      <X size={14} /> Cancelar
                    </button>
                  </div>
                </div>
              ) : deletingId === game.id ? (
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <p className="text-coal-200 text-sm">
                    Tem certeza que deseja excluir{" "}
                    <span className="font-bold text-red-400">
                      "{game.name}"
                    </span>
                    ? Esta ação não pode ser desfeita.
                  </p>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleDelete(game.id)}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 text-sm px-4 py-2 rounded-lg transition-all flex items-center gap-2"
                    >
                      <Trash2 size={14} /> Confirmar exclusão
                    </button>
                    <button
                      onClick={() => setDeletingId(null)}
                      className="btn-secondary text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                      <Gamepad2 size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-coal-100">{game.name}</h3>
                      {game.description && (
                        <p className="text-coal-400 text-sm mt-0.5">
                          {game.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-coal-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Users size={12} /> {game.minPlayers}–
                          {game.maxPlayers} jogadores
                        </span>
                        <span className="text-amber-400/70 font-medium">
                          {game.pointValue ?? 1} pt{(game.pointValue ?? 1) > 1 ? "s" : ""} por vitória
                        </span>
                        <span>{formatDate(game.createdAt)}</span>
                      </div>
                      {(() => {
                        const interested = allUsers.filter((u) =>
                          (game.interests ?? []).includes(u.uid)
                        );
                        if (interested.length === 0) return null;
                        return (
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex -space-x-1">
                              {interested.slice(0, 6).map((u) => {
                                const color = teamColor(u.team);
                                return (
                                  <div
                                    key={u.uid}
                                    title={u.name}
                                    className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold border border-coal-900"
                                    style={{ background: color + "40", color }}
                                  >
                                    {u.name.charAt(0)}
                                  </div>
                                );
                              })}
                            </div>
                            <span className="text-coal-500 text-xs">
                              {interested.length} {interested.length === 1 ? "interessado" : "interessados"}
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => startEdit(game)}
                      className="btn-ghost p-2 text-coal-400 hover:text-amber-400"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => setDeletingId(game.id)}
                      className="btn-ghost p-2 text-coal-400 hover:text-red-400"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
