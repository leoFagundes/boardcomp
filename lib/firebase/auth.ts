import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./config";
import type { RegisterDTO, User } from "@/types";

export async function registerUser(dto: RegisterDTO): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, dto.email, dto.password);
  const { uid } = credential.user;

  const userData: User = {
    uid,
    name: dto.name,
    email: dto.email,
    team: dto.team,
    role: "user",
    points: 0,
    wins: 0,
    createdAt: serverTimestamp() as any,
  };

  await setDoc(doc(db, "users", uid), userData);

  // Increment team member count
  const teamRef = doc(db, "teams", dto.team);
  const teamSnap = await getDoc(teamRef);
  if (teamSnap.exists()) {
    await setDoc(teamRef, { memberCount: (teamSnap.data().memberCount || 0) + 1 }, { merge: true });
  } else {
    await setDoc(teamRef, {
      id: dto.team,
      name: dto.team === "antigos" ? "Funcionários Antigos" : "Funcionários Novos",
      points: 0,
      wins: 0,
      memberCount: 1,
    });
  }

  return userData;
}

export async function loginUser(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(auth, email, password);
}

export async function logoutUser(): Promise<void> {
  await firebaseSignOut(auth);
}

export async function getUserData(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return snap.data() as User;
}

export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}
