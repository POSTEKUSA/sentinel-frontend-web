/** Catálogo geográfico compartido (PMT / POS Admin). */

export const PAISES = [
  'Honduras',
  'Guatemala',
  'El Salvador',
  'Nicaragua',
  'Costa Rica',
  'Panamá',
] as const;

export type Pais = (typeof PAISES)[number];

export const CIUDADES_POR_PAIS: Record<string, string[]> = {
  Honduras: [
    'Tegucigalpa', 'Comayagüela', 'San Pedro Sula', 'Choloma', 'La Ceiba',
    'El Progreso', 'Choluteca', 'Comayagua', 'Puerto Cortés', 'Danlí',
    'Juticalpa', 'Catacamas', 'Tela', 'Siguatepeque', 'La Lima',
    'Villanueva', 'Olanchito', 'Santa Rosa de Copán', 'Tocoa', 'Roatán',
  ],
  Guatemala: [
    'Ciudad de Guatemala', 'Mixco', 'Villa Nueva', 'Quetzaltenango', 'Escuintla',
    'San Juan Sacatepéquez', 'Villa Canales', 'Chinautla', 'Chimaltenango', 'Huehuetenango',
    'Amatitlán', 'Totonicapán', 'Puerto Barrios', 'Cobán', 'Antigua Guatemala',
  ],
  'El Salvador': [
    'San Salvador', 'Santa Ana', 'San Miguel', 'Soyapango', 'Santa Tecla',
    'Mejicanos', 'Apopa', 'Delgado', 'Ahuachapán', 'La Unión',
  ],
  Nicaragua: [
    'Managua', 'León', 'Masaya', 'Matagalpa', 'Chinandega',
    'Granada', 'Estelí', 'Tipitapa', 'Jinotega', 'Bluefields',
  ],
  'Costa Rica': [
    'San José', 'Alajuela', 'Cartago', 'Heredia', 'Puntarenas',
    'Limón', 'Liberia', 'Desamparados', 'San Carlos', 'Pérez Zeledón',
  ],
  Panamá: [
    'Ciudad de Panamá', 'San Miguelito', 'Colón', 'David', 'La Chorrera',
    'Arraiján', 'Santiago', 'Chitré', 'Penonomé', 'Las Tablas',
  ],
};

export const ZONAS_DEFAULT = ['Norte', 'Sur', 'Centro', 'Este', 'Oeste'] as const;
