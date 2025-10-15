import { z } from 'zod';
import { BorderZone, GratificationType, SalaryFrequency } from '@workspace/database';

const finiquitoBaseSchema = z.object({
  // Datos Básicos
  employeeName: z.string().min(1, 'El nombre del empleado es requerido'),
  employeePosition: z.string().optional(),
  employeeRFC: z.string()
    .min(1, 'El RFC del empleado es requerido')
    .regex(/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/, 'RFC inválido. Formato: AAAA123456XXX (12-13 caracteres)'),
  employeeCURP: z.string()
    .min(1, 'La CURP del empleado es requerida')
    .regex(/^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$/, 'CURP inválida. Debe tener 18 caracteres'),
  employeeId: z.string().optional(),

  // Datos de la Empresa
  empresaName: z.string().optional(),
  empresaRFC: z.union([
    z.string().regex(/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/, 'RFC inválido. Formato: ABC123456XXX (12-13 caracteres)'),
    z.literal('')
  ]).optional(),
  empresaMunicipio: z.string().optional(),
  empresaEstado: z.string().optional(),

  // Factores Fiscales
  hireDate: z.coerce.date({ required_error: 'La fecha de ingreso fiscal es requerida' }),
  terminationDate: z.coerce.date({ required_error: 'La fecha de baja es requerida' }),
  fiscalDailySalary: z.coerce.number().positive().optional(),
  salaryFrequency: z.nativeEnum(SalaryFrequency, {
    required_error: 'La frecuencia de pago es requerida'
  }),
  borderZone: z.nativeEnum(BorderZone, {
    required_error: 'La zona es requerida'
  }),

  // Factores de Complemento
  enableComplement: z.boolean().default(false),
  realHireDate: z.coerce.date().optional(),
  salary: z.coerce.number().positive('El salario real debe ser mayor a 0'),
  daysFactor: z.coerce.number().positive().default(30.4),

  // Prestaciones Superiores de Ley
  enableSuperiorBenefits: z.boolean().default(false),
  aguinaldoDays: z.coerce.number().nonnegative().default(15),
  vacationDays: z.coerce.number().nonnegative().default(12),
  vacationPremium: z.coerce.number().min(0).max(100).default(25), // Ahora es porcentaje entero (25 = 25%)

  // Beneficios Fiscales
  pendingVacationDays: z.coerce.number().nonnegative().default(0),
  pendingVacationPremium: z.coerce.number().nonnegative().default(0),

  // Beneficios de Complemento
  complementPendingVacationDays: z.coerce.number().nonnegative().default(0),
  complementPendingVacationPremium: z.coerce.number().nonnegative().default(0),

  // Días trabajados en periodo
  workedDays: z.coerce.number().nonnegative().default(0),

  // Liquidación
  enableLiquidation: z.boolean().default(false),
  gratificationType: z.nativeEnum(GratificationType).optional(),
  gratificationDays: z.coerce.number().nonnegative().optional(),
  gratificationPesos: z.coerce.number().nonnegative().optional(),
  severanceDays: z.coerce.number().nonnegative().default(0),
  seniorityPremiumDays: z.coerce.number().nonnegative().default(0),

  // Deducciones
  isrAmount: z.coerce.number().nonnegative().default(0),
  subsidyAmount: z.coerce.number().nonnegative().default(0),
  infonavitAmount: z.coerce.number().nonnegative().default(0),
  fonacotAmount: z.coerce.number().nonnegative().default(0),
  otherDeductions: z.coerce.number().nonnegative().default(0),

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
      // Si enableComplement está activado, realHireDate es obligatorio
      if (data.enableComplement) {
        return data.realHireDate !== undefined;
      }
      return true;
    },
    {
      message: 'La fecha de ingreso real es requerida cuando el complemento está activado',
      path: ['realHireDate']
    }
  )
  .refine(
    (data) => {
      // Si enableComplement está activado, salary debe ser mayor a 0
      if (data.enableComplement) {
        return data.salary > 0;
      }
      return true;
    },
    {
      message: 'El salario real es requerido cuando el complemento está activado',
      path: ['salary']
    }
  );

export type FiniquitoFormValues = z.infer<typeof finiquitoFormSchema>;

export const createFiniquitoSchema = finiquitoFormSchema;

export const updateFiniquitoSchema = finiquitoBaseSchema.partial().extend({
  id: z.string().cuid()
});
