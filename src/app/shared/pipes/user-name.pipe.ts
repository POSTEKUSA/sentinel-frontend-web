import { Pipe, PipeTransform, inject } from '@angular/core';
import { PmtTransaccionService } from '../../core/services/pmt/pmt-transaccion.service';
import { userActorLabel, userDisplayName } from '../../core/utils/user-display.util';

/**
 * Maps username → full name (Nombre Apellido).
 * Pass `true` as 2nd arg (or 3rd if fallback set) to append role: "Juan López (Supervisor)".
 */
@Pipe({ name: 'userName', standalone: true, pure: false })
export class UserNamePipe implements PipeTransform {
  private users = inject(PmtTransaccionService);

  transform(
    username: string | null | undefined,
    fallbackOrWithRole: string | boolean = '—',
    withRole = false,
  ): string {
    const fallback = typeof fallbackOrWithRole === 'string' ? fallbackOrWithRole : '—';
    const showRole = typeof fallbackOrWithRole === 'boolean' ? fallbackOrWithRole : withRole;
    if (showRole) {
      return userActorLabel(username, this.users.users, fallback);
    }
    return userDisplayName(username, this.users.users, fallback);
  }
}
