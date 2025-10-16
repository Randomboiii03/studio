"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MOCK_LEADERBOARD } from "@/lib/game-data";

export default function Leaderboard() {
  return (
    <div className="max-h-96 overflow-y-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px] text-accent">Rank</TableHead>
            <TableHead className="text-accent">Operator</TableHead>
            <TableHead className="text-right text-accent">Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {MOCK_LEADERBOARD.map((entry) => (
            <TableRow key={entry.rank} className="font-mono">
              <TableCell className="font-medium">{entry.rank}</TableCell>
              <TableCell>{entry.name}</TableCell>
              <TableCell className="text-right">{entry.score.toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
