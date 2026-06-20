import { createFileRoute } from "@tanstack/react-router";
import { actions, useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Download, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — WA Campaign Manager" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const settings = useStore((s) => s.settings);
  const history = useStore((s) => s.history);
  const logs = useStore((s) => s.logs);

  function exportLogs() {
    const data = JSON.stringify({ logs, history }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wa-campaign-export-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export downloaded");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Defaults and workspace preferences.</p>
      </div>

      <Card className="glass">
        <CardHeader><CardTitle className="font-display">Defaults</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="mb-3 flex justify-between"><Label>Default batch size</Label>
              <span className="font-mono text-sm">{settings.defaultBatchMin}–{settings.defaultBatchMax}</span>
            </div>
            <Slider
              min={1} max={20} step={1}
              value={[settings.defaultBatchMin, settings.defaultBatchMax]}
              onValueChange={(v) => actions.updateSettings({ defaultBatchMin: Math.min(v[0], v[1]), defaultBatchMax: Math.max(v[0], v[1]) })}
            />
          </div>
          <div>
            <div className="mb-3 flex justify-between"><Label>Default delay (seconds)</Label>
              <span className="font-mono text-sm">{settings.defaultDelayMin}–{settings.defaultDelayMax}s</span>
            </div>
            <Slider
              min={1} max={120} step={1}
              value={[settings.defaultDelayMin, settings.defaultDelayMax]}
              onValueChange={(v) => actions.updateSettings({ defaultDelayMin: Math.min(v[0], v[1]), defaultDelayMax: Math.max(v[0], v[1]) })}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader><CardTitle className="font-display">Appearance</CardTitle></CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="font-medium">Dark mode</p>
            <p className="text-xs text-muted-foreground">This workspace is dark by default.</p>
          </div>
          <Switch checked disabled />
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader><CardTitle className="font-display">Data</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button onClick={exportLogs} variant="secondary"><Download className="mr-2 h-4 w-4" /> Export logs</Button>
          <Button
            variant="destructive"
            onClick={() => { history.forEach((h) => actions.deleteHistory(h.id)); toast.success("History cleared"); }}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete all campaigns
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
