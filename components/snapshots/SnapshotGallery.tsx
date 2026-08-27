"use client";
import {
 CalendarDays,
 Camera,
 ChevronLeft,
 ChevronRight,
 Download,
 Eye,
 Filter,
 Image as ImageIcon,
 MapPin,
 Search,
 Trash2,
 X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
function formatSnapshotDate(dateValue: string) {
 return new Intl.DateTimeFormat("en-GB", {
   day: "2-digit",
   month: "2-digit",
   year: "numeric",
   timeZone: "UTC",
 }).format(new Date(dateValue));
}
function formatSnapshotTime(dateValue: string) {
 return new Intl.DateTimeFormat("en-GB", {
   hour: "2-digit",
   minute: "2-digit",
   second: "2-digit",
   hour12: false,
   timeZone: "UTC",
 }).format(new Date(dateValue));
}
function getDateInputValue(dateValue: string) {
 const date = new Date(dateValue);
 const year = date.getUTCFullYear();
 const month = String(
   date.getUTCMonth() + 1
 ).padStart(2, "0");
 const day = String(
   date.getUTCDate()
 ).padStart(2, "0");
 return `${year}-${month}-${day}`;
}
type Snapshot = {
 id: number;
 createdAt: string;
 camera: {
   id: number;
   name: string;
   location: string | null;
 };
};
type Props = {
 snapshots: Snapshot[];
};
export default function SnapshotGallery({
 snapshots,
}: Props) {
 const router = useRouter();
 const [
   selectedSnapshotId,
   setSelectedSnapshotId,
 ] = useState<number | null>(null);
 const [
   deletingId,
   setDeletingId,
 ] = useState<number | null>(null);
 const [
   search,
   setSearch,
 ] = useState("");
 const [
   cameraFilter,
   setCameraFilter,
 ] = useState("all");
 const [
   dateFilter,
   setDateFilter,
 ] = useState("");
 /*
  * Build camera dropdown.
  */
 const cameras = useMemo(() => {
   const map = new Map<
     number,
     Snapshot["camera"]
>();
   snapshots.forEach((snapshot) => {
     map.set(
snapshot.camera.id,
       snapshot.camera
     );
   });
   return Array.from(
     map.values()
   ).sort((a, b) =>
     a.name.localeCompare(b.name)
   );
 }, [snapshots]);
 /*
  * Filter snapshot library.
  */
 const filteredSnapshots =
   useMemo(() => {
     const normalizedSearch =
       search.trim().toLowerCase();
     return snapshots.filter(
       (snapshot) => {
         const matchesSearch =
           !normalizedSearch ||
           snapshot.camera.name
             .toLowerCase()
             .includes(
               normalizedSearch
             ) ||
           (
             snapshot.camera
               .location ?? ""
           )
             .toLowerCase()
             .includes(
               normalizedSearch
             ) ||
           String(snapshot.id).includes(
             normalizedSearch
           );
         const matchesCamera =
           cameraFilter === "all" ||
snapshot.camera.id ===
             Number(cameraFilter);
         const matchesDate =
           !dateFilter ||
           getDateInputValue(
             snapshot.createdAt
           ) === dateFilter;
         return (
           matchesSearch &&
           matchesCamera &&
           matchesDate
         );
       }
     );
   }, [
     snapshots,
     search,
     cameraFilter,
     dateFilter,
   ]);
 /*
  * Current preview.
  */
 const selectedSnapshot =
   selectedSnapshotId !== null
     ? filteredSnapshots.find(
         (snapshot) =>
snapshot.id ===
           selectedSnapshotId
       ) ??
       snapshots.find(
         (snapshot) =>
snapshot.id ===
           selectedSnapshotId
       ) ??
       null
     : null;
 /*
  * Position of current snapshot
  * inside filtered results.
  */
 const selectedIndex =
   selectedSnapshot
     ? filteredSnapshots.findIndex(
         (snapshot) =>
snapshot.id ===
selectedSnapshot.id
       )
     : -1;
 function openSnapshot(
   snapshot: Snapshot
 ) {
   setSelectedSnapshotId(
snapshot.id
   );
 }
 function closeSnapshot() {
   setSelectedSnapshotId(null);
 }
 function previousSnapshot() {
   if (
     filteredSnapshots.length === 0
   ) {
     return;
   }
   let nextIndex =
     selectedIndex - 1;
   if (nextIndex < 0) {
     nextIndex =
       filteredSnapshots.length - 1;
   }
   setSelectedSnapshotId(
     filteredSnapshots[nextIndex].id
   );
 }
 function nextSnapshot() {
   if (
     filteredSnapshots.length === 0
   ) {
     return;
   }
   let nextIndex =
     selectedIndex + 1;
   if (
     nextIndex >=
     filteredSnapshots.length
   ) {
     nextIndex = 0;
   }
   setSelectedSnapshotId(
     filteredSnapshots[nextIndex].id
   );
 }
 /*
  * Keyboard controls.
  *
  * Escape      -> close
  * ArrowLeft   -> previous
  * ArrowRight  -> next
  */
 useEffect(() => {
   if (!selectedSnapshot) {
     return;
   }
   function handleKeyDown(
     event: KeyboardEvent
   ) {
     if (
       event.key === "Escape"
     ) {
       closeSnapshot();
     }
     if (
       event.key ===
       "ArrowLeft"
     ) {
       previousSnapshot();
     }
     if (
       event.key ===
       "ArrowRight"
     ) {
       nextSnapshot();
     }
   }
   window.addEventListener(
     "keydown",
     handleKeyDown
   );
   return () => {
     window.removeEventListener(
       "keydown",
       handleKeyDown
     );
   };
 });
 async function handleDelete(
   snapshot: Snapshot
 ) {
   const confirmed =
     window.confirm(
       `Delete snapshot #${snapshot.id} from ${snapshot.camera.name}?`
     );
   if (!confirmed) {
     return;
   }
   setDeletingId(snapshot.id);
   try {
     const response =
       await fetch(
         `/api/snapshots/${snapshot.id}`,
         {
           method: "DELETE",
         }
       );
     /*
      * 204 = successful deletion
      * with no response body.
      */
     if (
       response.status === 204
     ) {
       if (
         selectedSnapshotId ===
snapshot.id
       ) {
         setSelectedSnapshotId(
           null
         );
       }
       router.refresh();
       return;
     }
     const responseText =
       await response.text();
     if (!response.ok) {
       let message =
         `Failed to delete snapshot (${response.status})`;
       if (
         responseText.trim()
       ) {
         try {
           const parsed =
             JSON.parse(
               responseText
             );
           message =
             parsed.message ??
             message;
         } catch {
           message =
             responseText;
         }
       }
       throw new Error(message);
     }
     /*
      * Successful 200 response.
      */
     if (
       responseText.trim()
     ) {
       try {
         const result =
           JSON.parse(
             responseText
           );
         if (
           result.ok === false
         ) {
           throw new Error(
             result.message ??
               "Failed to delete snapshot"
           );
         }
       } catch (error) {
         if (
           error instanceof
             Error &&
           error.message ===
             "Failed to delete snapshot"
         ) {
           throw error;
         }
       }
     }
     if (
       selectedSnapshotId ===
snapshot.id
     ) {
       setSelectedSnapshotId(
         null
       );
     }
     router.refresh();
   } catch (error) {
     console.error(
       "Delete snapshot failed:",
       error
     );
     alert(
       error instanceof Error
         ? error.message
         : "Failed to delete snapshot"
     );
   } finally {
     setDeletingId(null);
   }
 }
 /*
  * Completely empty library.
  */
 if (
   snapshots.length === 0
 ) {
   return (
<div className="flex flex-col items-center justify-center py-20">
<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
<ImageIcon
           size={30}
           className="text-slate-300"
         />
</div>
<p className="mt-4 text-sm font-semibold text-slate-700">
         No snapshots
</p>
<p className="mt-1 text-xs text-slate-500">
         Camera snapshots will
         appear here.
</p>
</div>
   );
 }
 return (
<>
     {/* =================================
         FILTER TOOLBAR
     ================================= */}
<div className="border-b border-slate-200 bg-slate-50/60 p-4">
<div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
<div className="flex flex-1 flex-col gap-3 md:flex-row">
           {/* Search */}
<div className="relative flex-1">
<Search
               size={16}
               className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
             />
<input
               value={search}
               onChange={(event) =>
                 setSearch(
                   event.target
                     .value
                 )
               }
               placeholder="Search camera, location or snapshot ID..."
               className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
             />
</div>
           {/* Camera filter */}
<div className="relative md:w-[210px]">
<Camera
               size={15}
               className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
             />
<select
               value={
                 cameraFilter
               }
               onChange={(event) =>
                 setCameraFilter(
                   event.target
                     .value
                 )
               }
               className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-9 pr-8 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
           {/* Date */}
<div className="relative md:w-[190px]">
<CalendarDays
               size={15}
               className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
             />
<input
               type="date"
               value={
                 dateFilter
               }
               onChange={(event) =>
                 setDateFilter(
                   event.target
                     .value
                 )
               }
               className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
             />
</div>
</div>
         {/* Result count */}
<div className="flex items-center gap-2 text-xs text-slate-500">
<Filter size={14} />
<span>
             Showing{" "}
<strong className="font-semibold text-slate-700">
               {
                 filteredSnapshots.length
               }
</strong>{" "}
             of{" "}
<strong className="font-semibold text-slate-700">
               {
                 snapshots.length
               }
</strong>
</span>
           {(search ||
             cameraFilter !==
               "all" ||
             dateFilter) && (
<button
               type="button"
               onClick={() => {
                 setSearch("");
                 setCameraFilter(
                   "all"
                 );
                 setDateFilter(
                   ""
                 );
               }}
               className="ml-2 font-medium text-blue-600 hover:text-blue-700"
>
               Clear filters
</button>
           )}
</div>
</div>
</div>
     {/* =================================
         NO FILTER RESULTS
     ================================= */}
     {filteredSnapshots.length ===
     0 ? (
<div className="flex flex-col items-center justify-center py-16">
<Search
           size={30}
           className="text-slate-300"
         />
<p className="mt-3 text-sm font-semibold text-slate-700">
           No matching snapshots
</p>
<p className="mt-1 text-xs text-slate-500">
           Try changing your
           search or filters.
</p>
<button
           type="button"
           onClick={() => {
             setSearch("");
             setCameraFilter(
               "all"
             );
             setDateFilter("");
           }}
           className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-blue-700"
>
           Clear filters
</button>
</div>
     ) : (
       /* =================================
          SNAPSHOT GRID
       ================================= */
<div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
         {filteredSnapshots.map(
           (snapshot) => {
             const imageUrl =
               `/api/snapshots/${snapshot.id}/file`;
             return (
<article
                 key={
snapshot.id
                 }
                 className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg"
>
                 {/* Image */}
<button
                   type="button"
                   onClick={() =>
                     openSnapshot(
                       snapshot
                     )
                   }
                   className="relative block aspect-video w-full overflow-hidden bg-slate-950"
>
<img
                     src={
                       imageUrl
                     }
                     alt={`${snapshot.camera.name} snapshot`}
                     loading="lazy"
                     className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                   />
                   {/* CCTV top overlay */}
<div className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent p-3">
<div className="flex items-center gap-2">
<span className="h-2 w-2 rounded-full bg-red-500" />
<span className="font-mono text-[10px] font-medium text-white/90">
                         CAM{" "}
                         {String(
                           snapshot
                             .camera
                             .id
                         ).padStart(
                           2,
                           "0"
                         )}
</span>
</div>
<span className="rounded bg-black/50 px-2 py-1 font-mono text-[9px] text-white/80 backdrop-blur-sm">
                       SNAPSHOT
</span>
</div>
                   {/* Timestamp */}
<div className="absolute bottom-2 left-2 rounded bg-black/65 px-2 py-1 font-mono text-[9px] text-white/90 backdrop-blur-sm">
                     {formatSnapshotDate(
                       snapshot.createdAt
                     )}{" "}
                     {formatSnapshotTime(
                       snapshot.createdAt
                     )}
</div>
                   {/* Hover */}
<div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/25 group-hover:opacity-100">
<div className="flex h-11 w-11 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur">
<Eye
                         size={
                           19
                         }
                       />
</div>
</div>
</button>
                 {/* Information */}
<div className="p-4">
<div className="flex items-start justify-between gap-3">
<div className="min-w-0">
<p className="truncate text-sm font-semibold text-slate-900">
                         {
                           snapshot
                             .camera
                             .name
                         }
</p>
<div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
<MapPin
                           size={
                             12
                           }
                         />
<span className="truncate">
                           {snapshot
                             .camera
                             .location ??
                             "Unknown location"}
</span>
</div>
</div>
<span className="shrink-0 rounded-md bg-slate-100 px-2 py-1 font-mono text-[10px] text-slate-500">
                       #
                       {
snapshot.id
                       }
</span>
</div>
<div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">
<button
                       type="button"
                       onClick={() =>
                         openSnapshot(
                           snapshot
                         )
                       }
                       className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-600 text-xs font-medium text-white transition hover:bg-blue-700"
>
<Eye
                         size={
                           14
                         }
                       />
                       View
</button>
<a
                       href={`${imageUrl}?download=1`}
                       title="Download snapshot"
                       className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100"
>
<Download
                         size={
                           14
                         }
                       />
</a>
<button
                       type="button"
                       onClick={() =>
                         handleDelete(
                           snapshot
                         )
                       }
                       disabled={
                         deletingId ===
snapshot.id
                       }
                       title="Delete snapshot"
                       className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
>
<Trash2
                         size={
                           14
                         }
                       />
</button>
</div>
</div>
</article>
             );
           }
         )}
</div>
     )}
     {/* =================================
         FULL SNAPSHOT VIEWER
     ================================= */}
     {selectedSnapshot && (
<div
         className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-6"
         onClick={
           closeSnapshot
         }
>
<div
           className="flex max-h-[95vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
           onClick={(event) =>
             event.stopPropagation()
           }
>
           {/* Viewer header */}
<div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
<div className="flex min-w-0 items-center gap-3">
<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
<Camera
                   size={18}
                 />
</div>
<div className="min-w-0">
<p className="truncate font-semibold text-slate-900">
                   {
                     selectedSnapshot
                       .camera
                       .name
                   }
</p>
<p className="truncate text-xs text-slate-500">
                   {selectedSnapshot
                     .camera
                     .location ??
                     "Unknown location"}
</p>
</div>
</div>
<div className="flex items-center gap-2">
<span className="hidden rounded-lg bg-slate-100 px-3 py-2 font-mono text-xs text-slate-500 sm:block">
                 Snapshot #
                 {
selectedSnapshot.id
                 }
</span>
<button
                 type="button"
                 onClick={
                   closeSnapshot
                 }
                 className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
                 aria-label="Close snapshot preview"
>
<X
                   size={19}
                 />
</button>
</div>
</div>
           {/* Image viewer */}
<div className="relative flex min-h-[300px] flex-1 items-center justify-center overflow-hidden bg-slate-950">
<img
               src={`/api/snapshots/${selectedSnapshot.id}/file`}
               alt={`${selectedSnapshot.camera.name} snapshot`}
               className="max-h-[70vh] max-w-full object-contain"
             />
             {/* Previous */}
             {filteredSnapshots.length >
               1 && (
<button
                 type="button"
                 onClick={
                   previousSnapshot
                 }
                 title="Previous snapshot"
                 className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition hover:bg-black/80 sm:left-5"
>
<ChevronLeft
                   size={22}
                 />
</button>
             )}
             {/* Next */}
             {filteredSnapshots.length >
               1 && (
<button
                 type="button"
                 onClick={
                   nextSnapshot
                 }
                 title="Next snapshot"
                 className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition hover:bg-black/80 sm:right-5"
>
<ChevronRight
                   size={22}
                 />
</button>
             )}
             {/* CCTV label */}
<div className="absolute left-4 top-4 flex items-center gap-2 rounded-lg bg-black/60 px-3 py-2 backdrop-blur">
<span className="h-2 w-2 rounded-full bg-red-500" />
<span className="font-mono text-[10px] font-medium text-white">
                 CAM{" "}
                 {String(
                   selectedSnapshot
                     .camera.id
                 ).padStart(
                   2,
                   "0"
                 )}
</span>
</div>
             {/* Image counter */}
             {selectedIndex >=
               0 && (
<div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-lg bg-black/60 px-3 py-1.5 font-mono text-xs text-white/90 backdrop-blur">
                 {selectedIndex +
                   1}{" "}
                 /{" "}
                 {
                   filteredSnapshots.length
                 }
</div>
             )}
</div>
           {/* Footer */}
<div className="flex flex-col gap-4 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
<div className="flex flex-wrap gap-x-6 gap-y-2">
<div>
<p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                   Date
</p>
<p className="mt-1 text-sm font-medium text-slate-700">
                   {formatSnapshotDate(
                     selectedSnapshot.createdAt
                   )}
</p>
</div>
<div>
<p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                   Time
</p>
<p className="mt-1 font-mono text-sm font-medium text-slate-700">
                   {formatSnapshotTime(
                     selectedSnapshot.createdAt
                   )}
</p>
</div>
<div>
<p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                   Camera
</p>
<p className="mt-1 text-sm font-medium text-slate-700">
                   {
                     selectedSnapshot
                       .camera
                       .name
                   }
</p>
</div>
</div>
<div className="flex gap-2">
<a
                 href={`/api/snapshots/${selectedSnapshot.id}/file?download=1`}
                 className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
>
<Download
                   size={16}
                 />
                 Download
</a>
<button
                 type="button"
                 onClick={() =>
                   handleDelete(
                     selectedSnapshot
                   )
                 }
                 disabled={
                   deletingId ===
selectedSnapshot.id
                 }
                 className="flex h-10 items-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
>
<Trash2
                   size={16}
                 />
                 {deletingId ===
selectedSnapshot.id
                   ? "Deleting..."
                   : "Delete"}
</button>
</div>
</div>
</div>
</div>
     )}
</>
 );
}