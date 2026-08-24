import {
 Grid2X2,
 List,
 Settings2,
} from "lucide-react";
import CameraCard from "./CameraCard";
export type DashboardCamera = {
 id: number;
 name: string;
 location: string;
 status: "online" | "offline";
 host?: string | null;
 streamPath?: string | null;
 streamUrl?: string;
};
type LiveCamerasProps = {
 cameras: DashboardCamera[];
};
export default function LiveCameras({
 cameras,
}: LiveCamerasProps) {
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
<button
           type="button"
           className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
>
<Grid2X2 size={16} />
           Grid
</button>
<button
           type="button"
           className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
>
<List size={16} />
           List
</button>
<button
           type="button"
           className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
>
<Settings2 size={16} />
           Customize
</button>
</div>
</div>
     {cameras.length === 0 ? (
<div className="flex min-h-56 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50">
<p className="text-sm text-slate-500">
           No cameras registered.
</p>
</div>
     ) : (
<div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
         {cameras.map((camera) => (
<CameraCard
             key={camera.id}
             id={camera.id}
             name={camera.name}
             location={camera.location}
             status={camera.status}
             streamUrl={camera.streamUrl}
           />
         ))}
</div>
     )}
</section>
 );
}