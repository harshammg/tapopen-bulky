import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, QrCode, Users, MessageSquare, Clock, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/how-it-works")({
  head: () => ({ meta: [{ title: "How it works - bulky by tapopen" }] }),
  component: HowItWorks,
});

function HowItWorks() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">How it works</h1>
        <p className="text-sm text-muted-foreground mt-2">A simple guide to using WA Manager for bulk messaging safely.</p>
      </div>

      <div className="grid gap-4">
        <StepCard 
          icon={<QrCode className="w-6 h-6 text-primary" />}
          title="1. Connect WhatsApp"
          description="Click 'Connect WhatsApp' on the main page and scan the QR code using your WhatsApp mobile app (via Linked Devices). Your session is stored locally and securely on your computer."
        />
        <StepCard 
          icon={<Users className="w-6 h-6 text-primary" />}
          title="2. Add Contacts"
          description="Upload a CSV or Excel file containing your contacts. Ensure the file has 'Name' and 'Phone' columns. Alternatively, you can add contacts manually one by one."
        />
        <StepCard 
          icon={<MessageSquare className="w-6 h-6 text-primary" />}
          title="3. Write your Message"
          description="Choose between a personalized message (using variables like {name} and {number}) or a common message that is the exact same for everyone."
        />
        <StepCard 
          icon={<Clock className="w-6 h-6 text-primary" />}
          title="4. Set Delays (Crucial)"
          description="To prevent your WhatsApp account from being flagged for spam or permanently banned, you MUST increase the delay times. Do not rush the messages! WA Manager sends messages in random batches with random delays. We highly recommend setting long, realistic human-like delays (e.g., waiting 15-30 seconds or more between small batches of 2-4 messages). The longer the delay, the safer your account is."
        />
        <StepCard 
          icon={<CheckCircle2 className="w-6 h-6 text-primary" />}
          title="5. Start Campaign"
          description="Hit start and watch the progress in real-time. You can pause, resume, or stop the campaign at any time. Keep this window open and your computer awake while the campaign runs."
        />
      </div>

      <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-5 mt-8 flex gap-4 items-start">
        <AlertTriangle className="w-6 h-6 text-destructive shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-destructive mb-1">Important Disclaimer</h3>
          <p className="text-sm text-destructive/90 leading-relaxed">
            This tool uses WhatsApp Web internally and is designed exclusively for personal, consent-based outreach. Sending unsolicited messages to people who don't know you, or sending messages too quickly with short delays, will trigger WhatsApp's spam filters and permanently ban your number. Always increase your delays significantly and only message people who expect to hear from you.
          </p>
        </div>
      </div>
    </div>
  );
}

function StepCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="glass overflow-hidden border-border/40">
      <CardContent className="p-6 flex gap-6 items-start">
        <div className="bg-primary/10 p-3 rounded-xl shrink-0 shadow-sm border border-primary/20">
          {icon}
        </div>
        <div>
          <h3 className="font-display font-semibold text-lg mb-1">{title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
