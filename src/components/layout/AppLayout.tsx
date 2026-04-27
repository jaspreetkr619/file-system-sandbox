import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useLocation } from "react-router-dom";

const titleMap: Record<string, string> = {
  "/": "Dashboard",
  "/explorer": "File Explorer",
  "/recovery": "Recovery Centre",
  "/optimizer": "Optimizer",
  "/analytics": "Analytics",
  "/structure": "File System Structure",
  "/free-space": "Free Space",
  "/access": "File Access",
  "/cache": "Cache (LRU / FIFO)",
  "/journal": "Journaling",
};

export function AppLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const title = titleMap[pathname] ?? "File System Recovery & Optimization Tool";

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur">
            <SidebarTrigger />
            <div className="flex flex-col leading-tight">
              <h1 className="text-base font-semibold">{title}</h1>
              <p className="text-xs text-muted-foreground">File System Recovery &amp; Optimization Tool</p>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 animate-fade-in">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
