import { Timestamp } from "firebase/firestore";

export type Team = "antigos" | "novos";
export type UserRole = "user" | "admin";
export type MatchStatus = "waiting" | "active" | "finished";

export interface User {
  uid: string;
  name: string;
  email: string;
  team: Team;
  role: UserRole;
  points: number;
  wins: number;
  createdAt: Timestamp;
}

export interface Game {
  id: string;
  name: string;
  description?: string;
  minPlayers: number;
  maxPlayers: number;
  pointValue: number;
  createdBy: string;
  createdAt: Timestamp;
}

export interface Match {
  id: string;
  gameId: string;
  gameName: string;
  pointValue: number;
  status: MatchStatus;
  players: string[];
  winners: string[];
  createdAt: Timestamp;
  startedAt?: Timestamp;
  finishedAt?: Timestamp;
}

export interface TeamDoc {
  id: Team;
  name: string;
  points: number;
  wins: number;
  memberCount: number;
}

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  team: Team;
}

export interface CreateGameDTO {
  name: string;
  description?: string;
  minPlayers: number;
  maxPlayers: number;
  pointValue: number;
}

export interface CreateMatchDTO {
  gameId: string;
  gameName: string;
  pointValue: number;
}

export interface FinalizeMatchDTO {
  matchId: string;
  winnerIds: string[];
}

export interface RankedUser extends User {
  rank: number;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (dto: RegisterDTO) => Promise<void>;
  signOut: () => Promise<void>;
}
