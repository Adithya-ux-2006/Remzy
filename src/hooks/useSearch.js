import { useState, useEffect } from 'react';
import { getApiUrl } from '../utils/api';

function getSearchWords(query) {
  const normalized = query.toLowerCase().trim();
  const expanded = [normalized].join(' ');

  return expanded
    .split(/\s+/)
    .map((word) => word.replace(/[^a-z0-9]/g, ''))
    .filter((word) => word.length > 2);
}

export function searchRemedies(query, remedies) {
  if (!query || query.trim().length < 2) return [];

  const words = getSearchWords(query);
  if (words.length === 0) return [];

  return (remedies || []).filter((remedy) => {
    const searchableText = [
      remedy.name,
      remedy.shortDescription,
      remedy.longDescription,
      remedy.howToUse,
      Array.isArray(remedy.warnings) ? remedy.warnings.join(' ') : remedy.warnings,
      ...(remedy.symptoms || []),
      ...(remedy.keywordTags || []),
      ...(remedy.allergen_tags || []),
      ...(remedy.contraindications || []),
    ].join(' ').toLowerCase();

    if (words.length === 1) {
      return words.some((word) => searchableText.includes(word));
    }

    return words.every((word) => searchableText.includes(word));
  });
}

export async function getClosestSymptomCategory(query) {
  const response = await fetch(getApiUrl('/api/ai-category-fallback'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) return 'none';

  const payload = await response.json();
  return payload.category || 'none';
}

export function useSearch(initialValue = '', delay = 300) {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [debouncedTerm, setDebouncedTerm] = useState(initialValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm, delay]);

  return {
    searchTerm,
    setSearchTerm,
    debouncedTerm,
  };
}
