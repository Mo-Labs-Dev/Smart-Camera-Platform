import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(
 request: Request
) {
 try {
   const formData =
     await request.formData();
   const cameraIdValue =
     formData.get("cameraId");
   const image =
     formData.get("image");
   const cameraId =
     Number(cameraIdValue);
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
   if (!(image instanceof File)) {
     return NextResponse.json(
       {
         ok: false,
         message:
           "Snapshot image is required",
       },
       {
         status: 400,
       }
     );
   }
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
   /*
    * Physical storage directory:
    *
    * project-root/snapshots
    */
   const snapshotsDirectory =
     path.join(
       process.cwd(),
       "snapshots"
     );
   await fs.mkdir(
     snapshotsDirectory,
     {
       recursive: true,
     }
   );
   const timestamp =
     Date.now();
   const filename =
     `camera-${cameraId}-${timestamp}.jpg`;
   const absoluteFilePath =
     path.join(
       snapshotsDirectory,
       filename
     );
   /*
    * Store a RELATIVE path in PostgreSQL.
    * This works even if the project moves.
    */
   const storedFilePath =
     path.join(
       "snapshots",
       filename
     );
   const arrayBuffer =
     await image.arrayBuffer();
   const buffer =
     Buffer.from(
       arrayBuffer
     );
   if (
     buffer.length === 0
   ) {
     return NextResponse.json(
       {
         ok: false,
         message:
           "Snapshot image was empty",
       },
       {
         status: 400,
       }
     );
   }
   await fs.writeFile(
     absoluteFilePath,
     buffer
   );
   /*
    * Confirm file was actually saved.
    */
   const stats =
     await fs.stat(
       absoluteFilePath
     );
   if (
     stats.size === 0
   ) {
     await fs.unlink(
       absoluteFilePath
     ).catch(() => {});
     return NextResponse.json(
       {
         ok: false,
         message:
           "Snapshot file could not be saved",
       },
       {
         status: 500,
       }
     );
   }
   const snapshot =
     await prisma.snapshot.create({
       data: {
         cameraId,
         filename,
         filePath:
           storedFilePath,
       },
       include: {
         camera: true,
       },
     });
   return NextResponse.json(
     {
       ok: true,
       snapshot: {
         id:
snapshot.id,
         cameraId:
           snapshot.cameraId,
         filename:
           snapshot.filename,
         createdAt:
           snapshot.createdAt.toISOString(),
         camera: {
           id:
snapshot.camera.id,
           name:
             snapshot.camera.name,
           location:
             snapshot.camera
               .location,
         },
       },
     },
     {
       status: 201,
     }
   );
 } catch (error) {
   console.error(
     "Snapshot creation failed:",
     error
   );
   return NextResponse.json(
     {
       ok: false,
       message:
         "Failed to save snapshot",
     },
     {
       status: 500,
     }
   );
 }
}
export async function GET() {
 try {
   const snapshots =
     await prisma.snapshot.findMany({
       include: {
         camera: true,
       },
       orderBy: {
         createdAt: "desc",
       },
     });
   return NextResponse.json(
     snapshots.map(
       (snapshot) => ({
         id:
snapshot.id,
         cameraId:
           snapshot.cameraId,
         filename:
           snapshot.filename,
         createdAt:
           snapshot.createdAt.toISOString(),
         camera: {
           id:
snapshot.camera.id,
           name:
             snapshot.camera.name,
           location:
             snapshot.camera
               .location,
         },
       })
     )
   );
 } catch (error) {
   console.error(
     "Failed to load snapshots:",
     error
   );
   return NextResponse.json(
     {
       ok: false,
       message:
         "Failed to load snapshots",
     },
     {
       status: 500,
     }
   );
 }
}