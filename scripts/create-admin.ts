import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import {
 PrismaClient,
 UserRole,
} from "../generated/prisma/client";
async function main() {
 const databaseUrl =
   process.env.DATABASE_URL;
 if (!databaseUrl) {
   throw new Error(
     "DATABASE_URL is not configured."
   );
 }
 const adapter = new PrismaPg({
   connectionString: databaseUrl,
 });
 const prisma =
   new PrismaClient({
     adapter,
   });
 const email =
   process.env.ADMIN_EMAIL?.trim().toLowerCase();
 const password =
   process.env.ADMIN_PASSWORD;
 const name =
   process.env.ADMIN_NAME?.trim() ||
   "System Administrator";
 if (!email) {
   throw new Error(
     "ADMIN_EMAIL is required."
   );
 }
 if (!password) {
   throw new Error(
     "ADMIN_PASSWORD is required."
   );
 }
 if (password.length < 12) {
   throw new Error(
     "ADMIN_PASSWORD must be at least 12 characters."
   );
 }
 try {
   const passwordHash =
     await bcrypt.hash(
       password,
       12
     );
   const user =
     await prisma.user.upsert({
       where: {
         email,
       },
       update: {
         name,
         passwordHash,
         role: UserRole.ADMIN,
         active: true,
       },
       create: {
         name,
         email,
         passwordHash,
         role: UserRole.ADMIN,
         active: true,
       },
       select: {
         id: true,
         name: true,
         email: true,
         role: true,
         active: true,
       },
     });
   console.log(
     "Admin account ready:"
   );
   console.log(user);
 } finally {
   await prisma.$disconnect();
 }
}
main().catch(
 (error) => {
   console.error(error);
   process.exit(1);
 }
);
