"use client";

import { Suspense, useEffect, useState } from "react";
import Menu from "./Menu";

const POINTS_PER_RATING = 50;
const INITIAL_POINTS = 1000;

type PointHistory = {
  timestamp: string;
  points: number;
  change: number;
  reason: string;
};

type Person = {
  id: string;
  name: string;
  points: number;
  clipCount: number;
  avatar?: string;
  pointHistory: PointHistory[];
  stats: {
    ytdPoints: number;
    lastRating: {
      change: number;
      timestamp: string;
    };
    streak: {
      current: number;
      direction: "up" | "down" | "none";
    };
    bestStreak: number;
    avgPointsPerDay: number;
    position: {
      current: number;
      change: number;
    };
  };
};

const videos = [
  { id: "1", url: "https://example.com/video1.mp4", timestamp: "00:30" },
  { id: "2", url: "https://example.com/video1.mp4", timestamp: "00:30" },
  { id: "3", url: "https://example.com/video2.mp4", timestamp: "01:15" },
  { id: "4", url: "https://example.com/video2.mp4", timestamp: "01:15" },
  { id: "5", url: "https://example.com/video3.mp4", timestamp: "02:00" },
  { id: "6", url: "https://example.com/video3.mp4", timestamp: "02:00" },
];

export default function HomePageClient() {
  // ... all the state and effects from the original file ...
  const [people, setPeople] = useState<Person[]>([
    // ... initial people state ...
  ]);

  const [dailyClips, setDailyClips] = useState<
    Array<{ id: string; url: string; timestamp: string; personId: string }>
  >([]);

  // ... keep all the useEffects and handler functions ...

  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full bg-gradient-to-b from-pink-100 to-rose-100 flex items-center justify-center">
          <p className="text-lg font-medium text-rose-500">Loading...</p>
        </div>
      }
    >
      <Menu />
    </Suspense>
  );
}
