/**
 * FileSystemContext
 * -----------------
 * Central in-memory simulator state for the File System Recovery &
 * Optimization Tool. All pages read & mutate through this context, so
 * actions on one page (e.g. delete a file in the Explorer) reflect
 * immediately on every other page (Dashboard counts, Free Space grid,
 * Recovery Centre list, Journaling log, etc.).
 *
 * Intentionally framework-free: no backend, no persistence, just React state.
 */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from "react";

/* ------------------------------- Types ---------------------------------- */

export type FileStatus = "active" | "deleted";

export interface FileNode {
  id: string;
  name: string;
  path: string;          // e.g. "/home/docs/report.txt"
  parentPath: string;    // e.g. "/home/docs"
  type: "file" | "folder";
  size: number;          // KB
  blocks: number[];      // indices into the disk-block array
  status: FileStatus;
  inode: number;
  createdAt: number;
}

export type BlockState = "free" | "used" | "deleted" | "system";

export interface JournalEntry {
  id: string;
  timestamp: number;
  type:
    | "create"
    | "delete"
    | "recover"
    | "optimize"
    | "cache"
    | "access"
    | "system";
  message: string;
}

interface OptimizerStats {
  fragmentation: number; // 0-100 %
  duplicates: number;
  wastedBlocks: number;
}

interface FsContextValue {
  /* state */
  files: FileNode[];
  blocks: BlockState[];
  journal: JournalEntry[];
  optimizer: OptimizerStats;
  totalBlocks: number;

  /* derived */
  activeFiles: FileNode[];
  deletedFiles: FileNode[];
  usedBlockCount: number;
  freeBlockCount: number;
  deletedBlockCount: number;
  recoveryRate: number;

  /* actions */
  createFile: (name: string, parentPath: string, type: "file" | "folder", sizeKB?: number) => void;
  deleteFile: (id: string) => void;
  recoverFile: (id: string) => void;
  optimize: () => void;
  log: (entry: Omit<JournalEntry, "id" | "timestamp">) => void;
}

/* ----------------------------- Constants -------------------------------- */

const TOTAL_BLOCKS = 128; // 16 x 8 grid
const BLOCK_SIZE_KB = 4;

/* ----------------------------- Seed data -------------------------------- */

const seedFiles = (): FileNode[] => {
  const now = Date.now();
  let inode = 1;
  let id = 1;
  const mk = (
    name: string,
    parentPath: string,
    type: "file" | "folder",
    size: number,
    blocks: number[],
    status: FileStatus = "active",
  ): FileNode => ({
    id: String(id++),
    name,
    parentPath,
    path: parentPath === "/" ? `/${name}` : `${parentPath}/${name}`,
    type,
    size,
    blocks,
    status,
    inode: inode++,
    createdAt: now - Math.floor(Math.random() * 100000),
  });

  return [
    mk("home", "/", "folder", 0, []),
    mk("etc", "/", "folder", 0, []),
    mk("var", "/", "folder", 0, []),
    mk("docs", "/home", "folder", 0, []),
    mk("photos", "/home", "folder", 0, []),
    mk("report.txt", "/home/docs", "file", 12, [4, 5, 6]),
    mk("notes.md", "/home/docs", "file", 8, [7, 8]),
    mk("vacation.jpg", "/home/photos", "file", 24, [10, 11, 12, 13, 14, 15]),
    mk("config.yaml", "/etc", "file", 4, [20]),
    mk("system.log", "/var", "file", 16, [25, 26, 27, 28]),
    mk("old_draft.txt", "/home/docs", "file", 8, [30, 31], "deleted"),
  ];
};

const seedBlocks = (files: FileNode[]): BlockState[] => {
  const blocks: BlockState[] = Array(TOTAL_BLOCKS).fill("free");
  // Reserve first 4 blocks as system (boot/superblock/inode-table/journal)
  for (let i = 0; i < 4; i++) blocks[i] = "system";
  for (const f of files) {
    for (const b of f.blocks) {
      blocks[b] = f.status === "deleted" ? "deleted" : "used";
    }
  }
  return blocks;
};

/* ------------------------------ Context --------------------------------- */

const FsContext = createContext<FsContextValue | null>(null);

