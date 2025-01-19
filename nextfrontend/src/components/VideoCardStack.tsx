import React, { useState } from "react";
import VideoCard from "./VideoCard";
import { motion, AnimatePresence } from "framer-motion";
import { rateInteraction } from "@/functions/getVideos";

export type Video = {
  id: string;
  url: string;
  timestamp: string;
};

interface VideoCardStackProps {
  ratingUser: string;
  videos: Video[];
  onRate?: (videoId: string, rating: "like" | "dislike") => void;
}

const VideoCardStack = ({
  ratingUser,
  videos,
  onRate = () => {},
}: VideoCardStackProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentDragX, setCurrentDragX] = useState(0);

  const handleSwipeLeft = () => {
    if (currentIndex < videos.length) {
      onRate(videos[currentIndex].id, "dislike");
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleSwipeRight = () => {
    if (currentIndex < videos.length) {
      onRate(videos[currentIndex].id, "like");
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleDrag = (dragX: number) => {
    setCurrentDragX(dragX);
  };

  return (
    <div className="relative w-full aspect-[3/4] bg-transparent flex items-center justify-center">
      <div className="relative w-full h-full">
        <AnimatePresence mode="wait">
          {videos.slice(currentIndex, currentIndex + 1).map((video, index) => (
            <motion.div
              key={video.id}
              className="absolute top-0 left-0 w-full h-full"
              initial={{
                scale: index === 0 ? 1 : 0.95,
                y: index === 0 ? 0 : 8,
                rotate: index === 0 ? 0 : -2,
                opacity: index === 0 ? 1 : 0.7,
              }}
              animate={{
                scale: index === 0 ? 1 : 0.95,
                y: index === 0 ? 0 : 8,
                rotate: index === 0 ? currentDragX / 1000 : -2,
                opacity: index === 0 ? 1 : 0.7,
              }}
              exit={{
                x: currentDragX > 0 ? 1000 : -1000,
                rotate: currentDragX > 0 ? 20 : -20,
                opacity: 0,
              }}
              transition={{
                type: "spring",
                damping: 20,
                stiffness: 100,
              }}
              style={{
                zIndex: index === 0 ? 2 : 1,
              }}
            >
              <VideoCard
                id={video.id}
                videoUrl={video.url}
                timestamp={video.timestamp}
                onSwipeLeft={() => {
                  handleSwipeLeft();
                  rateInteraction(ratingUser, video.id, "dislike");
                }}
                onSwipeRight={() => {
                  handleSwipeRight();
                  rateInteraction(ratingUser, video.id, "like");
                }}
                isPlaying={index === 0 && isPlaying}
                onTogglePlay={handleTogglePlay}
                onDrag={handleDrag}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VideoCardStack;
