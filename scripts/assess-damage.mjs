import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function assessDamage() {
  console.log('=== ASSESSING MIGRATION 045 DAMAGE ===\n');

  // 1. Count remedies
  const { count: remedyCount, error: remedyError } = await supabase
    .from('remedies')
    .select('*', { count: 'exact', head: true });

  if (remedyError) {
    console.error('Error counting remedies:', remedyError);
  } else {
    console.log(`remedies table row count: ${remedyCount}`);
  }

  // 2. Count research_papers
  const { count: paperCount, error: paperError } = await supabase
    .from('research_papers')
    .select('*', { count: 'exact', head: true });

  if (paperError) {
    console.error('Error counting research_papers:', paperError);
  } else {
    console.log(`research_papers table row count: ${paperCount}`);
  }

  // 3. Check remedies with their research paper counts
  const { data: remediesWithPapers, error: joinError } = await supabase
    .from('remedies')
    .select(`
      id,
      name,
      category,
      research_papers ( id, title, url, journal )
    `);

  if (joinError) {
    console.error('Error fetching remedies with papers:', joinError);
  } else {
    console.log(`\n=== REMEDIES WITH PAPER COUNTS ===`);
    remediesWithPapers.forEach(r => {
      const paperCount = r.research_papers?.length || 0;
      console.log(`  ${r.id} | ${r.name} (${r.category}) | papers: ${paperCount}`);
      if (r.research_papers?.length) {
        r.research_papers.forEach(p => console.log(`    -> ${p.journal}: ${p.url}`));
      }
    });
    console.log(`\nTotal remedies returned: ${remediesWithPapers.length}`);
  }

  // 4. Check specific known remedies from local data
  console.log('\n=== SPOT CHECK: KNOWN REMEDIES FROM LOCAL DATA ===');
  const knownRemedies = [
    'rem_001', // Peppermint Oil on Temples
    'rem_h04', // Ibuprofen
    'rem_004', // Drink More Water
    'rem_005', // Feverfew
    'rem_006', // Cetirizine
    'rem_007', // Salt Water Nose Rinse
    'rem_008', // Albuterol
    'rem_009', // Cranberry
    'rem_010', // D-Mannose
    'rem_mg01', // Magnesium for migraine
    'rem_bt01', // MBSR for burnout
    'rem_np01', // Neck exercises
    'rem_sp01', // Shoulder exercises
    'rem_kp01', // Diclofenac for knee
    'rem_ep01', // Herbal ear drops
    'rem_pms01', // Calcium for PMS
    'rem_fv01', // Acetaminophen for fever
    'rem_hg01', // NAC for hangover
    'rem_dh01', // ORS for dehydration
    'rem_cs01', // Lemon balm for cold sore
    'rem_hd01', // Wrist splint for hand pain
    'rem_rs01', // Azelaic acid for rosacea
  ];

  for (const id of knownRemedies) {
    const { data, error } = await supabase
      .from('remedies')
      .select('id, name, category, research_papers(id, url, journal)')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log(`  ${id}: NOT FOUND (deleted)`);
      } else {
        console.log(`  ${id}: ERROR - ${error.message}`);
      }
    } else {
      const papers = data.research_papers?.length || 0;
      console.log(`  ${id}: FOUND - ${data.name} (${data.category}) | papers: ${papers}`);
    }
  }

  // 5. Count remedies by category
  const { data: categoryCounts, error: catError } = await supabase
    .from('remedies')
    .select('category');

  if (catError) {
    console.error('Error counting by category:', catError);
  } else {
    const counts = {};
    categoryCounts.forEach(r => {
      counts[r.category] = (counts[r.category] || 0) + 1;
    });
    console.log('\n=== REMEDIES BY CATEGORY ===');
    Object.entries(counts).forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count}`);
    });
  }

  // 6. Check symptom_remedies mapping
  const { count: mappingCount, error: mapError } = await supabase
    .from('symptom_remedies')
    .select('*', { count: 'exact', head: true });

  if (mapError) {
    console.error('Error counting symptom_remedies:', mapError);
  } else {
    console.log(`\nsymptom_remedies table row count: ${mappingCount}`);
  }
}

assessDamage().catch(console.error);