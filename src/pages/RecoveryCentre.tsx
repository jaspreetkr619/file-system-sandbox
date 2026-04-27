/** Recovery Centre — list deleted files, recover them. */
import { useFs } from "@/context/FileSystemContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { LifeBuoy, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export default function RecoveryCentre() {
  const { deletedFiles, recoverFile, recoveryRate } = useFs();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2"><LifeBuoy className="h-5 w-5 text-warning" />Recoverable Files</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Files marked as deleted whose blocks have not yet been overwritten.
            </p>
          </div>
          <Badge variant="outline" className="text-base px-3 py-1">
            Recovery Rate: <span className="ml-1 text-success font-semibold">{recoveryRate}%</span>
          </Badge>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Path</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Inode</TableHead>
                <TableHead>Blocks</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deletedFiles.map((f) => (
                <TableRow key={f.id}>
                  <TableCell className="font-medium">{f.name}</TableCell>
                  <TableCell className="font-mono text-xs">{f.path}</TableCell>
                  <TableCell>{f.size} KB</TableCell>
                  <TableCell>#{f.inode}</TableCell>
                  <TableCell className="font-mono text-xs">[{f.blocks.join(", ")}]</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      onClick={() => { recoverFile(f.id); toast.success(`Recovered ${f.name}`); }}
                    >
                      <RotateCcw className="mr-1 h-4 w-4" />Recover
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {deletedFiles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No deleted files. Delete a file from the Explorer to test recovery.
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
