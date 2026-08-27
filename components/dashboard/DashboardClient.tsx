"use client";
import {
 useEffect,
 useMemo,
 useState,
} from "react";
import {
 CalendarDays,
 Camera,
 CheckCircle2,
 Folder,
 Monitor,
 VideoOff,
} from "lucide-react";
import Header from "./Header";
import LiveCameras, {
 type DashboardCamera,
} from "./LiveCameras";
import StatCard from "./StatCard";
import StatusPanel from "./StatusPanel";
type CameraStatus = {
 id: number;
 name: string;
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
type DashboardClientProps = {
 cameras: DashboardCameraBase[];
 events24h: number;
 totalRecordings: number;
 totalSnapshots: number;
 recentEvents: RecentEvent[];
};
export default function DashboardClient({
 cameras: cameraConfig,
 events24h,
 totalRecordings,
 totalSnapshots,
 recentEvents,
}: DashboardClientProps) {
 const [statuses, setStatuses] =
   useState<CameraStatus[]>([]);
 const [
   statusLoading,
   setStatusLoading,
 ] = useState(true);
 useEffect(() => {
   let cancelled = false;
   async function loadStatus() {
     try {
       const response =
         await fetch(
           "/api/cameras/status",
           {
             cache: "no-store",
           }
         );
       if (!response.ok) {
         throw new Error(
           "Unable to load camera status"
         );
       }
       const data =
         await response.json();
       if (
         !cancelled &&
         Array.isArray(data)
       ) {
         setStatuses(
           data as CameraStatus[]
         );
       }
     } catch (error) {
       console.error(
         "Unable to load camera status:",
         error
       );
     } finally {
       if (!cancelled) {
         setStatusLoading(
           false
         );
       }
     }
   }
   loadStatus();
   const interval =
     window.setInterval(
       loadStatus,
       10000
     );
   return () => {
     cancelled = true;
     window.clearInterval(
       interval
     );
   };
 }, []);
 const cameras =
   useMemo<
     DashboardCamera[]
>(() => {
     const hlsBaseUrl =
       process.env
         .NEXT_PUBLIC_MEDIAMTX_HLS_BASE_URL ??
       "http://localhost:8888";
     return cameraConfig.map(
       (camera) => {
         const currentStatus =
           statuses.find(
             (status) =>
status.id ===
camera.id
           );
         const status =
           currentStatus?.status ??
           ("offline" as const);
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
     statuses,
   ]);
 const totalCameras =
   cameras.length;
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
 return (
<>
<Header />
<section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
<StatCard
         title="Total Cameras"
         value={
           totalCameras
         }
         subtitle="All cameras registered"
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
         subtitle="Cameras online"
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
         subtitle="Cameras offline"
         icon={VideoOff}
         color="red"
       />
<StatCard
         title="Events (24h)"
         value={events24h}
         subtitle="Total events"
         icon={
           CalendarDays
         }
         color="orange"
       />
</section>
<section className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
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
         subtitle="Saved snapshots"
         icon={Camera}
         color="green"
       />
</section>
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
</>
 );
}