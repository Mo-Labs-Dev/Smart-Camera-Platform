"use client";
import {
 Activity,
 Camera,
 CheckCircle2,
 Cpu,
 Database,
 HardDrive,
 MemoryStick,
 RefreshCw,
 Server,
 Video,
 XCircle,
} from "lucide-react";
import {
 useCallback,
 useEffect,
 useState,
} from "react";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";
type SystemStatus = {
 ok: boolean;
 checkedAt: string;
 platform: {
   operational: boolean;
 };
 resources: {
   cpu: {
     percent: number;
     logicalProcessors: number;
     loadAverage: number;
   };
   memory: {
     percent: number;
     usedBytes: number;
     totalBytes: number;
     usedFormatted: string;
     totalFormatted: string;
   };
   storage: {
     recordingsBytes: number;
     recordingsFormatted: string;
   };
   uptime: {
     seconds: number;
   };
 };
 services: {
   mediaMtx: {
     online: boolean;
   };
   database: {
     online: boolean;
   };
   cameraService: {
     online: boolean;
   };
   nextjs: {
     online: boolean;
   };
 };
 cameras: {
   total: number;
   online: number;
   offline: number;
   items: {
     id: number;
     name: string;
     status: "online" | "offline";
   }[];
 };
 recordings: {
   total: number;
   active: number;
   activeItems: {
     cameraId: number;
     cameraName: string;
     recordingId: number;
     pid: number;
     filename: string;
     startedAt: string;
   }[];
 };
 snapshots: {
   total: number;
 };
 events: {
   total: number;
 };
};
function formatUptime(seconds: number) {
 const days = Math.floor(
   seconds / 86400
 );
 const hours = Math.floor(
   (seconds % 86400) / 3600
 );
 const minutes = Math.floor(
   (seconds % 3600) / 60
 );
 if (days > 0) {
   return `${days}d ${hours}h`;
 }
 if (hours > 0) {
   return `${hours}h ${minutes}m`;
 }
 return `${minutes}m`;
}
function ResourceBar({
 value,
}: {
 value: number;
}) {
 const safeValue = Math.min(
   100,
   Math.max(0, value)
 );
 return (
<div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
<div
       className="h-full rounded-full bg-blue-500 transition-all duration-500"
       style={{
         width: `${safeValue}%`,
       }}
     />
</div>
 );
}
function ServiceRow({
 name,
 description,
 online,
 icon: Icon,
}: {
 name: string;
 description: string;
 online: boolean;
 icon: typeof Server;
}) {
 return (
<div className="flex items-center gap-4 px-5 py-4">
<div
       className={`flex h-10 w-10 items-center justify-center rounded-lg ${
         online
           ? "bg-emerald-50 text-emerald-600"
           : "bg-red-50 text-red-500"
       }`}
>
<Icon size={18} />
</div>
<div className="min-w-0 flex-1">
<p className="text-sm font-semibold text-slate-900">
         {name}
</p>
<p className="mt-0.5 text-xs text-slate-500">
         {description}
</p>
</div>
<div
       className={`flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium ${
         online
           ? "bg-emerald-50 text-emerald-700"
           : "bg-red-50 text-red-700"
       }`}
>
       {online ? (
<CheckCircle2 size={14} />
       ) : (
<XCircle size={14} />
       )}
       {online ? "Online" : "Offline"}
</div>
</div>
 );
}
export default function SystemMonitor() {
 /*
  * Platform settings are loaded from:
  *
  * PostgreSQL
  *      ↓
  * /api/settings
  *      ↓
  * usePlatformSettings()
  */
 const {
   settings,
   loading: settingsLoading,
 } = usePlatformSettings();
 /*
  * Convert the configured refresh
  * interval from seconds to milliseconds.
  *
  * Minimum 3 seconds protects against
  * accidentally hammering the API.
  */
 const SYSTEM_REFRESH_MS =
   Math.max(
     3,
     settings.systemRefreshSec
   ) * 1000;
 const [
   status,
   setStatus,
 ] =
   useState<SystemStatus | null>(
     null
   );
 const [
   loading,
   setLoading,
 ] = useState(true);
 const [
   refreshing,
   setRefreshing,
 ] = useState(false);
 const [
   error,
   setError,
 ] =
   useState<string | null>(
     null
   );
 /*
  * Load current system health.
  */
 const loadStatus =
   useCallback(
     async (
       manual = false
     ) => {
       if (manual) {
         setRefreshing(true);
       }
       try {
         const response =
           await fetch(
             "/api/system/status",
             {
               cache: "no-store",
             }
           );
         if (!response.ok) {
           throw new Error(
             `System API returned HTTP ${response.status}`
           );
         }
         const result =
           (await response.json()) as SystemStatus;
         if (!result.ok) {
           throw new Error(
             "System status unavailable"
           );
         }
         setStatus(result);
         setError(null);
       } catch (error) {
         console.error(
           "System status refresh failed:",
           error
         );
         setError(
           error instanceof Error
             ? error.message
             : "Failed to load system status"
         );
       } finally {
         setLoading(false);
         setRefreshing(false);
       }
     },
     []
   );
 /*
  * Automatic system polling.
  *
  * This is now controlled by:
  *
  * Settings →
  * System Refresh
  *
  * Example:
  *
  * 5 sec  → 5000 ms
  * 10 sec → 10000 ms
  * 30 sec → 30000 ms
  */
 useEffect(() => {
   /*
    * Wait until platform settings
    * have been loaded.
    */
   if (settingsLoading) {
     return;
   }
   void loadStatus();
   const interval =
     window.setInterval(
       () => {
         void loadStatus();
       },
       SYSTEM_REFRESH_MS
     );
   return () => {
     window.clearInterval(
       interval
     );
   };
 }, [
   loadStatus,
   settingsLoading,
   SYSTEM_REFRESH_MS,
 ]);
 /*
  * Initial loading state.
  */
 if (
   (loading ||
     settingsLoading) &&
   !status
 ) {
   return (
<main className="min-h-screen bg-slate-50">
<div className="flex min-h-[70vh] items-center justify-center">
<div className="text-center">
<RefreshCw
             size={28}
             className="mx-auto animate-spin text-blue-600"
           />
<p className="mt-3 text-sm font-medium text-slate-700">
             Loading system status...
</p>
</div>
</div>
</main>
   );
 }
 /*
  * No successful status response.
  */
 if (!status) {
   return (
<main className="min-h-screen bg-slate-50">
<div className="px-6 py-6">
<div className="rounded-xl border border-red-200 bg-red-50 p-5">
<p className="font-semibold text-red-700">
             System status unavailable
</p>
<p className="mt-1 text-sm text-red-600">
             {error ??
               "Unable to contact the system API."}
</p>
<button
             type="button"
             onClick={() =>
               void loadStatus(
                 true
               )
             }
             className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white"
>
             Try Again
</button>
</div>
</div>
</main>
   );
 }
 const services = [
   {
     name: "MediaMTX",
     description:
       "Video streaming server",
     online:
       status.services.mediaMtx
         .online,
     icon: Video,
   },
   {
     name: "PostgreSQL",
     description:
       "Application database",
     online:
       status.services.database
         .online,
     icon: Database,
   },
   {
     name: "Camera Service",
     description:
       "Registered camera monitoring",
     online:
       status.services
         .cameraService.online,
     icon: Camera,
   },
   {
     name: "Next.js",
     description:
       "Web application server",
     online:
       status.services.nextjs
         .online,
     icon: Server,
   },
 ];
 return (
<main className="min-h-screen bg-slate-50">
<div className="px-6 py-6">
       {/* HEADER */}
<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
<div>
<h1 className="text-2xl font-bold tracking-tight text-slate-900">
             System
</h1>
<p className="mt-1 text-sm text-slate-500">
             Live platform health,
             services and resource
             usage
</p>
</div>
<div className="flex items-center gap-3">
<div className="text-right">
<p className="flex items-center justify-end gap-1.5 text-xs font-medium text-emerald-600">
<span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
               Live monitoring
</p>
<p className="mt-0.5 text-[11px] text-slate-400">
               Updated{" "}
               {new Date(
                 status.checkedAt
               ).toLocaleTimeString()}
</p>
<p className="mt-0.5 text-[10px] text-slate-400">
               Auto refresh every{" "}
               {
                 settings.systemRefreshSec
               }
               s
</p>
</div>
<button
             type="button"
             onClick={() =>
               void loadStatus(
                 true
               )
             }
             disabled={refreshing}
             title="Refresh now"
             className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
>
<RefreshCw
               size={16}
               className={
                 refreshing
                   ? "animate-spin"
                   : ""
               }
             />
</button>
</div>
</div>
       {/* REFRESH ERROR */}
       {error && (
<div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
           Latest refresh failed:{" "}
           {error}. Showing the
           last successful system
           status.
</div>
       )}
       {/* PLATFORM STATUS */}
<section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
<div className="flex items-center gap-4">
<div
               className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                 status.platform
                   .operational
                   ? "bg-emerald-50 text-emerald-600"
                   : "bg-amber-50 text-amber-600"
               }`}
>
<Activity
                 size={23}
               />
</div>
<div>
<h2 className="text-base font-semibold text-slate-900">
                 Platform Status
</h2>
<p className="mt-1 text-sm text-slate-500">
                 {status.platform
                   .operational
                   ? "All core services operational"
                   : "One or more core services need attention"}
</p>
</div>
</div>
<div
             className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-2 text-sm font-medium ${
               status.platform
                 .operational
                 ? "bg-emerald-50 text-emerald-700"
                 : "bg-amber-50 text-amber-700"
             }`}
