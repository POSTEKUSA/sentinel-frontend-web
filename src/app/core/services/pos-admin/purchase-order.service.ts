import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PurchaseOrder, PurchaseOrderLine, PurchaseOrderStatus } from '../../models/pos-admin';
import { MOCK_PURCHASE_ORDERS } from '../../mock/pos-admin/mock-purchase-orders';
import { CurrentUserService } from './current-user.service';

let poSeq = MOCK_PURCHASE_ORDERS.length + 1;
let lineSeq = 1000;

/** EPIC 2 — Órdenes de compra (HU-004, HU-005) */
@Injectable({ providedIn: 'root' })
export class PurchaseOrderService {
  private readonly ordersSubject = new BehaviorSubject<PurchaseOrder[]>([...MOCK_PURCHASE_ORDERS]);
  readonly orders$: Observable<PurchaseOrder[]> = this.ordersSubject.asObservable();

  constructor(private currentUser: CurrentUserService) {}

  get orders(): PurchaseOrder[] {
    return this.ordersSubject.value;
  }

  getById(id: string): PurchaseOrder | undefined {
    return this.ordersSubject.value.find(po => po.id === id);
  }

  nextOrderNumber(): string {
    const year = new Date().getFullYear();
    const count = this.ordersSubject.value.filter(po => po.orderNumber.includes(String(year))).length + 1;
    return `OC-${year}-${String(count).padStart(4, '0')}`;
  }

  create(order: Omit<PurchaseOrder, 'id' | 'createdAt' | 'createdBy' | 'status'> & { status?: PurchaseOrderStatus }): PurchaseOrder {
    const created: PurchaseOrder = {
      ...order,
      id: `po-${poSeq++}`,
      status: order.status ?? 'created',
      createdAt: new Date().toISOString(),
      createdBy: this.currentUser.username,
      lines: order.lines.map(line => ({ ...line, id: line.id || `pol-${lineSeq++}`, receivedQty: line.receivedQty ?? 0 })),
    };
    this.ordersSubject.next([created, ...this.ordersSubject.value]);
    return created;
  }

  update(id: string, changes: Partial<Omit<PurchaseOrder, 'id'>>): void {
    this.ordersSubject.next(
      this.ordersSubject.value.map(po => (po.id === id ? { ...po, ...changes } : po)),
    );
  }

  updateStatus(id: string, status: PurchaseOrderStatus): void {
    this.update(id, { status });
  }

  delete(id: string): void {
    this.ordersSubject.next(this.ordersSubject.value.filter(po => po.id !== id));
  }

  /**
   * Acumula cantidad recibida en una línea de la orden y recalcula el
   * estado agregado (creada / recibida parcial / recibida completa).
   * Usado por el flujo de recepción (HU-006/HU-007) para mantener
   * trazabilidad entre la orden y el inventario físico.
   */
  registerReceivedQty(orderId: string, lineId: string, qtyReceivedNow: number, receivedBy: string): void {
    const order = this.getById(orderId);
    if (!order) return;

    const lines: PurchaseOrderLine[] = order.lines.map(line =>
      line.id === lineId ? { ...line, receivedQty: Math.min(line.requestedQty, line.receivedQty + qtyReceivedNow) } : line,
    );

    const totalRequested = lines.reduce((sum, l) => sum + l.requestedQty, 0);
    const totalReceived = lines.reduce((sum, l) => sum + l.receivedQty, 0);

    let status: PurchaseOrderStatus = order.status;
    if (status !== 'cancelled' && status !== 'closed') {
      status = totalReceived === 0 ? order.status : totalReceived >= totalRequested ? 'received' : 'partially_received';
    }

    this.update(orderId, { lines, status, receivedBy });
  }

  /** Líneas con saldo pendiente por recibir, usadas por el módulo de recepción */
  pendingLines(orderId: string): PurchaseOrderLine[] {
    const order = this.getById(orderId);
    if (!order) return [];
    return order.lines.filter(l => l.receivedQty < l.requestedQty);
  }
}
