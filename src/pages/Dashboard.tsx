/** Dashboard — high-level summary cards + recent activity. */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFs } from "@/context/FileSystemContext";
import { BlockGrid, BlockLegend } from "@/components/fs/BlockGrid";
import {
  Files,
  FileCheck2,
  Trash2,
  Database,
  CircleDashed,
  ShieldCheck,
} from "lucide-react";
import { ReactNode } from "react";
import { formatDistanceToNow } from "date-fns";

interface StatProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "success" | "warning" | "destructive" | "info";
}

const toneClass: Record<NonNullable<StatProps["tone"]>, string> = {
  default: "bg-secondary text-secondary-foreground",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
  info: "bg-info/10 text-info",
};

function Stat({ icon, label, value, hint, tone = "default" }: StatProps) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-md ${toneClass[tone]}`}>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const {
    files,
    activeFiles,
    deletedFiles,
    usedBlockCount,
    freeBlockCount,
    recoveryRate,
    journal,
  } = useFs();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Stat icon={<Files className="h-5 w-5" />} label="Total Files" value={files.length} tone="info" />
        <Stat icon={<FileCheck2 className="h-5 w-5" />} label="Active Files" value={activeFiles.length} tone="success" />
        <Stat icon={<Trash2 className="h-5 w-5" />} label="Deleted Files" value={deletedFiles.length} tone="destructive" />
        <Stat icon={<Database className="h-5 w-5" />} label="Used Blocks" value={usedBlockCount} tone="info" />
        <Stat icon={<CircleDashed className="h-5 w-5" />} label="Free Blocks" value={freeBlockCount} tone="success" />
        <Stat icon={<ShieldCheck className="h-5 w-5" />} label="Recovery Rate" value={`${recoveryRate}%`} tone="warning" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Disk Map</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <BlockGrid />
            <BlockLegend />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {journal.slice(0, 12).map((j) => (
              <div key={j.id} className="border-l-2 border-primary/40 pl-3">
                <p className="text-sm">{j.message}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(j.timestamp, { addSuffix: true })} · {j.type}
                </p>
              </div>
            ))}
            {journal.length === 0 && <p className="text-sm text-muted-foreground">No activity yet.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
