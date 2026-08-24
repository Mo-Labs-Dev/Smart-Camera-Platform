import type { ChildProcessWithoutNullStreams } from "node:child_process";
export type ActiveRecording = {
 process: ChildProcessWithoutNullStreams;
 recordingId: number;
 cameraId: number;
 startedAt: Date;
 filePath: string;
 stopping: boolean;
};
declare global {
 // eslint-disable-next-line no-var
 var activeCameraRecordings:
   | Map<number, ActiveRecording>
   | undefined;
}
export const activeCameraRecordings =
 global.activeCameraRecordings ??
 new Map<number, ActiveRecording>();
global.activeCameraRecordings =
 activeCameraRecordings;