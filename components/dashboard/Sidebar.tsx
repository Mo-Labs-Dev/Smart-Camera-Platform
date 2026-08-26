"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
 Camera,
 LayoutDashboard,
 Map,
 Settings,
 Image as ImageIcon,
 Video,
 CalendarDays,
 MonitorCog,
 Users,
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
 const pathname = usePathname();
 return (
<aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-800 bg-slate-950 text-white shadow-xl">
     {/* Brand */}
<div className="flex h-20 items-center border-b border-slate-700/70 px-5">
<div className="flex items-center gap-3">
<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
<Camera size={21} />
</div>
<div>
<p className="text-sm font-semibold tracking-tight text-white">
             Lab Camera
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
         {navigation.map((item) => {
           const Icon = item.icon;
           const active =
             item.href === "/"
               ? pathname === "/"
               : pathname === item.href ||
                 pathname.startsWith(
                   `${item.href}/`
                 );
           return (
<Link
               key={item.name}
               href={item.href}
               className={`group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all ${
                 active
                   ? "bg-blue-600 text-white shadow-lg shadow-blue-600/15"
                   : "text-slate-400 hover:bg-slate-980 hover:text-white"
               }`}
>
<Icon
                 size={19}
                 strokeWidth={1.8}
                 className={
                   active
                     ? "text-white"
                     : "text-slate-500 transition group-hover:text-slate-200"
                 }
               />
<span>{item.name}</span>
               {active && (
<span className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />
               )}
</Link>
           );
         })}
</div>
</nav>
     {/* Footer */}
<div className="border-t border-slate-800 p-4">
<div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
<div className="flex items-center gap-2">
<span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
<p className="text-xs font-medium text-slate-200">
             Platform Online
</p>
</div>
<p className="mt-1 text-[11px] text-slate-500">
           Camera services active
</p>
</div>
</div>
</aside>
 );
}