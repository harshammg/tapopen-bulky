import { Bell, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { actions, useStore } from "@/lib/store";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Topbar() {
  const email = useStore((s) => s.authedEmail);
  const connected = useStore((s) => s.connected);
  const running = useStore((s) => s.running);
  const navigate = useNavigate();

  const initial = (email ?? "U").slice(0, 1).toUpperCase();

  return (
    <header className="glass sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/40 px-6">
      <div className="flex items-center gap-3">
        <motion.span
          animate={{ scale: connected ? [1, 1.15, 1] : 1 }}
          transition={{ repeat: connected ? Infinity : 0, duration: 2 }}
          className={`h-2.5 w-2.5 rounded-full ${connected ? "bg-primary shadow-[0_0_12px_var(--color-primary)]" : "bg-muted-foreground/50"}`}
        />
        <p className="text-sm">
          <span className="text-muted-foreground">WhatsApp:</span>{" "}
          <span className={connected ? "text-primary font-medium" : "text-muted-foreground"}>
            {connected ? "Connected" : "Disconnected"}
          </span>
          {running && <span className="ml-3 text-accent">• Campaign running</span>}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-accent" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full p-1 pr-3 hover:bg-white/5">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                  {initial}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm sm:inline">{email ?? "Guest"}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{email ?? "Signed out"}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                actions.logout();
                navigate({ to: "/login" });
              }}
            >
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
