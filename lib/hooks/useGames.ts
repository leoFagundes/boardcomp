"use client";

import { useEffect, useState } from "react";
import { subscribeGames } from "@/lib/firebase/firestore";
import type { Game } from "@/types";

export function useGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeGames((g) => {
      setGames(g);
      setLoading(false);
    });
    return unsub;
  }, []);

  return { games, loading };
}
