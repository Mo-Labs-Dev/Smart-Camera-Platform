import {
 Grid2X2,
 List,
 Settings2,
} from "lucide-react";
import CameraCard from "./CameraCard";
const cameras = [
 {
   name: "Camera 1",
   location: "Lab Area A",
   status: "offline" as const,
 },
 {
   name: "Camera 2",
   location: "Lab Area B",
   status: "offline" as const,
 },
 {
   name: "Camera 3",
   location: "Lab Area C",
   status: "offline" as const,
 },
 {
   name: "Camera 4",
   location: "Lab Area D",
   status: "offline" as const,
 },
];
export default function LiveCameras() {
 return (
<section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
<div className="mb-4 flex items-center justify-between">
<div>
<h2 className="text-lg font-bold text-slate-900">
           Live Cameras
</h2>
<p className="mt-1 text-sm text-slate-500">
           Monitor all registered camera feeds
</p>
</div>
<div className="flex items-center gap-2">
<button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white">
<Grid2X2 size={16} />
           Grid
</button>
<button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
<List size={16} />
           List
</button>
<button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
<Settings2 size={16} />
           Customize
</button>
</div>
</div>
<div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
       {cameras.map((camera) => (
<CameraCard
           key={camera.name}
           name={camera.name}
           location={camera.location}
           status={camera.status}
         />
       ))}
</div>
</section>
 );
}