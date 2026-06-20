import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Loader2 } from "lucide-react";
import { actions, getState } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const searchSchema = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/login")({
  validateSearch: (s) => searchSchema.parse(s),
  beforeLoad: ({ search }) => {
    if (typeof window !== "undefined" && getState().authedEmail) {
      // already authed
      const to = search.redirect ?? "/";
      window.location.replace(to);
    }
  },
  head: () => ({
    meta: [
      { title: "Sign in — WA Campaign Manager" },
      { name: "description", content: "Sign in to your WA Campaign Manager workspace." },
    ],
  }),
  component: Login,
});

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = schema.safeParse({ email, password });
    if (!result.success) {
      setErr(result.error.issues[0].message);
      return;
    }
    setErr(null);
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    actions.login(email);
    toast.success("Welcome back");
    setLoading(false);
    navigate({ to: "/" });
    void remember;
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <div className="absolute inset-0 -z-10 opacity-60 [background:radial-gradient(circle_at_20%_20%,oklch(0.78_0.18_152/0.25),transparent_50%),radial-gradient(circle_at_80%_80%,oklch(0.72_0.15_230/0.25),transparent_50%)]" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass w-full max-w-md rounded-3xl p-8"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-[var(--shadow-glow)]">
            <MessageCircle className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">WA Campaign Manager</h1>
            <p className="text-xs text-muted-foreground">Personal outreach control room</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-muted-foreground">
              <Checkbox checked={remember} onCheckedChange={(v) => setRemember(Boolean(v))} />
              Remember me
            </label>
            <a className="text-accent hover:underline" href="#">Forgot?</a>
          </div>

          {err && <p className="text-sm text-destructive">{err}</p>}

          <Button type="submit" className="w-full bg-primary text-primary-foreground hover:opacity-90" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Personal-use demo. Any email + a 6+ character password works.
          </p>
        </form>
      </motion.div>
    </div>
  );
}