>
<span
               className={`h-2 w-2 rounded-full ${
                 status.platform
                   .operational
                   ? "animate-pulse bg-emerald-500"
                   : "bg-amber-500"
               }`}
             />
             {status.platform
               .operational
               ? "Operational"
               : "Attention"}
</div>
</div>
</section>
       {/* RESOURCE CARDS */}
<section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
         {/* CPU */}
<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
<div className="flex items-center justify-between">
<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
<Cpu size={19} />
</div>
<span className="text-xs font-medium text-slate-400">
               CPU
</span>
</div>
<p className="mt-4 text-2xl font-bold text-slate-900">
             {
               status.resources.cpu
                 .percent
             }
             %
</p>
<p className="mt-1 text-xs text-slate-500">
             {
               status.resources.cpu
                 .logicalProcessors
             }{" "}
             logical processors
</p>
<ResourceBar
             value={
               status.resources.cpu
                 .percent
             }
           />
</div>
         {/* MEMORY */}
<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
<div className="flex items-center justify-between">
<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
<MemoryStick
                 size={19}
               />
</div>
<span className="text-xs font-medium text-slate-400">
               Memory
</span>
</div>
<p className="mt-4 text-2xl font-bold text-slate-900">
             {
               status.resources
                 .memory.percent
             }
             %
