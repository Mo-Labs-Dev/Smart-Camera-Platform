"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
 Bell,
 Camera,
 Folder,
 LayoutDashboard,
 Map,
 Monitor,
 Server,
 Settings,
 ShieldCheck,
 Users,
} from "lucide-react";
const navigation = [
 {
   name: "Dashboard",
   icon: LayoutDashboard,
   href: "/",
 },
 {
   name: "Cameras",
   icon: Monitor,
   href: "/cameras",
 },
 {
   name: "Events",
   icon: Bell,
   href: "/events",
 },
 {
   name: "Recordings",
   icon: Folder,
   href: "/recordings",
 },
 {
   name: "Snapshots",
   icon: Camera,
   href: "/snapshots",
 },
 {
   name: "Map",
   icon: Map,
   href: "/map",
 },
];
const administration = [
 {
   name: "Users",
   icon: Users,
   href: "/users",
 },
 {
   name: "System",
   icon: Server,
   href: "/system",
 },
 {
   name: "Settings",
   icon: Settings,
   href: "/settings",
 },
];
export default function Sidebar() {
 const pathname = usePathname();
 function isActive(href: string) {
   if (href === "/") {
     return pathname === "/";
   }
   return pathname.startsWith(href);
 }
 return (
<aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-slate-200 bg-white">
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
         {navigation.map((item) => {
           const Icon = item.icon;
           const active = isActive(item.href);
           return (
<Link
               key={item.name}
               href={item.href}
               className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                 active
                   ? "bg-blue-50 text-blue-600"
                   : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
               }`}
>
<Icon size={19} />
               {item.name}
</Link>
           );
         })}
</div>
<div className="my-5 border-t border-slate-200" />
<div className="space-y-1">
         {administration.map((item) => {
           const Icon = item.icon;
           const active = isActive(item.href);
           return (
<Link
               key={item.name}
               href={item.href}
               className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                 active
                   ? "bg-blue-50 text-blue-600"
                   : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
               }`}
>
<Icon size={19} />
               {item.name}
</Link>
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