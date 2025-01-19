"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Friend {
  id: string;
  name: string;
  avatar?: string;
  status: "online" | "offline";
  lastSeen?: string;
  points: number;
  clipCount: number;
}

interface FriendsProps {
  friends?: Friend[];
}

const Friends = ({
  friends = [
    {
      id: "1",
      name: "Alice",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
      status: "online",
      points: 1000,
      clipCount: 0,
    },
  ],
}: FriendsProps) => {
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
            VR Friends
          </h1>
        </div>
      </div>

      <div className="pt-24 px-4">
        <div className="max-w-lg mx-auto space-y-4">
          {friends.map((friend) => (
            <Link href={`/friends/${friend.id}`} key={friend.id}>
              <Card className="p-4 flex items-center space-x-4 hover:bg-black/5 transition-colors cursor-pointer">
                <div className="relative">
                  <Avatar className="h-12 w-12 border-2 border-white shadow-lg">
                    <AvatarImage src={friend.avatar} />
                    <AvatarFallback>{friend.name[0]}</AvatarFallback>
                  </Avatar>
                  <div
                    className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                      friend.status === "online"
                        ? "bg-green-500"
                        : "bg-gray-400"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">{friend.name}</h3>
                    <p className="text-sm font-semibold bg-gradient-to-r from-pink-500 to-rose-500 text-transparent bg-clip-text">
                      {friend.points} pts
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                      {friend.status === "online"
                        ? "Online"
                        : `Last seen ${friend.lastSeen}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {friend.clipCount} clips
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Friends;
