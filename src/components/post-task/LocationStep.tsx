
"use client";
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MapPin, Smartphone, Loader2, Navigation } from 'lucide-react';
import { toast } from 'sonner';
import {
  formatNominatimNepalAddress,
  searchNominatimNepal,
  shortenNominatimDisplayName,
  type NominatimPlace,
} from '@/lib/nepalLocale';
import { locationService, type City } from '@/services/location.service';
import {
  postTaskLabel,
  postTaskInputMd,
  postTaskInputError,
  postTaskErrorText,
  postTaskCardActive,
  postTaskCardInactive,
} from '@/components/post-task/postTaskStyles';
import { landingHeadline } from '@/components/LangingHome/landingTypography';

export interface TaskData {
  title: string;
  categoryId: string;
  categoryName: string;
  dateType: 'specific' | 'before' | 'flexible' | '';
  specificDate: string;
  beforeDate: string;
  timeOfDayRequired: boolean;
  timeSlot: 'morning' | 'midday' | 'afternoon' | 'evening' | null;
  location: string;
  locationType: 'in-person' | 'remote';
  latitude?: number;
  longitude?: number;
  details: string;
  budgetType: 'total' | 'hourly';
  budgetAmount: number;
  images: File[];
}

interface LocationStepProps {
  data: TaskData;
  updateData: (updates: Partial<TaskData>) => void;
  showErrors?: boolean;
  errors?: Partial<Record<'location', string>>;
}

