/**
 * engine/resolve.ts — the RESOLVER
 * ================================
 * מחשבון זכויות לסטודנטים במילואים — אוניברסיטת חיפה
 *
 * Authoritative source: /Users/davidulman/Programing/law/miluim/claude.md
 *   → Section 3 (subgroup structure) + Section 4 (V/X benefit truth table)
 *
 * resolveRights(profile) is the single public entry point of the engine:
 *
 *   1) subs     = qualifyingSubgroups(p)            // ALL subgroups (FIX 1 union)
 *   2) eligible = UNION of BENEFITS across subs      // exemption-collapsed
 *   3) locked   = benefits the user does NOT get
 *   4) notRelevant = exam-based benefits hidden for a doctorate (note 2)
 *   5) buckets  = per-track breakdown so the UI can SWITCH/compare (note 3);
 *                 DEFAULT bucket = the one with the MOST eligible benefits.
 *   6) multiBucket = buckets.length>1 → drives the disclaimer ALERT (note 4)
 *   7) baseline = BASELINE_RIGHTS                    // FIX 4 — ALWAYS present
 *
 * NOTE: pure TypeScript. NO React / Next imports. Fully unit-testable.
 */

import type {
  Benefit,
  Bucket,
  NotRelevantBenefit,
  Profile,
  ResolvedRights,
  Subgroup,
} from './types';
import { SUBGROUP_META, SUBGROUP_ORDER } from './types';
import { BENEFITS } from './benefits';
import { qualifyingSubgroups } from './subgroups';
import { BASELINE_RIGHTS } from './baseline';

/* ------------------------------------------------------------------ *
 * EXEMPTION FAMILY COLLAPSE (Section 4.1)                              *
 * ------------------------------------------------------------------ *
 * The three credit-waivers form a single ladder:                      *
 *   exemption-8nz (G3_MILITARY) > exemption-6nz (G2_RESERVES) >        *
 *   exemption-2nz (G1). Surface only the HIGHEST in `eligible`; demote *
 *   the lower waivers to `locked` (informational).                     *
 * ------------------------------------------------------------------ */

const EXEMPTION_LADDER: readonly string[] = [
  'exemption-8nz', // highest
  'exemption-6nz',
  'exemption-2nz', // lowest
] as const;

const EXEMPTION_LADDER_SET: ReadonlySet<string> = new Set(EXEMPTION_LADDER);

/** Hebrew note shown for exam-based benefits hidden from a doctorate (note 2). */
const DOCTORATE_NOTE = 'לא רלוונטי לתואר שלישי (אין בחינות)';

interface Evaluation {
  eligible: Benefit[];
  locked: Benefit[];
  notRelevant: NotRelevantBenefit[];
}

/**
 * evaluateSet — partition the FULL catalog against a given subgroup set,
 * applying (a) DEGREE relevance routing (note 2: a doctorate has no exams, so
 * exam-based benefits go to `notRelevant`) and (b) the exemption-ladder
 * collapse. Reused for both the union view and each per-track bucket.
 */
function evaluateSet(p: Profile, subs: Set<Subgroup>): Evaluation {
  const eligible: Benefit[] = [];
  const locked: Benefit[] = [];
  const notRelevant: NotRelevantBenefit[] = [];
  const isDoctorate = p.degreeLevel === 'doctorate';

  for (const benefit of BENEFITS) {
    // (a) DEGREE relevance — doctorate has no exams (note 2).
    if (isDoctorate && benefit.examBased === true) {
      notRelevant.push({ benefit, noteHe: DOCTORATE_NOTE });
      continue;
    }
    // (b) Section-4 V/X predicate — OR across subgroups (FIX 1) + day fields (FIX 3).
    if (benefit.eligible(p, subs)) {
      eligible.push(benefit);
    } else {
      locked.push(benefit);
    }
  }

  // (c) EXEMPTION FAMILY COLLAPSE — keep only the highest waiver in `eligible`.
  const highestWaiverId = EXEMPTION_LADDER.find((id) =>
    eligible.some((b) => b.id === id),
  );
  if (highestWaiverId !== undefined) {
    for (let i = eligible.length - 1; i >= 0; i--) {
      const b = eligible[i];
      if (EXEMPTION_LADDER_SET.has(b.id) && b.id !== highestWaiverId) {
        eligible.splice(i, 1);
        locked.push(b);
      }
    }
  }

  return { eligible, locked, notRelevant };
}

