'use client';

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
      fiscalDailySalary: 0,
      integratedDailySalary: 0,
      salaryFrequency: SalaryFrequency.WEEKLY,
      borderZone: BorderZone.NO_FRONTERIZA,
      aguinaldoDays: 15,
      vacationDays: 12,
      vacationPremiumPercentage: 25,
      pendingVacationDays: 0,
      pendingVacationPremium: 0,
      complementoActivado: false,
      daysFactor: 30.4,
      complementPendingVacationDays: 0,
      complementPendingVacationPremium: 0,
      liquidacionActivada: false,
      daysFactorModified: false,
    },
  });

  const complementoActivado = form.watch('complementoActivado');

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
      salaryFrequency: data.salaryFrequency,
      aguinaldoDays: data.aguinaldoDays,
      vacationDays: data.vacationDays,
      vacationPremiumPercentage: data.vacationPremiumPercentage,
      pendingVacationDays: data.pendingVacationDays,
      pendingVacationPremium: data.pendingVacationPremium,
      complemento: data.complementoActivado && data.realHireDate && data.realDailySalary ? {
        enabled: true,
        realHireDate: data.realHireDate,
        realDailySalary: data.realDailySalary,
        pendingVacationDays: data.complementPendingVacationDays,
        pendingVacationPremium: data.complementPendingVacationPremium,
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
    updateStep2({
      factoresFiniquito: calculation.factores.finiquito,
      factoresLiquidacion: calculation.factores.liquidacion,
      factoresComplemento: calculation.factores.complemento,
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
                  <FormLabel>RFC de la Empresa</FormLabel>
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
              name="fiscalDailySalary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Salario Diario Fiscal *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="integratedDailySalary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Salario Diario Integrado *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                  <FormDescription>Mínimo legal: 6 días</FormDescription>
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

        {/* Beneficios Fiscales */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Beneficios Fiscales (Pendientes)</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="pendingVacationDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Días de Vacaciones Pendientes</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="1"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pendingVacationPremium"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prima Vacacional Pendiente ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
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
                name="realDailySalary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salario Diario Real *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="complementPendingVacationDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Días de Vacaciones Pendientes (Complemento)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="complementPendingVacationPremium"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prima Vacacional Pendiente ($) (Complemento)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
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
