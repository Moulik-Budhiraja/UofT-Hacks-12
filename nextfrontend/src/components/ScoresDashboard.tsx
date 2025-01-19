import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import {
  ArrowUp,
  ArrowDown,
  Minus,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

type Stats = {
  ytdPoints: number;
  lastRating: {
    change: number;
    timestamp: Date;
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

export type Person = {
  id: string;
  name: string;
  avatar?: string;
  points: number;
  clipCount: number;
  stats: Stats;
};

interface ScoresDashboardProps {
  people?: Person[];
}

const ScoresDashboard = ({ people = [] }: ScoresDashboardProps) => {
  const sortedPeople = [...people].sort((a, b) => b.points - a.points);

  return (
    <ScrollArea className="h-[calc(100vh-120px)]">
      <div className="space-y-4">
        {sortedPeople.map((person) => (
          <Card key={person.id} className="p-4 bg-white">
            <div className="flex items-start gap-4">
              {/* Position & Avatar */}
              <div className="flex items-center gap-3 ">
                <div className="text-center w-8">
                  <div className="text-xl font-bold">
                    {person.stats.position.current}
                  </div>
                  {person.stats.position.change !== 0 && (
                    <div
                      className={`text-xs ${
                        person.stats.position.change > 0
                          ? "text-green-500"
                          : "text-rose-500"
                      }`}
                    >
                      {person.stats.position.change > 0 ? "+" : ""}
                      {person.stats.position.change}
                    </div>
                  )}
                </div>
                <Avatar className="h-16 w-16 border-2 border-white shadow-lg">
                  <AvatarImage src={person.avatar} />
                  <AvatarFallback>{person.name[0]}</AvatarFallback>
                </Avatar>
              </div>

              {/* Main Stats */}
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{person.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 text-transparent bg-clip-text">
                        {person.points}
                      </span>
                      {person.stats.lastRating.change !== 0 && (
                        <span
                          className={`flex items-center text-sm ${
                            person.stats.lastRating.change > 0
                              ? "text-green-500"
                              : "text-rose-500"
                          }`}
                        >
                          {person.stats.lastRating.change > 0 ? (
                            <ArrowUp className="w-4 h-4" />
                          ) : (
                            <ArrowDown className="w-4 h-4" />
                          )}
                          {Math.abs(person.stats.lastRating.change)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <div>Last rated</div>
                    <div>
                      {formatDistanceToNow(person.stats.lastRating.timestamp)}{" "}
                      ago
                    </div>
                  </div>
                </div>

                {/* Detailed Stats */}
                <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Streak</div>
                    <div className="flex items-center gap-1">
                      {person.stats.streak.direction === "up" ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : person.stats.streak.direction === "down" ? (
                        <TrendingDown className="w-4 h-4 text-rose-500" />
                      ) : (
                        <Minus className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className="font-medium">
                        {person.stats.streak.current}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Avg/Day</div>
                    <div className="font-medium">
                      {Math.round(person.stats.avgPointsPerDay)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Best Streak</div>
                    <div className="font-medium">{person.stats.bestStreak}</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};

export default ScoresDashboard;
