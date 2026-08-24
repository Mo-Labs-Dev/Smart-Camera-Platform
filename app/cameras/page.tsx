import { prisma } from "@/lib/prisma";
import CamerasClient from "@/components/camera/CamerasClient";
export const dynamic = "force-dynamic";
export default async function CamerasPage() {
 const cameras = await prisma.camera.findMany({
   orderBy: {
     id: "asc",
   },
 });
 const serializedCameras = cameras.map((camera) => ({
   id: camera.id,
   name: camera.name,
   location: camera.location,
   host: camera.host,
   streamPath: camera.streamPath,
 }));
 return (
<main className="min-h-screen bg-slate-50">
<div className="px-6 py-6">
<div className="mb-5">
<h1 className="text-2xl font-bold tracking-tight text-slate-900">
           Cameras
</h1>
<p className="mt-1 text-sm text-slate-500">
           Manage registered lab cameras
</p>
</div>
<CamerasClient cameras={serializedCameras} />
</div>
</main>
 );
}