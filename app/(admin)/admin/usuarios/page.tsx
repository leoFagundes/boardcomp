"use client";

import { useEffect, useState } from "react";
import { getUsers, setUserRole, updateUserData } from "@/lib/firebase/firestore";
import { teamLabel, teamColor } from "@/lib/utils/helpers";
import toast from "react-hot-toast";
import type { User, Team } from "@/types";
import { ShieldCheck, ShieldOff, Pencil, Check, X, AlertTriangle } from "lucide-react";

interface EditForm {
  team: Team;
  points: string;
}

interface PendingChange {
  user: User;
  newTeam: Team;
  newPoints: number;
}

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUid, setEditingUid] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ team: "antigos", points: "" });
  const [saving, setSaving] = useState(false);
  const [pending, setPending] = useState<PendingChange | null>(null);

  const loadUsers = async () => {
    const u = await getUsers();
    setUsers(u);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleRole = async (user: User) => {
    const newRole = user.role === "admin" ? "user" : "admin";
    try {
      await setUserRole(user.uid, newRole);
      toast.success(
        `${user.name} agora é ${newRole === "admin" ? "administrador" : "usuário"}`,
      );
      loadUsers();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const startEdit = (user: User) => {
    setEditingUid(user.uid);
    setEditForm({ team: user.team, points: String(user.points) });
  };

  const cancelEdit = () => {
    setEditingUid(null);
  };

  const handleSaveEdit = (user: User) => {
    const newPoints = parseInt(editForm.points, 10);
    if (isNaN(newPoints) || newPoints < 0) {
      toast.error("Pontuação inválida");
      return;
    }
    const teamChanged = editForm.team !== user.team;
    const pointsChanged = newPoints !== user.points;
    if (!teamChanged && !pointsChanged) {
      setEditingUid(null);
      return;
    }
    setPending({ user, newTeam: editForm.team, newPoints });
  };

  const confirmSave = async () => {
    if (!pending) return;
    setSaving(true);
    try {
      await updateUserData(pending.user.uid, { team: pending.newTeam, points: pending.newPoints });
      toast.success(`${pending.user.name} atualizado`);
      setPending(null);
      setEditingUid(null);
      await loadUsers();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* ── Confirmation Modal ── */}
      {pending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="card w-full max-w-sm p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-400/10 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} className="text-amber-400" />
              </div>
              <div>
                <h2 className="font-semibold text-coal-100 text-base">Confirmar alteração</h2>
                <p className="text-coal-400 text-xs mt-0.5">{pending.user.name}</p>
              </div>
            </div>

            <div className="bg-coal-800 rounded-xl p-3 flex flex-col gap-2 text-sm">
              {pending.newTeam !== pending.user.team && (
                <div className="flex items-center justify-between">
                  <span className="text-coal-400">Equipe</span>
                  <div className="flex items-center gap-2">
                    <span style={{ color: teamColor(pending.user.team) }}>{teamLabel(pending.user.team)}</span>
                    <span className="text-coal-600">→</span>
                    <span style={{ color: teamColor(pending.newTeam) }}>{teamLabel(pending.newTeam)}</span>
                  </div>
                </div>
              )}
              {pending.newPoints !== pending.user.points && (
                <div className="flex items-center justify-between">
                  <span className="text-coal-400">Pontos</span>
                  <div className="flex items-center gap-2">
                    <span className="text-coal-200">{pending.user.points} pts</span>
                    <span className="text-coal-600">→</span>
                    <span className="text-coal-100 font-bold">{pending.newPoints} pts</span>
                  </div>
                </div>
              )}
              {pending.newTeam !== pending.user.team && (
                <p className="text-coal-500 text-xs pt-1 border-t border-coal-700">
                  Os pontos serão transferidos junto com o usuário.
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setPending(null)}
                disabled={saving}
                className="flex-1 py-2 rounded-xl border border-coal-600 text-coal-300 text-sm hover:bg-coal-700 transition-all disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmSave}
                disabled={saving}
                className="flex-1 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Check size={14} /> Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="mb-8">
        <h1 className="font-display text-4xl text-gradient tracking-wide">
          USUÁRIOS
        </h1>
        <p className="text-coal-400 text-sm mt-1">
          {users.length} usuários cadastrados
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-coal-500">Carregando...</div>
      ) : (
        <div className="card overflow-hidden">
          {/* Desktop header */}
          <div className="hidden sm:grid p-4 border-b border-coal-700 grid-cols-12 text-xs text-coal-500 font-semibold uppercase tracking-wider">
            <span className="col-span-4">Usuário</span>
            <span className="col-span-3">Equipe</span>
            <span className="col-span-2 text-center">Pontos</span>
            <span className="col-span-3 text-right">Ações</span>
          </div>

          {users.map((u) => {
            const color = teamColor(u.team);
            const isEditing = editingUid === u.uid;

            return (
              <div
                key={u.uid}
                className="border-b border-coal-700/50 transition-all"
              >
                {/* ── Desktop row ── */}
                <div className="hidden sm:grid p-4 grid-cols-12 items-center hover:bg-coal-800/50">
                  <div className="col-span-4 flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                      style={{ background: color + "30", color }}
                    >
                      {u.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-coal-100 text-sm truncate">
                        {u.name}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        {u.role === "admin" && (
                          <span className="text-amber-400 text-xs flex items-center gap-0.5">
                            <ShieldCheck size={10} /> Admin
                          </span>
                        )}
                        <span className="text-coal-500 text-xs truncate">
                          {u.email}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Team */}
                  <div className="col-span-3">
                    {isEditing ? (
                      <select
                        value={editForm.team}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, team: e.target.value as Team }))
                        }
                        className="bg-coal-700 border border-coal-600 text-coal-100 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-coal-400"
                      >
                        <option value="antigos">Brasilberg</option>
                        <option value="novos">Hidromel</option>
                      </select>
                    ) : (
                      <span className="text-sm truncate" style={{ color }}>
                        {teamLabel(u.team)}
                      </span>
                    )}
                  </div>

                  {/* Points */}
                  <div className="col-span-2 text-center">
                    {isEditing ? (
                      <input
                        type="number"
                        min={0}
                        value={editForm.points}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, points: e.target.value }))
                        }
                        className="w-16 bg-coal-700 border border-coal-600 text-coal-100 text-xs rounded-lg px-2 py-1 text-center focus:outline-none focus:border-coal-400"
                      />
                    ) : (
                      <>
                        <span className="font-bold text-coal-100">{u.points}</span>
                        <span className="text-coal-500 text-xs ml-1">pts</span>
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="col-span-3 flex justify-end gap-1.5">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => handleSaveEdit(u)}
                          disabled={saving}
                          className="text-xs px-2.5 py-1 rounded-lg border text-emerald-400 border-emerald-400/30 hover:bg-emerald-400/10 transition-all flex items-center gap-1 disabled:opacity-50"
                        >
                          <Check size={11} /> Salvar
                        </button>
                        <button
                          onClick={cancelEdit}
                          disabled={saving}
                          className="text-xs px-2.5 py-1 rounded-lg border text-coal-400 border-coal-600 hover:bg-coal-700 transition-all flex items-center gap-1 disabled:opacity-50"
                        >
                          <X size={11} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(u)}
                          className="text-xs px-2.5 py-1 rounded-lg border text-blue-400 border-blue-400/30 hover:bg-blue-400/10 transition-all flex items-center gap-1"
                        >
                          <Pencil size={11} /> Editar
                        </button>
                        <button
                          onClick={() => handleToggleRole(u)}
                          className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                            u.role === "admin"
                              ? "text-red-400 border-red-400/30 hover:bg-red-400/10"
                              : "text-amber-400 border-amber-400/30 hover:bg-amber-400/10"
                          }`}
                        >
                          {u.role === "admin" ? (
                            <span className="flex items-center gap-1">
                              <ShieldOff size={11} /> Remover
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <ShieldCheck size={11} /> Admin
                            </span>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* ── Mobile card ── */}
                <div className="sm:hidden p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0"
                      style={{ background: color + "30", color }}
                    >
                      {u.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-medium text-coal-100 text-sm">
                          {u.name}
                        </span>
                        {u.role === "admin" && (
                          <span className="text-amber-400 text-xs flex items-center gap-0.5">
                            <ShieldCheck size={10} /> Admin
                          </span>
                        )}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color }}>
                        {teamLabel(u.team)}
                      </div>
                      <div className="text-coal-500 text-xs truncate">
                        {u.email}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <div>
                        <span className="font-bold text-coal-100 text-sm">
                          {u.points}
                        </span>
                        <span className="text-coal-500 text-xs ml-1">pts</span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => isEditing ? cancelEdit() : startEdit(u)}
                          className={`text-xs px-2 py-1 rounded-lg border transition-all flex items-center gap-1 ${
                            isEditing
                              ? "text-coal-400 border-coal-600 hover:bg-coal-700"
                              : "text-blue-400 border-blue-400/30 hover:bg-blue-400/10"
                          }`}
                        >
                          {isEditing ? <X size={11} /> : <Pencil size={11} />}
                        </button>
                        <button
                          onClick={() => handleToggleRole(u)}
                          className={`text-xs px-2 py-1 rounded-lg border transition-all ${
                            u.role === "admin"
                              ? "text-red-400 border-red-400/30 hover:bg-red-400/10"
                              : "text-amber-400 border-amber-400/30 hover:bg-amber-400/10"
                          }`}
                        >
                          {u.role === "admin" ? (
                            <ShieldOff size={11} />
                          ) : (
                            <ShieldCheck size={11} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Mobile edit form */}
                  {isEditing && (
                    <div className="mt-3 pt-3 border-t border-coal-700 flex flex-col gap-2">
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="text-coal-500 text-xs mb-1 block">Equipe</label>
                          <select
                            value={editForm.team}
                            onChange={(e) =>
                              setEditForm((f) => ({ ...f, team: e.target.value as Team }))
                            }
                            className="w-full bg-coal-700 border border-coal-600 text-coal-100 text-sm rounded-lg px-2 py-1.5 focus:outline-none focus:border-coal-400"
                          >
                            <option value="antigos">Brasilberg</option>
                            <option value="novos">Hidromel</option>
                          </select>
                        </div>
                        <div className="w-24">
                          <label className="text-coal-500 text-xs mb-1 block">Pontos</label>
                          <input
                            type="number"
                            min={0}
                            value={editForm.points}
                            onChange={(e) =>
                              setEditForm((f) => ({ ...f, points: e.target.value }))
                            }
                            className="w-full bg-coal-700 border border-coal-600 text-coal-100 text-sm rounded-lg px-2 py-1.5 text-center focus:outline-none focus:border-coal-400"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => handleSaveEdit(u)}
                        disabled={saving}
                        className="w-full text-sm py-1.5 rounded-lg border text-emerald-400 border-emerald-400/30 hover:bg-emerald-400/10 transition-all flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        <Check size={13} /> Salvar alterações
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
