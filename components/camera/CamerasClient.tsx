"use client";
import {
 Camera,
 Check,
 Edit3,
 Plus,
 Trash2,
 X,
} from "lucide-react";
import {
 useRouter,
} from "next/navigation";
import {
 useState,
} from "react";
type CameraItem = {
 id: number;
 name: string;
 location: string | null;
 host: string | null;
 streamPath: string | null;
};
type Props = {
 cameras: CameraItem[];
};
type FormState = {
 id?: number;
 name: string;
 location: string;
 host: string;
 streamPath: string;
};
const emptyForm: FormState = {
 name: "",
 location: "",
 host: "",
 streamPath: "",
};
export default function CamerasClient({
 cameras,
}: Props) {
 const router = useRouter();
 const [
   form,
   setForm,
 ] = useState<FormState>(
   emptyForm
 );
 const [
   open,
   setOpen,
 ] = useState(false);
 const [
   saving,
   setSaving,
 ] = useState(false);
 const [
   deletingId,
   setDeletingId,
 ] = useState<number | null>(
   null
 );
 function openCreate() {
   setForm(emptyForm);
   setOpen(true);
 }
 function openEdit(
   camera: CameraItem
 ) {
   setForm({
     id: camera.id,
     name:
       camera.name,
     location:
       camera.location ?? "",
     host:
       camera.host ?? "",
     streamPath:
       camera.streamPath ?? "",
   });
   setOpen(true);
 }
 function closeModal() {
   if (saving) {
     return;
   }
   setOpen(false);
   setForm(emptyForm);
 }
 async function handleSave() {
   const name =
     form.name.trim();
   if (!name) {
     alert(
       "Camera name is required."
     );
     return;
   }
   setSaving(true);
   try {
     const isEdit =
       typeof form.id ===
       "number";
     const url =
       isEdit
         ? `/api/cameras/${form.id}`
         : "/api/cameras";
     const response =
       await fetch(
         url,
         {
           method:
             isEdit
               ? "PUT"
               : "POST",
           headers: {
             "Content-Type":
               "application/json",
           },
           body:
             JSON.stringify({
               name,
               location:
                 form.location.trim() ||
                 null,
               host:
                 form.host.trim() ||
                 null,
               streamPath:
                 form.streamPath.trim() ||
                 null,
             }),
         }
       );
     const contentType =
       response.headers.get(
         "content-type"
       ) ?? "";
     if (
       !contentType.includes(
         "application/json"
       )
     ) {
       throw new Error(
         `Camera API returned HTTP ${response.status}`
       );
     }
     const result =
       await response.json();
     if (!response.ok) {
       throw new Error(
         result.message ??
           "Failed to save camera"
       );
     }
     setOpen(false);
     setForm(emptyForm);
     router.refresh();
   } catch (error) {
     console.error(
       "Save camera error:",
       error
     );
     alert(
       error instanceof Error
         ? error.message
         : "Failed to save camera"
     );
   } finally {
     setSaving(false);
   }
 }
 async function handleDelete(
   camera: CameraItem
 ) {
   const confirmed =
     window.confirm(
       `Delete "${camera.name}"?\n\nThis is only allowed when the camera has no saved recordings or snapshots.`
     );
   if (!confirmed) {
     return;
   }
   setDeletingId(
camera.id
   );
   try {
     const response =
       await fetch(
         `/api/cameras/${camera.id}`,
         {
           method:
             "DELETE",
         }
       );
     const result =
       await response.json();
     if (!response.ok) {
       /*
        * Show dependency counts if
        * deletion was blocked.
        */
       if (
         result.dependencies
       ) {
         const recordings =
           result.dependencies
             .recordings ?? 0;
         const snapshots =
           result.dependencies
             .snapshots ?? 0;
         throw new Error(
           `${result.message}\n\nRecordings: ${recordings}\nSnapshots: ${snapshots}`
         );
       }
       throw new Error(
         result.message ??
           "Failed to delete camera"
       );
     }
     router.refresh();
   } catch (error) {
     console.error(
       "Delete camera error:",
       error
     );
     alert(
       error instanceof Error
         ? error.message
         : "Failed to delete camera"
     );
   } finally {
     setDeletingId(
       null
     );
   }
 }
 return (
<>
<section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
<div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
<div>
<h2 className="text-sm font-semibold text-slate-900">
             Camera Registry
</h2>
<p className="mt-0.5 text-xs text-slate-500">
             {cameras.length} registered{" "}
             {cameras.length === 1
               ? "camera"
               : "cameras"}
</p>
</div>
<button
           type="button"
           onClick={
             openCreate
           }
           className="flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-3 text-sm font-medium text-white transition hover:bg-blue-700"
>
<Plus
             size={16}
           />
           Add Camera
</button>
</div>
       {cameras.length ===
       0 ? (
<div className="flex flex-col items-center justify-center py-16">
<Camera
             size={30}
             className="text-slate-300"
           />
<p className="mt-3 text-sm font-medium text-slate-700">
             No cameras
</p>
<p className="mt-1 text-xs text-slate-500">
             Add your first
             camera to begin.
</p>
</div>
       ) : (
<div className="divide-y divide-slate-100">
           {cameras.map(
             (camera) => (
<div
                 key={
camera.id
                 }
                 className="flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50"
>
<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
<Camera
                     size={
                       18
                     }
                   />
</div>
<div className="min-w-[160px] flex-1">
<p className="text-sm font-semibold text-slate-900">
                     {
                       camera.name
                     }
</p>
<p className="mt-0.5 text-xs text-slate-500">
                     {camera.location ??
                       "No location"}
</p>
</div>
<div className="hidden w-[170px] md:block">
<p className="text-[11px] uppercase tracking-wide text-slate-400">
                     Host
</p>
<p className="mt-1 text-sm text-slate-700">
                     {camera.host ??
                       "—"}
</p>
</div>
<div className="hidden w-[160px] lg:block">
<p className="text-[11px] uppercase tracking-wide text-slate-400">
                     Stream
</p>
<p className="mt-1 text-sm text-slate-700">
                     {camera.streamPath ??
                       "—"}
</p>
</div>
<div className="hidden w-[70px] sm:block">
<p className="text-[11px] uppercase tracking-wide text-slate-400">
                     ID
</p>
<p className="mt-1 text-sm text-slate-700">
                     #
                     {
camera.id
                     }
</p>
</div>
<div className="ml-auto flex items-center gap-2">
<button
                     type="button"
                     onClick={() =>
                       openEdit(
                         camera
                       )
                     }
                     className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100"
                     title="Edit camera"
>
<Edit3
                       size={
                         16
                       }
                     />
</button>
<button
                     type="button"
                     onClick={() =>
                       handleDelete(
                         camera
                       )
                     }
                     disabled={
                       deletingId ===
camera.id
                     }
                     className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-white text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                     title="Delete camera"
>
<Trash2
                       size={
                         16
                       }
                     />
</button>
</div>
</div>
             )
           )}
</div>
       )}
</section>
     {open && (
<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-6">
<div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
<div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
<div>
<h2 className="font-semibold text-slate-900">
                 {form.id
                   ? "Edit Camera"
                   : "Add Camera"}
</h2>
<p className="mt-0.5 text-xs text-slate-500">
                 Configure
                 camera details
</p>
</div>
<button
               type="button"
               onClick={
                 closeModal
               }
               disabled={
                 saving
               }
               className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
>
<X
                 size={18}
               />
</button>
</div>
<div className="space-y-4 p-5">
<div>
<label className="text-xs font-medium text-slate-600">
                 Camera name
</label>
<input
                 value={
                   form.name
                 }
                 onChange={(
                   event
                 ) =>
                   setForm(
                     (
                       current
                     ) => ({
                       ...current,
                       name:
                         event
                           .target
                           .value,
                     })
                   )
                 }
                 className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                 placeholder="Camera 1"
               />
</div>
<div>
<label className="text-xs font-medium text-slate-600">
                 Location
</label>
<input
                 value={
                   form.location
                 }
                 onChange={(
                   event
                 ) =>
                   setForm(
                     (
                       current
                     ) => ({
                       ...current,
                       location:
                         event
                           .target
                           .value,
                     })
                   )
                 }
                 className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                 placeholder="Lab Area A"
               />
</div>
<div>
<label className="text-xs font-medium text-slate-600">
                 Camera host /
                 IP
</label>
<input
                 value={
                   form.host
                 }
                 onChange={(
                   event
                 ) =>
                   setForm(
                     (
                       current
                     ) => ({
                       ...current,
                       host:
                         event
                           .target
                           .value,
                     })
                   )
                 }
                 className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                 placeholder="192.168.178.71"
               />
</div>
<div>
<label className="text-xs font-medium text-slate-600">
                 MediaMTX
                 stream path
</label>
<input
                 value={
                   form.streamPath
                 }
                 onChange={(
                   event
                 ) =>
                   setForm(
                     (
                       current
                     ) => ({
                       ...current,
                       streamPath:
                         event
                           .target
                           .value,
                     })
                   )
                 }
                 className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                 placeholder="camera1"
               />
</div>
</div>
<div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
<button
               type="button"
               onClick={
                 closeModal
               }
               disabled={
                 saving
               }
               className="h-9 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
>
               Cancel
</button>
<button
               type="button"
               onClick={
                 handleSave
               }
               disabled={
                 saving
               }
               className="flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
>
<Check
                 size={16}
               />
               {saving
                 ? "Saving..."
                 : "Save Camera"}
</button>
</div>
</div>
</div>
     )}
</>
 );
}