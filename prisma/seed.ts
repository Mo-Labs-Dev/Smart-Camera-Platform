import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
const adapter = new PrismaPg({
 connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({
 adapter,
});
async function main() {
 const cameras = [
   {
     id: 1,
     name: "Camera 1",
     location: "Lab Area A",
     host: "192.168.178.71",
     streamPath: "camera1",
   },
   {
     id: 2,
     name: "Camera 2",
     location: "Lab Area B",
     host: null,
     streamPath: "camera2",
   },
   {
     id: 3,
     name: "Camera 3",
     location: "Lab Area C",
     host: null,
     streamPath: "camera3",
   },
   {
     id: 4,
     name: "Camera 4",
     location: "Lab Area D",
     host: null,
     streamPath: "camera4",
   },
 ];
 for (const camera of cameras) {
   await prisma.camera.upsert({
     where: {
       id: camera.id,
     },
     update: {
       name: camera.name,
       location: camera.location,
       host: camera.host,
       streamPath: camera.streamPath,
     },
     create: camera,
   });
 }
 console.log("Camera seed completed.");
}
main()
 .catch((error) => {
   console.error(error);
   process.exit(1);
 })
 .finally(async () => {
   await prisma.$disconnect();
 });