export const LocationStep: React.FC<LocationStepProps> = ({ data, updateData, showErrors, errors }) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [suggestions, setSuggestions] = useState<NominatimPlace[]>([]);
  const [citySuggestions, setCitySuggestions] = useState<City[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const searchAbortRef = useRef<AbortController | null>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const suggestionsListId = 'location-suggestions';
  const showLocationError = Boolean(showErrors && errors?.location);

  const clearCoordinates = useCallback(() => {
    updateData({ latitude: undefined, longitude: undefined });
  }, [updateData]);

  const selectSuggestion = useCallback(
    (place: NominatimPlace) => {
      const latitude = Number(parseFloat(place.lat).toFixed(6));
      const longitude = Number(parseFloat(place.lon).toFixed(6));
      updateData({
        location: shortenNominatimDisplayName(place.display_name),
        latitude,
        longitude,
      });
      setSuggestions([]);
      setCitySuggestions([]);
      setShowSuggestions(false);
      setHighlightIndex(-1);
    },
    [updateData]
  );

  const selectCity = useCallback(
    (city: City) => {
      const label = [city.name, city.state_name].filter(Boolean).join(', ');
      updateData({
        location: label,
        latitude: city.latitude,
        longitude: city.longitude,
      });
      setSuggestions([]);
      setCitySuggestions([]);
      setShowSuggestions(false);
      setHighlightIndex(-1);
    },
    [updateData]
  );

  useEffect(() => {
    if (data.locationType !== 'in-person') {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const query = data.location.trim();
    if (query.length < 3) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    const timer = window.setTimeout(async () => {
      searchAbortRef.current?.abort();
      const controller = new AbortController();
      searchAbortRef.current = controller;
      setIsSearching(true);

      try {
        const [results, cities] = await Promise.all([
          searchNominatimNepal(query, { limit: 6, signal: controller.signal }),
          locationService.searchCities({ query, country_code: 'NP', limit: 6 }),
        ]);
        if (!controller.signal.aborted) {
          setSuggestions(results);
          setCitySuggestions(cities);
          setShowSuggestions(results.length > 0 || cities.length > 0);
          setHighlightIndex(-1);
        }
      } catch {
        if (!controller.signal.aborted) {
          setSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false);
        }
      }
    }, 400);

    return () => {
      window.clearTimeout(timer);
      searchAbortRef.current?.abort();
    };
  }, [data.location, data.locationType]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        locationInputRef.current &&
        !locationInputRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest('[data-location-suggestions]')
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // When switching to remote, set a default location value
  const handleLocationTypeChange = (type: 'in-person' | 'remote') => {
    if (type === 'remote') {
      updateData({ locationType: type, location: 'Remote' });
    } else {
      updateData({ locationType: type, location: '' });
    }
  };

  // Auto-detect user's current location
  const handleDetectLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsDetecting(true);
    toast.info('Detecting your location...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        // Backend stores lat/lng as DecimalField(decimal_places=6).
        // Round here so downstream code never has to.
        const latitude = Number(position.coords.latitude.toFixed(6));
        const longitude = Number(position.coords.longitude.toFixed(6));

        try {
          // Use reverse geocoding to get address from coordinates
          // Using OpenStreetMap Nominatim API (free, no API key required)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&countrycodes=np`,
            {
              headers: {
                'Accept-Language': 'en',
              },
            }
          );

          if (!response.ok) {
            throw new Error('Failed to get location details');
          }

          const geo = await response.json();
          const location = formatNominatimNepalAddress(geo.address);

          updateData({
            location,
            latitude,
            longitude,
          });
          toast.success(`Location detected: ${location}`);
        } catch (error) {
          console.error('Reverse geocoding error:', error);
          toast.error('Could not determine your location address');
        } finally {
          setIsDetecting(false);
        }
      },
      (error) => {
        setIsDetecting(false);
        
        let errorMessage = 'Could not detect your location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access in your browser.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        
        toast.error(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const cardClass = (active: boolean) =>
    `flex-1 cursor-pointer rounded-xl px-3 py-3 text-center transition-all sm:px-4 sm:py-4 ${
      active ? postTaskCardActive : postTaskCardInactive
    }`;

  return (
    <div className="w-full">
      <h1 className={`${landingHeadline} mb-1 text-xl leading-tight text-[#000d45] sm:text-2xl`}>
        Tell us where
      </h1>
      <p className="mb-4 font-body text-xs text-[#6a719a] sm:mb-5 sm:text-sm">
        Choose whether the tasker needs to be on-site or can work remotely.
      </p>

      <div className="w-full max-w-md space-y-4 sm:max-w-lg sm:space-y-5">
        <div className="flex gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => handleLocationTypeChange('in-person')}
            className={cardClass(data.locationType === 'in-person')}
          >
            <MapPin
              className={`mx-auto mb-2 h-5 w-5 ${
                data.locationType === 'in-person' ? 'text-white' : 'text-primary'
              }`}
            />
            <div className="mb-0.5 font-formula text-sm font-bold sm:text-base">In-person</div>
            <div
              className={`font-body text-[11px] font-medium leading-snug sm:text-xs ${
                data.locationType === 'in-person' ? 'text-white/80' : 'text-[#6a719a]'
              }`}
            >
              Tasker needs to be physically there
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleLocationTypeChange('remote')}
            className={cardClass(data.locationType === 'remote')}
          >
            <Smartphone
              className={`mx-auto mb-2 h-5 w-5 ${
                data.locationType === 'remote' ? 'text-white' : 'text-primary'
              }`}
            />
            <div className="mb-0.5 font-formula text-sm font-bold sm:text-base">Online</div>
            <div
              className={`font-body text-[11px] font-medium leading-snug sm:text-xs ${
                data.locationType === 'remote' ? 'text-white/80' : 'text-[#6a719a]'
              }`}
            >
              Tasker can do it from home
            </div>
          </button>
        </div>

        {data.locationType === 'in-person' && (
          <div className="space-y-2">
            <label className={`${postTaskLabel} block`}>
              Where in Nepal do you need this done?
            </label>
            <div className="relative" ref={locationInputRef}>
              <MapPin className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[#8a96b0]" />
              <input
                type="text"
                role="combobox"
                aria-expanded={showSuggestions}
                aria-controls={suggestionsListId}
                aria-autocomplete="list"
                autoComplete="off"
                className={`${postTaskInputMd} py-3 pl-9 pr-11 ${
                  showLocationError ? postTaskInputError : ''
                }`}
                placeholder="e.g. Kalimati, Kathmandu or Lalitpur"
                value={data.location}
                onChange={(e) => {
                  updateData({ location: e.target.value });
                  clearCoordinates();
                  setShowSuggestions(true);
                }}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                onKeyDown={(e) => {
                  if (!showSuggestions || suggestions.length === 0) return;

                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setHighlightIndex((i) =>
                      i < suggestions.length - 1 ? i + 1 : 0
                    );
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setHighlightIndex((i) =>
                      i > 0 ? i - 1 : suggestions.length - 1
                    );
                  } else if (e.key === 'Enter' && highlightIndex >= 0) {
                    e.preventDefault();
                    selectSuggestion(suggestions[highlightIndex]);
                  } else if (e.key === 'Escape') {
                    setShowSuggestions(false);
                    setHighlightIndex(-1);
                  }
                }}
              />
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={isDetecting}
                className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-primary transition-colors hover:text-[#0052d9] disabled:text-[#8a96b0]"
                title="Detect my location"
              >
                {isDetecting || isSearching ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Navigation className="h-5 w-5" />
                )}
              </button>

              {showSuggestions && (citySuggestions.length > 0 || suggestions.length > 0) && (
                <ul
                  id={suggestionsListId}
                  role="listbox"
                  data-location-suggestions
                  className="absolute left-0 right-0 top-full z-20 mt-1.5 max-h-56 overflow-y-auto rounded-xl bg-white py-1.5 shadow-xl shadow-[#000d45]/8"
                >
                  {citySuggestions.map((city) => (
                    <li key={`city-${city.id}`} role="option">
                      <button
                        type="button"
                        className="flex w-full items-start gap-2.5 px-3 py-2.5 text-left font-body text-sm text-[#000d45] transition-colors hover:bg-gray-50"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => selectCity(city)}
                      >
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span className="leading-snug">
                          {[city.name, city.state_name].filter(Boolean).join(', ')}
                        </span>
                      </button>
                    </li>
                  ))}
                  {suggestions.map((place, index) => (
                    <li key={place.place_id} role="option" aria-selected={index === highlightIndex}>
                      <button
                        type="button"
                        className={`flex w-full items-start gap-2.5 px-3 py-2.5 text-left font-body text-sm transition-colors ${
                          index === highlightIndex
                            ? 'bg-[#eef4ff] text-[#000d45]'
                            : 'text-[#000d45] hover:bg-gray-50'
                        }`}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => selectSuggestion(place)}
                        onMouseEnter={() => setHighlightIndex(index)}
                      >
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span className="leading-snug">
                          {shortenNominatimDisplayName(place.display_name, 4)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {showSuggestions &&
                !isSearching &&
                data.location.trim().length >= 3 &&
                suggestions.length === 0 && (
                  <div
                    data-location-suggestions
                    className="absolute left-0 right-0 top-full z-20 mt-1.5 rounded-xl bg-white px-3 py-2.5 font-body text-xs text-[#6a719a] shadow-lg"
                  >
                    No addresses found. Try a nearby area or ward name.
                  </div>
                )}
            </div>
            <p className="flex items-center gap-1.5 font-body text-xs text-[#6a719a]">
              <Navigation className="h-3.5 w-3.5 shrink-0 text-primary" />
              Start typing for suggestions, or use the icon to detect your location
            </p>
            {showLocationError && (
              <p className={postTaskErrorText}>{errors?.location}</p>
            )}
          </div>
        )}
        
        {data.locationType === 'remote' && (
          <div className="rounded-xl bg-gray-50 px-3 py-3 sm:px-4 sm:py-3.5">
            <p className="font-body text-xs font-medium text-[#6a719a] sm:text-sm">
              This task can be completed remotely. No physical location required.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
