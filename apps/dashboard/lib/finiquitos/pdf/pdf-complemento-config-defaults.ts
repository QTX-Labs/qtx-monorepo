import type { PDFComplementoConfig } from '../schemas/pdf-complemento-config-schema';

/**
 * Finiquito complemento concept definitions
 * Maps database field names to human-readable labels
 */
export const FINIQUITO_COMPLEMENTO_CONCEPTS = [
  {
    field: 'montoDiasTrabajadosComplemento',
    label: 'Días Trabajados (Complemento)',
  },
  {
    field: 'montoSeptimoDiaComplemento',
    label: 'Séptimo Día (Complemento)',
  },
  {
    field: 'montoVacacionesComplemento',
    label: 'Vacaciones (Complemento)',
  },
  {
    field: 'realPendingVacationAmount',
    label: 'Vacaciones Pendientes (Complemento)',
  },
  {
    field: 'montoPrimaVacacionalComplemento',
    label: 'Prima Vacacional (Complemento)',
  },
  {
    field: 'realPendingPremiumAmount',
    label: 'Prima Vacacional Pendiente (Complemento)',
  },
  {
    field: 'montoAguinaldoComplemento',
    label: 'Aguinaldo (Complemento)',
  },
] as const;

/**
 * Liquidación complemento concept definitions
 * Maps database field names to human-readable labels
 */
export const LIQUIDACION_COMPLEMENTO_CONCEPTS = [
  {
    field: 'montoIndemnizacion90DiasComplemento',
    label: 'Indemnización 90 Días (Complemento)',
  },
  {
    field: 'montoIndemnizacion20DiasComplemento',
    label: 'Indemnización 20 Días (Complemento)',
  },
  {
    field: 'montoPrimaAntiguedadComplemento',
    label: 'Prima de Antigüedad (Complemento)',
  },
] as const;

/**
 * Default PDF complemento configuration
 * Replicates the previous hardcoded behavior for backward compatibility:
 * - All finiquito-complemento concepts grouped as "BONOS"
 * - All liquidación-complemento concepts grouped as "GRATIFICACIÓN"
 *
 * This default is used when:
 * - No configuration parameter is provided to the PDF API
 * - User accesses PDF via direct URL without the configuration dialog
 * - Configuration dialog is bypassed for any reason
 */
export const DEFAULT_COMPLEMENTO_CONFIG: PDFComplementoConfig = {
  displayMode: 'grouped',
  groups: [
    {
      label: 'BONOS',
      conceptFields: FINIQUITO_COMPLEMENTO_CONCEPTS.map((c) => c.field),
    },
    {
      label: 'GRATIFICACIÓN',
      conceptFields: LIQUIDACION_COMPLEMENTO_CONCEPTS.map((c) => c.field),
    },
  ],
};

/**
 * All complemento concepts combined (for validation and UI rendering)
 */
export const ALL_COMPLEMENTO_CONCEPTS = [
  ...FINIQUITO_COMPLEMENTO_CONCEPTS,
  ...LIQUIDACION_COMPLEMENTO_CONCEPTS,
] as const;
