import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const orphanedIds = [
  'rem_a01', 'rem_a02', 'rem_a05', 'rem_c01', 'rem_c02', 'rem_c05',
  'rem_h01', 'rem_h02', 'rem_h05', 'rem_i01', 'rem_i02', 'rem_i05',
  'rem_n01', 'rem_n02', 'rem_n05', 'rem_s01', 'rem_s02', 'rem_s05'
];

async function deleteOrphans() {
  console.log('=== DELETING ORPHANED REMEDIES (fake citations) ===\n');
  
  for (const id of orphanedIds) {
    // First check if it exists
    const { data, error: checkError } = await supabase
      .from('remedies')
      .select('id, name, research_papers(url)')
      .eq('id', id)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        console.log(`  ${id}: Already deleted`);
      } else {
        console.log(`  ${id}: Check error - ${checkError.message}`);
      }
      continue;
    }

    // Check if it has fake URLs (search queries)
    const hasFakeUrls = data.research_papers?.some(p => 
      p.url && p.url.includes('?term=')
    ) ?? false;

    if (!hasFakeUrls) {
      console.log(`  ${id}: ${data.name} - has real URLs, KEEPING`);
      continue;
    }

    // Delete related schedules first
    const { error: schedError } = await supabase
      .from('remedy_schedules')
      .delete()
      .eq('remedy_id', id);

    if (schedError) {
      console.warn(`  ⚠ Could not clear schedules for ${id}:`, schedError.message);
    }

    // Delete the remedy (cascades to research_papers)
    const { error: delError } = await supabase
      .from('remedies')
      .delete()
      .eq('id', id);

    if (delError) {
      console.error(`  ✗ Failed to delete ${id} (${data.name}):`, delError.message);
    } else {
      console.log(`  ✓ Deleted ${id} (${data.name}) - had fake search-query URLs`);
    }
  }

  // Final verification
  const { count: finalRemedyCount } = await supabase
    .from('remedies')
    .select('*', { count: 'exact', head: true });

  const { count: finalPaperCount } = await supabase
    .from('research_papers')
    .select('*', { count: 'exact', head: true });

  console.log(`\nFinal remedies count: ${finalRemedyCount} (expected 63)`);
  console.log(`Final research_papers count: ${finalPaperCount}`);

  // Verify all have real PubMed URLs
  console.log('\n--- VERIFYING ALL REMEDIES HAVE REAL CITATIONS ---');
  const { data: allRemedies, error } = await supabase
    .from('remedies')
    .select('id, name, research_papers(url)');

  if (error) {
    console.error('Error fetching all remedies:', error);
    return;
  }

  let allReal = true;
  for (const r of allRemedies) {
    const hasRealUrl = r.research_papers?.some(p => 
      p.url && /pubmed\.ncbi\.nlm\.nih\.gov\/\d+/.test(p.url)
    ) ?? false;
    
    if (!hasRealUrl && r.research_papers?.length > 0) {
      console.log(`  ⚠ ${r.id} (${r.name}) has papers but NO real PubMed URLs`);
      allReal = false;
    } else if (r.research_papers?.length === 0) {
      console.log(`  ⚠ ${r.id} (${r.name}) has NO research papers`);
      allReal = false;
    }
  }

  if (allReal) {
    console.log('  ✓ All remedies have at least one real PubMed citation');
  }
}

deleteOrphans().catch(console.error);