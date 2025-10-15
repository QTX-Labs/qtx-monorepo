'use client';

import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAction } from 'next-safe-action/hooks';
import { toast } from 'sonner';

import { SalaryFrequency, BorderZone, GratificationType } from '@workspace/database';
import { Button } from '@workspace/ui/components/button';
import { Calendar } from '@workspace/ui/components/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@workspace/ui/components/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@workspace/ui/components/form';
import { Input } from '@workspace/ui/components/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@workspace/ui/components/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@workspace/ui/components/select';
import { Separator } from '@workspace/ui/components/separator';
import { cn } from '@workspace/ui/lib/utils';

import { createFiniquito } from '~/actions/finiquitos/create-finiquito';
import { finiquitoFormSchema, type FiniquitoFormValues } from '~/lib/finiquitos/schemas';
import { calculateFiniquito } from '~/lib/finiquitos/calculate-finiquito';
import type { FiniquitoCalculationResult } from '~/lib/finiquitos/types';

interface FiniquitoFormProps {
  onCancel: () => void;
  onSuccess?: () => void;
  isAdmin: boolean;
}

// Hook personalizado para debounce
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function FiniquitoForm({ onCancel, onSuccess, isAdmin }: FiniquitoFormProps) {
  const [calculationResult, setCalculationResult] = useState<FiniquitoCalculationResult | null>(null);
  const [daysFactorModified, setDaysFactorModified] = useState(false);

  const form = useForm<FiniquitoFormValues>({
    resolver: zodResolver(finiquitoFormSchema) as any,
    defaultValues: {
      employeeName: '',
      employeePosition: '',
      empresaName: '',
      empresaRFC: '',
      empresaMunicipio: '',
      empresaEstado: '',
      clientName: '',
      hireDate: undefined,
      terminationDate: undefined,
      salary: 0,
      salaryFrequency: SalaryFrequency.MONTHLY,
      borderZone: BorderZone.NO_FRONTERIZA,
      fiscalDailySalary: 278.80,
      daysFactor: 30.4,
      daysFactorModified: false,
      daysFactorModificationReason: '',
      aguinaldoDays: 15,
      vacationDays: 12,
      vacationPremium: 0.25,
      pendingVacationDays: 0,
      workedDays: 0,
      severanceDays: 0,
      seniorityPremiumDays: 0,
      isrAmount: 0,
      imssAmount: 0,
      subsidyAmount: 0,
      infonavitAmount: 0,
      otherDeductions: 0
    }
  });

  const { execute: executeCreate, status } = useAction(createFiniquito, {
    onSuccess: ({ data }) => {
      toast.success('Finiquito creado exitosamente');
      form.reset();
      setCalculationResult(null);
      onSuccess?.();
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'Error al crear el finiquito');
    }
  });

  // Observar campos específicos en lugar del objeto completo
  const hireDate = form.watch('hireDate');
  const terminationDate = form.watch('terminationDate');
  const salary = form.watch('salary');
  const salaryFrequency = form.watch('salaryFrequency');
  const borderZone = form.watch('borderZone');
  const fiscalDailySalary = form.watch('fiscalDailySalary');
  const daysFactor = form.watch('daysFactor');
  const aguinaldoDays = form.watch('aguinaldoDays');
  const vacationDays = form.watch('vacationDays');
  const vacationPremium = form.watch('vacationPremium');
  const pendingVacationDays = form.watch('pendingVacationDays');
  const workedDays = form.watch('workedDays');
  const gratificationType = form.watch('gratificationType');
  const gratificationDays = form.watch('gratificationDays');
  const gratificationPesos = form.watch('gratificationPesos');
  const severanceDays = form.watch('severanceDays');
  const seniorityPremiumDays = form.watch('seniorityPremiumDays');
  const isrAmount = form.watch('isrAmount');
  const imssAmount = form.watch('imssAmount');
  const subsidyAmount = form.watch('subsidyAmount');
  const infonavitAmount = form.watch('infonavitAmount');
  const otherDeductions = form.watch('otherDeductions');

  // Aplicar debounce a los valores numéricos (300ms de delay)
  const debouncedSalary = useDebounce(salary, 300);
  const debouncedFiscalDailySalary = useDebounce(fiscalDailySalary, 300);
  const debouncedDaysFactor = useDebounce(daysFactor, 300);
  const debouncedAguinaldoDays = useDebounce(aguinaldoDays, 300);
  const debouncedVacationDays = useDebounce(vacationDays, 300);
  const debouncedVacationPremium = useDebounce(vacationPremium, 300);
  const debouncedPendingVacationDays = useDebounce(pendingVacationDays, 300);
  const debouncedWorkedDays = useDebounce(workedDays, 300);
  const debouncedGratificationDays = useDebounce(gratificationDays, 300);
  const debouncedGratificationPesos = useDebounce(gratificationPesos, 300);
  const debouncedSeveranceDays = useDebounce(severanceDays, 300);
  const debouncedSeniorityPremiumDays = useDebounce(seniorityPremiumDays, 300);
  const debouncedIsrAmount = useDebounce(isrAmount, 300);
  const debouncedImssAmount = useDebounce(imssAmount, 300);
  const debouncedSubsidyAmount = useDebounce(subsidyAmount, 300);
  const debouncedInfonavitAmount = useDebounce(infonavitAmount, 300);
  const debouncedOtherDeductions = useDebounce(otherDeductions, 300);

  useEffect(() => {
    // Solo calcular cuando los valores debounced cambian
    if (hireDate && terminationDate && debouncedSalary > 0) {
      try {
        const result = calculateFiniquito({
          hireDate,
          terminationDate,
          salary: debouncedSalary,
          salaryFrequency,
          borderZone,
          fiscalDailySalary: debouncedFiscalDailySalary,
          daysFactor: debouncedDaysFactor,
          aguinaldoDays: debouncedAguinaldoDays,
          vacationDays: debouncedVacationDays,
          vacationPremium: debouncedVacationPremium,
          pendingVacationDays: debouncedPendingVacationDays,
          workedDays: debouncedWorkedDays,
          gratificationType,
          gratificationDays: debouncedGratificationDays,
          gratificationPesos: debouncedGratificationPesos,
          severanceDays: debouncedSeveranceDays,
          seniorityPremiumDays: debouncedSeniorityPremiumDays,
          isrAmount: debouncedIsrAmount,
          imssAmount: debouncedImssAmount,
          subsidyAmount: debouncedSubsidyAmount,
          infonavitAmount: debouncedInfonavitAmount,
          otherDeductions: debouncedOtherDeductions
        });
        setCalculationResult(result);
      } catch (error) {
        console.error('Error calculando finiquito:', error);
      }
    } else if (!hireDate || !terminationDate || debouncedSalary === 0) {
      // Limpiar el resultado si no hay datos suficientes
      setCalculationResult(null);
    }
  }, [
    hireDate,
    terminationDate,
    debouncedSalary,
    salaryFrequency,
    borderZone,
    debouncedFiscalDailySalary,
    debouncedDaysFactor,
    debouncedAguinaldoDays,
    debouncedVacationDays,
    debouncedVacationPremium,
    debouncedPendingVacationDays,
    debouncedWorkedDays,
    gratificationType,
    debouncedGratificationDays,
    debouncedGratificationPesos,
    debouncedSeveranceDays,
    debouncedSeniorityPremiumDays,
    debouncedIsrAmount,
    debouncedImssAmount,
    debouncedSubsidyAmount,
    debouncedInfonavitAmount,
    debouncedOtherDeductions
  ]);

  // Manejar cambio en el factor de días
  const handleDaysFactorChange = (value: string) => {
    const factor = parseFloat(value);
    if (!isNaN(factor)) {
      form.setValue('daysFactor', factor);
      // Marcar como modificado si es diferente de 30.4
      const isModified = factor !== 30.4;
      form.setValue('daysFactorModified', isModified);
      setDaysFactorModified(isModified);
    }
  };

  // Manejar gratificación bidireccional
  const handleGratificationDaysChange = (value: string) => {
    const days = parseFloat(value);
    if (!isNaN(days) && days > 0) {
      const realDailySalary = calculationResult?.salaries.realDailySalary || 0;
      const pesos = days * realDailySalary;
      form.setValue('gratificationDays', days);
      form.setValue('gratificationPesos', pesos);
      form.setValue('gratificationType', GratificationType.DAYS);
    }
  };

  const handleGratificationPesosChange = (value: string) => {
    const pesos = parseFloat(value);
    if (!isNaN(pesos) && pesos > 0) {
      const realDailySalary = calculationResult?.salaries.realDailySalary || 0;
      const days = realDailySalary > 0 ? pesos / realDailySalary : 0;
      form.setValue('gratificationPesos', pesos);
      form.setValue('gratificationDays', days);
      form.setValue('gratificationType', GratificationType.PESOS);
    }
  };

  const onSubmit = (values: FiniquitoFormValues) => {
    executeCreate(values);
  };

  const isSubmitting = status === 'executing';

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 pb-12">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Columna del Formulario - 2/3 del espacio */}
            <div className="lg:col-span-2 space-y-8">
              {/* Datos Básicos */}
              <Card className="border-2 hover:border-muted-foreground/20 transition-colors">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl">Datos Básicos</CardTitle>
              <CardDescription>Información del empleado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="employeeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Empleado *</FormLabel>
                    <FormControl>
                      <Input placeholder="Juan Pérez" {...field} />
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
                    <FormLabel>Puesto *</FormLabel>
                    <FormControl>
                      <Input placeholder="Gerente de Ventas" {...field} />
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
                    <FormLabel>Razón Social de la Empresa *</FormLabel>
                    <FormControl>
                      <Input placeholder="EMPRESA S.A. DE C.V." {...field} />
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
                      <Input placeholder="ABC123456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="empresaMunicipio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Municipio *</FormLabel>
                    <FormControl>
                      <Input placeholder="GUADALAJARA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="empresaEstado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado *</FormLabel>
                    <FormControl>
                      <Input placeholder="JALISCO" {...field} />
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
                    <FormLabel>Cliente *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre del cliente" {...field} />
                    </FormControl>
                    <FormDescription>
                      Cliente de ForHuman que solicita este finiquito
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hireDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de Ingreso *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full justify-start text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, 'PPP', { locale: es })
                            ) : (
                              'Selecciona fecha'
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="terminationDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de Baja *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full justify-start text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, 'PPP', { locale: es })
                            ) : (
                              'Selecciona fecha'
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

          {/* Datos Salariales */}
          <Card className="border-2 hover:border-muted-foreground/20 transition-colors">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl">Datos Salariales</CardTitle>
              <CardDescription>Salario y frecuencia de pago</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="salary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salario *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="12999.90"
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
                name="salaryFrequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frecuencia de Pago</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
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
                name="borderZone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zona</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

          {/* Factor de Días */}
          <Card className="border-2 hover:border-muted-foreground/20 transition-colors border-amber-200 dark:border-amber-900">
            <CardHeader className="space-y-1 pb-4 bg-amber-50/50 dark:bg-amber-950/20">
              <CardTitle className="text-xl flex items-center gap-2">
                Factor de Días
                {!isAdmin && (
                  <span className="text-xs font-normal text-muted-foreground px-2 py-1 bg-muted rounded">
                    Solo admin puede modificar
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                Días promedio por mes para el cálculo del finiquito
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Disclaimer Legal - siempre visible */}
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg p-4">
                <p className="text-sm text-amber-900 dark:text-amber-100 leading-relaxed">
                  <strong>Nota Legal:</strong> Este finiquito se calcula con factor de 30.4 días promedio por mes con base en el <strong>Artículo 485 de la Ley Federal del Trabajo</strong>, que establece el cálculo de prestaciones proporcionales usando el año calendario (365 días ÷ 12 meses = 30.4 días).
                </p>
              </div>

              <FormField
                control={form.control}
                name="daysFactor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Factor de Días</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        {...field}
                        readOnly={!isAdmin}
                        disabled={!isAdmin}
                        className={!isAdmin ? 'bg-muted cursor-not-allowed' : ''}
                        onChange={(e) => handleDaysFactorChange(e.target.value)}
                      />
                    </FormControl>
                    <FormDescription>
                      {isAdmin
                        ? 'Valor estándar: 30.4 días. Solo modificar con autorización y soporte.'
                        : 'Contacte a un administrador para modificar este valor.'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Campos condicionales cuando se modifica el factor */}
              {isAdmin && daysFactorModified && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-3">
                    <p className="text-sm text-yellow-900 dark:text-yellow-100 font-medium">
                      ⚠️ El factor de días ha sido modificado. Debe proporcionar una justificación y adjuntar soporte.
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="daysFactorModificationReason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Razón de la Modificación *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ejemplo: Acuerdo especial con cliente según email del 15/10/2025"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Explique por qué se modificó el factor de días estándar
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium mb-2">Documentos de soporte requeridos:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Email del cliente solicitando el cambio</li>
                      <li>Screenshot de conversación/acuerdo</li>
                      <li>PDF con términos especiales</li>
                    </ul>
                    <p className="mt-2 text-xs italic">
                      Nota: La funcionalidad de adjuntar archivos se habilitará próximamente.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Prestaciones */}
          <Card className="border-2 hover:border-muted-foreground/20 transition-colors">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl">Prestaciones</CardTitle>
              <CardDescription>Aguinaldo, vacaciones y prima vacacional</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
              <FormField
                control={form.control}
                name="aguinaldoDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Días de Aguinaldo</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
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
                name="vacationDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Días de Vacaciones</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
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
                name="vacationPremium"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prima Vacacional (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>0.25 = 25%</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

          {/* Gratificación Bidireccional */}
          <Card className="border-2 hover:border-muted-foreground/20 transition-colors">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl">Gratificación (Bidireccional)</CardTitle>
              <CardDescription>
                Ingresa días o pesos - el otro campo se calculará automáticamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="gratificationDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Días</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => handleGratificationDaysChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gratificationPesos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pesos</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => handleGratificationPesosChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

          {/* Indemnización */}
          <Card className="border-2 hover:border-muted-foreground/20 transition-colors">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl">Indemnización</CardTitle>
              <CardDescription>
                Días de indemnización por despido (flexible, sin restricciones legales)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="severanceDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Días de Indemnización</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

          {/* Prima de Antigüedad */}
          <Card className="border-2 hover:border-muted-foreground/20 transition-colors">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl">Prima de Antigüedad</CardTitle>
              <CardDescription>
                Días de prima de antigüedad según antigüedad del trabajador
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="seniorityPremiumDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Días de Prima de Antigüedad</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

          {/* Deducciones */}
          <Card className="border-2 hover:border-muted-foreground/20 transition-colors">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl">Deducciones</CardTitle>
              <CardDescription>Montos a descontar del finiquito</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="isrAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ISR</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
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
                name="imssAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IMSS</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
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
                name="subsidyAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subsidio</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
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
                name="infonavitAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Infonavit</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
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
                name="otherDeductions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Otras Deducciones</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

              {/* Botones */}
              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting} size="lg" className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting} size="lg" className="flex-1">
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar Finiquito
                </Button>
              </div>
            </div>

            {/* Columna del Cálculo en Vivo - 1/3 del espacio */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-6">
                <Card className="border-2 shadow-xl py-0 overflow-hidden">
                  <CardHeader className="bg-muted/30 border-b space-y-1 px-6 py-4 rounded-t-2xl">
                    <CardTitle className="text-lg">Cálculo en Vivo</CardTitle>
                    <CardDescription className="text-xs">Actualización automática</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 pt-4">
                    {calculationResult ? (
                      <div className="space-y-4">
                        {/* Total Principal */}
                        <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20">
                          <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Total a Pagar</div>
                          <div className="text-2xl font-bold text-primary">
                            ${calculationResult.totals.netPayTotal.toFixed(2)}
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-2">
                            {calculationResult.metadata.daysWorked} días • {calculationResult.metadata.yearsWorked.toFixed(2)} años
                          </div>
                        </div>

                        <Separator />

                        {/* Desglose Fiscal */}
                        <div>
                          <h3 className="font-bold mb-2 text-xs uppercase text-muted-foreground">Columna Fiscal</h3>
                          <div className="space-y-1.5 text-xs">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Aguinaldo</span>
                              <span className="font-medium">${calculationResult.fiscalPerceptions.aguinaldoAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Vacaciones</span>
                              <span className="font-medium">${calculationResult.fiscalPerceptions.vacationAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Prima Vacacional</span>
                              <span className="font-medium">${calculationResult.fiscalPerceptions.vacationPremiumAmount.toFixed(2)}</span>
                            </div>
                            {calculationResult.fiscalPerceptions.severanceAmount > 0 && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Indemnización</span>
                                <span className="font-medium">${calculationResult.fiscalPerceptions.severanceAmount.toFixed(2)}</span>
                              </div>
                            )}
                            {calculationResult.fiscalPerceptions.seniorityPremiumAmount > 0 && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Prima Antigüedad</span>
                                <span className="font-medium">${calculationResult.fiscalPerceptions.seniorityPremiumAmount.toFixed(2)}</span>
                              </div>
                            )}
                            <Separator className="my-2" />
                            <div className="flex justify-between font-semibold">
                              <span>Total Percepciones</span>
                              <span className="text-green-600">${calculationResult.fiscalPerceptions.totalPerceptions.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-destructive font-medium">
                              <span>Deducciones</span>
                              <span>-${calculationResult.deductions.totalDeductions.toFixed(2)}</span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between font-bold text-sm bg-muted/60 p-2 rounded">
                              <span>Neto Fiscal</span>
                              <span className="text-primary">${calculationResult.totals.netPayFiscal.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Desglose Real */}
                        <div>
                          <h3 className="font-bold mb-2 text-xs uppercase text-muted-foreground">Columna Real</h3>
                          <div className="space-y-1.5 text-xs">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Aguinaldo</span>
                              <span className="font-medium">${calculationResult.realPerceptions.aguinaldoAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Vacaciones</span>
                              <span className="font-medium">${calculationResult.realPerceptions.vacationAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Prima Vacacional</span>
                              <span className="font-medium">${calculationResult.realPerceptions.vacationPremiumAmount.toFixed(2)}</span>
                            </div>
                            {calculationResult.realPerceptions.gratificationAmount > 0 && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Gratificación</span>
                                <span className="font-medium">${calculationResult.realPerceptions.gratificationAmount.toFixed(2)}</span>
                              </div>
                            )}
                            {calculationResult.realPerceptions.severanceAmount > 0 && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Indemnización</span>
                                <span className="font-medium">${calculationResult.realPerceptions.severanceAmount.toFixed(2)}</span>
                              </div>
                            )}
                            {calculationResult.realPerceptions.seniorityPremiumAmount > 0 && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Prima Antigüedad</span>
                                <span className="font-medium">${calculationResult.realPerceptions.seniorityPremiumAmount.toFixed(2)}</span>
                              </div>
                            )}
                            <Separator className="my-2" />
                            <div className="flex justify-between font-semibold">
                              <span>Total Percepciones</span>
                              <span className="text-green-600">${calculationResult.realPerceptions.totalPerceptions.toFixed(2)}</span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between font-bold text-sm bg-muted/60 p-2 rounded">
                              <span>Neto Real</span>
                              <span className="text-primary">${calculationResult.totals.netPayReal.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-muted-foreground text-xs">
                          Completa los datos básicos
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-1">
                          para ver el cálculo en tiempo real
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
