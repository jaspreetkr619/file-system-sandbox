/** File Explorer — directory tree + file table + create/delete actions. */
import { useState, useMemo } from "react";
import { useFs, FileNode } from "@/context/FileSystemContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Folder, File as FileIcon, FolderPlus, FilePlus2, Trash2, ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/** Build a tree structure from the flat file list. */
function buildTree(files: FileNode[]) {
  const folders = files.filter((f) => f.type === "folder");
  const childrenByPath = new Map<string, FileNode[]>();
  for (const f of files) {
    const arr = childrenByPath.get(f.parentPath) ?? [];
    arr.push(f);
    childrenByPath.set(f.parentPath, arr);
  }
  return { folders, childrenByPath };
}

function TreeNode({
  node,
  childrenByPath,
  selectedPath,
  onSelect,
  expanded,
  toggle,
  depth = 0,
}: {
  node: FileNode;
  childrenByPath: Map<string, FileNode[]>;
  selectedPath: string;
  onSelect: (p: string) => void;
  expanded: Set<string>;
  toggle: (p: string) => void;
  depth?: number;
}) {
  const kids = (childrenByPath.get(node.path) ?? []).filter((c) => c.type === "folder");
  const isOpen = expanded.has(node.path);
  return (
    <div>
      <button
        onClick={() => { onSelect(node.path); toggle(node.path); }}
        className={cn(
          "flex w-full items-center gap-1 rounded px-2 py-1 text-sm hover:bg-accent",
          selectedPath === node.path && "bg-primary-muted text-primary font-medium",
        )}
        style={{ paddingLeft: 8 + depth * 12 }}
      >
        {kids.length > 0 ? (isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />) : <span className="w-3" />}
        <Folder className="h-4 w-4 text-info" />
        <span>{node.name}</span>
      </button>
      {isOpen && kids.map((k) => (
        <TreeNode
          key={k.id}
          node={k}
          childrenByPath={childrenByPath}
          selectedPath={selectedPath}
          onSelect={onSelect}
          expanded={expanded}
          toggle={toggle}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}

export default function FileExplorer() {
  const { files, createFile, deleteFile } = useFs();
  const { folders, childrenByPath } = useMemo(() => buildTree(files), [files]);
  const rootFolders = folders.filter((f) => f.parentPath === "/");

  const [selected, setSelected] = useState<string>("/home/docs");
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["/", "/home"]));
  const toggle = (p: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(p) ? next.delete(p) : next.add(p);
      return next;
    });

  const visible = files.filter((f) => f.parentPath === selected);

  /* Create dialog state */
  const [openCreate, setOpenCreate] = useState<null | "file" | "folder">(null);
  const [newName, setNewName] = useState("");
  const [newSize, setNewSize] = useState(8);

  const handleCreate = () => {
    if (!newName.trim()) return toast.error("Name is required.");
    createFile(newName.trim(), selected, openCreate!, newSize);
    toast.success(`${openCreate === "folder" ? "Folder" : "File"} created.`);
    setNewName("");
    setNewSize(8);
    setOpenCreate(null);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Directory Tree</CardTitle>
        </CardHeader>
        <CardContent>
          <button
            onClick={() => setSelected("/")}
            className={cn(
              "flex w-full items-center gap-1 rounded px-2 py-1 text-sm hover:bg-accent",
              selected === "/" && "bg-primary-muted text-primary font-medium",
            )}
          >
            <Folder className="h-4 w-4 text-info" />
            <span>/</span>
          </button>
          {rootFolders.map((f) => (
            <TreeNode
              key={f.id}
              node={f}
              childrenByPath={childrenByPath}
              selectedPath={selected}
              onSelect={setSelected}
              expanded={expanded}
              toggle={toggle}
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Contents of <span className="font-mono text-primary">{selected}</span></CardTitle>
            <p className="text-xs text-muted-foreground">{visible.length} item(s)</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={openCreate === "folder"} onOpenChange={(o) => setOpenCreate(o ? "folder" : null)}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm"><FolderPlus className="mr-1 h-4 w-4" />New Folder</Button>
              </DialogTrigger>
              <CreateDialogContent
                kind="folder"
                name={newName} setName={setNewName}
                size={newSize} setSize={setNewSize}
                onCreate={handleCreate}
              />
            </Dialog>
            <Dialog open={openCreate === "file"} onOpenChange={(o) => setOpenCreate(o ? "file" : null)}>
              <DialogTrigger asChild>
                <Button size="sm"><FilePlus2 className="mr-1 h-4 w-4" />New File</Button>
              </DialogTrigger>
              <CreateDialogContent
                kind="file"
                name={newName} setName={setNewName}
                size={newSize} setSize={setNewSize}
                onCreate={handleCreate}
              />
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Path</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Blocks</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((f) => (
                <TableRow key={f.id}>
                  <TableCell className="font-medium">
                    <span className="inline-flex items-center gap-2">
                      {f.type === "folder" ? <Folder className="h-4 w-4 text-info" /> : <FileIcon className="h-4 w-4 text-muted-foreground" />}
                      {f.name}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{f.path}</TableCell>
                  <TableCell>{f.size} KB</TableCell>
                  <TableCell className="font-mono text-xs">
                    {f.blocks.length === 0 ? "—" : `[${f.blocks.join(", ")}]`}
                  </TableCell>
                  <TableCell>
                    <Badge variant={f.status === "active" ? "default" : "destructive"}>
                      {f.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {f.status === "active" && f.type === "file" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { deleteFile(f.id); toast(`Deleted ${f.name}`); }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {visible.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Empty directory.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function CreateDialogContent({
  kind, name, setName, size, setSize, onCreate,
}: {
  kind: "file" | "folder";
  name: string; setName: (s: string) => void;
  size: number; setSize: (n: number) => void;
  onCreate: () => void;
}) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create new {kind}</DialogTitle>
      </DialogHeader>
      <div className="space-y-3">
        <div>
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={kind === "file" ? "report.txt" : "projects"} />
        </div>
        {kind === "file" && (
          <div>
            <Label>Size (KB)</Label>
            <Input type="number" min={1} value={size} onChange={(e) => setSize(Number(e.target.value))} />
          </div>
        )}
      </div>
      <DialogFooter>
        <Button onClick={onCreate}>Create</Button>
      </DialogFooter>
    </DialogContent>
  );
}
