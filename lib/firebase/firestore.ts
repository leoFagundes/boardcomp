import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
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

export async function updateGame(gameId: string, dto: Partial<CreateGameDTO>): Promise<void> {
  await updateDoc(doc(db, "games", gameId), { ...dto });
}

export async function deleteGame(gameId: string): Promise<void> {
  await deleteDoc(doc(db, "games", gameId));
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

export async function deleteMatch(matchId: string, revertPoints: boolean = false): Promise<void> {
  if (revertPoints) {
    const matchSnap = await getDoc(doc(db, "matches", matchId));
    if (matchSnap.exists()) {
      const match = matchSnap.data() as Match;
      if (match.status === "finished" && match.winners.length > 0) {
        const pts = match.pointValue ?? 1;
        const batch = writeBatch(db);
        for (const uid of match.winners) {
          const userSnap = await getDoc(doc(db, "users", uid));
          if (!userSnap.exists()) continue;
          const user = userSnap.data() as User;
          batch.update(doc(db, "users", uid), { points: increment(-pts), wins: increment(-1) });
          batch.update(doc(db, "teams", user.team), { points: increment(-pts), wins: increment(-1) });
        }
        batch.delete(doc(db, "matches", matchId));
        await batch.commit();
        return;
      }
    }
  }
  await deleteDoc(doc(db, "matches", matchId));
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

  let newStatus: string = "waiting";
  if (newPlayers.length >= game.minPlayers) {
    const playerSnaps = await Promise.all(
      newPlayers.map((p) => getDoc(doc(db, "users", p)))
    );
    const playerTeams = new Set(
      playerSnaps.filter((s) => s.exists()).map((s) => (s.data() as User).team)
    );
    if (playerTeams.has("antigos") && playerTeams.has("novos")) {
      newStatus = "active";
    }
  }

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
  if (match.status === "finished") throw new Error("Não é possível sair de uma partida já finalizada");

  const newPlayers = match.players.filter((p) => p !== uid);
  await updateDoc(matchRef, { players: newPlayers });
}

export async function finalizeMatch(dto: FinalizeMatchDTO): Promise<void> {
  const { matchId, winnerIds } = dto;

  const matchSnap = await getDoc(doc(db, "matches", matchId));
  if (!matchSnap.exists()) throw new Error("Partida não encontrada");
  const match = matchSnap.data() as Match;
  const pts = match.pointValue ?? 1;

  const batch = writeBatch(db);

  batch.update(doc(db, "matches", matchId), {
    status: "finished",
    winners: winnerIds,
    finishedAt: serverTimestamp(),
  });

  for (const uid of winnerIds) {
    const userSnap = await getDoc(doc(db, "users", uid));
    if (!userSnap.exists()) continue;
    const user = userSnap.data() as User;

    batch.update(doc(db, "users", uid), {
      points: increment(pts),
      wins: increment(1),
    });

    batch.update(doc(db, "teams", user.team), {
      points: increment(pts),
      wins: increment(1),
    });
  }

  await batch.commit();
}

export async function editMatch(
  matchId: string,
  updates: {
    gameId: string;
    gameName: string;
    pointValue: number;
    status: string;
    players: string[];
    winners: string[];
  }
): Promise<void> {
  const matchSnap = await getDoc(doc(db, "matches", matchId));
  if (!matchSnap.exists()) throw new Error("Partida não encontrada");
  const match = matchSnap.data() as Match;

  const wasFinished = match.status === "finished" && match.winners.length > 0;
  const willBeFinished = updates.status === "finished" && updates.winners.length > 0;
  const oldPts = match.pointValue ?? 1;
  const newPts = updates.pointValue ?? 1;

  const batch = writeBatch(db);

  // Revert old winners' points
  if (wasFinished) {
    for (const uid of match.winners) {
      const userSnap = await getDoc(doc(db, "users", uid));
      if (!userSnap.exists()) continue;
      const u = userSnap.data() as User;
      batch.update(doc(db, "users", uid), { points: increment(-oldPts), wins: increment(-1) });
      batch.update(doc(db, "teams", u.team), { points: increment(-oldPts), wins: increment(-1) });
    }
  }

  // Apply new winners' points
  if (willBeFinished) {
    for (const uid of updates.winners) {
      const userSnap = await getDoc(doc(db, "users", uid));
      if (!userSnap.exists()) continue;
      const u = userSnap.data() as User;
      batch.update(doc(db, "users", uid), { points: increment(newPts), wins: increment(1) });
      batch.update(doc(db, "teams", u.team), { points: increment(newPts), wins: increment(1) });
    }
  }

  const matchUpdate: Record<string, any> = {
    gameId: updates.gameId,
    gameName: updates.gameName,
    pointValue: updates.pointValue,
    status: updates.status,
    players: updates.players,
    winners: updates.winners,
  };

  if (updates.status === "active" && !match.startedAt) {
    matchUpdate.startedAt = serverTimestamp();
  }
  if (updates.status === "finished" && !match.finishedAt) {
    matchUpdate.finishedAt = serverTimestamp();
  }

  batch.update(doc(db, "matches", matchId), matchUpdate);
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

export async function updateUserData(
  uid: string,
  updates: { team?: string; points?: number }
): Promise<void> {
  const userSnap = await getDoc(doc(db, "users", uid));
  if (!userSnap.exists()) throw new Error("Usuário não encontrado");
  const user = userSnap.data() as User;

  const oldTeam = user.team;
  const oldPoints = user.points;
  const newTeam = updates.team ?? oldTeam;
  const newPoints = updates.points ?? oldPoints;

  const batch = writeBatch(db);

  if (oldTeam === newTeam) {
    const delta = newPoints - oldPoints;
    if (delta !== 0) {
      batch.update(doc(db, "teams", oldTeam), { points: increment(delta) });
    }
  } else {
    // Transfere os pontos do time antigo para o novo
    batch.update(doc(db, "teams", oldTeam), {
      points: increment(-oldPoints),
      wins: increment(-user.wins),
      memberCount: increment(-1),
    });
    batch.update(doc(db, "teams", newTeam), {
      points: increment(newPoints),
      wins: increment(user.wins),
      memberCount: increment(1),
    });
  }

  batch.update(doc(db, "users", uid), { team: newTeam, points: newPoints });
  await batch.commit();
}

export async function updateTeamWins(teamId: string, wins: number): Promise<void> {
  await updateDoc(doc(db, "teams", teamId), { wins });
}

// ── TEAMS ────────────────────────────────────────────────────────────────────

export function subscribeTeams(callback: (teams: TeamDoc[]) => void): Unsubscribe {
  return onSnapshot(collection(db, "teams"), (snap) =>
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as TeamDoc)))
  );
}
