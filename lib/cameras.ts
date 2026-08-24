export type CameraConfig = {
 id: number;
 name: string;
 location: string;
 status: "online" | "offline";
 host?: string;
 streamUrl?: string;
};
export const cameras: CameraConfig[] = [
 {
   id: 1,
   name: "Camera 1",
   location: "Test Bench 1",
   status: "online",
   host: "192.168.178.71",
   streamUrl: "http://localhost:8888/camera1/index.m3u8",
 },
 {
   id: 2,
   name: "Camera 2",
   location: "Lab Area B",
   status: "offline",
 },
 {
   id: 3,
   name: "Camera 3",
   location: "Lab Area C",
   status: "offline",
 },
 {
   id: 4,
   name: "Camera 4",
   location: "Lab Area D",
   status: "offline",
 },
];