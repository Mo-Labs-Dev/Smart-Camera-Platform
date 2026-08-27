"use client";

import {
Camera,
Check,
ChevronLeft,
ChevronRight,
Edit3,
Grid2X2,
List,
Maximize2,
Pause,
Play,
Plus,
RotateCcw,
ScanLine,
Trash2,
VideoOff,
X,
} from "lucide-react";

import Hls from "hls.js";

import { useRouter } from "next/navigation";

import {
useEffect,
useMemo,
useRef,
useState,
} from "react";

import CameraCard from "@/components/dashboard/CameraCard";

type CameraItem = {
id: number;
name: string;
location: string | null;
host: string | null;
streamPath: string | null;
streamUrl: string | null;
};

type CameraWithStatus = CameraItem & {
status: "online" | "offline";
};

type CameraStatus = {
id: number;
name: string;
status: "online" | "offline";
};

type Props = {
cameras: CameraItem[];
};

type FormState = {
id?: number;
name: string;
location: string;
host: string;
streamPath: string;
};

type ViewMode =
| "multiview"
| "patrol"
| "manage";

const PATROL_SECONDS = 10;

const emptyForm: FormState = {
name: "",
location: "",
host: "",
streamPath: "",
};

/*
* Lightweight CCTV feed.
*
* Used only for:
* - Multi View
* - Patrol
*
* The full single-camera operator view
* uses CameraCard instead.
*/
function CCTVFeed({
camera,
large = false,
onClick,
}: {
camera: CameraWithStatus;
large?: boolean;
onClick?: () => void;
}) {
const videoRef =
useRef<HTMLVideoElement>(null);

const hlsRef =
useRef<Hls | null>(null);

const [
videoReady,
setVideoReady,
] = useState(false);

const isOnline =
camera.status === "online" &&
Boolean(camera.streamUrl);

useEffect(() => {
const video =
videoRef.current;

if (
!video ||
!camera.streamUrl ||
!isOnline
) {
setVideoReady(false);

return;
}

setVideoReady(false);

video.crossOrigin =
"anonymous";

video.muted =
true;

if (hlsRef.current) {
hlsRef.current.destroy();

hlsRef.current =
null;
}

/*
* Safari / native HLS
*/
if (
video.canPlayType(
"application/vnd.apple.mpegurl"
)
) {
video.src =
camera.streamUrl;

const handleReady =
() => {
setVideoReady(
true
);

video
.play()
.catch(() => {});
};

const handleError =
() => {
setVideoReady(
false
);
};

video.addEventListener(
"loadedmetadata",
handleReady
);

video.addEventListener(
"error",
handleError
);

return () => {
video.removeEventListener(
"loadedmetadata",
handleReady
);

video.removeEventListener(
"error",
handleError
);

video.removeAttribute(
"src"
);

video.load();
};
}

/*
* Chrome / Edge / Firefox
*/
if (Hls.isSupported()) {
const hls =
new Hls({
lowLatencyMode:
true,

liveSyncDurationCount:
3,

liveMaxLatencyDurationCount:
6,

enableWorker:
true,
});

hlsRef.current =
hls;

hls.loadSource(
camera.streamUrl
);

hls.attachMedia(
video
);

hls.on(
Hls.Events.MANIFEST_PARSED,
() => {
setVideoReady(
true
);

video
.play()
.catch(() => {});
}
);

hls.on(
Hls.Events.ERROR,
(_event, data) => {
if (!data.fatal) {
return;
}

if (
data.type ===
Hls.ErrorTypes
.NETWORK_ERROR
) {
hls.startLoad();

return;
}

if (
data.type ===
Hls.ErrorTypes
.MEDIA_ERROR
) {
hls.recoverMediaError();

return;
}

setVideoReady(
false
);
}
);

return () => {
hls.destroy();

if (
hlsRef.current ===
hls
) {
hlsRef.current =
null;
}
};
}

setVideoReady(false);
}, [
camera.streamUrl,
isOnline,
]);

return (
<button
type="button"
onClick={
onClick
}
disabled={
!onClick
}
className="group relative block aspect-video w-full overflow-hidden bg-black text-left disabled:cursor-default"
>
{isOnline ? (
<>
<video
ref={
videoRef
}
crossOrigin="anonymous"
autoPlay
muted
playsInline
controls={
false
}
className="h-full w-full object-cover"
/>

{!videoReady && (
<div className="absolute inset-0 flex items-center justify-center bg-slate-950">
<div className="text-center">
<div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-slate-600 border-t-white" />

<p className="mt-3 text-xs text-slate-400">
Connecting...
</p>
</div>
</div>
)}
</>
) : (
<div className="absolute inset-0 flex items-center justify-center bg-slate-950">
<div className="text-center">
<VideoOff
size={
large
? 42
: 30
}
className="mx-auto text-slate-600"
/>

<p
className={`mt-3 font-semibold text-slate-300 ${
large
? "text-sm"
: "text-xs"
}`}
>
NO SIGNAL
</p>

{large && (
<p className="mt-1 text-xs text-slate-600">
Camera offline or unreachable
</p>
)}
</div>
</div>
)}

{/* Top overlay */}
<div className="absolute inset-x-0 top-0 flex items-start justify-between bg-gradient-to-b from-black/80 to-transparent p-3">
<div className="min-w-0">
<p
className={`truncate font-semibold text-white ${
large
? "text-base"
: "text-xs"
}`}
>
{camera.name}
</p>

<p className="mt-0.5 truncate text-[10px] text-white/60">
{camera.location ??
"Unknown location"}
</p>
</div>

<div
className={`ml-3 flex shrink-0 items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-medium ${
isOnline
? "bg-emerald-500/90 text-white"
: "bg-red-500/90 text-white"
}`}
>
<span className="h-1.5 w-1.5 rounded-full bg-white" />

{isOnline
? "LIVE"
: "OFFLINE"}
</div>
</div>

{/* Camera channel */}
<div className="absolute bottom-3 left-3 rounded bg-black/60 px-2 py-1 font-mono text-[10px] text-white/80 backdrop-blur">
CAM{" "}
{String(
camera.id
).padStart(
2,
"0"
)}
</div>

{/* Click to operator */}
{onClick && (
<div className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-lg bg-black/60 text-white opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
<Maximize2
size={15}
/>
</div>
)}
</button>
);
}

