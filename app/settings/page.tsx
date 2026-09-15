import SettingsClient from "@/components/settings/SettingsClient";
export const dynamic = "force-dynamic";
export default function SettingsPage() {
 return (
<main className="min-h-screen bg-slate-50">
<div className="px-6 py-6 lg:px-8 lg:py-8">
<SettingsClient />
</div>
</main>
 );
}