import {
  BizBranch,
  BizMerchant,
  BizTerminal,
  BizTransaction,
  CardBrand,
  CardType,
  MccCategory,
} from '../../models/business-insights';
import {
  ACQUIRER_BANKS,
  BRAND_REGION_NAMES,
  BRAND_TEMPLATES,
  CARD_BRAND_WEIGHTS,
  CARD_TYPE_WEIGHTS,
  HN_LOCATIONS,
  HnLocation,
  INDEPENDENT_COUNT_BY_CATEGORY,
  INDEPENDENT_NAME_BANK,
  MCC_BY_CATEGORY,
  TERMINAL_MODELS,
} from './business-reference-data';
import {
  createRng,
  distributeCount,
  pickFromCumulative,
  randChoice,
  randFloat,
  randInt,
  Rng,
  shuffle,
  toCumulative,
  weightedIndex,
} from '../../utils/seeded-random.util';

export interface BusinessDataset {
  merchants: BizMerchant[];
  branches: BizBranch[];
  terminals: BizTerminal[];
  transactions: BizTransaction[];
}

const EXCHANGE_RATE_USD_HNL = 24.7;
const DAYS_WINDOW = 365;

/** Peso relativo de cada ciudad al ubicar comercios/sucursales (las ciudades grandes concentran más POS). */
const LOCATION_WEIGHTS: Record<string, number> = {
  'Tegucigalpa': 6,
  'Comayagüela': 2,
  'San Pedro Sula': 6,
  'Choloma': 2,
  'Villanueva': 1,
  'Puerto Cortés': 1,
  'La Ceiba': 2,
  'Tela': 1,
  'Choluteca': 1,
  'El Progreso': 1,
  'Comayagua': 1,
  'Trujillo': 1,
  'Santa Rosa de Copán': 1,
  'Juticalpa': 1,
  'Santa Bárbara': 1,
  'Danlí': 1,
  'Roatán': 1,
  'La Esperanza': 1,
  'Nacaome': 1,
  'Gracias': 1,
};

const HN_CITY_COORDS: Record<string, [number, number]> = {
  'Tegucigalpa': [14.0723, -87.1921],
  'Comayagüela': [14.0839, -87.2119],
  'San Pedro Sula': [15.5044, -88.025],
  'Choloma': [15.6136, -87.9531],
  'Villanueva': [15.3167, -87.9667],
  'Puerto Cortés': [15.8272, -87.9339],
  'La Ceiba': [15.7597, -86.7822],
  'Tela': [15.7773, -87.4531],
  'Choluteca': [13.3011, -87.1897],
  'El Progreso': [15.4, -87.8],
  'Comayagua': [14.4522, -87.6375],
  'Trujillo': [15.9192, -85.95],
  'Santa Rosa de Copán': [14.7667, -88.7833],
  'Juticalpa': [14.6664, -86.2214],
  'Santa Bárbara': [14.9167, -88.2333],
  'Danlí': [14.0333, -86.5833],
  'Roatán': [16.32, -86.535],
  'La Esperanza': [14.3167, -88.1667],
  'Nacaome': [13.5333, -87.4833],
  'Gracias': [14.5833, -88.5833],
};

const STREET_NAMES = [
  'Av. Circunvalación', 'Blvd. Morazán', 'Col. Kennedy', 'Barrio El Centro',
  'Res. Las Colinas', 'Blvd. del Norte', 'Anillo Periférico', 'Col. Satélite',
  'Col. Palmira', 'Blvd. Suyapa', 'Barrio Guamilito', 'Col. Rio de Piedras',
];

const TERMINAL_COUNT_RANGE_BY_CATEGORY: Record<MccCategory, [number, number]> = {
  grocery: [4, 10],
  restaurant: [1, 3],
  pharmacy: [1, 3],
  fuel: [3, 7],
  hotel: [2, 5],
  retail: [2, 5],
  electronics: [2, 4],
  convenience: [1, 3],
};

const TICKET_RANGE_BY_CATEGORY: Record<MccCategory, [number, number]> = {
  grocery: [150, 1800],
  restaurant: [90, 900],
  pharmacy: [80, 1200],
  fuel: [200, 1400],
  hotel: [900, 12000],
  retail: [150, 3500],
  electronics: [500, 15000],
  convenience: [30, 350],
};

const CATEGORY_SALES_WEIGHT: Record<MccCategory, number> = {
  grocery: 3.0,
  restaurant: 1.6,
  pharmacy: 1.8,
  fuel: 2.4,
  hotel: 0.7,
  retail: 1.2,
  electronics: 0.6,
  convenience: 1.4,
};

