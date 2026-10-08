"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Material } from "@/lib/api/faculty-materials-meta";
import {
  isLocalMaterial,
  mergeMaterials,
  readLocalMaterials,
  readVisibilityOverrides,
  writeLocalMaterials,
  writeVisibilityOverrides,
  type VisibilityOverrides,
} from "./utils";

// The browser-side half of the materials data, shared by the library and the
// course tree so the two can never drift apart.
//
// Both stores are read after mount only: until then the seed data renders
// exactly as the server sent it, which is what keeps hydration clean.

export function useMaterialsStore(serverMaterials: Material[]) {
  const [locals, setLocals] = useState<Material[]>([]);
  const [overrides, setOverrides] = useState<VisibilityOverrides>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLocals(readLocalMaterials());
    setOverrides(readVisibilityOverrides());
    setLoaded(true);
  }, []);

  const materials = useMemo(
    () => mergeMaterials(serverMaterials, locals, overrides),
    [serverMaterials, locals, overrides],
  );

  // Works for seed material as well as local uploads: the seed file is never
  // touched, the change is recorded as an override beside it.
  const toggleVisibility = useCallback((material: Material) => {
    const next: Material["visibility"] =
      material.visibility === "published" ? "hidden" : "published";
    setOverrides((current) => {
      const updated = { ...current, [material.id]: next };
      writeVisibilityOverrides(updated);
      return updated;
    });
  }, []);

  const addLocal = useCallback((material: Material) => {
    setLocals((current) => {
      const updated = [material, ...current];
      writeLocalMaterials(updated);
      return updated;
    });
  }, []);

  // Only local uploads can be deleted; seed material has no delete path.
  const deleteLocal = useCallback((material: Material) => {
    if (!isLocalMaterial(material)) return;
    setLocals((current) => {
      const updated = current.filter((m) => m.id !== material.id);
      writeLocalMaterials(updated);
      return updated;
    });
    setOverrides((current) => {
      if (!(material.id in current)) return current;
      const updated = { ...current };
      delete updated[material.id];
      writeVisibilityOverrides(updated);
      return updated;
    });
  }, []);

  return { materials, loaded, toggleVisibility, addLocal, deleteLocal };
}
