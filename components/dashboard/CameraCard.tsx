"use client";
import {
 useEffect,
 useRef,
 useState,
} from "react";
import Hls from "hls.js";
import {
 ArrowLeft,
 Camera,
 Maximize2,
 MoreVertical,
 RefreshCw,
 Settings,
 Square,
 VideoOff,
 Volume2,
 VolumeX,
} from "lucide-react";
type CameraCardProps = {
 id?: number;
 name: string;
 location: string;
 status?: "online" | "offline";
 streamUrl?: string;
 /*
  * normal   = dashboard/card view
  * operator = large CCTV single-camera view
  */
 mode?: "normal" | "operator";
 /*
  * Used in operator mode to return
  * to the 4-camera multi view.
  */
 onBack?: () => void;
};
export default function CameraCard({
 id = 1,
 name,
 location,
 status = "offline",
 streamUrl,
 mode = "normal",
 onBack,
}: CameraCardProps) {
 const videoRef =
   useRef<HTMLVideoElement>(null);
 const containerRef =
   useRef<HTMLDivElement>(null);
 const hlsRef =
   useRef<Hls | null>(null);
 const recordingTimerRef =
   useRef<ReturnType<
     typeof setInterval
> | null>(null);
 const [
   refreshToken,
   setRefreshToken,
 ] = useState(0);
 const [
   videoReady,
   setVideoReady,
 ] = useState(false);
 const [
   muted,
   setMuted,
 ] = useState(true);
 const [
   snapshotSaving,
   setSnapshotSaving,
 ] = useState(false);
 const [
   recordingLoading,
   setRecordingLoading,
 ] = useState(false);
 const [
   isRecording,
   setIsRecording,
 ] = useState(false);
 const [
   recordingSeconds,
   setRecordingSeconds,
 ] = useState(0);
 const isOperator =
   mode === "operator";
 const isOnline =
   status === "online" &&
   Boolean(streamUrl);
 /*
  * HLS VIDEO
  */
 useEffect(() => {
   const video =
     videoRef.current;
   if (
     !video ||
     !streamUrl ||
     status !== "online"
   ) {
     setVideoReady(false);
     return;
   }
   video.crossOrigin =
     "anonymous";
   video.muted =
     muted;
   setVideoReady(false);
   if (hlsRef.current) {
     hlsRef.current.destroy();
     hlsRef.current =
       null;
   }
   /*
    * Safari / native HLS
    */
   if (
     video.canPlayType(
       "application/vnd.apple.mpegurl"
     )
   ) {
     video.src =
       streamUrl;
     const handleReady =
       () => {
         setVideoReady(
           true
         );
         video
           .play()
           .catch(() => {});
       };
     const handleError =
       () => {
         setVideoReady(
           false
         );
       };
     video.addEventListener(
       "loadedmetadata",
       handleReady
     );
     video.addEventListener(
       "error",
       handleError
     );
     return () => {
       video.removeEventListener(
         "loadedmetadata",
         handleReady
       );
       video.removeEventListener(
         "error",
         handleError
       );
       video.removeAttribute(
         "src"
       );
       video.load();
     };
   }
   /*
    * Chrome / Edge / Firefox
    */
   if (
     Hls.isSupported()
   ) {
     const hls =
       new Hls({
         lowLatencyMode:
           true,
         liveSyncDurationCount:
           3,
         liveMaxLatencyDurationCount:
           6,
         enableWorker:
           true,
       });
     hlsRef.current =
       hls;
     hls.loadSource(
       streamUrl
     );
     hls.attachMedia(
       video
     );
     hls.on(
       Hls.Events
         .MANIFEST_PARSED,
       () => {
         setVideoReady(
           true
         );
         video
           .play()
           .catch(() => {});
       }
     );
     hls.on(
       Hls.Events.ERROR,
       (
         _event,
         data
       ) => {
         console.error(
           "HLS error:",
           data
         );
         if (
           !data.fatal
         ) {
           return;
         }
         if (
           data.type ===
           Hls.ErrorTypes
             .NETWORK_ERROR
         ) {
           hls.startLoad();
           return;
         }
         if (
           data.type ===
           Hls.ErrorTypes
             .MEDIA_ERROR
         ) {
           hls.recoverMediaError();
           return;
         }
         setVideoReady(
           false
         );
       }
     );
     return () => {
       hls.destroy();
       if (
         hlsRef.current ===
         hls
       ) {
         hlsRef.current =
           null;
       }
     };
   }
   console.error(
     "HLS is not supported in this browser."
   );
   setVideoReady(false);
 }, [
   streamUrl,
   status,
   refreshToken,
   muted,
 ]);
 /*
  * Recording timer cleanup
  */
 useEffect(() => {
   return () => {
     if (
       recordingTimerRef.current
     ) {
       clearInterval(
         recordingTimerRef.current
       );
     }
   };
 }, []);
 function startRecordingTimer() {
   setRecordingSeconds(
     0
   );
   if (
     recordingTimerRef.current
   ) {
     clearInterval(
       recordingTimerRef.current
     );
   }
   recordingTimerRef.current =
     setInterval(() => {
       setRecordingSeconds(
         (value) =>
           value + 1
       );
     }, 1000);
 }
 function stopRecordingTimer() {
   if (
     recordingTimerRef.current
   ) {
     clearInterval(
       recordingTimerRef.current
     );
     recordingTimerRef.current =
       null;
   }
 }
 function formatRecordingTime(
   seconds: number
 ) {
   const minutes =
     Math.floor(
       seconds / 60
     );
   const remaining =
     seconds % 60;
   return `${String(
     minutes
   ).padStart(
     2,
     "0"
   )}:${String(
     remaining
   ).padStart(
     2,
     "0"
   )}`;
 }
 /*
  * Refresh stream
  */
 function handleRefresh() {
   setVideoReady(
     false
   );
   setRefreshToken(
     (value) =>
       value + 1
   );
 }
 /*
  * Audio
  */
 function handleMuteToggle() {
   const video =
     videoRef.current;
   if (!video) {
     return;
   }
   const nextMuted =
     !muted;
   video.muted =
     nextMuted;
   setMuted(
     nextMuted
   );
   if (!nextMuted) {
     video
       .play()
       .catch(() => {});
   }
 }
 /*
  * Fullscreen
  */
 async function handleFullscreen() {
   if (
     !containerRef.current
   ) {
     return;
   }
   try {
     if (
       document.fullscreenElement
     ) {
       await document.exitFullscreen();
     } else {
       await containerRef.current.requestFullscreen();
     }
   } catch (error) {
     console.error(
       "Fullscreen error:",
       error
     );
   }
 }
 /*
  * Snapshot
  */
 async function handleSnapshot() {
   const video =
     videoRef.current;
   if (
     !video ||
     !videoReady ||
     snapshotSaving
   ) {
     return;
   }
   if (
     !video.videoWidth ||
     !video.videoHeight
   ) {
     alert(
       "Video frame is not ready yet."
     );
     return;
   }
   setSnapshotSaving(
     true
   );
   try {
     const canvas =
       document.createElement(
         "canvas"
       );
     canvas.width =
       video.videoWidth;
     canvas.height =
       video.videoHeight;
     const context =
       canvas.getContext(
         "2d"
       );
     if (!context) {
       throw new Error(
         "Canvas is unavailable."
       );
     }
     context.drawImage(
       video,
       0,
       0,
       canvas.width,
       canvas.height
     );
     const blob =
       await new Promise<
         Blob | null
>((resolve) => {
         canvas.toBlob(
           resolve,
           "image/jpeg",
           0.92
         );
       });
     if (!blob) {
       throw new Error(
         "Failed to create snapshot."
       );
     }
     const formData =
       new FormData();
     formData.append(
       "cameraId",
       String(id)
     );
     formData.append(
       "image",
       blob,
       `camera-${id}-${Date.now()}.jpg`
     );
     const response =
       await fetch(
         "/api/snapshots",
         {
           method:
             "POST",
           body:
             formData,
         }
       );
     const result =
       await response.json();
     if (!response.ok) {
       throw new Error(
         result.message ??
           "Failed to save snapshot"
       );
     }
   } catch (error) {
     console.error(
       "Snapshot error:",
       error
     );
     alert(
       error instanceof
         Error
         ? error.message
         : "Failed to take snapshot"
     );
   } finally {
     setSnapshotSaving(
       false
     );
   }
 }
 /*
  * Start recording
  */
 async function startRecording() {
   if (
     recordingLoading ||
     isRecording
   ) {
     return;
   }
   setRecordingLoading(
     true
   );
   try {
     const response =
       await fetch(
         `/api/cameras/${id}/recording/start`,
         {
           method:
             "POST",
         }
       );
     const result =
       await response.json();
     if (!response.ok) {
       throw new Error(
         result.message ??
           "Failed to start recording"
       );
     }
     setIsRecording(
       true
     );
     startRecordingTimer();
   } catch (error) {
     console.error(
       "Start recording error:",
       error
     );
     alert(
       error instanceof
         Error
         ? error.message
         : "Failed to start recording"
     );
   } finally {
     setRecordingLoading(
       false
     );
   }
 }
 /*
  * Stop recording
  */
 async function stopRecording() {
   if (
     recordingLoading ||
     !isRecording
   ) {
     return;
   }
   setRecordingLoading(
     true
   );
   try {
     const response =
       await fetch(
         `/api/cameras/${id}/recording/stop`,
         {
           method:
             "POST",
         }
       );
     const result =
       await response.json();
     if (!response.ok) {
       throw new Error(
         result.message ??
           "Failed to stop recording"
       );
     }
     setIsRecording(
       false
     );
     stopRecordingTimer();
   } catch (error) {
     console.error(
       "Stop recording error:",
       error
     );
     alert(
       error instanceof
         Error
         ? error.message
         : "Failed to stop recording"
     );
   } finally {
     setRecordingLoading(
       false
     );
   }
 }
 async function handleRecord() {
   if (
     isRecording
   ) {
     await stopRecording();
   } else {
     await startRecording();
   }
 }
 return (
<div
     className={`overflow-hidden border bg-white transition-all duration-300 ${
       isOperator
         ? "rounded-xl border-slate-700 bg-slate-950 shadow-xl"
         : isOnline
           ? "rounded-2xl border-emerald-300 shadow-[0_0_0_1px_rgba(16,185,129,0.08),0_0_22px_rgba(16,185,129,0.16)]"
           : "rounded-2xl border-red-300 shadow-[0_0_0_1px_rgba(239,68,68,0.08),0_0_22px_rgba(239,68,68,0.14)]"
     }`}
>
     {/* ============================
         HEADER
        ============================ */}
<div
       className={`flex items-center justify-between border-b px-4 py-3 ${
         isOperator
           ? "border-slate-800 bg-slate-900"
           : "border-slate-100 bg-white"
       }`}
>
<div className="flex min-w-0 items-center gap-3">
         {isOperator &&
           onBack && (
<button
               type="button"
               onClick={
                 onBack
               }
               title="Back to Multi View"
               className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-700 text-slate-300 transition hover:bg-slate-800 hover:text-white"
>
<ArrowLeft
                 size={17}
               />
</button>
           )}
<div className="min-w-0">
<h3
             className={`truncate font-semibold ${
               isOperator
                 ? "text-white"
                 : "text-slate-900"
             }`}
>
             {name}
</h3>
<p
             className={`truncate text-sm ${
               isOperator
                 ? "text-slate-400"
                 : "text-slate-500"
             }`}
>
             {location}
</p>
</div>
</div>
<div className="flex items-center gap-3">
         {/* Status */}
<div
           className={`flex items-center gap-2 rounded-full px-2.5 py-1 ${
             isOnline
               ? isOperator
                 ? "bg-emerald-500/15"
                 : "bg-emerald-50"
               : isOperator
                 ? "bg-red-500/15"
                 : "bg-red-50"
           }`}
>
<span
             className={`h-2.5 w-2.5 rounded-full ${
               isOnline
                 ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                 : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.75)]"
             }`}
           />
<span
             className={`text-xs font-medium ${
               isOnline
                 ? isOperator
                   ? "text-emerald-400"
                   : "text-emerald-700"
                 : isOperator
                   ? "text-red-400"
                   : "text-red-700"
             }`}
>
             {isOnline
               ? "LIVE"
               : "OFFLINE"}
</span>
</div>
         {!isOperator && (
<button
             type="button"
             title="More"
             className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100"
>
<MoreVertical
               size={18}
             />
</button>
         )}
</div>
</div>
     {/* ============================
         VIDEO
        ============================ */}
<div
       ref={
         containerRef
       }
       className={`relative overflow-hidden bg-black ${
         isOperator
           ? "aspect-video"
           : "aspect-video"
       }`}
>
       {isOnline ? (
<>
<video
             ref={
               videoRef
             }
             crossOrigin="anonymous"
             autoPlay
             muted={
               muted
             }
             playsInline
             controls={
               false
             }
             className="h-full w-full object-contain"
           />
           {!videoReady && (
<div className="absolute inset-0 flex items-center justify-center bg-slate-950">
<div className="text-center">
<RefreshCw
                   size={
                     isOperator
                       ? 34
                       : 28
                   }
                   className="mx-auto animate-spin text-slate-500"
                 />
<p className="mt-3 text-sm text-slate-400">
                   Connecting to camera...
</p>
</div>
</div>
           )}
           {/* Channel indicator */}
           {isOperator && (
<div className="absolute right-3 top-3 rounded-md bg-black/60 px-2 py-1 font-mono text-[11px] text-white/80 backdrop-blur">
               CAM{" "}
               {String(
                 id
               ).padStart(
                 2,
                 "0"
               )}
</div>
           )}
           {/* Recording */}
           {isRecording && (
<div className="absolute left-3 top-3 flex items-center gap-2 rounded-lg bg-black/75 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
<span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
               REC
<span className="font-mono">
                 {formatRecordingTime(
                   recordingSeconds
                 )}
</span>
</div>
           )}
</>
       ) : (
<div
           className={`flex h-full items-center justify-center ${
             isOperator
               ? "bg-slate-950"
               : "bg-slate-100"
           }`}
>
<div className="text-center">
<div
               className={`mx-auto flex items-center justify-center rounded-full ${
                 isOperator
                   ? "h-20 w-20 bg-red-500/10"
                   : "h-16 w-16 bg-red-50"
               }`}
>
<VideoOff
                 size={
                   isOperator
                     ? 40
                     : 34
                 }
                 strokeWidth={
                   1.5
                 }
                 className={
                   isOperator
                     ? "text-red-500"
                     : "text-red-400"
                 }
               />
</div>
<p
               className={`mt-3 font-semibold ${
                 isOperator
                   ? "text-slate-300"
                   : "text-slate-700"
               }`}
>
               No Signal
</p>
<p
               className={`mt-1 text-sm ${
                 isOperator
                   ? "text-slate-500"
                   : "text-slate-500"
               }`}
>
               Camera is offline or unreachable
</p>
</div>
</div>
       )}
</div>
     {/* ============================
         CONTROLS
        ============================ */}
<div
       className={`flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${
         isOperator
           ? "border-slate-800 bg-slate-900"
           : "border-slate-100 bg-white"
       }`}
>
<div className="flex flex-wrap items-center gap-2">
         {/* Snapshot */}
<button
           type="button"
           onClick={
             handleSnapshot
           }
           disabled={
             !isOnline ||
             !videoReady ||
             snapshotSaving
           }
           className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
             isOperator
               ? "border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
               : "border border-slate-200 text-slate-700 hover:bg-slate-50"
           }`}
>
<Camera
             size={17}
           />
           {snapshotSaving
             ? "Saving..."
             : "Snapshot"}
</button>
         {/* Record */}
<button
           type="button"
           onClick={
             handleRecord
           }
           disabled={
             !isOnline ||
             recordingLoading
           }
           className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
             isRecording
               ? "bg-red-600 text-white hover:bg-red-700"
               : isOperator
                 ? "border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                 : "border border-slate-200 text-slate-700 hover:bg-slate-50"
           }`}
