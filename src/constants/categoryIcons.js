import { Leaf, Heart, Pill } from 'lucide-react';

export const CATEGORY_LABELS = {
  Natural: 'Natural',
  Lifestyle: 'Lifestyle',
  OTC: 'Over the Counter',
};

export const CATEGORY_ICONS = {
  Natural: { Icon: Leaf, bg: 'bg-emerald-500/10', color: 'text-emerald-500' },
  Lifestyle: { Icon: Heart, bg: 'bg-violet-500/10', color: 'text-violet-500' },
  'OTC': { Icon: Pill, bg: 'bg-orange-500/10', color: 'text-orange-500' },
};
