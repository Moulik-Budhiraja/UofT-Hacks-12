import Leaderboard from "@/components/Leaderboard";
import { Person } from "@/components/ScoresDashboard";
import { prisma } from "@/db";
import { getVideos } from "@/functions/getVideos";
import { Prisma } from "@prisma/client";

type UserWithInteraction = Prisma.UserGetPayload<{
  include: {
    ReceivedInteractions: true;
  };
}>;

function calculatePoints(user: UserWithInteraction) {
  return user.ReceivedInteractions.reduce((acc, interaction) => {
    return acc + (interaction.pointOutcome || 0);
  }, 0);
}

function calculateAvgPointsPerDay(user: UserWithInteraction) {
  return user.ReceivedInteractions.reduce((acc, interaction) => {
    return acc + (interaction.pointOutcome || 0);
  }, 0);
}

function calculateBestStreak(user: UserWithInteraction) {
  // Calculate the best streak of consecutive upvotes
  let streak = 0;
  let maxStreak = 0;
  for (const interaction of user.ReceivedInteractions) {
    if (interaction.pointOutcome === 1) {
      streak++;
    } else {
      streak = 0;
    }
  }
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

export default async function LeaderboardPage() {
  const users = await prisma.user.findMany({
    include: {
      ReceivedInteractions: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  const people: Person[] = users.map((user) => {
    const streak =
      (hashString(user.name + "streak") %
        (hashString(user.name + "bestStreak") % 16)) -
      2;

    const lastRated = user.ReceivedInteractions[0]?.createdAt ?? new Date();

    return {
      id: user.name,
      name: user.name,
      avatar: `/api/image/${user.name}`,
      points: calculatePoints(user),
      clipCount: user.ReceivedInteractions.length,
      stats: {
        position: {
          current: 0,
          change: 0,
        },
        ytdPoints: 0,
        lastRating: {
          change: 0,
          timestamp: lastRated,
        },
        streak: {
          current: streak,
          direction: streak === 0 ? "none" : streak > 0 ? "up" : "down",
        },
        bestStreak: hashString(user.name + "bestStreak") % 16,
        avgPointsPerDay: (hashString(user.name + "avgPointsPerDay") % 7) - 2,
      },
    };
  });

  people.sort((a, b) => b.stats.ytdPoints - a.stats.ytdPoints);

  return <Leaderboard people={people} />;
}
