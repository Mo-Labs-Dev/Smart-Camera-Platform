import type { Metadata } from "next";
import {
 Geist,
 Geist_Mono,
} from "next/font/google";
import AuthenticatedShell from "@/components/auth/AuthenticatedShell";
import AuthProvider from "@/components/auth/AuthProvider";
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
<AuthProvider>
<AuthenticatedShell>
           {children}
</AuthenticatedShell>
</AuthProvider>
</body>
</html>
 );
}