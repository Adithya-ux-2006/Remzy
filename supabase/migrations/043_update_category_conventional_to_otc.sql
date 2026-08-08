-- Migration 042: Update Supabase remedies category from 'Conventional' to 'OTC'
-- First update the data, then update the constraint

BEGIN;

-- Update the data first
UPDATE public.remedies
SET category = 'OTC'
WHERE category = 'Conventional';

-- Then update the constraint
ALTER TABLE public.remedies DROP CONSTRAINT IF EXISTS remedies_category_check;

ALTER TABLE public.remedies
  ADD CONSTRAINT remedies_category_check
  CHECK (category IN ('Lifestyle', 'Natural', 'Ayurveda', 'OTC'));

-- Verify the update
SELECT category, COUNT(*) as count
FROM public.remedies
GROUP BY category;

COMMIT;