import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/authorization";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const SETTINGS_ID = 1;
const DEFAULT_SETTINGS = {
 platformName: "Smart Camera Platform",
 patrolIntervalSec: 10,
 cameraStatusRefreshSec: 10,
 systemRefreshSec: 5,
 recordingRetentionDays: 30,
 snapshotRetentionDays: 30,
 defaultStreamQuality: "main",
 autoRecord: false,
};
async function getSettings() {
 return prisma.systemSettings.upsert({
   where: {
     id: SETTINGS_ID,
   },
   update: {},
   create: {
     id: SETTINGS_ID,
     ...DEFAULT_SETTINGS,
   },
 });
}
/*
* GET /api/settings
*
* All authenticated users can read
* runtime platform settings.
*/
export async function GET() {
 try {
   const settings =
     await getSettings();
   return NextResponse.json(
     {
       ok: true,
       settings,
     },
     {
       headers: {
         "Cache-Control":
           "no-store, no-cache, must-revalidate",
       },
     }
   );
 } catch (error) {
   console.error(
     "Settings GET error:",
     error
   );
   return NextResponse.json(
     {
       ok: false,
       message:
         "Failed to load settings",
     },
     {
       status: 500,
     }
   );
 }
}
/*
* PUT /api/settings
*
* ADMIN only.
*/
export async function PUT(
 request: Request
) {
 const access =
   await requirePermission(
     "settings:manage"
   );
 if (!access.ok) {
   return access.response;
 }
 try {
   const body =
     await request.json();
   const platformName =
     typeof body.platformName ===
       "string" &&
     body.platformName.trim()
       ? body.platformName.trim()
       : DEFAULT_SETTINGS.platformName;
   const patrolIntervalSec =
     Number(
       body.patrolIntervalSec
     );
   const cameraStatusRefreshSec =
     Number(
       body.cameraStatusRefreshSec
     );
   const systemRefreshSec =
     Number(
       body.systemRefreshSec
     );
   const recordingRetentionDays =
     Number(
       body.recordingRetentionDays
     );
   const snapshotRetentionDays =
     Number(
       body.snapshotRetentionDays
     );
   const defaultStreamQuality =
     body.defaultStreamQuality ===
     "sub"
       ? "sub"
       : "main";
   const autoRecord =
     body.autoRecord === true;
   if (
     !Number.isInteger(
       patrolIntervalSec
     ) ||
     patrolIntervalSec < 3 ||
     patrolIntervalSec > 300
   ) {
     return NextResponse.json(
       {
         ok: false,
         message:
           "Patrol interval must be between 3 and 300 seconds.",
       },
       {
         status: 400,
       }
     );
   }
   if (
     !Number.isInteger(
       cameraStatusRefreshSec
     ) ||
     cameraStatusRefreshSec <
       3 ||
     cameraStatusRefreshSec >
       300
   ) {
     return NextResponse.json(
       {
         ok: false,
         message:
           "Camera status refresh must be between 3 and 300 seconds.",
       },
       {
         status: 400,
       }
     );
   }
   if (
     !Number.isInteger(
       systemRefreshSec
     ) ||
     systemRefreshSec < 3 ||
     systemRefreshSec > 300
   ) {
     return NextResponse.json(
       {
         ok: false,
         message:
           "System refresh must be between 3 and 300 seconds.",
       },
       {
         status: 400,
       }
     );
   }
   if (
     !Number.isInteger(
       recordingRetentionDays
     ) ||
     recordingRetentionDays <
       1 ||
     recordingRetentionDays >
       3650
   ) {
     return NextResponse.json(
       {
         ok: false,
         message:
           "Recording retention must be between 1 and 3650 days.",
       },
       {
         status: 400,
       }
     );
   }
   if (
     !Number.isInteger(
       snapshotRetentionDays
     ) ||
     snapshotRetentionDays <
       1 ||
     snapshotRetentionDays >
       3650
   ) {
     return NextResponse.json(
       {
         ok: false,
         message:
           "Snapshot retention must be between 1 and 3650 days.",
       },
       {
         status: 400,
       }
     );
   }
   const settings =
     await prisma.systemSettings.upsert(
       {
         where: {
           id: SETTINGS_ID,
         },
         create: {
           id: SETTINGS_ID,
           platformName,
           patrolIntervalSec,
           cameraStatusRefreshSec,
           systemRefreshSec,
           recordingRetentionDays,
           snapshotRetentionDays,
           defaultStreamQuality,
           autoRecord,
         },
         update: {
           platformName,
           patrolIntervalSec,
           cameraStatusRefreshSec,
           systemRefreshSec,
           recordingRetentionDays,
           snapshotRetentionDays,
           defaultStreamQuality,
           autoRecord,
         },
       }
     );
   return NextResponse.json({
     ok: true,
     message:
       "Settings saved successfully.",
     settings,
   });
 } catch (error) {
   console.error(
     "Settings PUT error:",
     error
   );
   return NextResponse.json(
     {
       ok: false,
       message:
         "Failed to save settings.",
     },
     {
       status: 500,
     }
   );
 }
}
