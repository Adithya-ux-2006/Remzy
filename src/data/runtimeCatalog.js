import { REMEDIES } from './remedies.js';
import { LOCAL_REMEDIES } from './localCatalog.js';
import { applyLegacyBatch1 } from './legacyRemedyBatch1.js';
import { applyLegacyBatch2 } from './legacyRemedyBatch2.js';
import { applyLegacyBatch3 } from './legacyRemedyBatch3.js';
import { applyLegacyBatch4 } from './legacyRemedyBatch4.js';
import { applyLegacyBatch5 } from './legacyRemedyBatch5.js';
import { applyLegacyEvidenceTierOverlay } from './legacyEvidenceTierOverlay.js';
import { applyMultiSourceRemedyBatch1 } from './multiSourceRemedyBatch1.js';

export function buildRuntimeRemedies() {
  const legacyRemedies = applyLegacyEvidenceTierOverlay(
    applyLegacyBatch5(
      applyLegacyBatch4(
        applyLegacyBatch3(
          applyLegacyBatch2(
            applyLegacyBatch1(LOCAL_REMEDIES),
          ),
        ),
      ),
    ),
  );

  const remedies = applyMultiSourceRemedyBatch1([...REMEDIES, ...legacyRemedies]);
  const seen = new Set();
  return remedies.filter((remedy) => {
    if (!remedy?.id || seen.has(remedy.id)) return false;
    seen.add(remedy.id);
    return true;
  });
}
