import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'sentinel.auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _authenticated = signal(this.readStored());

  readonly authenticated = this._authenticated.asReadonly();

  isLoggedIn(): boolean {
    return this._authenticated();
  }

  /** Prototype: any email/password succeeds. */
  login(_email: string, _password: string): boolean {
    localStorage.setItem(STORAGE_KEY, '1');
    this._authenticated.set(true);
    return true;
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    this._authenticated.set(false);
  }

  private readStored(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  }
}
