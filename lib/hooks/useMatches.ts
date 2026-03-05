"use client";

import { useEffect, useState } from "react";
import { subscribeMatches, subscribeMatch } from "@/lib/firebase/firestore";
import type { Match, MatchStatus } from "@/types";

export function useMatches(filterStatus?: MatchStatus) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeMatches((all) => {
      setMatches(filterStatus ? all.filter((m) => m.status === filterStatus) : all);
      setLoading(false);
    });
    return unsub;
  }, [filterStatus]);

  return { matches, loading };
}

export function useMatch(matchId: string) {
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!matchId) return;
    const unsub = subscribeMatch(matchId, (m) => {
      setMatch(m);
      setLoading(false);
    });
    return unsub;
  }, [matchId]);

  return { match, loading };
}
