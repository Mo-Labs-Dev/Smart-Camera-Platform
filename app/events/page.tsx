import {
 Bell,
 Camera,
 CircleAlert,
 CircleCheck,
 CircleX,
 Video,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
function getEventStyle(type: string) {
 switch (type) {
   case "recording_started":
     return {
       icon: Video,
       iconClass:
         "bg-red-50 text-red-600",
       badgeClass:
         "bg-red-50 text-red-700",
       label: "Recording Started",
     };
   case "recording_stopped":
     return {
       icon: CircleCheck,
       iconClass:
         "bg-emerald-50 text-emerald-600",
       badgeClass:
         "bg-emerald-50 text-emerald-700",
       label: "Recording Completed",
     };
   case "snapshot_created":
     return {
       icon: Camera,
       iconClass:
         "bg-blue-50 text-blue-600",
       badgeClass:
         "bg-blue-50 text-blue-700",
       label: "Snapshot",
     };
   case "camera_online":
     return {
       icon: CircleCheck,
       iconClass:
         "bg-emerald-50 text-emerald-600",
       badgeClass:
         "bg-emerald-50 text-emerald-700",
       label: "Camera Online",
     };
   case "camera_offline":
     return {
       icon: CircleX,
       iconClass:
         "bg-slate-100 text-slate-600",
       badgeClass:
         "bg-slate-100 text-slate-600",
       label: "Camera Offline",
     };
   case "recording_failed":
     return {
       icon: CircleAlert,
       iconClass:
         "bg-amber-50 text-amber-600",
       badgeClass:
         "bg-amber-50 text-amber-700",
       label: "Recording Failed",
     };
   default:
     return {
       icon: Bell,
       iconClass:
         "bg-slate-100 text-slate-600",
       badgeClass:
         "bg-slate-100 text-slate-600",
       label: type.replaceAll("_", " "),
     };
 }
}
export default async function EventsPage() {
 const events = await prisma.event.findMany({
   include: {
     camera: true,
   },
   orderBy: {
     createdAt: "desc",
   },
   take: 200,
 });
 return (
<main className="min-h-screen bg-slate-50">
<div className="px-6 py-6">
<div className="mb-5">
<h1 className="text-2xl font-bold tracking-tight text-slate-900">
           Events
</h1>
<p className="mt-1 text-sm text-slate-500">
           Camera activity and system events
</p>
</div>
<section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
<div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
<div>
<h2 className="text-sm font-semibold text-slate-900">
               Event Log
</h2>
<p className="mt-0.5 text-xs text-slate-500">
               {events.length} recent events
</p>
</div>
<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
<Bell size={17} />
</div>
</div>
         {events.length === 0 ? (
<div className="flex flex-col items-center justify-center py-16">
<Bell
               size={30}
               className="text-slate-300"
             />
<p className="mt-3 text-sm font-medium text-slate-700">
               No events yet
</p>
<p className="mt-1 text-xs text-slate-500">
               Camera activity will appear here.
</p>
</div>
         ) : (
<div className="divide-y divide-slate-100">
             {events.map((event) => {
               const style =
                 getEventStyle(event.type);
               const Icon = style.icon;
               return (
<div
                   key={event.id}
                   className="flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50"
>
<div
                     className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${style.iconClass}`}
>
<Icon size={18} />
</div>
<div className="min-w-0 flex-1">
<div className="flex flex-wrap items-center gap-2">
<p className="text-sm font-semibold text-slate-900">
                         {event.camera?.name ??
                           "System"}
</p>
<span
                         className={`rounded-md px-2 py-1 text-[11px] font-medium ${style.badgeClass}`}
>
                         {style.label}
</span>
</div>
<p className="mt-1 text-sm text-slate-500">
                       {event.message}
</p>
                     {event.camera?.location && (
<p className="mt-1 text-xs text-slate-400">
                         {event.camera.location}
</p>
                     )}
</div>
<div className="shrink-0 text-right">
<p className="text-xs font-medium text-slate-600">
                       {event.createdAt.toLocaleDateString()}
</p>
<p className="mt-0.5 text-xs text-slate-400">
                       {event.createdAt.toLocaleTimeString([], {
                         hour: "2-digit",
                         minute: "2-digit",
                         second: "2-digit",
                       })}
</p>
</div>
</div>
               );
             })}
</div>
         )}
</section>
</div>
</main>
 );
}