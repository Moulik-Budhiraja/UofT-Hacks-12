"use client";

import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Users, Trophy } from "lucide-react";

const Menu = () => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-pink-100 to-rose-100 overflow-hidden">
      <div className="container max-w-lg mx-auto px-4 py-12">
        <div className="space-y-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 text-transparent bg-clip-text">
            Halo and Horn
          </h1>

          <Card className="p-6 bg-white/95 backdrop-blur-sm">
            <div className="grid gap-4">
              <Link href="/rate">
                <Button
                  variant="outline"
                  className="w-full h-20 text-lg gap-3 hover:bg-rose-50 hover:text-rose-500"
                >
                  <Heart className="w-6 h-6" />
                  Rate Today's Interactions
                </Button>
              </Link>

              <Link href="/leaderboard">
                <Button
                  variant="outline"
                  className="w-full h-20 text-lg gap-3 hover:bg-rose-50 hover:text-rose-500"
                >
                  <Trophy className="w-6 h-6" />
                  View Leaderboard
                </Button>
              </Link>

              {/* <Link href="/friends">
                <Button
                  variant="outline"
                  className="w-full h-20 text-lg gap-3 hover:bg-rose-50 hover:text-rose-500"
                >
                  <Users className="w-6 h-6" />
                  Manage Friends
                </Button>
              </Link> */}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Menu;
