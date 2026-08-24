import {
 Camera,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import SnapshotGallery from "@/components/snapshots/SnapshotGallery";
export const dynamic =
 "force-dynamic";
export default async function SnapshotsPage() {
 const snapshots =
   await prisma.snapshot.findMany({
     include: {
       camera: true,
     },
     orderBy: {
       createdAt: "desc",
     },
   });
 const serializedSnapshots =
   snapshots.map((snapshot) => ({
     id: snapshot.id,
     createdAt:
       snapshot.createdAt.toISOString(),
     camera: {
       id: snapshot.camera.id,
       name: snapshot.camera.name,
       location:
         snapshot.camera.location,
     },
   }));
 return (
<main className="min-h-screen bg-slate-50">
<div className="px-6 py-6">
<div className="w-full">
         {/* Header */}
<div className="mb-5">
<h1 className="text-2xl font-bold tracking-tight text-slate-900">
             Snapshots
</h1>
<p className="mt-1 text-sm text-slate-500">
             Captured images from your
             cameras
</p>
</div>
         {/* Library */}
<section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
<div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
<div>
<h2 className="text-sm font-semibold text-slate-900">
                 Snapshot Library
</h2>
<p className="mt-0.5 text-xs text-slate-500">
                 {
                   serializedSnapshots.length
                 }{" "}
                 saved{" "}
                 {serializedSnapshots.length ===
                 1
                   ? "snapshot"
                   : "snapshots"}
</p>
</div>
<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
<Camera size={17} />
</div>
</div>
<SnapshotGallery
             snapshots={
               serializedSnapshots
             }
           />
</section>
</div>
</div>
</main>
 );
}