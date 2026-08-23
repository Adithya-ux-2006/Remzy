begin;

-- View: aggregated external data per remedy for frontend display
-- Combines clinical trial data (from evidence_publications) and FDA labels (from research_papers)
create or replace view public.remedy_enrichment
with (security_invoker = true)
as
select
  r.id as remedy_id,
  r.name as remedy_name,
  -- Clinical trial counts from evidence_publications
  count(distinct ep.id) filter (
    where ep.source_database = 'ClinicalTrials.gov'
      and ep.verification_status = 'metadata-verified'
  )::integer as clinical_trial_count,
  count(distinct ep.id) filter (
    where ep.source_database = 'ClinicalTrials.gov'
      and ep.verification_status = 'metadata-verified'
      and ep.metadata->>'status' in ('RECRUITING', 'ACTIVE_NOT_RECRUITING', 'ENROLLING_BY_INVITATION')
  )::integer as active_trial_count,
  -- FDA data presence
  count(distinct rp.id) filter (
    where rp.journal = 'openFDA'
  )::integer as fda_record_count,
  -- Aggregate FDA warnings (first 500 chars)
  (
    select string_agg(
      left(
        regexp_replace(
          rp2.key_findings,
          'Warnings:\s*',
          ''
        ),
        300
      ),
      ' | '
    )
    from public.research_papers rp2
    where rp2.remedy_id = r.id
      and rp2.journal = 'openFDA'
      and rp2.key_findings like '%Warnings:%'
    limit 1
  ) as fda_warnings_summary
from public.remedies r
left join public.evidence_claims ec on ec.remedy_id = r.id and ec.review_status = 'approved'
left join public.evidence_claim_publications ecp on ecp.claim_id = ec.id and ecp.included = true
left join public.evidence_publications ep on ep.id = ecp.publication_id
left join public.research_papers rp on rp.remedy_id = r.id
group by r.id, r.name;

-- Admin view: undercovered symptoms with health API discovery status
create or replace view public.admin_health_api_coverage
with (security_invoker = true)
as
select
  s.id as symptom_id,
  s.label as symptom_label,
  count(distinct rs.remedy_id)::integer as remedy_count,
  count(distinct ep.id) filter (
    where ep.source_database = 'ClinicalTrials.gov'
  )::integer as clinical_trial_count,
  count(distinct rp.id) filter (
    where rp.journal = 'openFDA'
  )::integer as fda_record_count,
  -- Count of claims awaiting review from health API discovery
  count(distinct ec.id) filter (
    where ec.review_status = 'needs-review'
      and ec.claim_text like '%discovery%'
  )::integer as pending_discovery_claims
from public.symptoms s
left join public.remedy_symptoms rs on rs.symptom_id = s.id
left join public.evidence_claims ec on ec.symptom_id = s.id
left join public.evidence_claim_publications ecp on ecp.claim_id = ec.id
left join public.evidence_publications ep on ep.id = ecp.publication_id
  and ep.source_database = 'ClinicalTrials.gov'
left join public.research_papers rp on rp.journal = 'openFDA'
  and exists (
    select 1 from public.remedy_symptoms rs2
    where rs2.symptom_id = s.id and rs2.remedy_id = rp.remedy_id
  )
where exists (
  select 1 from public.users u
  where u.id = (select auth.uid()) and u.is_admin = true
)
group by s.id, s.label
having count(distinct rs.remedy_id) < 5;

-- RLS: public can read enrichment view (safe - only shows counts and FDA summary text)
revoke all on table public.remedy_enrichment from public, anon;
grant select on table public.remedy_enrichment to anon, authenticated, service_role;

-- RLS: admin-only for health API coverage view
revoke all on table public.admin_health_api_coverage from public, anon;
grant select on table public.admin_health_api_coverage to authenticated, service_role;

comment on view public.remedy_enrichment is
  'Public read model: aggregated external data (clinical trials, FDA labels) per remedy.';
comment on view public.admin_health_api_coverage is
  'Admin-only health API discovery status for undercovered symptoms.';

commit;
