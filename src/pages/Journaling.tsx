/** Journaling — full chronological activity log. */
import { useFs, JournalEntry } from "@/context/FileSystemContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const typeColor: Record<JournalEntry["type"], string> = {
  create: "bg-success/10 text-success",
  delete: "bg-destructive/10 text-destructive",
  recover: "bg-info/10 text-info",
  optimize: "bg-warning/10 text-warning",
  cache: "bg-primary-muted text-primary",
  access: "bg-accent text-accent-foreground",
  system: "bg-muted text-muted-foreground",
};

export default function Journaling() {
  const { journal } = useFs();
  const [filter, setFilter] = useState<"all" | JournalEntry["type"]>("all");
  const filtered = filter === "all" ? journal : journal.filter((j) => j.type === filter);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Journaling — Activity Log</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList className="flex-wrap">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="create">Create</TabsTrigger>
            <TabsTrigger value="delete">Delete</TabsTrigger>
            <TabsTrigger value="recover">Recover</TabsTrigger>
            <TabsTrigger value="optimize">Optimize</TabsTrigger>
            <TabsTrigger value="cache">Cache</TabsTrigger>
            <TabsTrigger value="access">Access</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
          {filtered.map((j) => (
            <div
              key={j.id}
              className="flex items-start gap-3 rounded-md border border-border bg-card p-3"
            >
              <Badge className={`${typeColor[j.type]} border-transparent`}>{j.type}</Badge>
              <div className="flex-1">
                <p className="text-sm">{j.message}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(j.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground py-8 text-center">No journal entries.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
