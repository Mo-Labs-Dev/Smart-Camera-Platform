import { redirect } from "next/navigation";
import { auth } from "@/auth";
import UsersClient from "@/components/users/UsersClient";
export const dynamic = "force-dynamic";
export default async function UsersPage() {
 const session = await auth();
 if (!session?.user) {
   redirect("/login");
 }
 if (
   session.user.role !==
   "ADMIN"
 ) {
   redirect("/");
 }
 return (
<main className="min-h-screen bg-slate-50">
<div className="px-6 py-6 lg:px-8 lg:py-8">
<UsersClient
         currentUserId={
session.user.id
         }
       />
</div>
</main>
 );
}
