import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/authorization";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = {
 params: Promise<{
   id: string;
 }>;
};
/*
* DELETE /api/snapshots/:id
*
* ADMIN only.
*/
export async function DELETE(
 _request: Request,
 context: Context
) {
 const access =
   await requirePermission(
     "snapshot:delete"
   );
 if (!access.ok) {
   return access.response;
 }
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
         message:
           "Invalid snapshot ID",
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
         message:
           "Snapshot not found",
       },
       {
         status: 404,
       }
     );
   }
   /*
    * Delete image file.
    *
    * ENOENT means the file is
    * already missing, so the
    * database record can still
    * be removed.
    */
   if (snapshot.filePath) {
     try {
       await fs.unlink(
         snapshot.filePath
       );
     } catch (error) {
       const fileError =
         error as NodeJS.ErrnoException;
       if (
         fileError.code !==
         "ENOENT"
       ) {
         console.error(
           "Snapshot file deletion failed:",
           error
         );
         return NextResponse.json(
           {
             ok: false,
             message:
               "Failed to delete snapshot file",
           },
           {
             status: 500,
           }
         );
       }
     }
   }
   await prisma.snapshot.delete({
     where: {
       id: snapshotId,
     },
   });
   return NextResponse.json(
     {
       ok: true,
       message:
         "Snapshot deleted successfully",
       id: snapshotId,
     },
     {
       status: 200,
     }
   );
 } catch (error) {
   console.error(
     "Snapshot delete error:",
     error
   );
   return NextResponse.json(
     {
       ok: false,
       message:
         "Failed to delete snapshot",
     },
     {
       status: 500,
     }
   );
 }
}
