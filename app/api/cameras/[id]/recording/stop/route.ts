import {
 requirePermission,
} from "@/lib/authorization";
import {
 NextResponse,
} from "next/server";
import fs from "node:fs/promises";
import {
 prisma,
} from "@/lib/prisma";
import {
 isProcessRunning,
 readRecordingState,
 removeRecordingState,
 waitForProcessToStop,
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
   const camera =
     await prisma.camera.findUnique({
       where: {
         id:
           cameraId,
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
   /*
    * Read saved FFmpeg process.
    */
   const state =
     await readRecordingState(
       cameraId
     );
   /*
    * Find active database recording.
    */
   const recording =
     state
       ? await prisma.recording.findUnique({
           where: {
             id:
               state.recordingId,
           },
         })
       : await prisma.recording.findFirst({
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
   if (!recording) {
     return NextResponse.json(
       {
         ok: false,
         message:
           `${camera.name} is not currently recording`,
       },
       {
         status: 404,
       }
     );
   }
   /*
    * Gracefully stop FFmpeg.
    *
    * SIGINT allows FFmpeg to finalize
    * the MP4 correctly.
    */
   if (
     state &&
     isProcessRunning(
       state.pid
     )
   ) {
     try {
       process.kill(
         state.pid,
         "SIGINT"
       );
     } catch (error) {
       console.error(
         "Unable to send SIGINT to FFmpeg:",
         error
       );
     }
     const stopped =
       await waitForProcessToStop(
         state.pid,
         10000
       );
     /*
      * If FFmpeg ignores SIGINT,
      * terminate it.
      */
     if (
       !stopped &&
       isProcessRunning(
         state.pid
       )
     ) {
       try {
         process.kill(
           state.pid,
           "SIGTERM"
         );
         await waitForProcessToStop(
           state.pid,
           3000
         );
       } catch (
         error
       ) {
         console.error(
           "Unable to terminate FFmpeg:",
           error
         );
       }
     }
   }
   const endedAt =
     new Date();
   const durationSec =
     Math.max(
       0,
       Math.round(
         (
           endedAt.getTime() -
           recording.startedAt.getTime()
         ) /
           1000
       )
     );
   /*
    * Calculate final MP4 size.
    */
   let fileSize:
     | bigint
     | null = null;
   try {
     const stat =
       await fs.stat(
         recording.filePath
       );
     fileSize =
       BigInt(
         stat.size
       );
   } catch (error) {
     console.error(
       "Recording file stat error:",
       error
     );
   }
   /*
    * If a real MP4 exists,
    * recording completed.
    *
    * Otherwise mark it failed.
    */
   const status =
     fileSize !== null &&
     fileSize > BigInt (0)
       ? "completed"
       : "failed";
   const updatedRecording =
     await prisma.recording.update({
       where: {
         id:
recording.id,
       },
       data: {
         endedAt,
         durationSec,
         fileSize,
         status,
       },
     });
   await removeRecordingState(
     cameraId
   );
   /*
    * Event.
    */
   try {
     await prisma.event.create({
       data: {
         cameraId,
         type:
           status ===
           "completed"
             ? "recording_stopped"
             : "recording_failed",
         message:
           status ===
           "completed"
             ? `Recording completed for ${camera.name}`
             : `Recording failed for ${camera.name}`,
       },
     });
   } catch (error) {
     console.error(
       "Recording stop event error:",
       error
     );
   }
   return NextResponse.json({
     ok:
       status ===
       "completed",
     message:
       status ===
       "completed"
         ? `Recording saved for ${camera.name}`
         : `Recording stopped but no valid video file was created for ${camera.name}`,
     recording: {
       id:
updatedRecording.id,
       filename:
         updatedRecording.filename,
       status:
         updatedRecording.status,
       durationSec:
         updatedRecording.durationSec,
       fileSize:
         updatedRecording.fileSize
           ? updatedRecording.fileSize.toString()
           : null,
       startedAt:
         updatedRecording.startedAt.toISOString(),
       endedAt:
         updatedRecording.endedAt
           ? updatedRecording.endedAt.toISOString()
           : null,
     },
   });
 } catch (error) {
   console.error(
     "Stop recording error:",
     error
   );
   return NextResponse.json(
     {
       ok: false,
       message:
         "Failed to stop recording",
     },
     {
       status: 500,
     }
   );
 }
}