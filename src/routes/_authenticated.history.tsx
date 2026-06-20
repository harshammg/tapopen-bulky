import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { actions, useStore, type Campaign } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Trash2, History as HistoryIcon, X } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({ meta: [{ title: "History — WA Campaign Manager" }] }),
  component: HistoryPage,
});

function HistoryPage() {
  const history = useStore((s) => s.history);
  const [open, setOpen] = useState<Campaign | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">History</h1>
        <p className="text-sm text-muted-foreground">All your past campaign runs.</p>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <HistoryIcon className="h-4 w-4" /> Past campaigns
          </CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No campaigns yet. Run one from the Campaign Builder to see it here.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Contacts</TableHead>
                  <TableHead>Success rate</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="w-32" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((h) => {
                  const rate = h.total ? Math.round((h.sent / h.total) * 100) : 0;
                  return (
                    <TableRow key={h.id}>
                      <TableCell className="font-medium">{h.name || "Untitled"}</TableCell>
                      <TableCell className="text-muted-foreground">{new Date(h.createdAt).toLocaleString()}</TableCell>
                      <TableCell>{h.total}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${rate}%` }}
                              className="h-full bg-primary"
                            />
                          </div>
                          <span className="text-sm">{rate}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDuration(h.durationSec)}</TableCell>
                      <TableCell className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setOpen(h)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => actions.deleteHistory(h.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              {open?.name || "Campaign details"}
              <Button size="icon" variant="ghost" onClick={() => setOpen(null)}><X className="h-4 w-4" /></Button>
            </DialogTitle>
          </DialogHeader>
          {open && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Stat label="Total" value={open.total} />
                <Stat label="Sent" value={open.sent} tone="success" />
                <Stat label="Failed" value={open.failed} tone="destructive" />
                <Stat label="Duration" value={formatDuration(open.durationSec)} />
              </div>
              <div>
                <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Message</p>
                <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-xl border border-border/40 bg-secondary/40 p-3 text-xs">
                  {open.mode === "personalized" ? open.personalizedTemplate : open.commonTemplate}
                </pre>
              </div>
              <div>
                <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Contacts</p>
                <div className="max-h-48 overflow-y-auto rounded-xl border border-border/40 bg-secondary/40 p-3">
                  {open.contacts.map((c) => (
                    <div key={c.id} className="flex items-center justify-between border-b border-border/20 py-1 last:border-0">
                      <span>{c.name}</span>
                      <span className="font-mono text-xs text-muted-foreground">+{c.phone}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number | string; tone?: "success" | "destructive" }) {
  const c = tone === "success" ? "text-success" : tone === "destructive" ? "text-destructive" : "text-foreground";
  return (
    <div className="rounded-xl border border-border/40 bg-secondary/40 p-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`font-display text-lg font-bold ${c}`}>{value}</p>
    </div>
  );
}

function formatDuration(sec: number) {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s}s`;
}
