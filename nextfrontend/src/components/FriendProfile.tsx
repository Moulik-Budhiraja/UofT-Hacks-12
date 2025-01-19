import React from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";

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
};

interface FriendProfileProps {
  people: Person[];
}

const FriendProfile = ({ people }: FriendProfileProps) => {
  const { id } = useParams();
  const friend = people.find((p) => p.id === id);

  if (!friend) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-pink-100 to-rose-100 flex items-center justify-center">
        <p className="text-lg font-medium text-rose-500">Friend not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-pink-100 to-rose-100 overflow-hidden">
      <div className="fixed top-0 left-0 right-0 z-10 bg-white/95 backdrop-blur-sm border-b">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center">
          <Link to="/friends">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-rose-50 hover:text-rose-500"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold ml-4 bg-gradient-to-r from-pink-500 to-rose-500 text-transparent bg-clip-text">
            {friend.name}'s Profile
          </h1>
        </div>
      </div>

      <div className="pt-24 px-4 pb-8">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Profile Header */}
          <Card className="p-6 flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24 border-4 border-white shadow-xl">
              <AvatarImage src={friend.avatar} />
              <AvatarFallback>{friend.name[0]}</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h2 className="text-2xl font-bold">{friend.name}</h2>
              <p className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 text-transparent bg-clip-text">
                {friend.points} points
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {friend.clipCount} clips rated
              </p>
            </div>
          </Card>

          {/* Point History */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold px-1">Recent Activity</h3>
            <div className="space-y-3">
              {friend.pointHistory
                .slice()
                .reverse()
                .map((history, index) => (
                  <Card
                    key={index}
                    className="p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">{history.reason}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(history.timestamp), "MMM d, h:mm a")}
                      </p>
                    </div>
                    <div
                      className={`text-sm font-semibold ${history.change > 0 ? "text-green-500" : "text-rose-500"}`}
                    >
                      {history.change > 0 ? "+" : ""}
                      {history.change} pts
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendProfile;
