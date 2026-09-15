import {
 NextResponse,
} from "next/server";
import {
 spawn,
 spawnSync,
} from "node:child_process";
import path from "node:path";
import {
 prisma,
} from "@/lib/prisma";
import {
 requirePermission,
} from "@/lib/authorization";
import {
 ensureRecordingDirectories,
 getRecordingsDirectory,
 isProcessRunning,
 readRecordingState,
 removeRecordingState,
 saveRecordingState,
} from "@/lib/recordingManager";
export const runtime =
 "nodejs";
export const dynamic =
 "force-dynamic";
type Context = {
 params: Promise<{
   id: string;
 }>;
};
function createFilename(
 cameraId: number
) {
 const timestamp =
   new Date()
     .toISOString()
     .replace(
       /[:.]/g,
       "-"
     );
 return `camera-${cameraId}-${timestamp}.mp4`;
}
export async function POST(
 _request: Request,
 context: Context
) {
    const access =
 await requirePermission(
   "recording:operate"
 );
if (!access.ok) {
 return access.response;
}
 try {
   const {
     id: idValue,
   } =
     await context.params;
   const cameraId =
     Number(idValue);
   if (
     !Number.isInteger(
       cameraId
     ) ||
     cameraId <= 0
   ) {
     return NextResponse.json(
       {
         ok: false,
         message:
           "Invalid camera ID",
       },
       {
         status: 400,
       }
     );
   }
   /*
    * Find camera from Prisma.
    */
   const camera =
     await prisma.camera.findUnique({
       where: {
         id: cameraId,
       },
     });
   if (!camera) {
     return NextResponse.json(
       {
         ok: false,
         message:
           "Camera not found",
       },
       {
         status: 404,
       }
     );
   }
   if (
     !camera.streamPath
   ) {
     return NextResponse.json(
       {
         ok: false,
         message:
           "Camera has no MediaMTX stream path",
       },
       {
         status: 400,
       }
     );
   }
   /*
    * Check FFmpeg exists.
    */
   const ffmpegCheck =
     spawnSync(
       "ffmpeg",
       [
         "-version",
       ],
       {
         stdio:
           "ignore",
       }
     );
   if (
     ffmpegCheck.status !==
     0
   ) {
     return NextResponse.json(
       {
         ok: false,
         message:
           "FFmpeg is not available on the server",
       },
       {
         status: 500,
       }
     );
   }
   /*
    * Check for an existing
    * recording process.
    */
   const existingState =
     await readRecordingState(
       cameraId
     );
   if (
     existingState &&
     isProcessRunning(
       existingState.pid
     )
   ) {
     return NextResponse.json(
       {
         ok: false,
         message:
           `${camera.name} is already recording`,
         recordingId:
           existingState.recordingId,
       },
       {
         status: 409,
       }
     );
   }
   /*
    * Remove stale state.
    */
   if (
     existingState
   ) {
     await removeRecordingState(
       cameraId
     );
   }
   /*
    * Also check database.
    *
    * This protects against duplicate
    * active Recording rows.
    */
   const activeRecording =
     await prisma.recording.findFirst({
       where: {
         cameraId,
         status:
           "recording",
       },
       orderBy: {
         startedAt:
           "desc",
       },
     });
   if (
     activeRecording
   ) {
     /*
      * Previous app/FFmpeg process may
      * have crashed.
      *
      * Mark the stale row failed.
      */
     await prisma.recording.update({
       where: {
         id:
activeRecording.id,
       },
       data: {
         status:
           "failed",
         endedAt:
           new Date(),
       },
     });
   }
   await ensureRecordingDirectories();
   const filename =
     createFilename(
       cameraId
     );
   const filePath =
     path.resolve(
       getRecordingsDirectory(),
       filename
     );
   const startedAt =
     new Date();
   /*
    * Create database row first.
    */
   const recording =
     await prisma.recording.create({
       data: {
         cameraId,
         filename,
         filePath,
         startedAt,
         status:
           "recording",
       },
     });
   /*
    * Pull RTSP from our local
    * MediaMTX server.
    *
    * Example:
    *
    * rtsp://127.0.0.1:8554/camera2
    */
   const rtspUrl =
     `rtsp://127.0.0.1:8554/${encodeURIComponent(
       camera.streamPath
     )}`;
   /*
    * Record video without transcoding.
    *
    * This uses very little CPU.
    *
    * Audio is disabled for now to avoid
    * incompatible Tapo audio codecs in MP4.
    */
   const args = [
     "-hide_banner",
     "-loglevel",
     "warning",
     "-rtsp_transport",
     "tcp",
     "-fflags",
     "+genpts",
     "-use_wallclock_as_timestamps",
     "1",
     "-i",
     rtspUrl,
     "-map",
     "0:v:0",
     "-c:v",
     "copy",
     "-an",
     "-avoid_negative_ts",
     "make_zero",
     "-movflags",
     "+faststart",
     "-y",
     filePath,
   ];
   const child =
     spawn(
       "ffmpeg",
       args,
       {
         detached:
           true,
         stdio:
           "ignore",
       }
     );
   if (
     !child.pid
   ) {
     await prisma.recording.update({
       where: {
         id:
recording.id,
       },
       data: {
         status:
           "failed",
         endedAt:
           new Date(),
       },
     });
     return NextResponse.json(
       {
         ok: false,
         message:
           "Failed to start FFmpeg",
       },
       {
         status: 500,
       }
     );
   }
   child.unref();
   /*
    * Give FFmpeg a short moment
    * to start.
    */
   await new Promise(
     (resolve) =>
       setTimeout(
         resolve,
         500
       )
   );
   if (
     !isProcessRunning(
       child.pid
     )
   ) {
     await prisma.recording.update({
       where: {
         id:
recording.id,
       },
       data: {
         status:
           "failed",
         endedAt:
           new Date(),
       },
     });
     return NextResponse.json(
       {
         ok: false,
         message:
           "FFmpeg stopped immediately. Check the MediaMTX stream.",
       },
       {
         status: 500,
       }
     );
   }
   /*
    * Save the FFmpeg PID so the
    * stop endpoint can find it.
    */
   await saveRecordingState({
     cameraId,
     recordingId:
recording.id,
     pid:
       child.pid,
     filename,
     filePath,
     startedAt:
       startedAt.toISOString(),
   });
   /*
    * Event log.
    */
   try {
     await prisma.event.create({
       data: {
         cameraId,
         type:
           "recording_started",
         message:
           `Recording started for ${camera.name}`,
       },
     });
   } catch (error) {
     console.error(
       "Recording started event error:",
       error
     );
   }
   return NextResponse.json(
     {
       ok: true,
       message:
         `Recording started for ${camera.name}`,
       recording: {
         id:
recording.id,
         cameraId,
         filename,
         startedAt:
           startedAt.toISOString(),
         status:
           "recording",
       },
     },
     {
       status: 201,
     }
   );
 } catch (error) {
   console.error(
     "Start recording error:",
     error
   );
   return NextResponse.json(
     {
       ok: false,
       message:
         "Failed to start recording",
     },
     {
       status: 500,
     }
   );
 }
}