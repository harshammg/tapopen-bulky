import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Send,
  Users,
  FileText,
  History,
  Settings as SettingsIcon,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Campaigns", url: "/campaigns", icon: Send },
  { title: "Contacts", url: "/contacts", icon: Users },
  { title: "Templates", url: "/templates", icon: FileText },
  { title: "History", url: "/history", icon: History },
  { title: "Settings", url: "/settings", icon: SettingsIcon },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  return (
    <aside className="glass sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-2 border-r border-border/40 p-5 md:flex">
      <Link to="/" className="mb-6 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-glow)]">
          <MessageCircle className="h-5 w-5" />
        </div>
        <div>
          <p className="font-display text-lg font-bold leading-none">WA Manager</p>
          <p className="text-xs text-muted-foreground">Personal outreach</p>
        </div>
      </Link>

      <nav className="flex flex-col gap-1">
        {items.map((item) => {
          const active = item.url === "/" ? pathname === "/" : pathname.startsWith(item.url);
          return (
            <Link
              key={item.url}
              to={item.url}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-primary/15 text-foreground"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
              )}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-y-1 left-0 w-1 rounded-full bg-primary"
                />
              )}
              <item.icon className={cn("h-4 w-4", active && "text-primary")} />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-xl border border-border/50 bg-secondary/40 p-3 text-xs text-muted-foreground">
        <p className="font-semibold text-foreground">Personal use only</p>
        <p className="mt-1">For consent-based outreach via your authenticated WhatsApp Web session.</p>
      </div>
    </aside>
  );
}
