import { MOCK_PMT_USERS } from '../mock/pmt/mock-pmt-users';
import { PmtUser } from '../models/pmt/pmt-user.model';

/** Resolve a stored username (or legacy display label) to the user's full name. */
export function userDisplayName(
  username: string | null | undefined,
  users: readonly PmtUser[] = MOCK_PMT_USERS,
  fallback = '—',
): string {
  if (!username?.trim()) return fallback;
  const key = username.trim();
  const u =
    users.find(x => x.username === key) ??
    users.find(x => x.nombre === key) ??
    users.find(x => x.username.toLowerCase() === key.toLowerCase());
  return u?.nombre?.trim() || key;
}
