/**
 * engine/engine.test.ts — מטריצת בדיקות מקיפה למנוע הזכויות המשוכתב (תשפ"ו)
 * ========================================================================
 * מחשבון זכויות לסטודנטים במילואים — אוניברסיטת חיפה
 *
 * Authoritative source: /Users/davidulman/Programing/law/miluim/claude.md §3–§5.
 *
 * Covers FIX 1 (union), FIX 2 (25% time G3-only), FIX 3 (day-threshold
 * extensions), FIX 4 (statutory baseline floor), FIX 5 (spouse/parent gate),
 * FIX 6 (grade-conversion for security forces), the exemption-ladder collapse,
 * AND the תשפ"ו semester model: half-day totals, per-semester best-of-A/B,
 * multi-bucket selection + default, doctorate not-relevant routing, and the
 * validate.ts anomaly flags (lecturer notes 2–6).
 *
 * Pure TypeScript — no React/Next. Run via `npx vitest run`.
 */

import { describe, it, expect } from 'vitest';
import type { Profile, StudentType, DegreeLevel } from './types';
import { ALL_BENEFIT_IDS } from './types';
import { qualifyingSubgroups } from './subgroups';
import { BENEFITS } from './benefits';
import { BASELINE_RIGHTS } from './baseline';
import { resolveRights, classifyTopGroup } from './resolve';
import { normalizeProfile, totalMiluim, type RawProfile } from './normalize';
import { validateProfile } from './validate';

/* ------------------------------------------------------------------ *
 * Helpers                                                             *
 * ------------------------------------------------------------------ */

/** Build a normalized Profile with zero defaults; override only what matters. */
function profile(overrides: RawProfile = {}): Profile {
  return normalizeProfile({
    studentType: 'reserves',
    degreeLevel: 'bachelor',
    semesterADays: 0,
    semesterBDays: 0,
    preSemesterDays: 0,
    cumulativeSince2024: 0,
    cumulativeSinceOct2023: 0,
    isFrontLine: false,
    isParentWithChildren: false,
    ...overrides,
  });
}

/** Set of eligible benefit ids for a profile (post exemption-collapse). */
function eligibleIds(p: Profile): Set<string> {
  return new Set(resolveRights(p).eligible.map((b) => b.id));
}

/** Set of locked benefit ids for a profile. */
function lockedIds(p: Profile): Set<string> {
  return new Set(resolveRights(p).locked.map((b) => b.id));
}

/** Set of not-relevant (degree-excluded) benefit ids. */
function notRelevantIds(p: Profile): Set<string> {
  return new Set(resolveRights(p).notRelevant.map((nr) => nr.benefit.id));
}

/* ------------------------------------------------------------------ *
 * 0. Contract integrity                                               *
 * ------------------------------------------------------------------ */

describe('contract integrity', () => {
  it('BENEFITS implements every id in ALL_BENEFIT_IDS, exactly once', () => {
    const catalogIds = BENEFITS.map((b) => b.id).sort();
    const contractIds = [...ALL_BENEFIT_IDS].sort();
    expect(catalogIds).toEqual(contractIds);
    expect(new Set(catalogIds).size).toBe(catalogIds.length);
  });

  it('every benefit + baseline has the required string fields', () => {
    for (const b of BENEFITS) {
      expect(b.id).toBeTruthy();
      expect(b.titleHe).toBeTruthy();
      expect(b.descriptionHe).toBeTruthy();
      expect(b.availableFromHe).toBeTruthy();
      expect(typeof b.eligible).toBe('function');
    }
    for (const r of BASELINE_RIGHTS) {
      expect(r.id).toBeTruthy();
      expect(r.titleHe).toBeTruthy();
      expect(r.descriptionHe).toBeTruthy();
    }
  });

  it('eligible ∪ locked ∪ notRelevant always partitions the whole catalog', () => {
    const p = profile({ studentType: 'reserves', semesterADays: 40, isFrontLine: true });
    const r = resolveRights(p);
    expect(r.eligible.length + r.locked.length + r.notRelevant.length).toBe(
      BENEFITS.length,
    );
    const ids = new Set(
      [...r.eligible, ...r.locked, ...r.notRelevant.map((nr) => nr.benefit)].map(
        (b) => b.id,
      ),
    );
    expect(ids.size).toBe(BENEFITS.length);
  });
});

