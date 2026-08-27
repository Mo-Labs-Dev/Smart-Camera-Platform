"use client";
import Link from "next/link";
import {
 usePathname,
} from "next/navigation";
import {
 CalendarDays,
 Camera,
 Image as ImageIcon,
 LayoutDashboard,
 Map,
 MonitorCog,
 Settings,
 Users,
 Video,
} from "lucide-react";
const navigation = [
 {
   name: "Dashboard",
   href: "/",
   icon: LayoutDashboard,
 },
 {
   name: "Cameras",
   href: "/cameras",
   icon: Camera,
 },
 {
   name: "Events",
   href: "/events",
   icon: CalendarDays,
 },
 {
   name: "Recordings",
   href: "/recordings",
   icon: Video,
 },
 {
   name: "Snapshots",
   href: "/snapshots",
   icon: ImageIcon,
 },
 {
   name: "Map",
   href: "/map",
   icon: Map,
 },
 {
   name: "Users",
   href: "/users",
   icon: Users,
 },
 {
   name: "System",
   href: "/system",
   icon: MonitorCog,
 },
 {
   name: "Settings",
   href: "/settings",
   icon: Settings,
 },
];
export default function Sidebar() {
 const pathname =
   usePathname();
 return (
<aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/10 bg-slate-900 text-white shadow-lg">
     {/* Brand */}
<div className="flex h-20 items-center border-b border-white/10 px-5">
<div className="flex items-center gap-3">
<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-950/20">
<Camera
             size={21}
           />
</div>
<div>
<p className="text-sm font-semibold tracking-tight text-white">
             Smart Camera
</p>
<p className="text-xs text-slate-400">
             Platform
</p>
</div>
</div>
</div>
     {/* Navigation */}
<nav className="flex-1 overflow-y-auto px-3 py-5">
<div className="space-y-1.5">
         {navigation.map(
           (item) => {
             const Icon =
               item.icon;
             const active =
               item.href === "/"
                 ? pathname ===
                   "/"
                 : pathname ===
                     item.href ||
                   pathname.startsWith(
                     `${item.href}/`
                   );
             return (
<Link
                 key={
                   item.name
                 }
                 href={
                   item.href
                 }
                 className={`group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all ${
                   active
                     ? "bg-blue-600 text-white shadow-md shadow-blue-950/20"
                     : "text-slate-300 hover:bg-slate-800 hover:text-white"
                 }`}
>
<Icon
                   size={
                     19
                   }
                   strokeWidth={
                     1.8
                   }
                   className={
                     active
                       ? "text-white"
                       : "text-slate-400 transition group-hover:text-white"
                   }
                 />
<span>
                   {
                     item.name
                   }
</span>
                 {active && (
<span className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />
                 )}
</Link>
             );
           }
         )}
</div>
</nav>
     {/* Footer */}
<div className="border-t border-white/10 p-4">
<div className="rounded-xl border border-white/10 bg-slate-800/70 p-3">
<div className="flex items-center gap-2">
<span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_7px_rgba(52,211,153,0.65)]" />
<p className="text-xs font-medium text-slate-100">
             Platform Online
</p>
</div>
<p className="mt-1 text-[11px] text-slate-400">
           Camera services active
</p>
</div>
</div>
</aside>
 );
}