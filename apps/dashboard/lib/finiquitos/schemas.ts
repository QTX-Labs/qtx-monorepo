import { z } from 'zod';
import { BorderZone, GratificationType, SalaryFrequency } from '@workspace/database';

const finiquitoBaseSchema = z.object({
  // Datos Básicos
  employeeName: z.string().min(1, 'El nombre del empleado es requerido'),
  employeePosition: z.string().optional(),
  employeeId: z.string().optional(),
  hireDate: z.coerce.date({ required_error: 'La fecha de ingreso es requerida' }),
  terminationDate: z.coerce.date({ required_error: 'La fecha de baja es requerida' }),

  // Datos de la Empresa
  empresaName: z.string().min(1, 'El nombre de la empresa es requerido'),
  empresaRFC: z.string().optional(),
  empresaMunicipio: z.string().optional(),
  empresaEstado: z.string().optional(),
  clientName: z.string().min(1, 'El nombre del cliente es requerido'),

  // Datos Salariales
  salary: z.coerce.number().positive('El salario debe ser mayor a 0'),
  salaryFrequency: z.nativeEnum(SalaryFrequency, {
    required_error: 'La frecuencia de pago es requerida'
  }),
  borderZone: z.nativeEnum(BorderZone, {
    required_error: 'La zona es requerida'
  }),
  fiscalDailySalary: z.coerce.number().positive().optional(),
  daysFactor: z.coerce.number().positive().default(30.4),

  // Prestaciones
  aguinaldoDays: z.coerce.number().nonnegative().default(15),
  vacationDays: z.coerce.number().nonnegative().default(12),
  vacationPremium: z.coerce.number().min(0).max(1).default(0.25),
  pendingVacationDays: z.coerce.number().nonnegative().default(0),

  // Días trabajados en periodo
  workedDays: z.coerce.number().nonnegative().default(0),

  // Gratificación (bidireccional)
  gratificationType: z.nativeEnum(GratificationType).optional(),
  gratificationDays: z.coerce.number().nonnegative().optional(),
  gratificationPesos: z.coerce.number().nonnegative().optional(),

  // Indemnización
  severanceDays: z.coerce.number().nonnegative().default(0),

  // Prima de Antigüedad
  seniorityPremiumDays: z.coerce.number().nonnegative().default(0),

  // Deducciones
  isrAmount: z.coerce.number().nonnegative().default(0),
  imssAmount: z.coerce.number().nonnegative().default(0),
  subsidyAmount: z.coerce.number().nonnegative().default(0),
  infonavitAmount: z.coerce.number().nonnegative().default(0),
  otherDeductions: z.coerce.number().nonnegative().default(0),

  // Modificación del factor de días
  daysFactorModified: z.boolean().default(false),
  daysFactorModificationReason: z.string().optional(),

  // Adjuntos (para factor de días modificado)
  attachments: z.array(z.string()).optional(),

  // Notas
  notes: z.string().optional()
});

export const finiquitoFormSchema = finiquitoBaseSchema
  .refine(
    (data) => data.terminationDate >= data.hireDate,
    {
      message: 'La fecha de baja debe ser posterior a la fecha de ingreso',
      path: ['terminationDate']
    }
  )
  .refine(
    (data) => {
      // Si se especifica gratificación, debe tener días o pesos
      if (data.gratificationType) {
        return data.gratificationDays || data.gratificationPesos;
      }
      return true;
    },
    {
      message: 'Debe especificar días o pesos para la gratificación',
      path: ['gratificationDays']
    }
  )
  .refine(
    (data) => {
      // Si se modificó el factor de días, debe proporcionar una razón
      if (data.daysFactorModified && data.daysFactor !== 30.4) {
        return data.daysFactorModificationReason && data.daysFactorModificationReason.length > 0;
      }
      return true;
    },
    {
      message: 'Debe proporcionar una razón para modificar el factor de días',
      path: ['daysFactorModificationReason']
    }
  );

export type FiniquitoFormValues = z.infer<typeof finiquitoFormSchema>;

export const createFiniquitoSchema = finiquitoFormSchema;

export const updateFiniquitoSchema = finiquitoBaseSchema.partial().extend({
  id: z.string().cuid()
});
