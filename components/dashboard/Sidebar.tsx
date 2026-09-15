"use client";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
 CalendarDays,
 Camera,
 Image as ImageIcon,
 LayoutDashboard,
 LogOut,
 Map,
 MonitorCog,
 Settings,
 ShieldCheck,
 Users,
 Video,
} from "lucide-react";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";
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
function getInitials(name?: string | null) {
 if (!name) {
   return "U";
 }
 const parts = name
   .trim()
   .split(/\s+/)
   .filter(Boolean);
 if (parts.length === 0) {
   return "U";
 }
 if (parts.length === 1) {
   return parts[0]
     .slice(0, 2)
     .toUpperCase();
 }
 return (
   parts[0][0] +
   parts[parts.length - 1][0]
 ).toUpperCase();
}
export default function Sidebar() {
 const pathname = usePathname();
 const {
   data: session,
   status,
 } = useSession();
 const { settings } =
   usePlatformSettings();
 const platformName =
   settings.platformName?.trim() ||
   "Smart Camera Platform";
 const userName =
   session?.user?.name ||
   "Platform User";
 const userEmail =
   session?.user?.email || "";
 const userRole =
   session?.user?.role ||
   "VIEWER";
 async function handleSignOut() {
   await signOut({
     redirectTo: "/login",
   });
 }
 return (
<aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/10 bg-slate-900 text-white shadow-lg">
     {/* Brand */}
<div className="flex h-20 items-center border-b border-white/10 px-5">
<div className="flex min-w-0 items-center gap-3">
<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-950/20">
<Camera size={21} />
</div>
<div className="min-w-0">
<p
             className="truncate text-sm font-semibold tracking-tight text-white"
             title={platformName}
>
             {platformName}
</p>
<p className="text-xs text-slate-400">
             CCTV / VMS
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
               : pathname ===
                   item.href ||
                 pathname.startsWith(
                   `${item.href}/`
                 );
           return (
<Link
               key={item.name}
               href={item.href}
               className={`group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all ${
                 active
                   ? "bg-blue-600 text-white shadow-md shadow-blue-950/20"
                   : "text-slate-300 hover:bg-slate-800 hover:text-white"
               }`}
>
<Icon
                 size={19}
                 strokeWidth={1.8}
                 className={
                   active
                     ? "text-white"
                     : "text-slate-400 transition group-hover:text-white"
                 }
               />
<span>
                 {item.name}
</span>
               {active && (
<span className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />
               )}
</Link>
           );
         })}
</div>
</nav>
     {/* User */}
<div className="border-t border-white/10 p-4">
<div className="rounded-xl border border-white/10 bg-slate-800/70 p-3">
         {status ===
         "loading" ? (
<div className="animate-pulse">
<div className="h-10 rounded-lg bg-slate-700" />
</div>
         ) : (
<>
<div className="flex items-center gap-3">
<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xs font-bold text-white">
                 {getInitials(
                   userName
                 )}
</div>
<div className="min-w-0 flex-1">
<p
                   className="truncate text-sm font-medium text-white"
                   title={userName}
>
                   {userName}
</p>
                 {userEmail && (
<p
                     className="truncate text-[11px] text-slate-400"
                     title={
                       userEmail
                     }
>
                     {userEmail}
</p>
                 )}
</div>
</div>
<div className="mt-3 flex items-center justify-between gap-2">
<div className="inline-flex items-center gap-1.5 rounded-lg border border-blue-400/20 bg-blue-500/10 px-2 py-1 text-[10px] font-semibold tracking-wide text-blue-300">
<ShieldCheck
                   size={12}
                 />
                 {userRole}
</div>
<div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
<span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                 Online
</div>
</div>
<button
               type="button"
               onClick={
                 handleSignOut
               }
               className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-red-400/20 hover:bg-red-500/10 hover:text-red-300"
>
<LogOut
                 size={15}
               />
               Sign Out
</button>
</>
         )}
</div>
</div>
</aside>
 );
}