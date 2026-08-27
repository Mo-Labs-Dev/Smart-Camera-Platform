import {
 NextResponse,
} from "next/server";
import {
 prisma,
} from "@/lib/prisma";
export const dynamic =
 "force-dynamic";
export async function GET() {
 try {
   const events =
     await prisma.event.findMany(
       {
         include: {
           camera: true,
         },
         orderBy: {
           createdAt:
             "desc",
         },
         take: 300,
       }
     );
   const serializedEvents =
     events.map(
       (event) => ({
         id:
event.id,
         type:
           event.type,
         message:
           event.message,
         createdAt:
           event.createdAt.toISOString(),
         camera:
           event.camera
             ? {
                 id:
event.camera.id,
                 name:
                   event.camera.name,
                 location:
                   event.camera
                     .location,
               }
             : null,
       })
     );
   return NextResponse.json(
     serializedEvents
   );
 } catch (error) {
   console.error(
     "Events API error:",
     error
   );
   return NextResponse.json(
     {
       message:
         "Failed to load events",
     },
     {
       status: 500,
     }
   );
 }
}