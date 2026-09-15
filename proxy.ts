import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";
const PUBLIC_PATHS = [
 "/login",
];
export default auth(
 function proxy(request: NextRequest & {
   auth: {
     user?: unknown;
   } | null;
 }) {
   const pathname =
     request.nextUrl.pathname;
   const isPublicPath =
     PUBLIC_PATHS.some(
       (path) =>
         pathname === path ||
         pathname.startsWith(
           `${path}/`
         )
     );
   /*
    * Auth.js endpoints must remain
    * public so login/logout/session
    * can work.
    */
   if (
     pathname.startsWith(
       "/api/auth"
     )
   ) {
     return NextResponse.next();
   }
   /*
    * Allow the login page.
    */
   if (isPublicPath) {
     return NextResponse.next();
   }
   /*
    * Everything else requires
    * authentication.
    */
   if (!request.auth?.user) {
     const loginUrl =
       new URL(
         "/login",
         request.nextUrl.origin
       );
     /*
      * For normal pages remember
      * where the user was trying
      * to go.
      */
     if (
       !pathname.startsWith("/api/")
     ) {
       loginUrl.searchParams.set(
         "callbackUrl",
         `${pathname}${request.nextUrl.search}`
       );
     }
     /*
      * API calls should receive
      * JSON instead of HTML.
      */
     if (
       pathname.startsWith("/api/")
     ) {
       return NextResponse.json(
         {
           ok: false,
           error:
             "Authentication required.",
         },
         {
           status: 401,
         }
       );
     }
     return NextResponse.redirect(
       loginUrl
     );
   }
   return NextResponse.next();
 }
);
export const config = {
 matcher: [
   /*
    * Ignore Next.js static assets,
    * image optimization and common
    * public files.
    */
   "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
 ],
};
