import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  orderBy,
  where,
  onSnapshot,
  arrayUnion,
  increment,
  writeBatch,
  serverTimestamp,
  limit,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./config";
import type {
  Game,
  Match,
  User,
  TeamDoc,
  CreateGameDTO,
  CreateMatchDTO,
  FinalizeMatchDTO,
} from "@/types";

// ── GAMES ────────────────────────────────────────────────────────────────────

export async function createGame(dto: CreateGameDTO, createdBy: string): Promise<string> {
  const ref = await addDoc(collection(db, "games"), {
    ...dto,
    createdBy,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getGames(): Promise<Game[]> {
  const snap = await getDocs(query(collection(db, "games"), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Game));
}

export function subscribeGames(callback: (games: Game[]) => void): Unsubscribe {
  return onSnapshot(
    query(collection(db, "games"), orderBy("createdAt", "desc")),
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Game)))
  );
}

export async function deleteGame(gameId: string): Promise<void> {
  await updateDoc(doc(db, "games", gameId), { deleted: true });
}

// ── MATCHES ──────────────────────────────────────────────────────────────────

export async function createMatch(dto: CreateMatchDTO, createdBy: string): Promise<string> {
  const ref = await addDoc(collection(db, "matches"), {
    ...dto,
    status: "waiting",
    players: [],
    winners: [],
    createdAt: serverTimestamp(),
    startedAt: null,
    finishedAt: null,
  });
  return ref.id;
}

export async function joinMatch(matchId: string, uid: string): Promise<void> {
  const matchRef = doc(db, "matches", matchId);
  const matchSnap = await getDoc(matchRef);
  if (!matchSnap.exists()) throw new Error("Partida não encontrada");

  const match = matchSnap.data() as Match;
  if (match.players.includes(uid)) throw new Error("Você já está inscrito nesta partida");
  if (match.status !== "waiting") throw new Error("Partida não está mais aceitando inscrições");

  const gameSnap = await getDoc(doc(db, "games", match.gameId));
  if (!gameSnap.exists()) throw new Error("Jogo não encontrado");
  const game = gameSnap.data() as Game;

  const newPlayers = [...match.players, uid];
  const newStatus = newPlayers.length >= game.minPlayers ? "active" : "waiting";

  await updateDoc(matchRef, {
    players: arrayUnion(uid),
    status: newStatus,
    ...(newStatus === "active" && match.status === "waiting"
      ? { startedAt: serverTimestamp() }
      : {}),
  });
}

export async function leaveMatch(matchId: string, uid: string): Promise<void> {
  const matchRef = doc(db, "matches", matchId);
  const matchSnap = await getDoc(matchRef);
  if (!matchSnap.exists()) throw new Error("Partida não encontrada");
  const match = matchSnap.data() as Match;
  if (match.status !== "waiting") throw new Error("Não é possível sair de uma partida em andamento");

  const newPlayers = match.players.filter((p) => p !== uid);
  await updateDoc(matchRef, { players: newPlayers });
}

export async function finalizeMatch(dto: FinalizeMatchDTO): Promise<void> {
  const { matchId, winnerIds } = dto;
  const batch = writeBatch(db);

  const matchRef = doc(db, "matches", matchId);
  batch.update(matchRef, {
    status: "finished",
    winners: winnerIds,
    finishedAt: serverTimestamp(),
  });

  for (const uid of winnerIds) {
    const userSnap = await getDoc(doc(db, "users", uid));
    if (!userSnap.exists()) continue;
    const user = userSnap.data() as User;

    batch.update(doc(db, "users", uid), {
      points: increment(1),
      wins: increment(1),
    });

    batch.update(doc(db, "teams", user.team), {
      points: increment(1),
      wins: increment(1),
    });
  }

  await batch.commit();
}

export function subscribeMatches(callback: (matches: Match[]) => void): Unsubscribe {
  return onSnapshot(
    query(collection(db, "matches"), orderBy("createdAt", "desc")),
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Match)))
  );
}

export function subscribeMatch(matchId: string, callback: (match: Match | null) => void): Unsubscribe {
  return onSnapshot(doc(db, "matches", matchId), (snap) => {
    callback(snap.exists() ? ({ id: snap.id, ...snap.data() } as Match) : null);
  });
}

// ── USERS ────────────────────────────────────────────────────────────────────

export async function getUsers(): Promise<User[]> {
  const snap = await getDocs(query(collection(db, "users"), orderBy("points", "desc")));
  return snap.docs.map((d) => d.data() as User);
}

export function subscribeRanking(callback: (users: User[]) => void): Unsubscribe {
  return onSnapshot(
    query(collection(db, "users"), orderBy("points", "desc"), limit(100)),
    (snap) => callback(snap.docs.map((d) => d.data() as User))
  );
}

export async function getUsersByIds(uids: string[]): Promise<User[]> {
  if (uids.length === 0) return [];
  const snaps = await Promise.all(uids.map((uid) => getDoc(doc(db, "users", uid))));
  return snaps.filter((s) => s.exists()).map((s) => s.data() as User);
}

export async function setUserRole(uid: string, role: "user" | "admin"): Promise<void> {
  await updateDoc(doc(db, "users", uid), { role });
}

// ── TEAMS ────────────────────────────────────────────────────────────────────

export function subscribeTeams(callback: (teams: TeamDoc[]) => void): Unsubscribe {
  return onSnapshot(collection(db, "teams"), (snap) =>
    callback(snap.docs.map((d) => d.data() as TeamDoc))
  );
}
