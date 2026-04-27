# File System Recovery & Optimization Tool

An interactive **Operating Systems** project simulator built with **React + Vite + TypeScript + Tailwind**.
It visualises core OS file-system concepts — file allocation, deletion & recovery, defragmentation,
free-space management, file access methods, cache replacement (LRU/FIFO), and journaling — entirely
in the browser with no backend.

## Features

- **Dashboard** — summary cards (total / active / deleted files, used / free blocks, recovery rate) + recent activity log + live disk map.
- **File Explorer** — directory tree, file table, working **New File** / **New Folder** / **Delete** actions.
- **Recovery Centre** — list of deleted files with one-click **Recover** (status flips back to active and frees deleted blocks).
- **Free Space** — disk visualised as a grid of colored blocks (🟩 free, 🟦 used, 🟥 deleted/recoverable, 🟪 system reserved).
- **File System Structure** — hierarchical tree + inode table.
- **File Access** — Sequential / Direct / Indexed simulation with block traversal + trace output.
- **Cache (LRU / FIFO)** — workload input, hit/miss simulation, trace table, final cache state, hit-rate.
- **Optimizer** — fragmentation %, duplicate count, wasted blocks, **Optimize** button that defragments live.
- **Analytics** — Recharts visualisations: read/write latency, throughput, disk utilisation, cache hit rate.
- **Journaling** — full chronological activity log with type filters.

All state is shared via a single `FileSystemContext`, so an action on one page (e.g. deleting a file in
the Explorer) instantly updates every other page.

## Tech stack

- React 18 + TypeScript
- Vite 5
- Tailwind CSS 3 + shadcn/ui
- React Router 6
- Recharts (charts)
- lucide-react (icons)
- sonner (toasts)

## Run locally

```bash
npm install
npm run dev
```

Then open the URL printed by Vite (default `http://localhost:8080` or `http://localhost:5173`).

### Build for production

```bash
npm run build
npm run preview
```

## Project structure

```
src/
├── components/
│   ├── fs/BlockGrid.tsx          # disk-block grid visualization
│   ├── layout/AppLayout.tsx      # sidebar + header shell
│   ├── layout/AppSidebar.tsx     # left navigation (10 modules)
│   └── ui/                       # shadcn/ui primitives
├── context/
│   └── FileSystemContext.tsx     # ★ central simulator state & actions
├── pages/
│   ├── Dashboard.tsx
│   ├── FileExplorer.tsx
│   ├── RecoveryCentre.tsx
│   ├── Optimizer.tsx
│   ├── Analytics.tsx
│   ├── FsStructure.tsx
│   ├── FreeSpace.tsx
│   ├── FileAccess.tsx
│   ├── Cache.tsx
│   └── Journaling.tsx
└── App.tsx                       # routes
```

## Notes

- 100% client-side. No database, no API keys, no login.
- Disk is modelled as **128 × 4 KB blocks** (configurable in `FileSystemContext.tsx`).
- The first 4 blocks are reserved as **system blocks** (boot / superblock / inode-table / journal).
- Deleted files keep their block references until either the disk is optimised (compaction) or the blocks are reallocated — that's why **Recovery** still works right after a delete.

## License

MIT — free to use for academic / educational purposes.
