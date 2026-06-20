import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { Topbar } from "@/components/topbar";
import { motion } from "framer-motion";
import { getState } from "@/lib/store";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ location }) => {
    if (typeof window === "undefined") return;
    if (!getState().authedEmail) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  component: Layout,
});

function Layout() {
  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <motion.main
          key={typeof window !== "undefined" ? window.location.pathname : ""}
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
