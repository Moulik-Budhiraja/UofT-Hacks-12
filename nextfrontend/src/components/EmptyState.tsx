import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  message?: string;
  onRefresh?: () => void;
}

const EmptyState = ({
  title = "All Caught Up!",
  message = "You've rated all your clips for today. Check back later for new content.",
  onRefresh = () => {},
}: EmptyStateProps) => {
  return (
    <div className="w-full aspect-[3/4] flex items-center justify-center">
      <Card className="p-8 flex flex-col items-center text-center space-y-6 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl max-w-sm mx-4">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 text-transparent bg-clip-text">
            {title}
          </h2>
          <p className="text-muted-foreground">{message}</p>
        </div>

        <Button
          variant="outline"
          onClick={onRefresh}
          className="rounded-full px-8 hover:bg-rose-50 hover:text-rose-500 transition-colors"
        >
          Check Again
        </Button>
      </Card>
    </div>
  );
};

export default EmptyState;
