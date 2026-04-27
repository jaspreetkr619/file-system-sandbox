/**
 * Cache simulator — LRU and FIFO replacement policies.
 * User provides a workload (comma- or space-separated page references).
 */
import { useState } from "react";
import { useFs } from "@/context/FileSystemContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Play } from "lucide-react";

type Policy = "LRU" | "FIFO";

interface Step {
  ref: number;
  hit: boolean;
  cache: number[];
  evicted: number | null;
}

function simulate(policy: Policy, refs: number[], capacity: number): Step[] {
  const steps: Step[] = [];
  let cache: number[] = []; // for FIFO acts as queue, for LRU acts as recency list (last = most recent)

  for (const r of refs) {
    const hitIdx = cache.indexOf(r);
    let evicted: number | null = null;
    if (hitIdx >= 0) {
      // hit
      if (policy === "LRU") {
        cache = cache.filter((x) => x !== r);
        cache.push(r);
      }
      steps.push({ ref: r, hit: true, cache: [...cache], evicted });
    } else {
      // miss
      if (cache.length >= capacity) {
        evicted = cache.shift()!; // both policies evict from front
      }
      cache.push(r);
      steps.push({ ref: r, hit: false, cache: [...cache], evicted });
    }
  }
  return steps;
}

export default function Cache() {
  const { log } = useFs();
  const [policy, setPolicy] = useState<Policy>("LRU");
  const [capacity, setCapacity] = useState(3);
  const [workload, setWorkload] = useState("1, 2, 3, 1, 4, 2, 5, 1, 2, 3");
  const [steps, setSteps] = useState<Step[]>([]);

  const run = () => {
    const refs = workload
      .split(/[\s,]+/)
      .map((x) => Number(x.trim()))
      .filter((n) => Number.isFinite(n));
    if (refs.length === 0) return;
    const result = simulate(policy, refs, capacity);
    setSteps(result);
    const hits = result.filter((s) => s.hit).length;
    log({
      type: "cache",
      message: `${policy} simulation: ${hits}/${result.length} hits (${Math.round((hits / result.length) * 100)}%)`,
    });
  };

  const hits = steps.filter((s) => s.hit).length;
  const misses = steps.length - hits;
  const hitRate = steps.length === 0 ? 0 : Math.round((hits / steps.length) * 100);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cache Replacement Simulator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={policy} onValueChange={(v) => setPolicy(v as Policy)}>
            <TabsList>
              <TabsTrigger value="LRU">LRU</TabsTrigger>
              <TabsTrigger value="FIFO">FIFO</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <Label>Cache capacity</Label>
              <Input type="number" min={1} max={10} value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} />
            </div>
            <div className="md:col-span-2">
              <Label>Workload (comma or space separated)</Label>
              <Input value={workload} onChange={(e) => setWorkload(e.target.value)} placeholder="1, 2, 3, 1, 4, 2..." />
            </div>
          </div>

          <Button onClick={run}><Play className="mr-1 h-4 w-4" />Run Simulation</Button>
        </CardContent>
      </Card>

      {steps.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SmallStat label="Hit Rate" value={`${hitRate}%`} tone="success" />
            <SmallStat label="Hits" value={hits} tone="info" />
            <SmallStat label="Misses" value={misses} tone="destructive" />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Trace Table</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Step</TableHead>
                      <TableHead>Ref</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>Cache State</TableHead>
                      <TableHead>Evicted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {steps.map((s, i) => (
                      <TableRow key={i}>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell className="font-mono">{s.ref}</TableCell>
                        <TableCell>
                          <Badge variant={s.hit ? "default" : "destructive"}>{s.hit ? "HIT" : "MISS"}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">[{s.cache.join(", ")}]</TableCell>
                        <TableCell className="font-mono text-xs">{s.evicted ?? "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Final Cache State</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {steps[steps.length - 1].cache.map((v, i) => (
                    <div key={i} className="flex h-12 w-12 items-center justify-center rounded-md border-2 border-primary bg-primary-muted text-lg font-mono font-semibold text-primary">
                      {v}
                    </div>
                  ))}
                  {Array.from({ length: capacity - steps[steps.length - 1].cache.length }).map((_, i) => (
                    <div key={`e${i}`} className="flex h-12 w-12 items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/30 text-muted-foreground">
                      —
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Policy: <strong>{policy}</strong> · Capacity: {capacity}
                </p>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function SmallStat({ label, value, tone }: { label: string; value: string | number; tone: "success" | "info" | "destructive" }) {
  const toneClass = {
    success: "text-success",
    info: "text-info",
    destructive: "text-destructive",
  }[tone];
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className={`mt-1 text-2xl font-semibold ${toneClass}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
