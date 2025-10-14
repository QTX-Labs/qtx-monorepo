'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@workspace/database/client';
import { NotFoundError } from '@workspace/common/errors';
import { replaceOrgSlug, routes } from '@workspace/routes';

import { authOrganizationActionClient } from '~/actions/safe-action';
import { updateFiniquitoSchema } from '~/lib/finiquitos/schemas';
import { calculateFiniquito } from '~/lib/finiquitos/calculate-finiquito';

export const updateFiniquito = authOrganizationActionClient
  .metadata({ actionName: 'updateFiniquito' })
  .inputSchema(updateFiniquitoSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { id, ...data } = parsedInput;

    // Verificar que el finiquito existe y pertenece a la organización
    const existing = await prisma.finiquito.findUnique({
      where: { id, organizationId: ctx.organization.id }
    });

    if (!existing) {
      throw new NotFoundError('Finiquito no encontrado');
    }

    // Recalcular si hay datos relevantes
    let calculation;
    if (
      data.hireDate ||
      data.terminationDate ||
      data.salary ||
      data.salaryFrequency ||
      data.borderZone
    ) {
      calculation = calculateFiniquito({
        hireDate: data.hireDate ?? existing.hireDate,
        terminationDate: data.terminationDate ?? existing.terminationDate,
        salary: data.salary ?? Number(existing.salary),
        salaryFrequency: data.salaryFrequency ?? existing.salaryFrequency,
        borderZone: data.borderZone ?? existing.borderZone,
        fiscalDailySalary: data.fiscalDailySalary ?? Number(existing.fiscalDailySalary),
        daysFactor: data.daysFactor ?? Number(existing.daysFactor),
        aguinaldoDays: data.aguinaldoDays ?? existing.aguinaldoDays,
        vacationDays: data.vacationDays ?? existing.vacationDays,
        vacationPremium: data.vacationPremium ?? Number(existing.vacationPremiumPercentage),
        pendingVacationDays:
          data.pendingVacationDays ?? existing.pendingVacationDays,
        workedDays: data.workedDays ?? existing.pendingWorkDays,
        gratificationDays: data.gratificationDays ?? (existing.gratificationDays ? Number(existing.gratificationDays) : undefined),
        gratificationPesos: data.gratificationPesos ?? (existing.gratificationPesos ? Number(existing.gratificationPesos) : undefined),
        severanceDays: data.severanceDays ?? 0,
        seniorityPremiumDays:
          data.seniorityPremiumDays ?? 0,
        isrAmount: data.isrAmount ?? Number(existing.fiscalISR),
        imssAmount: data.imssAmount ?? Number(existing.fiscalIMSS),
        subsidyAmount: data.subsidyAmount ?? Number(existing.fiscalSubsidy),
        infonavitAmount: data.infonavitAmount ?? Number(existing.fiscalInfonavit),
        otherDeductions: data.otherDeductions ?? Number(existing.fiscalOtherDeductions)
      });
    }

    // Actualizar en base de datos
    const finiquito = await prisma.finiquito.update({
      where: { id },
      data: {
        ...(data.employeeName && { employeeName: data.employeeName }),
        ...(data.employeeId && { employeeId: data.employeeId }),
        ...(data.hireDate && { hireDate: data.hireDate }),
        ...(data.terminationDate && { terminationDate: data.terminationDate }),
        ...(data.salary && { salary: data.salary }),
        ...(data.salaryFrequency && { salaryFrequency: data.salaryFrequency }),
        ...(data.borderZone && { borderZone: data.borderZone }),
        ...(data.daysFactor && { daysFactor: data.daysFactor }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(calculation && {
          fiscalDailySalary: calculation.salaries.fiscalDailySalary,
          realDailySalary: calculation.salaries.realDailySalary,
          integratedDailySalary: calculation.salaries.integratedDailySalary,
          daysWorked: calculation.metadata.daysWorked,
          yearsWorked: calculation.metadata.yearsWorked,
          gratificationDays: calculation.metadata.gratificationDays,
          gratificationPesos: calculation.metadata.gratificationPesos,
          severanceTotalFiscal: calculation.fiscalPerceptions.severanceAmount,
          severanceTotalReal: calculation.realPerceptions.severanceAmount,
          seniorityPremiumFiscal: calculation.fiscalPerceptions.seniorityPremiumAmount,
          seniorityPremiumReal: calculation.realPerceptions.seniorityPremiumAmount,
          // Percepciones Fiscales
          fiscalAguinaldoFactor: calculation.fiscalPerceptions.aguinaldoFactor,
          fiscalAguinaldoAmount: calculation.fiscalPerceptions.aguinaldoAmount,
          fiscalVacationFactor: calculation.fiscalPerceptions.vacationFactor,
          fiscalVacationAmount: calculation.fiscalPerceptions.vacationAmount,
          fiscalVacationPremiumFactor: calculation.fiscalPerceptions.vacationPremiumFactor,
          fiscalVacationPremiumAmount: calculation.fiscalPerceptions.vacationPremiumAmount,
          fiscalPendingVacationAmount: calculation.fiscalPerceptions.pendingVacationAmount,
          fiscalPendingPremiumAmount: calculation.fiscalPerceptions.pendingPremiumAmount,
          fiscalWorkedDaysAmount: calculation.fiscalPerceptions.workedDaysAmount,
          fiscalTotalPerceptions: calculation.fiscalPerceptions.totalPerceptions,
          // Percepciones Reales
          realAguinaldoFactor: calculation.realPerceptions.aguinaldoFactor,
          realAguinaldoAmount: calculation.realPerceptions.aguinaldoAmount,
          realVacationFactor: calculation.realPerceptions.vacationFactor,
          realVacationAmount: calculation.realPerceptions.vacationAmount,
          realVacationPremiumFactor: calculation.realPerceptions.vacationPremiumFactor,
          realVacationPremiumAmount: calculation.realPerceptions.vacationPremiumAmount,
          realPendingVacationAmount: calculation.realPerceptions.pendingVacationAmount,
          realPendingPremiumAmount: calculation.realPerceptions.pendingPremiumAmount,
          realWorkedDaysAmount: calculation.realPerceptions.workedDaysAmount,
          realGratificationAmount: calculation.realPerceptions.gratificationAmount,
          realTotalPerceptions: calculation.realPerceptions.totalPerceptions,
          // Deducciones Fiscales
          fiscalISR: calculation.deductions.isr,
          fiscalIMSS: calculation.deductions.imss,
          fiscalSubsidy: calculation.deductions.subsidy,
          fiscalInfonavit: calculation.deductions.infonavit,
          fiscalOtherDeductions: calculation.deductions.otherDeductions,
          fiscalTotalDeductions: calculation.deductions.totalDeductions,
          // Deducciones Reales (generalmente $0)
          realISR: 0,
          realIMSS: 0,
          realSubsidy: 0,
          realInfonavit: 0,
          realOtherDeductions: 0,
          realTotalDeductions: 0,
          // Totales
          fiscalNetAmount: calculation.totals.netPayFiscal,
          realNetAmount: calculation.totals.netPayReal,
          totalToPay: calculation.totals.netPayTotal
        })
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
