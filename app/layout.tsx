import type { Metadata } from "next";
import {
 Geist,
 Geist_Mono,
} from "next/font/google";
import Sidebar from "@/components/dashboard/Sidebar";
import "./globals.css";
const geistSans = Geist({
 variable: "--font-geist-sans",
 subsets: ["latin"],
});
const geistMono = Geist_Mono({
 variable: "--font-geist-mono",
 subsets: ["latin"],
});
export const metadata: Metadata = {
 title: "Smart Camera Platform",
 description:
   "Smart camera monitoring and management platform",
};
export default function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 return (
<html
     lang="en"
     className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
>
<body className="min-h-screen bg-slate-50 text-slate-900">
<Sidebar />
<main className="min-h-screen pl-64">
         {children}
</main>
</body>
</html>
 );
}