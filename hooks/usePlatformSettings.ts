"use client";
import { useCallback, useEffect, useState } from "react";
export type PlatformSettings = {
 platformName: string;
 patrolIntervalSec: number;
 cameraStatusRefreshSec: number;
 systemRefreshSec: number;
 recordingRetentionDays: number;
 snapshotRetentionDays: number;
 defaultStreamQuality: string;
 autoRecord: boolean;
};
export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
 platformName: "Smart Camera Platform",
 patrolIntervalSec: 10,
 cameraStatusRefreshSec: 10,
 systemRefreshSec: 5,
 recordingRetentionDays: 30,
 snapshotRetentionDays: 30,
 defaultStreamQuality: "main",
 autoRecord: false,
};
export function usePlatformSettings() {
 const [settings, setSettings] =
   useState<PlatformSettings>(DEFAULT_PLATFORM_SETTINGS);
 const [loading, setLoading] = useState(true);
 const loadSettings = useCallback(async () => {
   try {
     const response = await fetch("/api/settings", {
       cache: "no-store",
     });
     if (!response.ok) {
       throw new Error(
         `Settings API returned HTTP ${response.status}`
       );
     }
     const data = await response.json();
     if (!data?.ok || !data?.settings) {
       throw new Error("Settings API returned invalid data.");
     }
     setSettings({
       platformName:
         data.settings.platformName ??
         DEFAULT_PLATFORM_SETTINGS.platformName,
       patrolIntervalSec:
         data.settings.patrolIntervalSec ??
         DEFAULT_PLATFORM_SETTINGS.patrolIntervalSec,
       cameraStatusRefreshSec:
         data.settings.cameraStatusRefreshSec ??
         DEFAULT_PLATFORM_SETTINGS.cameraStatusRefreshSec,
       systemRefreshSec:
         data.settings.systemRefreshSec ??
         DEFAULT_PLATFORM_SETTINGS.systemRefreshSec,
       recordingRetentionDays:
         data.settings.recordingRetentionDays ??
         DEFAULT_PLATFORM_SETTINGS.recordingRetentionDays,
       snapshotRetentionDays:
         data.settings.snapshotRetentionDays ??
         DEFAULT_PLATFORM_SETTINGS.snapshotRetentionDays,
       defaultStreamQuality:
         data.settings.defaultStreamQuality ??
         DEFAULT_PLATFORM_SETTINGS.defaultStreamQuality,
       autoRecord:
         data.settings.autoRecord ??
         DEFAULT_PLATFORM_SETTINGS.autoRecord,
     });
   } catch (error) {
     console.error("Unable to load platform settings:", error);
     // Keep safe defaults if settings API is unavailable.
     setSettings(DEFAULT_PLATFORM_SETTINGS);
   } finally {
     setLoading(false);
   }
 }, []);
 useEffect(() => {
   void loadSettings();
 }, [loadSettings]);
 return {
   settings,
   loading,
   reloadSettings: loadSettings,
 };
}