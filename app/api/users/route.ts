import {
 NextRequest,
 NextResponse,
} from "next/server";
import bcrypt from "bcryptjs";
import {
 UserRole,
} from "@/generated/prisma/client";
import {
 requireAdmin,
} from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const ALLOWED_ROLES = [
 "ADMIN",
 "OPERATOR",
 "VIEWER",
] as const;
type AllowedRole =
 (typeof ALLOWED_ROLES)[number];
/*
* GET /api/users
*
* ADMIN only.
*/
export async function GET() {
 const access =
   await requireAdmin();
 if (!access.ok) {
   return access.response;
 }
 try {
   const users =
     await prisma.user.findMany({
       orderBy: {
         createdAt: "desc",
       },
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
     users,
   });
 } catch (error) {
   console.error(
     "GET /api/users error:",
     error
   );
   return NextResponse.json(
     {
       ok: false,
       error:
         "Unable to load users.",
     },
     {
       status: 500,
     }
   );
 }
}
/*
* POST /api/users
*
* ADMIN only.
*/
export async function POST(
 request: NextRequest
) {
 const access =
   await requireAdmin();
 if (!access.ok) {
   return access.response;
 }
 try {
   const body =
     await request.json();
   const name =
     typeof body.name === "string"
       ? body.name.trim()
       : "";
   const email =
     typeof body.email === "string"
       ? body.email
           .trim()
           .toLowerCase()
       : "";
   const password =
     typeof body.password === "string"
       ? body.password
       : "";
   const requestedRole =
     typeof body.role === "string"
       ? body.role.toUpperCase()
       : "VIEWER";
   if (!name) {
     return NextResponse.json(
       {
         ok: false,
         error:
           "Name is required.",
       },
       {
         status: 400,
       }
     );
   }
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
       {
         status: 400,
       }
     );
   }
   if (password.length < 8) {
     return NextResponse.json(
       {
         ok: false,
         error:
           "Password must contain at least 8 characters.",
       },
       {
         status: 400,
       }
     );
   }
   if (
     !ALLOWED_ROLES.includes(
       requestedRole as AllowedRole
     )
   ) {
     return NextResponse.json(
       {
         ok: false,
         error:
           "Invalid user role.",
       },
       {
         status: 400,
       }
     );
   }
   const existing =
     await prisma.user.findUnique({
       where: {
         email,
       },
       select: {
         id: true,
       },
     });
   if (existing) {
     return NextResponse.json(
       {
         ok: false,
         error:
           "A user with this email already exists.",
       },
       {
         status: 409,
       }
     );
   }
   const passwordHash =
     await bcrypt.hash(
       password,
       12
     );
   const user =
     await prisma.user.create({
       data: {
         name,
         email,
         passwordHash,
         role:
           requestedRole as UserRole,
         active: true,
       },
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
   return NextResponse.json(
     {
       ok: true,
       message:
         "User created successfully.",
       user,
     },
     {
       status: 201,
     }
   );
 } catch (error) {
   console.error(
     "POST /api/users error:",
     error
   );
   return NextResponse.json(
     {
       ok: false,
       error:
         "Unable to create user.",
     },
     {
       status: 500,
     }
   );
 }
}