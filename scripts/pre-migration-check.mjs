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

async function preMigrationCheck() {
  console.log('=== PRE-MIGRATION DATA STATE CHECK ===\n');

  // 1. Count remedies in DB
  const { count: dbRemedyCount, error: rErr } = await supabase
    .from('remedies')
    .select('*', { count: 'exact', head: true });

  if (rErr) {
    console.error('Error counting remedies:', rErr);
    return;
  }

  // 2. Count research_papers in DB
  const { count: dbPaperCount, error: pErr } = await supabase
    .from('research_papers')
    .select('*', { count: 'exact', head: true });

  if (pErr) {
    console.error('Error counting research_papers:', pErr);
    return;
  }

  // 3. Count research_papers with REAL PubMed URLs
  const { data: papersSample, error: psErr } = await supabase
    .from('research_papers')
    .select('url');

  let realPubMedCount = 0;
  if (!psErr && papersSample) {
    realPubMedCount = papersSample.filter(p => 
      p.url && /pubmed\.ncbi\.nlm\.nih\.gov\/\d+/.test(p.url)
    ).length;
  }

  // 4. Local source counts
  const localRemedyCount = REMEDIES.length;
  let localPaperCount = 0;
  for (const r of REMEDIES) {
    const papers = (r.researchPapers || []).filter(p => 
      p.url && /pubmed\.ncbi\.nlm\.nih\.gov\/\d+/.test(p.url)
    );
    const links = (r.researchLinks || []).filter(l => 
      l.url && /pubmed\.ncbi\.nlm\.nih\.gov\/\d+/.test(l.url)
    );
    localPaperCount += papers.length + links.length;
  }

  console.log('--- REMEDIES TABLE ---');
  console.log(`  DB:           ${dbRemedyCount}`);
  console.log(`  Local source: ${localRemedyCount}`);
  console.log(`  Delta:        ${dbRemedyCount - localRemedyCount} (${dbRemedyCount > localRemedyCount ? 'EXTRA in DB' : 'MISSING from DB'})`);

  console.log('\n--- RESEARCH_PAPERS TABLE ---');
  console.log(`  DB total:           ${dbPaperCount}`);
  console.log(`  DB real PubMed:     ${realPubMedCount}`);
  console.log(`  Local real PubMed:  ${localPaperCount}`);
  console.log(`  Delta (real):       ${dbPaperCount - localPaperCount}`);

  console.log('\n--- DATA INTEGRITY CHECKS ---');
  const checks = [];

  // Check 1: Remedy count match
  if (dbRemedyCount !== localRemedyCount) {
    checks.push({ 
      name: 'Remedy count match', 
      pass: false, 
      detail: `DB has ${dbRemedyCount}, local has ${localRemedyCount}` 
    });
  } else {
    checks.push({ name: 'Remedy count match', pass: true });
  }

  // Check 2: Real PubMed papers roughly match
  if (realPubMedCount < localPaperCount * 0.8) {
    checks.push({ 
      name: 'Research papers completeness', 
      pass: false, 
      detail: `DB has ${realPubMedCount} real PubMed papers, local has ${localPaperCount}` 
    });
  } else {
    checks.push({ name: 'Research papers completeness', pass: true });
  }

  // Check 3: No fake search-query URLs in DB
  const { data: fakeCheck, error: fcErr } = await supabase
    .from('research_papers')
    .select('url')
    .ilike('url', '%?term=%');

  if (!fcErr && fakeCheck && fakeCheck.length > 0) {
    checks.push({ 
      name: 'No fake search-query URLs', 
      pass: false, 
      detail: `${fakeCheck.length} papers have fake ?term= URLs` 
    });
  } else {
    checks.push({ name: 'No fake search-query URLs', pass: true });
  }

  // Check 4: All DB remedies have at least one paper
  const { data: allDbRemedies, error: orErr } = await supabase
    .from('remedies')
    .select('id, name');

  const localIds = new Set(REMEDIES.map(r => r.id));
  const orphanedInDb = allDbRemedies?.filter(r => !localIds.has(r.id)) || [];

  if (orphanedInDb.length > 0) {
    checks.push({ 
      name: 'No orphaned remedies', 
      pass: false, 
      detail: `${orphanedInDb.length} remedies in DB not in local source: ${orphanedInDb.map(r => r.id).join(', ')}` 
    });
  } else {
    checks.push({ name: 'No orphaned remedies', pass: true });
  }

  // Print results
  console.log('\n--- RESULTS ---');
  let allPass = true;
  for (const c of checks) {
    const icon = c.pass ? '✓' : '✗';
    console.log(`  ${icon} ${c.name}`);
    if (!c.pass) {
      console.log(`     ${c.detail}`);
      allPass = false;
    }
  }

  console.log(`\n${allPass ? '✓ ALL CHECKS PASSED' : '✗ CHECKS FAILED - DO NOT RUN DESTRUCTIVE MIGRATION'}`);
  
  if (!allPass) {
    console.log('\nRECOMMENDATION: Fix data drift before running any DELETE/DROP migration.');
    process.exit(1);
  }
}

preMigrationCheck().catch(console.error);