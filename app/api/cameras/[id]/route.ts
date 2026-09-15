import {
 NextRequest,
 NextResponse,
} from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/authorization";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type RouteContext = {
 params: Promise<{
   id: string;
 }>;
};
function parseCameraId(
 value: string
) {
 const id = Number(value);
 if (
   !Number.isInteger(id) ||
   id <= 0
 ) {
   return null;
 }
 return id;
}
/*
* GET /api/cameras/:id
*
* All authenticated users.
*/
export async function GET(
 _request: NextRequest,
 context: RouteContext
) {
 try {
   const { id: idParam } =
     await context.params;
   const id =
     parseCameraId(idParam);
   if (id === null) {
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
         id,
       },
     });
   if (!camera) {
     return NextResponse.json(
       {
         message:
           `Camera ${id} was not found.`,
       },
       {
         status: 404,
       }
     );
   }
   return NextResponse.json(
     camera,
     {
       headers: {
         "Cache-Control":
           "no-store",
       },
     }
   );
 } catch (error) {
   console.error(
     "GET camera error:",
     error
   );
   return NextResponse.json(
     {
       message:
         "Unable to load camera.",
     },
     {
       status: 500,
     }
   );
 }
}
/*
* PUT /api/cameras/:id
*
* ADMIN only.
*/
export async function PUT(
 request: NextRequest,
 context: RouteContext
) {
 const access =
   await requirePermission(
     "camera:manage"
   );
 if (!access.ok) {
   return access.response;
 }
 try {
   const { id: idParam } =
     await context.params;
   const id =
     parseCameraId(idParam);
   if (id === null) {
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
   const existingCamera =
     await prisma.camera.findUnique({
       where: {
         id,
       },
     });
   if (!existingCamera) {
     return NextResponse.json(
       {
         message:
           `Camera ${id} was not found.`,
       },
       {
         status: 404,
       }
     );
   }
   const body =
     await request.json();
   const data: {
     name?: string;
     location?: string | null;
     host?: string | null;
     streamPath?: string | null;
     mapX?: number | null;
     mapY?: number | null;
   } = {};
   /*
    * NAME
    */
   if (
     Object.prototype.hasOwnProperty.call(
       body,
       "name"
     )
   ) {
     if (
       typeof body.name !==
         "string" ||
       body.name.trim().length ===
         0
     ) {
       return NextResponse.json(
         {
           message:
             "Camera name cannot be empty.",
         },
         {
           status: 400,
         }
       );
     }
     data.name =
       body.name.trim();
   }
   /*
    * LOCATION
    */
   if (
     Object.prototype.hasOwnProperty.call(
       body,
       "location"
     )
   ) {
     if (
       body.location === null
     ) {
       data.location = null;
     } else if (
       typeof body.location ===
       "string"
     ) {
       const location =
         body.location.trim();
       data.location =
         location.length > 0
           ? location
           : null;
     } else {
       return NextResponse.json(
         {
           message:
             "Invalid camera location.",
         },
         {
           status: 400,
         }
       );
     }
   }
   /*
    * HOST / IP
    */
   if (
     Object.prototype.hasOwnProperty.call(
       body,
       "host"
     )
   ) {
     if (body.host === null) {
       data.host = null;
     } else if (
       typeof body.host ===
       "string"
     ) {
       const host =
         body.host.trim();
       data.host =
         host.length > 0
           ? host
           : null;
     } else {
       return NextResponse.json(
         {
           message:
             "Invalid camera host.",
         },
         {
           status: 400,
         }
       );
     }
   }
   /*
    * STREAM PATH
    */
   if (
     Object.prototype.hasOwnProperty.call(
       body,
       "streamPath"
     )
   ) {
     if (
       body.streamPath === null
     ) {
       data.streamPath = null;
     } else if (
       typeof body.streamPath ===
       "string"
     ) {
       const streamPath =
         body.streamPath.trim();
       if (
         streamPath.length === 0
       ) {
         data.streamPath = null;
       } else {
         const duplicate =
           await prisma.camera.findFirst(
             {
               where: {
                 streamPath,
                 NOT: {
                   id,
                 },
               },
               select: {
                 id: true,
                 name: true,
               },
             }
           );
         if (duplicate) {
           return NextResponse.json(
             {
               message:
                 `Stream path "${streamPath}" ` +
                 `is already used by ${duplicate.name}.`,
             },
             {
               status: 409,
             }
           );
         }
         data.streamPath =
           streamPath;
       }
     } else {
       return NextResponse.json(
         {
           message:
             "Invalid stream path.",
         },
         {
           status: 400,
         }
       );
     }
   }
   /*
    * MAP X
    *
    * Coordinates are percentages:
    * 0 = left
    * 100 = right
    */
   if (
     Object.prototype.hasOwnProperty.call(
       body,
       "mapX"
     )
   ) {
     if (body.mapX === null) {
       data.mapX = null;
     } else {
       const mapX =
         Number(body.mapX);
       if (
         !Number.isFinite(mapX) ||
         mapX < 0 ||
         mapX > 100
       ) {
         return NextResponse.json(
           {
             message:
               "Map X position must be between 0 and 100.",
           },
           {
             status: 400,
           }
         );
       }
       data.mapX = mapX;
     }
   }
   /*
    * MAP Y
    *
    * 0 = top
    * 100 = bottom
    */
   if (
     Object.prototype.hasOwnProperty.call(
       body,
       "mapY"
     )
   ) {
     if (body.mapY === null) {
       data.mapY = null;
     } else {
       const mapY =
         Number(body.mapY);
       if (
         !Number.isFinite(mapY) ||
         mapY < 0 ||
         mapY > 100
       ) {
         return NextResponse.json(
           {
             message:
               "Map Y position must be between 0 and 100.",
           },
           {
             status: 400,
           }
         );
       }
       data.mapY = mapY;
     }
   }
   if (
     Object.keys(data).length ===
     0
   ) {
     return NextResponse.json(
       {
         message:
           "No valid camera fields were provided.",
       },
       {
         status: 400,
       }
     );
   }
   const camera =
     await prisma.camera.update({
       where: {
         id,
       },
       data,
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
         "Unable to update camera.",
     },
     {
       status: 500,
     }
   );
 }
}
/*
* DELETE /api/cameras/:id
*
* ADMIN only.
*/
export async function DELETE(
 _request: NextRequest,
 context: RouteContext
) {
 const access =
   await requirePermission(
     "camera:manage"
   );
 if (!access.ok) {
   return access.response;
 }
 try {
   const { id: idParam } =
     await context.params;
   const id =
     parseCameraId(idParam);
   if (id === null) {
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
         message:
           `Camera ${id} was not found.`,
       },
       {
         status: 404,
       }
     );
   }
   /*
    * Protect recordings and snapshots
    * from accidental cascade deletion.
    */
   if (
     camera._count.recordings >
       0 ||
     camera._count.snapshots > 0
   ) {
     return NextResponse.json(
       {
         message:
           "This camera cannot be deleted because it has recordings or snapshots.",
         counts: {
           recordings:
             camera._count
               .recordings,
           snapshots:
             camera._count
               .snapshots,
           events:
             camera._count.events,
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
     message:
       `${camera.name} deleted successfully.`,
   });
 } catch (error) {
   console.error(
     "DELETE camera error:",
     error
   );
   return NextResponse.json(
     {
       message:
         "Unable to delete camera.",
     },
     {
       status: 500,
     }
   );
 }
}
