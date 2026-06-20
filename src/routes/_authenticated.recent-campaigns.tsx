import { createFileRoute } from "@tanstack/react-router";
import { useStore, actions, type Campaign } from "@/lib/store";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Clock, CheckCircle2, XCircle, Eye } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_authenticated/recent-campaigns")({
  head: () => ({ meta: [{ title: "Recent Campaigns — WA Campaign Manager" }] }),
  component: RecentCampaigns,
});

function RecentCampaigns() {
  const history = useStore((s) => s.history);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  function formatDuration(sec: number) {
    if (sec < 60) return `${sec}s`;
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Recent Campaigns</h1>
          <p className="text-sm text-muted-foreground mt-2">View the history of your completed bulk messaging campaigns.</p>
        </div>
      </div>

      <Card className="glass">
        <CardHeader className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="font-display">Campaign History</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Data is stored locally in your browser.</p>
          </div>
          {history.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Clear All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear Campaign History?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to clear all history? This permanently deletes the logs from your browser and cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => actions.clearHistory()}>
                    Yes, clear history
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No recent campaigns found.</p>
            </div>
          ) : (
            <ScrollArea className="h-[600px] w-full rounded-md border border-border/40 bg-secondary/30">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead className="w-20 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((campaign, idx) => {
                    if (!campaign) return null;
                    const date = campaign.createdAt ? new Date(campaign.createdAt) : new Date();
                    return (
                      <TableRow key={campaign.id || idx}>
                        <TableCell className="font-medium">
                          {campaign.name || "Untitled Campaign"}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm">{date.toLocaleDateString()}</span>
                            <span className="text-xs text-muted-foreground">{date.toLocaleTimeString()}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1 text-success">
                              <CheckCircle2 className="w-4 h-4" /> {campaign.sent || 0}
                            </span>
                            <span className="flex items-center gap-1 text-destructive">
                              <XCircle className="w-4 h-4" /> {campaign.failed || 0}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              / {campaign.total || 0} total
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" /> {formatDuration(campaign.durationSec || 0)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setSelectedCampaign(campaign)}
                            title="View campaign details"
                          >
                            <Eye className="w-4 h-4 text-primary" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => actions.deleteHistory(campaign.id)}
                            title="Delete campaign history"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedCampaign} onOpenChange={(open) => { if (!open) setSelectedCampaign(null); }}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">{selectedCampaign?.name || "Untitled Campaign"}</DialogTitle>
          </DialogHeader>
          
          {selectedCampaign && (
            <div className="flex-1 overflow-hidden flex flex-col gap-6 mt-2">
              <div>
                <h3 className="text-sm font-semibold mb-2">Message Template Used</h3>
                <div className="bg-secondary/30 border border-border/40 p-4 rounded-xl whitespace-pre-wrap text-sm font-mono max-h-40 overflow-y-auto">
                  {selectedCampaign.mode === "personalized" ? selectedCampaign.personalizedTemplate : selectedCampaign.commonTemplate}
                </div>
                <div className="mt-2 text-xs text-muted-foreground flex gap-4">
                  <Badge variant="outline">Mode: {selectedCampaign.mode}</Badge>
                  <Badge variant="outline">Batch: {selectedCampaign.batchMin}-{selectedCampaign.batchMax}</Badge>
                  <Badge variant="outline">Delay: {selectedCampaign.delayMin}s-{selectedCampaign.delayMax}s</Badge>
                </div>
              </div>

              <div className="flex-1 flex flex-col min-h-0 border border-border/40 rounded-xl bg-secondary/30">
                <div className="p-3 border-b border-border/40 font-semibold text-sm bg-background/50">
                  Contacts Processed ({selectedCampaign.contacts?.length || 0})
                </div>
                <ScrollArea className="flex-1">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Final Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(selectedCampaign.contacts || []).map((c, idx) => (
                        <TableRow key={c.id || idx}>
                          <TableCell className="font-medium">{c.name || "Unknown"}</TableCell>
                          <TableCell className="font-mono text-xs">+{c.phone || "Unknown"}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={
                              c.status === "sent" ? "border-success text-success bg-success/10" :
                              c.status === "failed" ? "border-destructive text-destructive bg-destructive/10" :
                              "border-muted text-muted-foreground"
                            }>
                              {c.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
