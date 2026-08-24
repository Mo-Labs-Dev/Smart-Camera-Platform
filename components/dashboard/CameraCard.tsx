import {
 Camera,
 Maximize2,
 MoreVertical,
 Play,
 Settings,
 VideoOff,
} from "lucide-react";
type CameraCardProps = {
 name: string;
 location: string;
 status?: "online" | "offline";
};
export default function CameraCard({
 name,
 location,
 status = "offline",
}: CameraCardProps) {
 const isOnline = status === "online";
 return (
<div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
<div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
<div>
<h3 className="font-semibold text-slate-900">{name}</h3>
<p className="text-sm text-slate-500">{location}</p>
</div>
<div className="flex items-center gap-3">
<div className="flex items-center gap-2">
<span
             className={`h-2 w-2 rounded-full ${
               isOnline ? "bg-emerald-500" : "bg-red-500"
             }`}
           />
<span className="text-xs text-slate-500">
             {isOnline ? "Online" : "Offline"}
</span>
</div>
<button className="text-slate-400 hover:text-slate-700">
<MoreVertical size={18} />
</button>
</div>
</div>
<div className="flex aspect-video items-center justify-center bg-slate-50">
<div className="text-center">
<VideoOff
           size={40}
           strokeWidth={1.5}
           className="mx-auto text-slate-400"
         />
<p className="mt-3 font-medium text-slate-700">
           No stream
</p>
<p className="mt-1 text-sm text-slate-500">
           Camera is offline or unreachable
</p>
</div>
</div>
<div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
<div className="flex items-center gap-2">
<button className="rounded-lg p-2 text-slate-600 hover:bg-slate-100">
<Play size={18} />
</button>
<button className="rounded-lg p-2 text-slate-600 hover:bg-slate-100">
<Camera size={18} />
</button>
</div>
<div className="flex items-center gap-2">
<button className="rounded-lg p-2 text-slate-600 hover:bg-slate-100">
<Maximize2 size={18} />
</button>
<button className="rounded-lg p-2 text-slate-600 hover:bg-slate-100">
<Settings size={18} />
</button>
</div>
</div>
</div>
 );
}