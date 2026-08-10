select jsonb_build_object(
  'counts', jsonb_build_object(
    'claims', (select count(*) from public.evidence_claims),
    'publications', (select count(*) from public.evidence_publications),
    'claim_publication_links', (select count(*) from public.evidence_claim_publications),
    'reviews', (select count(*) from public.evidence_reviews),
    'approved_claims', (select count(*) from public.evidence_claims where review_status = 'approved'),
    'public_view_rows', (select count(*) from public.approved_remedy_evidence)
  ),
  'relations', (
    select jsonb_agg(jsonb_build_object(
      'name', c.relname,
      'rls', c.relrowsecurity,
      'anon_select', has_table_privilege('anon', format('public.%I', c.relname), 'select'),
      'authenticated_select', has_table_privilege('authenticated', format('public.%I', c.relname), 'select')
    ) order by c.relname)
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname in ('evidence_publications', 'evidence_claims', 'evidence_claim_publications', 'evidence_reviews')
  ),
  'policies', (
    select jsonb_agg(jsonb_build_object(
      'table', tablename,
      'policy', policyname,
      'roles', roles,
      'command', cmd
    ) order by tablename, policyname)
    from pg_policies
    where schemaname = 'public' and tablename like 'evidence_%'
  ),
  'view_options', (
    select to_jsonb(c.reloptions)
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'approved_remedy_evidence'
  )
) as evidence_backend_verification;