/* ------------------------------------------------------------------ *
 * 1. G1 — reservist with 12 semester days (10–21 range)               *
 * ------------------------------------------------------------------ */

describe('G1 — מילואים מינימלי (12 ימי סמסטר א׳)', () => {
  const p = profile({ studentType: 'reserves', semesterADays: 12 });

  it('subgroups = {G1} only', () => {
    expect([...qualifyingSubgroups(p)].sort()).toEqual(['G1']);
  });

  it('gets copy-cards, private-lessons, exemption-2nz', () => {
    const e = eligibleIds(p);
    expect(e.has('copy-cards')).toBe(true);
    expect(e.has('private-lessons')).toBe(true);
    expect(e.has('exemption-2nz')).toBe(true);
  });

  it('does NOT get 25% time, grade conversion, 6nz/8nz', () => {
    const e = eligibleIds(p);
    expect(e.has('extra-time-25')).toBe(false);
    expect(e.has('grade-conversion-g3')).toBe(false);
    expect(e.has('grade-conversion-g2')).toBe(false);
    expect(e.has('exemption-6nz')).toBe(false);
    expect(e.has('exemption-8nz')).toBe(false);
  });

  it('single bucket → multiBucket=false', () => {
    const r = resolveRights(p);
    expect(r.buckets).toHaveLength(1);
    expect(r.multiBucket).toBe(false);
    expect(r.defaultBucketId).toBe('G1');
  });

  it('baseline floor present (FIX 4)', () => {
    expect(resolveRights(p).baseline).toHaveLength(BASELINE_RIGHTS.length);
  });
});

/* ------------------------------------------------------------------ *
 * 2. G2_RESERVES — reservist with 25 semester days                    *
 * ------------------------------------------------------------------ */

describe('G2_RESERVES — מילואים משמעותי (25 ימי סמסטר א׳)', () => {
  it('subgroups = {G2_RESERVES, G1} (monotonic closure)', () => {
    const p = profile({ studentType: 'reserves', semesterADays: 25 });
    expect([...qualifyingSubgroups(p)].sort()).toEqual(['G1', 'G2_RESERVES']);
  });

  it('gets 6nz, grade-conversion-g2, two-of-three, choose-higher, schedule, prereq-skip', () => {
    const p = profile({ studentType: 'reserves', semesterADays: 25 });
    const e = eligibleIds(p);
    expect(e.has('exemption-6nz')).toBe(true);
    expect(e.has('grade-conversion-g2')).toBe(true);
    expect(e.has('exam-two-of-three')).toBe(true);
    expect(e.has('choose-higher-grade')).toBe(true);
    expect(e.has('schedule-flexibility')).toBe(true);
    expect(e.has('skip-prerequisites')).toBe(true);
  });

  it('does NOT get 25% time (FIX 2) nor 8nz nor grade-conversion-g3', () => {
    const p = profile({ studentType: 'reserves', semesterADays: 25 });
    const e = eligibleIds(p);
    expect(e.has('extra-time-25')).toBe(false);
    expect(e.has('exemption-8nz')).toBe(false);
    expect(e.has('grade-conversion-g3')).toBe(false);
  });

  it('extension only if total (A+B)>=42 (FIX 3)', () => {
    const noExt = profile({ studentType: 'reserves', semesterADays: 25 });
    expect(eligibleIds(noExt).has('extend-studies-1sem')).toBe(false);

    const withExt = profile({ studentType: 'reserves', semesterADays: 25, semesterBDays: 25 });
    const e = eligibleIds(withExt);
    expect(e.has('extend-studies-1sem')).toBe(true);
    expect(e.has('extend-studies-2sem')).toBe(false);
  });

  it('exemption ladder collapse: 6nz eligible, 2nz demoted to locked', () => {
    const p = profile({ studentType: 'reserves', semesterADays: 25 });
    const r = resolveRights(p);
    expect(r.eligible.map((b) => b.id)).toContain('exemption-6nz');
    expect(r.eligible.map((b) => b.id)).not.toContain('exemption-2nz');
    expect(r.locked.map((b) => b.id)).toContain('exemption-2nz');
  });
});

