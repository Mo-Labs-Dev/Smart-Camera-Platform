-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "platformName" TEXT NOT NULL DEFAULT 'Smart Camera Platform',
    "patrolIntervalSec" INTEGER NOT NULL DEFAULT 10,
    "cameraStatusRefreshSec" INTEGER NOT NULL DEFAULT 10,
    "systemRefreshSec" INTEGER NOT NULL DEFAULT 5,
    "recordingRetentionDays" INTEGER NOT NULL DEFAULT 30,
    "snapshotRetentionDays" INTEGER NOT NULL DEFAULT 30,
    "defaultStreamQuality" TEXT NOT NULL DEFAULT 'main',
    "autoRecord" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("id")
);
