import { CardBrand, CardType, MccCategory } from '../../models/business-insights';

/** Departamentos y ciudades reales de Honduras usadas para distribuir comercios y sucursales. */
export interface HnLocation {
  department: string;
  municipality: string;
}

export const HN_LOCATIONS: HnLocation[] = [
  { department: 'Francisco Morazán', municipality: 'Tegucigalpa' },
  { department: 'Francisco Morazán', municipality: 'Comayagüela' },
  { department: 'Cortés', municipality: 'San Pedro Sula' },
  { department: 'Cortés', municipality: 'Choloma' },
  { department: 'Cortés', municipality: 'Villanueva' },
  { department: 'Cortés', municipality: 'Puerto Cortés' },
  { department: 'Atlántida', municipality: 'La Ceiba' },
  { department: 'Atlántida', municipality: 'Tela' },
  { department: 'Choluteca', municipality: 'Choluteca' },
  { department: 'Yoro', municipality: 'El Progreso' },
  { department: 'Comayagua', municipality: 'Comayagua' },
  { department: 'Colón', municipality: 'Trujillo' },
  { department: 'Copán', municipality: 'Santa Rosa de Copán' },
  { department: 'Olancho', municipality: 'Juticalpa' },
  { department: 'Santa Bárbara', municipality: 'Santa Bárbara' },
  { department: 'El Paraíso', municipality: 'Danlí' },
  { department: 'Islas de la Bahía', municipality: 'Roatán' },
  { department: 'Intibucá', municipality: 'La Esperanza' },
  { department: 'Valle', municipality: 'Nacaome' },
  { department: 'Lempira', municipality: 'Gracias' },
];

/** MCC reales agrupados por categoría de negocio (alineado a las categorías del brief). */
export const MCC_BY_CATEGORY: Record<MccCategory, { code: string; description: string }> = {
  grocery: { code: '5411', description: 'Supermercados' },
  restaurant: { code: '5812', description: 'Restaurantes' },
  pharmacy: { code: '5912', description: 'Farmacias' },
  fuel: { code: '5541', description: 'Estaciones de servicio' },
  hotel: { code: '7011', description: 'Hoteles y hospedaje' },
  retail: { code: '5310', description: 'Tiendas por departamento' },
  electronics: { code: '5732', description: 'Electrónica y electrodomésticos' },
  convenience: { code: '5499', description: 'Tiendas de conveniencia' },
};

/** Bancos adquirentes genéricos — el demo no debe asociarse a ningún banco real. */
export const ACQUIRER_BANKS: string[] = ['Banco Adquirente 1', 'Banco Adquirente 2', 'Banco Adquirente 3'];

export const CARD_BRAND_WEIGHTS: { id: CardBrand; weight: number }[] = [
  { id: 'visa', weight: 45 },
  { id: 'mastercard', weight: 38 },
  { id: 'amex', weight: 8 },
  { id: 'diners', weight: 5 },
  { id: 'unionpay', weight: 4 },
];

export const CARD_TYPE_WEIGHTS: { id: CardType; weight: number }[] = [
  { id: 'debito', weight: 55 },
  { id: 'credito', weight: 35 },
  { id: 'prepago', weight: 7 },
  { id: 'empresarial', weight: 3 },
];

export type BrandTier = 'large' | 'medium';

/** Cadenas grandes con presencia nacional — expandidas en varias entidades regionales. */
export interface BrandTemplate {
  name: string;
  mccCategory: MccCategory;
  tier: BrandTier;
  regions: number;
  branchesPerRegion: [number, number];
}