export default function CamerasClient({
cameras,
}: Props) {
const router =
useRouter();

const [
statuses,
setStatuses,
] = useState<
CameraStatus[]
>([]);

const [
viewMode,
setViewMode,
] =
useState<ViewMode>(
"multiview"
);

const [
selectedCameraId,
setSelectedCameraId,
] = useState<
number | null
>(null);

const [
patrolIndex,
setPatrolIndex,
] = useState(0);

const [
patrolPaused,
setPatrolPaused,
] = useState(false);

const [
secondsRemaining,
setSecondsRemaining,
] = useState(
PATROL_SECONDS
);

const [
form,
setForm,
] =
useState<FormState>(
emptyForm
);

const [
open,
setOpen,
] = useState(false);

const [
saving,
setSaving,
] = useState(false);

const [
deletingId,
setDeletingId,
] = useState<
number | null
>(null);

/*
* Camera status polling.
*/
useEffect(() => {
let cancelled = false;

async function loadStatus() {
try {
const response =
await fetch(
"/api/cameras/status",
{
cache:
"no-store",
}
);

if (!response.ok) {
return;
}

const data =
await response.json();

if (
!cancelled &&
Array.isArray(data)
) {
setStatuses(
data as CameraStatus[]
);
}
} catch (error) {
console.error(
"Camera status error:",
error
);
}
}

loadStatus();

const interval =
window.setInterval(
loadStatus,
10000
);

return () => {
cancelled = true;

window.clearInterval(
interval
);
};
}, []);

/*
* Merge database cameras
* with live status.
*/
const camerasWithStatus =
useMemo<
CameraWithStatus[]
>(() => {
return cameras
.map(
(camera) => {
const current =
statuses.find(
(
status
) =>
status.id ===
camera.id
);

return {
...camera,

status:
current?.status ??
("offline" as const),
};
}
)
.sort(
(a, b) =>
a.id - b.id
);
}, [
cameras,
statuses,
]);

const totalCameras =
camerasWithStatus.length;

const onlineCount =
camerasWithStatus.filter(
(camera) =>
camera.status ===
"online"
).length;

const offlineCount =
totalCameras -
onlineCount;

/*
* Current patrol camera.
*/
const patrolCamera =
totalCameras > 0
? camerasWithStatus[
patrolIndex %
totalCameras
]
: null;

/*
* Camera selected from Multi View.
*/
const selectedCamera =
selectedCameraId !==
null
? camerasWithStatus.find(
(camera) =>
camera.id ===
selectedCameraId
) ?? null
: null;

/*
* If selected camera is deleted,
* return to Multi View.
*/
useEffect(() => {
if (
selectedCameraId !==
null &&
!selectedCamera
) {
setSelectedCameraId(
null
);
}
}, [
selectedCameraId,
selectedCamera,
]);

/*
* Keep patrol index valid.
*/
useEffect(() => {
if (
totalCameras === 0
) {
setPatrolIndex(0);

return;
}

setPatrolIndex(
(current) =>
current %
totalCameras
);
}, [
totalCameras,
]);

/*
* Patrol countdown.
*/
useEffect(() => {
if (
viewMode !==
"patrol" ||
patrolPaused ||
totalCameras <= 1
) {
return;
}

const interval =
window.setInterval(
() => {
setSecondsRemaining(
(current) =>
Math.max(
0,
current -
1
)
);
},
1000
);

return () => {
window.clearInterval(
interval
);
};
}, [
viewMode,
patrolPaused,
totalCameras,
]);

/*
* Change camera when countdown
* reaches zero.
*/
useEffect(() => {
if (
viewMode !==
"patrol" ||
patrolPaused ||
totalCameras <= 1 ||
secondsRemaining !==
0
) {
return;
}

setPatrolIndex(
(current) =>
(current +
1) %
totalCameras
);

setSecondsRemaining(
PATROL_SECONDS
);
}, [
secondsRemaining,
viewMode,
patrolPaused,
totalCameras,
]);

function changeView(
mode: ViewMode
) {
setViewMode(mode);

setSelectedCameraId(
null
);

if (
mode === "patrol"
) {
setPatrolPaused(
false
);

setSecondsRemaining(
PATROL_SECONDS
);
}
}

function previousCamera() {
if (
totalCameras === 0
) {
return;
}

setPatrolIndex(
(current) =>
(current -
1 +
totalCameras) %
totalCameras
);

setSecondsRemaining(
PATROL_SECONDS
);
}

function nextCamera() {
if (
totalCameras === 0
) {
return;
}

setPatrolIndex(
(current) =>
(current +
1) %
totalCameras
);

setSecondsRemaining(
PATROL_SECONDS
);
}

function restartPatrol() {
setPatrolIndex(0);

setPatrolPaused(
false
);

setSecondsRemaining(
PATROL_SECONDS
);
}

function selectPatrolCamera(
index: number
) {
setPatrolIndex(
index
);

setSecondsRemaining(
PATROL_SECONDS
);
}

function openCreate() {
setForm(
emptyForm
);

setOpen(true);
}

function openEdit(
camera: CameraItem
) {
setForm({
id:
camera.id,

name:
camera.name,

location:
camera.location ??
"",

host:
camera.host ??
"",

streamPath:
camera.streamPath ??
"",
});

setOpen(true);
}

function closeModal() {
if (saving) {
return;
}

setOpen(false);

setForm(
emptyForm
);
}

async function handleSave() {
const name =
form.name.trim();

if (!name) {
alert(
"Camera name is required."
);

return;
}

setSaving(true);

try {
const isEdit =
typeof form.id ===
"number";

const response =
await fetch(
isEdit
? `/api/cameras/${form.id}`
: "/api/cameras",
{
method:
isEdit
? "PUT"
: "POST",

headers: {
"Content-Type":
"application/json",
},

body:
JSON.stringify(
{
name,

location:
form.location.trim() ||
null,

host:
form.host.trim() ||
null,

streamPath:
form.streamPath.trim() ||
null,
}
),
}
);

const contentType =
response.headers.get(
"content-type"
) ?? "";

if (
!contentType.includes(
"application/json"
)
) {
throw new Error(
`Camera API returned HTTP ${response.status}`
);
}

const result =
await response.json();

if (!response.ok) {
throw new Error(
result.message ??
"Failed to save camera"
);
}

setOpen(false);

setForm(
emptyForm
);

router.refresh();
} catch (error) {
console.error(
"Save camera error:",
error
);

alert(
error instanceof
Error
? error.message
: "Failed to save camera"
);
} finally {
setSaving(false);
}
}

async function handleDelete(
camera: CameraItem
) {
const confirmed =
window.confirm(
`Delete "${camera.name}"?\n\nThis camera can only be deleted if it has no saved recordings or snapshots.`
);

if (!confirmed) {
return;
}

setDeletingId(
camera.id
);

try {
const response =
await fetch(
`/api/cameras/${camera.id}`,
{
method:
"DELETE",
}
);

const contentType =
response.headers.get(
"content-type"
) ?? "";

if (
!contentType.includes(
"application/json"
)
) {
throw new Error(
`Camera API returned HTTP ${response.status}`
);
}

const result =
await response.json();

if (!response.ok) {
if (
result.dependencies
) {
throw new Error(
`${result.message}\n\nRecordings: ${
result
.dependencies
.recordings ??
0
}\nSnapshots: ${
result
.dependencies
.snapshots ??
0
}`
);
}

throw new Error(
result.message ??
"Failed to delete camera"
);
}

if (
selectedCameraId ===
camera.id
) {
setSelectedCameraId(
null
);
}

router.refresh();
} catch (error) {
console.error(
"Delete camera error:",
error
);

alert(
error instanceof
Error
? error.message
: "Failed to delete camera"
);
} finally {
setDeletingId(
null
);
}
}

return (
<>
<section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
{/* Main toolbar */}
<div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 xl:flex-row xl:items-center xl:justify-between">
<div>
<h2 className="text-base font-semibold text-slate-900">
CCTV Monitor
</h2>

<p className="mt-1 text-xs text-slate-500">
{totalCameras} cameras ·{" "}
{onlineCount} online ·{" "}
{offlineCount} offline
</p>
</div>

<div className="flex flex-wrap items-center gap-3">
{/* View selector */}
<div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1.5">
<button
type="button"
onClick={() =>
changeView(
"multiview"
)
}
className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
viewMode ===
"multiview"
? "bg-white text-blue-600 shadow-sm"
: "text-slate-500 hover:text-slate-900"
}`}
>
<Grid2X2
size={16}
/>

Multi View
</button>

<button
type="button"
onClick={() =>
changeView(
"patrol"
)
}
className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
viewMode ===
"patrol"
? "bg-white text-blue-600 shadow-sm"
: "text-slate-500 hover:text-slate-900"
}`}
>
<ScanLine
size={16}
/>