/* ------------------------------------------------------------------ *
 * 3. G3_MILITARY — front-line reservist, 40 semester days             *
 * ------------------------------------------------------------------ */

describe('G3_MILITARY — מילואים נרחב (קדמי, 40 ימי סמסטר א׳)', () => {
  const base = { studentType: 'reserves' as StudentType, isFrontLine: true, semesterADays: 40 };

  it('subgroups = {G3_MILITARY, G2_RESERVES, G1}', () => {
    const p = profile({ ...base });
    expect([...qualifyingSubgroups(p)].sort()).toEqual(['G1', 'G2_RESERVES', 'G3_MILITARY']);
  });

  it('gets 8nz, 25% time, two-of-three, prereq-skip, thesis-extension, choose-higher', () => {
    const p = profile({ ...base });
    const e = eligibleIds(p);
    expect(e.has('exemption-8nz')).toBe(true);
    expect(e.has('extra-time-25')).toBe(true);
    expect(e.has('exam-two-of-three')).toBe(true);
    expect(e.has('skip-prerequisites')).toBe(true);
    expect(e.has('thesis-extension')).toBe(true);
    expect(e.has('choose-higher-grade')).toBe(true);
    expect(e.has('grade-conversion-g3')).toBe(true);
    expect(e.has('copy-cards')).toBe(true);
    expect(e.has('private-lessons')).toBe(true);
  });

  it('exemption collapse: ONLY 8nz in eligible, 6nz+2nz in locked', () => {
    const p = profile({ ...base });
    const e = eligibleIds(p);
    const l = lockedIds(p);
    expect(e.has('exemption-8nz')).toBe(true);
    expect(e.has('exemption-6nz')).toBe(false);
    expect(e.has('exemption-2nz')).toBe(false);
    expect(l.has('exemption-6nz')).toBe(true);
    expect(l.has('exemption-2nz')).toBe(true);
  });

  it('84-day extension only when total (A+B)>=84 (FIX 3)', () => {
    const under = profile({ ...base }); // total 40
    expect(eligibleIds(under).has('extend-studies-2sem')).toBe(false);

    const over = profile({ ...base, semesterBDays: 50 }); // total 90
    const e = eligibleIds(over);
    expect(e.has('extend-studies-2sem')).toBe(true);
    expect(e.has('extend-studies-1sem')).toBe(true);
  });

  it('classifyTopGroup headline = קבוצה 3 — צבאי', () => {
    const p = profile({ ...base });
    expect(classifyTopGroup(p)).toBe('קבוצה 3 — צבאי');
  });

  it('also triggers via 200 days since 2024 with 0 semester days', () => {
    const p = profile({ studentType: 'reserves', cumulativeSince2024: 200 });
    expect([...qualifyingSubgroups(p)].sort()).toEqual(['G1', 'G2_RESERVES', 'G3_MILITARY']);
  });
});

/* ------------------------------------------------------------------ *
 * 4. G3_CIVILIAN — evacuee with 0 service days                        *
 * ------------------------------------------------------------------ */

