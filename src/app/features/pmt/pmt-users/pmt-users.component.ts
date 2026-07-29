import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { PmtTransaccionService } from '../../../core/services/pmt/pmt-transaccion.service';
import { PmtUser, PmtUserRole, PMT_USER_ROLE_LABELS } from '../../../core/models/pmt/pmt-user.model';

@Component({
  selector: 'app-pmt-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './pmt-users.component.html',
  styleUrl: './pmt-users.component.css',
})
export class PmtUsersComponent implements OnInit {
  private svc = inject(PmtTransaccionService);
  private fb  = inject(FormBuilder);
  all: PmtUser[] = [];
  filtered: PmtUser[] = [];

  readonly roleLabels = PMT_USER_ROLE_LABELS;
  readonly roleKeys   = Object.keys(PMT_USER_ROLE_LABELS) as PmtUserRole[];

  filterForm = this.fb.group({ q: [''], role: [''], active: [''] });

  showForm = false;
  editId: number | null = null;
  formData = this.fb.group({
    username: [''], nombre: [''], email: [''],
    role: ['consulta'], active: [true], firstLogin: [true],
  });
  formError = '';

  ngOnInit(): void {
    this.svc.users$.subscribe(list => { this.all = list; this.applyFilters(); });
    this.filterForm.valueChanges.subscribe(() => this.applyFilters());
  }

  applyFilters(): void {
    const f = this.filterForm.getRawValue();
    this.filtered = this.all.filter(u => {
      const q = (f.q ?? '').toLowerCase();
      if (q && ![u.username, u.nombre, u.email].some(v => (v ?? '').toLowerCase().includes(q))) return false;
      if (f.role && u.role !== f.role) return false;
      if (f.active !== '' && f.active !== null && f.active !== undefined) {
        const wantActive = f.active === 'true';
        if (u.active !== wantActive) return false;
      }
      return true;
    });
  }

  openCreate(): void { this.editId = null; this.formData.reset({ role: 'consulta', active: true, firstLogin: true }); this.formError = ''; this.showForm = true; }
  openEdit(u: PmtUser): void { this.editId = u.id; this.formData.patchValue(u); this.formError = ''; this.showForm = true; }

  save(): void {
    const v = this.formData.getRawValue();
    if (!v.username?.trim()) { this.formError = 'Username requerido.'; return; }
    if (this.editId === null) {
      if (this.all.find(u => u.username === v.username)) { this.formError = `"${v.username}" ya existe.`; return; }
      this.svc.createUser({ username: v.username!, nombre: v.nombre ?? undefined, email: v.email ?? undefined, role: (v.role as PmtUserRole) ?? 'consulta', active: !!v.active, firstLogin: !!v.firstLogin });
    } else {
      this.svc.updateUser(this.editId, { username: v.username!, nombre: v.nombre ?? undefined, email: v.email ?? undefined, role: (v.role as PmtUserRole) ?? 'consulta', active: !!v.active, firstLogin: !!v.firstLogin });
    }
    this.showForm = false;
  }

  delete(id: number): void { if (confirm('¿Eliminar usuario?')) this.svc.deleteUser(id); }
  toggleActive(u: PmtUser): void { this.svc.updateUser(u.id, { active: !u.active }); }
}
