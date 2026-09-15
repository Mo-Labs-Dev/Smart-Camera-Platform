import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import {
 isProcessRunning,
 readRecordingState,
} from "@/lib/recordingManager";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const CAMERA_TIMEOUT_MS = 2500;
const MEDIAMTX_TIMEOUT_MS = 2000;
type CameraStatus = {
 id: number;
 name: string;
 status: "online" | "offline";
};
function formatBytes(bytes: number) {
 if (bytes < 1024) {
   return `${bytes} B`;
 }
 if (bytes < 1024 * 1024) {
   return `${(bytes / 1024).toFixed(1)} KB`;
 }
 if (bytes < 1024 * 1024 * 1024) {
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
async function checkUrl(url: string) {
 const controller = new AbortController();
 const timeout = setTimeout(() => {
   controller.abort();
 }, MEDIAMTX_TIMEOUT_MS);
 try {
   const response = await fetch(url, {
     method: "GET",
     cache: "no-store",
     signal: controller.signal,
   });
   return response.ok;
 } catch {
   return false;
 } finally {
   clearTimeout(timeout);
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
async function getRecordingStorageBytes() {
 const recordingsDirectory = path.resolve(
   process.cwd(),
   "recordings"
 );
 let totalBytes = 0;
 async function walk(directory: string) {
   const entries = await fs.readdir(directory, {
     withFileTypes: true,
   });
   for (const entry of entries) {
     /*
      * Do not count our internal
      * recording state JSON files.
      */
     if (entry.name === ".recording-state") {
       continue;
     }
     const fullPath = path.join(
       directory,
       entry.name
     );
     if (entry.isDirectory()) {
       await walk(fullPath);
       continue;
     }
     const stat = await fs.stat(fullPath);
     totalBytes += stat.size;
   }
 }
 try {
   await walk(recordingsDirectory);
   return totalBytes;
 } catch {
   return 0;
 }
}
async function getCameraStatuses(): Promise<
 CameraStatus[]
> {
 /*
  * Reuse the camera status API you
  * already built.
  *
  * We call it through localhost because
  * it also handles status-change events.
  */
 try {
   const baseUrl =
     process.env.APP_URL ??
     process.env.NEXT_PUBLIC_APP_URL ??
     "http://localhost:3000";
   const controller = new AbortController();
   const timeout = setTimeout(() => {
     controller.abort();
   }, CAMERA_TIMEOUT_MS);
   try {
     const response = await fetch(
       `${baseUrl}/api/cameras/status`,
       {
         cache: "no-store",
         signal: controller.signal,
       }
     );
     if (!response.ok) {
       return [];
     }
     const result =
       (await response.json()) as CameraStatus[];
     return Array.isArray(result)
       ? result
       : [];
   } finally {
     clearTimeout(timeout);
   }
 } catch {
   return [];
 }
}
async function getActiveRecordings() {
 const cameras = await prisma.camera.findMany({
   select: {
     id: true,
     name: true,
   },
   orderBy: {
     id: "asc",
   },
 });
 const active = await Promise.all(
   cameras.map(async (camera) => {
     try {
       const state =
         await readRecordingState(camera.id);
       if (!state) {
         return null;
       }
       if (!isProcessRunning(state.pid)) {
         return null;
       }
       return {
         cameraId: camera.id,
         cameraName: camera.name,
         recordingId: state.recordingId,
         pid: state.pid,
         filename: state.filename,
         startedAt: state.startedAt,
       };
     } catch {
       return null;
     }
   })
 );
 return active.filter(
   (
     recording
   ): recording is NonNullable<
     typeof recording
> => recording !== null
 );
}
export async function GET() {
 try {
   const [
     databaseOnline,
     mediaMtxOnline,
     cameraStatuses,
     recordingCount,
     snapshotCount,
     eventCount,
     storageBytes,
     activeRecordings,
   ] = await Promise.all([
     checkDatabase(),
     checkUrl(
       process.env.MEDIAMTX_URL ??
         "http://localhost:8888"
     ),
     getCameraStatuses(),
     prisma.recording.count(),
     prisma.snapshot.count(),
     prisma.event.count(),
     getRecordingStorageBytes(),
     getActiveRecordings(),
   ]);
   /*
    * MEMORY
    */
   const totalMemory = os.totalmem();
   const freeMemory = os.freemem();
   const usedMemory =
     totalMemory - freeMemory;
   const memoryPercent =
     totalMemory > 0
       ? (usedMemory / totalMemory) * 100
       : 0;
   /*
    * CPU
    *
    * loadavg() is normalized against
    * the number of logical processors.
    */
   const cpuCount = os.cpus().length;
   const loadAverage = os.loadavg()[0];
   const cpuPercent =
     cpuCount > 0
       ? Math.min(
           100,
           Math.max(
             0,
             (loadAverage / cpuCount) * 100
           )
         )
       : 0;
   const onlineCameras =
     cameraStatuses.filter(
       (camera) =>
         camera.status === "online"
     ).length;
   const offlineCameras =
     cameraStatuses.filter(
       (camera) =>
         camera.status === "offline"
     ).length;
   const coreOperational =
     databaseOnline && mediaMtxOnline;
   return NextResponse.json(
     {
       ok: true,
       checkedAt: new Date().toISOString(),
       platform: {
         operational: coreOperational,
       },
       resources: {
         cpu: {
           percent: Math.round(cpuPercent),
           logicalProcessors: cpuCount,
           loadAverage,
         },
         memory: {
           percent: Math.round(memoryPercent),
           usedBytes: usedMemory,
           totalBytes: totalMemory,
           usedFormatted:
             formatBytes(usedMemory),
           totalFormatted:
             formatBytes(totalMemory),
         },
         storage: {
           recordingsBytes: storageBytes,
           recordingsFormatted:
             formatBytes(storageBytes),
         },
         uptime: {
           seconds: os.uptime(),
         },
       },
       services: {
         mediaMtx: {
           online: mediaMtxOnline,
         },
         database: {
           online: databaseOnline,
         },
         cameraService: {
           online:
             cameraStatuses.length > 0,
         },
         nextjs: {
           online: true,
         },
       },
       cameras: {
         total: cameraStatuses.length,
         online: onlineCameras,
         offline: offlineCameras,
         items: cameraStatuses,
       },
       recordings: {
         total: recordingCount,
         active: activeRecordings.length,
         activeItems: activeRecordings,
       },
       snapshots: {
         total: snapshotCount,
       },
       events: {
         total: eventCount,
       },
     },
     {
       headers: {
         "Cache-Control":
           "no-store, no-cache, must-revalidate",
       },
     }
   );
 } catch (error) {
   console.error(
     "System status API error:",
     error
   );
   return NextResponse.json(
     {
       ok: false,
       message:
         "Failed to retrieve system status",
     },
     {
       status: 500,
     }
   );
 }
}