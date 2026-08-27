"use client";
import Link from "next/link";
import {
 ArrowRight,
 Camera,
 ExternalLink,
 Grid2X2,
 VideoOff,
} from "lucide-react";
import CameraCard from "./CameraCard";
export type DashboardCamera = {
 id: number;
 name: string;
 location: string;
 status: "online" | "offline";
 host?: string | null;
 streamPath?: string | null;
 streamUrl?: string;
};
type LiveCamerasProps = {
 cameras: DashboardCamera[];
};
export default function LiveCameras({
 cameras,
}: LiveCamerasProps) {
 /*
  * Dashboard is only a quick preview.
  * The full CCTV controls now live
  * inside /cameras.
  */
 const previewCameras = cameras.slice(0, 4);
 const onlineCount = cameras.filter(
   (camera) => camera.status === "online"
 ).length;
 const offlineCount = cameras.filter(
   (camera) => camera.status === "offline"
 ).length;
 return (
<section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
     {/* Header */}
<div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
<div>
<div className="flex items-center gap-2">
<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
<Camera size={18} />
</div>
<div>
<h2 className="text-lg font-bold text-slate-900">
               Live Cameras
</h2>
<p className="mt-0.5 text-sm text-slate-500">
               Quick camera monitoring overview
</p>
</div>
</div>
</div>
<Link
         href="/cameras"
         className="flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700"
>
<Grid2X2 size={16} />
         Open CCTV Console
<ArrowRight size={15} />
</Link>
</div>
     {/* Camera status summary */}
<div className="flex flex-wrap items-center gap-3 border-b border-slate-100 bg-slate-50/60 px-5 py-3">
<div className="flex items-center gap-2">
<span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_7px_rgba(16,185,129,0.65)]" />
<span className="text-xs font-medium text-slate-600">
           {onlineCount} Online
</span>
</div>
<div className="h-4 w-px bg-slate-200" />
<div className="flex items-center gap-2">
<span className="h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_7px_rgba(239,68,68,0.45)]" />
<span className="text-xs font-medium text-slate-600">
           {offlineCount} Offline
</span>
</div>
<div className="h-4 w-px bg-slate-200" />
<span className="text-xs text-slate-400">
         {cameras.length} total cameras
</span>
</div>
     {/* No cameras */}
     {cameras.length === 0 ? (
<div className="flex min-h-72 items-center justify-center p-6">
<div className="text-center">
<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
<VideoOff
               size={26}
               className="text-slate-400"
             />
</div>
<p className="mt-4 text-sm font-semibold text-slate-800">
             No cameras registered
</p>
<p className="mt-1 text-xs text-slate-500">
             Add your first camera from the CCTV console.
</p>
<Link
             href="/cameras"
             className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-4 text-xs font-medium text-white transition hover:bg-blue-700"
>
             Open Cameras
<ArrowRight size={14} />
</Link>
</div>
</div>
     ) : (
<>
         {/* Camera preview grid */}
<div className="grid grid-cols-1 gap-4 p-5 xl:grid-cols-2">
           {previewCameras.map((camera) => (
<CameraCard
               key={camera.id}
               id={camera.id}
               name={camera.name}
               location={camera.location}
               status={camera.status}
               streamUrl={camera.streamUrl}
             />
           ))}
</div>
         {/* Footer */}
<div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
<div>
<p className="text-xs font-medium text-slate-600">
               Dashboard Preview
</p>
<p className="mt-0.5 text-[11px] text-slate-400">
               Use the CCTV console for Grid, Patrol and camera
               management.
</p>
</div>
<Link
             href="/cameras"
             className="flex items-center gap-2 text-sm font-medium text-blue-600 transition hover:text-blue-700"
>
             View all cameras
<ExternalLink size={14} />
</Link>
</div>
</>
     )}
</section>
 );
}