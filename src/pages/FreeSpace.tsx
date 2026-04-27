/** Free Space — visualize disk blocks, update live. */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFs } from "@/context/FileSystemContext";
import { BlockGrid, BlockLegend } from "@/components/fs/BlockGrid";
import { Progress } from "@/components/ui/progress";

export default function FreeSpace() {
  const { totalBlocks, usedBlockCount, freeBlockCount, deletedBlockCount } = useFs();
  const usedPct = Math.round((usedBlockCount / totalBlocks) * 100);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatBox label="Total Blocks" value={totalBlocks} sub="4 KB each" />
        <StatBox label="Used" value={usedBlockCount} sub={`${usedPct}% of disk`} />
        <StatBox label="Free + Recoverable" value={freeBlockCount + deletedBlockCount} sub={`${freeBlockCount} free · ${deletedBlockCount} recoverable`} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Disk Utilization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={usedPct} />
          <div className="text-sm text-muted-foreground">
            {usedBlockCount} / {totalBlocks} blocks used.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Block Map</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <BlockGrid />
          <BlockLegend />
        </CardContent>
      </Card>
    </div>
  );
}

function StatBox({ label, value, sub }: { label: string; value: number; sub: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  );
}
