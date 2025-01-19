"use client";

import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import VideoCardStack from "../VideoCardStack";
import RatingProgress from "../RatingProgress";
import EmptyState from "../EmptyState";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export type Clip = {
  id: string;
  url: string;
  timestamp: string;
  personId: string;
};

interface HomeClientProps {
  dailyClips: Clip[];
  ratingUser: string;
}

const HomeClient = ({ dailyClips, ratingUser }: HomeClientProps) => {
  const [ratedClips, setRatedClips] = useState<string[]>([]);

  console.log(dailyClips);

  const handleRate = async (videoId: string, rating: "like" | "dislike") => {
    try {
      setRatedClips((prev) => [...prev, videoId]);
    } catch (error) {
      console.error("Failed to rate video:", error);
      // Handle error appropriately
    }
  };

  const handleRefresh = () => {
    setRatedClips([]);
  };

  const remainingClips = dailyClips.length - ratedClips.length;

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
            Rate Clips
          </h1>
        </div>
      </div>

      <div className="pt-24 pb-20 px-4">
        <div className="max-w-lg mx-auto flex flex-col items-center gap-6">
          {remainingClips > 0 ? (
            <>
              <VideoCardStack
                ratingUser={ratingUser}
                videos={dailyClips}
                onRate={handleRate}
              />
              <div className="fixed bottom-6 left-4 right-4 z-10">
                <RatingProgress
                  totalClips={dailyClips.length}
                  ratedClips={ratedClips.length}
                />
              </div>
            </>
          ) : (
            <EmptyState onRefresh={handleRefresh} />
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeClient;
