/**
 * File Access — Sequential / Direct / Indexed access simulation
 * with block traversal visualization and trace output.
 */
import { useState } from "react";
import { useFs } from "@/context/FileSystemContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

type Method = "sequential" | "direct" | "indexed";

interface RunResult {
  method: Method;
  trace: string[];
  visited: number[];
  blocksRead: number;
}

export default function FileAccess() {
  const { activeFiles, log } = useFs();
  const fileFiles = activeFiles.filter((f) => f.type === "file" && f.blocks.length > 0);

  const [method, setMethod] = useState<Method>("sequential");
  const [fileId, setFileId] = useState<string>(fileFiles[0]?.id ?? "");
  const [target, setTarget] = useState<number>(0);
  const [result, setResult] = useState<RunResult | null>(null);

  const run = () => {
    const file = fileFiles.find((f) => f.id === fileId);
    if (!file) return;
    const trace: string[] = [];
    let visited: number[] = [];

    if (method === "sequential") {
      trace.push(`Sequential read of ${file.path}: traversing all ${file.blocks.length} blocks.`);
      file.blocks.forEach((b, i) => {
        trace.push(`  step ${i + 1}: read block #${b}`);
        visited.push(b);
      });
    } else if (method === "direct") {
      const idx = Math.max(0, Math.min(target, file.blocks.length - 1));
      const b = file.blocks[idx];
      trace.push(`Direct access ${file.path}, logical block ${idx} → physical block #${b}`);
      visited = [b];
    } else {
      // Indexed: simulate reading an index block first, then jumping to the data block.
      const idx = Math.max(0, Math.min(target, file.blocks.length - 1));
      const indexBlock = file.blocks[0];
      const dataBlock = file.blocks[idx];
      trace.push(`Indexed access ${file.path}: read index block #${indexBlock}`);
      trace.push(`  index entry [${idx}] → data block #${dataBlock}`);
      visited = [indexBlock, dataBlock];
    }

    const r: RunResult = { method, trace, visited, blocksRead: visited.length };
    setResult(r);
    log({ type: "access", message: `${method} access on ${file.path} → ${r.blocksRead} block(s) read` });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Access Method</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={method} onValueChange={(v) => setMethod(v as Method)}>
            <TabsList>
              <TabsTrigger value="sequential">Sequential</TabsTrigger>
              <TabsTrigger value="direct">Direct</TabsTrigger>
              <TabsTrigger value="indexed">Indexed</TabsTrigger>
            </TabsList>
            {(["sequential", "direct", "indexed"] as const).map((m) => (
              <TabsContent key={m} value={m}>
                <p className="text-sm text-muted-foreground">
                  {m === "sequential" && "Read every data block of the file in order."}
                  {m === "direct" && "Jump directly to a logical block index — O(1) seek."}
                  {m === "indexed" && "Read the file's index block, then the requested data block."}
                </p>
              </TabsContent>
            ))}
          </Tabs>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <Label>Target file</Label>
              <Select value={fileId} onValueChange={setFileId}>
                <SelectTrigger><SelectValue placeholder="Select file" /></SelectTrigger>
                <SelectContent>
                  {fileFiles.map((f) => (
                    <SelectItem key={f.id} value={f.id}>{f.path} ({f.blocks.length} blocks)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {method !== "sequential" && (
              <div>
                <Label>Logical block index</Label>
                <Input type="number" min={0} value={target} onChange={(e) => setTarget(Number(e.target.value))} />
              </div>
            )}
            <div className="flex items-end">
              <Button onClick={run} disabled={!fileId}><Play className="mr-1 h-4 w-4" />Run Access</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {result && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Block Traversal</CardTitle>
            </CardHeader>
            <CardContent>
              <BlockPath visited={result.visited} />
              <p className="mt-3 text-sm">
                <span className="font-semibold">{result.blocksRead}</span> block(s) read.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Trace Output</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="rounded-md bg-muted p-3 text-xs font-mono overflow-x-auto">
                {result.trace.join("\n")}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function BlockPath({ visited }: { visited: number[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {visited.map((b, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className={cn(
            "inline-flex h-10 w-12 items-center justify-center rounded-md border-2 border-primary bg-primary-muted text-sm font-mono font-semibold text-primary",
          )}>
            #{b}
          </span>
          {i < visited.length - 1 && <span className="text-muted-foreground">→</span>}
        </div>
      ))}
    </div>
  );
}
