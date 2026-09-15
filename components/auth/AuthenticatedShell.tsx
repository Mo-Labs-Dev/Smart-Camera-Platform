"use client";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
type AuthenticatedShellProps = {
 children: React.ReactNode;
};
export default function AuthenticatedShell({
 children,
}: AuthenticatedShellProps) {
 const pathname = usePathname();
 /*
  * Login is a public page.
  * Do not render the VMS sidebar/layout there.
  */
 if (pathname === "/login") {
   return <>{children}</>;
 }
 return (
<>
<Sidebar />
<main className="min-h-screen pl-64">
       {children}
</main>
</>
 );
}
