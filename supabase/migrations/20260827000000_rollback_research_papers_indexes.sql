begin;

-- Rollback: drop indexes added in 20260824190000_research_papers_unique_url
DROP INDEX IF EXISTS public.research_papers_remedy_url_unique;
DROP INDEX IF EXISTS public.research_papers_remedy_id_idx;

commit;
