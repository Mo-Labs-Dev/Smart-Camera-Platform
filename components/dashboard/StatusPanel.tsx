type RecentEvent = {
 id: number;
 type: string;
 message: string;
 createdAt: string;
 cameraName: string | null;
};
type StatusPanelProps = {
 online: number;
 offline: number;
 recentEvents: RecentEvent[];
};
function formatEventType(type: string) {
 return type
   .replaceAll("_", " ")
   .replace(/\b\w/g, (char) =>
     char.toUpperCase()
   );
}
function formatRelativeTime(dateValue: string) {
 const date = new Date(dateValue);
 const diffMs = Date.now() - date.getTime();
 const minutes = Math.floor(
   diffMs / 60000
 );
 if (minutes < 1) {
   return "just now";
 }
 if (minutes < 60) {
   return `${minutes} min ago`;
 }
 const hours = Math.floor(
   minutes / 60
 );
 if (hours < 24) {
   return `${hours} ${
     hours === 1 ? "hour" : "hours"
   } ago`;
 }
 const days = Math.floor(
   hours / 24
 );
 return `${days} ${
   days === 1 ? "day" : "days"
 } ago`;
}
export default function StatusPanel({
 online,
 offline,
 recentEvents,
}: StatusPanelProps) {
 const total =
   online + offline;
 const onlinePercent =
   total === 0
     ? 0
     : Math.round(
         (online / total) * 100
       );
 const offlinePercent =
   total === 0
     ? 0
     : 100 - onlinePercent;
 return (
<div className="space-y-6">
<section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
<div className="mb-5">
<h2 className="text-base font-semibold text-slate-900">
           Status Overview
</h2>
<p className="mt-1 text-sm text-slate-500">
           Current camera availability
</p>
</div>
<div className="space-y-4">
<div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
<div className="flex items-center justify-between">
<div>
<p className="text-sm font-medium text-emerald-700">
                 Online
</p>
<p className="mt-1 text-2xl font-bold text-slate-900">
                 {online}
</p>
</div>
<p className="text-lg font-semibold text-emerald-600">
               {onlinePercent}%
</p>
</div>
</div>
<div className="rounded-xl border border-red-100 bg-red-50/60 p-4">
<div className="flex items-center justify-between">
<div>
<p className="text-sm font-medium text-red-700">
                 Offline
</p>
<p className="mt-1 text-2xl font-bold text-slate-900">
                 {offline}
</p>
</div>
<p className="text-lg font-semibold text-red-600">
               {offlinePercent}%
</p>
</div>
</div>
<div className="border-t border-slate-100 pt-4">
<div className="flex items-center justify-between">
<span className="text-sm text-slate-500">
               Total cameras
</span>
<span className="text-sm font-semibold text-slate-900">
               {total}
</span>
</div>
</div>
</div>
</section>
<section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
<div className="mb-4">
<h2 className="text-base font-semibold text-slate-900">
           Recent Events
</h2>
<p className="mt-1 text-sm text-slate-500">
           Latest system activity
</p>
</div>
       {recentEvents.length === 0 ? (
<p className="text-sm text-slate-500">
           No recent events.
</p>
       ) : (
<div className="space-y-4">
           {recentEvents.map(
             (event) => (
<div
                 key={event.id}
                 className="border-b border-slate-100 pb-4 last:border-0 last:pb-0"
>
<div className="flex items-start gap-3">
<span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
<div className="min-w-0 flex-1">
<p className="text-sm font-medium text-slate-800">
                       {event.cameraName ??
                         "System"}
</p>
<p className="mt-0.5 text-xs text-slate-500">
                       {formatEventType(
                         event.type
                       )}
</p>
<p className="mt-1 text-xs text-slate-400">
                       {event.message}
</p>
<p className="mt-1 text-[11px] text-slate-400">
                       {formatRelativeTime(
                         event.createdAt
                       )}
</p>
</div>
</div>
</div>
             )
           )}
</div>
       )}
</section>
</div>
 );
}