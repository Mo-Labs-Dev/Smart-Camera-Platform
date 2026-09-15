import InteractiveFloorMap from "@/components/map/InteractiveFloorMap";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
export default async function MapPage() {
 const cameras =
   await prisma.camera.findMany({
     select: {
       id: true,
       name: true,
       location: true,
       host: true,
       streamPath: true,
       mapX: true,
       mapY: true,
     },
     orderBy: {
       id: "asc",
     },
   });
 return (
<main className="min-h-screen bg-slate-50">
<InteractiveFloorMap
       cameras={cameras.map(
         (camera) => ({
           id: camera.id,
           name: camera.name,
           location:
             camera.location ??
             "Unassigned",
           host: camera.host,
           streamPath:
             camera.streamPath,
           mapX: camera.mapX,
           mapY: camera.mapY,
         })
       )}
     />
</main>
 );
}