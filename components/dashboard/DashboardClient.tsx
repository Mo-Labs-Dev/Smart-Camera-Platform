"use client";
import Link from "next/link";
import {
 useCallback,
 useEffect,
 useMemo,
 useState,
} from "react";
import {
 Activity,
 CalendarDays,
 Camera,
 CheckCircle2,
 Database,
 Folder,
 HardDrive,
 Monitor,
 RefreshCw,
 Server,
 Video,
 VideoOff,
} from "lucide-react";
import Header from "./Header";
import LiveCameras, {
 type DashboardCamera,
} from "./LiveCameras";
import StatCard from "./StatCard";
import StatusPanel from "./StatusPanel";
import {
 usePlatformSettings,
} from "@/hooks/usePlatformSettings";
type CameraStatus = {
 id: number;
 name?: string;
 status: "online" | "offline";
};
type RecentEvent = {
 id: number;
 type: string;
 message: string;
 createdAt: string;
 cameraName: string | null;
};
type DashboardCameraBase = {
 id: number;
 name: string;
 location: string;
 host: string | null;
 streamPath: string | null;
};
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
   items: CameraStatus[];
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
type DashboardClientProps = {
 cameras: DashboardCameraBase[];
 initialEvents24h: number;
 initialTotalRecordings: number;
 initialTotalSnapshots: number;
 recentEvents: RecentEvent[];
};
function MiniHealth({
 label,
 online,
 icon: Icon,
}: {
 label: string;
 online: boolean;
 icon: typeof Server;
}) {
 return (
<div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
<div className="flex items-center gap-2.5">
<div
         className={`flex h-8 w-8 items-center justify-center rounded-lg ${
           online
             ? "bg-emerald-50 text-emerald-600"
             : "bg-red-50 text-red-500"
         }`}
>
<Icon size={15} />
</div>
<span className="text-xs font-medium text-slate-700">
         {label}
</span>
</div>
<span
       className={`h-2.5 w-2.5 rounded-full ${
         online
           ? "bg-emerald-500"
           : "bg-red-500"
       }`}
     />
</div>
 );
}
function ResourceMeter({
 label,
 value,
}: {
 label: string;
 value: number;
}) {
 const safeValue = Math.max(
   0,
   Math.min(100, value)
 );
 return (
<div>
<div className="mb-2 flex items-center justify-between">
<span className="text-xs font-medium text-slate-500">
         {label}
</span>
<span className="text-xs font-semibold text-slate-700">
         {Math.round(safeValue)}%
</span>
</div>
<div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
<div
         className="h-full rounded-full bg-blue-500 transition-all duration-500"
         style={{
           width: `${safeValue}%`,
         }}
       />
</div>
</div>
 );
}
export default function DashboardClient({
 cameras: cameraConfig,
 initialEvents24h,
 initialTotalRecordings,
 initialTotalSnapshots,
 recentEvents,
}: DashboardClientProps) {
 const { settings } =
   usePlatformSettings();
 const SYSTEM_REFRESH_MS =
   Math.max(
     3,
     settings.systemRefreshSec
   ) * 1000;
 const CAMERA_REFRESH_MS =
   Math.max(
     3,
     settings.cameraStatusRefreshSec
   ) * 1000;
 const [
   systemStatus,
   setSystemStatus,
 ] =
   useState<SystemStatus | null>(
     null
   );
 const [
   cameraStatuses,
   setCameraStatuses,
 ] = useState<CameraStatus[]>([]);
 const [
   refreshing,
   setRefreshing,
 ] = useState(false);
 const [
   statusLoading,
   setStatusLoading,
 ] = useState(true);
 const [
   error,
   setError,
 ] =
   useState<string | null>(
     null
   );
 /*
  * SYSTEM STATUS
  *
  * CPU, RAM, services,
  * recordings, storage, etc.
  */
 const loadSystemStatus =
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
               cache:
                 "no-store",
             }
           );
         if (!response.ok) {
           throw new Error(
             `System API returned HTTP ${response.status}`
           );
         }
         const contentType =
           response.headers.get(
             "content-type"
           );
         if (
           !contentType?.includes(
             "application/json"
           )
         ) {
           throw new Error(
             "System API returned an invalid response"
           );
         }
         const result =
           (await response.json()) as SystemStatus;
         if (!result.ok) {
           throw new Error(
             "System status unavailable"
           );
         }
         setSystemStatus(
           result
         );
         setError(null);
       } catch (error) {
         console.error(
           "Dashboard system status error:",
           error
         );
         setError(
           error instanceof Error
             ? error.message
             : "Unable to load live status"
         );
       } finally {
         setRefreshing(
           false
         );
       }
     },
     []
   );
 /*
  * CAMERA STATUS
  *
  * Use the exact same endpoint
  * as the working Cameras page.
  */
 const loadCameraStatuses =
   useCallback(
     async () => {
       try {
         const response =
           await fetch(
             "/api/cameras/status",
             {
               cache:
                 "no-store",
             }
           );
         if (!response.ok) {
           throw new Error(
             `Camera status API returned HTTP ${response.status}`
           );
         }
         const result =
           await response.json();
         /*
          * Support both API shapes:
          *
          * [...]
          *
          * and
          *
          * { cameras: [...] }
          */
         const nextStatuses: CameraStatus[] =
           Array.isArray(
             result
           )
             ? result
             : Array.isArray(
                   result?.cameras
                 )
               ? result.cameras
               : [];
         setCameraStatuses(
           nextStatuses
         );
       } catch (error) {
         console.error(
           "Dashboard camera status error:",
           error
         );
       } finally {
         setStatusLoading(
           false
         );
       }
     },
     []
   );
 /*
  * System polling.
  */
 useEffect(() => {
   void loadSystemStatus();
   const interval =
     window.setInterval(
       () => {
         void loadSystemStatus();
       },
       SYSTEM_REFRESH_MS
     );
   return () => {
     window.clearInterval(
       interval
     );
   };
 }, [
   loadSystemStatus,
   SYSTEM_REFRESH_MS,
 ]);
 /*
  * Camera polling.
  */
 useEffect(() => {
   void loadCameraStatuses();
   const interval =
     window.setInterval(
       () => {
         void loadCameraStatuses();
       },
       CAMERA_REFRESH_MS
     );
   return () => {
     window.clearInterval(
       interval
     );
   };
 }, [
   loadCameraStatuses,
   CAMERA_REFRESH_MS,
 ]);
 /*
  * Build dashboard camera feeds
  * from dedicated camera status.
  */
 const cameras =
   useMemo<
     DashboardCamera[]
