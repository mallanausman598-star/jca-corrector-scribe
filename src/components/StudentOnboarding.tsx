import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function StudentOnboarding({ open, onSubmit }: { open: boolean; onSubmit: (name: string) => void }) {
  const [name, setName] = useState("");
  const valid = name.trim().length >= 2;

  return (
    <Dialog open={open}>
      <DialogContent className="border-2 border-primary/40 sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <Sparkles className="h-7 w-7" />
          </div>
          <DialogTitle className="text-center text-2xl font-black">Welcome, Student!</DialogTitle>
          <DialogDescription className="text-center">
            Enter your name to start earning XP, badges, and climbing the leaderboard.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => { e.preventDefault(); if (valid) onSubmit(name.trim()); }}
          className="space-y-3 pt-2"
        >
          <Input
            autoFocus
            placeholder="Your name"
            value={name}
            maxLength={24}
            onChange={(e) => setName(e.target.value)}
            className="h-12 text-center text-lg font-semibold"
          />
          <Button type="submit" disabled={!valid} className="h-12 w-full text-base font-bold">
            Start Learning →
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
