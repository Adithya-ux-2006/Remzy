import { supabase } from '../lib/supabase';

export async function fetchEvidenceAdminSummary() {
  const [coverageResult, queueResult] = await Promise.all([
    supabase
      .from('admin_undercovered_symptoms')
      .select('symptom_id,symptom_label,remedy_count,queued_claim_count,candidate_count')
      .order('remedy_count', { ascending: true })
      .order('symptom_label', { ascending: true }),
    supabase
      .from('admin_evidence_review_queue')
      .select('claim_id,symptom_id,symptom_label,remedy_id,remedy_name,publication_id,title,journal,publication_year,canonical_url,doi,source_database,verification_status,included,overall_applicability,review_note,metadata')
      .order('symptom_label', { ascending: true })
      .limit(100),
  ]);

  if (coverageResult.error) throw coverageResult.error;
  if (queueResult.error) throw queueResult.error;

  return {
    undercoveredSymptoms: coverageResult.data || [],
    reviewQueue: queueResult.data || [],
  };
}
