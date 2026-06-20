import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { Topbar } from "@/components/topbar";
import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { initSocket } from "@/lib/socket";

export const Route = createFileRoute("/_authenticated")({
  component: Layout,
});

function Layout() {
  const authed = useStore((s) => s.authedEmail);
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) initSocket();
  }, [mounted]);

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex-1 p-6 md:p-8"
        >
          {mounted ? <Outlet /> : <p className="text-muted-foreground">Loading…</p>}
        </motion.main>
      </div>
    </div>
  );
}
