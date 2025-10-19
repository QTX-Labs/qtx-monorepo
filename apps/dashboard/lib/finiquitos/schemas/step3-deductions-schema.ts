import { z } from 'zod';

/**
 * Schema para Paso 3: Deducciones Manuales
 *
 * Este schema valida las deducciones que el usuario ingresa manualmente:
 * - Infonavit
 * - Fonacot
 * - Otras Deducciones
 * - Subsidio
 *
 * Todas las deducciones son opcionales y deben ser mayores o iguales a 0.
 * El ISR se calcula automáticamente, no se ingresa aquí.
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

    subsidio: z.coerce.number()
      .nonnegative('El monto de subsidio no puede ser negativo')
      .default(0),
  }).default({
    infonavit: 0,
    fonacot: 0,
    otras: 0,
    subsidio: 0,
  }),
});

export type Step3Deductions = z.infer<typeof step3DeductionsSchema>;
export type DeduccionesManuales = Step3Deductions['deduccionesManuales'];
