import DashboardClient from "@/components/dashboard/DashboardClient";
import Sidebar from "@/components/dashboard/Sidebar";
import { prisma } from "@/lib/prisma";
export const dynamic =
 "force-dynamic";
export default async function Home() {
 const now = new Date();
 const last24Hours = new Date(
   now.getTime() -
     24 * 60 * 60 * 1000
 );
 const [
   cameras,
   events24h,
   totalRecordings,
   totalSnapshots,
   recentEvents,
 ] = await Promise.all([
   prisma.camera.findMany({
     orderBy: {
       id: "asc",
     },
   }),
   prisma.event.count({
     where: {
       createdAt: {
         gte: last24Hours,
       },
     },
   }),
   prisma.recording.count(),
   prisma.snapshot.count(),
   prisma.event.findMany({
     include: {
       camera: true,
     },
     orderBy: {
       createdAt: "desc",
     },
     take: 5,
   }),
 ]);
 return (
<div className="min-h-screen bg-slate-50">
<Sidebar />
<main className="ml-64 min-h-screen p-8">
<DashboardClient
         cameras={cameras.map(
           (camera) => ({
             id: camera.id,
             name: camera.name,
             location:
               camera.location ??
               "Unknown location",
             host: camera.host,
             streamPath:
               camera.streamPath,
           })
         )}
         events24h={events24h}
         totalRecordings={
           totalRecordings
         }
         totalSnapshots={
           totalSnapshots
         }
         recentEvents={recentEvents.map(
           (event) => ({
             id: event.id,
             type: event.type,
             message:
               event.message,
             createdAt:
               event.createdAt.toISOString(),
             cameraName:
               event.camera?.name ??
               null,
           })
         )}
       />
</main>
</div>
 );
}