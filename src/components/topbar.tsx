import { RefreshCw, Menu, Send, History, HelpCircle, Github } from "lucide-react";
import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { socket } from "@/lib/socket";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link, useRouterState } from "@tanstack/react-router";

export function Topbar() {
  const connected = useStore((s) => s.connected);
  const running = useStore((s) => s.running);

  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <header className="glass sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/40 px-4 md:px-6">
      <div className="flex items-center gap-3">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-5 glass">
            <div className="flex flex-col h-full">
              <div className="mb-8">
                <h1 className="font-display text-2xl font-bold tracking-tight text-primary">bulky</h1>
                <p className="text-xs font-semibold text-muted-foreground mt-1">by tapopen</p>
              </div>
              <nav className="flex flex-col gap-2">
                <Link to="/" className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${pathname === "/" ? "bg-primary/15 text-foreground" : "text-muted-foreground"}`}>
                  <Send className="h-4 w-4" /> Bulk Messaging
                </Link>
                <Link to="/recent-campaigns" className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${pathname.startsWith("/recent-campaigns") ? "bg-primary/15 text-foreground" : "text-muted-foreground"}`}>
                  <History className="h-4 w-4" /> Recent Campaigns
                </Link>
                <Link to="/how-it-works" className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${pathname.startsWith("/how-it-works") ? "bg-primary/15 text-foreground" : "text-muted-foreground"}`}>
                  <HelpCircle className="h-4 w-4" /> How it works
                </Link>
              </nav>
            </div>
          </SheetContent>
        </Sheet>
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
        <Button 
          variant="ghost" 
          size="icon" 
          title="Refresh WhatsApp Session"
          onClick={() => {
            if (connected) {
              socket.emit("refresh_session");
              toast.info("Refreshing WhatsApp session...");
            } else {
              toast.error("Not connected to WhatsApp");
            }
          }}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
        <a href="https://github.com/harshammg/tapopen-bulky" target="_blank" rel="noopener noreferrer">
          <Button variant="ghost" size="icon" title="View on GitHub">
            <Github className="h-5 w-5" />
          </Button>
        </a>
      </div>
    </header>
  );
}
