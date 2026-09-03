import os from "node:os";
import fs from "node:fs/promises";
import path from "node:path";
import {
 Activity,
 Camera,
 CheckCircle2,
 Cpu,
 Database,
 HardDrive,
 MemoryStick,
 Server,
 Video,
 XCircle,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
export const dynamic =
 "force-dynamic";
type CameraStatus = {
 id: number;
 name: string;
 status:
   | "online"
   | "offline";
};
async function checkUrl(
 url: string
) {
 try {
   const controller =
     new AbortController();
   const timeout =
     setTimeout(
       () =>
         controller.abort(),
       2000
     );
   const response =
     await fetch(
       url,
       {
         method:
           "GET",
         cache:
           "no-store",
         signal:
           controller.signal,
       }
     );
   clearTimeout(
     timeout
   );
   return response.ok;
 } catch {
   return false;
 }
}
async function checkDatabase() {
 try {
   await prisma.camera.count();
   return true;
 } catch {
   return false;
 }
}
async function getDiskUsage() {
 try {
   const recordingsDirectory =
     path.resolve(
       process.cwd(),
       "recordings"
     );
   let totalBytes = 0;
   async function walk(
     directory: string
   ) {
     const entries =
       await fs.readdir(
         directory,
         {
           withFileTypes:
             true,
         }
       );
     for (
       const entry of
       entries
     ) {
       const fullPath =
         path.join(
           directory,
           entry.name
         );
       if (
         entry.isDirectory()
       ) {
         await walk(
           fullPath
         );
       } else {
         const stat =
           await fs.stat(
             fullPath
           );
         totalBytes +=
           stat.size;
       }
     }
   }
   await walk(
     recordingsDirectory
   );
   return totalBytes;
 } catch {
   return 0;
 }
}
function formatBytes(
 bytes: number
) {
 if (
   bytes <
   1024
 ) {
   return `${bytes} B`;
 }
 if (
   bytes <
   1024 * 1024
 ) {
   return `${(
     bytes / 1024
   ).toFixed(1)} KB`;
 }
 if (
   bytes <
   1024 *
     1024 *
     1024
 ) {
   return `${(
     bytes /
     1024 /
     1024
   ).toFixed(1)} MB`;
 }
 return `${(
   bytes /
   1024 /
   1024 /
   1024
 ).toFixed(2)} GB`;
}
function formatPercent(
 value: number
) {
 return `${Math.round(
   value
 )}%`;
}
export default async function SystemPage() {
 const [
   databaseOnline,
   mediaMtxOnline,
   cameraCount,
   recordingCount,
   snapshotCount,
   cameras,
   recordingsBytes,
 ] =
   await Promise.all([
     checkDatabase(),
     checkUrl(
       "http://localhost:8888"
     ),
     prisma.camera.count(),
     prisma.recording.count(),
     prisma.snapshot.count(),
     prisma.camera.findMany({
       orderBy: {
         id: "asc",
       },
     }),
     getDiskUsage(),
   ]);
 const totalMemory =
   os.totalmem();
 const freeMemory =
   os.freemem();
 const usedMemory =
   totalMemory -
   freeMemory;
 const memoryPercent =
   totalMemory > 0
     ? (usedMemory /
         totalMemory) *
       100
     : 0;
 const loadAverage =
   os.loadavg()[0];
 const cpuCount =
   os.cpus().length;
 const normalizedCpu =
   cpuCount > 0
     ? Math.min(
         100,
         (loadAverage /
           cpuCount) *
           100
       )
     : 0;
 const cameraStatuses: CameraStatus[] =
   cameras.map(
     (camera) => ({
       id:
camera.id,
       name:
         camera.name,
       status:
         camera.host
           ? "online"
           : "offline",
     })
   );
 const onlineCameras =
   cameraStatuses.filter(
     (camera) =>
       camera.status ===
       "online"
   ).length;
 const offlineCameras =
   cameraStatuses.length -
   onlineCameras;
 const services = [
   {
     name:
       "MediaMTX",
     description:
       "Video streaming server",
     online:
       mediaMtxOnline,
     icon:
       Video,
   },
   {
     name:
       "PostgreSQL",
     description:
       "Application database",
     online:
       databaseOnline,
     icon:
       Database,
   },
   {
     name:
       "Camera Service",
     description:
       "Registered camera monitoring",
     online:
       cameraCount > 0,
     icon:
       Camera,
   },
   {
     name:
       "Next.js",
     description:
       "Web application server",
     online:
       true,
     icon:
       Server,
   },
 ];
 return (
<main className="min-h-screen bg-slate-50">
<div className="px-6 py-6">
<div className="mb-6">
<h1 className="text-2xl font-bold tracking-tight text-slate-900">
           System
</h1>
<p className="mt-1 text-sm text-slate-500">
           Platform health,
           services and resource
           usage
</p>
</div>
       {/* Overall status */}
<section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
<div className="flex items-center gap-4">
<div
               className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                 mediaMtxOnline &&
                 databaseOnline
                   ? "bg-emerald-50 text-emerald-600"
                   : "bg-amber-50 text-amber-600"
               }`}
>
<Activity
                 size={
                   23
                 }
               />
</div>
<div>
<h2 className="text-base font-semibold text-slate-900">
                 Platform Status
</h2>
<p className="mt-1 text-sm text-slate-500">
                 {mediaMtxOnline &&
                 databaseOnline
                   ? "All core services operational"
                   : "One or more services need attention"}
</p>
</div>
</div>
<div
             className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium ${
               mediaMtxOnline &&
               databaseOnline
                 ? "bg-emerald-50 text-emerald-700"
                 : "bg-amber-50 text-amber-700"
             }`}
>
<span
               className={`h-2 w-2 rounded-full ${
                 mediaMtxOnline &&
                 databaseOnline
                   ? "bg-emerald-500"
                   : "bg-amber-500"
               }`}
             />
             {mediaMtxOnline &&
             databaseOnline
               ? "Operational"
               : "Attention"}
</div>
</div>
</section>
       {/* Resource cards */}
<section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
<div className="flex items-center justify-between">
<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
<Cpu
                 size={
                   19
                 }
               />
</div>
<span className="text-xs font-medium text-slate-400">
               CPU
</span>
</div>
<p className="mt-4 text-2xl font-bold text-slate-900">
             {formatPercent(
               normalizedCpu
             )}
</p>
<p className="mt-1 text-xs text-slate-500">
             {cpuCount} logical
             processors
</p>
</div>
<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
<div className="flex items-center justify-between">
<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
<MemoryStick
                 size={
                   19
                 }
               />
</div>
<span className="text-xs font-medium text-slate-400">
               Memory
</span>
</div>
<p className="mt-4 text-2xl font-bold text-slate-900">
             {formatPercent(
               memoryPercent
             )}
</p>
<p className="mt-1 text-xs text-slate-500">
             {formatBytes(
               usedMemory
             )}{" "}
             /{" "}
             {formatBytes(
               totalMemory
             )}
</p>
</div>
<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
<div className="flex items-center justify-between">
<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
<HardDrive
                 size={
                   19
                 }
               />
</div>
<span className="text-xs font-medium text-slate-400">
               Recording Storage
</span>
</div>
<p className="mt-4 text-2xl font-bold text-slate-900">
             {formatBytes(
               recordingsBytes
             )}
</p>
<p className="mt-1 text-xs text-slate-500">
             Local recording
             files
</p>
</div>
<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
<div className="flex items-center justify-between">
<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
<Camera
                 size={
                   19
                 }
               />
</div>
<span className="text-xs font-medium text-slate-400">
               Cameras
</span>
</div>
<p className="mt-4 text-2xl font-bold text-slate-900">
             {
               cameraCount
             }
</p>
<p className="mt-1 text-xs text-slate-500">
             {onlineCameras} online
             · {offlineCameras} offline
</p>
</div>
</section>
       {/* Services */}
<section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
<div className="border-b border-slate-200 px-5 py-4">
<h2 className="text-sm font-semibold text-slate-900">
             Services
</h2>
<p className="mt-1 text-xs text-slate-500">
             Core platform
             service status
</p>
</div>
<div className="divide-y divide-slate-100">
           {services.map(
             (
               service
             ) => {
               const Icon =
                 service.icon;
               return (
<div
                   key={
                     service.name
                   }
                   className="flex items-center gap-4 px-5 py-4"
>
<div
                     className={`flex h-10 w-10 items-center justify-center rounded-lg ${
service.online
                         ? "bg-emerald-50 text-emerald-600"
                         : "bg-red-50 text-red-500"
                     }`}
>
<Icon
                       size={
                         18
                       }
                     />
</div>
<div className="flex-1">
<p className="text-sm font-semibold text-slate-900">
                       {
                         service.name
                       }
</p>
<p className="mt-0.5 text-xs text-slate-500">
                       {
                         service.description
                       }
</p>
</div>
<div
                     className={`flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium ${
service.online
                         ? "bg-emerald-50 text-emerald-700"
                         : "bg-red-50 text-red-700"
                     }`}
>
                     {service.online ? (
<CheckCircle2
                         size={
                           14
                         }
                       />
                     ) : (
<XCircle
                         size={
                           14
                         }
                       />
                     )}
                     {service.online
                       ? "Online"
                       : "Offline"}
</div>
</div>
               );
             }
           )}
</div>
</section>
       {/* Storage summary */}
<section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
<p className="text-xs uppercase tracking-wide text-slate-400">
             Recordings
</p>
<p className="mt-2 text-2xl font-bold text-slate-900">
             {
               recordingCount
             }
</p>
<p className="mt-1 text-xs text-slate-500">
             Saved video files
</p>
</div>
<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
<p className="text-xs uppercase tracking-wide text-slate-400">
             Snapshots
</p>
<p className="mt-2 text-2xl font-bold text-slate-900">
             {
               snapshotCount
             }
</p>
<p className="mt-1 text-xs text-slate-500">
             Captured images
</p>
</div>
<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
<p className="text-xs uppercase tracking-wide text-slate-400">
             Uptime
</p>
<p className="mt-2 text-2xl font-bold text-slate-900">
             {Math.floor(
               os.uptime() /
                 3600
             )}
             h
</p>
<p className="mt-1 text-xs text-slate-500">
             System uptime
</p>
</div>
</section>
</div>
</main>
 );
}