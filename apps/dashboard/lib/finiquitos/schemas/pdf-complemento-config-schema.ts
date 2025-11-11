import { z } from 'zod';

/**
 * Schema for a single concept group in PDF complemento configuration
 *
 * Security constraints:
 * - Group labels limited to 50 characters to prevent URL overflow
 * - Concept field names limited to 30 characters to prevent prototype pollution
 * - Control characters blocked via regex to prevent injection attacks
 */
const conceptGroupSchema = z.object({
  label: z
    .string()
    .min(1, 'El nombre del grupo es requerido')
    .max(50, 'El nombre del grupo no puede exceder 50 caracteres')
    .regex(/^[^\x00-\x1F\x7F]+$/, 'El nombre no puede contener caracteres de control'),
  conceptFields: z
    .array(
      z
        .string()
        .max(30, 'El nombre del campo no puede exceder 30 caracteres')
        .regex(/^[^\x00-\x1F\x7F]+$/, 'El campo no puede contener caracteres de control')
    )
    .min(1, 'Debe seleccionar al menos un concepto para el grupo'),
});

/**
 * Schema for PDF complemento configuration
 * Supports two display modes:
 * - itemized: Each concept shows individually with its actual label
 * - grouped: User-defined groups with custom labels summing selected concepts
 *
 * Security constraints:
 * - Maximum 20 groups to prevent DoS attacks via excessive group creation
 * - Strict duplicate prevention: no concept can appear in multiple groups
 * - All string fields validated for control characters and length limits
 *
 * Configuration is passed via URL query parameter (JSON-encoded) to the PDF API.
 */
export const pdfComplementoConfigSchema = z
  .object({
    displayMode: z.enum(['itemized', 'grouped'], {
      errorMap: () => ({ message: 'Modo de visualización inválido' }),
    }),
    groups: z
      .array(conceptGroupSchema)
      .max(20, 'No puede crear más de 20 grupos')
      .optional(),
  })
  .refine(
    (data) => {
      // Grouped mode must have at least one group
      if (data.displayMode === 'grouped') {
        return data.groups && data.groups.length > 0;
      }
      return true;
    },
    {
      message: 'Debe crear al menos un grupo en modo agrupado',
      path: ['groups'],
    }
  )
  .refine(
    (data) => {
      // STRICT VALIDATION: No concept can belong to multiple groups
      if (data.displayMode === 'grouped' && data.groups) {
        const allConcepts = data.groups.flatMap((g) => g.conceptFields);
        const uniqueConcepts = new Set(allConcepts);
        return allConcepts.length === uniqueConcepts.size;
      }
      return true;
    },
    {
      message: 'Un concepto no puede pertenecer a múltiples grupos',
      path: ['groups'],
    }
  );

/**
 * TypeScript types inferred from schemas
 */
export type PDFComplementoConfig = z.infer<typeof pdfComplementoConfigSchema>;
export type ConceptGroup = z.infer<typeof conceptGroupSchema>;
export type ComplementoDisplayMode = PDFComplementoConfig['displayMode'];
