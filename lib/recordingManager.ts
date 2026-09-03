import fs from "node:fs/promises";
import path from "node:path";
export type RecordingProcessState = {
 cameraId: number;
 recordingId: number;
 pid: number;
 filename: string;
 filePath: string;
 startedAt: string;
};
/*
* Main recordings directory.
*
* project/
* └── recordings/
*/
export function getRecordingsDirectory() {
 return path.resolve(
   process.cwd(),
   "recordings"
 );
}
/*
* Internal directory where we keep
* the FFmpeg PID/state for each
* currently recording camera.
*/
function getStateDirectory() {
 return path.resolve(
   getRecordingsDirectory(),
   ".recording-state"
 );
}
/*
* Example:
*
* recordings/
* .recording-state/
* camera-2.json
*/
function getStateFile(
 cameraId: number
) {
 return path.resolve(
   getStateDirectory(),
   `camera-${cameraId}.json`
 );
}
/*
* Create recording directories
* automatically if they don't exist.
*/
export async function ensureRecordingDirectories() {
 await fs.mkdir(
   getRecordingsDirectory(),
   {
     recursive: true,
   }
 );
 await fs.mkdir(
   getStateDirectory(),
   {
     recursive: true,
   }
 );
}
/*
* Store information about
* the running FFmpeg process.
*/
export async function saveRecordingState(
 state: RecordingProcessState
) {
 await ensureRecordingDirectories();
 const stateFile =
   getStateFile(
     state.cameraId
   );
 await fs.writeFile(
   stateFile,
   JSON.stringify(
     state,
     null,
     2
   ),
   "utf8"
 );
}
/*
* Read the FFmpeg state
* belonging to a camera.
*/
export async function readRecordingState(
 cameraId: number
): Promise<RecordingProcessState | null> {
 try {
   const stateFile =
     getStateFile(
       cameraId
     );
   const content =
     await fs.readFile(
       stateFile,
       "utf8"
     );
   return JSON.parse(
     content
   ) as RecordingProcessState;
 } catch (
   error: unknown
 ) {
   const code =
     typeof error ===
       "object" &&
     error !== null &&
     "code" in error
       ? String(
           (
             error as {
               code?: string;
             }
           ).code
         )
       : null;
   /*
    * No state file means
    * no active recording.
    */
   if (
     code === "ENOENT"
   ) {
     return null;
   }
   throw error;
 }
}
/*
* Remove camera recording state
* after recording has stopped.
*/
export async function removeRecordingState(
 cameraId: number
) {
 try {
   await fs.unlink(
     getStateFile(
       cameraId
     )
   );
 } catch (
   error: unknown
 ) {
   const code =
     typeof error ===
       "object" &&
     error !== null &&
     "code" in error
       ? String(
           (
             error as {
               code?: string;
             }
           ).code
         )
       : null;
   /*
    * Missing state file is fine.
    */
   if (
     code !== "ENOENT"
   ) {
     throw error;
   }
 }
}
/*
* Check whether an FFmpeg PID
* is still alive.
*/
export function isProcessRunning(
 pid: number
) {
 if (
   !Number.isInteger(pid) ||
   pid <= 0
 ) {
   return false;
 }
 try {
   process.kill(
     pid,
     0
   );
   return true;
 } catch {
   return false;
 }
}
/*
* Wait for FFmpeg to stop.
*/
export async function waitForProcessToStop(
 pid: number,
 timeoutMs = 10000
) {
 const startedAt =
   Date.now();
 while (
   Date.now() -
     startedAt <
   timeoutMs
 ) {
   if (
     !isProcessRunning(
       pid
     )
   ) {
     return true;
   }
   await new Promise<void>(
     (resolve) => {
       setTimeout(
         resolve,
         250
       );
     }
   );
 }
 return !isProcessRunning(
   pid
 );
}