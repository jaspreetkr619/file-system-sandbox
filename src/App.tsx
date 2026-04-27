import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FileSystemProvider } from "@/context/FileSystemContext";
import { AppLayout } from "@/components/layout/AppLayout";

import Dashboard from "./pages/Dashboard";
import FileExplorer from "./pages/FileExplorer";
import RecoveryCentre from "./pages/RecoveryCentre";
import Optimizer from "./pages/Optimizer";
import Analytics from "./pages/Analytics";
import FsStructure from "./pages/FsStructure";
import FreeSpace from "./pages/FreeSpace";
import FileAccess from "./pages/FileAccess";
import Cache from "./pages/Cache";
import Journaling from "./pages/Journaling";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <FileSystemProvider>
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/explorer" element={<FileExplorer />} />
              <Route path="/recovery" element={<RecoveryCentre />} />
              <Route path="/optimizer" element={<Optimizer />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/structure" element={<FsStructure />} />
              <Route path="/free-space" element={<FreeSpace />} />
              <Route path="/access" element={<FileAccess />} />
              <Route path="/cache" element={<Cache />} />
              <Route path="/journal" element={<Journaling />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </FileSystemProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
