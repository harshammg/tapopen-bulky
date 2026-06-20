import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { actions, useStore, type MessageMode } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Trash2, FileText } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/templates")({
  head: () => ({ meta: [{ title: "Templates — WA Campaign Manager" }] }),
  component: TemplatesPage,
});

function TemplatesPage() {
  const templates = useStore((s) => s.templates);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [mode, setMode] = useState<MessageMode>("personalized");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Templates</h1>
        <p className="text-sm text-muted-foreground">Reusable message bodies for your campaigns.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass">
          <CardHeader><CardTitle className="font-display">New template</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input placeholder="e.g. Workshop reminder" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Mode</Label>
              <RadioGroup value={mode} onValueChange={(v) => setMode(v as MessageMode)} className="flex gap-4">
                <Label className="flex items-center gap-2"><RadioGroupItem value="personalized" /> Personalized</Label>
                <Label className="flex items-center gap-2"><RadioGroupItem value="common" /> Common</Label>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label>Body</Label>
              <Textarea rows={8} value={body} onChange={(e) => setBody(e.target.value)} className="font-mono text-sm" />
            </div>
            <Button
              className="bg-primary text-primary-foreground hover:opacity-90"
              onClick={() => {
                if (!name.trim() || !body.trim()) { toast.error("Name and body are required"); return; }
                actions.saveTemplate(name.trim(), body, mode);
                setName(""); setBody("");
                toast.success("Template saved");
              }}
            >
              Save template
            </Button>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display">
              <FileText className="h-4 w-4" /> Saved templates ({templates.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {templates.length === 0 && <p className="text-sm text-muted-foreground">No templates yet.</p>}
            {templates.map((t) => (
              <div key={t.id} className="rounded-xl border border-border/40 bg-secondary/40 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{t.mode}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => {
                      actions.updateDraft(
                        t.mode === "personalized"
                          ? { personalizedTemplate: t.body, mode: "personalized" }
                          : { commonTemplate: t.body, mode: "common" },
                      );
                      toast.success("Loaded into campaign draft");
                    }}>Use</Button>
                    <Button size="icon" variant="ghost" onClick={() => actions.deleteTemplate(t.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <pre className="mt-3 max-h-32 overflow-y-auto whitespace-pre-wrap rounded-lg bg-background/60 p-3 text-xs">{t.body}</pre>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
