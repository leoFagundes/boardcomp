"use client";

import { useState } from "react";
import { useMatches } from "@/lib/hooks/useMatches";
import { useGames } from "@/lib/hooks/useGames";
import { useRanking } from "@/lib/hooks/useRanking";
import { updateTeamWins, updateTeamPoints } from "@/lib/firebase/firestore";
import Link from "next/link";
import toast from "react-hot-toast";
import { Gamepad2, Swords, Users, Trophy, ArrowRight, Pencil, Check, X, AlertTriangle } from "lucide-react";
import Portal from "@/components/Portal";

type EditingState = { teamId: string; field: "wins" | "points" } | null;

type PendingConfirm = {
  teamId: string;
  teamName: string;
  field: "wins" | "points";
  oldValue: number;
  newValue: number;
} | null;

export default function AdminPage() {
  const { matches } = useMatches();
  const { games } = useGames();
  const { users, teams } = useRanking();

  const [editing, setEditing] = useState<EditingState>(null);
  const [inputValue, setInputValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm>(null);

  const startEdit = (teamId: string, field: "wins" | "points", current: number) => {
    setEditing({ teamId, field });
    setInputValue(String(current));
  };

  const requestConfirm = (team: { id: string; name: string; wins: number; points: number }, field: "wins" | "points") => {
    const newValue = parseInt(inputValue, 10);
    if (isNaN(newValue) || newValue < 0) { toast.error("Valor inválido"); return; }
    setPendingConfirm({
      teamId: team.id,
      teamName: team.name,
      field,
      oldValue: field === "wins" ? team.wins : team.points,
      newValue,
    });
  };

  const handleConfirm = async () => {
    if (!pendingConfirm) return;
    setSaving(true);
    try {
      if (pendingConfirm.field === "wins") {
        await updateTeamWins(pendingConfirm.teamId, pendingConfirm.newValue);
        toast.success("Vitórias atualizadas!");
      } else {
        await updateTeamPoints(pendingConfirm.teamId, pendingConfirm.newValue);
        toast.success("Pontos atualizados!");
      }
      setEditing(null);
      setPendingConfirm(null);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const waiting = matches.filter((m) => m.status === "waiting").length;
  const active = matches.filter((m) => m.status === "active").length;
  const finished = matches.filter((m) => m.status === "finished").length;

  const cards = [
    { label: "Jogos Cadastrados", value: games.length, icon: Gamepad2, href: "/admin/jogos", color: "#10B981" },
    { label: "Partidas Ativas", value: active, icon: Swords, href: "/admin/partidas", color: "#F59E0B" },
    { label: "Usuários", value: users.length, icon: Users, href: "/admin/usuarios", color: "#3B82F6" },
    { label: "Partidas Finalizadas", value: finished, icon: Trophy, href: "/admin/partidas", color: "#8B5CF6" },
  ];

  const fieldLabel = (field: "wins" | "points") => field === "wins" ? "vitórias" : "pontos";

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
          {teams.map((team) => {
            const color = team.id === "antigos" ? "#F59E0B" : "#3B82F6";
            return (
              <div key={team.id} className="p-4 rounded-xl" style={{ background: color + "15", border: `1px solid ${color}30` }}>
                <div className="font-bold mb-3" style={{ color }}>{team.name}</div>
                <div className="grid grid-cols-3 gap-2 text-center">

                  {/* Points */}
                  {editing?.teamId === team.id && editing.field === "points" ? (
                    <div className="flex flex-col items-center gap-1.5">
                      <input
                        type="number"
                        min={0}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="w-16 bg-coal-700 border border-coal-500 text-coal-100 text-sm font-bold rounded-lg px-2 py-1 text-center focus:outline-none focus:border-coal-300"
                        autoFocus
                        onKeyDown={(e) => { if (e.key === "Enter") requestConfirm(team, "points"); if (e.key === "Escape") setEditing(null); }}
                      />
                      <div className="flex gap-1">
                        <button onClick={() => requestConfirm(team, "points")} className="p-1 rounded-lg text-emerald-400 hover:bg-emerald-400/10 transition-all">
                          <Check size={13} />
                        </button>
                        <button onClick={() => setEditing(null)} className="p-1 rounded-lg text-coal-400 hover:bg-coal-700 transition-all">
                          <X size={13} />
                        </button>
                      </div>
                      <div className="text-xs text-coal-500">Pontos</div>
                    </div>
                  ) : (
                    <div className="group flex flex-col items-center cursor-pointer" onClick={() => startEdit(team.id, "points", team.points)}>
                      <div className="text-2xl font-bold text-coal-100 flex items-center gap-1">
                        {team.points}
                        <Pencil size={12} className="text-coal-600 group-hover:text-coal-400 transition-colors" />
                      </div>
                      <div className="text-xs text-coal-500">Pontos</div>
                    </div>
                  )}

                  {/* Wins */}
                  {editing?.teamId === team.id && editing.field === "wins" ? (
                    <div className="flex flex-col items-center gap-1.5">
                      <input
                        type="number"
                        min={0}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="w-16 bg-coal-700 border border-coal-500 text-coal-100 text-sm font-bold rounded-lg px-2 py-1 text-center focus:outline-none focus:border-coal-300"
                        autoFocus
                        onKeyDown={(e) => { if (e.key === "Enter") requestConfirm(team, "wins"); if (e.key === "Escape") setEditing(null); }}
                      />
                      <div className="flex gap-1">
                        <button onClick={() => requestConfirm(team, "wins")} className="p-1 rounded-lg text-emerald-400 hover:bg-emerald-400/10 transition-all">
                          <Check size={13} />
                        </button>
                        <button onClick={() => setEditing(null)} className="p-1 rounded-lg text-coal-400 hover:bg-coal-700 transition-all">
                          <X size={13} />
                        </button>
                      </div>
                      <div className="text-xs text-coal-500">Vitórias</div>
                    </div>
                  ) : (
                    <div className="group flex flex-col items-center cursor-pointer" onClick={() => startEdit(team.id, "wins", team.wins)}>
                      <div className="text-2xl font-bold text-coal-100 flex items-center gap-1">
                        {team.wins}
                        <Pencil size={12} className="text-coal-600 group-hover:text-coal-400 transition-colors" />
                      </div>
                      <div className="text-xs text-coal-500">Vitórias</div>
                    </div>
                  )}

                  {/* Members */}
                  <div>
                    <div className="text-2xl font-bold text-coal-100">{users.filter((u) => u.team === team.id).length}</div>
                    <div className="text-xs text-coal-500">Membros</div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirmation modal */}
      {pendingConfirm && (
        <Portal>
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-coal-900 border border-coal-700 rounded-2xl w-full max-w-sm shadow-2xl animate-slide-up p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-500/15 flex items-center justify-center shrink-0">
                  <AlertTriangle size={20} className="text-amber-400" />
                </div>
                <h2 className="font-bold text-coal-100 text-lg">Confirmar alteração</h2>
              </div>
              <p className="text-coal-300 text-sm mb-2">
                Alterar as <span className="text-coal-100 font-semibold">{fieldLabel(pendingConfirm.field)}</span> de{" "}
                <span className="font-semibold" style={{ color: pendingConfirm.teamId === "antigos" ? "#F59E0B" : "#3B82F6" }}>
                  {pendingConfirm.teamName}
                </span>
                :
              </p>
              <div className="flex items-center justify-center gap-4 my-4 py-3 bg-coal-800 rounded-xl border border-coal-700">
                <div className="text-center">
                  <div className="text-2xl font-bold text-coal-400 line-through">{pendingConfirm.oldValue}</div>
                  <div className="text-xs text-coal-600 mt-0.5">Atual</div>
                </div>
                <ArrowRight size={18} className="text-coal-500" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-coal-100">{pendingConfirm.newValue}</div>
                  <div className="text-xs text-coal-500 mt-0.5">Novo</div>
                </div>
              </div>
              <p className="text-coal-500 text-xs mb-5">Esta ação altera o placar diretamente e não pode ser desfeita automaticamente.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => { setPendingConfirm(null); setEditing(null); }}
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl border border-coal-600 text-coal-300 text-sm font-medium hover:bg-coal-800 transition-all disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 text-sm font-medium hover:bg-amber-500/30 transition-all disabled:opacity-50"
                >
                  {saving ? "Salvando…" : "Confirmar"}
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
