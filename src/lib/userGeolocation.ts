export const DEFAULT_TASK_RADIUS_KM = 15;



export const KATHMANDU_CENTER = {

  lat: 27.7172,

  lng: 85.324,

} as const;



export type GeolocationErrorCode =

  | 'unsupported'

  | 'insecure'

  | 'denied'

  | 'unavailable'

  | 'timeout';



export type UserGeolocationResult =

  | { success: true; lat: number; lng: number }

  | { success: false; error: GeolocationErrorCode };



/** Leaflet zoom level that fits a radius circle in the current map panel. */
export function zoomLevelForRadiusKm(
  radiusKm: number,
  latitude: number,
  mapWidthPx = 720
): number {
  const latRad = (latitude * Math.PI) / 180;
  const metersPerPixelAtZoom0 = 156543.03392 * Math.cos(latRad);
  const diameterM = radiusKm * 2 * 1000 * 0.92;
  const spanPx = Math.max(mapWidthPx, 200);
  const metersPerPixel = diameterM / spanPx;
  const zoom = Math.log2(metersPerPixelAtZoom0 / metersPerPixel);
  return Math.max(11, Math.min(15, Math.round(zoom)));
}



export function geolocationFailureMessage(error: GeolocationErrorCode): string {

  switch (error) {

    case 'unsupported':

      return 'Your browser does not support location detection.';

    case 'insecure':

      return 'Location only works on HTTPS or localhost. Open the site securely and try again.';

    case 'denied':

      return 'Location access was blocked. Allow location for this site in your browser settings, then try again.';

    case 'timeout':

      return 'Location request timed out. Check that Windows location services are on, then try again.';

    case 'unavailable':

    default:

      return 'Could not detect your location. Enable device location services and try again.';

  }

}



function getCurrentPosition(options: PositionOptions): Promise<GeolocationPosition> {

  return new Promise((resolve, reject) => {

    navigator.geolocation.getCurrentPosition(resolve, reject, options);

  });

}



function mapGeolocationError(error: unknown): GeolocationErrorCode {

  const code = (error as GeolocationPositionError | undefined)?.code;

  if (code === 1) return 'denied';

  if (code === 2) return 'unavailable';

  if (code === 3) return 'timeout';

  return 'unavailable';

}



/** Browser geolocation with cache-first then high-accuracy retry. */

export async function requestUserGeolocationDetailed(): Promise<UserGeolocationResult> {

  if (typeof navigator === 'undefined' || !navigator.geolocation) {

    return { success: false, error: 'unsupported' };

  }



  if (typeof window !== 'undefined' && !window.isSecureContext) {

    return { success: false, error: 'insecure' };

  }



  try {

    const cached = await getCurrentPosition({

      enableHighAccuracy: false,

      timeout: 6000,

      maximumAge: 300_000,

    });

    return {

      success: true,

      lat: cached.coords.latitude,

      lng: cached.coords.longitude,

    };

  } catch {

    /* try high-accuracy next */

  }



  try {

    const precise = await getCurrentPosition({

      enableHighAccuracy: true,

      timeout: 20_000,

      maximumAge: 0,

    });

    return {

      success: true,

      lat: precise.coords.latitude,

      lng: precise.coords.longitude,

    };

  } catch (error) {

    return { success: false, error: mapGeolocationError(error) };

  }

}



/** Browser geolocation; returns null when unavailable or denied. */

export async function requestUserGeolocation(): Promise<{ lat: number; lng: number } | null> {

  const result = await requestUserGeolocationDetailed();

  return result.success ? { lat: result.lat, lng: result.lng } : null;

}