describe('G3_CIVILIAN — מפונה (0 ימי שירות)', () => {
  const p = profile({ studentType: 'evacuee' });

  it('subgroups = {G3_CIVILIAN} only', () => {
    expect([...qualifyingSubgroups(p)].sort()).toEqual(['G3_CIVILIAN']);
  });

  it('gets grade-conversion-g3, 25% time, alt-eval, thesis', () => {
    const e = eligibleIds(p);
    expect(e.has('grade-conversion-g3')).toBe(true);
    expect(e.has('extra-time-25')).toBe(true);
    expect(e.has('alt-eval-no-stem')).toBe(true);
    expect(e.has('thesis-extension')).toBe(true);
  });

  it('does NOT get waivers, extensions, copy-cards, reserve-only perks', () => {
    const e = eligibleIds(p);
    expect(e.has('exemption-8nz')).toBe(false);
    expect(e.has('exemption-6nz')).toBe(false);
    expect(e.has('exemption-2nz')).toBe(false);
    expect(e.has('extend-studies-1sem')).toBe(false);
    expect(e.has('extend-studies-2sem')).toBe(false);
    expect(e.has('copy-cards')).toBe(false);
    expect(e.has('private-lessons')).toBe(false);
    expect(e.has('exam-two-of-three')).toBe(false);
    expect(e.has('schedule-flexibility')).toBe(false);
  });

  it('baseline floor still present (FIX 4)', () => {
    expect(resolveRights(p).baseline).toHaveLength(BASELINE_RIGHTS.length);
  });
});

/* ------------------------------------------------------------------ *
 * 5. G2_SECURITY — security forces (FIX 6)                             *
 * ------------------------------------------------------------------ */

describe('G2_SECURITY — כוחות ביטחון', () => {
  const p = profile({ studentType: 'security_forces' });

  it('subgroups = {G2_SECURITY} only', () => {
    expect([...qualifyingSubgroups(p)].sort()).toEqual(['G2_SECURITY']);
  });

  it('FIX 6: gets grade-conversion-g2 + alt-eval-no-stem', () => {
    const e = eligibleIds(p);
    expect(e.has('grade-conversion-g2')).toBe(true);
    expect(e.has('alt-eval-no-stem')).toBe(true);
  });

  it('does NOT get 25% time, copy-cards, exemptions, two-of-three', () => {
    const e = eligibleIds(p);
    expect(e.has('extra-time-25')).toBe(false);
    expect(e.has('copy-cards')).toBe(false);
    expect(e.has('private-lessons')).toBe(false);
    expect(e.has('exemption-6nz')).toBe(false);
    expect(e.has('exam-two-of-three')).toBe(false);
    expect(e.has('schedule-flexibility')).toBe(false);
  });
});

/* ------------------------------------------------------------------ *
 * 6. MULTI-MEMBERSHIP (FIX 1) — evacuee who ALSO served 25 reserve days *
 * ------------------------------------------------------------------ */

describe('FIX 1 — חברות מרובה (מפונה ששירת גם 25 ימי מילואים)', () => {
  const p = profile({ studentType: 'evacuee', semesterADays: 25 });

  it('subgroups = UNION {G3_CIVILIAN, G2_RESERVES, G1}', () => {
    expect([...qualifyingSubgroups(p)].sort()).toEqual([
      'G1',
      'G2_RESERVES',
      'G3_CIVILIAN',
    ]);
  });

  it('gets G3 25% time AND the G2 reserve waiver (union of both)', () => {
    const e = eligibleIds(p);
    expect(e.has('extra-time-25')).toBe(true);
    expect(e.has('grade-conversion-g3')).toBe(true);
    expect(e.has('thesis-extension')).toBe(true);
    expect(e.has('alt-eval-no-stem')).toBe(true);
    expect(e.has('exemption-6nz')).toBe(true);
    expect(e.has('exam-two-of-three')).toBe(true);
    expect(e.has('grade-conversion-g2')).toBe(true);
    expect(e.has('copy-cards')).toBe(true);
    expect(e.has('private-lessons')).toBe(true);
  });

  it('exemption collapse picks 6nz (no G3_MILITARY → no 8nz)', () => {
    const e = eligibleIds(p);
    expect(e.has('exemption-8nz')).toBe(false);
    expect(e.has('exemption-6nz')).toBe(true);
    expect(e.has('exemption-2nz')).toBe(false);
  });
});

/* ------------------------------------------------------------------ *
 * 7. SPOUSE/PARENT GATE (FIX 5)                                        *
 * ------------------------------------------------------------------ */

