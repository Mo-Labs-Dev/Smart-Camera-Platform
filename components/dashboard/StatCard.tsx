import type { LucideIcon } from "lucide-react";
type StatCardProps = {
 title: string;
 value: string | number;
 subtitle: string;
 icon: LucideIcon;
 color: "blue" | "green" | "red" | "orange";
};
const styles = {
 blue: "bg-blue-50 text-blue-600",
 green: "bg-emerald-50 text-emerald-600",
 red: "bg-red-50 text-red-500",
 orange: "bg-amber-50 text-amber-500",
};
export default function StatCard({
 title,
 value,
 subtitle,
 icon: Icon,
 color,
}: StatCardProps) {
 return (
<div className="flex items-center gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
<div
       className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${styles[color]}`}
>
<Icon size={25} />
</div>
<div>
<p className="text-sm font-medium text-slate-600">{title}</p>
<p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>
<p className="mt-1 text-xs text-slate-500">{subtitle}</p>
</div>
</div>
 );
}