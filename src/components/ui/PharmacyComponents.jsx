import { ExternalLink, MapPin, Navigation, Store } from 'lucide-react';
import { cn } from '../../utils/cn';

function formatDistance(meters) {
  if (meters == null || Number.isNaN(meters)) return null;
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

export function FeaturedPharmacy({ shop, className }) {
  if (!shop) return null;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${shop.lat},${shop.lon}`;
  const isOpen = shop.isOpen !== false;
  const distanceText = formatDistance(shop.distance);

  return (
    <div className={cn(
      'rounded-2xl p-5 bg-success/[0.04] border border-success/15',
      'transition-all duration-200',
      'hover:shadow-lg hover:-translate-y-0.5',
      'active:scale-[0.98] active:shadow-md',
      className
    )}>
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-success/10 text-success">
          <MapPin className="w-3 h-3" />
          Closest to You
        </span>
      </div>

      <div className="flex items-start gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
          <Store className="w-5 h-5 text-success" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-ink truncate">{shop.name}</p>
          <p className="text-sm text-ink-muted truncate">{shop.address}</p>
          <div className="flex items-center gap-3 mt-1.5">
            {distanceText && (
              <span className="flex items-center gap-1 text-xs text-ink-muted">
                <Navigation className="w-3 h-3" />
                {distanceText}
              </span>
            )}
            <span className={cn(
              'text-xs font-medium',
              isOpen ? 'text-success' : 'text-danger'
            )}>
              {isOpen ? 'Open' : 'Closed'}
            </span>
          </div>
        </div>
      </div>

      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-full h-11 rounded-xl bg-primary text-white text-sm font-semibold shadow-glow transition-all duration-200 hover:bg-primary-dark hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] active:shadow-md"
      >
        Get Directions
      </a>
    </div>
  );
}

export function PharmacyCard({ shop, className }) {
  if (!shop) return null;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${shop.lat},${shop.lon}`;
  const isOpen = shop.isOpen !== false;
  const distanceText = formatDistance(shop.distance);

  return (
    <a
      href={mapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl transition-all duration-200',
        'hover:bg-surface',
        'active:scale-[0.99] active:bg-ink/5',
        className
      )}
    >
      <div className="w-9 h-9 rounded-xl bg-surface flex items-center justify-center shrink-0">
        <Store className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink truncate">{shop.name}</p>
        <p className="text-xs text-ink-muted truncate">{shop.address}</p>
        <div className="flex items-center gap-3 mt-1">
          {distanceText && (
            <span className="flex items-center gap-1 text-xs text-ink-muted">
              <Navigation className="w-3 h-3" />
              {distanceText}
            </span>
          )}
          <span className={cn(
            'text-xs font-medium',
            isOpen ? 'text-success' : 'text-danger'
          )}>
            {isOpen ? 'Open' : 'Closed'}
          </span>
        </div>
      </div>
      <ExternalLink className="w-4 h-4 text-ink-subtle shrink-0 transition-colors duration-200 group-hover:text-primary" />
    </a>
  );
}
