"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useMatches } from "@/lib/hooks/useMatches";
import { updateProfile } from "@/lib/firebase/firestore";
import {
  teamLabel,
  teamColor,
  formatDate,
  statusLabel,
  dicebearUrl,
} from "@/lib/utils/helpers";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import {
  Trophy,
  Gamepad2,
  TrendingUp,
  LogOut,
  Pencil,
  X,
  Check,
} from "lucide-react";

const AVATAR_SEEDS = [
  "Felix",
  "Mochi",
  "Sage",
  "Jasper",
  "Luna",
  "Orion",
  "Zara",
  "Hunter",
  "Nova",
  "Atlas",
  "Ember",
  "Kira",
  "Riven",
  "Blaze",
  "Storm",
  "Echo",
  "Dante",
  "Lyra",
  "Finn",
  "Wren",
  "Cleo",
  "Axel",
  "Sera",
  "Brom",
  "Mira",
  "Drake",
  "Lena",
  "Vex",
  "Theo",
  "Iris",
  "Gael",
  "Nora",
  "Cyrus",
  "Elara",
  "Rook",
  "Talia",
  "Bard",
  "Sable",
  "Cain",
  "Vera",
  "Orin",
  "Freya",
  "Jett",
  "Cass",
  "Alaric",
  "Selene",
  "Draco",
  "Faye",
  "Milo",
  "Zephyr",
  "Ivy",
  "Rex",
  "Nyx",
  "Arlo",
  "Lyra",
  "Kai",
  "Luna",
  "Dorian",
  "Astra",
  "Kierannnnnnnnn",
  "Nova",
  "Riven",
  "Zara",
  "Lucian",
  "Nyra",
  "Orion",
  "Kaeleeeeeeeeeeeeeee",
  "Ezraaaaaaaaaaaaaaa",
  "Soren",
  "Altair",
  "Vanya",
  "Fenrir",
  "Elowen",
  "Talon",
  "Zeke",
  "Isla",
  "Ronan",
  "999999999999",
];

const BG_COLORS: { value: string | null; label: string }[] = [
  { value: null, label: "Auto" },
  { value: "b6e3f4", label: "Azul" },
  { value: "c0aede", label: "Lilás" },
  { value: "d1d4f9", label: "Índigo" },
  { value: "ffd5dc", label: "Rosa" },
  { value: "ffdfbf", label: "Pêssego" },
  { value: "b5ead7", label: "Menta" },
  { value: "ffeaa7", label: "Limão" },
  { value: "f0e6ff", label: "Violeta" },
  { value: "fce4ec", label: "Coral" },
  { value: "e0f7fa", label: "Ciano" },
  { value: "fff9c4", label: "Creme" },
  { value: "e8f5e9", label: "Verde" },
  { value: "f3e5f5", label: "Uva" },
  { value: "ffe0b2", label: "Laranja" },
  { value: "fafafa", label: "Branco" },
];

const AVATAR_STYLES = [
  { id: "pixel-art", label: "Pixel Art" },
  { id: "bottts-neutral", label: "Robôs" },
  { id: "fun-emoji", label: "Emoji" },
  { id: "adventurer-neutral", label: "Aventura" },
  { id: "adventurer", label: "Adventurer" },
  { id: "lorelei-neutral", label: "Lorelei" },
  { id: "micah", label: "Micah" },
  { id: "thumbs", label: "Thumbs" },
  { id: "croodles-neutral", label: "Doodle" },
  { id: "big-smile", label: "Sorriso" },
  { id: "dylan", label: "Dylan" },
  { id: "open-peeps", label: "Peeps" },
  { id: "personas", label: "Personas" },
  { id: "toon-head", label: "Toon Head" },
];