describe('FIX 5 — שער בן/בת זוג הורה לילד עד גיל 13', () => {
  it('reserves_spouse with isParentWithChildren=false → inherits NOTHING', () => {
    const p = profile({
      studentType: 'reserves_spouse',
      semesterADays: 40,
      isFrontLine: true,
      isParentWithChildren: false,
    });
    expect([...qualifyingSubgroups(p)]).toHaveLength(0);
    const r = resolveRights(p);
    expect(r.eligible).toHaveLength(0);
    expect(r.baseline).toHaveLength(BASELINE_RIGHTS.length);
  });

  it('reserves_spouse with isParentWithChildren=true → inherits partner subgroups', () => {
    const p = profile({
      studentType: 'reserves_spouse',
      semesterADays: 40,
      isFrontLine: true,
      isParentWithChildren: true,
    });
    expect([...qualifyingSubgroups(p)].sort()).toEqual([
      'G1',
      'G2_RESERVES',
      'G3_MILITARY',
    ]);
    expect(eligibleIds(p).has('exemption-8nz')).toBe(true);
  });

  it('security_spouse gated identically by the parent flag', () => {
    const noGate = profile({ studentType: 'security_spouse', isParentWithChildren: false });
    expect([...qualifyingSubgroups(noGate)]).toHaveLength(0);

    const gated = profile({ studentType: 'security_spouse', isParentWithChildren: true });
    expect([...qualifyingSubgroups(gated)].sort()).toEqual(['G2_SECURITY']);
    expect(eligibleIds(gated).has('grade-conversion-g2')).toBe(true);
  });
});

/* ------------------------------------------------------------------ *
 * 8. SUB-10-day reservist (FIX 4) — no matveh benefits, baseline only *
 * ------------------------------------------------------------------ */

describe('FIX 4 — משרת מתחת ל-10 ימים', () => {
  const p = profile({ studentType: 'reserves', semesterADays: 5 });

  it('no qualifying subgroup, no matveh benefits, no crash', () => {
    expect([...qualifyingSubgroups(p)]).toHaveLength(0);
    const r = resolveRights(p);
    expect(r.eligible).toHaveLength(0);
    expect(r.subgroups).toHaveLength(0);
    expect(r.buckets).toHaveLength(0);
    expect(r.multiBucket).toBe(false);
    expect(r.defaultBucketId).toBeNull();
  });

  it('baseline floor STILL returned (statutory floor never hidden)', () => {
    const r = resolveRights(p);
    expect(r.baseline).toHaveLength(BASELINE_RIGHTS.length);
    expect(r.baseline.map((b) => b.id)).toContain('baseline-absence');
  });

  it('classifyTopGroup returns לא זכאי when no subgroup', () => {
    expect(classifyTopGroup(p)).toBe('לא זכאי');
  });

  it('an entirely empty profile (0 days) also returns baseline, no crash', () => {
    const empty = profile({ studentType: 'reserves' });
    const r = resolveRights(empty);
    expect(r.eligible).toHaveLength(0);
    expect(r.baseline).toHaveLength(BASELINE_RIGHTS.length);
  });
});

/* ------------------------------------------------------------------ *
 * 9. DAY-THRESHOLD BOUNDARIES (FIX 3) — extend-studies ladder (total)  *
 * ------------------------------------------------------------------ */

describe('FIX 3 — גבולות סף ימים להארכת לימודים (סך A+B)', () => {
  const ext = (total: number) =>
    eligibleIds(profile({ studentType: 'reserves', semesterADays: total }));

  it('total=41 → no extension', () => {
    const e = ext(41);
    expect(e.has('extend-studies-1sem')).toBe(false);
    expect(e.has('extend-studies-2sem')).toBe(false);
  });

  it('total=42 → 1-semester extension only (boundary inclusive)', () => {
    const e = ext(42);
    expect(e.has('extend-studies-1sem')).toBe(true);
    expect(e.has('extend-studies-2sem')).toBe(false);
  });

  it('total=83 → still only 1-semester', () => {
    const e = ext(83);
    expect(e.has('extend-studies-1sem')).toBe(true);
    expect(e.has('extend-studies-2sem')).toBe(false);
  });

  it('total=84 → 2-semester extension (and 1-sem also true)', () => {
    const e = ext(84);
    expect(e.has('extend-studies-2sem')).toBe(true);
    expect(e.has('extend-studies-1sem')).toBe(true);
  });

  it('extension is independent of subgroup membership (pure total predicate)', () => {
    const p = profile({ studentType: 'reserves', semesterADays: 12, semesterBDays: 72 });
    expect(eligibleIds(p).has('extend-studies-2sem')).toBe(true);
  });
});

