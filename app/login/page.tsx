import { redirect } from "next/navigation";
import {
 Camera,
 CheckCircle2,
 ShieldCheck,
 Video,
} from "lucide-react";
import { auth } from "@/auth";
import LoginForm from "@/components/auth/LoginForm";
export const dynamic = "force-dynamic";
export default async function LoginPage() {
 const session = await auth();
 if (session?.user) {
   redirect("/");
 }
 return (
<main className="min-h-screen bg-slate-950">
<div className="grid min-h-screen lg:grid-cols-2">
<section className="relative hidden overflow-hidden border-r border-white/10 bg-slate-900 lg:flex lg:flex-col lg:justify-between">
<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.20),transparent_38%)]" />
<div className="relative z-10 p-12">
<div className="flex items-center gap-3">
<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-950/40">
<Camera
                 size={25}
                 className="text-white"
               />
</div>
<div>
<h1 className="text-lg font-semibold text-white">
                 Smart Camera Platform
</h1>
<p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                 CCTV / VMS
</p>
</div>
</div>
</div>
<div className="relative z-10 max-w-xl px-12">
<div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-300">
<span className="h-2 w-2 rounded-full bg-emerald-400" />
             Platform Operational
</div>
<h2 className="text-4xl font-semibold leading-tight tracking-tight text-white">
             Secure video monitoring
             and camera management.
</h2>
<p className="mt-5 max-w-lg text-base leading-7 text-slate-400">
             Centralized CCTV monitoring,
             recordings, snapshots, events
             and system health from one
             operator interface.
</p>
<div className="mt-10 grid grid-cols-2 gap-4">
<div className="rounded-2xl border border-white/10 bg-white/5 p-5">
<Video
                 size={22}
                 className="text-blue-400"
               />
<p className="mt-4 text-sm font-semibold text-white">
                 Live Monitoring
</p>
<p className="mt-1 text-xs leading-5 text-slate-400">
                 Multi-camera HLS video
                 monitoring.
</p>
</div>
<div className="rounded-2xl border border-white/10 bg-white/5 p-5">
<ShieldCheck
                 size={22}
                 className="text-emerald-400"
               />
<p className="mt-4 text-sm font-semibold text-white">
                 Secure Access
</p>
<p className="mt-1 text-xs leading-5 text-slate-400">
                 Role-based operator
                 authentication.
</p>
</div>
</div>
</div>
<div className="relative z-10 flex items-center gap-2 p-12 text-xs text-slate-500">
<CheckCircle2
             size={15}
             className="text-emerald-400"
           />
           Camera services available
</div>
</section>
<section className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
<div className="w-full max-w-md">
<div className="mb-8 flex items-center gap-3 lg:hidden">
<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600">
<Camera
                 size={22}
                 className="text-white"
               />
</div>
<div>
<p className="font-semibold text-slate-900">
                 Smart Camera Platform
</p>
<p className="text-xs text-slate-500">
                 CCTV / VMS
</p>
</div>
</div>
<div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/60 sm:p-9">
<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
<ShieldCheck size={24} />
</div>
<h2 className="mt-6 text-2xl font-semibold tracking-tight text-slate-900">
               Welcome back
</h2>
<p className="mt-2 text-sm leading-6 text-slate-500">
               Sign in to access the
               camera management platform.
</p>
<LoginForm />
</div>
<p className="mt-6 text-center text-xs text-slate-400">
             Smart Camera Platform ·
             Secure VMS Console
</p>
</div>
</section>
</div>
</main>
 );
}