>
           {isRecording ? (
<>
<Square
                 size={
                   14
                 }
                 fill="currentColor"
               />
               {recordingLoading
                 ? "Stopping..."
                 : "Stop Recording"}
</>
           ) : (
<>
<span className="h-3 w-3 rounded-full bg-red-500" />
               {recordingLoading
                 ? "Starting..."
                 : "Record"}
</>
           )}
</button>
</div>
<div className="flex items-center gap-1">
         {/* Sound */}
<button
           type="button"
           onClick={
             handleMuteToggle
           }
           disabled={
             !isOnline
           }
           title={
             muted
               ? "Unmute"
               : "Mute"
           }
           className={`rounded-lg p-2 transition disabled:opacity-40 ${
             isOperator
               ? "text-slate-300 hover:bg-slate-800"
               : "text-slate-600 hover:bg-slate-100"
           }`}
>
           {muted ? (
<VolumeX
               size={18}
             />
           ) : (
<Volume2
               size={18}
             />
           )}
</button>
         {/* Refresh */}
<button
           type="button"
           onClick={
             handleRefresh
           }
           disabled={
             !isOnline
           }
           title="Reconnect stream"
           className={`rounded-lg p-2 transition disabled:opacity-40 ${
             isOperator
               ? "text-slate-300 hover:bg-slate-800"
               : "text-slate-600 hover:bg-slate-100"
           }`}
>
<RefreshCw
             size={18}
           />
</button>
         {/* Fullscreen */}
<button
           type="button"
           onClick={
             handleFullscreen
           }
           disabled={
             !isOnline ||
             !videoReady
           }
           title="Fullscreen"
           className={`rounded-lg p-2 transition disabled:opacity-40 ${
             isOperator
               ? "text-slate-300 hover:bg-slate-800"
               : "text-slate-600 hover:bg-slate-100"
           }`}
>
<Maximize2
             size={18}
           />
</button>
         {/* Settings */}
<button
           type="button"
           title="Camera settings"
           className={`rounded-lg p-2 transition ${
             isOperator
               ? "text-slate-300 hover:bg-slate-800"
               : "text-slate-600 hover:bg-slate-100"
           }`}
>
<Settings
             size={18}
           />
</button>
</div>
</div>
</div>
 );
}