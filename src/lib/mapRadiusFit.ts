import L from 'leaflet';
import type { Map as LeafletMap } from 'leaflet';
import { DEFAULT_TASK_RADIUS_KM, zoomLevelForRadiusKm } from '@/lib/userGeolocation';

/** Radius used for map viewport (filter may use 100 = any distance). */
export function resolveMapRadiusKm(radiusKm?: number | null): number {
  if (radiusKm == null || radiusKm <= 0 || radiusKm >= 100) {
    return DEFAULT_TASK_RADIUS_KM;
  }
  return radiusKm;
}

export function boundsForRadiusKm(
  center: [number, number],
  radiusKm: number
): L.LatLngBounds {
  const [lat, lng] = center;
  const radiusM = radiusKm * 1000;
  const latDelta = (radiusM / 6378137) * (180 / Math.PI);
  const lngDelta = latDelta / Math.cos((lat * Math.PI) / 180);
  return L.latLngBounds(
    [lat - latDelta, lng - lngDelta],
    [lat + latDelta, lng + lngDelta]
  );
}

/** Zoom map so a radius circle fills the panel; returns false if the map is not sized yet. */
export function fitMapToRadiusKm(
  map: LeafletMap,
  center: [number, number],
  radiusKm: number
): boolean {
  try {
    const container = map.getContainer();
    if (!container?.isConnected) return false;

    map.invalidateSize({ animate: false });
    const size = map.getSize();
    const width = size.x > 0 ? size.x : container.clientWidth;
    const height = size.y > 0 ? size.y : container.clientHeight;
    if (width < 80 || height < 80) return false;

    const bounds = boundsForRadiusKm(center, radiusKm);
    map.fitBounds(bounds, {
      padding: [12, 12],
      animate: false,
      maxZoom: 15,
    });

    return true;
  } catch {
    try {
      const spanPx = Math.min(
        map.getSize().x || map.getContainer().clientWidth,
        map.getSize().y || map.getContainer().clientHeight
      );
      const zoom = zoomLevelForRadiusKm(radiusKm, center[0], spanPx * 0.88);
      map.setView(center, zoom, { animate: false });
      return true;
    } catch {
      return false;
    }
  }
}

const RADIUS_FIT_RETRY_MS = [0, 100, 250, 500, 900, 1500, 2500, 4000, 5500];

/** Keep trying until the map panel is sized and the radius fit succeeds (once per schedule). */
export function scheduleMapRadiusFit(
  map: LeafletMap,
  center: [number, number],
  radiusKm: number,
  shouldSkip: () => boolean
): () => void {
  let cancelled = false;
  let fittedOnce = false;
  const timers: number[] = [];

  const clearTimers = () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.length = 0;
  };

  const run = () => {
    if (cancelled || fittedOnce || shouldSkip()) return;
    if (fitMapToRadiusKm(map, center, radiusKm)) {
      fittedOnce = true;
      clearTimers();
    }
  };

  const onResize = () => {
    if (!fittedOnce && !shouldSkip()) run();
  };

  map.whenReady(() => {
    if (cancelled) return;
    run();
    RADIUS_FIT_RETRY_MS.forEach((ms) => {
      timers.push(window.setTimeout(run, ms));
    });
  });

  map.on('resize', onResize);
  window.addEventListener('resize', onResize);

  const container = map.getContainer();
  const resizeObserver =
    typeof ResizeObserver !== 'undefined' && container
      ? new ResizeObserver(() => onResize())
      : null;
  if (resizeObserver && container) {
    resizeObserver.observe(container);
  }

  return () => {
    cancelled = true;
    clearTimers();
    map.off('resize', onResize);
    window.removeEventListener('resize', onResize);
    resizeObserver?.disconnect();
  };
}
