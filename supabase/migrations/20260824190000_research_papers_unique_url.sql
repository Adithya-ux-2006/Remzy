begin;

-- Add unique constraint on (remedy_id, url) for upsert support
CREATE UNIQUE INDEX IF NOT EXISTS research_papers_remedy_url_unique
  ON public.research_papers (remedy_id, url);

-- Also add an index for faster lookups
CREATE INDEX IF NOT EXISTS research_papers_remedy_id_idx
  ON public.research_papers (remedy_id);

comment on index public.research_papers_remedy_url_unique is
  'Prevents duplicate research papers for the same remedy and URL.';

commit;
