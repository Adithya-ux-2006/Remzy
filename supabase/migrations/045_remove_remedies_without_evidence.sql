-- Migration 045: Remove remedies without any supporting evidence
-- Delete remedies that have no research papers linked to them
-- Also clean up related schedules first

BEGIN;

-- Delete schedules for remedies without evidence
DELETE FROM public.remedy_schedules
WHERE remedy_id IN (
  SELECT r.id
  FROM public.remedies r
  LEFT JOIN public.research_papers rp ON r.id = rp.remedy_id
  WHERE rp.id IS NULL
);

-- Delete remedies that have no research papers linked
DELETE FROM public.remedies
WHERE id IN (
  SELECT r.id
  FROM public.remedies r
  LEFT JOIN public.research_papers rp ON r.id = rp.remedy_id
  WHERE rp.id IS NULL
);

-- Verify remaining remedies
SELECT category, COUNT(*) as count
FROM public.remedies
GROUP BY category;

COMMIT;