import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';

import { CustodyAssignment, CUSTODY_ROLE_LABELS } from '../../../core/models/pos-admin';
import { PosInventoryService } from '../../../core/services/pos-admin/pos-inventory.service';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';
import { CustodyAssignDialogComponent } from './dialogs/custody-assign-dialog.component';

@Component({
  selector: 'app-custody-tab',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule, MatTableModule, MatTooltipModule,
    EmptyStateComponent,
  ],
  templateUrl: './custody-tab.component.html',
  styleUrl: './custody-tab.component.css',
})
export class CustodyTabComponent implements OnInit {
  roleLabels: Record<string, string> = CUSTODY_ROLE_LABELS;

  all: CustodyAssignment[] = [];
  filtered: CustodyAssignment[] = [];
  columns = ['userName', 'role', 'serialNumber', 'assignedAt', 'status', 'actions'];

  private fb = inject(FormBuilder);

  filterForm = this.fb.group({
    userName: [''],
    role: [''],
    status: ['active'],
  });

  constructor(
    private inventorySvc: PosInventoryService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.inventorySvc.custody$.subscribe(assignments => {
      this.all = assignments;
      this.applyFilters();
    });
    this.filterForm.valueChanges.subscribe(() => this.applyFilters());
  }

  applyFilters(): void {
    const f = this.filterForm.getRawValue();
    this.filtered = this.all.filter(a =>
      (!f.userName || a.userName.toLowerCase().includes(f.userName.toLowerCase())) &&
      (!f.role || a.role === f.role) &&
      (!f.status || a.status === f.status),
    );
  }

  openAssignDialog(): void {
    const availableUnits = this.inventorySvc.units.filter(u => u.status === 'in_stock');
    this.dialog.open(CustodyAssignDialogComponent, { width: '520px', data: { availableUnits } });
  }

  returnUnit(assignment: CustodyAssignment): void {
    this.inventorySvc.returnCustody(assignment.id);
  }
}