export const BRAND_TEMPLATES: BrandTemplate[] = [
  { name: 'Walmart', mccCategory: 'grocery', tier: 'large', regions: 3, branchesPerRegion: [7, 11] },
  { name: 'La Colonia', mccCategory: 'grocery', tier: 'large', regions: 4, branchesPerRegion: [7, 10] },
  { name: 'PriceSmart', mccCategory: 'grocery', tier: 'large', regions: 2, branchesPerRegion: [4, 6] },
  { name: 'Supermercados Del Corral', mccCategory: 'grocery', tier: 'medium', regions: 2, branchesPerRegion: [5, 7] },
  { name: 'Maxi Despensa', mccCategory: 'grocery', tier: 'medium', regions: 3, branchesPerRegion: [5, 7] },
  { name: 'Lady Lee', mccCategory: 'grocery', tier: 'medium', regions: 3, branchesPerRegion: [4, 6] },
  { name: 'UNO', mccCategory: 'fuel', tier: 'large', regions: 4, branchesPerRegion: [7, 9] },
  { name: 'Puma Energy', mccCategory: 'fuel', tier: 'large', regions: 4, branchesPerRegion: [6, 8] },
  { name: 'Diunsa', mccCategory: 'retail', tier: 'medium', regions: 3, branchesPerRegion: [3, 5] },
  { name: 'Jetstereo', mccCategory: 'electronics', tier: 'medium', regions: 2, branchesPerRegion: [4, 5] },
  { name: 'Farmacias Kielsa', mccCategory: 'pharmacy', tier: 'medium', regions: 3, branchesPerRegion: [6, 8] },
];

/** Regiones usadas para dar nombre a cada entidad legal regional de una cadena grande. */
export const BRAND_REGION_NAMES = [
  'Zona Central',
  'Zona Norte',
  'Litoral Atlántico',
  'Zona Occidente',
  'Zona Sur',
];

/** Nombres base para comercios independientes inventados, agrupados por categoría MCC. */
export const INDEPENDENT_NAME_BANK: Record<MccCategory, string[]> = {
  grocery: ['Minisuper La Familia', 'Despensa Popular', 'Supermercado El Ahorro', 'Abarrotería San José'],
  restaurant: [
    'Restaurante El Patio', 'Comedor Doña Sara', 'Baleadas Express', 'Pupusería San Miguel',
    'Marisquería El Puerto', 'Asados El Fogón', 'Café Colonial', 'Cocina de mi Tierra',
    'Antojitos Catrachos', 'Café Volcán', 'Pollo Rico Catracho', 'Comedor La 7',
  ],
  pharmacy: [
    'Farmacia San Rafael', 'Farmacia La Fe', 'Farmacia El Higueral', 'Farmacia Cruz Azul',
    'Farmacia Vida Nueva', 'Farmacia Medicity', 'Farmacia El Ahorro', 'Farmacia Santa Lucía',
  ],
  fuel: [
    'Servicentro Norte', 'Gasolinera Vía Rápida', 'Estación El Camino', 'Servicentro Río Blanco',
    'Servicentro Las Brisas', 'Estación La Curva',
  ],
  hotel: [
    'Hotel Colonial del Valle', 'Posada Las Brisas', 'Hotel Vista Verde', 'Hospedaje El Mirador',
    'Hotel Copán Real', 'Posada del Lago', 'Hotel Bahía Azul',
  ],
  retail: [
    'Almacenes La Ideal', 'Tienda El Regalón', 'Boutique Casa Bella', 'Zapatería El Paso',
    'Almacenes Vanidades', 'Tienda Moda Total', 'Bazar San Marcos',
  ],
  electronics: ['TecnoMundo', 'Electro Hogar', 'CompuCentro', 'Digital Plus', 'ElectroVentas HN'],
  convenience: [
    'Minimarket 24', 'Tienda Rápida El Sol', 'Kiosco Central', 'AutoMercado Express',
    'Mini Bodega La Esquina', 'Tienda de Barrio Don Chepe',
  ],
};

/** Cantidad de comercios independientes a generar por categoría (suma = 67; con las 33 entidades
 * regionales de marcas grandes se llega a exactamente 100 comercios). */
export const INDEPENDENT_COUNT_BY_CATEGORY: Record<MccCategory, number> = {
  grocery: 4,
  restaurant: 14,
  pharmacy: 9,
  fuel: 7,
  hotel: 7,
  retail: 10,
  electronics: 6,
  convenience: 10,
};

export const TERMINAL_MODELS = [
  'Verifone VX520', 'Verifone VX820', 'Ingenico Move5000', 'Ingenico Lane3000',
  'Sunmi P2', 'Sunmi V2 Pro', 'PAX A920', 'PAX S920',
];
