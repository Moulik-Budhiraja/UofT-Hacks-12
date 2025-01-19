import React, { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ArrowDown, ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VideoCardProps {
  id: string;
  videoUrl: string;
  timestamp?: string;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  onDrag?: (dragX: number) => void;
}

const VideoCard = ({
  id,
  videoUrl,
  onSwipeLeft = () => {},
  onSwipeRight = () => {},
  isPlaying = true,
  onTogglePlay = () => {},
  onDrag = () => {},
}: VideoCardProps) => {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration);
    }
  };

  const handleDragEnd = (event: any, info: any) => {
    const SWIPE_THRESHOLD = 100;
    setIsDragging(false);

    if (info.offset.x > SWIPE_THRESHOLD) {
      onSwipeRight();
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      onSwipeLeft();
    }
    setDragX(0);
  };

  const handleDrag = (e: any, info: any) => {
    const newDragX = info.offset.x;
    setDragX(newDragX);
    onDrag(newDragX);
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <motion.div
      className="relative w-full h-full bg-background"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragStart={() => setIsDragging(true)}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      animate={{ x: 0 }}
      whileDrag={{ scale: 1.02 }}
      transition={{ type: "spring", damping: 20 }}
    >
      <Card className="w-full h-full overflow-hidden relative rounded-xl shadow-2xl">
        {/* Video Player */}
        <div className="w-full h-full bg-black" onClick={onTogglePlay}>
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-cover"
            autoPlay={isPlaying}
            loop
            muted
            playsInline
            onTimeUpdate={handleTimeUpdate}
          />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 flex items-end">
          <div className="absolute w-full h-28 p-4 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white/80 backdrop-blur-sm">
              <img
                src={`/api/image/${id}`}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-white text-xl font-bold">{id}</div>
          </div>
        </div>

        {/* Swipe Indicators */}
        <AnimatePresence>
          {isDragging && (
            <>
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{
                  opacity: dragX > 0 ? Math.min(dragX / 100, 1) : 0,
                  scale: dragX > 0 ? 1 : 0.5,
                }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="absolute top-1/2 right-8 transform -translate-y-1/2"
              >
                <div className="w-24 h-24 rounded-full bg-green-500/20 backdrop-blur-sm flex items-center justify-center border-4 border-green-500 z-50">
                  <ArrowUp className="w-12 h-12 text-white" />
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{
                  opacity: dragX < 0 ? Math.min(-dragX / 100, 1) : 0,
                  scale: dragX < 0 ? 1 : 0.5,
                }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="absolute top-1/2 left-8 transform -translate-y-1/2"
              >
                <div className="w-24 h-24 rounded-full bg-red-500/20 backdrop-blur-sm flex items-center justify-center border-4 border-red-500 z-50">
                  <ArrowDown className="w-12 h-12 text-white" />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Video Progress Bar */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
          <div
            className="h-full bg-white/60 transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      </Card>
    </motion.div>
  );
};

export default VideoCard;
