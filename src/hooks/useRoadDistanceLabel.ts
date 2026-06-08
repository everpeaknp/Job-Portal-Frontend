'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  fetchRoadDistanceKm,
  formatRoadDistanceKm,
  isValidLatLng,
  straightLineDistanceKm,
  type LatLng,
} from '@/lib/roadDistance';

function toLatLng(pair: [number, number] | null | undefined): LatLng | null {
  if (!pair) return null;
  const [lat, lng] = pair;
  if (!isValidLatLng(lat, lng)) return null;
  return { lat, lng };
}

/** Straight-line distance label — safe to call during render. */
export function getStraightDistanceLabel(
  userCenter: [number, number] | null | undefined,
  taskCoordinates: [number, number] | null | undefined
): string | null {
  const from = toLatLng(userCenter);
  const to = toLatLng(taskCoordinates);
  if (!from || !to) return null;
  const km = straightLineDistanceKm(from, to);
  return km != null ? formatRoadDistanceKm(km) : null;
}

export function useRoadDistanceLabel(
  userCenter: [number, number] | null | undefined,
  taskCoordinates: [number, number] | null | undefined
): { label: string | null; loading: boolean } {
  const from = toLatLng(userCenter);
  const to = toLatLng(taskCoordinates);

  const straightLabel = useMemo(() => {
    if (!from || !to) return null;
    const km = straightLineDistanceKm(from, to);
    return km != null ? formatRoadDistanceKm(km) : null;
  }, [from?.lat, from?.lng, to?.lat, to?.lng]);

  const [roadLabel, setRoadLabel] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!from || !to) {
      setRoadLabel(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setRoadLabel(null);
    setLoading(true);

    void fetchRoadDistanceKm(from, to).then((km) => {
      if (cancelled) return;
      setLoading(false);
      if (km == null) return;
      setRoadLabel(formatRoadDistanceKm(km));
    });

    return () => {
      cancelled = true;
      setLoading(false);
    };
  }, [from?.lat, from?.lng, to?.lat, to?.lng]);

  return {
    label: roadLabel ?? straightLabel,
    loading: loading && !straightLabel,
  };
}
