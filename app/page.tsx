import {
 CalendarDays,
 CheckCircle2,
 Monitor,
 VideoOff,
} from "lucide-react";
import Header from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/Sidebar";
import StatCard from "@/components/dashboard/StatCard";
import LiveCameras from "@/components/dashboard/LiveCameras";
import StatusPanel from "@/components/dashboard/StatusPanel";
export default function Home() {
 return (
<div className="min-h-screen bg-slate-50">
<Sidebar />
<main className="ml-64 min-h-screen p-8">
<Header />
<section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
<StatCard
           title="Total Cameras"
           value={4}
           subtitle="All cameras registered"
           icon={Monitor}
           color="blue"
         />
<StatCard
           title="Online"
           value={0}
           subtitle="Cameras online"
           icon={CheckCircle2}
           color="green"
         />
<StatCard
           title="Offline"
           value={4}
           subtitle="Cameras offline"
           icon={VideoOff}
           color="red"
         />
<StatCard
           title="Events (24h)"
           value={3}
           subtitle="Total events"
           icon={CalendarDays}
           color="orange"
         />
</section>
<div className="mt-6 grid grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,1fr)_320px]">
<LiveCameras />
<StatusPanel />
</div>
</main>
</div>
 );
}