import { useState, useCallback, useRef } from 'react';
import { Search, MapPin, Navigation, Loader2, AlertCircle, Map, List } from 'lucide-react';
import { cn } from '../../utils/cn';
import { searchNearbyCentres } from '../../services/overpassService';
import { getCurrentPosition, geocodeLocation } from '../../services/geocodingService';
import { MedicalCentreMap } from './MedicalCentreMap';
import { MedicalCentreCard } from './MedicalCentreCard';

const RADIUS_OPTIONS = [5, 10, 25];

const ERROR_MESSAGES = {
  LOCATION_DENIED: {
    title: 'Location access was blocked',
    message: 'You can enable it in your browser settings or search using your city or PIN code.',
  },
  LOCATION_UNAVAILABLE: {
    title: 'Location unavailable',
    message: 'We could not access your location. Enter your city, area or PIN code instead.',
  },
  LOCATION_TIMEOUT: {
    title: 'Your location took too long to load',
    message: 'Please try again or enter your location manually.',
  },
  LOCATION_NOT_SUPPORTED: {
    title: 'Location not supported',
    message: 'Your browser does not support location services. Please search manually.',
  },
  SERVICE_ERROR: {
    title: 'The medical-centre service is temporarily unavailable',
    message: 'Please try again or search directly on Maps.',
  },
};

function getCachedState() {
  try {
    const cached = sessionStorage.getItem('medical_centres_cache');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < 300000) {
        return { centres: parsed.centres, userLocation: parsed.userLocation };
      }
    }
  } catch {
    // ignore invalid cache
  }
  return null;
}

