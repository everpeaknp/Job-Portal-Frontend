import { haversineKm } from '@/lib/taskFilters';

export type LatLng = { lat: number; lng: number };

const roadDistanceCache = new Map<string, number>();
const inFlightRequests = new Map<string, Promise<number | null>>();

const OSRM_ROUTE_TIMEOUT_MS = 12_000;
const OSRM_QUEUE_GAP_MS = 120;

const OSRM_ENDPOINTS = [
  'https://routing.openstreetmap.de/routed-car/route/v1/driving',
  'https://router.project-osrm.org/route/v1/driving',
] as const;

let osrmQueue: Promise<void> = Promise.resolve();

function cacheKey(from: LatLng, to: LatLng): string {
  return `${from.lat},${from.lng}->${to.lat},${to.lng}`;
}

export function isValidLatLng(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    !(lat === 0 && lng === 0)
  );
}

export function straightLineDistanceKm(from: LatLng, to: LatLng): number | null {
  if (!isValidLatLng(from.lat, from.lng) || !isValidLatLng(to.lat, to.lng)) {
    return null;
  }
  return haversineKm(from.lat, from.lng, to.lat, to.lng);
}

function buildOsrmUrl(base: string, from: LatLng, to: LatLng): string {
  return `${base}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=false`;
}

function enqueueOsrm<T>(fn: () => Promise<T>): Promise<T> {
  const run = osrmQueue.then(async () => {
    await new Promise((resolve) => window.setTimeout(resolve, OSRM_QUEUE_GAP_MS));
    return fn();
  });
  osrmQueue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

async function fetchOsrmDistanceKm(url: string): Promise<number | null> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), OSRM_ROUTE_TIMEOUT_MS);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      code?: string;
      routes?: Array<{ distance?: number }>;
    };
    if (data.code !== 'Ok' || !data.routes?.[0]?.distance) return null;

    return data.routes[0].distance / 1000;
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeout);
  }
}

async function fetchRoadDistanceKmInternal(from: LatLng, to: LatLng): Promise<number | null> {
  for (const base of OSRM_ENDPOINTS) {
    const km = await enqueueOsrm(() => fetchOsrmDistanceKm(buildOsrmUrl(base, from, to)));
    if (km != null) return km;
  }
  return null;
}

/**
 * Driving distance in km via OSRM (road network). Falls back to straight-line km.
 */
export async function fetchRoadDistanceKm(from: LatLng, to: LatLng): Promise<number | null> {
  if (!isValidLatLng(from.lat, from.lng) || !isValidLatLng(to.lat, to.lng)) {
    return null;
  }

  const key = cacheKey(from, to);
  const cached = roadDistanceCache.get(key);
  if (cached != null) return cached;

  const inFlight = inFlightRequests.get(key);
  if (inFlight) return inFlight;

  const request = (async () => {
    const roadKm = await fetchRoadDistanceKmInternal(from, to);
    const km = roadKm ?? straightLineDistanceKm(from, to);
    if (km != null) roadDistanceCache.set(key, km);
    return km;
  })().finally(() => {
    inFlightRequests.delete(key);
  });

  inFlightRequests.set(key, request);
  return request;
}

export function formatRoadDistanceKm(km: number): string {
  if (km < 1) return `${Math.max(0.1, Math.round(km * 10) / 10)} km away`;
  if (km < 10) return `${km.toFixed(1)} km away`;
  return `${Math.round(km)} km away`;
}
