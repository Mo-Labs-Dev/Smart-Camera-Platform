import { NextResponse } from "next/server";
import net from "node:net";
import { cameras } from "@/lib/cameras";
export const runtime = "nodejs";
function checkPort(host: string, port: number): Promise<boolean> {
 return new Promise((resolve) => {
   const socket = new net.Socket();
   const finish = (online: boolean) => {
     socket.destroy();
     resolve(online);
   };
   socket.setTimeout(1500);
   socket.once("connect", () => finish(true));
   socket.once("timeout", () => finish(false));
   socket.once("error", () => finish(false));
   socket.connect(port, host);
 });
}
export async function GET() {
 const result = await Promise.all(
   cameras.map(async (camera) => {
     if (!camera.host) {
       return {
         id: camera.id,
         name: camera.name,
         status: "offline" as const,
       };
     }
     const online = await checkPort(camera.host, 554);
     return {
       id: camera.id,
       name: camera.name,
       status: online ? ("online" as const) : ("offline" as const),
     };
   })
 );
 return NextResponse.json(result);
}