/* ------------------------------------------------------------------ *
 * 10. G2_RESERVES alternate triggers (yearly total / pre-semester)    *
 * ------------------------------------------------------------------ */

describe('G2_RESERVES — מסלולים חלופיים (תשפ"ו)', () => {
  it('2ב — total (A+B)>=35 triggers G2 even when each semester < 21', () => {
    const p = profile({ studentType: 'reserves', semesterADays: 18, semesterBDays: 17 });
    const subs = qualifyingSubgroups(p);
    expect(subs.has('G2_RESERVES')).toBe(true);
    expect(totalMiluim(p)).toBe(35);
  });

  it('2ג — preSemesterDays>=60 triggers G2_RESERVES', () => {
    const p = profile({ studentType: 'reserves', preSemesterDays: 60 });
    expect(qualifyingSubgroups(p).has('G2_RESERVES')).toBe(true);
  });

  it('exactly 35 days in semester A → G3_MILITARY (ייעוד קדמי not required)', () => {
    const p = profile({ studentType: 'reserves', isFrontLine: true, semesterADays: 35 });
    expect(qualifyingSubgroups(p).has('G3_MILITARY')).toBe(true);
  });

  // מתווה table criterion 1: "35 יום ומעלה במצטבר במהלך הסמסטר" → קבוצה 3, even
  // without the ייעוד-קדמי checkbox. 40 days (the user's case) likewise → G3.
  it('non-front-line 35 semester days → G3_MILITARY (35 in a semester suffices)', () => {
    const p = profile({ studentType: 'reserves', isFrontLine: false, semesterADays: 35 });
    const subs = qualifyingSubgroups(p);
    expect(subs.has('G3_MILITARY')).toBe(true);
    expect(subs.has('G2_RESERVES')).toBe(true); // monotonic closure
  });

  it('non-front-line 40 semester days → G3_MILITARY', () => {
    const p = profile({ studentType: 'reserves', isFrontLine: false, semesterADays: 40 });
    expect(qualifyingSubgroups(p).has('G3_MILITARY')).toBe(true);
  });

  it('34 semester days (below 35) → only G2_RESERVES, NOT G3_MILITARY', () => {
    const p = profile({ studentType: 'reserves', isFrontLine: false, semesterADays: 34 });
    const subs = qualifyingSubgroups(p);
    expect(subs.has('G3_MILITARY')).toBe(false);
    expect(subs.has('G2_RESERVES')).toBe(true);
  });
});

/* ------------------------------------------------------------------ *
 * 11. Degree-level text + master שש"ס wording                          *
 * ------------------------------------------------------------------ */

describe('הבדלי תואר (טקסט)', () => {
  it('exemption-8nz text mentions both BA (8 נ"ז) and MA (4 שש"ס)', () => {
    const b = BENEFITS.find((x) => x.id === 'exemption-8nz')!;
    expect(b.titleHe + b.descriptionHe).toContain('8 נ"ז');
    expect(b.titleHe + b.descriptionHe).toContain('4 שש"ס');
  });

  it('exemption-6nz text mentions 6 נ"ז and שש"ס for master', () => {
    const b = BENEFITS.find((x) => x.id === 'exemption-6nz')!;
    expect(b.titleHe + b.descriptionHe).toContain('6 נ"ז');
    expect(b.titleHe + b.descriptionHe).toContain('שש"ס');
  });

  it('eligibility is identical for bachelor vs master (only doctorate differs)', () => {
    const ba = profile({ studentType: 'reserves', semesterADays: 25, degreeLevel: 'bachelor' });
    const ma: Profile = normalizeProfile({
      studentType: 'reserves',
      semesterADays: 25,
      degreeLevel: 'master' as DegreeLevel,
    });
    expect(eligibleIds(ba)).toEqual(eligibleIds(ma));
  });
});

