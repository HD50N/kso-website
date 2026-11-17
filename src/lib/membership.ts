/**
 * Member classification.
 *
 * Two independent dimensions, deliberately kept apart:
 *
 *  1. Academic standing — undergrad / grad / alumni. Derived from
 *     `graduation_year`, so it stays correct without anyone editing a profile.
 *  2. Board role — whether someone holds (or held) an exec board position.
 *     This outlives graduation: a graduated VP is both an alum and a past VP.
 *
 * The database stores both in a single `profiles.user_type` column, where the
 * value 'board_member' is really a role rather than a standing. We keep writing
 * that value so no board history is lost, but every read derives standing from
 * the graduation year and treats the board role as a separate flag.
 */

/** Academic standing. Never includes the board role. */
export type MemberType = 'undergrad' | 'grad' | 'alumni';

/** What `profiles.user_type` can legally hold (board role included). */
export type StoredUserType = MemberType | 'board_member';

/** June — UChicago commencement. `Date#getMonth` is 0-indexed. */
const COMMENCEMENT_MONTH = 5;

/**
 * A class year counts as alumni from June 1 of that year onward.
 * Earlier class years always count; later ones never do.
 */
export function isAlumniClassYear(graduationYear?: number | null, now = new Date()): boolean {
  if (graduationYear == null) return false;
  const year = Number(graduationYear);
  if (!Number.isFinite(year)) return false;

  const currentYear = now.getFullYear();
  if (year < currentYear) return true;
  if (year > currentYear) return false;
  return now.getMonth() >= COMMENCEMENT_MONTH;
}

/**
 * Academic standing for display and filtering.
 *
 * The graduation year wins: once it has passed, the member is an alum whatever
 * the stored value says. Board role is intentionally NOT consulted here, so
 * board members graduate like everyone else.
 */
export function effectiveMemberType(
  userType?: string | null,
  graduationYear?: number | null,
  now = new Date(),
): MemberType {
  if (isAlumniClassYear(graduationYear, now)) return 'alumni';
  if (userType === 'grad') return 'grad';
  if (userType === 'alumni') return 'alumni';
  return 'undergrad';
}

/**
 * Whether someone holds or held an exec board position.
 *
 * Note this says nothing about whether the position is *current* — the live
 * roster is the `board_positions` table (`is_active`), which the board page
 * reads directly. This flag only drives the badge and the directory filter.
 */
export function isBoardMember(userType?: string | null, boardPosition?: string | null): boolean {
  return userType === 'board_member' || !!boardPosition?.trim();
}

const MEMBER_TYPE_LABELS: Record<MemberType, string> = {
  undergrad: 'Undergrad',
  grad: 'Grad',
  alumni: 'Alumni',
};

/** Short badge label for a member's academic standing. */
export function memberTypeLabel(
  userType?: string | null,
  graduationYear?: number | null,
  now = new Date(),
): string {
  return MEMBER_TYPE_LABELS[effectiveMemberType(userType, graduationYear, now)];
}

/** The shape every classification helper needs. Matches `Profile` structurally. */
export interface ClassifiableProfile {
  user_type?: string | null;
  graduation_year?: number | null;
  board_position?: string | null;
}

/**
 * Shared predicate behind the directory and admin "type" filters, so both
 * pages agree on what each option means.
 *
 * 'board_member' matches on board role; the rest match on academic standing.
 * A graduated board member therefore appears under both Alumni and Board Member.
 */
export function matchesMemberTypeFilter(
  filter: string,
  profile: ClassifiableProfile,
  now = new Date(),
): boolean {
  if (filter === 'all') return true;
  if (filter === 'board_member') return isBoardMember(profile.user_type, profile.board_position);
  return effectiveMemberType(profile.user_type, profile.graduation_year, now) === filter;
}

/**
 * The value to persist in `profiles.user_type`.
 *
 * `storedUserType` is what the database currently holds; `selectedType` is what
 * the member picked in a form. A stored board role is never overwritten from a
 * profile form — otherwise a board member saving an unrelated field would erase
 * their own board status.
 */
export function userTypeForSave(
  storedUserType: string | null | undefined,
  selectedType: string | null | undefined,
  graduationYear?: number | null,
  now = new Date(),
): StoredUserType {
  if (storedUserType === 'board_member') return 'board_member';
  return effectiveMemberType(selectedType, graduationYear, now);
}

/**
 * The standing to fall back to when a board role is removed.
 *
 * Replaces the old hardcoded 'undergrad', which demoted graduated board members
 * back to undergrad. The graduation year tells us the right answer; `priorType`
 * only distinguishes grad from undergrad for someone who has not graduated yet.
 */
export function memberTypeAfterBoardRemoval(
  graduationYear?: number | null,
  priorType?: string | null,
  now = new Date(),
): MemberType {
  return effectiveMemberType(priorType === 'grad' ? 'grad' : null, graduationYear, now);
}
