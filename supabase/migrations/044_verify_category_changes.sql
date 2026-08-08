-- Migration 044: Verify category changes
-- Check for any remaining "Conventional" categories

BEGIN;

-- Check for any remaining "Conventional" categories
DO $$
DECLARE
  conventional_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO conventional_count
  FROM public.remedies
  WHERE category = 'Conventional';
  
  IF conventional_count > 0 THEN
    RAISE NOTICE 'Found % conventional remedies that need updating', conventional_count;
  ELSE
    RAISE NOTICE 'No conventional remedies found - all updated to OTC';
  END IF;
END $$;

-- Show category distribution
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN SELECT category, COUNT(*) as count FROM public.remedies GROUP BY category ORDER BY category
  LOOP
    RAISE NOTICE 'Category: %, Count: %', rec.category, rec.count;
  END LOOP;
END $$;

COMMIT;