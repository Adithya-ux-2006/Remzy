begin;

create table if not exists public.evidence_publications (
  id uuid primary key default gen_random_uuid(),
  canonical_key text not null unique,
  pmid text,
  doi text,
  guideline_id text,
  title text not null,
  journal text,
  publication_year integer check (publication_year between 1800 and 2200),
  canonical_url text not null,
  source_database text,
  source_organization text not null,
  publisher text,
  evidence_type text not null check (evidence_type in (
    'guideline', 'systematic-review', 'meta-analysis', 'randomized-trial',
    'non-randomized-study', 'safety-guidance', 'traditional-literature', 'other'
  )),
  verification_status text not null default 'discovery' check (verification_status in (
    'discovery', 'metadata-verified', 'full-text-reviewed', 'excluded', 'retracted'
  )),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint evidence_publications_https_url check (canonical_url ~ '^https://')
);

create unique index if not exists evidence_publications_pmid_unique
  on public.evidence_publications (pmid) where pmid is not null;
create unique index if not exists evidence_publications_doi_unique
  on public.evidence_publications (lower(doi)) where doi is not null;
create index if not exists evidence_publications_status_idx
  on public.evidence_publications (verification_status, evidence_type);

create table if not exists public.evidence_claims (
  id text primary key,
  remedy_id text not null references public.remedies(id) on delete cascade,
  symptom_id text not null references public.symptoms(id) on delete cascade,
  claim_text text not null,
  population jsonb not null default '{}'::jsonb,
  intervention jsonb not null default '{}'::jsonb,
  comparators jsonb not null default '[]'::jsonb,
  outcomes jsonb not null default '[]'::jsonb,
  certainty text not null default 'unrated' check (certainty in ('high', 'moderate', 'low', 'very-low', 'unrated')),
  recommendation_status text not null default 'pending-review' check (recommendation_status in (
    'pending-review', 'guideline-recommended', 'may-be-considered', 'uncertain-evidence',
    'supportive-care', 'traditional-use', 'not-supported', 'professional-supervision-required'
  )),
  review_status text not null default 'needs-review' check (review_status in (
    'needs-review', 'approved', 'quarantined', 'retired'
  )),
  safety_reviewed boolean not null default false,
  reviewed_by uuid references public.users(id) on delete set null,
  second_reviewer uuid references public.users(id) on delete set null,
  reviewed_at timestamptz,
  approved_at timestamptz,
  next_review_at timestamptz,
  limitations text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (remedy_id, symptom_id)
);

create index if not exists evidence_claims_publication_idx
  on public.evidence_claims (review_status, remedy_id, symptom_id);
create index if not exists evidence_claims_review_due_idx
  on public.evidence_claims (next_review_at) where review_status = 'approved';

create table if not exists public.evidence_claim_publications (
  claim_id text not null references public.evidence_claims(id) on delete cascade,
  publication_id uuid not null references public.evidence_publications(id) on delete cascade,
  population_match text not null default 'unassessed' check (population_match in ('exact', 'partial', 'indirect', 'mismatch', 'unassessed')),
  intervention_match text not null default 'unassessed' check (intervention_match in ('exact', 'partial', 'indirect', 'mismatch', 'unassessed')),
  outcome_match text not null default 'unassessed' check (outcome_match in ('exact', 'partial', 'indirect', 'mismatch', 'unassessed')),
  overall_applicability text not null default 'unassessed' check (overall_applicability in (
    'exact', 'mostly-applicable', 'indirect', 'mismatch', 'unassessed'
  )),
  benefit_or_safety text not null default 'benefit' check (benefit_or_safety in ('benefit', 'safety', 'both')),
  risk_of_bias_tool text,
  risk_of_bias text not null default 'unassessed' check (risk_of_bias in (
    'low', 'some-concerns', 'high', 'critical', 'not-applicable', 'unassessed'
  )),
  review_note text,
  effect_summary jsonb not null default '{}'::jsonb,
  included boolean not null default false,
  reviewed_by uuid references public.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (claim_id, publication_id)
);

create index if not exists evidence_claim_publications_public_idx
  on public.evidence_claim_publications (claim_id, included, overall_applicability);

