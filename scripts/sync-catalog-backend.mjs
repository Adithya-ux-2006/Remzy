#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { buildRuntimeRemedies } from '../src/data/runtimeCatalog.js';

function loadEnv() {
  const values = { ...process.env };
  try {
    for (const line of readFileSync(resolve('.env'), 'utf8').split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (match && !values[match[1]]) values[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
    }
  } catch {
    // CI may supply environment variables directly.
  }
  return values;
}

function text(value, fallback = '') {
  if (Array.isArray(value)) return value.filter(Boolean).join('\n');
  return value == null ? fallback : String(value);
}

function list(value) {
  return Array.isArray(value) ? value.filter(Boolean).map(String) : [];
}

function category(value) {
  if (value === 'Conventional') return 'OTC';
  if (value === 'Ayurveda') return 'Natural';
  return value;
}

function remedyRow(remedy) {
  return {
    id: remedy.id,
    name: text(remedy.name, remedy.id),
    category: category(remedy.category),
    rating: Number(remedy.rating) || 0,
    review_count: Number.parseInt(remedy.reviewCount, 10) || 0,
    short_description: text(remedy.shortDescription),
    long_description: text(remedy.longDescription),
    how_to_use: text(remedy.howToUse),
    warnings: text(remedy.warnings),
    allergen_tags: list(remedy.allergen_tags || remedy.allergenTags),
    contraindications: list(remedy.contraindications),
    ingredients: list(remedy.ingredients),
    time_to_effect: text(remedy.timeToEffect, 'Varies'),
    difficulty: text(remedy.difficulty, 'Easy'),
    cost: text(remedy.cost, 'Varies'),
    is_featured: Boolean(remedy.isFeatured),
    is_purchasable: remedy.isPurchasable ?? remedy.category !== 'Lifestyle',
    child_safe: remedy.childSafe ?? null,
    child_safety_note: text(remedy.childSafetyNote),
    tagline: text(remedy.tagline),
    updated_at: new Date().toISOString(),
  };
}

function symptomLinks(remedies, validSymptomIds) {
  const links = new Map();
  remedies.forEach((remedy, remedyIndex) => {
    const primary = new Set(remedy.primarySymptoms || []);
    const secondary = new Set(remedy.secondarySymptoms || []);
    const all = new Set([...primary, ...secondary, ...(remedy.symptoms || [])]);
    for (const symptomId of all) {
      if (!validSymptomIds.has(symptomId)) continue;
      const matchStrength = secondary.has(symptomId) && !primary.has(symptomId) ? 'secondary' : 'primary';
      links.set(`${remedy.id}__${symptomId}`, {
        remedy_id: remedy.id,
        symptom_id: symptomId,
        match_strength: matchStrength,
        evidence_score: matchStrength === 'primary' ? 8 : 4,
        priority_rank: Math.max(1, 10 - Math.floor(remedyIndex / 15)),
      });
    }
  });
  return [...links.values()];
}

async function upsertBatches(table, rows, onConflict, size = 100) {
  for (let index = 0; index < rows.length; index += size) {
    const { error } = await supabase.from(table).upsert(rows.slice(index, index + size), { onConflict });
    if (error) throw error;
  }
}

const env = loadEnv();
if (!env.VITE_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
}

const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});

const remedies = buildRuntimeRemedies();
const [{ data: symptoms, error: symptomError }, { data: before, error: beforeError }] = await Promise.all([
  supabase.from('symptoms').select('id'),
  supabase.from('remedies').select('id'),
]);
if (symptomError) throw symptomError;
if (beforeError) throw beforeError;

const validSymptomIds = new Set((symptoms || []).map((row) => row.id));
const beforeIds = new Set((before || []).map((row) => row.id));
const remedyRows = remedies.map(remedyRow);
const links = symptomLinks(remedies, validSymptomIds);

await upsertBatches('remedies', remedyRows, 'id');
await upsertBatches('remedy_symptoms', links, 'remedy_id,symptom_id');

const [{ count: remedyCount, error: countError }, { count: linkCount, error: linkCountError }] = await Promise.all([
  supabase.from('remedies').select('*', { count: 'exact', head: true }),
  supabase.from('remedy_symptoms').select('*', { count: 'exact', head: true }),
]);
if (countError) throw countError;
if (linkCountError) throw linkCountError;

console.log(`Catalog backend sync: ${remedyRows.length} unique remedies and ${links.length} symptom links processed.`);
console.log(`New remedy IDs added: ${remedyRows.filter((row) => !beforeIds.has(row.id)).length}. Live totals: ${remedyCount} remedies, ${linkCount} links.`);
console.log('Evidence publications, claims, reviews, and approvals were not modified.');
