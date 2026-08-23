begin;

create or replace view public.admin_undercovered_symptoms
with (security_invoker = true)
as
select
  s.id as symptom_id,
  s.label as symptom_label,
  count(distinct rs.remedy_id)::integer as remedy_count,
  count(distinct ec.id) filter (where ec.review_status = 'needs-review')::integer as queued_claim_count,
  count(distinct ecp.publication_id) filter (where ecp.included = false)::integer as candidate_count
from public.symptoms s
left join public.remedy_symptoms rs on rs.symptom_id = s.id
left join public.evidence_claims ec on ec.symptom_id = s.id
left join public.evidence_claim_publications ecp on ecp.claim_id = ec.id
where exists (
  select 1 from public.users u
  where u.id = (select auth.uid()) and u.is_admin = true
)
group by s.id, s.label
having count(distinct rs.remedy_id) < 5;

create or replace view public.admin_evidence_review_queue
with (security_invoker = true)
as
select
  ec.id as claim_id,
  ec.symptom_id,
  s.label as symptom_label,
  ec.remedy_id,
  r.name as remedy_name,
  ec.claim_text,
  ec.review_status,
  ec.safety_reviewed,
  ep.id as publication_id,
  ep.title,
  ep.journal,
  ep.publication_year,
  ep.canonical_url,
  ep.doi,
  ep.source_database,
  ep.verification_status,
  ep.metadata,
  ecp.included,
  ecp.overall_applicability,
  ecp.review_note
from public.evidence_claims ec
join public.symptoms s on s.id = ec.symptom_id
join public.remedies r on r.id = ec.remedy_id
join public.evidence_claim_publications ecp on ecp.claim_id = ec.id
join public.evidence_publications ep on ep.id = ecp.publication_id
where ec.review_status = 'needs-review'
  and ecp.included = false
  and exists (
    select 1 from public.users u
    where u.id = (select auth.uid()) and u.is_admin = true
  );

revoke all on table public.admin_undercovered_symptoms from public, anon;
revoke all on table public.admin_evidence_review_queue from public, anon;
grant select on table public.admin_undercovered_symptoms to authenticated, service_role;
grant select on table public.admin_evidence_review_queue to authenticated, service_role;

comment on view public.admin_undercovered_symptoms is
  'Admin-only coverage summary for symptoms with fewer than five mapped remedies.';
comment on view public.admin_evidence_review_queue is
  'Admin-only discovery queue. Rows are not approved evidence and remain excluded from public display.';

commit;
