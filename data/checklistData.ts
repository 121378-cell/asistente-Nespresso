import { ChecklistItem } from '../types';

export const zeniusChecklist: ChecklistItem[] = [
  // * Comprovacions previes
  {
    id: 'z_prev_1',
    section: '* Comprovacions previes',
    text: 'Funcionament grup de café - Asa - loctite 243',
  },
  {
    id: 'z_prev_2',
    section: '* Comprovacions previes',
    text: 'Comprovacio de sortida de café en 5 seg.',
  },
  {
    id: 'z_prev_3',
    section: '* Comprovacions previes',
    text: "Comprovacio de sortida d'aigua infusio",
  },
  {
    id: 'z_prev_4',
    section: '* Comprovacions previes',
    text: 'Comprovacio reten (VERMELL / NEGRE)',
  },
  { id: 'z_prev_5', section: '* Comprovacions previes', text: 'Verificar estat exterior' },

  // * Manteniment generic
  { id: 'z_mant_1', section: '* Manteniment generic', text: 'Canvi junta Reten' },
  { id: 'z_mant_2', section: '* Manteniment generic', text: 'Canvi de 16 juntes EUG071881' },
  {
    id: 'z_mant_3',
    section: '* Manteniment generic',
    text: 'Revisar pressio (minm 19bar) durant 15 segons',
  },
  { id: 'z_mant_4', section: '* Manteniment generic', text: 'Neteja boca sortida café' },
  {
    id: 'z_mant_5',
    section: '* Manteniment generic',
    text: 'Neteja boca sortida aigua - infusions',
  },
  { id: 'z_mant_6', section: '* Manteniment generic', text: 'Comprovacio estat de la botonera' },
  {
    id: 'z_mant_7',
    section: '* Manteniment generic',
    text: 'Comprovacio de estat de tapes, frontal, i caperuza',
  },

  // * Comprovacions en funcionament
  {
    id: 'z_func_1',
    section: '* Comprovacions en funcionament',
    text: 'Descalcificació (ACID / ESBANDIDA)',
  },
  { id: 'z_func_2', section: '* Comprovacions en funcionament', text: 'Valors de fabrica' },
  {
    id: 'z_func_3',
    section: '* Comprovacions en funcionament',
    text: 'Comprovacio volums 25cl 40cl 110cl 150cl',
  },
  {
    id: 'z_func_4',
    section: '* Comprovacions en funcionament',
    text: 'Temperatura café 86º +-3ºC',
  },
  { id: 'z_func_5', section: '* Comprovacions en funcionament', text: 'Apagada automatic 12h' },
  {
    id: 'z_func_6',
    section: '* Comprovacions en funcionament',
    text: "Duresa de l'aigua (programacio pulsem el boto de Ristretto)",
  },
  {
    id: 'z_func_7',
    section: '* Comprovacions en funcionament',
    text: 'Filtro apagat (pulsem en modo programacio el boto de Lungo)',
  },
  {
    id: 'z_func_8',
    section: '* Comprovacions en funcionament',
    text: 'Buidat aigua de la cafetera',
  },

  // * Revisio extraibles i neteja
  {
    id: 'z_rev_1',
    section: '* Revisio extraibles i neteja',
    text: 'extraibles - cable amb colze - flotador',
  },
];

export const geminiChecklist: ChecklistItem[] = [
  {
    id: 'g1',
    section: 'Cabezales',
    text: 'Sincronización de cierre suave de AMBOS cabezales (Izq/Der).',
  },
  { id: 'g2', section: 'Hidráulica', text: 'Test de extracción simultánea (Stress Test).' },
  {
    id: 'g3',
    section: 'Hidráulica',
    text: 'Vapor (Solo CS223): Presión constante y purga de boquilla.',
  },
  {
    id: 'g4',
    section: 'Sistema de Leche',
    text: 'Sistema de Leche (CS223): Revisión de Pajas de Aspiración.',
  },
  {
    id: 'g5',
    section: 'Depósitos',
    text: 'Válvulas Depósito: Verificar estanqueidad de las válvulas de pie (3L).',
  },
  {
    id: 'g6',
    section: 'Sensores',
    text: 'Sensores Cápsulas: Verificar detección de "cajón lleno".',
  },
  {
    id: 'g7',
    section: 'Mantenimiento',
    text: 'Grupo: Limpieza profunda de Placa Piramidal (ambos lados).',
  },
  { id: 'g8', section: 'Interfaz', text: 'Pantalla LCD: Verificar retroiluminación y píxeles.' },
  {
    id: 'g9',
    section: 'Software',
    text: 'Menú Técnico: Comprobar última descalcificación en menú Care.',
  },
];

export const momentoChecklist: ChecklistItem[] = [
  {
    id: 'm1',
    section: 'Interfaz',
    text: 'Pantalla Táctil: Test de respuesta en 4 esquinas (Touch Test).',
  },
  {
    id: 'm2',
    section: 'Sensores',
    text: 'Sensor Proximidad: Limpieza de barra IR inferior y test de despertar.',
  },
  {
    id: 'm3',
    section: 'Mecánica',
    text: 'Grupo Motorizado: Verificar sonido y suavidad al cerrar.',
  },
  {
    id: 'm4',
    section: 'Reconocimiento',
    text: 'Reconocimiento Cápsula: Test con diferentes variedades.',
  },
  { id: 'm5', section: 'Conectividad', text: 'Verificar señal de telemetría y módulo M2M.' },
  {
    id: 'm6',
    section: 'Software',
    text: 'Error Log: Acceder menú técnico y revisar Errores 3xxx.',
  },
  {
    id: 'm7',
    section: 'Hidráulica',
    text: 'Verificar fugas en el caudalímetro (Error 1xxx común).',
  },
  {
    id: 'm8',
    section: 'Mecánica',
    text: 'Bandeja Goteo: Flotador libre y contacto de presencia limpio.',
  },
  {
    id: 'm9',
    section: 'Térmico',
    text: 'Temperatura: Estabilidad térmica (Thermoblok inteligente).',
  },
];

export const checklists: { [key: string]: ChecklistItem[] } = {
  'Zenius ZN 100 PRO': zeniusChecklist,
  'Gemini CS 203/223': geminiChecklist,
  'Nespresso Momento': momentoChecklist,
};