/* ------------------------------------------------------------------ *
 * 12. תשפ"ו — half-days sum exactly (lecturer note 6)                  *
 * ------------------------------------------------------------------ */

describe('חצאי-ימים — סכימה מדויקת (note 6)', () => {
  it('35.5 + 35.5 = 71 (totalMiluim + derived field, no rounding)', () => {
    const p = profile({ semesterADays: 35.5, semesterBDays: 35.5 });
    expect(totalMiluim(p)).toBe(71);
    expect(p.totalMiluimDays).toBe(71);
  });

  it('extension boundary reached with halves: 20.5 + 21.5 = 42 → 1-sem', () => {
    const p = profile({ studentType: 'reserves', semesterADays: 20.5, semesterBDays: 21.5 });
    expect(p.totalMiluimDays).toBe(42);
    const e = eligibleIds(p);
    expect(e.has('extend-studies-1sem')).toBe(true);
    expect(e.has('extend-studies-2sem')).toBe(false);
  });

  it('extension 2-sem boundary with halves: 41.5 + 42.5 = 84 → 2-sem', () => {
    const p = profile({ studentType: 'reserves', semesterADays: 41.5, semesterBDays: 42.5 });
    expect(p.totalMiluimDays).toBe(84);
    expect(eligibleIds(p).has('extend-studies-2sem')).toBe(true);
  });
});

/* ------------------------------------------------------------------ *
 * 13. PER-SEMESTER best-of-A/B (lecturer note 3)                       *
 * ------------------------------------------------------------------ */

describe('הערכה פר-סמסטר — best-of A/B (note 3)', () => {
  it('35 frontline days in סמסטר ב׳ ONLY → G3_MILITARY', () => {
    const p = profile({ studentType: 'reserves', isFrontLine: true, semesterADays: 0, semesterBDays: 35 });
    expect(qualifyingSubgroups(p).has('G3_MILITARY')).toBe(true);
  });

  it('21 days in סמסטר ב׳ ONLY → G2_RESERVES (2א best-of)', () => {
    const p = profile({ studentType: 'reserves', semesterADays: 0, semesterBDays: 21 });
    expect(qualifyingSubgroups(p).has('G2_RESERVES')).toBe(true);
  });

  it('12 days in סמסטר ב׳ ONLY → G1 (best-of)', () => {
    const p = profile({ studentType: 'reserves', semesterADays: 0, semesterBDays: 12 });
    expect([...qualifyingSubgroups(p)].sort()).toEqual(['G1']);
  });
});

/* ------------------------------------------------------------------ *
 * 14. MULTI-BUCKET selection + default = most benefits (notes 3,4)    *
 * ------------------------------------------------------------------ */

describe('בחירת bucket מרובה + ברירת מחדל (notes 3,4)', () => {
  // Evacuee (G3_CIVILIAN) who ALSO served 40 frontline days (reserve ladder).
  const p = profile({ studentType: 'evacuee', isFrontLine: true, semesterADays: 40 });

  it('two independent buckets → multiBucket=true', () => {
    const r = resolveRights(p);
    const ids = r.buckets.map((b) => b.id).sort();
    expect(ids).toEqual(['G3_CIVILIAN', 'G3_MILITARY']);
    expect(r.multiBucket).toBe(true);
  });

  it('default bucket = the one with the MOST eligible benefits (reserve track)', () => {
    const r = resolveRights(p);
    expect(r.defaultBucketId).toBe('G3_MILITARY');
    const def = r.buckets.find((b) => b.isDefault)!;
    const other = r.buckets.find((b) => !b.isDefault)!;
    expect(def.id).toBe('G3_MILITARY');
    expect(def.eligible.length).toBeGreaterThanOrEqual(other.eligible.length);
  });

  it('reserve bucket closure folds G2_RESERVES + G1 into one bucket', () => {
    const r = resolveRights(p);
    const reserve = r.buckets.find((b) => b.id === 'G3_MILITARY')!;
    expect(reserve.subgroups.sort()).toEqual(['G1', 'G2_RESERVES', 'G3_MILITARY']);
    const e = new Set(reserve.eligible.map((b) => b.id));
    expect(e.has('exemption-8nz')).toBe(true);
    expect(e.has('copy-cards')).toBe(true);
  });
});

