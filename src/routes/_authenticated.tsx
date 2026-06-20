import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { Topbar } from "@/components/topbar";
import { motion } from "framer-motion";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/_authenticated")({
  component: Layout,
});

function Layout() {
  const authed = useStore((s) => s.authedEmail);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authed) navigate({ to: "/login" });
  }, [authed, navigate]);

  if (!authed) {
    return (
      <div className="grid min-h-screen place-items-center">
        <p className="text-muted-foreground">Redirecting…</p>
      </div>
    );
  }

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
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
}
