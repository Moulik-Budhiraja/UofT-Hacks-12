import React from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ScoresDashboard, { Person } from "./ScoresDashboard";
import Link from "next/link";

interface LeaderboardProps {
  people: Person[];
}

const Leaderboard = ({ people }: LeaderboardProps) => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-pink-100 to-rose-100 overflow-hidden">
      <div className="fixed top-0 left-0 right-0 z-10 bg-white/95 backdrop-blur-sm border-b">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center">
          <Link href="/">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-rose-50 hover:text-rose-500"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold ml-4 bg-gradient-to-r from-pink-500 to-rose-500 text-transparent bg-clip-text">
            Leaderboard
          </h1>
        </div>
      </div>

      <div className="pt-24 px-4">
        <div className="max-w-lg mx-auto">
          <ScoresDashboard people={people} />
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
