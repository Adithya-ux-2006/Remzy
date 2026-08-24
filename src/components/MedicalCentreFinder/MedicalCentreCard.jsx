import { MapPin, Phone, Globe, Clock, Navigation } from 'lucide-react';
import { cn } from '../../utils/cn';

const TYPE_STYLES = {
  Hospital: 'bg-red-500/10 text-red-500 border-red-500/20',
  Clinic: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  'Medical Practice': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  'Diagnostics Centre': 'bg-violet-500/10 text-violet-500 border-violet-500/20',
  Laboratory: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
};

function getDistanceLabel(distance) {
  if (distance < 1) return `${Math.round(distance * 1000)} m`;
  return `${distance.toFixed(1)} km`;
}

export function MedicalCentreCard({ centre, isSelected, onSelect }) {
  const typeStyle = TYPE_STYLES[centre.type] || 'bg-primary/10 text-primary border-primary/20';

  return (
    <article
      className={cn(
        'rounded-2xl border p-4 transition-all cursor-pointer',
        isSelected
          ? 'border-primary bg-primary/5 shadow-card ring-2 ring-primary/20'
          : 'border-border bg-card hover:border-primary/30 hover:shadow-soft'
      )}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      aria-label={`${centre.name}, ${centre.type}, ${getDistanceLabel(centre.distance)} away`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-1.5">
            <h3 className="min-w-0 flex-1 font-semibold text-ink leading-snug line-clamp-2">{centre.name}</h3>
            <span className={cn(
              'shrink-0 px-2.5 py-1 rounded-full text-xs font-medium border',
              typeStyle
            )}>
              {centre.type}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-sm text-ink-muted mb-2">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span>{getDistanceLabel(centre.distance)} away</span>
          </div>

          {centre.address && (
            <p className="text-xs text-ink-muted mb-2 line-clamp-2">{centre.address}</p>
          )}

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted">
            {centre.phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {centre.phone}
              </span>
            )}
            {centre.openingHours && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {centre.openingHours}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-3 pt-3 border-t border-ink/5">
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${centre.lat},${centre.lon}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition-colors"
          aria-label={`Get directions to ${centre.name}`}
        >
          <Navigation className="w-3.5 h-3.5" />
          Get Directions
        </a>
        <a
          href={`https://www.openstreetmap.org/?mlat=${centre.lat}&mlon=${centre.lon}#map=16/${centre.lat}/${centre.lon}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-border text-ink text-xs font-semibold hover:bg-surface transition-colors"
          aria-label={`View ${centre.name} on OpenStreetMap`}
        >
          <Globe className="w-3.5 h-3.5" />
          View on Map
        </a>
      </div>
    </article>
  );
}
