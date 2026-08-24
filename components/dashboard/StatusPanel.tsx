import {
 Activity,
 Bell,
 Camera,
 FileDown,
 Settings,
 Video,
} from "lucide-react";
const events = [
 {
   title: "Camera 1 offline",
   time: "2 min ago",
   type: "warning",
 },
 {
   title: "Camera 3 disconnected",
   time: "18 min ago",
   type: "warning",
 },
 {
   title: "System check completed",
   time: "1 hour ago",
   type: "success",
 },
];
export default function StatusPanel() {
 return (
<aside className="space-y-6">
<section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
<div className="flex items-center justify-between">
<div>
<h2 className="font-semibold text-slate-900">Status Overview</h2>
<p className="mt-1 text-sm text-slate-500">
             Current camera availability
</p>
</div>
<Activity size={20} className="text-blue-600" />
</div>
<div className="mt-6 flex justify-center">
<div className="flex h-36 w-36 items-center justify-center rounded-full border-[12px] border-slate-100">
<div className="text-center">
<p className="text-3xl font-bold text-slate-900">0%</p>
<p className="text-xs text-slate-500">Online</p>
</div>
</div>
</div>
<div className="mt-6 grid grid-cols-2 gap-3">
<div className="rounded-xl bg-emerald-50 p-3">
<p className="text-xs font-medium text-emerald-600">Online</p>
<p className="mt-1 text-xl font-bold text-slate-900">0</p>
</div>
<div className="rounded-xl bg-red-50 p-3">
<p className="text-xs font-medium text-red-500">Offline</p>
<p className="mt-1 text-xl font-bold text-slate-900">4</p>
</div>
</div>
</section>
<section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
<div className="flex items-center gap-2">
<Bell size={18} className="text-slate-600" />
<h2 className="font-semibold text-slate-900">Recent Events</h2>
</div>
<div className="mt-4 space-y-4">
         {events.map((event) => (
<div
             key={`${event.title}-${event.time}`}
             className="flex items-start gap-3"
>
<div
               className={`mt-1 h-2.5 w-2.5 rounded-full ${
                 event.type === "success"
                   ? "bg-emerald-500"
                   : "bg-amber-500"
               }`}
             />
<div className="min-w-0">
<p className="text-sm font-medium text-slate-800">
                 {event.title}
</p>
<p className="text-xs text-slate-500">{event.time}</p>
</div>
</div>
         ))}
</div>
</section>
<section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
<h2 className="font-semibold text-slate-900">Quick Actions</h2>
<div className="mt-4 grid grid-cols-2 gap-3">
<button className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 p-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
<Camera size={21} />
           Add Camera
</button>
<button className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 p-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
<Settings size={21} />
           Settings
</button>
<button className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 p-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
<Video size={21} />
           Recordings
</button>
<button className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 p-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
<FileDown size={21} />
           Export
</button>
</div>
</section>
</aside>
 );
}