"use client";

import { useEffect, useState } from "react";
import { subscribeRanking, subscribeTeams } from "@/lib/firebase/firestore";
import type { User, TeamDoc, RankedUser } from "@/types";

export function useRanking() {
  const [users, setUsers] = useState<RankedUser[]>([]);
  const [teams, setTeams] = useState<TeamDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let usersLoaded = false;
    let teamsLoaded = false;

    const unsub1 = subscribeRanking((rawUsers) => {
      const ranked = rawUsers.map((u, i) => ({ ...u, rank: i + 1 }));
      setUsers(ranked);
      usersLoaded = true;
      if (usersLoaded && teamsLoaded) setLoading(false);
    });

    const unsub2 = subscribeTeams((rawTeams) => {
      setTeams(rawTeams);
      teamsLoaded = true;
      if (usersLoaded && teamsLoaded) setLoading(false);
    });

    return () => { unsub1(); unsub2(); };
  }, []);

  return { users, teams, loading };
}