/* ------------------------------------------------------------------ *
 * 15. DOCTORATE — exam-based benefits routed to notRelevant (note 2)  *
 * ------------------------------------------------------------------ */

describe('תואר שלישי — ניתוב לא-רלוונטי (note 2)', () => {
  const doc = profile({ studentType: 'reserves', isFrontLine: true, semesterADays: 40, degreeLevel: 'doctorate' });

  it('exam-based benefits move to notRelevant with the doctorate note', () => {
    const nr = notRelevantIds(doc);
    expect(nr.has('extra-time-25')).toBe(true);
    expect(nr.has('exam-two-of-three')).toBe(true);
    expect(nr.has('choose-higher-grade')).toBe(true);
    expect(nr.has('alt-eval-no-stem')).toBe(true);
    for (const item of resolveRights(doc).notRelevant) {
      expect(item.noteHe).toContain('תואר שלישי');
    }
  });

  it('exam-based benefits are NOT in eligible for a doctorate', () => {
    const e = eligibleIds(doc);
    expect(e.has('extra-time-25')).toBe(false);
    expect(e.has('exam-two-of-three')).toBe(false);
    expect(e.has('choose-higher-grade')).toBe(false);
  });

  it('non-exam benefits (8nz, thesis-extension, copy-cards) remain eligible', () => {
    const e = eligibleIds(doc);
    expect(e.has('exemption-8nz')).toBe(true);
    expect(e.has('thesis-extension')).toBe(true);
    expect(e.has('copy-cards')).toBe(true);
  });

  it('a BACHELOR with the same service gets those exam benefits (no notRelevant)', () => {
    const ba = profile({ studentType: 'reserves', isFrontLine: true, semesterADays: 40, degreeLevel: 'bachelor' });
    expect(resolveRights(ba).notRelevant).toHaveLength(0);
    expect(eligibleIds(ba).has('extra-time-25')).toBe(true);
  });
});

/* ------------------------------------------------------------------ *
 * 16. VALIDATE — anomaly flags (lecturer note 5)                       *
 * ------------------------------------------------------------------ */

describe('validateProfile — חריגות (note 5)', () => {
  it('365 days in semester A raises a warning (חריגה)', () => {
    const p = profile({ semesterADays: 365 });
    const { warnings } = validateProfile(p);
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings.some((w) => w.includes('חריגה'))).toBe(true);
    expect(warnings.some((w) => w.includes('סמסטר א׳'))).toBe(true);
  });

  it('negative value raises an error', () => {
    const p = profile({ semesterBDays: -5 });
    const { errors } = validateProfile(p);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('non-half fraction (.3) raises a warning', () => {
    const p = profile({ semesterADays: 12.3 });
    const { warnings } = validateProfile(p);
    expect(warnings.some((w) => w.includes('0.5'))).toBe(true);
  });

  it('total (A+B) over 365 raises a warning', () => {
    const p = profile({ semesterADays: 200, semesterBDays: 200 });
    const { warnings } = validateProfile(p);
    expect(warnings.some((w) => w.includes('365'))).toBe(true);
  });

  it('a plausible profile (40 + 10, half-steps) has no errors and no warnings', () => {
    const p = profile({ semesterADays: 40, semesterBDays: 10 });
    const { errors, warnings } = validateProfile(p);
    expect(errors).toHaveLength(0);
    expect(warnings).toHaveLength(0);
  });
});
