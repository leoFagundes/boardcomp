"use client";

import { teamColor, dicebearUrl } from "@/lib/utils/helpers";

interface Props {
  user: {
    name: string;
    team: string;
    avatarSeed?: string;
    avatarStyle?: string;
  };
  className?: string;
}

export default function UserAvatar({ user, className = "" }: Props) {
  const color = teamColor(user.team);

  if (user.avatarSeed) {
    return (
      <img
        src={dicebearUrl(user.avatarSeed, user.avatarStyle)}
        alt={user.name}
        className={`shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center font-bold shrink-0 ${className}`}
      style={{ background: color + "30", color }}
    >
      {user.name.charAt(0)}
    </div>
  );
}