const USD_SHARE_BY_CATEGORY: Record<MccCategory, number> = {
  grocery: 0.03,
  restaurant: 0.05,
  pharmacy: 0.03,
  fuel: 0.02,
  hotel: 0.35,
  retail: 0.12,
  electronics: 0.2,
  convenience: 0.02,
};

/** Índice alineado a Date#getHours() (0–23). */
const HOUR_WEIGHTS_BY_CATEGORY: Record<MccCategory, number[]> = {
  grocery:      [1, 1, 1, 1, 1, 2, 4, 8, 12, 16, 18, 20, 19, 17, 16, 17, 19, 20, 18, 14, 10, 6, 3, 2],
  restaurant:   [1, 1, 1, 1, 1, 1, 2, 3, 4, 6, 8, 14, 20, 16, 10, 8, 9, 14, 20, 18, 12, 6, 3, 2],
  pharmacy:     [2, 2, 1, 1, 1, 2, 4, 7, 10, 13, 14, 14, 13, 12, 12, 13, 14, 14, 13, 10, 7, 5, 3, 2],
  fuel:         [6, 5, 4, 4, 5, 7, 10, 14, 15, 14, 13, 13, 13, 13, 13, 14, 15, 16, 15, 13, 11, 9, 8, 7],
  hotel:        [5, 4, 4, 3, 3, 4, 6, 8, 9, 9, 9, 10, 11, 10, 12, 13, 13, 12, 11, 10, 9, 8, 7, 6],
  retail:       [0, 0, 0, 0, 0, 0, 1, 2, 5, 10, 14, 16, 16, 15, 15, 16, 16, 15, 10, 6, 3, 1, 0, 0],
  electronics:  [0, 0, 0, 0, 0, 0, 0, 1, 3, 8, 13, 15, 15, 14, 14, 15, 15, 14, 9, 4, 1, 0, 0, 0],
  convenience:  [3, 2, 2, 1, 1, 2, 5, 9, 11, 12, 12, 13, 13, 12, 12, 13, 14, 15, 15, 14, 12, 9, 6, 4],
};

/** Índice alineado a Date#getDay() (0=domingo … 6=sábado). */
const DOW_WEIGHTS_BY_CATEGORY: Record<MccCategory, number[]> = {
  grocery:      [14, 10, 10, 10, 11, 14, 16],
  restaurant:   [16, 8, 8, 9, 10, 15, 18],
  pharmacy:     [9, 12, 12, 12, 12, 12, 11],
  fuel:         [12, 13, 13, 13, 13, 14, 12],
  hotel:        [13, 10, 10, 10, 11, 15, 16],
  retail:       [12, 10, 10, 10, 11, 16, 18],
  electronics:  [11, 11, 11, 11, 12, 16, 17],
  convenience:  [13, 12, 12, 12, 12, 13, 13],
};

/** Índice alineado a Date#getMonth() (0=enero … 11=diciembre). */
const MONTH_SEASONAL = [0.85, 0.9, 0.95, 0.95, 1.0, 1.0, 1.05, 1.05, 1.0, 1.0, 1.15, 1.5];

function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function pickWeightedLocation(rng: Rng): HnLocation {
  const weights = HN_LOCATIONS.map(l => LOCATION_WEIGHTS[l.municipality] ?? 1);
  return HN_LOCATIONS[weightedIndex(rng, weights)];
}

function randTicket(rng: Rng, [min, max]: [number, number]): number {
  const skew = Math.pow(rng(), 2.3);
  const value = min + (max - min) * skew;
  return Math.round(value / 5) * 5;
}

function weightedCardBrand(rng: Rng): CardBrand {
  const idx = weightedIndex(rng, CARD_BRAND_WEIGHTS.map(w => w.weight));
  return CARD_BRAND_WEIGHTS[idx].id;
}

function weightedCardType(rng: Rng): CardType {
  const idx = weightedIndex(rng, CARD_TYPE_WEIGHTS.map(w => w.weight));
  return CARD_TYPE_WEIGHTS[idx].id;
}

