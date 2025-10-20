'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { prisma } from '@workspace/database/client';
import { NotFoundError } from '@workspace/common/errors';
import { replaceOrgSlug, routes } from '@workspace/routes';

import { authOrganizationActionClient } from '~/actions/safe-action';
import { updateFiniquitoSchema } from '~/lib/finiquitos/schemas/step4-review-schema';
import { calculateFiniquitoComplete } from '~/lib/finiquitos/calculate-finiquito-complete';
import { mapCalculationToPrisma } from './helpers/map-calculation';

// Extender schema para incluir el ID
const updateFiniquitoInputSchema = updateFiniquitoSchema.extend({
  id: z.string().uuid('ID inválido')
});

export const updateFiniquito = authOrganizationActionClient
  .metadata({ actionName: 'updateFiniquito' })
  .inputSchema(updateFiniquitoInputSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { id, ...updates } = parsedInput;

    // Verificar que el finiquito existe y pertenece a la organización
    const existing = await prisma.finiquito.findUnique({
      where: { id, organizationId: ctx.organization.id }
    });

    if (!existing) {
      throw new NotFoundError('Finiquito no encontrado');
    }

    // Solo soportar actualizaciones para finiquitos v2
    if (existing.version !== 2) {
      throw new Error('Solo se pueden actualizar finiquitos con la nueva estructura (version 2)');
    }

    // Determinar si necesitamos recalcular
    const needsRecalculation = !!(
      updates.hireDate ||
      updates.terminationDate ||
      updates.fiscalDailySalary ||
      updates.integratedDailySalary ||
      updates.salaryFrequency ||
      updates.borderZone ||
      updates.aguinaldoDays ||
      updates.vacationDays ||
      updates.vacationPremiumPercentage ||
      updates.beneficiosFiscalesPendientes ||
      updates.beneficiosComplementoPendientes ||
      updates.complementoActivado ||
      updates.realHireDate ||
      updates.realDailySalary ||
      updates.liquidacionActivada ||
      updates.deduccionesManuales ||
      updates.factoresFiniquito ||
      updates.factoresLiquidacion ||
      updates.factoresComplemento
    );

    let calculatedFields = {};

    if (needsRecalculation) {
      // Mergear datos existentes con updates para recalcular
      const mergedInput = {
        employeeId: updates.employeeId ?? existing.employeeId ?? undefined,
        hireDate: updates.hireDate ?? existing.hireDate,
        terminationDate: updates.terminationDate ?? existing.terminationDate,
        fiscalDailySalary: updates.fiscalDailySalary ?? Number(existing.fiscalDailySalary),
        integratedDailySalary: updates.integratedDailySalary ?? Number(existing.integratedDailySalary),
        borderZone: updates.borderZone ?? existing.borderZone,
        salaryFrequency: updates.salaryFrequency ?? existing.salaryFrequency,
        aguinaldoDays: updates.aguinaldoDays ?? existing.aguinaldoDays,
        vacationDays: updates.vacationDays ?? existing.vacationDays,
        vacationPremiumPercentage: updates.vacationPremiumPercentage ?? Number(existing.vacationPremiumPercentage),
        pendingVacationDays: updates.beneficiosFiscalesPendientes?.pendingVacationDays ?? existing.pendingVacationDays,
        pendingVacationPremium: updates.beneficiosFiscalesPendientes?.pendingVacationPremium ?? 0,
        complemento: (updates.complementoActivado ?? existing.complementoActivado) ? {
          enabled: true,
          realHireDate: (updates.realHireDate ?? existing.realHireDate)!,
          realDailySalary: (updates.realDailySalary ?? Number(existing.realDailySalary)),
          pendingVacationDays: updates.beneficiosComplementoPendientes?.complementPendingVacationDays ?? 0,
          pendingVacationPremium: updates.beneficiosComplementoPendientes?.complementPendingVacationPremium ?? 0,
        } : undefined,
        liquidacion: (updates.liquidacionActivada ?? existing.liquidacionActivada) ? { enabled: true } : undefined,
        deduccionesManuales: updates.deduccionesManuales ?? {
          infonavit: existing.montoDeduccionInfonavit ? Number(existing.montoDeduccionInfonavit) : 0,
          fonacot: existing.montoDeduccionFonacot ? Number(existing.montoDeduccionFonacot) : 0,
          otras: existing.montoDeduccionOtrasDeducciones ? Number(existing.montoDeduccionOtrasDeducciones) : 0,
          subsidio: existing.montoDeduccionSubsidio ? Number(existing.montoDeduccionSubsidio) : 0,
        },
      };

      const calculation = calculateFiniquitoComplete(mergedInput);
      calculatedFields = mapCalculationToPrisma(calculation);
    }

    // Actualizar en base de datos
    const finiquito = await prisma.finiquito.update({
      where: { id },
      data: {
        // Datos básicos (solo si se proveyeron en updates)
        ...(updates.employeeName && { employeeName: updates.employeeName }),
        ...(updates.employeePosition !== undefined && { employeePosition: updates.employeePosition }),
        // employeeId is not updatable after creation
        ...(updates.empresaName && { empresaName: updates.empresaName }),
        ...(updates.empresaRFC !== undefined && { empresaRFC: updates.empresaRFC }),
        ...(updates.empresaMunicipio !== undefined && { empresaMunicipio: updates.empresaMunicipio }),
        ...(updates.empresaEstado !== undefined && { empresaEstado: updates.empresaEstado }),
        ...(updates.clientName && { clientName: updates.clientName }),

        // Datos salariales y fechas
        ...(updates.hireDate && { hireDate: updates.hireDate }),
        ...(updates.terminationDate && { terminationDate: updates.terminationDate }),
        ...(updates.fiscalDailySalary && {
          fiscalDailySalary: updates.fiscalDailySalary,
          salary: updates.fiscalDailySalary
        }),
        ...(updates.realDailySalary && { realDailySalary: updates.realDailySalary }),
        ...(updates.integratedDailySalary && { integratedDailySalary: updates.integratedDailySalary }),
        ...(updates.realHireDate !== undefined && { realHireDate: updates.realHireDate }),
        ...(updates.salaryFrequency && { salaryFrequency: updates.salaryFrequency }),
        ...(updates.borderZone && { borderZone: updates.borderZone }),

        // Prestaciones
        ...(updates.aguinaldoDays && { aguinaldoDays: updates.aguinaldoDays }),
        ...(updates.vacationDays && { vacationDays: updates.vacationDays }),
        ...(updates.vacationPremiumPercentage && { vacationPremiumPercentage: updates.vacationPremiumPercentage }),
        ...(updates.beneficiosFiscalesPendientes?.pendingVacationDays !== undefined && {
          pendingVacationDays: updates.beneficiosFiscalesPendientes.pendingVacationDays
        }),

        // Toggles
        ...(updates.liquidacionActivada !== undefined && { liquidacionActivada: updates.liquidacionActivada }),
        ...(updates.complementoActivado !== undefined && { complementoActivado: updates.complementoActivado }),

        // Factor de días
        ...(updates.daysFactor && { daysFactor: updates.daysFactor }),
        ...(updates.daysFactorModified !== undefined && { daysFactorModified: updates.daysFactorModified }),
        ...(updates.daysFactorModificationReason !== undefined && { daysFactorModificationReason: updates.daysFactorModificationReason }),

        // Campos calculados (si hubo recálculo)
        ...calculatedFields,
      }
    });

    revalidatePath(
      replaceOrgSlug(
        routes.dashboard.organizations.slug.Finiquitos,
        ctx.organization.slug
      )
    );

    return { finiquitoId: finiquito.id };
  });
