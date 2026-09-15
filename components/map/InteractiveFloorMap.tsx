"use client";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";
import {
 Camera,
 CheckCircle2,
 ChefHat,
 DoorOpen,
 Edit3,
 Flower2,
 Loader2,
 Map,
 RefreshCw,
 RotateCcw,
 Save,
 Trees,
 Wifi,
 X,
} from "lucide-react";
import {
 PointerEvent as ReactPointerEvent,
 useCallback,
 useEffect,
 useMemo,
 useState,
} from "react";
type CameraBase = {
 id: number;
 name: string;
 location: string;
 host: string | null;
 streamPath: string | null;
 mapX: number | null;
 mapY: number | null;
};
type CameraStatus = {
 id: number;
 name?: string;
 status: "online" | "offline";
};
type CameraWithStatus = CameraBase & {
 status: "online" | "offline";
};
type MapPosition = {
 x: number;
 y: number;
};
type PositionMap = Record<
 number,
 MapPosition
>;
type Props = {
 cameras: CameraBase[];
};
const DEFAULT_POSITIONS: MapPosition[] =
 [
   { x: 24, y: 22 },
   { x: 73, y: 20 },
   { x: 28, y: 68 },
   { x: 76, y: 67 },
 ];
function clamp(
 value: number,
 min: number,
 max: number
) {
 return Math.min(
   Math.max(value, min),
   max
 );
}
function copyPositions(
 positions: PositionMap
): PositionMap {
 const result: PositionMap =
   {};
 Object.entries(
   positions
 ).forEach(
   ([
     cameraId,
     position,
   ]) => {
     result[
       Number(cameraId)
     ] = {
       x: position.x,
       y: position.y,
     };
   }
 );
 return result;
}
function CameraMarker({
 camera,
 position,
 selected,
 editing,
 onSelect,
 onMove,
}: {
 camera: CameraWithStatus;
 position: MapPosition;
 selected: boolean;
 editing: boolean;
 onSelect: () => void;
 onMove: (
   position: MapPosition
 ) => void;
}) {
 const online =
   camera.status ===
   "online";
 function handlePointerDown(
   event: ReactPointerEvent<HTMLButtonElement>
 ) {
   onSelect();
   if (!editing) {
     return;
   }
   event.preventDefault();
   const marker =
     event.currentTarget;
   const floorMap =
     marker.closest(
       "[data-floor-map]"
     ) as HTMLElement | null;
   if (!floorMap) {
     return;
   }
   function updatePosition(
     clientX: number,
     clientY: number
   ) {
     const rect =
       floorMap!.getBoundingClientRect();
     if (
       rect.width <= 0 ||
       rect.height <= 0
     ) {
       return;
     }
     const x =
       ((clientX -
         rect.left) /
         rect.width) *
       100;
     const y =
       ((clientY -
         rect.top) /
         rect.height) *
       100;
     onMove({
       x: clamp(
         x,
         4,
         96
       ),
       y: clamp(
         y,
         6,
         92
       ),
     });
   }
   updatePosition(
     event.clientX,
     event.clientY
   );
   function handleMove(
     moveEvent: PointerEvent
   ) {
     updatePosition(
       moveEvent.clientX,
       moveEvent.clientY
     );
   }
   function handleUp() {
     window.removeEventListener(
       "pointermove",
       handleMove
     );
     window.removeEventListener(
       "pointerup",
       handleUp
     );
   }
   window.addEventListener(
     "pointermove",
     handleMove
   );
   window.addEventListener(
     "pointerup",
     handleUp
   );
 }
 return (
<button
     type="button"
     onPointerDown={
       handlePointerDown
     }
     onClick={onSelect}
     style={{
       left: `${position.x}%`,
       top: `${position.y}%`,
       touchAction:
         "none",
     }}
     className={`group absolute z-30 -translate-x-1/2 -translate-y-1/2 ${
       editing
         ? "cursor-grab active:cursor-grabbing"
         : "cursor-pointer"
     }`}
     title={`${camera.name} - ${
       online
         ? "Online"
         : "Offline"
     }`}
>
     {online &&
       !editing && (
<span className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-emerald-400/20" />
       )}
<span
       className={`relative flex h-12 w-12 items-center justify-center rounded-full border-4 border-white text-white shadow-xl transition ${
         online
           ? "bg-emerald-500"
           : "bg-red-500"
       } ${
         selected
           ? "scale-110 ring-4 ring-blue-500/30"
           : ""
       } ${
         editing
           ? "ring-4 ring-amber-400/30"
           : "group-hover:scale-110"
       }`}
>
<Camera
         size={19}
       />
</span>
<span
       className={`absolute left-1/2 top-[54px] -translate-x-1/2 whitespace-nowrap rounded-lg border px-3 py-1.5 text-[11px] font-bold shadow-md ${
         selected
           ? "border-blue-200 bg-blue-600 text-white"
           : "border-slate-200 bg-white text-slate-700"
       }`}
>
       {camera.name}
</span>
</button>
 );
}
export default function InteractiveFloorMap({
 cameras: cameraConfig,
}: Props) {
 /*
  * Load platform settings.
  */
 const {
   settings,
 } =
   usePlatformSettings();
 /*
  * Settings ->
  * Camera Health Refresh.
  *
  * API stores seconds.
  * setInterval needs milliseconds.
  */
 const CAMERA_STATUS_REFRESH_MS =
   Math.max(
     3,
     settings.cameraStatusRefreshSec
   ) * 1000;
 const [
   statuses,
   setStatuses,
 ] =
   useState<
     CameraStatus[]
>([]);
 const [
   statusLoading,
   setStatusLoading,
 ] = useState(true);
 const [
   refreshing,
   setRefreshing,
 ] = useState(false);
 const [
   editing,
   setEditing,
 ] = useState(false);
 const [
   saving,
   setSaving,
 ] = useState(false);
 const [
   message,
   setMessage,
 ] =
   useState<
     string | null
>(null);
 const [
   error,
   setError,
 ] =
   useState<
     string | null
>(null);
 const [
   selectedCameraId,
   setSelectedCameraId,
 ] = useState<
   number | null
>(null);
 const initialPositions =
   useMemo(() => {
     const result: PositionMap =
       {};
     cameraConfig.forEach(
       (
         camera,
         index
       ) => {
         const fallback =
           DEFAULT_POSITIONS[
             index %
               DEFAULT_POSITIONS.length
           ];
         result[
camera.id
         ] = {
           x:
             camera.mapX ??
             fallback.x,
           y:
             camera.mapY ??
             fallback.y,
         };
       }
     );
     return result;
   }, [
     cameraConfig,
   ]);
 const [
   positions,
   setPositions,
 ] =
   useState<PositionMap>(
     () =>
       copyPositions(
         initialPositions
       )
   );
 const [
   savedPositions,
   setSavedPositions,
 ] =
   useState<PositionMap>(
     () =>
       copyPositions(
         initialPositions
       )
   );
 /*
  * Load live camera status.
  */
 const loadStatuses =
   useCallback(
     async (
       manual = false
     ) => {
       if (manual) {
         setRefreshing(
           true
         );
       }
       try {
         const response =
           await fetch(
             "/api/cameras/status",
             {
               cache:
                 "no-store",
             }
           );
         if (
           !response.ok
         ) {
           throw new Error(
             "Unable to load camera status."
           );
         }
         const data =
           await response.json();
         /*
          * Supports:
          *
          * [
          *   {
          *     id: 1,
          *     status: "online"
          *   }
          * ]
          *
          * AND:
          *
          * {
          *   cameras: [
          *     {
          *       id: 1,
          *       status: "online"
          *     }
          *   ]
          * }
          */
         if (
           Array.isArray(
             data
           )
         ) {
           setStatuses(
             data as CameraStatus[]
           );
         } else if (
           data &&
           Array.isArray(
             data.cameras
           )
         ) {
           setStatuses(
             data.cameras as CameraStatus[]
           );
         }
       } catch (
         statusError
       ) {
         console.error(
           "Map status error:",
           statusError
         );
       } finally {
         setStatusLoading(
           false
         );
         setRefreshing(
           false
         );
       }
     },
     []
   );
 /*
  * Camera status polling.
  *
  * Previously this was hard-coded:
  *
  * 5000
  *
  * It now follows:
  *
  * Settings ->
  * Camera Health Refresh
  */
 useEffect(() => {
   void loadStatuses();
   const interval =
     window.setInterval(
       () => {
         void loadStatuses();
       },
       CAMERA_STATUS_REFRESH_MS
     );
   return () => {
     window.clearInterval(
       interval
     );
   };
 }, [
   loadStatuses,
   CAMERA_STATUS_REFRESH_MS,
 ]);
 /*
  * Merge configured cameras
  * with live status.
  */
 const cameras =
   useMemo<
     CameraWithStatus[]
>(() => {
     return cameraConfig.map(
       (camera) => {
         const status =
           statuses.find(
             (item) =>
item.id ===
camera.id
           );
         return {
           ...camera,
           status:
             status?.status ??
             ("offline" as const),
         };
       }
     );
   }, [
     cameraConfig,
     statuses,
   ]);
 const onlineCount =
   cameras.filter(
     (camera) =>
       camera.status ===
       "online"
   ).length;
 const offlineCount =
   cameras.length -
   onlineCount;
 const positionsChanged =
   JSON.stringify(
     positions
   ) !==
   JSON.stringify(
     savedPositions
   );
 function moveCamera(
   cameraId: number,
   position: MapPosition
 ) {
   setPositions(
     (current) => ({
       ...current,
       [cameraId]: {
         x: position.x,
         y: position.y,
       },
     })
   );
 }
 function startEditing() {
   setError(null);
   setMessage(null);
   setSelectedCameraId(
     null
   );
   setEditing(true);
 }
 function cancelEditing() {
   setPositions(
     copyPositions(
       savedPositions
     )
   );
   setEditing(false);
   setSelectedCameraId(
     null
   );
   setError(null);
   setMessage(null);
 }
 function resetLayout() {
   const defaults: PositionMap =
     {};
   cameraConfig.forEach(
     (
       camera,
       index
     ) => {
       const fallback =
         DEFAULT_POSITIONS[
           index %
             DEFAULT_POSITIONS.length
         ];
       defaults[
camera.id
       ] = {
         x: fallback.x,
         y: fallback.y,
       };
     }
   );
   setPositions(
     defaults
   );
 }
 async function saveLayout() {
   if (saving) {
     return;
   }
   setSaving(true);
   setError(null);
   setMessage(null);
   try {
     for (
       const camera of
       cameraConfig
     ) {
       const position =
         positions[
camera.id
         ];
       if (!position) {
         continue;
       }
       /*
        * Existing camera
        * update endpoint.
        */
       const response =
         await fetch(
           `/api/cameras/${camera.id}`,
           {
             method:
               "PUT",
             headers: {
               "Content-Type":
                 "application/json",
             },
             body:
               JSON.stringify(
                 {
                   mapX:
                     position.x,
                   mapY:
                     position.y,
                 }
               ),
           }
         );
       if (
         !response.ok
       ) {
         let serverMessage =
           `Failed to save ${camera.name}.`;
         try {
           const data =
             await response.json();
           if (
             typeof data?.message ===
             "string"
           ) {
             serverMessage =
               data.message;
           } else if (
             typeof data?.error ===
             "string"
           ) {
             serverMessage =
               data.error;
           }
         } catch {
           // Keep fallback.
         }
         throw new Error(
           serverMessage
         );
       }
     }
     const saved =
       copyPositions(
         positions
       );
     setSavedPositions(
       saved
     );
     setPositions(
       copyPositions(
         saved
       )
     );
     setEditing(false);
     setSelectedCameraId(
       null
     );
     setMessage(
       "Floor map layout saved successfully."
     );
     window.setTimeout(
       () => {
         setMessage(
           null
         );
       },
       3500
     );
   } catch (
     saveError
   ) {
     console.error(
       "Save map layout error:",
       saveError
     );
     setError(
       saveError instanceof
         Error
         ? saveError.message
         : "Unable to save floor map layout."
     );
   } finally {
     setSaving(false);
   }
 }
 return (
<div className="px-6 py-6 lg:px-8 lg:py-8">
     {/* HEADER */}
<div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
<div className="flex items-center gap-3">
<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
<Map
             size={21}
           />
</div>
<div>
<h1 className="text-2xl font-bold tracking-tight text-slate-900">
             Floor Map
</h1>
<p className="mt-1 text-sm text-slate-500">
             Interactive property overview and camera locations.
</p>
</div>
</div>
<div className="flex flex-wrap items-center gap-2">
         {!editing ? (
<>
<div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm sm:flex">
<span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
               Live status
</div>
<button
               type="button"
               onClick={() =>
                 void loadStatuses(
                   true
                 )
               }
               disabled={
                 refreshing
               }
               className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
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
<button
               type="button"
               onClick={
                 startEditing
               }
               className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
>
<Edit3
                 size={15}
               />
               Edit Map
</button>
</>
         ) : (
<>
<button
               type="button"
               onClick={
                 resetLayout
               }
               disabled={
                 saving
               }
               className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
>
<RotateCcw
                 size={15}
               />
               Reset
</button>
<button
               type="button"
               onClick={
                 cancelEditing
               }
               disabled={
                 saving
               }
               className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
>
<X
                 size={15}
               />
               Cancel
</button>
<button
               type="button"
               onClick={() =>
                 void saveLayout()
               }
               disabled={
                 saving ||
                 !positionsChanged
               }
               className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
>
               {saving ? (
<Loader2
                   size={
                     15
                   }
                   className="animate-spin"
                 />
               ) : (
<Save
                   size={
                     15
                   }
                 />
               )}
               {saving
                 ? "Saving..."
                 : "Save Layout"}
</button>
</>
         )}
</div>
</div>
     {/* SUCCESS */}
     {message && (
<div className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
<CheckCircle2
           size={18}
         />
         {message}
</div>
     )}
     {/* ERROR */}
     {error && (
<div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
         {error}
</div>
     )}
     {/* EDIT MODE */}
     {editing && (
<div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
<strong>
           Edit mode:
</strong>{" "}
         drag the camera markers to their real positions, then click{" "}
<strong>
           Save Layout
</strong>
         .
</div>
     )}
     {/* MAP STATS */}
<div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
<div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
<p className="text-xs font-medium text-slate-500">
           Cameras on Map
</p>
<p className="mt-1 text-2xl font-bold text-slate-900">
           {
             cameras.length
           }
</p>
</div>
<div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-5 py-4">
<p className="text-xs font-medium text-emerald-700">
           Online
</p>
<p className="mt-1 text-2xl font-bold text-emerald-700">
           {statusLoading
             ? "..."
             : onlineCount}
</p>
</div>
<div className="rounded-xl border border-red-100 bg-red-50/60 px-5 py-4">
<p className="text-xs font-medium text-red-700">
           Offline
</p>
<p className="mt-1 text-2xl font-bold text-red-700">
           {statusLoading
             ? "..."
             : offlineCount}
</p>
</div>
</div>
     {/* FLOOR MAP ONLY */}
<section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
<div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
<div>
<h2 className="text-base font-bold text-slate-900">
             Ground Floor
</h2>
<p className="mt-1 text-xs text-slate-500">
             Property camera coverage
</p>
</div>
<div className="flex items-center gap-4 text-xs font-medium">
<div className="flex items-center gap-2 text-emerald-600">
<span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
             Online
</div>
<div className="flex items-center gap-2 text-red-500">
<span className="h-2.5 w-2.5 rounded-full bg-red-500" />
             Offline
</div>
</div>
</div>
<div className="p-4 md:p-6">
<div
           data-floor-map
           className={`relative min-h-[620px] w-full overflow-hidden rounded-2xl border-4 bg-slate-100 shadow-inner transition ${
             editing
               ? "border-blue-500 ring-4 ring-blue-100"
               : "border-slate-300"
           }`}
>
           {/* GARDEN */}
<div className="absolute left-0 top-0 h-[42%] w-[52%] overflow-hidden border-b-4 border-r-4 border-slate-300 bg-gradient-to-br from-emerald-100 to-green-200">
<div className="absolute left-6 top-6 z-10 flex items-center gap-2 rounded-lg border border-white/60 bg-white/85 px-3 py-2 shadow-sm backdrop-blur">
<Flower2
                 size={
                   16
                 }
                 className="text-emerald-700"
               />
<span className="text-xs font-bold tracking-wide text-emerald-900">
                 GARDEN
</span>
</div>
<div className="absolute left-[12%] top-[38%] h-20 w-20 rounded-full bg-emerald-400/40" />
<div className="absolute right-[15%] top-[15%] h-24 w-24 rounded-full bg-green-400/40" />
<div className="absolute bottom-[10%] left-[45%] h-16 w-16 rounded-full bg-emerald-500/30" />
<Trees
               size={72}
               className="absolute bottom-5 right-6 text-emerald-700/25"
             />
</div>
           {/* OUTDOOR */}
<div className="absolute right-0 top-0 h-[42%] w-[48%] overflow-hidden border-b-4 border-slate-300 bg-slate-200">
<div
               className="absolute inset-0 opacity-30"
               style={{
                 backgroundImage:
                   "linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)",
                 backgroundSize:
                   "32px 32px",
               }}
             />
<div className="absolute right-6 top-6 z-10 flex items-center gap-2 rounded-lg border border-white/60 bg-white/85 px-3 py-2 shadow-sm backdrop-blur">
<Wifi
                 size={
                   16
                 }
                 className="text-slate-600"
               />
<span className="text-xs font-bold tracking-wide text-slate-700">
                 OUTDOOR
</span>
</div>
</div>
           {/* HALL */}
<div className="absolute bottom-0 left-0 h-[58%] w-[60%] overflow-hidden border-r-4 border-slate-300 bg-gradient-to-br from-amber-50 to-orange-100">
<div
               className="absolute inset-0 opacity-20"
               style={{
                 backgroundImage:
                   "repeating-linear-gradient(90deg, #b45309 0, #b45309 1px, transparent 1px, transparent 52px)",
               }}
             />
<div className="absolute bottom-6 left-6 z-10 flex items-center gap-2 rounded-lg border border-white/60 bg-white/85 px-3 py-2 shadow-sm backdrop-blur">
<DoorOpen
                 size={
                   16
                 }
                 className="text-amber-700"
               />
<span className="text-xs font-bold tracking-wide text-amber-900">
                 HALL
</span>
</div>
             {/* SOFA */}
<div className="absolute left-[12%] top-[24%] h-[24%] w-[38%] rounded-xl border-2 border-amber-300 bg-white/70 shadow-sm">
<div className="absolute left-3 right-3 top-3 h-[34%] rounded-lg bg-amber-100" />
</div>
             {/* TABLE */}
<div className="absolute right-[15%] top-[28%] h-[28%] w-[16%] rounded-xl border-2 border-amber-300 bg-white/70 shadow-sm" />
</div>
           {/* KITCHEN */}
<div className="absolute bottom-0 right-0 h-[58%] w-[40%] overflow-hidden bg-gradient-to-br from-slate-50 to-blue-100">
<div
               className="absolute inset-0 opacity-25"
               style={{
                 backgroundImage:
                   "linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)",
                 backgroundSize:
                   "36px 36px",
               }}
             />
<div className="absolute bottom-6 right-6 z-10 flex items-center gap-2 rounded-lg border border-white/60 bg-white/85 px-3 py-2 shadow-sm backdrop-blur">
<ChefHat
                 size={
                   16
                 }
                 className="text-blue-700"
               />
<span className="text-xs font-bold tracking-wide text-blue-900">
                 KITCHEN
</span>
</div>
             {/* COUNTERS */}
<div className="absolute left-[8%] right-[8%] top-[8%] h-[14%] rounded-lg border border-slate-300 bg-white/80 shadow-sm" />
<div className="absolute right-[8%] top-[8%] h-[55%] w-[14%] rounded-lg border border-slate-300 bg-white/80 shadow-sm" />
<div className="absolute left-[25%] top-[40%] h-[22%] w-[42%] rounded-xl border-2 border-slate-300 bg-white/80 shadow-sm" />
</div>
           {/* ENTRANCE */}
<div className="absolute bottom-0 left-[53%] z-20 -translate-x-1/2 rounded-t-xl border border-b-0 border-slate-300 bg-white px-5 py-2 shadow-sm">
<div className="flex items-center gap-2">
<DoorOpen
                 size={
                   15
                 }
                 className="text-slate-500"
               />
<span className="text-[10px] font-bold tracking-wider text-slate-600">
                 ENTRANCE
</span>
</div>
</div>
           {/* CAMERA MARKERS */}
           {cameras.map(
             (camera) => {
               const position =
                 positions[
camera.id
                 ];
               if (
                 !position
               ) {
                 return null;
               }
               return (
<CameraMarker
                   key={
camera.id
                   }
                   camera={
                     camera
                   }
                   position={
                     position
                   }
                   selected={
                     selectedCameraId ===
camera.id
                   }
                   editing={
                     editing
                   }
                   onSelect={() =>
                     setSelectedCameraId(
camera.id
                     )
                   }
                   onMove={(
                     nextPosition
                   ) =>
                     moveCamera(
camera.id,
                       nextPosition
                     )
                   }
                 />
               );
             }
           )}
</div>
</div>
</section>
<p className="mt-4 text-center text-xs text-slate-400">
       Drag camera markers in Edit Map mode. Positions are stored in PostgreSQL.
</p>
</div>
 );
}