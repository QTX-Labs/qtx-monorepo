import { z } from 'zod';

/**
 * Schema para Paso 3: Deducciones Manuales
 *
 * Este schema valida las deducciones que el usuario ingresa manualmente:
 * - Infonavit
 * - Fonacot
 * - Otras Deducciones
 * - ISR (opcional: puede ser calculado automáticamente o editado manualmente)
 *
 * Todas las deducciones son opcionales y deben ser mayores o iguales a 0.
 */
export const step3DeductionsSchema = z.object({
  deduccionesManuales: z.object({
    infonavit: z.coerce.number()
      .nonnegative('El monto de Infonavit no puede ser negativo')
      .default(0),

    fonacot: z.coerce.number()
      .nonnegative('El monto de Fonacot no puede ser negativo')
      .default(0),

    otras: z.coerce.number()
      .nonnegative('El monto de otras deducciones no puede ser negativo')
      .default(0),
  }).default({
    infonavit: 0,
    fonacot: 0,
    otras: 0,
  }),

  // Flag para indicar si el usuario quiere editar ISR manualmente
  enableManualISR: z.boolean().default(false).optional(),

  // Valores de ISR editables (opcionales, solo se usan si enableManualISR = true)
  manualISR: z.object({
    isrFiniquito: z.coerce.number()
      .nonnegative('El ISR de finiquito no puede ser negativo')
      .optional(),

    isrArt174: z.coerce.number()
      .nonnegative('El ISR Art. 174 no puede ser negativo')
      .optional(),

    isrIndemnizacion: z.coerce.number()
      .nonnegative('El ISR de indemnización no puede ser negativo')
      .optional(),
  }).optional(),
});

export type Step3Deductions = z.infer<typeof step3DeductionsSchema>;
export type DeduccionesManuales = Step3Deductions['deduccionesManuales'];
export type ManualISR = Step3Deductions['manualISR'];
