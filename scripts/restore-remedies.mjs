import { createClient } from '@supabase/supabase-js';
import { REMEDIES } from '../src/data/remedies.js';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

function mapRemedyForDB(remedy) {
  // Combine researchPapers and researchLinks into a unified format for DB
  const papers = [];
  
  // Add researchPapers
  if (remedy.researchPapers) {
    for (const p of remedy.researchPapers) {
      papers.push({
        title: p.title || p.journal || 'Research Paper',
        journal: p.journal || 'Unknown Journal',
        url: p.url,
        key_findings: p.keyFinding || p.key_finding || p.finding || '',
        published_year: p.year ? parseInt(p.year) : null
      });
    }
  }
  
  // Add researchLinks
  if (remedy.researchLinks) {
    for (const l of remedy.researchLinks) {
      papers.push({
        title: l.label || 'Research Link',
        journal: l.journal || l.label || 'Research Link',
        url: l.url,
        key_findings: l.keyFinding || l.finding || l.label || '',
        published_year: l.year ? parseInt(l.year) : null
      });
    }
  }

  return {
    // Remedy fields
    remedy: {
      id: remedy.id,
      name: remedy.name,
      category: remedy.category,
      rating: remedy.rating,
      review_count: remedy.reviewCount ?? 0,
      short_description: remedy.shortDescription ?? '',
      long_description: remedy.longDescription ?? '',
      how_to_use: remedy.howToUse ?? '',
      warnings: remedy.warnings ?? '',
      allergen_tags: remedy.allergen_tags ?? [],
      contraindications: remedy.contraindications ?? [],
      ingredients: remedy.ingredients ?? [],
      time_to_effect: remedy.timeToEffect ?? '',
      difficulty: remedy.difficulty ?? '',
      cost: remedy.cost ?? '',
      is_featured: remedy.isFeatured ?? false,
      is_purchasable: remedy.isPurchasable ?? true,
      child_safe: remedy.childSafe ?? true,
      child_safety_note: remedy.childSafetyNote ?? '',
      tagline: remedy.tagline ?? '',
      updated_at: new Date().toISOString()
    },
    papers
  };
}

async function restoreRemedies() {
  console.log('=== RESTORING REMEDIES FROM LOCAL SOURCE ===\n');
  console.log(`Source: src/data/remedies.js (${REMEDIES.length} remedies)\n`);

  // First, let's do a dry run - count what would be inserted/updated
  console.log('--- DRY RUN: Checking existing remedies ---');
  const { data: existingRemedies, error: existingError } = await supabase
    .from('remedies')
    .select('id');

  if (existingError) {
    console.error('Error fetching existing remedies:', existingError);
    return;
  }

  const existingIds = new Set(existingRemedies?.map(r => r.id) || []);
  const sourceIds = new Set(REMEDIES.map(r => r.id));
  
  const toInsert = REMEDIES.filter(r => !existingIds.has(r.id));
  const toUpdate = REMEDIES.filter(r => existingIds.has(r.id));
  const toDeleteFromDB = existingRemedies?.filter(r => !sourceIds.has(r.id)) || [];

  console.log(`  Existing in DB: ${existingIds.size}`);
  console.log(`  In local source: ${sourceIds.size}`);
  console.log(`  Would INSERT: ${toInsert.length}`);
  console.log(`  Would UPDATE: ${toUpdate.length}`);
  console.log(`  Would DELETE (orphaned in DB): ${toDeleteFromDB.length}`);

  if (toDeleteFromDB.length > 0) {
    console.log('  Orphaned IDs:', toDeleteFromDB.map(r => r.id).join(', '));
  }

  // Confirm before proceeding
  console.log('\n--- PROCEEDING WITH UPSERT ---');
  
  let successCount = 0;
  let errorCount = 0;
  let paperInsertCount = 0;
  let paperErrorCount = 0;

  for (const remedy of REMEDIES) {
    const { remedy: remedyData, papers } = mapRemedyForDB(remedy);

    // Upsert remedy
    const { error: remedyError } = await supabase
      .from('remedies')
      .upsert(remedyData, { onConflict: 'id' });

    if (remedyError) {
      console.error(`  ✗ Failed to upsert ${remedy.id} (${remedy.name}):`, remedyError.message);
      errorCount++;
    } else {
      successCount++;
      if (successCount % 10 === 0 || successCount === REMEDIES.length) {
        console.log(`  ✓ Upserted ${successCount}/${REMEDIES.length} remedies...`);
      }

      // Delete existing papers for this remedy (to avoid duplicates on re-run)
      const { error: delError } = await supabase
        .from('research_papers')
        .delete()
        .eq('remedy_id', remedy.id);

      if (delError) {
        console.warn(`  ⚠ Could not clear old papers for ${remedy.id}:`, delError.message);
      }

      // Insert new papers
      if (papers.length > 0) {
        const papersWithRemedyId = papers.map(p => ({
          ...p,
          remedy_id: remedy.id
        }));

        const { error: paperError } = await supabase
          .from('research_papers')
          .insert(papersWithRemedyId);

        if (paperError) {
          console.error(`  ✗ Failed to insert papers for ${remedy.id}:`, paperError.message);
          paperErrorCount++;
        } else {
          paperInsertCount += papers.length;
        }
      }
    }
  }

  console.log('\n=== RESTORE COMPLETE ===');
  console.log(`Remedies upserted: ${successCount}`);
  console.log(`Remedy errors: ${errorCount}`);
  console.log(`Research papers inserted: ${paperInsertCount}`);
  console.log(`Research paper errors: ${paperErrorCount}`);

  // Verify final counts
  const { count: finalRemedyCount } = await supabase
    .from('remedies')
    .select('*', { count: 'exact', head: true });

  const { count: finalPaperCount } = await supabase
    .from('research_papers')
    .select('*', { count: 'exact', head: true });

  console.log(`\nFinal remedies count: ${finalRemedyCount}`);
  console.log(`Final research_papers count: ${finalPaperCount}`);

  // Spot check a few
  console.log('\n--- SPOT CHECK ---');
  const spotCheckIds = ['rem_001', 'rem_h04', 'rem_mg01', 'rem_bt01', 'rem_kp01'];
  for (const id of spotCheckIds) {
    const { data, error } = await supabase
      .from('remedies')
      .select('id, name, category, research_papers(id, url, journal)')
      .eq('id', id)
      .single();

    if (error) {
      console.log(`  ${id}: ERROR - ${error.message}`);
    } else {
      const papers = data.research_papers?.length || 0;
      console.log(`  ${id}: ${data.name} (${data.category}) | papers: ${papers}`);
      if (data.research_papers?.length) {
        data.research_papers.forEach(p => console.log(`    -> ${p.journal}: ${p.url}`));
      }
    }
  }
}

restoreRemedies().catch(console.error);