export default function PerfilPage() {
  const { user, signOut, refreshUser } = useAuth();
  const { matches } = useMatches();
  const router = useRouter();

  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editSeed, setEditSeed] = useState<string | null>(null);
  const [editStyle, setEditStyle] = useState("pixel-art");
  const [editBg, setEditBg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);

  if (!user) return null;

  useEffect(() => {
    setVisibleCount(10); // reinicia do zero
  }, [editStyle, editBg]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    setVisibleCount(10);

    interval = setInterval(() => {
      setVisibleCount((prev) => {
        if (prev >= AVATAR_SEEDS.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 5;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [editStyle, editBg]);

  const myMatches = matches.filter((m) => m.players.includes(user.uid));
  const myWins = myMatches.filter((m) => m.winners.includes(user.uid));
  const tc = teamColor(user.team);

  const finishedCount = myMatches.filter((m) => m.status === "finished").length;
  const winRate =
    finishedCount > 0 ? Math.round((myWins.length / finishedCount) * 100) : 0;

  const handleSignOut = async () => {
    await signOut();
    toast.success("Até logo!");
    router.push("/login");
  };

  const openEdit = () => {
    setEditName(user.name);
    setEditSeed(user.avatarSeed ?? null);
    setEditStyle(user.avatarStyle ?? "pixel-art");
    setEditBg(user.avatarBg ?? null);
    setEditOpen(true);
  };

  useEffect(() => {
    AVATAR_SEEDS.slice(0, 10).forEach((seed) => {
      const img = new Image();
      img.src = dicebearUrl(seed, editStyle, editBg ?? undefined);
    });
  }, [editStyle, editBg]);

  const handleSave = async () => {
    const trimmed = editName.trim();
    if (!trimmed) {
      toast.error("Nome não pode ficar em branco");
      return;
    }
    setSaving(true);
    try {
      const updates: {
        name?: string;
        avatarSeed?: string;
        avatarStyle?: string;
        avatarBg?: string;
      } = {};
      if (trimmed !== user.name) updates.name = trimmed;
      if (editSeed !== (user.avatarSeed ?? null))
        updates.avatarSeed = editSeed ?? "";
      if (editSeed && editStyle !== (user.avatarStyle ?? "pixel-art"))
        updates.avatarStyle = editStyle;
      if (!editSeed) updates.avatarStyle = "";
      if (editBg !== (user.avatarBg ?? null)) updates.avatarBg = editBg ?? "";
      if (Object.keys(updates).length > 0) {
        await updateProfile(user.uid, updates);
        await refreshUser();
        toast.success("Perfil atualizado!");
      }
      setEditOpen(false);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const currentStyle = user.avatarStyle || "pixel-art";
  const currentBg = user.avatarBg || undefined;

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <h1 className="font-display text-4xl text-gradient tracking-wide mb-8">
        MEU PERFIL
      </h1>

      {/* Profile card */}
      <div className="card p-6 mb-6" style={{ borderTop: `3px solid ${tc}` }}>
        <div className="flex items-start gap-4">
          <div className="shrink-0">
            {user.avatarSeed ? (
              <img
                src={dicebearUrl(user.avatarSeed, currentStyle, currentBg)}
                alt="avatar"
                className="w-16 h-16 rounded-2xl"
              />
            ) : (
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold"
                style={{ background: tc + "25", color: tc }}
              >
                {user.name.charAt(0)}
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-coal-100">{user.name}</h2>
              <button
                onClick={openEdit}
                className="btn-ghost p-1.5 text-coal-500 hover:text-amber-400"
                title="Editar perfil"
              >
                <Pencil size={14} />
              </button>
            </div>
            <p className="text-coal-400 text-sm">{user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: tc }}
              />
              <span className="text-sm font-medium" style={{ color: tc }}>
                {teamLabel(user.team)}
              </span>
              {user.role === "admin" && (
                <span className="bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-semibold px-2 py-0.5 rounded-full">
                  Admin
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-coal-700">
          <div className="text-center">
            <div className="text-3xl font-bold text-coal-100">
              {user.points}
            </div>
            <div className="text-coal-500 text-xs mt-1 flex items-center justify-center gap-1">
              <Trophy size={10} /> Pontos
            </div>
          </div>
          <div className="text-center border-x border-coal-700">
            <div className="text-3xl font-bold text-coal-100">{user.wins}</div>
            <div className="text-coal-500 text-xs mt-1 flex items-center justify-center gap-1">
              <TrendingUp size={10} /> Vitórias
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-coal-100">
              {myMatches.length}
            </div>
            <div className="text-coal-500 text-xs mt-1 flex items-center justify-center gap-1">
              <Gamepad2 size={10} /> Partidas
            </div>
          </div>
        </div>

        {finishedCount > 0 && (
          <div className="mt-4 pt-4 border-t border-coal-700">
            <div className="flex justify-between items-center mb-2">
              <span className="text-coal-400 text-sm">Taxa de vitória</span>
              <span className="text-coal-100 font-bold">{winRate}%</span>
            </div>
            <div className="h-2 bg-coal-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${winRate}%`, background: tc }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Match history */}
      <div className="card p-6 mb-6">
        <h2 className="font-bold text-coal-100 mb-4">Histórico de Partidas</h2>
        {myMatches.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-coal-500 text-sm">Nenhuma partida ainda</p>
            <Link
              href="/jogos"
              className="btn-primary mt-3 inline-block text-sm"
            >
              Ver Partidas Disponíveis
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {myMatches.map((m) => {
              const won = m.winners.includes(user.uid);
              return (
                <Link
                  key={m.id}
                  href={`/jogos/${m.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-coal-800 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">
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
                    <span className={`badge-${m.status} text-xs`}>
                      {statusLabel(m.status)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <button
        onClick={handleSignOut}
        className="btn-secondary w-full flex items-center justify-center gap-2 text-red-400 border-red-400/20 hover:border-red-400/40"
      >
        <LogOut size={16} /> Sair da conta
      </button>

      {/* Edit profile modal */}
      {editOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditOpen(false);
          }}
        >
          <div className="bg-coal-900 border border-coal-700 rounded-2xl w-full max-w-lg shadow-2xl animate-slide-up flex flex-col max-h-[80vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-coal-700 shrink-0">
              <h2 className="font-bold text-coal-100 text-lg">Editar Perfil</h2>
              <button
                onClick={() => setEditOpen(false)}
                className="btn-ghost p-2 text-coal-400 hover:text-coal-200"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-5 space-y-5">
              {/* Name */}
              <div>
                <label className="label">Nome</label>
                <input
                  type="text"
                  className="input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  maxLength={40}
                />
              </div>

              {/* Avatar picker */}
              <div>
                <label className="label">Foto de Perfil</label>

                {/* Style tabs */}
                <div className="flex gap-1.5 mt-2 overflow-x-auto pb-2 shrink-0">
                  {AVATAR_STYLES.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setEditStyle(s.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                        editStyle === s.id
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                          : "bg-coal-800 text-coal-400 border border-coal-700 hover:text-coal-200"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                {/* Background color picker */}
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  {BG_COLORS.map((c) => (
                    <button
                      key={c.value ?? "auto"}
                      onClick={() => setEditBg(c.value)}
                      title={c.label}
                      className={`w-7 h-7 rounded-full border-2 transition-all shrink-0 ${
                        editBg === c.value
                          ? "border-amber-500 ring-2 ring-amber-500/40 scale-110"
                          : "border-coal-600 hover:border-coal-400"
                      }`}
                      style={
                        c.value
                          ? { background: `#${c.value}` }
                          : {
                              background:
                                "linear-gradient(135deg,#b6e3f4,#ffd5dc,#b5ead7,#ffeaa7)",
                            }
                      }
                    />
                  ))}
                </div>

                {/* Avatar grid */}
                <div className="grid grid-cols-5 gap-2 mt-3">
                  {/* No avatar (initials) */}
                  <button
                    onClick={() => setEditSeed(null)}
                    className={`aspect-square rounded-xl border-2 flex items-center justify-center text-xl font-bold transition-all ${
                      editSeed === null
                        ? "border-amber-500 bg-amber-500/10"
                        : "border-coal-700 bg-coal-800 hover:border-coal-500"
                    }`}
                    title="Usar inicial do nome"
                  >
                    <span style={{ color: tc }}>{user.name.charAt(0)}</span>
                  </button>

                  {AVATAR_SEEDS.slice(0, visibleCount).map((seed) => (
                    <button
                      key={seed}
                      onClick={() => setEditSeed(seed)}
                      className={`aspect-square rounded-xl border-2 overflow-hidden transition-all ${
                        editSeed === seed && editStyle === editStyle
                          ? editSeed === seed
                            ? "border-amber-500 ring-2 ring-amber-500/30"
                            : "border-coal-700 hover:border-coal-500"
                          : "border-coal-700 hover:border-coal-500"
                      }`}
                      title={seed}
                    >
                      <img
                        src={dicebearUrl(seed, editStyle, editBg ?? undefined)}
                        alt={seed}
                        className="w-full h-full"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-2 p-5 border-t border-coal-700 shrink-0">
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary flex items-center gap-2 flex-1 justify-center"
              >
                <Check size={15} />
                {saving ? "Salvando..." : "Salvar"}
              </button>
              <button
                onClick={() => setEditOpen(false)}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
