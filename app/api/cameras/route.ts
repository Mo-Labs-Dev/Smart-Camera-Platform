import {
 NextResponse,
} from "next/server";
import {
 prisma,
} from "@/lib/prisma";
import {
 requirePermission,
} from "@/lib/authorization";
export const runtime =
 "nodejs";
export const dynamic =
 "force-dynamic";
/*
* GET /api/cameras
*
* Authenticated users may view cameras.
* Global authentication is handled
* by proxy.ts.
*/
export async function GET() {
 try {
   const cameras =
     await prisma.camera.findMany({
       orderBy: {
         id: "asc",
       },
     });
   return NextResponse.json(
     cameras
   );
 } catch (error) {
   console.error(
     "Load cameras error:",
     error
   );
   return NextResponse.json(
     {
       ok: false,
       message:
         "Failed to load cameras",
     },
     {
       status: 500,
     }
   );
 }
}
/*
* POST /api/cameras
*
* ADMIN only.
*/
export async function POST(
 request: Request
) {
 const access =
   await requirePermission(
     "camera:manage"
   );
 if (!access.ok) {
   return access.response;
 }
 try {
   const body =
     await request.json();
   const name =
     typeof body.name ===
       "string"
       ? body.name.trim()
       : "";
   const location =
     typeof body.location ===
       "string" &&
     body.location.trim()
       ? body.location.trim()
       : null;
   const host =
     typeof body.host ===
       "string" &&
     body.host.trim()
       ? body.host.trim()
       : null;
   const streamPath =
     typeof body.streamPath ===
       "string" &&
     body.streamPath.trim()
       ? body.streamPath.trim()
       : null;
   if (!name) {
     return NextResponse.json(
       {
         ok: false,
         message:
           "Camera name is required",
       },
       {
         status: 400,
       }
     );
   }
   if (host) {
     const existingHost =
       await prisma.camera.findFirst(
         {
           where: {
             host,
           },
         }
       );
     if (existingHost) {
       return NextResponse.json(
         {
           ok: false,
           message:
             `A camera with IP ${host} already exists.`,
         },
         {
           status: 409,
         }
       );
     }
   }
   if (streamPath) {
     const existingStream =
       await prisma.camera.findFirst(
         {
           where: {
             streamPath,
           },
         }
       );
     if (existingStream) {
       return NextResponse.json(
         {
           ok: false,
           message:
             `Stream path "${streamPath}" is already used by another camera.`,
         },
         {
           status: 409,
         }
       );
     }
   }
   const camera =
     await prisma.camera.create({
       data: {
         name,
         location,
         host,
         streamPath,
       },
     });
   await prisma.event.create({
     data: {
       cameraId:
camera.id,
       type:
         "camera_added",
       message:
         `${camera.name} was added to the platform`,
     },
   });
   return NextResponse.json(
     {
       ok: true,
       camera,
     },
     {
       status: 201,
     }
   );
 } catch (error) {
   console.error(
     "Create camera error:",
     error
   );
   return NextResponse.json(
     {
       ok: false,
       message:
         "Failed to create camera",
     },
     {
       status: 500,
     }
   );
 }
}