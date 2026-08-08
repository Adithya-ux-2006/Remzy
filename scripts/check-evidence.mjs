import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkRemedies() {
  // First, get all remedies
  const { data: remedies, error: remediesError } = await supabase
    .from('remedies')
    .select('id, name, category');

  if (remediesError) {
    console.error('Error fetching remedies:', remediesError);
    return;
  }

  console.log(`Total remedies in Supabase: ${remedies.length}`);

  // Check research_papers for each remedy
  const noEvidence = [];
  let hasEvidenceCount = 0;

  for (const remedy of remedies) {
    const { data: papers, error } = await supabase
      .from('research_papers')
      .select('id')
      .eq('remedy_id', remedy.id)
      .limit(1);

    if (error) {
      console.error(`Error checking papers for ${remedy.name}:`, error);
      continue;
    }

    const hasPapers = papers && papers.length > 0;
    
    if (!hasPapers) {
      console.log(`NO EVIDENCE: ${remedy.id} | ${remedy.name} | ${remedy.category}`);
    } else {
      hasEvidenceCount++;
    }
  }

  console.log(`\nTotal remedies: ${remedies.length}`);
  console.log(`Remedies WITH evidence: ${hasEvidenceCount}`);
}

checkRemedies().catch(console.error);