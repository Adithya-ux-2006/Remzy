// Auto-generated barrel import for all remedy batches.
import { applyRemedyBatch1 } from './remedyBatch1.js';
import { applyRemedyBatch2 } from './remedyBatch2.js';
import { applyRemedyBatch3 } from './remedyBatch3.js';
import { applyRemedyBatch4 } from './remedyBatch4.js';
import { applyRemedyBatch5 } from './remedyBatch5.js';
import { applyRemedyBatch6 } from './remedyBatch6.js';
import { applyRemedyBatch7 } from './remedyBatch7.js';
import { applyRemedyBatch8 } from './remedyBatch8.js';
import { applyRemedyBatch9 } from './remedyBatch9.js';
import { applyRemedyBatch10 } from './remedyBatch10.js';
import { applyRemedyBatch11 } from './remedyBatch11.js';
import { applyRemedyBatch12 } from './remedyBatch12.js';
import { applyRemedyBatch13 } from './remedyBatch13.js';
import { applyRemedyBatch14 } from './remedyBatch14.js';
import { applyRemedyBatch15 } from './remedyBatch15.js';
import { applyRemedyBatch16 } from './remedyBatch16.js';
import { applyRemedyBatch17 } from './remedyBatch17.js';
import { applyRemedyBatch18 } from './remedyBatch18.js';
import { applyRemedyBatch19 } from './remedyBatch19.js';
import { applyRemedyBatch20 } from './remedyBatch20.js';
import { applyRemedyBatch21 } from './remedyBatch21.js';
import { applyRemedyBatch22 } from './remedyBatch22.js';
import { applyRemedyBatch23 } from './remedyBatch23.js';
import { applyRemedyBatch24 } from './remedyBatch24.js';
import { applyRemedyBatch25 } from './remedyBatch25.js';
import { applyRemedyBatch26 } from './remedyBatch26.js';
import { applyRemedyBatch27 } from './remedyBatch27.js';
import { applyRemedyBatch28 } from './remedyBatch28.js';
import { applyRemedyBatch29 } from './remedyBatch29.js';
import { applyRemedyBatch30 } from './remedyBatch30.js';
import { applyRemedyBatch31 } from './remedyBatch31.js';
import { applyRemedyBatch32 } from './remedyBatch32.js';
import { applyRemedyBatch33 } from './remedyBatch33.js';
import { applyRemedyBatch34 } from './remedyBatch34.js';
import { applyRemedyBatch35 } from './remedyBatch35.js';
import { applyRemedyBatch36 } from './remedyBatch36.js';
import { applyRemedyBatch37 } from './remedyBatch37.js';
import { applyRemedyBatch38 } from './remedyBatch38.js';
import { applyRemedyBatch39 } from './remedyBatch39.js';
import { applyRemedyBatch40 } from './remedyBatch40.js';
import { applyRemedyBatch41 } from './remedyBatch41.js';
import { applyRemedyBatch42 } from './remedyBatch42.js';
import { applyRemedyBatch43 } from './remedyBatch43.js';
import { applyRemedyBatch44 } from './remedyBatch44.js';
import { applyRemedyBatch45 } from './remedyBatch45.js';
import { applyRemedyBatch46 } from './remedyBatch46.js';
import { applyRemedyBatch47 } from './remedyBatch47.js';
import { applyRemedyBatch48 } from './remedyBatch48.js';

const batchFns = [
  applyRemedyBatch1, applyRemedyBatch2, applyRemedyBatch3, applyRemedyBatch4,
  applyRemedyBatch5, applyRemedyBatch6, applyRemedyBatch7, applyRemedyBatch8,
  applyRemedyBatch9, applyRemedyBatch10, applyRemedyBatch11, applyRemedyBatch12,
  applyRemedyBatch13, applyRemedyBatch14, applyRemedyBatch15, applyRemedyBatch16,
  applyRemedyBatch17, applyRemedyBatch18, applyRemedyBatch19, applyRemedyBatch20,
  applyRemedyBatch21, applyRemedyBatch22, applyRemedyBatch23, applyRemedyBatch24,
  applyRemedyBatch25, applyRemedyBatch26, applyRemedyBatch27, applyRemedyBatch28,
  applyRemedyBatch29, applyRemedyBatch30, applyRemedyBatch31, applyRemedyBatch32,
  applyRemedyBatch33, applyRemedyBatch34, applyRemedyBatch35, applyRemedyBatch36,
  applyRemedyBatch37, applyRemedyBatch38, applyRemedyBatch39,
  applyRemedyBatch40,
  applyRemedyBatch41,
  applyRemedyBatch42,
  applyRemedyBatch43,
  applyRemedyBatch44,
  applyRemedyBatch45,
  applyRemedyBatch46,
  applyRemedyBatch47,
  applyRemedyBatch48,
];

export function applyAllRemedyBatches(remedies) {
  let result = remedies;
  for (const fn of batchFns) result = fn(result);
  return result;
}