Patrol
</button>

<button
type="button"
onClick={() =>
changeView(
"manage"
)
}
className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
viewMode ===
"manage"
? "bg-white text-blue-600 shadow-sm"
: "text-slate-500 hover:text-slate-900"
}`}
>
<List
size={16}
/>

Manage
</button>
</div>

<button
type="button"
onClick={
openCreate
}
className="flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700"
>
<Plus
size={16}
/>

Add Camera
</button>
</div>
</div>

{totalCameras ===
0 ? (
<div className="flex min-h-80 items-center justify-center">
<div className="text-center">
<VideoOff
size={38}
className="mx-auto text-slate-300"
/>

<p className="mt-3 text-sm font-semibold text-slate-800">
No cameras registered
</p>

<p className="mt-1 text-xs text-slate-500">
Add a camera to begin monitoring.
</p>
</div>
</div>
) : (
<>
{/* ==========================
MULTI VIEW
========================== */}

{viewMode ===
"multiview" && (
<div className="p-5">
{selectedCamera ? (
/*
* Full operator view.
*
* Uses CameraCard so all
* camera controls work.
*/
<CameraCard
key={`operator-${selectedCamera.id}`}
id={
selectedCamera.id
}
name={
selectedCamera.name
}
location={
selectedCamera.location ??
"Unknown location"
}
status={
selectedCamera.status
}
streamUrl={
selectedCamera.streamUrl ??
undefined
}
mode="operator"
onBack={() =>
setSelectedCameraId(
null
)
}
/>
) : (
/*
* ONE CCTV MONITOR
* containing four channels.
*/
<div className="overflow-hidden rounded-xl border-4 border-slate-800 bg-slate-950 shadow-lg">
{/* Monitor header */}
<div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3">
<div className="flex items-center gap-3">
<span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />

<p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
CCTV Multi Monitor
</p>
</div>

<p className="text-xs text-slate-500">
{Math.min(
totalCameras,
4
)}{" "}
/ 4 Channels
</p>
</div>

{/* 2 x 2 channels */}
<div className="grid grid-cols-2 gap-px bg-slate-700">
{camerasWithStatus
.slice(
0,
4
)
.map(
(
camera
) => (
<CCTVFeed
key={
camera.id
}
camera={
camera
}
onClick={() =>
setSelectedCameraId(
camera.id
)
}
/>
)
)}

{/* Empty channels */}
{Array.from({
length:
Math.max(
0,
4 -
Math.min(
camerasWithStatus.length,
4
)
),
}).map(
(
_,
index
) => (
<div
key={`empty-${index}`}
className="flex aspect-video items-center justify-center bg-slate-950"
>
<div className="text-center">
<VideoOff
size={
24
}
className="mx-auto text-slate-800"
/>

<p className="mt-2 text-[10px] font-medium uppercase tracking-wider text-slate-700">
Empty Channel
</p>
</div>
</div>
)
)}
</div>

{/* Monitor footer */}
<div className="flex items-center justify-between border-t border-slate-800 bg-slate-900 px-4 py-2">
<div className="flex items-center gap-4 text-[10px] text-slate-500">
<span>
ONLINE{" "}
{
onlineCount
}
</span>

<span>
OFFLINE{" "}
{
offlineCount
}
</span>
</div>

<span className="font-mono text-[10px] text-slate-600">
SMART CAMERA PLATFORM
</span>
</div>
</div>
)}
</div>
)}

{/* ==========================
PATROL
========================== */}

{viewMode ===
"patrol" &&
patrolCamera && (
<div className="p-5">
<div className="space-y-4">
{/* Patrol controls */}
<div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 lg:flex-row lg:items-center lg:justify-between">
<div>
<p className="text-sm font-semibold text-slate-900">
Automatic Patrol
</p>

<p className="mt-0.5 text-xs text-slate-500">
Camera{" "}
{patrolIndex +
1}{" "}
of{" "}
{
totalCameras
}{" "}
· 10 seconds each
</p>
</div>

<div className="flex flex-wrap items-center gap-2">
<span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700">
{
patrolCamera.name
}
</span>

<span
className={`rounded-lg border px-3 py-2 text-xs font-medium ${
patrolCamera.status ===
"online"
? "border-emerald-200 bg-emerald-50 text-emerald-700"
: "border-red-200 bg-red-50 text-red-700"
}`}
>
{patrolCamera.status ===
"online"
? "Online"
: "Offline"}
</span>

<span className="min-w-[96px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-center text-xs font-medium text-slate-700">
{patrolPaused
? "Paused"
: `Next ${secondsRemaining}s`}
</span>

<button
type="button"
onClick={
previousCamera
}
disabled={
totalCameras <=
1
}
title="Previous camera"
className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
>
<ChevronLeft
size={
17
}
/>
</button>

<button
type="button"
onClick={() =>
setPatrolPaused(
(
current
) =>
!current
)
}
disabled={
totalCameras <=
1
}
className="flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-3 text-xs font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
>
{patrolPaused ? (
<>
<Play
size={
14
}
/>

Resume
</>
) : (
<>
<Pause
size={
14
}
/>

Pause
</>
)}
</button>

<button
type="button"
onClick={
nextCamera
}
disabled={
totalCameras <=
1
}
title="Next camera"
className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
>
<ChevronRight
size={
17
}
/>
</button>

<button
type="button"
onClick={
restartPatrol
}
title="Restart patrol"
className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100"
>
<RotateCcw
size={
16
}
/>
</button>
</div>
</div>

{/* Patrol monitor */}
<div className="overflow-hidden rounded-xl border-4 border-slate-800 bg-slate-950">
<div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3">
<div className="flex items-center gap-2">
<span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />

<p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
Patrol Monitor
</p>
</div>

<p className="font-mono text-xs text-slate-500">
CH{" "}
{String(
patrolCamera.id
).padStart(
2,
"0"
)}
</p>
</div>

<CCTVFeed
key={`patrol-${patrolCamera.id}`}
camera={
patrolCamera
}
large
/>

{/* Countdown */}
<div className="h-1.5 bg-slate-800">
<div
className="h-full bg-blue-500 transition-all duration-1000"
style={{
width: `${Math.max(
0,
Math.min(
100,
((PATROL_SECONDS -
secondsRemaining) /
PATROL_SECONDS) *
100
)
)}%`,
}}
/>
</div>
</div>

{/* Patrol channels */}
<div
className={`grid gap-2 ${
totalCameras <=
2
? "grid-cols-2"
: "grid-cols-2 md:grid-cols-4"
}`}
>
{camerasWithStatus.map(
(
camera,
index
) => (
<button
key={
camera.id
}
type="button"
onClick={() =>
selectPatrolCamera(
index
)
}
className={`rounded-lg border px-3 py-2 text-left transition ${
index ===
patrolIndex
? "border-blue-400 bg-blue-50 ring-2 ring-blue-100"
: "border-slate-200 bg-white hover:bg-slate-50"
}`}
>
<div className="flex items-center justify-between gap-2">
<p className="truncate text-xs font-semibold text-slate-800">
{
camera.name
}
</p>

<span
className={`h-2 w-2 shrink-0 rounded-full ${
camera.status ===
"online"
? "bg-emerald-500"
: "bg-red-500"
}`}
/>
</div>

<p className="mt-1 truncate text-[10px] text-slate-400">
CAM{" "}
{String(
camera.id
).padStart(
2,
"0"
)}
</p>
</button>
)
)}
</div>
</div>
</div>
)}

{/* ==========================
MANAGE
========================== */}

{viewMode ===
"manage" && (
<div className="divide-y divide-slate-100">
{camerasWithStatus.map(
(camera) => (
<div
key={
camera.id
}
className="flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50"
>
<div
className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
camera.status ===
"online"
? "bg-emerald-50 text-emerald-600"
: "bg-red-50 text-red-500"
}`}
>
<Camera
size={
18
}
/>
</div>

