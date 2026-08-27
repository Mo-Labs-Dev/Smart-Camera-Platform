"use client";
import {
 AlertTriangle,
 Bell,
 Camera,
 CheckCircle2,
 CircleAlert,
 CircleCheck,
 CircleX,
 Filter,
 RefreshCw,
 Search,
 Video,
 X,
} from "lucide-react";
import {
 useEffect,
 useMemo,
 useState,
} from "react";
type EventCamera = {
 id: number;
 name: string;
 location: string | null;
};
type EventItem = {
 id: number;
 type: string;
 message: string;
 createdAt: string;
 camera: EventCamera | null;
};
type CameraFilterItem = {
 id: number;
 name: string;
};
type Props = {
 events: EventItem[];
 cameras: CameraFilterItem[];
};
type EventStyle = {
 icon: typeof Bell;
 iconClass: string;
 badgeClass: string;
 label: string;
 severity:
   | "info"
   | "success"
   | "warning"
   | "critical";
};
function getEventStyle(
 type: string
): EventStyle {
 switch (type) {
   case "recording_started":
     return {
       icon: Video,
       iconClass:
         "bg-red-50 text-red-600",
       badgeClass:
         "bg-red-50 text-red-700",
       label:
         "Recording Started",
       severity:
         "critical",
     };
   case "recording_stopped":
     return {
       icon: CircleCheck,
       iconClass:
         "bg-emerald-50 text-emerald-600",
       badgeClass:
         "bg-emerald-50 text-emerald-700",
       label:
         "Recording Completed",
       severity:
         "success",
     };
   case "snapshot_created":
     return {
       icon: Camera,
       iconClass:
         "bg-blue-50 text-blue-600",
       badgeClass:
         "bg-blue-50 text-blue-700",
       label:
         "Snapshot",
       severity:
         "info",
     };
   case "camera_online":
     return {
       icon: CheckCircle2,
       iconClass:
         "bg-emerald-50 text-emerald-600",
       badgeClass:
         "bg-emerald-50 text-emerald-700",
       label:
         "Camera Online",
       severity:
         "success",
     };
   case "camera_offline":
     return {
       icon: CircleX,
       iconClass:
         "bg-red-50 text-red-600",
       badgeClass:
         "bg-red-50 text-red-700",
       label:
         "Camera Offline",
       severity:
         "critical",
     };
   case "recording_failed":
     return {
       icon: CircleAlert,
       iconClass:
         "bg-amber-50 text-amber-600",
       badgeClass:
         "bg-amber-50 text-amber-700",
       label:
         "Recording Failed",
       severity:
         "warning",
     };
   default:
     return {
       icon: Bell,
       iconClass:
         "bg-slate-100 text-slate-600",
       badgeClass:
         "bg-slate-100 text-slate-600",
       label: type
         .replaceAll(
           "_",
           " "
         )
         .replace(
           /\b\w/g,
           (value) =>
             value.toUpperCase()
         ),
       severity:
         "info",
     };
 }
}
function formatEventDate(
 value: string
) {
 return new Intl.DateTimeFormat(
   "en-GB",
   {
     day: "2-digit",
     month: "2-digit",
     year: "numeric",
   }
 ).format(
   new Date(value)
 );
}
function formatEventTime(
 value: string
) {
 return new Intl.DateTimeFormat(
   "en-GB",
   {
     hour: "2-digit",
     minute: "2-digit",
     second: "2-digit",
     hour12: false,
   }
 ).format(
   new Date(value)
 );
}
export default function EventsClient({
 events,
 cameras,
}: Props) {
 /*
  * Live event data
  */
 const [
   liveEvents,
   setLiveEvents,
 ] =
   useState<EventItem[]>(
     events
   );
 /*
  * Manual refresh state
  */
 const [
   refreshing,
   setRefreshing,
 ] = useState(false);
 /*
  * IMPORTANT:
  *
  * We start with null instead
  * of new Date().
  *
  * This prevents server/client
  * hydration mismatch.
  */
 const [
   lastUpdated,
   setLastUpdated,
 ] =
   useState<Date | null>(
     null
   );
 /*
  * Filters
  */
 const [
   search,
   setSearch,
 ] = useState("");
 const [
   selectedCamera,
   setSelectedCamera,
 ] = useState("all");
 const [
   selectedType,
   setSelectedType,
 ] = useState("all");
 /*
  * Fetch newest events.
  */
 async function loadEvents(
   showLoading = false
 ) {
   if (showLoading) {
     setRefreshing(true);
   }
   try {
     const response =
       await fetch(
         "/api/events",
         {
           cache:
             "no-store",
         }
       );
     if (!response.ok) {
       throw new Error(
         "Unable to load events"
       );
     }
     const data =
       (await response.json()) as EventItem[];
     if (
       Array.isArray(data)
     ) {
       setLiveEvents(
         data
       );
       /*
        * This runs only in
        * the browser after
        * hydration.
        */
       setLastUpdated(
         new Date()
       );
     }
   } catch (error) {
     console.error(
       "Unable to refresh events:",
       error
     );
   } finally {
     if (showLoading) {
       setRefreshing(false);
     }
   }
 }
 /*
  * Start live event refresh
  * after browser hydration.
  */
 useEffect(() => {
   /*
    * Set initial browser time
    * only after component mounts.
    */
   setLastUpdated(
     new Date()
   );
   const interval =
     window.setInterval(
       () => {
         loadEvents();
       },
       5000
     );
   return () => {
     window.clearInterval(
       interval
     );
   };
 }, []);
 /*
  * All event types currently
  * available.
  */
 const eventTypes =
   useMemo(() => {
     return Array.from(
       new Set(
         liveEvents.map(
           (event) =>
             event.type
         )
       )
     ).sort();
   }, [
     liveEvents,
   ]);
 /*
  * Filter event list.
  */
 const filteredEvents =
   useMemo(() => {
     const query =
       search
         .trim()
         .toLowerCase();
     return liveEvents.filter(
       (event) => {
         /*
          * Camera filter
          */
         if (
           selectedCamera !==
             "all" &&
           String(
             event.camera?.id
           ) !==
             selectedCamera
         ) {
           return false;
         }
         /*
          * Event type filter
          */
         if (
           selectedType !==
             "all" &&
           event.type !==
             selectedType
         ) {
           return false;
         }
         /*
          * No text search
          */
         if (!query) {
           return true;
         }
         const searchText = [
           event.message,
           event.type,
           event.camera?.name,
           event.camera
             ?.location,
         ]
           .filter(Boolean)
           .join(" ")
           .toLowerCase();
         return searchText.includes(
           query
         );
       }
     );
   }, [
     liveEvents,
     search,
     selectedCamera,
     selectedType,
   ]);
 /*
  * Critical event count
  */
 const criticalCount =
   useMemo(() => {
     return liveEvents.filter(
       (event) =>
         getEventStyle(
           event.type
         ).severity ===
         "critical"
     ).length;
   }, [
     liveEvents,
   ]);
 /*
  * Warning event count
  */
 const warningCount =
   useMemo(() => {
     return liveEvents.filter(
       (event) =>
         getEventStyle(
           event.type
         ).severity ===
         "warning"
     ).length;
   }, [
     liveEvents,
   ]);
 /*
  * Successful event count
  */
 const successCount =
   useMemo(() => {
     return liveEvents.filter(
       (event) =>
         getEventStyle(
           event.type
         ).severity ===
         "success"
     ).length;
   }, [
     liveEvents,
   ]);
 const hasFilters =
   Boolean(
     search ||
       selectedCamera !==
         "all" ||
       selectedType !==
         "all"
   );
 function clearFilters() {
   setSearch("");
   setSelectedCamera(
     "all"
   );
   setSelectedType(
     "all"
   );
 }
 return (
<div className="space-y-4">
     {/* ==========================
         SUMMARY CARDS
        ========================== */}
<section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
       {/* Total */}
<div className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
<div className="flex items-center justify-between">
<div>
<p className="text-xs font-medium text-slate-500">
               Total Events
</p>
<p className="mt-2 text-2xl font-bold text-slate-900">
               {
                 liveEvents.length
               }
</p>
</div>
<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
<Bell
               size={18}
             />
</div>
</div>
</div>
       {/* Critical */}
<div className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
<div className="flex items-center justify-between">
<div>
<p className="text-xs font-medium text-slate-500">
               Critical
</p>
<p className="mt-2 text-2xl font-bold text-slate-900">
               {
                 criticalCount
               }
</p>
</div>
<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
<CircleX
               size={18}
             />
</div>
</div>
</div>
       {/* Warning */}
<div className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
<div className="flex items-center justify-between">
<div>
<p className="text-xs font-medium text-slate-500">
               Warnings
</p>
<p className="mt-2 text-2xl font-bold text-slate-900">
               {
                 warningCount
               }
</p>
</div>
<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
<AlertTriangle
               size={18}
             />
</div>
</div>
</div>
       {/* Successful */}
<div className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
<div className="flex items-center justify-between">
<div>
<p className="text-xs font-medium text-slate-500">
               Successful
</p>
<p className="mt-2 text-2xl font-bold text-slate-900">
               {
                 successCount
               }
</p>
</div>
<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
<CheckCircle2
               size={18}
             />
</div>
</div>
</div>
</section>
     {/* ==========================
         EVENT LOG
        ========================== */}
<section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
       {/* Header */}
<div className="border-b border-slate-200 px-5 py-4">
<div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
<div>
<div className="flex items-center gap-2">
<h2 className="text-sm font-semibold text-slate-900">
                 Live Event Log
</h2>
<span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
<span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                 Live
</span>
</div>
<p className="mt-1 text-xs text-slate-500">
               {
                 filteredEvents.length
               }{" "}
               of{" "}
               {
                 liveEvents.length
               }{" "}
               events
</p>
</div>
           {/* Filters */}
<div className="flex flex-wrap items-center gap-2">
             {/* Search */}
<div className="relative min-w-[220px] flex-1 xl:w-[260px] xl:flex-none">
<Search
                 size={15}
                 className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
               />
<input
                 value={
                   search
                 }
                 onChange={(
                   event
                 ) =>
                   setSearch(
                     event
                       .target
                       .value
                   )
                 }
                 placeholder="Search events..."
                 className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
               />
</div>
             {/* Camera */}
<div className="relative">
<Camera
                 size={14}
                 className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
               />
<select
                 value={
                   selectedCamera
                 }
                 onChange={(
                   event
                 ) =>
                   setSelectedCamera(
                     event
                       .target
                       .value
                   )
                 }
                 className="h-10 rounded-lg border border-slate-200 bg-white pl-9 pr-8 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
>
<option value="all">
                   All Cameras
</option>
                 {cameras.map(
                   (camera) => (
<option
                       key={
camera.id
                       }
                       value={
camera.id
                       }
>
                       {
                         camera.name
                       }
</option>
                   )
                 )}
</select>
</div>
             {/* Event type */}
<div className="relative">
<Filter
                 size={14}
                 className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
               />
<select
                 value={
                   selectedType
                 }
                 onChange={(
                   event
                 ) =>
                   setSelectedType(
                     event
                       .target
                       .value
                   )
                 }
                 className="h-10 max-w-[210px] rounded-lg border border-slate-200 bg-white pl-9 pr-8 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
>
<option value="all">
                   All Events
</option>
                 {eventTypes.map(
                   (type) => (
<option
                       key={
                         type
                       }
                       value={
                         type
                       }
>
                       {
                         getEventStyle(
                           type
                         ).label
                       }
</option>
                   )
                 )}
</select>
</div>
             {/* Manual refresh */}
<button
               type="button"
               onClick={() =>
                 loadEvents(
                   true
                 )
               }
               disabled={
                 refreshing
               }
               title="Refresh events"
               className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
>
<RefreshCw
                 size={15}
                 className={
                   refreshing
                     ? "animate-spin"
                     : ""
                 }
               />
               Refresh
</button>
             {/* Clear filters */}
             {hasFilters && (
<button
                 type="button"
                 onClick={
                   clearFilters
                 }
                 className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
>
<X
                   size={15}
                 />
                 Clear
</button>
             )}
</div>
</div>
         {/* ==========================
             LIVE UPDATE INFORMATION
            ========================== */}
<div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
<span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
<span>
             Auto-refresh every 5 seconds
</span>
<span>
             ·
</span>
<span>
             Last updated{" "}
             {lastUpdated
               ? lastUpdated.toLocaleTimeString(
                   [],
                   {
                     hour:
                       "2-digit",
                     minute:
                       "2-digit",
                     second:
                       "2-digit",
                   }
                 )
               : "--:--:--"}
</span>
</div>
</div>
       {/* ==========================
           EVENT ROWS
          ========================== */}
       {filteredEvents.length ===
       0 ? (
<div className="flex flex-col items-center justify-center py-16">
<Bell
             size={30}
             className="text-slate-300"
           />
<p className="mt-3 text-sm font-medium text-slate-700">
             No matching events
</p>
<p className="mt-1 text-xs text-slate-500">
             Waiting for camera activity.
</p>
</div>
       ) : (
<div className="divide-y divide-slate-100">
           {filteredEvents.map(
             (event) => {
               const style =
                 getEventStyle(
                   event.type
                 );
               const Icon =
                 style.icon;
               return (
<div
                   key={
event.id
                   }
                   className="flex gap-4 px-5 py-4 transition hover:bg-slate-50"
>
                   {/* Icon */}
<div
                     className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${style.iconClass}`}
>
<Icon
                       size={
                         18
                       }
                     />
</div>
                   {/* Details */}
<div className="min-w-0 flex-1">
<div className="flex flex-wrap items-center gap-2">
<p className="text-sm font-semibold text-slate-900">
                         {event
                           .camera
                           ?.name ??
                           "System"}
</p>
<span
                         className={`rounded-md px-2 py-1 text-[11px] font-medium ${style.badgeClass}`}
>
                         {
                           style.label
                         }
</span>
</div>
<p className="mt-1 text-sm leading-5 text-slate-600">
                       {
                         event.message
                       }
</p>
                     {event
                       .camera
                       ?.location && (
<p className="mt-1 text-xs text-slate-400">
                         {
                           event
                             .camera
                             .location
                         }
</p>
                     )}
</div>
                   {/* Time */}
<div className="shrink-0 text-right">
<p className="text-xs font-medium text-slate-600">
                       {formatEventDate(
                         event.createdAt
                       )}
</p>
<p className="mt-0.5 font-mono text-xs text-slate-400">
                       {formatEventTime(
                         event.createdAt
                       )}
</p>
<p className="mt-2 text-[10px] text-slate-300">
                       #
                       {
event.id
                       }
</p>
</div>
</div>
               );
             }
           )}
</div>
       )}
</section>
</div>
 );
}