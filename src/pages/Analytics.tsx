/** Analytics — recharts visualizations of disk performance. */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend,
} from "recharts";
import { useFs } from "@/context/FileSystemContext";

const latencyData = Array.from({ length: 12 }, (_, i) => ({
  t: `T${i + 1}`,
  read: 2 + Math.round(Math.random() * 6 + Math.sin(i / 2) * 2),
  write: 4 + Math.round(Math.random() * 8 + Math.cos(i / 2) * 2),
}));

const throughputData = Array.from({ length: 12 }, (_, i) => ({
  t: `T${i + 1}`,
  mbps: 80 + Math.round(Math.random() * 60),
}));

const cacheHitData = Array.from({ length: 8 }, (_, i) => ({
  workload: `W${i + 1}`,
  lru: 60 + Math.round(Math.random() * 35),
  fifo: 50 + Math.round(Math.random() * 35),
}));

export default function Analytics() {
  const { usedBlockCount, freeBlockCount, deletedBlockCount } = useFs();
  const utilization = [
    { name: "Used", value: usedBlockCount, color: "hsl(var(--block-used))" },
    { name: "Free", value: freeBlockCount, color: "hsl(var(--block-free))" },
    { name: "Recoverable", value: deletedBlockCount, color: "hsl(var(--block-deleted))" },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>Read / Write Latency (ms)</CardTitle></CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={latencyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="t" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="read" stroke="hsl(var(--info))" strokeWidth={2} />
              <Line type="monotone" dataKey="write" stroke="hsl(var(--warning))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Throughput (MB/s)</CardTitle></CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={throughputData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="t" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip />
              <Area type="monotone" dataKey="mbps" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Disk Utilization</CardTitle></CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={utilization} dataKey="value" nameKey="name" outerRadius={90} label>
                {utilization.map((u, i) => <Cell key={i} fill={u.color} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Cache Hit Rate by Workload (%)</CardTitle></CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cacheHitData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="workload" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip />
              <Legend />
              <Bar dataKey="lru" fill="hsl(var(--primary))" />
              <Bar dataKey="fifo" fill="hsl(var(--warning))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
