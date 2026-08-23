-- Pre-migration data state check via Supabase CLI
-- Run this BEFORE any destructive migration

-- 1. Remedies count
SELECT 'remedies count' AS check, COUNT(*) AS value FROM public.remedies;

-- 2. Research papers count
SELECT 'research_papers count' AS check, COUNT(*) AS value FROM public.research_papers;

-- 3. Real PubMed papers
SELECT 'real_pubmed_papers' AS check, COUNT(*) AS value 
FROM public.research_papers 
WHERE url ~ 'pubmed\.ncbi\.nlm\.nih\.gov/\d+';

-- 4. Fake search-query URLs (should be 0)
SELECT 'fake_term_urls' AS check, COUNT(*) AS value 
FROM public.research_papers 
WHERE url LIKE '%?term=%';

-- 5. Orphaned remedies (in DB but not in expected set)
WITH expected_ids AS (
  SELECT unnest(ARRAY[
    'rem_001','rem_h04','rem_004','rem_005','rem_006','rem_007','rem_008','rem_009','rem_010',
    'rem_011','rem_012','rem_013','rem_014','rem_015','rem_016','rem_017','rem_018','rem_019',
    'rem_020','rem_021','rem_022','rem_023','rem_024','rem_025','rem_026','rem_027','rem_028',
    'rem_029','rem_030','rem_031','rem_032','rem_033','rem_034','rem_035','rem_036','rem_037',
    'rem_038','rem_039','rem_040','rem_041','rem_042','rem_043','rem_044','rem_045','rem_101',
    'rem_102','rem_103','rem_104','rem_105','rem_106','rem_mg01','rem_bt01','rem_np01','rem_sp01',
    'rem_kp01','rem_ep01','rem_pms01','rem_fv01','rem_hg01','rem_dh01','rem_cs01','rem_hd01','rem_rs01'
  ]) AS id
)
SELECT 'orphaned_remedies' AS check, COUNT(*) AS value 
FROM public.remedies r 
WHERE r.id NOT IN (SELECT id FROM expected_ids);

-- 6. Remedies with zero papers (should be 0)
SELECT 'remedies_zero_papers' AS check, COUNT(*) AS value 
FROM public.remedies r 
LEFT JOIN public.research_papers rp ON r.id = rp.remedy_id 
WHERE rp.id IS NULL;