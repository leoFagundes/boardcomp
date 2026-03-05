"use client";

import { useEffect, useState } from "react";
import { getUsers, setUserRole } from "@/lib/firebase/firestore";
import { teamLabel, teamColor } from "@/lib/utils/helpers";
import toast from "react-hot-toast";
import type { User } from "@/types";
import { ShieldCheck, ShieldOff, Trophy } from "lucide-react";

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    const u = await getUsers();
    setUsers(u);
    setLoading(false);
  };

  useEffect(() => { loadUsers(); }, []);

  const handleToggleRole = async (user: User) => {
    const newRole = user.role === "admin" ? "user" : "admin";
    try {
      await setUserRole(user.uid, newRole);
      toast.success(`${user.name} agora é ${newRole === "admin" ? "administrador" : "usuário"}`);
      loadUsers();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-4xl text-gradient tracking-wide">USUÁRIOS</h1>
        <p className="text-coal-400 text-sm mt-1">{users.length} usuários cadastrados</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-coal-500">Carregando...</div>
      ) : (
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-coal-700 grid grid-cols-12 text-xs text-coal-500 font-semibold uppercase tracking-wider">
            <span className="col-span-5">Usuário</span>
            <span className="col-span-3">Equipe</span>
            <span className="col-span-2 text-center">Pontos</span>
            <span className="col-span-2 text-right">Ação</span>
          </div>
          {users.map((u) => {
            const color = teamColor(u.team);
            return (
              <div key={u.uid} className="p-4 grid grid-cols-12 items-center border-b border-coal-700/50 hover:bg-coal-800/50 transition-all">
                <div className="col-span-5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                    style={{ background: color + "30", color }}>
                    {u.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-coal-100 text-sm">{u.name}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {u.role === "admin" && (
                        <span className="text-amber-400 text-xs flex items-center gap-0.5">
                          <ShieldCheck size={10} /> Admin
                        </span>
                      )}
                      <span className="text-coal-500 text-xs">{u.email}</span>
                    </div>
                  </div>
                </div>
                <div className="col-span-3 text-sm" style={{ color }}>{teamLabel(u.team)}</div>
                <div className="col-span-2 text-center">
                  <span className="font-bold text-coal-100">{u.points}</span>
                  <span className="text-coal-500 text-xs ml-1">pts</span>
                </div>
                <div className="col-span-2 flex justify-end">
                  <button
                    onClick={() => handleToggleRole(u)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                      u.role === "admin"
                        ? "text-red-400 border-red-400/30 hover:bg-red-400/10"
                        : "text-amber-400 border-amber-400/30 hover:bg-amber-400/10"
                    }`}
                  >
                    {u.role === "admin" ? (
                      <span className="flex items-center gap-1"><ShieldOff size={11} /> Remover</span>
                    ) : (
                      <span className="flex items-center gap-1"><ShieldCheck size={11} /> Admin</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