>(() => {
     const hlsBaseUrl =
       (
         process.env
           .NEXT_PUBLIC_MEDIAMTX_HLS_BASE_URL ??
         "http://localhost:8888"
       ).replace(
         /\/$/,
         ""
       );
     return cameraConfig.map(
       (camera) => {
         const currentStatus =
           cameraStatuses.find(
             (item) =>
item.id ===
camera.id
           );
         const status:
           | "online"
           | "offline" =
           currentStatus?.status ??
           "offline";
         const streamUrl =
           camera.streamPath
             ? `${hlsBaseUrl}/${camera.streamPath}/index.m3u8`
             : undefined;
         return {
           id: camera.id,
           name: camera.name,
           location:
             camera.location,
           host: camera.host,
           streamPath:
             camera.streamPath,
           status,
           streamUrl,
         };
       }
     );
   }, [
     cameraConfig,
     cameraStatuses,
   ]);
 /*
  * Camera statistics now use
  * the same dedicated status data
  * as the video cards.
  */
 const totalCameras =
   cameraConfig.length;
 const onlineCameras =
   cameras.filter(
     (camera) =>
       camera.status ===
       "online"
   ).length;
 const offlineCameras =
   cameras.filter(
     (camera) =>
       camera.status ===
       "offline"
   ).length;
 const totalRecordings =
   systemStatus?.recordings
     .total ??
   initialTotalRecordings;
 const totalSnapshots =
   systemStatus?.snapshots
     .total ??
   initialTotalSnapshots;
 const activeRecordings =
   systemStatus?.recordings
     .active ?? 0;
 const storage =
   systemStatus?.resources
     .storage
     .recordingsFormatted ??
   "—";
 const cpu =
   systemStatus?.resources
     .cpu.percent ?? 0;
 const memory =
   systemStatus?.resources
     .memory.percent ?? 0;
 const platformOperational =
   systemStatus?.platform
     .operational ?? false;
 async function handleRefresh() {
   setRefreshing(true);
   await Promise.all([
     loadSystemStatus(),
     loadCameraStatuses(),
   ]);
   setRefreshing(false);
 }
 return (
<>
<Header />
     {/* LIVE STATUS STRIP */}
<section className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
<div className="flex items-center gap-3">
<div
           className={`flex h-10 w-10 items-center justify-center rounded-xl ${
             platformOperational
               ? "bg-emerald-50 text-emerald-600"
               : "bg-amber-50 text-amber-600"
           }`}
>
<Activity
             size={19}
           />
</div>
<div>
<div className="flex items-center gap-2">
<p className="text-sm font-semibold text-slate-900">
               Platform
</p>
<span
               className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                 platformOperational
                   ? "bg-emerald-50 text-emerald-700"
                   : "bg-amber-50 text-amber-700"
               }`}
>
<span
                 className={`h-1.5 w-1.5 rounded-full ${
                   platformOperational
                     ? "animate-pulse bg-emerald-500"
                     : "bg-amber-500"
                 }`}
               />
               {statusLoading
                 ? "Checking"
                 : platformOperational
                   ? "Operational"
                   : "Attention"}
</span>
</div>
<p className="mt-0.5 text-xs text-slate-500">
             Smart Camera Platform live monitoring
</p>
</div>
</div>
<div className="flex flex-wrap items-center gap-3">
         {systemStatus && (
<p className="text-xs text-slate-400">
             Last update{" "}
             {new Date(
               systemStatus.checkedAt
             ).toLocaleTimeString()}
</p>
         )}
<button
           type="button"
           onClick={() =>
             void handleRefresh()
           }
           disabled={
             refreshing
           }
           className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
>
<RefreshCw
             size={14}
             className={
               refreshing
                 ? "animate-spin"
                 : ""
             }
           />
           Refresh
</button>
</div>
</section>
     {error && (
<div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
         Live system refresh
         failed: {error}.
         Showing the last
         available information.
</div>
     )}
     {/* PRIMARY STATISTICS */}
<section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
<StatCard
         title="Total Cameras"
         value={
           totalCameras
         }
         subtitle="Registered cameras"
         icon={Monitor}
         color="blue"
       />
<StatCard
         title="Online"
         value={
           statusLoading
             ? "..."
             : onlineCameras
         }
         subtitle={`${
           totalCameras > 0
             ? Math.round(
                 (onlineCameras /
                   totalCameras) *
                   100
               )
             : 0
         }% camera availability`}
         icon={
           CheckCircle2
         }
         color="green"
       />
<StatCard
         title="Offline"
         value={
           statusLoading
             ? "..."
             : offlineCameras
         }
         subtitle={
           offlineCameras ===
           0
             ? "All cameras healthy"
             : "Requires attention"
         }
         icon={VideoOff}
         color="red"
       />
<StatCard
         title="Events (24h)"
         value={
           initialEvents24h
         }
         subtitle="Recent activity"
         icon={
           CalendarDays
         }
         color="orange"
       />
</section>
     {/* RECORDING STATISTICS */}
<section className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
<StatCard
         title="Recordings"
         value={
           totalRecordings
         }
         subtitle="Saved recordings"
         icon={Folder}
         color="blue"
       />
<StatCard
         title="Snapshots"
         value={
           totalSnapshots
         }
         subtitle="Captured images"
         icon={Camera}
         color="green"
       />
<StatCard
         title="Active Recording"
         value={
           activeRecordings
         }
         subtitle={
           activeRecordings >
           0
             ? "FFmpeg recording now"
             : "No active recordings"
         }
         icon={Video}
         color={
           activeRecordings >
           0
             ? "red"
             : "blue"
         }
       />
<StatCard
         title="Storage Used"
         value={storage}
         subtitle="Recording storage"
         icon={HardDrive}
         color="orange"
       />
</section>
     {/* LIVE CAMERA AREA */}
<div className="mt-6 grid grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,1fr)_320px]">
<LiveCameras
         cameras={cameras}
       />
<StatusPanel
         online={
           onlineCameras
         }
         offline={
           offlineCameras
         }
         recentEvents={
           recentEvents
         }
       />
</div>
     {/* PLATFORM HEALTH */}
<section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
<div className="flex items-center justify-between">
<div>
<h2 className="text-sm font-semibold text-slate-900">
               System Resources
</h2>
<p className="mt-1 text-xs text-slate-500">
               Live server
               resource usage
</p>
</div>
<Link
             href="/system"
             className="text-xs font-semibold text-blue-600 transition hover:text-blue-700"
>
             View System →
</Link>
</div>
<div className="mt-6 space-y-5">
<ResourceMeter
             label="CPU usage"
             value={cpu}
           />
<ResourceMeter
             label="Memory usage"
             value={memory}
           />
</div>
<div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
<div className="rounded-xl bg-slate-50 p-4">
<p className="text-xs text-slate-500">
               Recording storage
</p>
<p className="mt-1 text-lg font-bold text-slate-900">
               {storage}
</p>
</div>
<div className="rounded-xl bg-slate-50 p-4">
<p className="text-xs text-slate-500">
               Active recordings
</p>
<div className="mt-1 flex items-center gap-2">
<p className="text-lg font-bold text-slate-900">
                 {
                   activeRecordings
                 }
</p>
               {activeRecordings >
                 0 && (
<span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
               )}
</div>
</div>
</div>
</div>
       {/* SERVICE HEALTH */}
<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
<div>
<h2 className="text-sm font-semibold text-slate-900">
             Service Health
</h2>
<p className="mt-1 text-xs text-slate-500">
             Core infrastructure
</p>
</div>
<div className="mt-4 space-y-2">
<MiniHealth
             label="MediaMTX"
             online={
               systemStatus
                 ?.services
                 .mediaMtx
                 .online ??
               false
             }
             icon={Video}
           />
<MiniHealth
             label="PostgreSQL"
             online={
               systemStatus
                 ?.services
                 .database
                 .online ??
               false
             }
             icon={Database}
           />
<MiniHealth
             label="Camera Service"
             online={
               systemStatus
                 ?.services
                 .cameraService
                 .online ??
               false
             }
             icon={Camera}
           />
<MiniHealth
             label="Next.js"
             online={
               systemStatus
                 ?.services
                 .nextjs
                 .online ??
               true
             }
             icon={Server}
           />
</div>
</div>
</section>
     {/* QUICK ACTIONS */}
<section className="mt-6">
<div className="mb-3">
<h2 className="text-sm font-semibold text-slate-900">
           Quick Access
</h2>
</div>
<div className="grid grid-cols-2 gap-3 md:grid-cols-4">
<Link
           href="/cameras"
           className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/30"
>
<Camera
             size={19}
             className="text-blue-600"
           />
<p className="mt-3 text-sm font-semibold text-slate-900">
             Cameras
</p>
<p className="mt-1 text-xs text-slate-500">
             Live monitoring
</p>
</Link>
<Link
           href="/recordings"
           className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/30"
>
<Video
             size={19}
             className="text-blue-600"
           />
<p className="mt-3 text-sm font-semibold text-slate-900">
             Recordings
</p>
<p className="mt-1 text-xs text-slate-500">
             Video archive
</p>
</Link>
<Link
           href="/events"
           className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/30"
>
<Activity
             size={19}
             className="text-blue-600"
           />
<p className="mt-3 text-sm font-semibold text-slate-900">
             Events
</p>
<p className="mt-1 text-xs text-slate-500">
             Activity history
</p>
</Link>
<Link
           href="/system"
           className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/30"
>
<Server
             size={19}
             className="text-blue-600"
           />
<p className="mt-3 text-sm font-semibold text-slate-900">
             System
</p>
<p className="mt-1 text-xs text-slate-500">
             Platform health
</p>
</Link>
</div>
</section>
</>
 );
}