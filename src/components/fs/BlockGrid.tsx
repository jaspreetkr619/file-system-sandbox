/**
 * BlockGrid — Visualizes the disk as a grid of colored blocks.
 * Used by Free Space, Optimizer, and Dashboard mini-view.
 */
import { useFs, BlockState } from "@/context/FileSystemContext";
import { cn } from "@/lib/utils";

interface BlockGridProps {
  highlight?: number[]; // optional set of block indices to emphasize
  compact?: boolean;
}

const colorClass = (s: BlockState) => {
  switch (s) {
    case "free": return "block-free";
    case "used": return "block-used";
    case "deleted": return "block-deleted";
    case "system": return "block-system";
  }
};

export function BlockGrid({ highlight, compact = false }: BlockGridProps) {
  const { blocks } = useFs();
  const set = new Set(highlight ?? []);
  return (
    <div
      className={cn(
        "grid gap-1",
        compact ? "grid-cols-32" : "grid-cols-16",
      )}
      style={{ gridTemplateColumns: `repeat(${compact ? 32 : 16}, minmax(0, 1fr))` }}
    >
      {blocks.map((b, i) => (
        <div
          key={i}
          title={`Block #${i} — ${b}`}
          className={cn(
            "block-cell",
            colorClass(b),
            set.has(i) && "ring-2 ring-offset-1 ring-warning",
            compact && "h-3 w-3",
          )}
        />
      ))}
    </div>
  );
}

export function BlockLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
      <LegendDot className="block-free" label="Free" />
      <LegendDot className="block-used" label="Used" />
      <LegendDot className="block-deleted" label="Deleted / Recoverable" />
      <LegendDot className="block-system" label="System reserved" />
    </div>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("inline-block h-3 w-3 rounded-sm", className)} />
      {label}
    </span>
  );
}