</p>
<p className="mt-1 text-xs text-slate-500">
             {
               status.resources
                 .memory.usedFormatted
             }{" "}
             /{" "}
             {
               status.resources
                 .memory
                 .totalFormatted
             }
</p>
<ResourceBar
             value={
               status.resources
                 .memory.percent
             }
           />
</div>
         {/* STORAGE */}
<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
<div className="flex items-center justify-between">
<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
<HardDrive
                 size={19}
               />
</div>
<span className="text-xs font-medium text-slate-400">
               Recording Storage
</span>
</div>
<p className="mt-4 text-2xl font-bold text-slate-900">
             {
               status.resources
                 .storage
                 .recordingsFormatted
             }
</p>
<p className="mt-1 text-xs text-slate-500">
             Local recording files
</p>
</div>
         {/* CAMERAS */}
<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
<div className="flex items-center justify-between">
<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
<Camera
                 size={19}
               />
</div>
<span className="text-xs font-medium text-slate-400">
               Cameras
</span>
</div>
<p className="mt-4 text-2xl font-bold text-slate-900">
             {
               status.cameras
                 .total
             }
</p>
<p className="mt-1 text-xs text-slate-500">
             {
               status.cameras
                 .online
             }{" "}
             online ·{" "}
             {
               status.cameras
                 .offline
             }{" "}
             offline
</p>
</div>
</section>
       {/* SERVICES */}
<section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
<div className="border-b border-slate-200 px-5 py-4">
<h2 className="text-sm font-semibold text-slate-900">
             Services
</h2>
<p className="mt-1 text-xs text-slate-500">
             Live core platform
             service status
</p>
</div>
<div className="divide-y divide-slate-100">
           {services.map(
             (service) => (
<ServiceRow
                 key={
                   service.name
                 }
                 {...service}
               />
             )
           )}
</div>
</section>
       {/* CAMERA HEALTH */}
<section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
<div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
<div>
<h2 className="text-sm font-semibold text-slate-900">
               Camera Health
</h2>
<p className="mt-1 text-xs text-slate-500">
               Live RTSP
               connectivity