function generateMerchants(rng: Rng): BizMerchant[] {
  const merchants: BizMerchant[] = [];
  const usedNames = new Set<string>();
  let seq = 1;

  for (const brand of BRAND_TEMPLATES) {
    const regionNames = shuffle(rng, BRAND_REGION_NAMES).slice(0, brand.regions);
    for (const region of regionNames) {
      const location = pickWeightedLocation(rng);
      const name = `${brand.name} — ${region}`;
      usedNames.add(name);
      merchants.push({
        id: `biz-mer-${seq++}`,
        name,
        mccCategory: brand.mccCategory,
        mcc: MCC_BY_CATEGORY[brand.mccCategory].code,
        acquirerBank: randChoice(rng, ACQUIRER_BANKS),
        department: location.department,
        municipality: location.municipality,
        city: location.municipality,
        branchCount: 0,
        terminalCount: 0,
        createdAt: daysAgoIso(randInt(rng, 400, 1600)),
      });
    }
  }

  (Object.keys(INDEPENDENT_COUNT_BY_CATEGORY) as MccCategory[]).forEach(category => {
    const count = INDEPENDENT_COUNT_BY_CATEGORY[category];
    const bank = shuffle(rng, INDEPENDENT_NAME_BANK[category]);
    for (let i = 0; i < count; i++) {
      const location = pickWeightedLocation(rng);
      let name = bank[i % bank.length];
      if (usedNames.has(name)) {
        name = `${name} - ${location.municipality}`;
      }
      usedNames.add(name);
      merchants.push({
        id: `biz-mer-${seq++}`,
        name,
        mccCategory: category,
        mcc: MCC_BY_CATEGORY[category].code,
        acquirerBank: randChoice(rng, ACQUIRER_BANKS),
        department: location.department,
        municipality: location.municipality,
        city: location.municipality,
        branchCount: 0,
        terminalCount: 0,
        createdAt: daysAgoIso(randInt(rng, 60, 1400)),
      });
    }
  });

  return merchants;
}

function generateBranches(rng: Rng, merchants: BizMerchant[]): BizBranch[] {
  const isBrandMerchant = (m: BizMerchant) => m.name.includes(' — ');

  const rawWeights = merchants.map(m => (isBrandMerchant(m) ? randInt(rng, 7, 11) : randInt(rng, 1, 4)));
  const branchCounts = distributeCount(500, rawWeights);

  const branches: BizBranch[] = [];
  let seq = 1;

  merchants.forEach((merchant, idx) => {
    const count = Math.max(1, branchCounts[idx]);
    const brandName = merchant.name.split(' — ')[0];
    for (let i = 0; i < count; i++) {
      // La mayoría de las sucursales quedan en la ciudad "sede" del comercio; el resto se dispersa.
      const location = i === 0 || rng() < 0.55 ? { department: merchant.department, municipality: merchant.municipality } : pickWeightedLocation(rng);
      const coords = HN_CITY_COORDS[location.municipality] ?? [14.0723, -87.1921];
      const jitterLat = randFloat(rng, -0.025, 0.025);
      const jitterLng = randFloat(rng, -0.025, 0.025);
      const street = randChoice(rng, STREET_NAMES);
      const branchName = count === 1 ? brandName : `${brandName} - ${location.municipality} ${i + 1}`;

      branches.push({
        id: `biz-branch-${seq++}`,
        merchantId: merchant.id,
        merchantName: merchant.name,
        mccCategory: merchant.mccCategory,
        name: branchName,
        department: location.department,
        municipality: location.municipality,
        city: location.municipality,
        address: `${street}, ${location.municipality}`,
        latitude: coords[0] + jitterLat,
        longitude: coords[1] + jitterLng,
        terminalCount: 0,
      });
    }
    merchant.branchCount = count;
  });

  return branches;
}

function generateTerminals(rng: Rng, branches: BizBranch[]): BizTerminal[] {
  const rawWeights = branches.map(b => {
    const [min, max] = TERMINAL_COUNT_RANGE_BY_CATEGORY[b.mccCategory];
    return randInt(rng, min, max);
  });
  const terminalCounts = distributeCount(2000, rawWeights);

  const terminals: BizTerminal[] = [];
  let seq = 1;

  branches.forEach((branch, idx) => {
    const count = Math.max(1, terminalCounts[idx]);
    for (let i = 0; i < count; i++) {
      const isOnline = rng() < 0.92;
      const installedDaysAgo = randInt(rng, 30, 1100);
      terminals.push({
        id: `biz-pos-${seq}`,
        serial: `BIZ${String(seq).padStart(6, '0')}`,
        model: randChoice(rng, TERMINAL_MODELS),
        branchId: branch.id,
        branchName: branch.name,
        merchantId: branch.merchantId,
        merchantName: branch.merchantName,
        mccCategory: branch.mccCategory,
        city: branch.city,
        department: branch.department,
        status: isOnline ? 'online' : 'offline',
        installedAt: daysAgoIso(installedDaysAgo),
        lastConnectionAt: isOnline
          ? daysAgoIso(randFloat(rng, 0, 0.2))
          : daysAgoIso(randInt(rng, 2, 30)),
      });
      seq++;
    }
    branch.terminalCount = count;
  });

  return terminals;
}

