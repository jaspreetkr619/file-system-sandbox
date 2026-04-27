/** Optimizer — fragmentation/duplicates/wasted blocks + Optimize button. */
import { useFs } from "@/context/FileSystemContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BlockGrid, BlockLegend } from "@/components/fs/BlockGrid";
import { Gauge, Copy, Database } from "lucide-react";
import { toast } from "sonner";

export default function Optimizer() {
  const { optimizer, optimize, journal } = useFs();
  const optimizeLogs = journal.filter((j) => j.type === "optimize").slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard icon={<Gauge className="h-5 w-5" />} label="Fragmentation" value={`${optimizer.fragmentation}%`} progress={optimizer.fragmentation} />
        <MetricCard icon={<Copy className="h-5 w-5" />} label="Duplicate Files" value={optimizer.duplicates} />
        <MetricCard icon={<Database className="h-5 w-5" />} label="Wasted Blocks" value={optimizer.wastedBlocks} />
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Run Optimization</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Defragments the disk by compacting used blocks toward the start of the volume,
              then removes duplicate file references.
            </p>
          </div>
          <Button onClick={() => { optimize(); toast.success("Optimization complete"); }}>
            <Gauge className="mr-2 h-4 w-4" />Optimize Now
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <BlockGrid />
          <BlockLegend />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Optimization Log</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {optimizeLogs.length === 0 && (
            <p className="text-sm text-muted-foreground">No optimization runs yet.</p>
          )}
          {optimizeLogs.map((j) => (
            <div key={j.id} className="rounded border border-border bg-muted/30 p-2 text-sm">
              {j.message}
              <span className="ml-2 text-xs text-muted-foreground">
                {new Date(j.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ icon, label, value, progress }: { icon: React.ReactNode; label: string; value: string | number; progress?: number }) {
  return (
    <Card>
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
          <div className="text-primary">{icon}</div>
        </div>
        <p className="text-2xl font-semibold">{value}</p>
        {progress !== undefined && <Progress value={progress} />}
      </CardContent>
    </Card>
  );
}
