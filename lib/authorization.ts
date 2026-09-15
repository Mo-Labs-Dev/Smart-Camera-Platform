import { NextResponse } from "next/server";
import { auth } from "@/auth";
export type AppRole =
 | "ADMIN"
 | "OPERATOR"
 | "VIEWER";
export type Permission =
 | "camera:manage"
 | "camera:operate"
 | "recording:operate"
 | "recording:delete"
 | "snapshot:create"
 | "snapshot:delete"
 | "settings:manage"
 | "users:manage";
const ROLE_PERMISSIONS: Record<
 AppRole,
 Permission[]
> = {
 ADMIN: [
   "camera:manage",
   "camera:operate",
   "recording:operate",
   "recording:delete",
   "snapshot:create",
   "snapshot:delete",
   "settings:manage",
   "users:manage",
 ],
 OPERATOR: [
   "camera:operate",
   "recording:operate",
   "snapshot:create",
 ],
 VIEWER: [],
};
function normalizeRole(
 value: unknown
): AppRole {
 if (
   value === "ADMIN" ||
   value === "OPERATOR" ||
   value === "VIEWER"
 ) {
   return value;
 }
 return "VIEWER";
}
export function hasPermission(
 role: AppRole,
 permission: Permission
) {
 return ROLE_PERMISSIONS[
   role
 ].includes(permission);
}
export async function requirePermission(
 permission: Permission
) {
 const session = await auth();
 if (!session?.user) {
   return {
     ok: false as const,
     response:
       NextResponse.json(
         {
           ok: false,
           error:
             "Authentication required.",
         },
         {
           status: 401,
         }
       ),
   };
 }
 const role = normalizeRole(
   session.user.role
 );
 if (
   !hasPermission(
     role,
     permission
   )
 ) {
   return {
     ok: false as const,
     response:
       NextResponse.json(
         {
           ok: false,
           error:
             "You do not have permission to perform this action.",
         },
         {
           status: 403,
         }
       ),
   };
 }
 return {
   ok: true as const,
   session,
   role,
 };
}
export async function requireAdmin() {
 return requirePermission(
   "users:manage"
 );
}
