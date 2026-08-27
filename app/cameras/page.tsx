import CamerasClient from "@/components/camera/CamerasClient";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
export default async function CamerasPage() {
 const cameras = await prisma.camera.findMany({
   orderBy: {
     id: "asc",
   },
 });
 const hlsBaseUrl =
   process.env.NEXT_PUBLIC_MEDIAMTX_HLS_BASE_URL ??
   "http://localhost:8888";
 const serializedCameras = cameras.map((camera) => ({
   id: camera.id,
   name: camera.name,
   location: camera.location,
   host: camera.host,
   streamPath: camera.streamPath,
   streamUrl: camera.streamPath
     ? `${hlsBaseUrl}/${camera.streamPath}/index.m3u8`
     : null,
 }));
 return (
<main className="min-h-screen bg-slate-50">
<div className="px-6 py-6 lg:px-8 lg:py-8">
<div className="mb-5">
<h1 className="text-2xl font-bold tracking-tight text-slate-900">
           Cameras
</h1>
<p className="mt-1 text-sm text-slate-500">
           CCTV monitoring and camera management
</p>
</div>
<CamerasClient cameras={serializedCameras} />
</div>
</main>
 );
}