create table if not exists public.evidence_reviews (
  id uuid primary key default gen_random_uuid(),
  claim_id text not null references public.evidence_claims(id) on delete cascade,
  publication_id uuid references public.evidence_publications(id) on delete cascade,
  reviewer_id uuid not null references public.users(id) on delete restrict,
  review_type text not null check (review_type in (
    'pico', 'full-text', 'risk-of-bias', 'safety', 'grade', 'clinical-approval', 'second-review'
  )),
  decision text not null check (decision in ('include', 'exclude', 'needs-more-information', 'approve', 'reject')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists evidence_reviews_claim_idx
  on public.evidence_reviews (claim_id, created_at desc);

alter table public.evidence_publications enable row level security;
alter table public.evidence_claims enable row level security;
alter table public.evidence_claim_publications enable row level security;
alter table public.evidence_reviews enable row level security;

revoke all on table public.evidence_publications from anon, authenticated;
revoke all on table public.evidence_claims from anon, authenticated;
revoke all on table public.evidence_claim_publications from anon, authenticated;
revoke all on table public.evidence_reviews from anon, authenticated;

grant select on table public.evidence_publications to anon, authenticated;
grant select on table public.evidence_claims to anon, authenticated;
grant select on table public.evidence_claim_publications to anon, authenticated;
grant select, insert, update, delete on table public.evidence_publications to service_role;
grant select, insert, update, delete on table public.evidence_claims to service_role;
grant select, insert, update, delete on table public.evidence_claim_publications to service_role;
grant select, insert, update, delete on table public.evidence_reviews to service_role;

grant insert, update, delete on table public.evidence_publications to authenticated;
grant insert, update, delete on table public.evidence_claims to authenticated;
grant insert, update, delete on table public.evidence_claim_publications to authenticated;
grant select, insert, update, delete on table public.evidence_reviews to authenticated;

create policy "Public can read approved evidence claims"
  on public.evidence_claims for select
  to anon, authenticated
  using (review_status = 'approved' and approved_at is not null and (next_review_at is null or next_review_at > now()));

create policy "Public can read evidence links for approved claims"
  on public.evidence_claim_publications for select
  to anon, authenticated
  using (
    included = true
    and exists (
      select 1 from public.evidence_claims c
      where c.id = claim_id
        and c.review_status = 'approved'
        and c.approved_at is not null
        and (c.next_review_at is null or c.next_review_at > now())
    )
  );

create policy "Public can read publications used by approved claims"
  on public.evidence_publications for select
  to anon, authenticated
  using (
    verification_status in ('metadata-verified', 'full-text-reviewed')
    and exists (
      select 1
      from public.evidence_claim_publications cp
      join public.evidence_claims c on c.id = cp.claim_id
      where cp.publication_id = evidence_publications.id
        and cp.included = true
        and c.review_status = 'approved'
        and c.approved_at is not null
        and (c.next_review_at is null or c.next_review_at > now())
    )
  );

create policy "Admins can read all evidence publications"
  on public.evidence_publications for select to authenticated
  using (exists (select 1 from public.users u where u.id = (select auth.uid()) and u.is_admin = true));
create policy "Admins can manage evidence publications"
  on public.evidence_publications for all to authenticated
  using (exists (select 1 from public.users u where u.id = (select auth.uid()) and u.is_admin = true))
  with check (exists (select 1 from public.users u where u.id = (select auth.uid()) and u.is_admin = true));

create policy "Admins can read all evidence claims"
  on public.evidence_claims for select to authenticated
  using (exists (select 1 from public.users u where u.id = (select auth.uid()) and u.is_admin = true));
create policy "Admins can manage evidence claims"
  on public.evidence_claims for all to authenticated
  using (exists (select 1 from public.users u where u.id = (select auth.uid()) and u.is_admin = true))
  with check (exists (select 1 from public.users u where u.id = (select auth.uid()) and u.is_admin = true));

create policy "Admins can read all claim evidence links"
  on public.evidence_claim_publications for select to authenticated
  using (exists (select 1 from public.users u where u.id = (select auth.uid()) and u.is_admin = true));
create policy "Admins can manage claim evidence links"
  on public.evidence_claim_publications for all to authenticated
  using (exists (select 1 from public.users u where u.id = (select auth.uid()) and u.is_admin = true))
  with check (exists (select 1 from public.users u where u.id = (select auth.uid()) and u.is_admin = true));

create policy "Admins can read evidence reviews"
  on public.evidence_reviews for select to authenticated
  using (exists (select 1 from public.users u where u.id = (select auth.uid()) and u.is_admin = true));
create policy "Admins can manage evidence reviews"
  on public.evidence_reviews for all to authenticated
  using (exists (select 1 from public.users u where u.id = (select auth.uid()) and u.is_admin = true))
  with check (exists (select 1 from public.users u where u.id = (select auth.uid()) and u.is_admin = true));

create or replace view public.approved_remedy_evidence
with (security_invoker = true)
as
select
  c.id as claim_id,
  c.remedy_id,
  c.symptom_id,
  c.claim_text,
  c.certainty,
  c.recommendation_status,
  c.limitations,
  c.reviewed_at,
  c.next_review_at,
  p.id as publication_id,
  p.title,
  p.journal,
  p.publication_year,
  p.canonical_url as url,
  p.source_database,
  p.source_organization,
  p.evidence_type,
  cp.overall_applicability,
  cp.benefit_or_safety,
  cp.risk_of_bias,
  cp.review_note,
  cp.effect_summary
from public.evidence_claims c
join public.evidence_claim_publications cp on cp.claim_id = c.id and cp.included = true
join public.evidence_publications p on p.id = cp.publication_id
where c.review_status = 'approved'
  and c.approved_at is not null
  and (c.next_review_at is null or c.next_review_at > now())
  and p.verification_status in ('metadata-verified', 'full-text-reviewed');

revoke all on table public.approved_remedy_evidence from public;
grant select on table public.approved_remedy_evidence to anon, authenticated, service_role;

comment on table public.evidence_publications is 'Canonical evidence records; discovery metadata is not approval.';
comment on table public.evidence_claims is 'PICO-scoped symptom-remedy claims with explicit review and approval state.';
comment on table public.evidence_claim_publications is 'Claim-specific applicability, quality, effect, and inclusion decisions.';
comment on table public.evidence_reviews is 'Append-only evidence review and clinical approval audit history.';
comment on view public.approved_remedy_evidence is 'Public read model containing only current, approved, included evidence.';

commit;
