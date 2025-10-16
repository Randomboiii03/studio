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

interface GameOverModalProps {
  score: number;
  onRestart: () => void;
}

export default function GameOverModal({ score, onRestart }: GameOverModalProps) {

  return (
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-10">
      <AlertDialog open={true}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center text-3xl text-primary tracking-wider">GAME OVER</AlertDialogTitle>
            <AlertDialogDescription className="text-center pt-4 text-lg">
              Firewall breached. Your final score is:
              <div className="text-4xl font-bold text-primary py-2">{score.toLocaleString()}</div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-2">
            <Button onClick={onRestart} variant="default" className="w-full sm:w-auto shadow-[0_0_15px] shadow-primary/50">Play Again</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
