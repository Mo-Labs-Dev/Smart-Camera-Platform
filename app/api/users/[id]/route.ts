import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/generated/prisma/client";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type RouteContext = {
 params: Promise<{
   id: string;
 }>;
};
async function requireAdmin() {
 const session = await auth();
 if (!session?.user) {
   return {
     session: null,
     response: NextResponse.json(
       {
         ok: false,
         error: "Authentication required.",
       },
       { status: 401 }
     ),
   };
 }
 if (session.user.role !== "ADMIN") {
   return {
     session,
     response: NextResponse.json(
       {
         ok: false,
         error: "Administrator access required.",
       },
       { status: 403 }
     ),
   };
 }
 return {
   session,
   response: null,
 };
}
export async function PUT(
 request: NextRequest,
 context: RouteContext
) {
 try {
   const authorization =
     await requireAdmin();
   if (authorization.response) {
     return authorization.response;
   }
   const session =
     authorization.session!;
   const { id } =
     await context.params;
   const userId = Number(id);
   if (
     !Number.isInteger(userId) ||
     userId <= 0
   ) {
     return NextResponse.json(
       {
         ok: false,
         error: "Invalid user ID.",
       },
       { status: 400 }
     );
   }
   const existing =
     await prisma.user.findUnique({
       where: {
         id: userId,
       },
     });
   if (!existing) {
     return NextResponse.json(
       {
         ok: false,
         error: "User not found.",
       },
       { status: 404 }
     );
   }
   const body = await request.json();
   const data: {
     name?: string;
     email?: string;
     role?: UserRole;
     active?: boolean;
     passwordHash?: string;
   } = {};
   if (
     typeof body.name === "string"
   ) {
     const name =
       body.name.trim();
     if (!name) {
       return NextResponse.json(
         {
           ok: false,
           error: "Name cannot be empty.",
         },
         { status: 400 }
       );
     }
     data.name = name;
   }
   if (
     typeof body.email === "string"
   ) {
     const email =
       body.email
         .trim()
         .toLowerCase();
     if (
       !email ||
       !email.includes("@")
     ) {
       return NextResponse.json(
         {
           ok: false,
           error:
             "A valid email address is required.",
         },
         { status: 400 }
       );
     }
     const duplicate =
       await prisma.user.findFirst({
         where: {
           email,
           NOT: {
             id: userId,
           },
         },
       });
     if (duplicate) {
       return NextResponse.json(
         {
           ok: false,
           error:
             "A user with this email already exists.",
         },
         { status: 409 }
       );
     }
     data.email = email;
   }
   if (
     typeof body.role === "string"
   ) {
     const role =
       body.role.toUpperCase();
     const allowedRoles = [
       "ADMIN",
       "OPERATOR",
       "VIEWER",
     ];
     if (
       !allowedRoles.includes(
         role
       )
     ) {
       return NextResponse.json(
         {
           ok: false,
           error: "Invalid role.",
         },
         { status: 400 }
       );
     }
     /*
      * Prevent an administrator from
      * removing their own ADMIN role.
      */
     if (
       String(userId) ===
session.user.id &&
       role !== "ADMIN"
     ) {
       return NextResponse.json(
         {
           ok: false,
           error:
             "You cannot remove your own administrator role.",
         },
         { status: 400 }
       );
     }
     data.role =
       role as UserRole;
   }
   if (
     typeof body.active ===
     "boolean"
   ) {
     /*
      * Prevent self-disable.
      */
     if (
       String(userId) ===
session.user.id &&
       body.active === false
     ) {
       return NextResponse.json(
         {
           ok: false,
           error:
             "You cannot disable your own account.",
         },
         { status: 400 }
       );
     }
     data.active =
       body.active;
   }
   if (
     typeof body.password ===
       "string" &&
     body.password.length > 0
   ) {
     if (
       body.password.length < 8
     ) {
       return NextResponse.json(
         {
           ok: false,
           error:
             "Password must contain at least 8 characters.",
         },
         { status: 400 }
       );
     }
     data.passwordHash =
       await bcrypt.hash(
         body.password,
         12
       );
   }
   if (
     Object.keys(data).length ===
     0
   ) {
     return NextResponse.json(
       {
         ok: false,
         error:
           "No valid changes were provided.",
       },
       { status: 400 }
     );
   }
   const user =
     await prisma.user.update({
       where: {
         id: userId,
       },
       data,
       select: {
         id: true,
         name: true,
         email: true,
         role: true,
         active: true,
         lastLoginAt: true,
         createdAt: true,
         updatedAt: true,
       },
     });
   return NextResponse.json({
     ok: true,
     message: "User updated successfully.",
     user,
   });
 } catch (error) {
   console.error(
     "PUT /api/users/[id] error:",
     error
   );
   return NextResponse.json(
     {
       ok: false,
       error: "Unable to update user.",
     },
     { status: 500 }
   );
 }
}
export async function DELETE(
 _request: NextRequest,
 context: RouteContext
) {
 try {
   const authorization =
     await requireAdmin();
   if (authorization.response) {
     return authorization.response;
   }
   const session =
     authorization.session!;
   const { id } =
     await context.params;
   const userId = Number(id);
   if (
     !Number.isInteger(userId) ||
     userId <= 0
   ) {
     return NextResponse.json(
       {
         ok: false,
         error: "Invalid user ID.",
       },
       { status: 400 }
     );
   }
   if (
     String(userId) ===
session.user.id
   ) {
     return NextResponse.json(
       {
         ok: false,
         error:
           "You cannot delete your own account.",
       },
       { status: 400 }
     );
   }
   const existing =
     await prisma.user.findUnique({
       where: {
         id: userId,
       },
     });
   if (!existing) {
     return NextResponse.json(
       {
         ok: false,
         error: "User not found.",
       },
       { status: 404 }
     );
   }
   await prisma.user.delete({
     where: {
       id: userId,
     },
   });
   return NextResponse.json({
     ok: true,
     message: "User deleted successfully.",
   });
 } catch (error) {
   console.error(
     "DELETE /api/users/[id] error:",
     error
   );
   return NextResponse.json(
     {
       ok: false,
       error: "Unable to delete user.",
     },
     { status: 500 }
   );
 }
}
