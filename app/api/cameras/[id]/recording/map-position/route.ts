import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type RouteContext = {
 params: Promise<{
   id: string;
 }>;
};
export async function PUT(
 request: NextRequest,
 context: RouteContext
) {
 try {
   const { id } =
     await context.params;
   const cameraId =
     Number(id);
   if (
     !Number.isInteger(cameraId) ||
     cameraId <= 0
   ) {
     return NextResponse.json(
       {
         message:
           "Invalid camera ID.",
       },
       {
         status: 400,
       }
     );
   }
   const body =
     await request.json();
   const existing =
     await prisma.camera.findUnique({
       where: {
         id: cameraId,
       },
     });
   if (!existing) {
     return NextResponse.json(
       {
         message:
           "Camera not found.",
       },
       {
         status: 404,
       }
     );
   }
   const updateData: {
     name?: string;
     location?: string | null;
     host?: string | null;
     streamPath?: string | null;
     mapX?: number | null;
     mapY?: number | null;
   } = {};
   if (
     typeof body.name ===
     "string"
   ) {
     const name =
       body.name.trim();
     if (!name) {
       return NextResponse.json(
         {
           message:
             "Camera name is required.",
         },
         {
           status: 400,
         }
       );
     }
     updateData.name =
       name;
   }
   if (
     body.location !==
     undefined
   ) {
     updateData.location =
       typeof body.location ===
       "string" &&
       body.location.trim()
         ? body.location.trim()
         : null;
   }
   if (
     body.host !== undefined
   ) {
     updateData.host =
       typeof body.host ===
       "string" &&
       body.host.trim()
         ? body.host.trim()
         : null;
   }
   if (
     body.streamPath !==
     undefined
   ) {
     const streamPath =
       typeof body.streamPath ===
       "string"
         ? body.streamPath.trim()
         : "";
     if (streamPath) {
       const duplicate =
         await prisma.camera.findFirst({
           where: {
             streamPath,
             NOT: {
               id: cameraId,
             },
           },
         });
       if (duplicate) {
         return NextResponse.json(
           {
             message:
               `Stream path "${streamPath}" is already used by another camera.`,
           },
           {
             status: 409,
           }
         );
       }
       updateData.streamPath =
         streamPath;
     } else {
       updateData.streamPath =
         null;
     }
   }
   if (
     body.mapX !== undefined
   ) {
     if (
       body.mapX === null
     ) {
       updateData.mapX =
         null;
     } else {
       const mapX =
         Number(body.mapX);
       if (
         !Number.isFinite(
           mapX
         ) ||
         mapX < 0 ||
         mapX > 100
       ) {
         return NextResponse.json(
           {
             message:
               "mapX must be between 0 and 100.",
           },
           {
             status: 400,
           }
         );
       }
       updateData.mapX =
         mapX;
     }
   }
   if (
     body.mapY !== undefined
   ) {
     if (
       body.mapY === null
     ) {
       updateData.mapY =
         null;
     } else {
       const mapY =
         Number(body.mapY);
       if (
         !Number.isFinite(
           mapY
         ) ||
         mapY < 0 ||
         mapY > 100
       ) {
         return NextResponse.json(
           {
             message:
               "mapY must be between 0 and 100.",
           },
           {
             status: 400,
           }
         );
       }
       updateData.mapY =
         mapY;
     }
   }
   if (
     Object.keys(
       updateData
     ).length === 0
   ) {
     return NextResponse.json(
       {
         message:
           "No camera fields supplied.",
       },
       {
         status: 400,
       }
     );
   }
   const camera =
     await prisma.camera.update({
       where: {
         id: cameraId,
       },
       data: updateData,
     });
   return NextResponse.json({
     message:
       "Camera updated successfully.",
     camera,
   });
 } catch (error) {
   console.error(
     "PUT camera error:",
     error
   );
   return NextResponse.json(
     {
       message:
         "Failed to update camera.",
     },
     {
       status: 500,
     }
   );
 }
}
export async function DELETE(
 _request: NextRequest,
 context: RouteContext
) {
 try {
   const { id } =
     await context.params;
   const cameraId =
     Number(id);
   if (
     !Number.isInteger(cameraId) ||
     cameraId <= 0
   ) {
     return NextResponse.json(
       {
         message:
           "Invalid camera ID.",
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
       include: {
         _count: {
           select: {
             recordings:
               true,
             snapshots:
               true,
             events: true,
           },
         },
       },
     });
   if (!camera) {
     return NextResponse.json(
       {
         message:
           "Camera not found.",
       },
       {
         status: 404,
       }
     );
   }
   if (
     camera._count
       .recordings > 0 ||
     camera._count
       .snapshots > 0
   ) {
     return NextResponse.json(
       {
         message:
           "Camera cannot be deleted because recordings or snapshots are attached to it.",
         counts:
           camera._count,
       },
       {
         status: 409,
       }
     );
   }
   await prisma.camera.delete({
     where: {
       id: cameraId,
     },
   });
   return NextResponse.json({
     message:
       "Camera deleted successfully.",
   });
 } catch (error) {
   console.error(
     "DELETE camera error:",
     error
   );
   return NextResponse.json(
     {
       message:
         "Failed to delete camera.",
     },
     {
       status: 500,
     }
   );
 }
}