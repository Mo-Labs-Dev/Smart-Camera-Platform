"use client";
import {
 Camera,
 Check,
 Clock3,
 Database,
 Loader2,
 MonitorCog,
 RotateCcw,
 Save,
 Settings2,
 ShieldCheck,
 Video,
} from "lucide-react";
import {
 useEffect,
 useState,
} from "react";
type Settings = {
 platformName: string;
 patrolIntervalSec: number;
 cameraStatusRefreshSec: number;
 systemRefreshSec: number;
 recordingRetentionDays: number;
 snapshotRetentionDays: number;
 defaultStreamQuality: string;
 autoRecord: boolean;
};
const DEFAULT_SETTINGS: Settings = {
 platformName:
   "Smart Camera Platform",
 patrolIntervalSec: 10,
 cameraStatusRefreshSec: 10,
 systemRefreshSec: 5,
 recordingRetentionDays: 30,
 snapshotRetentionDays: 30,
 defaultStreamQuality: "main",
 autoRecord: false,
};
function NumberField({
 label,
 description,
 value,
 min,
 max,
 suffix,
 onChange,
}: {
 label: string;
 description: string;
 value: number;
 min: number;
 max: number;
 suffix: string;
 onChange: (value: number) => void;
}) {
 return (
<div>
<label className="text-sm font-semibold text-slate-800">
       {label}
</label>
<p className="mt-1 text-xs text-slate-500">
       {description}
</p>
<div className="relative mt-3">
<input
         type="number"
         min={min}
         max={max}
         value={value}
         onChange={(event) => {
           const nextValue =
             Number(
               event.target.value
             );
           onChange(nextValue);
         }}
         className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-20 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
       />
<span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
         {suffix}
</span>
</div>
</div>
 );
}
export default function SettingsClient() {
 const [settings, setSettings] =
   useState<Settings>(
     DEFAULT_SETTINGS
   );
 const [original, setOriginal] =
   useState<Settings>(
     DEFAULT_SETTINGS
   );
 const [loading, setLoading] =
   useState(true);
 const [saving, setSaving] =
   useState(false);
 const [message, setMessage] =
   useState<string | null>(null);
 const [error, setError] =
   useState<string | null>(null);
 const changed =
   JSON.stringify(settings) !==
   JSON.stringify(original);
 useEffect(() => {
   let cancelled = false;
   async function loadSettings() {
     try {
       const response =
         await fetch(
           "/api/settings",
           {
             cache: "no-store",
           }
         );
       const contentType =
         response.headers.get(
           "content-type"
         );
       if (
         !contentType?.includes(
           "application/json"
         )
       ) {
         throw new Error(
           "Settings API returned an invalid response."
         );
       }
       const data =
         await response.json();
       if (!response.ok || !data.ok) {
         throw new Error(
           data.message ??
             "Unable to load settings."
         );
       }
       if (!cancelled) {
         const loaded: Settings = {
           platformName:
             data.settings
               .platformName,
           patrolIntervalSec:
             data.settings
               .patrolIntervalSec,
           cameraStatusRefreshSec:
             data.settings
               .cameraStatusRefreshSec,
           systemRefreshSec:
             data.settings
               .systemRefreshSec,
           recordingRetentionDays:
             data.settings
               .recordingRetentionDays,
           snapshotRetentionDays:
             data.settings
               .snapshotRetentionDays,
           defaultStreamQuality:
             data.settings
               .defaultStreamQuality,
           autoRecord:
             data.settings
               .autoRecord,
         };
         setSettings(loaded);
         setOriginal(loaded);
       }
     } catch (error) {
       console.error(
         "Unable to load settings:",
         error
       );
       if (!cancelled) {
         setError(
           error instanceof Error
             ? error.message
             : "Unable to load settings."
         );
       }
     } finally {
       if (!cancelled) {
         setLoading(false);
       }
     }
   }
   void loadSettings();
   return () => {
     cancelled = true;
   };
 }, []);
 async function saveSettings() {
   setSaving(true);
   setError(null);
   setMessage(null);
   try {
     const response =
       await fetch(
         "/api/settings",
         {
           method: "PUT",
           headers: {
             "Content-Type":
               "application/json",
           },
           body: JSON.stringify(
             settings
           ),
         }
       );
     const contentType =
       response.headers.get(
         "content-type"
       );
     if (
       !contentType?.includes(
         "application/json"
       )
     ) {
       throw new Error(
         "Settings API returned an invalid response."
       );
     }
     const data =
       await response.json();
     if (!response.ok || !data.ok) {
       throw new Error(
         data.message ??
           "Unable to save settings."
       );
     }
     const saved: Settings = {
       platformName:
         data.settings.platformName,
       patrolIntervalSec:
         data.settings
           .patrolIntervalSec,
       cameraStatusRefreshSec:
         data.settings
           .cameraStatusRefreshSec,
       systemRefreshSec:
         data.settings
           .systemRefreshSec,
       recordingRetentionDays:
         data.settings
           .recordingRetentionDays,
       snapshotRetentionDays:
         data.settings
           .snapshotRetentionDays,
       defaultStreamQuality:
         data.settings
           .defaultStreamQuality,
       autoRecord:
         data.settings.autoRecord,
     };
     setSettings(saved);
     setOriginal(saved);
     setMessage(
       "Settings saved successfully."
     );
     window.setTimeout(() => {
       setMessage(null);
     }, 3000);
   } catch (error) {
     console.error(
       "Unable to save settings:",
       error
     );
     setError(
       error instanceof Error
         ? error.message
         : "Unable to save settings."
     );
   } finally {
     setSaving(false);
   }
 }
 function resetChanges() {
   setSettings(original);
   setMessage(null);
   setError(null);
 }
 if (loading) {
   return (
<div className="flex min-h-[65vh] items-center justify-center">
<div className="text-center">
<Loader2
           size={28}
           className="mx-auto animate-spin text-blue-600"
         />
<p className="mt-3 text-sm text-slate-500">
           Loading settings...
</p>
</div>
</div>
   );
 }
 return (
<>
     {/* HEADER */}
<div className="flex flex-col gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
<div>
<div className="flex items-center gap-2">
<Settings2
             size={22}
             className="text-blue-600"
           />
<h1 className="text-2xl font-bold tracking-tight text-slate-900">
             Settings
</h1>
</div>
<p className="mt-2 text-sm text-slate-500">
           Configure platform,
           monitoring and storage
           preferences.
</p>
</div>
<div className="flex items-center gap-2">
<button
           type="button"
           disabled={!changed || saving}
           onClick={resetChanges}
           className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
>
<RotateCcw size={15} />
           Reset
</button>
<button
           type="button"
           disabled={!changed || saving}
           onClick={() =>
             void saveSettings()
           }
           className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
>
           {saving ? (
<Loader2
               size={15}
               className="animate-spin"
             />
           ) : (
<Save size={15} />
           )}
           {saving
             ? "Saving..."
             : "Save Changes"}
</button>
</div>
</div>
     {message && (
<div className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
<Check size={16} />
         {message}
</div>
     )}
     {error && (
<div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
         {error}
</div>
     )}
     {/* PLATFORM */}
<section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
<div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
<MonitorCog size={19} />
</div>
<div>
<h2 className="text-sm font-semibold text-slate-900">
             Platform
</h2>
<p className="mt-0.5 text-xs text-slate-500">
             General platform
             configuration
</p>
</div>
</div>
<div className="p-6">
<label className="text-sm font-semibold text-slate-800">
           Platform Name
</label>
<p className="mt-1 text-xs text-slate-500">
           Display name for this VMS
           installation.
</p>
<input
           type="text"
           value={settings.platformName}
           onChange={(event) =>
             setSettings(
               (current) => ({
                 ...current,
                 platformName:
                   event.target.value,
               })
             )
           }
           className="mt-3 w-full max-w-xl rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
         />
</div>
</section>
     {/* MONITORING */}
<section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
<div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
<Clock3 size={19} />
</div>
<div>
<h2 className="text-sm font-semibold text-slate-900">
             Monitoring
</h2>
<p className="mt-0.5 text-xs text-slate-500">
             Live monitoring refresh
             intervals
</p>
</div>
</div>
<div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-3">
<NumberField
           label="Patrol Interval"
           description="Time before patrol mode switches cameras."
           value={
             settings.patrolIntervalSec
           }
           min={3}
           max={300}
           suffix="seconds"
           onChange={(value) =>
             setSettings(
               (current) => ({
                 ...current,
                 patrolIntervalSec:
                   value,
               })
             )
           }
         />
<NumberField
           label="Camera Health Refresh"
           description="Frequency of camera connectivity checks."
           value={
             settings.cameraStatusRefreshSec
           }
           min={3}
           max={300}
           suffix="seconds"
           onChange={(value) =>
             setSettings(
               (current) => ({
                 ...current,
                 cameraStatusRefreshSec:
                   value,
               })
             )
           }
         />
<NumberField
           label="System Refresh"
           description="Frequency of live system health updates."
           value={
             settings.systemRefreshSec
           }
           min={3}
           max={300}
           suffix="seconds"
           onChange={(value) =>
             setSettings(
               (current) => ({
                 ...current,
                 systemRefreshSec:
                   value,
               })
             )
           }
         />
</div>
</section>
     {/* VIDEO */}
<section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
<div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
<Video size={19} />
</div>
<div>
<h2 className="text-sm font-semibold text-slate-900">
             Video
</h2>
<p className="mt-0.5 text-xs text-slate-500">
             Streaming and recording
             preferences
</p>
</div>
</div>
<div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-2">
<div>
<label className="text-sm font-semibold text-slate-800">
             Default Stream Quality
</label>
<p className="mt-1 text-xs text-slate-500">
             Preferred stream for live
             camera viewing.
</p>
<select
             value={
               settings.defaultStreamQuality
             }
             onChange={(event) =>
               setSettings(
                 (current) => ({
                   ...current,
                   defaultStreamQuality:
                     event.target.value,
                 })
               )
             }
             className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
>
<option value="main">
               Main Stream — High
               Quality
</option>
<option value="sub">
               Sub Stream — Lower
               Bandwidth
</option>
</select>
</div>
<div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
<div className="pr-6">
<p className="text-sm font-semibold text-slate-800">
               Automatic Recording
</p>
<p className="mt-1 text-xs leading-5 text-slate-500">
               Platform preference for
               automatically recording
               cameras.
</p>
</div>
<button
             type="button"
             role="switch"
             aria-checked={
               settings.autoRecord
             }
             onClick={() =>
               setSettings(
                 (current) => ({
                   ...current,
                   autoRecord:
                     !current.autoRecord,
                 })
               )
             }
             className={`relative h-6 w-11 shrink-0 rounded-full transition ${
               settings.autoRecord
                 ? "bg-blue-600"
                 : "bg-slate-300"
             }`}
>
<span
               className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
                 settings.autoRecord
                   ? "left-6"
                   : "left-1"
               }`}
             />
</button>
</div>
</div>
</section>
     {/* STORAGE */}
<section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
<div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
<Database size={19} />
</div>
<div>
<h2 className="text-sm font-semibold text-slate-900">
             Retention
</h2>
<p className="mt-0.5 text-xs text-slate-500">
             Recording and snapshot
             retention preferences
</p>
</div>
</div>
<div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-2">
<NumberField
           label="Recording Retention"
           description="Number of days recordings should be retained."
           value={
             settings.recordingRetentionDays
           }
           min={1}
           max={3650}
           suffix="days"
           onChange={(value) =>
             setSettings(
               (current) => ({
                 ...current,
                 recordingRetentionDays:
                   value,
               })
             )
           }
         />
<NumberField
           label="Snapshot Retention"
           description="Number of days snapshots should be retained."
           value={
             settings.snapshotRetentionDays
           }
           min={1}
           max={3650}
           suffix="days"
           onChange={(value) =>
             setSettings(
               (current) => ({
                 ...current,
                 snapshotRetentionDays:
                   value,
               })
             )
           }
         />
</div>
</section>
     {/* INFORMATION */}
<section className="mt-6 rounded-2xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm">
<div className="flex items-start gap-4">
<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
<ShieldCheck size={19} />
</div>
<div>
<h2 className="text-sm font-semibold">
             Configuration stored in
             PostgreSQL
</h2>
<p className="mt-1 max-w-3xl text-xs leading-5 text-slate-400">
             These settings persist
             across application restarts.
             The current version stores
             platform preferences here;
             we can connect each setting
             to its runtime subsystem as
             the platform grows.
</p>
</div>
</div>
</section>
</>
 );
}