'use client';

import { useEffect, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { BorderZone, SalaryFrequency } from '@workspace/database';
import { Button } from '@workspace/ui/components/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form';
import { Input } from '@workspace/ui/components/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { Switch } from '@workspace/ui/components/switch';
import { Separator } from '@workspace/ui/components/separator';

import { step1BaseConfigSchema, type Step1BaseConfig as Step1BaseConfigType } from '~/lib/finiquitos/schemas/step1-base-config-schema';
import { calculateFiniquitoComplete } from '~/lib/finiquitos/calculate-finiquito-complete';
import { getEmployeeVacationDays, getEmployeeIntegrationFactor, applyUMALimit } from '~/lib/finiquitos/utils';
import { useWizard } from '../wizard-context';

export function Step1BaseConfig() {
  const { step1Data, updateStep1, updateStep2, updateLiveCalculation, goNext } = useWizard();

  const form = useForm<Step1BaseConfigType>({
    resolver: zodResolver(step1BaseConfigSchema) as any, // Type inference issue with ZodEffects from .refine()
    defaultValues: step1Data || {
      employeeName: '',
      employeePosition: '',
      employeeRFC: '',
      employeeCURP: '',
      empresaName: '',
      empresaRFC: '',
      empresaMunicipio: '',
      empresaEstado: '',
      clientName: '',
      hireDate: new Date(),
      terminationDate: new Date(),
      fiscalDailySalary: 278.80, // Default for NO_FRONTERIZA
      integratedDailySalary: 0,
      integrationFactor: 0,
      borderZone: BorderZone.NO_FRONTERIZA,
      salaryFrequency: SalaryFrequency.MONTHLY, // Default, solo usado en Complemento
      aguinaldoDays: 15,
      vacationDays: 12,
      vacationPremiumPercentage: 25,
      complementoActivado: false,
      realSalary: 0,
      realDailySalary: 0,
      daysFactor: 30.4,
      complementIntegratedDailySalary: 0,
      complementIntegrationFactor: 0,
      liquidacionActivada: false,
      daysFactorModified: false,
    },
  });

  // Watch relevant fields for auto-calculations
  const borderZone = form.watch('borderZone');
  const hireDate = form.watch('hireDate');
  const terminationDate = form.watch('terminationDate');
  const fiscalDailySalary = form.watch('fiscalDailySalary');
  const aguinaldoDays = form.watch('aguinaldoDays');
  const vacationDays = form.watch('vacationDays');
  const vacationPremiumPercentage = form.watch('vacationPremiumPercentage');
  const complementoActivado = form.watch('complementoActivado');
  const realSalary = form.watch('realSalary');
  const salaryFrequency = form.watch('salaryFrequency');
  const realDailySalary = form.watch('realDailySalary');
  const realHireDate = form.watch('realHireDate');

  // Refs para trackear si campos fueron editados manualmente
  const vacationDaysManuallyEdited = useRef(false);
  const lastCalculatedVacationDays = useRef<number | null>(null);

  // AUTO-CÁLCULO 1: Salario Diario Fiscal según Zona Fronteriza (Default Value)
  // NO_FRONTERIZA: 278.80 | FRONTERIZA: 419.88
  // Se actualiza cuando cambia la zona fronteriza para sugerir el mínimo
  useEffect(() => {
    const fiscalSalary = borderZone === BorderZone.FRONTERIZA ? 419.88 : 278.80;
    form.setValue('fiscalDailySalary', fiscalSalary);
  }, [borderZone, form]);

  // AUTO-CÁLCULO 2: Días de Vacaciones según Antigüedad (LFT 2023)
  // Usa getEmployeeVacationDays(hireDate, terminationDate)
  // Solo recalcula si NO fue editado manualmente
  useEffect(() => {
    if (hireDate && terminationDate) {
      const calculatedVacationDays = getEmployeeVacationDays(hireDate, terminationDate);

      // Si el usuario no ha editado manualmente, actualizar automáticamente
      if (!vacationDaysManuallyEdited.current) {
        form.setValue('vacationDays', calculatedVacationDays);
        lastCalculatedVacationDays.current = calculatedVacationDays;
      } else {
        // Si las fechas cambiaron después de una edición manual, resetear el flag
        // para permitir auto-cálculo en el siguiente cambio de fechas
        vacationDaysManuallyEdited.current = false;
        form.setValue('vacationDays', calculatedVacationDays);
        lastCalculatedVacationDays.current = calculatedVacationDays;
      }
    }
  }, [hireDate, terminationDate, form]);

  // Detectar edición manual de días de vacaciones
  useEffect(() => {
    if (vacationDays !== undefined && lastCalculatedVacationDays.current !== null) {
      // Si el valor actual difiere del último calculado, fue editado manualmente
      if (vacationDays !== lastCalculatedVacationDays.current) {
        vacationDaysManuallyEdited.current = true;
      }
    }
  }, [vacationDays]);

  // AUTO-CÁLCULO 3: Salario Diario Integrado y Factor de Integración
  // SDI = Salario Fiscal × Factor de Integración (topado a 25 UMAs)
  // Factor de Integración considera: días aguinaldo, días vacaciones, prima vacacional
  // IMPORTANTE: Usa vacationDays del formulario (puede ser editado manualmente)
  useEffect(() => {
    if (fiscalDailySalary && vacationDays !== undefined) {
      // Calcular factor de integración manualmente usando vacationDays del formulario
      // Fórmula: FI = (D_anio + D_ag + (D_vac * (PV/100))) / D_anio
      const D_anio = 365;
      const D_ag = aguinaldoDays;
      const D_vac = vacationDays;
      const PV = vacationPremiumPercentage;

      const integrationFactor = parseFloat(
        ((D_anio + D_ag + (D_vac * (PV / 100))) / D_anio).toFixed(4)
      );

      const calculatedSDI = fiscalDailySalary * integrationFactor;
      const integratedSalary = parseFloat(applyUMALimit(calculatedSDI).toFixed(2));

      form.setValue('integrationFactor', integrationFactor);
      form.setValue('integratedDailySalary', integratedSalary);
    }
  }, [fiscalDailySalary, aguinaldoDays, vacationDays, vacationPremiumPercentage, form]);

  // AUTO-COMPLETADO: Fecha de Ingreso Real cuando se activa Complemento
  // Si el complemento se activa y la fecha real está vacía, usar la fecha fiscal como default
  useEffect(() => {
    if (complementoActivado && hireDate) {
      const currentRealHireDate = form.getValues('realHireDate');

      // Solo setear si está vacío/undefined
      if (!currentRealHireDate) {
        form.setValue('realHireDate', hireDate);
      }
    }
  }, [complementoActivado, hireDate, form]);

  // AUTO-CÁLCULO NUEVO: Salario Diario Real según Salario Real y Frecuencia de Pago
  // Convierte el salario según la frecuencia seleccionada a salario diario
  useEffect(() => {
    if (complementoActivado && realSalary && realSalary > 0) {
      const daysFactor = form.getValues('daysFactor');
      let dailySalary = 0;

      switch (salaryFrequency) {
        case SalaryFrequency.DAILY:
          dailySalary = realSalary;
          break;
        case SalaryFrequency.WEEKLY:
          dailySalary = realSalary / 7;
          break;
        case SalaryFrequency.BIWEEKLY:
          dailySalary = realSalary / 14;
          break;
        case SalaryFrequency.MONTHLY:
          dailySalary = realSalary / daysFactor;
          break;
        default:
          dailySalary = realSalary / daysFactor; // Default: MONTHLY
      }

      form.setValue('realDailySalary', parseFloat(dailySalary.toFixed(2)));
    }
  }, [complementoActivado, realSalary, salaryFrequency, form]);

  // AUTO-CÁLCULO 4: Salario Diario Integrado y Factor de Integración de Complemento
  // SDI Complemento = Salario Real × Factor de Integración Complemento (topado a 25 UMAs)
  // Factor de Integración considera: días aguinaldo, días vacaciones, prima vacacional
  // IMPORTANTE: Usa vacationDays del formulario (puede ser editado manualmente)
  useEffect(() => {
    if (complementoActivado && realDailySalary && vacationDays !== undefined) {
      // Calcular factor de integración manualmente usando vacationDays del formulario
      // Fórmula: FI = (D_anio + D_ag + (D_vac * (PV/100))) / D_anio
      const D_anio = 365;
      const D_ag = aguinaldoDays;
      const D_vac = vacationDays;
      const PV = vacationPremiumPercentage;

      const complementIntegrationFactor = parseFloat(
        ((D_anio + D_ag + (D_vac * (PV / 100))) / D_anio).toFixed(4)
      );

      const calculatedComplementSDI = realDailySalary * complementIntegrationFactor;
      const complementIntegratedSalary = parseFloat(applyUMALimit(calculatedComplementSDI).toFixed(2));

      form.setValue('complementIntegrationFactor', complementIntegrationFactor);
      form.setValue('complementIntegratedDailySalary', complementIntegratedSalary);
    }
  }, [complementoActivado, realDailySalary, aguinaldoDays, vacationDays, vacationPremiumPercentage, form]);

  const onSubmit = (data: Step1BaseConfigType) => {
    // Guardar datos del paso 1
    updateStep1(data);

    // Calcular factores y montos iniciales
    const calculation = calculateFiniquitoComplete({
      employeeId: data.employeeId,
      hireDate: data.hireDate,
      terminationDate: data.terminationDate,
      fiscalDailySalary: data.fiscalDailySalary,
      integratedDailySalary: data.integratedDailySalary,
      borderZone: data.borderZone,
      salaryFrequency: data.salaryFrequency ?? SalaryFrequency.MONTHLY, // Solo usado en Complemento
      aguinaldoDays: data.aguinaldoDays,
      vacationDays: data.vacationDays,
      vacationPremiumPercentage: data.vacationPremiumPercentage,
      complemento: data.complementoActivado && data.realHireDate && data.realDailySalary ? {
        enabled: true,
        realHireDate: data.realHireDate,
        realDailySalary: data.realDailySalary,
        complementIntegratedDailySalary: data.complementIntegratedDailySalary,
      } : undefined,
      liquidacion: data.liquidacionActivada ? { enabled: true } : undefined,
      deduccionesManuales: {
        infonavit: 0,
        fonacot: 0,
        otras: 0,
        subsidio: 0,
      },
    });

    // Guardar factores en step2Data
    // NOTA: diasTrabajados y septimoDia se inicializan en 0 para que el usuario los llene manualmente
    updateStep2({
      factoresFiniquito: {
        ...calculation.factores.finiquito,
        diasTrabajados: 0,
        septimoDia: 0,
      },
      factoresLiquidacion: calculation.factores.liquidacion,
      factoresComplemento: calculation.factores.complemento ? {
        ...calculation.factores.complemento,
        diasTrabajados: 0,
        septimoDia: 0,
      } : undefined,
      factoresLiquidacionComplemento: calculation.factores.liquidacionComplemento,
      configuracionAdicional: calculation.factores.configuracionAdicional,
      beneficiosFiscalesPendientes: {
        pendingVacationDays: 0,
        pendingVacationPremium: 0,
      },
      beneficiosComplementoPendientes: {
        complementPendingVacationDays: 0,
        complementPendingVacationPremium: 0,
      },
    });

    // Guardar cálculo en context
    updateLiveCalculation(calculation);

    // Avanzar al paso 2
    goNext();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Datos Básicos */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Datos Básicos</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="employeeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Empleado *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Juan Pérez" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="employeePosition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Puesto</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Desarrollador" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="employeeRFC"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RFC del Empleado *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="PEPE850101XXX" maxLength={13} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="employeeCURP"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CURP del Empleado *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="PEPE850101HDFRXN09" maxLength={18} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="empresaName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la Empresa *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Mi Empresa SA de CV" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="empresaRFC"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RFC de la Empresa *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="EMP850101XXX" maxLength={13} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="clientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Cliente *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Cliente Final" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* Factores Fiscales */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Factores Fiscales</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="hireDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Ingreso (Fiscal) *</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="terminationDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Baja *</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="borderZone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zona Fronteriza *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar zona" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={BorderZone.NO_FRONTERIZA}>No Fronteriza</SelectItem>
                      <SelectItem value={BorderZone.FRONTERIZA}>Fronteriza</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fiscalDailySalary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Salario Diario Fiscal</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    Mínimo según zona: ${borderZone === BorderZone.FRONTERIZA ? '419.88' : '278.80'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="integratedDailySalary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Salario Diario Integrado</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      disabled
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      className="bg-muted"
                    />
                  </FormControl>
                  <FormDescription>
                    Auto-calculado: SDF × Factor de Integración
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="integrationFactor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Factor de Integración</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.0001"
                      disabled
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      className="bg-muted"
                    />
                  </FormControl>
                  <FormDescription>
                    Auto-calculado según prestaciones
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* Prestaciones */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Prestaciones Superiores de Ley</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="aguinaldoDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Días de Aguinaldo *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="1"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 15)}
                    />
                  </FormControl>
                  <FormDescription>Mínimo legal: 15 días</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vacationDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Días de Vacaciones *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="1"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 12)}
                    />
                  </FormControl>
                  <FormDescription>
                    Calculado según antigüedad (editable)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vacationPremiumPercentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prima Vacacional (%) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="1"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 25)}
                    />
                  </FormControl>
                  <FormDescription>Mínimo legal: 25%</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />


        {/* Liquidación Toggle */}
        <FormField
          control={form.control}
          name="liquidacionActivada"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Habilitar Liquidación</FormLabel>
                <FormDescription>
                  Incluir indemnizaciones (90 días, 20 días por año) y prima de antigüedad
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Separator />

        {/* Complemento Toggle */}
        <FormField
          control={form.control}
          name="complementoActivado"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Habilitar Complemento</FormLabel>
                <FormDescription>
                  Calcular diferencia entre salario fiscal y real
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Campos de Complemento (condicionales) */}
        {complementoActivado && (
          <div className="space-y-4 pl-4 border-l-2 border-primary">
            <h4 className="text-md font-medium">Datos del Complemento</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="realHireDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Ingreso Real *</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="salaryFrequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frecuencia de Pago *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar frecuencia" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={SalaryFrequency.DAILY}>Diario</SelectItem>
                        <SelectItem value={SalaryFrequency.WEEKLY}>Semanal</SelectItem>
                        <SelectItem value={SalaryFrequency.BIWEEKLY}>Quincenal</SelectItem>
                        <SelectItem value={SalaryFrequency.MONTHLY}>Mensual</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="realSalary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salario Real *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Según frecuencia de pago seleccionada
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="realDailySalary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salario Diario Real</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        disabled
                        className="bg-muted"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Auto-calculado según salario y frecuencia
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="complementIntegrationFactor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Factor de Integración (Complemento)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.0001"
                        disabled
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        className="bg-muted"
                      />
                    </FormControl>
                    <FormDescription>
                      Auto-calculado según antigüedad y prestaciones
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="complementIntegratedDailySalary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salario Diario Integrado (Complemento)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        disabled
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        className="bg-muted"
                      />
                    </FormControl>
                    <FormDescription>
                      Auto-calculado: Salario Real × Factor de Integración
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        <div className="flex justify-end pt-6 border-t">
          <Button type="submit" size="lg">
            Calcular Factores
          </Button>
        </div>
      </form>
    </Form>
  );
}
