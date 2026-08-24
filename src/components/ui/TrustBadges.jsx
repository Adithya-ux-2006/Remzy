import { ShieldCheck, Ban, Heart } from 'lucide-react';

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: 'Data stays private.' },
  { icon: Ban, label: 'No ads, no sponsored remedies.' },
  { icon: Heart, label: 'Not a substitute for professional medical advice.' },
];

export function TrustBadges({ className = '' }) {
  return (
    <p className={`text-sm font-medium text-ink-muted flex flex-wrap justify-center gap-x-4 gap-y-1 ${className}`}>
      {TRUST_ITEMS.map((item) => (
        <span key={item.label} className="flex items-center gap-1">
          <item.icon className="w-4 h-4 text-primary" /> {item.label}
        </span>
      ))}
    </p>
  );
}
