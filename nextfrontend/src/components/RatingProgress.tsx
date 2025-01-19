import React from "react";
import { Progress } from "@/components/ui/progress";

interface RatingProgressProps {
  totalClips?: number;
  ratedClips?: number;
}

const RatingProgress = ({
  totalClips = 10,
  ratedClips = 0,
}: RatingProgressProps) => {
  const progressPercentage = (ratedClips / totalClips) * 100;

  return (
    <div className="w-full max-w-lg mx-auto space-y-2 bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-lg">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-muted-foreground">
          {ratedClips} of {totalClips} clips rated
        </span>
        <span className="text-sm font-bold bg-gradient-to-r from-pink-500 to-rose-500 text-transparent bg-clip-text">
          {Math.round(progressPercentage)}%
        </span>
      </div>
      <div className="h-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full overflow-hidden flex justify-end">
        <div
          className="h-full bg-gray-100 transition-all duration-300 ease-in-out"
          style={{ width: `${100 - Math.round(progressPercentage)}%` }}
        ></div>
      </div>
    </div>
  );
};

export default RatingProgress;
