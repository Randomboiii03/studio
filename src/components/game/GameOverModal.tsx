"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import Leaderboard from "./Leaderboard";
import { useState } from "react";

interface GameOverModalProps {
  score: number;
  onRestart: () => void;
}

export default function GameOverModal({ score, onRestart }: GameOverModalProps) {
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  return (
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-10">
      <AlertDialog open={true}>
        <AlertDialogContent>
          {!showLeaderboard ? (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-center text-3xl text-primary tracking-wider">GAME OVER</AlertDialogTitle> Said another way, the firewall has been breached.
                <AlertDialogDescription className="text-center pt-4 text-lg">
                  Your final score is:
                  <p className="text-4xl font-bold text-primary py-2">{score.toLocaleString()}</p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="sm:justify-center gap-2">
                <Button onClick={onRestart} variant="default" className="w-full sm:w-auto shadow-[0_0_15px] shadow-primary/50">Play Again</Button>
                <Button onClick={() => setShowLeaderboard(true)} variant="outline" className="w-full sm:w-auto">View Leaderboard</Button>
              </AlertDialogFooter>
            </>
          ) : (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-center text-3xl text-accent tracking-wider">LEADERBOARD</AlertDialogTitle>
              </AlertDialogHeader>
              <Leaderboard />
              <AlertDialogFooter className="sm:justify-center">
                <Button onClick={() => setShowLeaderboard(false)} variant="outline">Back to Score</Button>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
