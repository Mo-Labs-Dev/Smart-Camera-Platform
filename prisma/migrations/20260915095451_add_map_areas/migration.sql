-- AlterTable
ALTER TABLE "Camera" ADD COLUMN     "mapAreaId" INTEGER;

-- CreateTable
CREATE TABLE "MapArea" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'room',
    "mapX" DOUBLE PRECISION NOT NULL,
    "mapY" DOUBLE PRECISION NOT NULL,
    "width" DOUBLE PRECISION NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MapArea_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Camera" ADD CONSTRAINT "Camera_mapAreaId_fkey" FOREIGN KEY ("mapAreaId") REFERENCES "MapArea"("id") ON DELETE SET NULL ON UPDATE CASCADE;
