"use client";
import Link from "next/link";
import {
 signOut,
 useSession,
} from "next-auth/react";
import {
 Bell,
 ChevronDown,
 LogOut,
 Maximize2,
 Minimize2,
 Search,
 Settings,
 User,
} from "lucide-react";
import {
 useEffect,
 useRef,
 useState,
} from "react";
type EventItem = {
 id: number;
 type: string;
 message: string;
 createdAt: string;
 camera?: {
   id: number;
   name: string;
 } | null;
};
function getInitials(
 name?: string | null
) {
 if (!name) return "U";
 const parts = name
   .trim()
   .split(/\s+/)
   .filter(Boolean);
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
function formatEventType(
 type: string
) {
 return type
   .replaceAll("_", " ")
   .replace(/\b\w/g, (letter) =>
     letter.toUpperCase()
   );
}
function formatTime(
 dateValue: string
) {
 const date = new Date(dateValue);
 if (
   Number.isNaN(date.getTime())
 ) {
   return "";
 }
 return date.toLocaleString(
   undefined,
   {
     dateStyle: "short",
     timeStyle: "short",
   }
 );
}
export default function Header() {
 const {
   data: session,
 } = useSession();
 const notificationRef =
   useRef<HTMLDivElement>(null);
 const profileRef =
   useRef<HTMLDivElement>(null);
 const [
   notificationsOpen,
   setNotificationsOpen,
 ] = useState(false);
 const [
   profileOpen,
   setProfileOpen,
 ] = useState(false);
 const [
   fullscreen,
   setFullscreen,
 ] = useState(false);
 const [
   events,
   setEvents,
 ] = useState<EventItem[]>([]);
 const [
   eventsLoading,
   setEventsLoading,
 ] = useState(true);
 const userName =
   session?.user?.name ||
   "VisionCam User";
 const userEmail =
   session?.user?.email || "";
 const userRole =
   session?.user?.role ||
   "VIEWER";
 const isAdmin =
   userRole === "ADMIN";
 /*
  * Load recent events for
  * the notification dropdown.
  */
 useEffect(() => {
   let cancelled = false;
   async function loadEvents() {
     try {
       const response =
         await fetch(
           "/api/events",
           {
             cache: "no-store",
           }
         );
       if (!response.ok) {
         throw new Error(
           `Events API returned ${response.status}`
         );
       }
       const result =
         await response.json();
       const items: EventItem[] =
         Array.isArray(result)
           ? result
           : Array.isArray(
                 result?.events
               )
             ? result.events
             : [];
       if (!cancelled) {
         setEvents(
           items.slice(0, 5)
         );
       }
     } catch (error) {
       console.error(
         "Unable to load notifications:",
         error
       );
       if (!cancelled) {
         setEvents([]);
       }
     } finally {
       if (!cancelled) {
         setEventsLoading(false);
       }
     }
   }
   void loadEvents();
   const interval =
     window.setInterval(
       () => {
         void loadEvents();
       },
       15000
     );
   return () => {
     cancelled = true;
     window.clearInterval(
       interval
     );
   };
 }, []);
 /*
  * Track browser fullscreen.
  */
 useEffect(() => {
   function handleFullscreenChange() {
     setFullscreen(
       Boolean(
         document.fullscreenElement
       )
     );
   }
   document.addEventListener(
     "fullscreenchange",
     handleFullscreenChange
   );
   return () => {
     document.removeEventListener(
       "fullscreenchange",
       handleFullscreenChange
     );
   };
 }, []);
 /*
  * Close dropdowns when
  * clicking outside.
  */
 useEffect(() => {
   function handleOutsideClick(
     event: MouseEvent
   ) {
     const target =
       event.target as Node;
     if (
       notificationRef.current &&
       !notificationRef.current.contains(
         target
       )
     ) {
       setNotificationsOpen(
         false
       );
     }
     if (
       profileRef.current &&
       !profileRef.current.contains(
         target
       )
     ) {
       setProfileOpen(false);
     }
   }
   document.addEventListener(
     "mousedown",
     handleOutsideClick
   );
   return () => {
     document.removeEventListener(
       "mousedown",
       handleOutsideClick
     );
   };
 }, []);
 async function toggleFullscreen() {
   try {
     if (
       !document.fullscreenElement
     ) {
       await document.documentElement.requestFullscreen();
     } else {
       await document.exitFullscreen();
     }
   } catch (error) {
     console.error(
       "Fullscreen failed:",
       error
     );
   }
 }
 async function handleSignOut() {
   await signOut({
     redirectTo: "/login",
   });
 }
 const notificationCount =
   events.length;
 return (
<header className="relative z-30 flex items-center justify-between">
     {/* Page title */}
<div>
<h1 className="text-3xl font-bold text-slate-900">
         Dashboard
</h1>
<p className="mt-1 text-sm text-slate-500">
         Live monitoring overview
</p>
</div>
     {/* Right controls */}
<div className="flex items-center gap-3">
       {/* Search */}
<div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm md:flex">
<Search
           size={18}
           className="text-slate-400"
         />
<input
           type="text"
           placeholder="Search cameras, events..."
           className="w-64 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
         />
</div>
       {/* Notifications */}
<div
         ref={notificationRef}
         className="relative"
>
<button
           type="button"
           title="Notifications"
           onClick={() => {
             setNotificationsOpen(
               (value) => !value
             );
             setProfileOpen(false);
           }}
           className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-blue-600"
>
<Bell size={19} />
           {notificationCount >
             0 && (
<span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
               {notificationCount >
               9
                 ? "9+"
                 : notificationCount}
</span>
           )}
</button>
         {notificationsOpen && (
<div className="absolute right-0 top-12 z-50 w-[360px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
<div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
<div>
<p className="text-sm font-semibold text-slate-900">
                   Notifications
</p>
<p className="mt-0.5 text-[11px] text-slate-500">
                   Recent VisionCam
                   activity
</p>
</div>
               {notificationCount >
                 0 && (
<span className="rounded-full bg-red-50 px-2 py-1 text-[10px] font-semibold text-red-600">
                   {
                     notificationCount
                   }{" "}
                   recent
</span>
               )}
</div>
<div className="max-h-[360px] overflow-y-auto">
               {eventsLoading ? (
<div className="space-y-3 p-4">
                   {[1, 2, 3].map(
                     (item) => (
<div
                         key={item}
                         className="h-16 animate-pulse rounded-xl bg-slate-100"
                       />
                     )
                   )}
</div>
               ) : events.length ===
                 0 ? (
<div className="px-6 py-10 text-center">
<div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-slate-100">
<Bell
                       size={19}
                       className="text-slate-400"
                     />
</div>
<p className="mt-3 text-sm font-medium text-slate-700">
                     No recent events
</p>
<p className="mt-1 text-xs text-slate-400">
                     New camera
                     activity will
                     appear here.
</p>
</div>
               ) : (
                 events.map(
                   (event) => (
<Link
                       key={
event.id
                       }
                       href="/events"
                       onClick={() =>
                         setNotificationsOpen(
                           false
                         )
                       }
                       className="flex gap-3 border-b border-slate-100 px-4 py-3 transition last:border-b-0 hover:bg-slate-50"
>
<div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
<Bell
                           size={16}
                         />
</div>
<div className="min-w-0 flex-1">
<div className="flex items-start justify-between gap-2">
<p className="truncate text-xs font-semibold text-slate-800">
                             {formatEventType(
                               event.type
                             )}
</p>
<span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />
</div>
<p className="mt-1 line-clamp-2 text-[11px] leading-4 text-slate-500">
                           {
                             event.message
                           }
</p>
<div className="mt-1.5 flex items-center justify-between gap-3 text-[10px] text-slate-400">
<span className="truncate">
                             {event
                               .camera
                               ?.name ||
                               "System"}
</span>
<span className="shrink-0">
                             {formatTime(
                               event.createdAt
                             )}
</span>
</div>
</div>
</Link>
                   )
                 )
               )}
</div>
<Link
               href="/events"
               onClick={() =>
                 setNotificationsOpen(
                   false
                 )
               }
               className="block border-t border-slate-100 bg-slate-50 px-4 py-3 text-center text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
>
               View all events
</Link>
</div>
         )}
</div>
       {/* Fullscreen */}
<button
         type="button"
         title={
           fullscreen
             ? "Exit fullscreen"
             : "Enter fullscreen"
         }
         onClick={
           toggleFullscreen
         }
         className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-blue-600"
>
         {fullscreen ? (
<Minimize2
             size={19}
           />
         ) : (
<Maximize2
             size={19}
           />
         )}
</button>
       {/* User profile */}
<div
         ref={profileRef}
         className="relative"
>
<button
           type="button"
           onClick={() => {
             setProfileOpen(
               (value) => !value
             );
             setNotificationsOpen(
               false
             );
           }}
           className="flex items-center gap-3 rounded-xl px-2 py-1.5 text-left transition hover:bg-slate-100"
>
<div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
             {getInitials(
               userName
             )}
</div>
<div className="hidden lg:block">
<p className="max-w-[140px] truncate text-sm font-semibold text-slate-900">
               {userName}
</p>
<p className="text-xs capitalize text-slate-500">
               {userRole.toLowerCase()}
</p>
</div>
<ChevronDown
             size={14}
             className={`hidden text-slate-400 transition-transform lg:block ${
               profileOpen
                 ? "rotate-180"
                 : ""
             }`}
           />
</button>
         {profileOpen && (
<div className="absolute right-0 top-14 z-50 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
<div className="border-b border-slate-100 p-4">
<div className="flex items-center gap-3">
<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                   {getInitials(
                     userName
                   )}
</div>
<div className="min-w-0">
<p className="truncate text-sm font-semibold text-slate-900">
                     {userName}
</p>
<p className="mt-0.5 truncate text-[11px] text-slate-500">
                     {userEmail ||
                       "VisionCam account"}
</p>
</div>
</div>
<div className="mt-3 inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
                 {userRole}
</div>
</div>
<div className="p-2">
<div className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs text-slate-600">
<User
                   size={16}
                 />
                 My Account
</div>
               {isAdmin && (
<Link
                   href="/settings"
                   onClick={() =>
                     setProfileOpen(
                       false
                     )
                   }
                   className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
>
<Settings
                     size={16}
                   />
                   Platform Settings
</Link>
               )}
<button
                 type="button"
                 onClick={
                   handleSignOut
                 }
                 className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs text-red-600 transition hover:bg-red-50"
>
<LogOut
                   size={16}
                 />
                 Sign Out
</button>
</div>
</div>
         )}
</div>
</div>
</header>
 );
}