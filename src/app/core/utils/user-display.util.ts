import { MOCK_PMT_USERS } from '../mock/pmt/mock-pmt-users';
import { PmtUser, PmtUserRole, PMT_USER_ROLE_LABELS } from '../models/pmt/pmt-user.model';

/** Short role labels for inline UI (timeline, chips). */
export const PMT_USER_ROLE_SHORT: Record<PmtUserRole, string> = {
  consulta: 'Consulta',
  inventario: 'Inventario',
  supervisor: 'Supervisor',
  tecnico: 'Técnico',
  ejecutivo: 'Ejecutivo',
  inyector: 'Inyector',
  programacion: 'Programación',
  admin: 'Administrador',
};

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

export function userRoleShort(
  username: string | null | undefined,
  users: readonly PmtUser[] = MOCK_PMT_USERS,
): string | undefined {
  if (!username?.trim()) return undefined;
  const key = username.trim();
  const u =
    users.find(x => x.username === key) ??
    users.find(x => x.nombre === key) ??
    users.find(x => x.username.toLowerCase() === key.toLowerCase());
  if (!u) return undefined;
  return PMT_USER_ROLE_SHORT[u.role] ?? PMT_USER_ROLE_LABELS[u.role];
}

/** "Nombre Apellido (Rol)" for timeline / attribution. */
export function userActorLabel(
  username: string | null | undefined,
  users: readonly PmtUser[] = MOCK_PMT_USERS,
  fallback = 'Sistema',
): string {
  const name = userDisplayName(username, users, fallback);
  const role = userRoleShort(username, users);
  return role ? `${name} (${role})` : name;
}

/** Replace known usernames inside free-text comments with full names. */
export function resolveUsernamesInText(
  text: string | null | undefined,
  users: readonly PmtUser[] = MOCK_PMT_USERS,
): string {
  if (!text) return '';
  let out = text;
  for (const u of users) {
    if (!u.username || !u.nombre) continue;
    const re = new RegExp(`\\b${u.username}\\b`, 'gi');
    out = out.replace(re, u.nombre);
  }
  return out;
}
