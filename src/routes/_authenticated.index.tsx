import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Send,
  CheckCircle2,
  Clock,
  XCircle,
  Plug,
  ArrowRight,
  Activity,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({ meta: [{ title: "Dashboard — WA Campaign Manager" }] }),
  component: Dashboard,
});

function StatCard({
  label,
  value,
  icon: Icon,
  tint,
  delay,
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  tint: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <Card className="glass hover-lift overflow-hidden">
        <CardContent className="flex items-center gap-4 p-5">
          <div className={`grid h-12 w-12 place-items-center rounded-xl ${tint}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm text-muted-foreground">{label}</p>
            <p className="font-display text-2xl font-bold">{value}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function Dashboard() {
  const history = useStore((s) => s.history);
  const progress = useStore((s) => s.progress);
  const connected = useStore((s) => s.connected);
  const logs = useStore((s) => s.logs);
  const running = useStore((s) => s.running);

  const totalCampaigns = history.length;
  const totalSent = history.reduce((a, h) => a + h.sent, 0) + progress.sent;
  const totalFailed = history.reduce((a, h) => a + h.failed, 0) + progress.failed;
  const pending = progress.pending;
  const pct = progress.total ? Math.round(((progress.sent + progress.failed) / progress.total) * 100) : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back</p>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Your <span className="gradient-text">campaign control room</span>
          </h1>
        </div>
        <Link to="/campaigns">
          <Button className="bg-primary text-primary-foreground hover:opacity-90">
            New campaign <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total Campaigns" value={totalCampaigns} icon={Send} tint="bg-primary/20 text-primary" delay={0.0} />
        <StatCard label="Messages Sent" value={totalSent} icon={CheckCircle2} tint="bg-success/20 text-success" delay={0.05} />
        <StatCard label="Pending Messages" value={pending} icon={Clock} tint="bg-warning/20 text-warning" delay={0.1} />
        <StatCard label="Failed Messages" value={totalFailed} icon={XCircle} tint="bg-destructive/20 text-destructive" delay={0.15} />
        <StatCard
          label="WhatsApp"
          value={connected ? "Connected" : "Offline"}
          icon={Plug}
          tint={connected ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"}
          delay={0.2}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="glass lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display">Current run</CardTitle>
            <span className="text-sm text-muted-foreground">
              {running ? "Live" : "Idle"}
            </span>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{pct}%</span>
            </div>
            <Progress value={pct} className="h-2.5" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Mini label="Total" value={progress.total} />
              <Mini label="Sent" value={progress.sent} tone="success" />
              <Mini label="Pending" value={progress.pending} tone="warning" />
              <Mini label="Failed" value={progress.failed} tone="destructive" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display">
              <Activity className="h-4 w-4 text-accent" /> Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity yet. Start a campaign to see live logs.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {logs.slice(0, 7).map((l) => (
                  <li key={l.id} className="flex items-start gap-3">
                    <span className="w-14 shrink-0 font-mono text-xs text-muted-foreground">{l.time}</span>
                    <span className={toneClass(l.type)}>{l.message}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Mini({ label, value, tone }: { label: string; value: number; tone?: "success" | "warning" | "destructive" }) {
  const colour =
    tone === "success" ? "text-success" :
    tone === "warning" ? "text-warning" :
    tone === "destructive" ? "text-destructive" : "text-foreground";
  return (
    <div className="rounded-xl border border-border/40 bg-secondary/40 p-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`font-display text-xl font-bold ${colour}`}>{value}</p>
    </div>
  );
}

function toneClass(t: string) {
  switch (t) {
    case "success": return "text-success";
    case "waiting": return "text-warning";
    case "failed": return "text-destructive";
    case "sending": return "text-accent";
    default: return "text-foreground";
  }
}
