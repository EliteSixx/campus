"use client";

import { useEffect, useState } from "react";
import type { Material } from "@/lib/api/faculty-materials-meta";
import { readLocalMaterials } from "@/components/faculty/materials/utils";
import {
  readLocalAnnouncements,
  type LocalAnnouncement,
} from "@/components/faculty/announcements/utils";
import { DELIVERED_KEY, READ_KEY, readStringArray } from "./utils";

// Everything the dashboard needs that only this browser knows: what other
// faculty pages saved to localStorage, and the current time.
//
// Both are read after mount only. Until then every list is empty and `now` is
// null, so the first client render is the server HTML exactly.

export interface DashboardLocalData {
  loaded: boolean;
  now: Date | null;
  readIds: string[];
  deliveredKeys: string[];
  localMaterials: Material[];
  localAnnouncements: LocalAnnouncement[];
}

interface StoredData {
  loaded: boolean;
  readIds: string[];
  deliveredKeys: string[];
  localMaterials: Material[];
  localAnnouncements: LocalAnnouncement[];
}

const EMPTY: StoredData = {
  loaded: false,
  readIds: [],
  deliveredKeys: [],
  localMaterials: [],
  localAnnouncements: [],
};

const isString = (v: unknown): v is string => typeof v === "string";

// The readers in the materials and announcements utils only check for an
// array, so each item is checked here for the fields the dashboard reads.
function validMaterials(items: Material[]): Material[] {
  return items.filter(
    (m: unknown) =>
      typeof m === "object" &&
      m !== null &&
      isString((m as Material).courseId) &&
      ((m as Material).topicId === null || isString((m as Material).topicId)),
  );
}

function validAnnouncements(items: LocalAnnouncement[]): LocalAnnouncement[] {
  return items.filter((a: unknown) => {
    if (typeof a !== "object" || a === null) return false;
    const item = a as LocalAnnouncement;
    return (
      isString(item.id) &&
      isString(item.title) &&
      isString(item.createdAt) &&
      isString(item.status) &&
      (item.publishAt === null || isString(item.publishAt))
    );
  });
}

export function useDashboardLocalData(): DashboardLocalData {
  const [stored, setStored] = useState<StoredData>(EMPTY);
  const [now, setNow] = useState<Date | null>(null);

  // Storage: read once. Each reader has its own try/catch, so one bad key
  // falls back to empty without taking the others with it.
  useEffect(() => {
    let localMaterials: Material[] = [];
    let localAnnouncements: LocalAnnouncement[] = [];
    try {
      localMaterials = validMaterials(readLocalMaterials());
    } catch (e) {
      console.error("Failed to read local materials", e);
    }
    try {
      localAnnouncements = validAnnouncements(readLocalAnnouncements());
    } catch (e) {
      console.error("Failed to read local announcements", e);
    }

    setStored({
      loaded: true,
      readIds: readStringArray(READ_KEY),
      deliveredKeys: readStringArray(DELIVERED_KEY),
      localMaterials,
      localAnnouncements,
    });
  }, []);

  // Clock: set on mount, then once a minute.
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  return { ...stored, now };
}