<div className="min-w-[160px] flex-1">
<div className="flex items-center gap-2">
<p className="text-sm font-semibold text-slate-900">
{
camera.name
}
</p>

<span
className={`h-2 w-2 rounded-full ${
camera.status ===
"online"
? "bg-emerald-500"
: "bg-red-500"
}`}
/>
</div>

<p className="mt-0.5 text-xs text-slate-500">
{camera.location ??
"No location"}
</p>
</div>

<div className="hidden w-[170px] md:block">
<p className="text-[10px] uppercase tracking-wide text-slate-400">
Host
</p>

<p className="mt-1 text-sm text-slate-700">
{camera.host ??
"—"}
</p>
</div>

<div className="hidden w-[150px] lg:block">
<p className="text-[10px] uppercase tracking-wide text-slate-400">
Stream
</p>

<p className="mt-1 truncate text-sm text-slate-700">
{camera.streamPath ??
"—"}
</p>
</div>

<span
className={`hidden rounded-md px-2 py-1 text-xs font-medium sm:inline-flex ${
camera.status ===
"online"
? "bg-emerald-50 text-emerald-700"
: "bg-red-50 text-red-700"
}`}
>
{camera.status ===
"online"
? "Online"
: "Offline"}
</span>

<div className="ml-auto flex gap-2">
<button
type="button"
onClick={() =>
openEdit(
camera
)
}
title="Edit camera"
className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100"
>
<Edit3
size={
16
}
/>
</button>

