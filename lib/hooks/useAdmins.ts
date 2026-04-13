"use client";

import { useEffect, useState } from "react";
import { subscribeAdmins } from "@/lib/firebase/firestore";
import type { User } from "@/types";

export function useAdmins() {
  const [admins, setAdmins] = useState<User[]>([]);

  useEffect(() => {
    const unsub = subscribeAdmins(setAdmins);
    return unsub;
  }, []);

  return admins;
}