function buildDayWindow(): Date[] {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const days: Date[] = [];
  for (let i = DAYS_WINDOW - 1; i >= 0; i--) {
    const d = new Date(start);
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days;
}

function generateTransactions(
  rng: Rng,
  terminals: BizTerminal[],
  merchantAcquirerBank: Map<string, string>,
): BizTransaction[] {
  const days = buildDayWindow();

  const dayCumulativeByCategory = new Map<MccCategory, number[]>();
  const hourCumulativeByCategory = new Map<MccCategory, number[]>();

  (Object.keys(HOUR_WEIGHTS_BY_CATEGORY) as MccCategory[]).forEach(category => {
    const dowWeights = DOW_WEIGHTS_BY_CATEGORY[category];
    const dayWeights = days.map(d => MONTH_SEASONAL[d.getMonth()] * dowWeights[d.getDay()]);
    dayCumulativeByCategory.set(category, toCumulative(dayWeights));
    hourCumulativeByCategory.set(category, toCumulative(HOUR_WEIGHTS_BY_CATEGORY[category]));
  });

  const terminalWeights = terminals.map(t => {
    const base = CATEGORY_SALES_WEIGHT[t.mccCategory] * randFloat(rng, 0.6, 1.4);
    return t.status === 'offline' ? base * 0.2 : base;
  });
  const terminalTxCounts = distributeCount(100_000, terminalWeights);

  const transactions: BizTransaction[] = [];
  let seq = 1;

  terminals.forEach((terminal, idx) => {
    const count = terminalTxCounts[idx];
    if (count <= 0) return;

    const dayCum = dayCumulativeByCategory.get(terminal.mccCategory)!;
    const hourCum = hourCumulativeByCategory.get(terminal.mccCategory)!;
    const ticketRange = TICKET_RANGE_BY_CATEGORY[terminal.mccCategory];
    const usdShare = USD_SHARE_BY_CATEGORY[terminal.mccCategory];
    const acquirerBank = merchantAcquirerBank.get(terminal.merchantId) ?? ACQUIRER_BANKS[0];

    for (let j = 0; j < count; j++) {
      const dayIdx = pickFromCumulative(rng, dayCum);
      const hour = pickFromCumulative(rng, hourCum);
      const date = new Date(days[dayIdx]);
      date.setHours(hour, randInt(rng, 0, 59), randInt(rng, 0, 59), 0);

      const amountHnl = randTicket(rng, ticketRange);
      const currency = rng() < usdShare ? 'USD' : 'HNL';
      const amount = currency === 'HNL' ? amountHnl : Math.round((amountHnl / EXCHANGE_RATE_USD_HNL) * 100) / 100;

      transactions.push({
        id: `biz-tx-${seq++}`,
        terminalId: terminal.id,
        branchId: terminal.branchId,
        branchName: terminal.branchName,
        merchantId: terminal.merchantId,
        merchantName: terminal.merchantName,
        mccCategory: terminal.mccCategory,
        acquirerBank,
        cardBrand: weightedCardBrand(rng),
        cardType: weightedCardType(rng),
        currency,
        amount,
        amountHnl,
        city: terminal.city,
        department: terminal.department,
        createdAt: date.toISOString(),
      });
    }
  });

  transactions.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return transactions;
}

/** Genera el dataset completo de Business Insights de forma determinista (misma semilla ⇒ mismos datos). */
export function generateBusinessDataset(seed = 4202601): BusinessDataset {
  const rng = createRng(seed);

  const merchants = generateMerchants(rng);
  const branches = generateBranches(rng, merchants);
  const terminals = generateTerminals(rng, branches);

  merchants.forEach(m => {
    m.terminalCount = terminals.filter(t => t.merchantId === m.id).length;
  });

  const merchantAcquirerBank = new Map(merchants.map(m => [m.id, m.acquirerBank]));
  const transactions = generateTransactions(rng, terminals, merchantAcquirerBank);

  return { merchants, branches, terminals, transactions };
}