</p>
</div>
<span className="text-xs text-slate-400">
             {
               status.cameras
                 .online
             }
             /
             {
               status.cameras
                 .total
             }{" "}
             online
</span>
</div>
         {status.cameras.items
           .length === 0 ? (
<div className="px-5 py-8 text-center text-sm text-slate-500">
             No cameras
             registered.
</div>
         ) : (
<div className="divide-y divide-slate-100">
             {status.cameras.items.map(
               (camera) => (
<div
                   key={
camera.id
                   }
                   className="flex items-center gap-4 px-5 py-4"
>
<div
                     className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                       camera.status ===
                       "online"
                         ? "bg-emerald-50 text-emerald-600"
                         : "bg-red-50 text-red-500"
                     }`}
>
<Camera
                       size={
                         17
                       }
                     />
</div>
<div className="min-w-0 flex-1">
<p className="truncate text-sm font-semibold text-slate-900">
                       {
                         camera.name
                       }
</p>
<p className="mt-0.5 text-xs text-slate-400">
                       Camera #
                       {
camera.id
                       }
</p>
</div>
<div
                     className={`flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium ${
                       camera.status ===
                       "online"
                         ? "bg-emerald-50 text-emerald-700"
                         : "bg-red-50 text-red-700"
                     }`}
>
<span
                       className={`h-2 w-2 rounded-full ${
                         camera.status ===
                         "online"
                           ? "animate-pulse bg-emerald-500"
                           : "bg-red-500"
                       }`}
                     />
                     {camera.status ===
                     "online"
                       ? "Online"
                       : "Offline"}
</div>
</div>
               )
             )}
</div>
         )}
</section>
       {/* ACTIVE RECORDINGS */}
<section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
<div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
<div>
<h2 className="text-sm font-semibold text-slate-900">
               Active Recordings
</h2>
<p className="mt-1 text-xs text-slate-500">
               FFmpeg recording
               processes
</p>
</div>
           {status.recordings
             .active > 0 ? (
<span className="flex items-center gap-2 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
<span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
               {
                 status.recordings
                   .active
               }{" "}
               recording
</span>
           ) : (
<span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
               None
</span>
           )}
</div>
         {status.recordings
           .activeItems.length ===
         0 ? (
<div className="flex flex-col items-center justify-center py-10">
<Video
               size={26}
               className="text-slate-300"
             />
<p className="mt-3 text-sm font-medium text-slate-600">
               No active recordings
</p>
</div>
         ) : (
<div className="divide-y divide-slate-100">
             {status.recordings.activeItems.map(
               (recording) => (
<div
                   key={
                     recording.recordingId
                   }
                   className="flex items-center gap-4 px-5 py-4"
>
<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
<Video
                       size={
                         18
                       }
                     />
</div>
<div className="min-w-0 flex-1">
<div className="flex items-center gap-2">
<p className="truncate text-sm font-semibold text-slate-900">
                         {
                           recording.cameraName
                         }
</p>
<span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
</div>
<p className="mt-0.5 truncate text-xs text-slate-500">
                       {
                         recording.filename
                       }
</p>
</div>
<div className="hidden text-right sm:block">
<p className="text-xs font-medium text-slate-600">
                       PID{" "}
                       {
                         recording.pid
                       }
</p>
<p className="mt-0.5 text-xs text-slate-400">
                       Recording #
                       {
                         recording.recordingId
                       }
</p>
</div>
</div>
               )
             )}
</div>
         )}
</section>
       {/* COUNTS */}
<section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
<p className="text-xs uppercase tracking-wide text-slate-400">
             Recordings
</p>
<p className="mt-2 text-2xl font-bold text-slate-900">
             {
               status.recordings
                 .total
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
               status.snapshots
                 .total
             }
</p>
<p className="mt-1 text-xs text-slate-500">
             Captured images
</p>
</div>
<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
<p className="text-xs uppercase tracking-wide text-slate-400">
             Events
</p>
<p className="mt-2 text-2xl font-bold text-slate-900">
             {
               status.events
                 .total
             }
</p>
<p className="mt-1 text-xs text-slate-500">
             System events
</p>
</div>
<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
<p className="text-xs uppercase tracking-wide text-slate-400">
             Uptime
</p>
<p className="mt-2 text-2xl font-bold text-slate-900">
             {formatUptime(
               status.resources
                 .uptime.seconds
             )}
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