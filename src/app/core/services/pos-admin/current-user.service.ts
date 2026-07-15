import { Injectable } from '@angular/core';

/**
 * Stub del usuario autenticado, mientras no exista integración con el
 * sistema de identidad real. Se usa para poblar campos de auditoría
 * (creador, receptor, responsable) en los módulos de administración POS.
 */
@Injectable({ providedIn: 'root' })
export class CurrentUserService {
  readonly username = 'superadmin';
  readonly displayName = 'Super Administrador';
  readonly initials = 'SA';
}
