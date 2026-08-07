import { TransactionLimit } from '../../models/pos-admin/limit.model';

export const MOCK_TRANSACTION_LIMITS: TransactionLimit[] = [
  {
    id: 'lim-1',
    code: 'L1',
    name: 'Básico',
    maxAmount: 5000,
    description: 'Comercios de bajo volumen',
    status: 'active',
  },
  {
    id: 'lim-2',
    code: 'L2',
    name: 'Estándar',
    maxAmount: 25000,
    description: 'Perfil estándar de afiliado',
    status: 'active',
  },
  {
    id: 'lim-3',
    code: 'L3',
    name: 'Alto volumen',
    maxAmount: 100000,
    description: 'Cadenas y alto ticket',
    status: 'active',
  },
  {
    id: 'lim-4',
    code: 'L4',
    name: 'Premium',
    maxAmount: 250000,
    description: 'Límite ampliado (legacy)',
    status: 'inactive',
  },
];
