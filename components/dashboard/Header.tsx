import { Bell, Maximize2, Search } from "lucide-react";
export default function Header() {
 return (
<header className="flex items-center justify-between">
<div>
<h1 className="text-3xl font-bold text-slate-900">
         Dashboard
</h1>
<p className="mt-1 text-sm text-slate-500">
         Live monitoring overview
</p>
</div>
<div className="flex items-center gap-3">
<div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm md:flex">
<Search size={18} className="text-slate-400" />
<input
           type="text"
           placeholder="Search cameras, events..."
           className="w-64 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
         />
</div>
<button className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm hover:bg-slate-50">
<Bell size={19} />
<span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
           3
</span>
</button>
<button className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm hover:bg-slate-50">
<Maximize2 size={19} />
</button>
<div className="flex items-center gap-3 rounded-xl px-2 py-1">
<div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
           LA
</div>
<div className="hidden lg:block">
<p className="text-sm font-semibold text-slate-900">
             Lab Admin
</p>
<p className="text-xs text-slate-500">
             Administrator
</p>
</div>
</div>
</div>
</header>
 );
}