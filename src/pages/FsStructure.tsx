/** File System Structure — hierarchical tree + inode table. */
import { useMemo, useState } from "react";
import { useFs, FileNode } from "@/context/FileSystemContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Folder, File as FileIcon, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

function Tree({ files }: { files: FileNode[] }) {
  const childrenByPath = useMemo(() => {
    const m = new Map<string, FileNode[]>();
    for (const f of files) {
      const arr = m.get(f.parentPath) ?? [];
      arr.push(f);
      m.set(f.parentPath, arr);
    }
    return m;
  }, [files]);

  const [open, setOpen] = useState<Set<string>>(new Set(["/", "/home", "/home/docs", "/etc", "/var"]));
  const toggle = (p: string) => setOpen((prev) => {
    const next = new Set(prev); next.has(p) ? next.delete(p) : next.add(p); return next;
  });

  const renderNode = (node: FileNode, depth: number) => {
    const kids = childrenByPath.get(node.path) ?? [];
    const isOpen = open.has(node.path);
    return (
      <div key={node.id}>
        <div
          className={cn(
            "flex items-center gap-1 rounded px-2 py-1 text-sm",
            node.status === "deleted" && "opacity-50 line-through",
          )}
          style={{ paddingLeft: 8 + depth * 16 }}
        >
          {node.type === "folder" && kids.length > 0 ? (
            <button onClick={() => toggle(node.path)} aria-label="toggle">
              {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </button>
          ) : <span className="w-3" />}
          {node.type === "folder" ? <Folder className="h-4 w-4 text-info" /> : <FileIcon className="h-4 w-4 text-muted-foreground" />}
          <span className="font-mono">{node.name}</span>
          <span className="ml-auto text-xs text-muted-foreground">inode #{node.inode}</span>
        </div>
        {(node.type !== "folder" || isOpen) && kids.map((k) => renderNode(k, depth + 1))}
      </div>
    );
  };

  const roots = (childrenByPath.get("/") ?? []);
  return (
    <div>
      <div className="flex items-center gap-1 px-2 py-1 text-sm font-mono">
        <Folder className="h-4 w-4 text-info" />
        <span>/</span>
      </div>
      {roots.map((r) => renderNode(r, 1))}
    </div>
  );
}

export default function FsStructure() {
  const { files } = useFs();
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Hierarchical Tree</CardTitle>
        </CardHeader>
        <CardContent>
          <Tree files={files} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inode Table</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Inode</TableHead>
                <TableHead>Path</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.sort((a, b) => a.inode - b.inode).map((f) => (
                <TableRow key={f.id}>
                  <TableCell className="font-mono">#{f.inode}</TableCell>
                  <TableCell className="font-mono text-xs">{f.path}</TableCell>
                  <TableCell>{f.size} KB</TableCell>
                  <TableCell>
                    <Badge variant={f.status === "active" ? "default" : "destructive"}>{f.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
