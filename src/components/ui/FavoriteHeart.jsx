import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { cn } from '../../utils/cn';

export function FavoriteHeart({ favorited, className }) {
  return (
    <motion.div
      key={favorited ? 'fav' : 'unfav'}
      initial={favorited ? { scale: 0.8 } : {}}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      className="inline-flex items-center justify-center w-7 h-7"
    >
      <Heart
        className={cn('w-5 h-5', favorited && 'text-primary', className)}
        fill={favorited ? 'currentColor' : 'none'}
      />
    </motion.div>
  );
}