export function MedicalCentreFinder({ className }) {
  const [state, setState] = useState(() => {
    const cached = getCachedState();
    return cached ? 'results' : 'idle';
  });
  const [centres, setCentres] = useState(() => {
    const cached = getCachedState();
    return cached ? cached.centres : [];
  });
  const [userLocation, setUserLocation] = useState(() => {
    const cached = getCachedState();
    return cached ? cached.userLocation : null;
  });
  const [radius, setRadius] = useState(10);
  const [manualQuery, setManualQuery] = useState('');
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('both');
  const [selectedCentre, setSelectedCentre] = useState(null);
  const searchInProgress = useRef(false);

  const handleSearch = useCallback(async (lat, lon, searchRadius) => {
    if (searchInProgress.current) return;
    searchInProgress.current = true;
    setState('loading');
    setError(null);
    setSelectedCentre(null);

    try {
      const results = await searchNearbyCentres(lat, lon, searchRadius);
      setCentres(results);
      setUserLocation({ lat, lon });
      setState('results');

      sessionStorage.setItem('medical_centres_cache', JSON.stringify({
        centres: results,
        userLocation: { lat, lon },
        timestamp: Date.now(),
      }));
    } catch {
      setError(ERROR_MESSAGES.SERVICE_ERROR);
      setState('error');
    } finally {
      searchInProgress.current = false;
    }
  }, []);

  const handleAutoLocation = useCallback(async () => {
    setState('loading');
    setError(null);

    try {
      const position = await getCurrentPosition();
      await handleSearch(position.lat, position.lon, radius);
    } catch (err) {
      const errorKey = err.message || 'SERVICE_ERROR';
      setError(ERROR_MESSAGES[errorKey] || ERROR_MESSAGES.SERVICE_ERROR);
      setState('error');
    }
  }, [radius, handleSearch]);

  const handleManualSearch = useCallback(async () => {
    if (!manualQuery.trim()) return;

    setState('loading');
    setError(null);

    try {
      const geoResult = await geocodeLocation(manualQuery);
      await handleSearch(geoResult.lat, geoResult.lon, radius);
    } catch (err) {
      setError({
        title: 'Could not find that location',
        message: err.message || 'Try a different search term.',
      });
      setState('error');
    }
  }, [manualQuery, radius, handleSearch]);

  const handleRadiusChange = useCallback((newRadius) => {
    setRadius(newRadius);
    if (userLocation) {
      handleSearch(userLocation.lat, userLocation.lon, newRadius);
    }
  }, [userLocation, handleSearch]);

  const handleRetry = useCallback(() => {
    if (userLocation) {
      handleSearch(userLocation.lat, userLocation.lon, radius);
    } else {
      setState('idle');
    }
  }, [userLocation, radius, handleSearch]);

  return (
    <section className={cn("rounded-3xl bg-card border border-border overflow-hidden shadow-soft", className)} role="region" aria-label="Find Medical Centres">
      <div className="p-5 md:p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-bold text-ink leading-tight">Find Medical Centres Near You</h2>
            <p className="text-xs text-ink-muted truncate">
              Hospitals, clinics, and diagnostics near you.
            </p>
          </div>
        </div>

        {state === 'idle' && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleAutoLocation}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-white rounded-2xl font-semibold hover:bg-primary-dark transition-all shadow-glow hover:shadow-lg"
            >
              <Navigation className="w-4 h-4" />
              Find Medical Centres Near Me
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-ink/10" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-3 text-ink-muted">or search manually</span>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                <input
                  type="text"
                  value={manualQuery}
                  onChange={(e) => setManualQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
                  placeholder="Enter city, area, or PIN code..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  aria-label="Search location"
                />
              </div>
              <button
                type="button"
                onClick={handleManualSearch}
                disabled={!manualQuery.trim()}
                className="px-5 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Search
              </button>
            </div>
          </div>
        )}

        {state === 'loading' && (
          <div className="flex flex-col items-center justify-center py-12 gap-3" aria-live="polite">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm font-medium text-ink-muted">Finding medical centres near you...</p>
            <p className="text-xs text-ink-muted">This may take a moment while we check available services.</p>
          </div>
        )}

        {state === 'error' && error && (
          <div className="rounded-2xl border border-danger/20 bg-danger/5 p-5" role="alert">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-ink text-sm">{error.title}</p>
                <p className="text-sm text-ink-muted mt-1">{error.message}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors"
                  >
                    Retry
                  </button>
                  <button
                    type="button"
                    onClick={() => setState('idle')}
                    className="px-4 py-2 rounded-xl border border-border text-ink text-sm font-semibold hover:bg-surface transition-colors"
                  >
                    Change Location
                  </button>
                  <a
                    href="https://www.google.com/maps/search/hospitals+near+me"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl border border-border text-ink text-sm font-semibold hover:bg-surface transition-colors inline-flex items-center gap-1"
                  >
                    Open External Map
                    <span className="text-ink-muted text-xs" aria-hidden="true">&#8599;</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {state === 'results' && centres.length === 0 && (
          <div className="text-center py-8">
            <MapPin className="w-10 h-10 text-ink-muted mx-auto mb-3" />
            <p className="font-semibold text-ink">No medical centres found</p>
            <p className="text-sm text-ink-muted mt-1">
              We could not find a listed medical centre within {radius} km. Try increasing the search radius or try a nearby area.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {radius < 25 && (
                <button
                  type="button"
                  onClick={() => handleRadiusChange(25)}
                  className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors"
                >
                  Search 25 km
                </button>
              )}
              <button
                type="button"
                onClick={() => setState('idle')}
                className="px-4 py-2 rounded-xl border border-border text-ink text-sm font-semibold hover:bg-surface transition-colors"
              >
                Try Different Location
              </button>
            </div>
          </div>
        )}

        {state === 'results' && centres.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5" role="group" aria-label="Search radius">
                {RADIUS_OPTIONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleRadiusChange(r)}
                    aria-pressed={radius === r}
                    className={cn(
                      'px-2.5 py-1 rounded-full text-xs font-semibold transition-colors',
                      radius === r
                        ? 'bg-primary text-white shadow-sm'
                        : 'border border-border bg-transparent text-ink-muted hover:text-ink hover:bg-surface'
                    )}
                  >
                    {r} km
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1" role="group" aria-label="View mode">
                {[
                  { mode: 'both', label: 'Show map and list', icons: [Map, List] },
                  { mode: 'map', label: 'Show map only', icons: [Map] },
                  { mode: 'list', label: 'Show list only', icons: [List] },
                ].map(({ mode, label, icons }) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setViewMode(mode)}
                    aria-label={label}
                    aria-pressed={viewMode === mode}
                    className={cn(
                      'px-2 py-1 rounded-full text-xs font-semibold transition-colors',
                      viewMode === mode
                        ? 'bg-primary text-white shadow-sm'
                        : 'border border-border bg-transparent text-ink-muted hover:text-ink hover:bg-surface'
                    )}
                  >
                    <span className="flex items-center gap-0.5">
                      {icons.map((Icon, i) => (
                        <Icon key={i} className="w-3 h-3" />
                      ))}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs text-ink-muted">
              Found {centres.length} medical centres within {radius} km
            </p>

            <div className={cn(
              'gap-4',
              viewMode === 'both' && 'grid grid-cols-1 lg:grid-cols-[2fr_3fr]',
            )}>
              {(viewMode === 'map' || viewMode === 'both') && userLocation && (
                <div className="rounded-2xl overflow-hidden border border-border" style={{ minHeight: 'clamp(320px, 45vh, 460px)' }}>
                  <MedicalCentreMap
                    userLocation={userLocation}
                    centres={centres}
                    selectedCentre={selectedCentre}
                    onSelectCentre={setSelectedCentre}
                  />
                </div>
              )}

              {(viewMode === 'list' || viewMode === 'both') && (
                <div className={cn(
                  'space-y-3 overflow-y-auto',
                  viewMode === 'both' && 'max-h-[500px]'
                )}>
                  {centres.map((centre) => (
                    <MedicalCentreCard
                      key={centre.id}
                      centre={centre}
                      isSelected={selectedCentre?.id === centre.id}
                      onSelect={() => setSelectedCentre(centre)}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-ink/5">
              <button
                type="button"
                onClick={() => setState('idle')}
                className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
              >
                Search a different location
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
