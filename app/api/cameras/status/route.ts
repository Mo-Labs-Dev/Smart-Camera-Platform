import { NextResponse } from "next/server";
import net from "node:net";
import { prisma } from "@/lib/prisma";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/*
* Default RTSP port used by most
* IP cameras.
*/
const RTSP_PORT = 554;
/*
* Maximum time to wait when checking
* whether a camera is reachable.
*/
const CONNECTION_TIMEOUT_MS = 1500;
/*
* Check whether a TCP port is reachable.
*/
function checkPort(
 host: string,
 port: number
): Promise<boolean> {
 return new Promise((resolve) => {
   const socket = new net.Socket();
   let finished = false;
   const finish = (
     online: boolean
   ) => {
     if (finished) {
       return;
     }
     finished = true;
     socket.destroy();
     resolve(online);
   };
   socket.setTimeout(
     CONNECTION_TIMEOUT_MS
   );
   socket.once(
     "connect",
     () => {
       finish(true);
     }
   );
   socket.once(
     "timeout",
     () => {
       finish(false);
     }
   );
   socket.once(
     "error",
     () => {
       finish(false);
     }
   );
   socket.connect(
     port,
     host
   );
 });
}
/*
* Get the most recent online/offline
* event for a camera.
*/
async function getLastCameraStatusEvent(
 cameraId: number
) {
 return prisma.event.findFirst({
   where: {
     cameraId,
     type: {
       in: [
         "camera_online",
         "camera_offline",
       ],
     },
   },
   orderBy: {
     createdAt: "desc",
   },
   select: {
     type: true,
     createdAt: true,
   },
 });
}
/*
* Store a camera status event only
* when the state changes.
*
* Example:
*
* offline -> offline
* no new event
*
* offline -> online
* create camera_online
*
* online -> online
* no new event
*
* online -> offline
* create camera_offline
*/
async function logStatusChange({
 cameraId,
 cameraName,
 status,
}: {
 cameraId: number;
 cameraName: string;
 status: "online" | "offline";
}) {
 try {
   const lastStatusEvent =
     await getLastCameraStatusEvent(
       cameraId
     );
   const eventType =
     status === "online"
       ? "camera_online"
       : "camera_offline";
   /*
    * Status did not change.
    * Do not create duplicate events.
    */
   if (
     lastStatusEvent?.type ===
     eventType
   ) {
     return;
   }
   await prisma.event.create({
     data: {
       cameraId,
       type: eventType,
       message:
         status === "online"
           ? `${cameraName} is online`
           : `${cameraName} is offline`,
     },
   });
 } catch (error) {
   /*
    * Event logging failure should not
    * break the camera status endpoint.
    */
   console.error(
     `Failed to log status change for camera ${cameraId}:`,
     error
   );
 }
}
/*
* GET /api/cameras/status
*/
export async function GET() {
 try {
   /*
    * IMPORTANT:
    *
    * Cameras now come directly from
    * PostgreSQL through Prisma.
    *
    * We no longer use:
    *
    * import { cameras } from "@/lib/cameras";
    */
   const cameras =
     await prisma.camera.findMany({
       select: {
         id: true,
         name: true,
         host: true,
         streamPath: true,
       },
       orderBy: {
         id: "asc",
       },
     });
   /*
    * Check every registered camera.
    */
   const result =
     await Promise.all(
       cameras.map(
         async (camera) => {
           /*
            * Camera cannot be checked
            * without a host/IP address.
            */
           if (!camera.host) {
             const status =
               "offline" as const;
             await logStatusChange({
               cameraId:
camera.id,
               cameraName:
                 camera.name,
               status,
             });
             return {
               id: camera.id,
               name: camera.name,
               status,
             };
           }
           /*
            * Remove accidental spaces
            * from the saved host.
            */
           const host =
             camera.host.trim();
           if (!host) {
             const status =
               "offline" as const;
             await logStatusChange({
               cameraId:
camera.id,
               cameraName:
                 camera.name,
               status,
             });
             return {
               id: camera.id,
               name: camera.name,
               status,
             };
           }
           /*
            * Check whether RTSP port
            * 554 is reachable.
            */
           const online =
             await checkPort(
               host,
               RTSP_PORT
             );
           const status =
             online
               ? ("online" as const)
               : ("offline" as const);
           /*
            * Create an event only if
            * the status changed.
            */
           await logStatusChange({
             cameraId:
camera.id,
             cameraName:
               camera.name,
             status,
           });
           return {
             id: camera.id,
             name: camera.name,
             status,
           };
         }
       )
     );
   return NextResponse.json(
     result,
     {
       headers: {
         "Cache-Control":
           "no-store, no-cache, must-revalidate",
       },
     }
   );
 } catch (error) {
   console.error(
     "Camera status API error:",
     error
   );
   return NextResponse.json(
     {
       message:
         "Failed to check camera status",
     },
     {
       status: 500,
     }
   );
 }
}