export function FileSystemProvider({ children }: { children: ReactNode }) {
  const initialFiles = useMemo(() => seedFiles(), []);
  const [files, setFiles] = useState<FileNode[]>(initialFiles);
  const [blocks, setBlocks] = useState<BlockState[]>(() => seedBlocks(initialFiles));
  const [journal, setJournal] = useState<JournalEntry[]>(() => [
    {
      id: "j0",
      timestamp: Date.now() - 60000,
      type: "system",
      message: "File system mounted at /",
    },
  ]);
  const [optimizer, setOptimizer] = useState<OptimizerStats>({
    fragmentation: 38,
    duplicates: 3,
    wastedBlocks: 9,
  });

  const log = useCallback((entry: Omit<JournalEntry, "id" | "timestamp">) => {
    setJournal((prev) => [
      { id: Math.random().toString(36).slice(2), timestamp: Date.now(), ...entry },
      ...prev,
    ]);
  }, []);

  /* Find the next N free block indices */
  const findFreeBlocks = useCallback((count: number, current: BlockState[]): number[] => {
    const out: number[] = [];
    for (let i = 0; i < current.length && out.length < count; i++) {
      if (current[i] === "free") out.push(i);
    }
    return out;
  }, []);

  const createFile = useCallback(
    (name: string, parentPath: string, type: "file" | "folder", sizeKB = 8) => {
      const blocksNeeded = type === "folder" ? 0 : Math.max(1, Math.ceil(sizeKB / BLOCK_SIZE_KB));
      setBlocks((prev) => {
        const allocated = findFreeBlocks(blocksNeeded, prev);
        if (allocated.length < blocksNeeded) {
          log({ type: "system", message: `Allocation failed for ${name}: not enough free blocks.` });
          return prev;
        }
        const next = [...prev];
        for (const b of allocated) next[b] = "used";

        setFiles((prevFiles) => {
          const maxInode = prevFiles.reduce((m, f) => Math.max(m, f.inode), 0);
          const maxId = prevFiles.reduce((m, f) => Math.max(m, Number(f.id)), 0);
          const path = parentPath === "/" ? `/${name}` : `${parentPath}/${name}`;
          const newFile: FileNode = {
            id: String(maxId + 1),
            name,
            parentPath,
            path,
            type,
            size: type === "folder" ? 0 : sizeKB,
            blocks: allocated,
            status: "active",
            inode: maxInode + 1,
            createdAt: Date.now(),
          };
          return [...prevFiles, newFile];
        });

        log({ type: "create", message: `Created ${type} ${parentPath === "/" ? "/" : parentPath + "/"}${name}` });
        return next;
      });
    },
    [findFreeBlocks, log],
  );

  const deleteFile = useCallback(
    (id: string) => {
      setFiles((prevFiles) => {
        const target = prevFiles.find((f) => f.id === id);
        if (!target || target.status === "deleted") return prevFiles;
        // Mark blocks as deleted (still recoverable until overwritten)
        setBlocks((prev) => {
          const next = [...prev];
          for (const b of target.blocks) next[b] = "deleted";
          return next;
        });
        log({ type: "delete", message: `Deleted ${target.path}` });
        return prevFiles.map((f) => (f.id === id ? { ...f, status: "deleted" } : f));
      });
    },
    [log],
  );

  const recoverFile = useCallback(
    (id: string) => {
      setFiles((prevFiles) => {
        const target = prevFiles.find((f) => f.id === id);
        if (!target || target.status !== "deleted") return prevFiles;
        // Only blocks still marked deleted can be recovered
        setBlocks((prev) => {
          const next = [...prev];
          for (const b of target.blocks) {
            if (next[b] === "deleted") next[b] = "used";
          }
          return next;
        });
        log({ type: "recover", message: `Recovered ${target.path}` });
        return prevFiles.map((f) => (f.id === id ? { ...f, status: "active" } : f));
      });
    },
    [log],
  );

  const optimize = useCallback(() => {
    // Simulate defragmentation: compact used blocks to the front of the disk
    setBlocks((prev) => {
      const next: BlockState[] = Array(prev.length).fill("free");
      for (let i = 0; i < 4; i++) next[i] = "system";
      let cursor = 4;
      const remap = new Map<number, number>();
      // Walk in original order so file block ordering is preserved.
      for (let i = 0; i < prev.length; i++) {
        if (prev[i] === "used") {
          next[cursor] = "used";
          remap.set(i, cursor);
          cursor++;
        }
      }
      // Update file block indices accordingly
      setFiles((pf) =>
        pf.map((f) =>
          f.status === "active"
            ? { ...f, blocks: f.blocks.map((b) => remap.get(b) ?? b) }
            : { ...f, blocks: [] }, // deleted files lose their (now-overwritten) block refs
        ),
      );
      return next;
    });
    setOptimizer((o) => ({
      fragmentation: Math.max(2, Math.round(o.fragmentation / 4)),
      duplicates: 0,
      wastedBlocks: Math.max(0, o.wastedBlocks - 7),
    }));
    log({ type: "optimize", message: "Disk defragmented & duplicates removed." });
  }, [log]);

  /* Derived values */
  const activeFiles = useMemo(() => files.filter((f) => f.status === "active"), [files]);
  const deletedFiles = useMemo(() => files.filter((f) => f.status === "deleted"), [files]);
  const usedBlockCount = blocks.filter((b) => b === "used").length;
  const freeBlockCount = blocks.filter((b) => b === "free").length;
  const deletedBlockCount = blocks.filter((b) => b === "deleted").length;
  const recoveryRate =
    deletedFiles.length === 0
      ? 100
      : Math.round((deletedBlockCount / Math.max(1, deletedFiles.reduce((s, f) => s + f.blocks.length, 0))) * 100);

  const value: FsContextValue = {
    files,
    blocks,
    journal,
    optimizer,
    totalBlocks: TOTAL_BLOCKS,
    activeFiles,
    deletedFiles,
    usedBlockCount,
    freeBlockCount,
    deletedBlockCount,
    recoveryRate,
    createFile,
    deleteFile,
    recoverFile,
    optimize,
    log,
  };

  return <FsContext.Provider value={value}>{children}</FsContext.Provider>;
}

export function useFs(): FsContextValue {
  const ctx = useContext(FsContext);
  if (!ctx) throw new Error("useFs must be used inside <FileSystemProvider>");
  return ctx;
}

export const BLOCK_SIZE_KB_CONST = BLOCK_SIZE_KB;
