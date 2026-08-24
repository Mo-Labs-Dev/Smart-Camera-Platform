import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = {
 params: Promise<{
   id: string;
 }>;
};
export async function PUT(
 request: Request,
 context: Context
) {
 try {
   const { id: idValue } = await context.params;
   const id = Number(idValue);
   if (!Number.isInteger(id) || id <= 0) {
     return NextResponse.json(
       {
         ok: false,
         message: "Invalid camera ID",
       },
       {
         status: 400,
       }
     );
   }
   const existing = await prisma.camera.findUnique({
     where: {
       id,
     },
   });
   if (!existing) {
     return NextResponse.json(
       {
         ok: false,
         message: "Camera not found",
       },
       {
         status: 404,
       }
     );
   }
   const body = await request.json();
   const name =
     typeof body.name === "string"
       ? body.name.trim()
       : "";
   if (!name) {
     return NextResponse.json(
       {
         ok: false,
         message: "Camera name is required",
       },
       {
         status: 400,
       }
     );
   }
   const camera = await prisma.camera.update({
     where: {
       id,
     },
     data: {
       name,
       location:
         typeof body.location === "string" &&
         body.location.trim()
           ? body.location.trim()
           : null,
       host:
         typeof body.host === "string" &&
         body.host.trim()
           ? body.host.trim()
           : null,
       streamPath:
         typeof body.streamPath === "string" &&
         body.streamPath.trim()
           ? body.streamPath.trim()
           : null,
     },
   });
   return NextResponse.json({
     ok: true,
     camera,
   });
 } catch (error) {
   console.error("Update camera error:", error);
   return NextResponse.json(
     {
       ok: false,
       message: "Failed to update camera",
     },
     {
       status: 500,
     }
   );
 }
}
export async function DELETE(
 _request: Request,
 context: Context
) {
 try {
   const { id: idValue } = await context.params;
   const id = Number(idValue);
   if (!Number.isInteger(id) || id <= 0) {
     return NextResponse.json(
       {
         ok: false,
         message: "Invalid camera ID",
       },
       {
         status: 400,
       }
     );
   }
   const camera = await prisma.camera.findUnique({
     where: {
       id,
     },
     include: {
       _count: {
         select: {
           recordings: true,
           snapshots: true,
           events: true,
         },
       },
     },
   });
   if (!camera) {
     return NextResponse.json(
       {
         ok: false,
         message: "Camera not found",
       },
       {
         status: 404,
       }
     );
   }
   if (
     camera._count.recordings > 0 ||
     camera._count.snapshots > 0
   ) {
     return NextResponse.json(
       {
         ok: false,
         message:
           "This camera has saved recordings or snapshots and cannot be deleted.",
         dependencies: {
           recordings: camera._count.recordings,
           snapshots: camera._count.snapshots,
           events: camera._count.events,
         },
       },
       {
         status: 409,
       }
     );
   }
   await prisma.camera.delete({
     where: {
       id,
     },
   });
   return NextResponse.json({
     ok: true,
     message: `${camera.name} deleted successfully`,
   });
 } catch (error) {
   console.error("Delete camera error:", error);
   return NextResponse.json(
     {
       ok: false,
       message: "Failed to delete camera",
     },
     {
       status: 500,
     }
   );
 }
}