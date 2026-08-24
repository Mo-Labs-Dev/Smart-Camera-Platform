"use client";
import {
 Download,
 Eye,
 Image as ImageIcon,
 Trash2,
 X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
   selectedSnapshot,
   setSelectedSnapshot,
 ] = useState<Snapshot | null>(null);
 const [
   deletingId,
   setDeletingId,
 ] = useState<number | null>(null);
 async function handleDelete(
   snapshot: Snapshot
 ) {
   const confirmed = window.confirm(
     `Delete snapshot #${snapshot.id} from ${snapshot.camera.name}?`
   );
   if (!confirmed) {
     return;
   }
   setDeletingId(snapshot.id);
   try {
     const response = await fetch(
       `/api/snapshots/${snapshot.id}`,
       {
         method: "DELETE",
       }
     );
     /*
      * 204 = successful deletion
      * with no response body.
      */
     if (response.status === 204) {
       if (
         selectedSnapshot?.id ===
snapshot.id
       ) {
         setSelectedSnapshot(null);
       }
       router.refresh();
       return;
     }
     const responseText =
       await response.text();
     /*
      * API returned an error.
      */
     if (!response.ok) {
       let message =
         `Failed to delete snapshot (${response.status})`;
       if (responseText.trim()) {
         try {
           const parsed =
             JSON.parse(responseText);
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
      * Successful 200 response is valid
      * even if body is empty.
      */
     if (responseText.trim()) {
       try {
         const result =
           JSON.parse(responseText);
         if (
           result.ok === false
         ) {
           throw new Error(
             result.message ??
               "Failed to delete snapshot"
           );
         }
       } catch (error) {
         /*
          * Ignore JSON parsing only when
          * the API succeeded but returned
          * non-JSON content.
          */
         if (
           error instanceof Error &&
           error.message !==
             "Failed to delete snapshot"
         ) {
           console.warn(
             "Delete response was not JSON:",
             responseText
           );
         }
       }
     }
     if (
       selectedSnapshot?.id ===
snapshot.id
     ) {
       setSelectedSnapshot(null);
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
 if (snapshots.length === 0) {
   return (
<div className="flex flex-col items-center justify-center py-16">
<ImageIcon
         size={32}
         className="text-slate-300"
       />
<p className="mt-3 text-sm font-medium text-slate-700">
         No snapshots
</p>
<p className="mt-1 text-xs text-slate-500">
         Camera snapshots will appear here.
</p>
</div>
   );
 }
 return (
<>
<div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
       {snapshots.map((snapshot) => {
         const imageUrl =
           `/api/snapshots/${snapshot.id}/file`;
         return (
<article
             key={snapshot.id}
             className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:shadow-md"
>
<button
               type="button"
               onClick={() =>
                 setSelectedSnapshot(
                   snapshot
                 )
               }
               className="relative block aspect-video w-full overflow-hidden bg-slate-100"
>
<img
                 src={imageUrl}
                 alt={`${snapshot.camera.name} snapshot`}
                 className="h-full w-full object-cover"
               />
<div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/20 group-hover:opacity-100">
<div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-white">
<Eye size={18} />
</div>
</div>
</button>
<div className="p-4">
<div className="flex items-start justify-between gap-3">
<div className="min-w-0">
<p className="truncate text-sm font-semibold text-slate-900">
                     {
                       snapshot.camera
                         .name
                     }
</p>
<p className="mt-0.5 truncate text-xs text-slate-500">
                     {snapshot.camera
                       .location ??
                       "Unknown location"}
</p>
</div>
<span className="shrink-0 rounded bg-slate-100 px-2 py-1 text-[10px] text-slate-500">
                   #{snapshot.id}
</span>
</div>
<div className="mt-3">
<p className="text-xs font-medium text-slate-600">
                   {formatSnapshotDate(
                     snapshot.createdAt
                   )}
</p>
<p className="mt-0.5 text-xs text-slate-400">
                   {formatSnapshotTime(
                     snapshot.createdAt
                   )}
</p>
</div>
<div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">
<button
                   type="button"
                   onClick={() =>
                     setSelectedSnapshot(
                       snapshot
                     )
                   }
                   className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-600 text-xs font-medium text-white transition hover:bg-blue-700"
>
<Eye size={14} />
                   View
</button>
<a
                   href={`${imageUrl}?download=1`}
                   title="Download"
                   className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100"
>
<Download
                     size={14}
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
                   title="Delete"
                   className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
>
<Trash2
                     size={14}
                   />
</button>
</div>
</div>
</article>
         );
       })}
</div>
     {selectedSnapshot && (
<div
         className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-6"
         onClick={() =>
           setSelectedSnapshot(
             null
           )
         }
>
<div
           className="w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl"
           onClick={(event) =>
             event.stopPropagation()
           }
>
<div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
<div>
<p className="font-semibold text-slate-900">
                 {
                   selectedSnapshot
                     .camera.name
                 }
</p>
<p className="text-xs text-slate-500">
                 {selectedSnapshot
                   .camera.location ??
                   "Unknown location"}
</p>
</div>
<button
               type="button"
               onClick={() =>
                 setSelectedSnapshot(
                   null
                 )
               }
               className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
               aria-label="Close snapshot preview"
>
<X size={19} />
</button>
</div>
<div className="flex max-h-[70vh] items-center justify-center bg-black">
<img
               src={`/api/snapshots/${selectedSnapshot.id}/file`}
               alt={`${selectedSnapshot.camera.name} snapshot`}
               className="max-h-[70vh] max-w-full object-contain"
             />
</div>
<div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
<div>
<p className="text-sm font-medium text-slate-700">
                 {formatSnapshotDate(
                   selectedSnapshot
                     .createdAt
                 )}
</p>
<p className="mt-0.5 text-xs text-slate-400">
                 {formatSnapshotTime(
                   selectedSnapshot
                     .createdAt
                 )}
</p>
</div>
<div className="flex gap-2">
<a
                 href={`/api/snapshots/${selectedSnapshot.id}/file?download=1`}
                 className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm text-slate-700 transition hover:bg-slate-50"
>
<Download
                   size={15}
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
                 className="flex h-9 items-center gap-2 rounded-lg bg-red-600 px-3 text-sm text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
>
<Trash2
                   size={15}
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