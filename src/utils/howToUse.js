/**
 * Convert legacy how-to-use text into displayable steps.
 *
 * Older catalog records store numbered instructions either on separate lines
 * or in one paragraph ("1. First step. 2. Second step."). Splitting only on
 * newlines collapses the latter into one misleading timeline item.
 */
export function parseHowToUseSteps(value) {
  if (typeof value !== 'string') return [];

  const text = value.trim();
  if (!text) return [];

  const numberedSteps = text
    .split(/(?:^|\s+)(?=\d+[.)]\s+)/)
    .map((step) => step.replace(/^\d+[.)]\s*/, '').trim())
    .filter(Boolean);

  if (numberedSteps.length > 1 || /^\d+[.)]\s+/.test(text)) {
    return numberedSteps;
  }

  return text
    .split(/\r?\n+/)
    .map((step) => step.replace(/^[-•]\s*/, '').trim())
    .filter(Boolean);
}
