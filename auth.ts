import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
export const {
 handlers,
 auth,
 signIn,
 signOut,
} = NextAuth({
 secret: process.env.AUTH_SECRET,
 session: {
   strategy: "jwt",
   maxAge: 8 * 60 * 60,
 },
 pages: {
   signIn: "/login",
 },
 providers: [
   Credentials({
     name: "Email and Password",
     credentials: {
       email: {
         label: "Email",
         type: "email",
       },
       password: {
         label: "Password",
         type: "password",
       },
     },
     async authorize(credentials) {
       const email =
         typeof credentials?.email ===
         "string"
           ? credentials.email
               .trim()
               .toLowerCase()
           : "";
       const password =
         typeof credentials?.password ===
         "string"
           ? credentials.password
           : "";
       if (
         !email ||
         !password
       ) {
         return null;
       }
       const user =
         await prisma.user.findUnique({
           where: {
             email,
           },
         });
       if (
         !user ||
         !user.active
       ) {
         return null;
       }
       const passwordMatches =
         await bcrypt.compare(
           password,
           user.passwordHash
         );
       if (
         !passwordMatches
       ) {
         return null;
       }
       /*
        * Keep login timestamp for
        * the Users / audit UI.
        */
       await prisma.user.update({
         where: {
           id: user.id,
         },
         data: {
           lastLoginAt:
             new Date(),
         },
       });
       return {
         id: String(user.id),
         name: user.name,
         email: user.email,
         /*
          * Custom property copied
          * into the JWT below.
          */
         role: user.role,
       };
     },
   }),
 ],
 callbacks: {
   async jwt({
     token,
     user,
   }) {
     if (user) {
token.id =
user.id;
       token.role =
         (
           user as {
             role?: string;
           }
         ).role;
     }
     return token;
   },
   async session({
     session,
     token,
   }) {
     if (
       session.user
     ) {
session.user.id =
         String(
token.id ??
             token.sub ??
             ""
         );
       (
         session.user as {
           role?: string;
         }
       ).role =
         typeof token.role ===
         "string"
           ? token.role
           : "VIEWER";
     }
     return session;
   },
 },
});
