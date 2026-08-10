// Remedies hidden after semantic review found that the linked source did not
// directly support the displayed population, intervention, or outcome.
// A working URL is not enough: each entry must pass all three checks before it
// can return to recommendations.
export const EVIDENCE_QUARANTINE = Object.freeze({
  rem_008: 'The cited trial studied an albuterol-budesonide combination, not albuterol alone.',
  rem_010: 'The citation concerns recurrent-UTI prophylaxis and does not support treating an active UTI.',
  rem_014: 'The cited trial measured testosterone, not improvement in libido.',
  rem_019: 'The cited rinse trial concerned peri-implant mucositis after debridement, not general oral symptoms.',
  rem_020: 'The trial population had implant overdentures and does not establish a general bruxism remedy.',
  rem_021: 'Using RICE as a comparator does not establish that the full RICE protocol is effective.',
  rem_022: 'The cited burn study used a diabetic pig model, not people.',
  rem_024: 'The cited study was a laboratory nanoemulsion/clotrimazole experiment, not clinical tea-tree-oil treatment.',
  rem_025: 'The cited CPAP paper studied cardiovascular outcomes in a selected coronary-disease population, not the displayed treatment claim.',
  rem_026: 'The citation concerns iron supplementation in blood donors, not unscreened fatigue or general anemia treatment.',
  rem_027: 'The study tested an alginate-antacid combination and does not establish antacid alone as the displayed remedy.',
  rem_029: 'The linked literature review does not establish witch hazel as an effective hemorrhoid treatment.',
  rem_030: 'The evidence is specific to nausea and vomiting in early pregnancy, while the remedy was presented for general nausea.',
  rem_031: 'The study involved tinnitus after sudden sensorineural hearing loss, not general tinnitus or brain symptoms.',
  rem_033: 'A mechanistic narrative review does not demonstrate that B-complex pills treat neuropathy, fatigue, or hair loss.',
  rem_034: 'The study concerns diagnosed piriformis syndrome and two therapist techniques, not a generic buttock stretch for sciatica.',
  rem_035: 'The trial combined calf strengthening with compression stockings, so it cannot isolate the stocking claim.',
  rem_037: 'Heart-failure trials do not support recommending CoQ10 for palpitations or nonspecific low energy.',
  rem_038: 'Endometriosis-specific diet literature does not establish a general treatment for period pain.',
  rem_039: 'The proprietary biotin-and-silica extract trial does not support generic high-dose biotin for hair loss.',
  rem_041: 'A study of exercise response in restless legs does not establish the displayed stretching protocol.',
  rem_043: 'Combined CBT and sound therapy does not establish white noise alone as a tinnitus treatment.',
  rem_045: 'A study of adjunct hip strengthening and electrical stimulation does not isolate Kegel exercises.',
  rem_101: 'An observational association in women with multiple sclerosis does not show that a sleep-and-stress routine treats low libido.',
  rem_103: 'The cited trial studied women receiving vaginismus treatment and cannot support erectile-difficulty claims in men.',
  rem_106: 'Device-based thermal pulsation is not evidence for a household warm-cloth intervention.',
  rem_bt01: 'The cited meta-analysis concerns physicians and does not directly support a general-population treatment claim.',
  rem_ep01: 'Pediatric otitis-media ear-drop evidence is too population- and diagnosis-specific for unsupervised general ear pain.',
  rem_hg01: 'The randomized trial did not establish an overall hangover-prevention benefit for NAC.',
  rem_mg01: 'The cited migraine trial used a different magnesium formulation than the displayed magnesium oxide product.',
});

export function isEvidenceQuarantined(remedy) {
  return Boolean(remedy?.id && EVIDENCE_QUARANTINE[remedy.id]);
}

export function filterEvidenceReviewedRemedies(remedies = []) {
  return remedies.filter((remedy) => !isEvidenceQuarantined(remedy));
}
