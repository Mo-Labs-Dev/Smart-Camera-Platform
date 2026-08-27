import EventsClient from "@/components/events/EventsClient";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
export default async function EventsPage() {
 const events = await prisma.event.findMany({
   include: {
     camera: true,
   },
   orderBy: {
     createdAt: "desc",
   },
   take: 300,
 });
 const cameras = await prisma.camera.findMany({
   orderBy: {
     name: "asc",
   },
 });
 const serializedEvents = events.map((event) => ({
   id: event.id,
   type: event.type,
   message: event.message,
   createdAt: event.createdAt.toISOString(),
   camera: event.camera
     ? {
         id: event.camera.id,
         name: event.camera.name,
         location: event.camera.location,
       }
     : null,
 }));
 const serializedCameras = cameras.map((camera) => ({
   id: camera.id,
   name: camera.name,
 }));
 return (
<main className="min-h-screen bg-slate-50">
<div className="px-6 py-6 lg:px-8 lg:py-8">
<div className="mb-5">
<h1 className="text-2xl font-bold tracking-tight text-slate-900">
           Events
</h1>
<p className="mt-1 text-sm text-slate-500">
           Camera activity and system event history
</p>
</div>
<EventsClient
         events={serializedEvents}
         cameras={serializedCameras}
       />
</div>
</main>
 );
}