<button
type="button"
onClick={() =>
handleDelete(
camera
)
}
disabled={
deletingId ===
camera.id
}
title="Delete camera"
className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-white text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
>
<Trash2
size={
16
}
/>
</button>
</div>
</div>
)
)}
</div>
)}
</>
)}
</section>

{/* ==========================
ADD / EDIT CAMERA
========================== */}

{open && (
<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-6">
<div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
<div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
<div>
<h2 className="font-semibold text-slate-900">
{form.id
? "Edit Camera"
: "Add Camera"}
</h2>

<p className="mt-1 text-xs text-slate-500">
Configure camera details
</p>
</div>

<button
type="button"
onClick={
closeModal
}
disabled={
saving
}
className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
>
<X
size={18}
/>
</button>
</div>

<div className="space-y-4 p-5">
{/* Name */}
<div>
<label className="text-xs font-medium text-slate-600">
Camera name
</label>

<input
value={
form.name
}
onChange={(
event
) =>
setForm(
(
current
) => ({
...current,

name:
event
.target
.value,
})
)
}
className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
placeholder="Camera 1"
/>
</div>

{/* Location */}
<div>
<label className="text-xs font-medium text-slate-600">
Location
</label>

<input
value={
form.location
}
onChange={(
event
) =>
setForm(
(
current
) => ({
...current,

location:
event
.target
.value,
})
)
}
className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
placeholder="Lab Area A"
/>
</div>

{/* IP */}
<div>
<label className="text-xs font-medium text-slate-600">
Camera host / IP
</label>

<input
value={
form.host
}
onChange={(
event
) =>
setForm(
(
current
) => ({
...current,

host:
event
.target
.value,
})
)
}
className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
placeholder="192.168.178.71"
/>
</div>

{/* Stream */}
<div>
<label className="text-xs font-medium text-slate-600">
MediaMTX stream path
</label>

<input
value={
form.streamPath
}
onChange={(
event
) =>
setForm(
(
current
) => ({
...current,

streamPath:
event
.target
.value,
})
)
}
className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
placeholder="camera1"
/>
</div>
</div>

<div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
<button
type="button"
onClick={
closeModal
}
disabled={
saving
}
className="h-9 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
>
Cancel
</button>

<button
type="button"
onClick={
handleSave
}
disabled={
saving
}
className="flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
>
<Check
size={16}
/>

{saving
? "Saving..."
: "Save Camera"}
</button>
</div>
</div>
</div>
)}
</>
);
}