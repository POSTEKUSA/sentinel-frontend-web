import { Pipe, PipeTransform, inject } from '@angular/core';
import { PmtTransaccionService } from '../../core/services/pmt/pmt-transaccion.service';
import { userDisplayName } from '../../core/utils/user-display.util';

/** Maps username → full name for UI display. */
@Pipe({ name: 'userName', standalone: true, pure: false })
export class UserNamePipe implements PipeTransform {
  private users = inject(PmtTransaccionService);

  transform(username: string | null | undefined, fallback = '—'): string {
    return userDisplayName(username, this.users.users, fallback);
  }
}
