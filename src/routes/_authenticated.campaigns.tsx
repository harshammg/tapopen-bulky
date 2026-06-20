import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import {
  Upload, Plus, Trash2, Play, Pause, Square, Wifi, WifiOff, MessageSquare,
} from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { toast } from "sonner";

import { actions, randInt, renderTemplate, useStore, type Contact } from "@/lib/store";
import { pauseCampaign, resumeCampaign, startCampaign, stopCampaign } from "@/lib/campaign-runner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";

export const Route = createFileRoute("/_authenticated/campaigns")({
  head: () => ({ meta: [{ title: "Campaign Builder — WA Campaign Manager" }] }),
  component: CampaignBuilder,
});

const SAMPLE: Contact = { id: "sample", name: "Harsha", phone: "919999999999", status: "pending" };

function CampaignBuilder() {
  const draft = useStore((s) => s.draft);
  const connected = useStore((s) => s.connected);
  const running = useStore((s) => s.running);
  const paused = useStore((s) => s.paused);
  const progress = useStore((s) => s.progress);
  const logs = useStore((s) => s.logs);

  const fileRef = useRef<HTMLInputElement>(null);
  const [manualName, setManualName] = useState("");
  const [manualPhone, setManualPhone] = useState("");

  const sample = draft.contacts[0] ?? SAMPLE;
  const preview = useMemo(() => {
    return draft.mode === "personalized"
      ? renderTemplate(draft.personalizedTemplate, sample)
      : draft.commonTemplate;
  }, [draft.mode, draft.personalizedTemplate, draft.commonTemplate, sample]);

  function handleFile(file: File) {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext === "csv") {
      Papa.parse<Record<string, string>>(file, {
        header: true,
        skipEmptyLines: true,
        complete: ({ data }) => importRows(data),
      });
    } else if (ext === "xlsx" || ext === "xls") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const wb = XLSX.read(e.target?.result, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws);
        importRows(rows);
      };
      reader.readAsBinaryString(file);
    } else {
      toast.error("Please upload a CSV or Excel file");
    }
  }

  function importRows(rows: Record<string, string>[]) {
    const contacts: Contact[] = rows
      .map((r) => {
        const keys = Object.keys(r);
        const nameKey = keys.find((k) => /name/i.test(k)) ?? keys[0];
        const phoneKey = keys.find((k) => /phone|number|mobile/i.test(k)) ?? keys[1];
        const name = String(r[nameKey] ?? "").trim();
        const phone = String(r[phoneKey] ?? "").replace(/\D/g, "");
        if (!name || !phone) return null;
        return { id: crypto.randomUUID(), name, phone, status: "pending" as const };
      })
      .filter(Boolean) as Contact[];
    if (!contacts.length) {
      toast.error("No valid rows found. Expected columns: name, phone");
      return;
    }
    actions.setContacts([...draft.contacts, ...contacts]);
    toast.success(`Imported ${contacts.length} contacts`);
  }

  function addManual() {
    if (!manualName.trim() || !manualPhone.trim()) {
      toast.error("Name and phone are required");
      return;
    }
    actions.addContact({ name: manualName.trim(), phone: manualPhone.replace(/\D/g, "") });
    setManualName("");
    setManualPhone("");
  }

  function onStart() {
    if (!connected) { toast.error("Connect WhatsApp first"); return; }
    if (!draft.name.trim()) { toast.error("Give your campaign a name"); return; }
    if (draft.contacts.length === 0) { toast.error("Add at least one contact"); return; }
    void startCampaign();
    toast.success("Campaign started");
  }

  const pct = progress.total ? Math.round(((progress.sent + progress.failed) / progress.total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Campaign Builder</h1>
          <p className="text-sm text-muted-foreground">Compose, preview, and dispatch in human-paced batches.</p>
        </div>
        <ConnectionPill connected={connected} />
      </div>

      {/* Section 1 — Campaign name */}
      <Card className="glass">
        <CardHeader><CardTitle className="font-display">1. Campaign name</CardTitle></CardHeader>
        <CardContent>
          <Input
            placeholder="Medical Camp Invite"
            value={draft.name}
            onChange={(e) => actions.updateDraft({ name: e.target.value })}
          />
        </CardContent>
      </Card>

      {/* Section 2 — Contacts */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="font-display">2. Contacts</CardTitle>
          <p className="text-sm text-muted-foreground">CSV/Excel with <code>Name,Phone Number</code> columns, or add manually.</p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div
              className="group relative grid cursor-pointer place-items-center rounded-xl border-2 border-dashed border-border/60 p-8 transition hover:border-primary"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />
              <Upload className="h-8 w-8 text-muted-foreground group-hover:text-primary" />
              <p className="mt-3 text-sm font-medium">Drop CSV / Excel here</p>
              <p className="text-xs text-muted-foreground">or click to browse</p>
            </div>

            <div className="rounded-xl border border-border/50 bg-secondary/40 p-5">
              <p className="mb-3 text-sm font-medium">Add manually</p>
              <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <Input placeholder="Name" value={manualName} onChange={(e) => setManualName(e.target.value)} />
                <Input placeholder="Phone (with country code)" value={manualPhone} onChange={(e) => setManualPhone(e.target.value)} />
                <Button onClick={addManual} variant="secondary"><Plus className="h-4 w-4" /></Button>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Example:<br />
                <code className="text-foreground/80">Harsha,919999999999</code><br />
                <code className="text-foreground/80">Rahul,918888888888</code>
              </p>
            </div>
          </div>

          {draft.contacts.length > 0 && (
            <div className="rounded-xl border border-border/40 bg-secondary/30">
              <div className="flex items-center justify-between p-3 text-sm">
                <span>{draft.contacts.length} contacts</span>
                <Button size="sm" variant="ghost" onClick={() => actions.setContacts([])}>Clear all</Button>
              </div>
              <ScrollArea className="max-h-80">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone Number</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {draft.contacts.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell className="font-mono text-sm">+{c.phone}</TableCell>
                        <TableCell><StatusBadge status={c.status} /></TableCell>
                        <TableCell>
                          <Button size="icon" variant="ghost" onClick={() => actions.removeContact(c.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 3 — Message builder */}
      <Card className="glass">
        <CardHeader><CardTitle className="font-display">3. Message</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <RadioGroup
            value={draft.mode}
            onValueChange={(v) => actions.updateDraft({ mode: v as "personalized" | "common" })}
            className="grid gap-3 md:grid-cols-2"
          >
            <ModeOption value="personalized" current={draft.mode}
              title="Personalized message" desc="Use {name} and {number} variables." />
            <ModeOption value="common" current={draft.mode}
              title="One common message" desc="Send the same text to everyone." />
          </RadioGroup>

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="space-y-2">
              <Label>{draft.mode === "personalized" ? "Personalized template" : "Common message"}</Label>
              <Textarea
                rows={12}
                value={draft.mode === "personalized" ? draft.personalizedTemplate : draft.commonTemplate}
                onChange={(e) =>
                  actions.updateDraft(
                    draft.mode === "personalized"
                      ? { personalizedTemplate: e.target.value }
                      : { commonTemplate: e.target.value },
                  )
                }
                className="font-mono text-sm"
              />
              {draft.mode === "personalized" && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Variables:</span>
                  <Badge variant="outline">{"{name}"}</Badge>
                  <Badge variant="outline">{"{number}"}</Badge>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Live preview</Label>
              <div className="rounded-2xl border border-border/40 bg-[oklch(0.18_0.02_250)] p-4">
                <div className="ml-auto max-w-sm rounded-2xl rounded-tr-sm bg-primary/90 p-3 text-sm whitespace-pre-wrap text-primary-foreground shadow-md">
                  {preview || "Your message preview will appear here."}
                </div>
                <p className="mt-2 text-right text-xs text-muted-foreground">
                  Previewing as {sample.name}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 4 — Batch & delay */}
      <Card className="glass">
        <CardHeader><CardTitle className="font-display">4. Batch & delay</CardTitle></CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-2">
          <RangeBlock
            label="Batch size (random per cycle)"
            unit="contacts"
            min={1} max={20}
            valueMin={draft.batchMin} valueMax={draft.batchMax}
            onChange={(a, b) => actions.updateDraft({ batchMin: a, batchMax: b })}
            hint={`e.g. ${randInt(draft.batchMin, draft.batchMax)} → ${randInt(draft.batchMin, draft.batchMax)} → ${randInt(draft.batchMin, draft.batchMax)} users`}
          />
          <RangeBlock
            label="Delay between batches"
            unit="seconds"
            min={1} max={120}
            valueMin={draft.delayMin} valueMax={draft.delayMax}
            onChange={(a, b) => actions.updateDraft({ delayMin: a, delayMax: b })}
            hint={`e.g. ${randInt(draft.delayMin, draft.delayMax)}s → ${randInt(draft.delayMin, draft.delayMax)}s → ${randInt(draft.delayMin, draft.delayMax)}s`}
          />
        </CardContent>
      </Card>

      {/* Section 5 — Controls */}
      <Card className="glass">
        <CardHeader><CardTitle className="font-display">5. Sending controls</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-3">
            <Button
              variant={connected ? "secondary" : "default"}
              onClick={() => {
                actions.toggleConnected();
                toast.success(connected ? "Disconnected" : "WhatsApp connected (mock)");
              }}
              className={connected ? "" : "bg-primary text-primary-foreground hover:opacity-90"}
            >
              {connected ? <WifiOff className="mr-2 h-4 w-4" /> : <Wifi className="mr-2 h-4 w-4" />}
              {connected ? "Disconnect" : "Connect WhatsApp"}
            </Button>

            <Button onClick={onStart} disabled={running} className="bg-accent text-accent-foreground hover:opacity-90">
              <Play className="mr-2 h-4 w-4" /> Start campaign
            </Button>
            <Button onClick={pauseCampaign} disabled={!running || paused} variant="secondary">
              <Pause className="mr-2 h-4 w-4" /> Pause
            </Button>
            <Button onClick={resumeCampaign} disabled={!running || !paused} variant="secondary">
              <Play className="mr-2 h-4 w-4" /> Resume
            </Button>
            <Button onClick={stopCampaign} disabled={!running} variant="destructive">
              <Square className="mr-2 h-4 w-4" /> Stop
            </Button>
          </div>

          <ProgressPanel pct={pct} />

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-display text-base font-semibold">
                <MessageSquare className="h-4 w-4 text-accent" /> Live logs
              </h3>
              {logs.length > 0 && (
                <Button size="sm" variant="ghost" onClick={actions.clearLogs}>Clear</Button>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto rounded-xl border border-border/40 bg-secondary/30 p-3 font-mono text-sm">
              {logs.length === 0 ? (
                <p className="text-center text-muted-foreground">No activity yet.</p>
              ) : (
                <AnimatePresence initial={false}>
                  {logs.map((l) => (
                    <motion.div
                      key={l.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex gap-3 py-1"
                    >
                      <span className="w-20 shrink-0 text-xs text-muted-foreground">{l.time}</span>
                      <span className={toneClass(l.type)}>{l.message}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ConnectionPill({ connected }: { connected: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${connected ? "border-primary/40 bg-primary/10 text-primary" : "border-border/50 bg-secondary/40 text-muted-foreground"}`}>
      <span className={`h-2 w-2 rounded-full ${connected ? "bg-primary" : "bg-muted-foreground/50"}`} />
      {connected ? "WhatsApp Connected" : "Disconnected"}
    </span>
  );
}

function ModeOption({ value, current, title, desc }: { value: string; current: string; title: string; desc: string }) {
  const active = current === value;
  return (
    <Label
      htmlFor={`mode-${value}`}
      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${active ? "border-primary bg-primary/10" : "border-border/50 hover:border-primary/40"}`}
    >
      <RadioGroupItem id={`mode-${value}`} value={value} className="mt-1" />
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </Label>
  );
}

function RangeBlock({
  label, unit, min, max, valueMin, valueMax, onChange, hint,
}: {
  label: string; unit: string; min: number; max: number;
  valueMin: number; valueMax: number;
  onChange: (a: number, b: number) => void; hint: string;
}) {
  return (
    <div className="rounded-xl border border-border/40 bg-secondary/40 p-5">
      <div className="mb-4 flex items-center justify-between">
        <Label>{label}</Label>
        <span className="font-mono text-sm">{valueMin}–{valueMax} <span className="text-muted-foreground">{unit}</span></span>
      </div>
      <Slider
        min={min} max={max} step={1}
        value={[valueMin, valueMax]}
        onValueChange={(v) => onChange(Math.min(v[0], v[1]), Math.max(v[0], v[1]))}
      />
      <p className="mt-3 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function ProgressPanel({ pct }: { pct: number }) {
  const progress = useStore((s) => s.progress);
  const running = useStore((s) => s.running);
  const paused = useStore((s) => s.paused);

  return (
    <div className="grid items-center gap-6 rounded-2xl border border-border/40 bg-secondary/30 p-5 md:grid-cols-[auto_1fr]">
      <CircleProgress value={pct} />
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-display text-lg font-semibold">
            {running ? (paused ? "Paused" : "Campaign running") : "Idle"}
          </p>
          <span className="text-sm text-muted-foreground">{pct}% complete</span>
        </div>
        <Progress value={pct} className="h-2" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Total" value={progress.total} />
          <Stat label="Sent" value={progress.sent} tone="success" />
          <Stat label="Pending" value={progress.pending} tone="warning" />
          <Stat label="Failed" value={progress.failed} tone="destructive" />
        </div>
      </div>
    </div>
  );
}

function CircleProgress({ value }: { value: number }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative h-32 w-32">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={r} stroke="oklch(1 0 0 / 8%)" strokeWidth="8" fill="none" />
        <motion.circle
          cx="50" cy="50" r={r}
          stroke="var(--color-primary)" strokeWidth="8" fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          animate={{ strokeDashoffset: offset }}
          transition={{ type: "spring", stiffness: 80, damping: 20 }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="font-display text-2xl font-bold">{value}%</span>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "success" | "warning" | "destructive" }) {
  const c = tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : tone === "destructive" ? "text-destructive" : "text-foreground";
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`font-display text-xl font-bold ${c}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: Contact["status"] }) {
  const map: Record<Contact["status"], { label: string; cls: string }> = {
    pending: { label: "Pending", cls: "bg-muted text-muted-foreground" },
    sending: { label: "Sending", cls: "bg-accent/20 text-accent" },
    sent: { label: "Sent", cls: "bg-success/20 text-success" },
    failed: { label: "Failed", cls: "bg-destructive/20 text-destructive" },
  };
  const m = map[status];
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${m.cls}`}>{m.label}</span>;
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
