import {
 LayoutDashboard,
 Monitor,
 Bell,
 Folder,
 Camera,
 Map,
 Users,
 Settings,
 Server,
 ShieldCheck,
} from "lucide-react";
const navigation = [
 { name: "Dashboard", icon: LayoutDashboard },
 { name: "Cameras", icon: Monitor },
 { name: "Events", icon: Bell },
 { name: "Recordings", icon: Folder },
 { name: "Snapshots", icon: Camera },
 { name: "Map", icon: Map },
];
const administration = [
 { name: "Users", icon: Users },
 { name: "System", icon: Server },
 { name: "Settings", icon: Settings },
];
export default function Sidebar() {
 return (
<aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r border-slate-200 bg-white">
<div className="flex h-24 items-center gap-3 px-6">
<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
<ShieldCheck size={25} />
</div>
<div>
<h1 className="font-bold leading-tight text-slate-900">
           Lab Camera
</h1>
<p className="font-bold leading-tight text-slate-900">
           Platform
</p>
</div>
</div>
<nav className="flex-1 px-4">
<div className="space-y-1">
         {navigation.map((item, index) => {
           const Icon = item.icon;
           return (
<button
               key={item.name}
               className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                 index === 0
                   ? "bg-blue-50 text-blue-600"
                   : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
               }`}
>
<Icon size={19} />
               {item.name}
</button>
           );
         })}
</div>
<div className="my-5 border-t border-slate-200" />
<div className="space-y-1">
         {administration.map((item) => {
           const Icon = item.icon;
           return (
<button
               key={item.name}
               className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
>
<Icon size={19} />
               {item.name}
</button>
           );
         })}
</div>
</nav>
<div className="p-4 text-xs text-slate-400">
<p>Lab Camera Platform</p>
<p className="mt-1">v0.1.0</p>
</div>
</aside>
 );
}