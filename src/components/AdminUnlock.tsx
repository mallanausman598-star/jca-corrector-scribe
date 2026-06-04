import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ShieldCheck, KeyRound, LogOut } from "lucide-react";
import { getRole, unlockAdmin, logoutAdmin, type Role } from "@/lib/auth";
import { toast } from "sonner";

export function AdminUnlock({ onChange }: { onChange?: (role: Role) => void }) {
  const [role, setRole] = useState<Role>("student");
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");

  useEffect(() => {
    const r = getRole();
    setRole(r);
    onChange?.(r);
  }, [onChange]);

  function tryUnlock() {
    if (unlockAdmin(code)) {
      setRole("admin");
      onChange?.("admin");
      setOpen(false);
      setCode("");
      toast.success("Admin unlocked. You can now see the full leaderboard.");
    } else {
      toast.error("Wrong passcode");
    }
  }

  function signOutAdmin() {
    logoutAdmin();
    setRole("student");
    onChange?.("student");
    toast.success("Admin signed out");
  }

  if (role === "admin") {
    return (
      <Button variant="outline" size="sm" onClick={signOutAdmin} className="gap-1.5 font-bold">
        <ShieldCheck className="h-4 w-4 text-primary" />
        <span className="hidden sm:inline">Admin</span>
        <LogOut className="h-3.5 w-3.5 opacity-70" />
      </Button>
    );
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)} className="gap-1.5" aria-label="Admin login">
        <KeyRound className="h-4 w-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Admin Sign-in</DialogTitle>
            <DialogDescription>
              Enter the admin passcode to view the full student leaderboard.
            </DialogDescription>
          </DialogHeader>
          <Input
            type="password"
            placeholder="Passcode"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && tryUnlock()}
            autoFocus
          />
          <Button onClick={tryUnlock} className="font-bold">Unlock</Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
