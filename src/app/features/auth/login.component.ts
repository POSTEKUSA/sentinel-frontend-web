import { AfterViewInit, Component, ElementRef, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { BusyLoaderService } from '../../core/services/busy-loader.service';
import { BusyLoaderComponent } from '../../shared/busy-loader/busy-loader.component';
import appConfig from '../../core/config/app-config.json';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, BusyLoaderComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements AfterViewInit {
  @ViewChild('logoImg') logoImg?: ElementRef<HTMLImageElement>;

  email = '';
  password = '';
  showPassword = false;
  submitting = signal(false);
  privacyOpen = signal(false);

  appName = appConfig.appName;
  companyName = appConfig.companyName;
  establishedYear = appConfig.establishedYear;
  currentYear = new Date().getFullYear();
  copyrightText = `© ${this.companyName} ${this.establishedYear} - ${this.currentYear}`;
  appVersion = 'v' + appConfig.appVersion;

  constructor(
    private auth: AuthService,
    private router: Router,
    private busy: BusyLoaderService,
  ) {}

  get loaderVisible(): boolean {
    return this.busy.visible();
  }

  ngAfterViewInit(): void {
    const logo = this.logoImg?.nativeElement;
    logo?.addEventListener('animationend', this.onLogoAnimationEnd);
  }

  private onLogoAnimationEnd = (e: AnimationEvent): void => {
    const el = e.target as HTMLElement;
    if (e.animationName === 'logoSpin') {
      el.classList.remove('spin');
    } else if (e.animationName === 'logoEnter') {
      el.classList.remove('enter');
    }
  };

  spinLogo(): void {
    const logo = this.logoImg?.nativeElement;
    if (!logo) return;
    logo.classList.remove('spin');
    void logo.offsetWidth;
    logo.classList.add('spin');
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  openPrivacy(event: Event): void {
    event.preventDefault();
    this.privacyOpen.set(true);
  }

  closePrivacy(): void {
    this.privacyOpen.set(false);
  }

  async onSubmit(): Promise<void> {
    if (this.submitting()) return;
    this.submitting.set(true);
    this.busy.suspendNavTracking();
    this.busy.reset();
    this.busy.show('Iniciando sesión');
    this.spinLogo();
    this.auth.login(this.email, this.password);

    await new Promise(resolve => setTimeout(resolve, 2000));

    this.busy.reset();
    await this.router.navigateByUrl('/dashboard');
    this.busy.resumeNavTracking();
    this.submitting.set(false);
  }
}
