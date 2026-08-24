import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = {
 params: Promise<{
   id: string;
 }>;
};
async function fileExists(filePath: string) {
 try {
   await fs.access(filePath);
   return true;
 } catch {
   return false;
 }
}
export async function GET(
 request: Request,
 context: Context
) {
 try {
   const { id: idValue } =
     await context.params;
   const snapshotId =
     Number(idValue);
   if (
     !Number.isInteger(snapshotId) ||
     snapshotId <= 0
   ) {
     return NextResponse.json(
       {
         ok: false,
         message: "Invalid snapshot ID",
       },
       {
         status: 400,
       }
     );
   }
   const snapshot =
     await prisma.snapshot.findUnique({
       where: {
         id: snapshotId,
       },
     });
   if (!snapshot) {
     return NextResponse.json(
       {
         ok: false,
         message: "Snapshot not found",
       },
       {
         status: 404,
       }
     );
   }
   /*
    * Try several locations so old snapshots
    * continue working after path changes.
    */
   const candidates: string[] = [];
   if (snapshot.filePath) {
     if (
       path.isAbsolute(
         snapshot.filePath
       )
     ) {
       candidates.push(
         snapshot.filePath
       );
     } else {
       candidates.push(
         path.join(
           process.cwd(),
           snapshot.filePath
         )
       );
     }
   }
   /*
    * Main current location.
    */
   candidates.push(
     path.join(
       process.cwd(),
       "snapshots",
       snapshot.filename
     )
   );
   /*
    * Extra fallback in case snapshots
    * were previously put under public.
    */
   candidates.push(
     path.join(
       process.cwd(),
       "public",
       "snapshots",
       snapshot.filename
     )
   );
   let actualPath:
     | string
     | null = null;
   for (const candidate of candidates) {
     if (
       await fileExists(candidate)
     ) {
       actualPath = candidate;
       break;
     }
   }
   if (!actualPath) {
     console.error(
       "SNAPSHOT FILE NOT FOUND:",
       {
         snapshotId:
snapshot.id,
         filename:
           snapshot.filename,
         storedFilePath:
           snapshot.filePath,
         checked:
           candidates,
       }
     );
     return NextResponse.json(
       {
         ok: false,
         message:
           "Snapshot file not found on disk",
         filename:
           snapshot.filename,
       },
       {
         status: 404,
       }
     );
   }
   const fileBuffer =
     await fs.readFile(
       actualPath
     );
   const extension =
     path
       .extname(
         snapshot.filename
       )
       .toLowerCase();
   let contentType =
     "image/jpeg";
   if (
     extension === ".png"
   ) {
     contentType =
       "image/png";
   } else if (
     extension === ".webp"
   ) {
     contentType =
       "image/webp";
   }
   const url =
     new URL(request.url);
   const shouldDownload =
     url.searchParams.get(
       "download"
     ) === "1";
   return new Response(
     new Uint8Array(
       fileBuffer
     ),
     {
       status: 200,
       headers: {
         "Content-Type":
           contentType,
         "Content-Length":
           String(
             fileBuffer.length
           ),
         "Content-Disposition":
           shouldDownload
             ? `attachment; filename="${snapshot.filename}"`
             : `inline; filename="${snapshot.filename}"`,
         "Cache-Control":
           "no-store",
       },
     }
   );
 } catch (error) {
   console.error(
     "Snapshot file error:",
     error
   );
   return NextResponse.json(
     {
       ok: false,
       message:
         "Failed to load snapshot file",
     },
     {
       status: 500,
     }
   );
 }
}