/* ------------------------------------------------------------------ *
 * BUCKETS — distinct INDEPENDENT qualifying tracks (lecturer note 3).  *
 * ------------------------------------------------------------------ *
 * The reserve ladder (G3_MILITARY → G2_RESERVES → G1) is ONE bucket    *
 * whose root is the highest reserve tag attained; civilian and         *
 * security tracks are their own buckets. Each bucket is evaluated with  *
 * its OWN subgroup closure so the UI can switch between them.           *
 * ------------------------------------------------------------------ */

/** Reserve-ladder closure for a reserve bucket root. */
function reserveClosure(root: Subgroup): Subgroup[] {
  switch (root) {
    case 'G3_MILITARY':
      return ['G3_MILITARY', 'G2_RESERVES', 'G1'];
    case 'G2_RESERVES':
      return ['G2_RESERVES', 'G1'];
    default:
      return ['G1'];
  }
}

/** Build the list of bucket roots (one per independent track) from `subs`. */
function bucketRoots(subs: Set<Subgroup>): { root: Subgroup; members: Subgroup[] }[] {
  const roots: { root: Subgroup; members: Subgroup[] }[] = [];

  if (subs.has('G3_CIVILIAN')) {
    roots.push({ root: 'G3_CIVILIAN', members: ['G3_CIVILIAN'] });
  }
  if (subs.has('G2_SECURITY')) {
    roots.push({ root: 'G2_SECURITY', members: ['G2_SECURITY'] });
  }
  // Reserve ladder → single bucket rooted at the highest reserve tag present.
  const reserveRoot: Subgroup | null = subs.has('G3_MILITARY')
    ? 'G3_MILITARY'
    : subs.has('G2_RESERVES')
      ? 'G2_RESERVES'
      : subs.has('G1')
        ? 'G1'
        : null;
  if (reserveRoot) {
    roots.push({ root: reserveRoot, members: reserveClosure(reserveRoot) });
  }

  return roots;
}

/**
 * resolveRights — evaluate a profile against the full benefit catalog.
 *
 * @param p the engine input profile (for a spouse, the day fields hold the
 *          PARTNER's service; inheritance is gated inside qualifyingSubgroups).
 */
export function resolveRights(p: Profile): ResolvedRights {
  // (1) ALL qualifying subgroups (FIX 1 union / FIX 5 spouse gate inside).
  const subs: Set<Subgroup> = qualifyingSubgroups(p);

  // (2)–(4) UNION view across every subgroup the profile satisfies.
  const union = evaluateSet(p, subs);

  // (5) Per-track buckets for switch/compare.
  const roots = bucketRoots(subs);
  const buckets: Bucket[] = roots.map(({ root, members }) => {
    const memberSet = new Set<Subgroup>(members);
    const ev = evaluateSet(p, memberSet);
    return {
      id: root,
      labelHe: SUBGROUP_META[root].bucketLabelHe,
      subgroups: members,
      eligible: ev.eligible,
      locked: ev.locked,
      notRelevant: ev.notRelevant,
      isDefault: false,
    };
  });

  // DEFAULT bucket = the one granting the MOST eligible benefits (note 3).
  // Ties broken by SUBGROUP_ORDER (civilian-3 before military-3, etc.).
  let defaultIdx = -1;
  let bestCount = -1;
  buckets.forEach((b, i) => {
    if (b.eligible.length > bestCount) {
      bestCount = b.eligible.length;
      defaultIdx = i;
    }
  });
  if (defaultIdx >= 0) buckets[defaultIdx].isDefault = true;
  const defaultBucketId = defaultIdx >= 0 ? buckets[defaultIdx].id : null;

  // (4)(6)(7) — statutory floor ALWAYS present (FIX 4).
  return {
    subgroups: [...subs],
    buckets,
    defaultBucketId,
    multiBucket: buckets.length > 1,
    eligible: union.eligible,
    locked: union.locked,
    notRelevant: union.notRelevant,
    baseline: BASELINE_RIGHTS,
  };
}

/* ------------------------------------------------------------------ *
 * Back-compat shim — headline label of the HIGHEST-tier subgroup.     *
 * Prefer resolveRights() / buckets for anything real.                 *
 * ------------------------------------------------------------------ */

export function classifyTopGroup(p: Profile): string {
  const subs = qualifyingSubgroups(p);
  let best: Subgroup | undefined;
  let bestTier = 0;
  for (const id of SUBGROUP_ORDER) {
    if (!subs.has(id)) continue;
    const tier = SUBGROUP_META[id].tier;
    if (tier > bestTier) {
      bestTier = tier;
      best = id;
    }
  }
  return best ? SUBGROUP_META[best].labelHe : 'לא זכאי';
}
