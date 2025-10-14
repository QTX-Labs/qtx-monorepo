'use client';

import { useEffect, useState } from 'react';
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
}

export function FiniquitoForm({ onCancel, onSuccess }: FiniquitoFormProps) {
  const [calculationResult, setCalculationResult] = useState<FiniquitoCalculationResult | null>(null);

  const form = useForm<FiniquitoFormValues>({
    resolver: zodResolver(finiquitoFormSchema) as any,
    defaultValues: {
      employeeName: '',
      hireDate: undefined,
      terminationDate: undefined,
      salary: 0,
      salaryFrequency: SalaryFrequency.MONTHLY,
      borderZone: BorderZone.NO_FRONTERIZA,
      fiscalDailySalary: 278.80,
      daysFactor: 30.4,
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

  // Calcular en tiempo real cuando cambien los valores
  const watchedValues = form.watch();

  useEffect(() => {
    const { hireDate, terminationDate, salary, salaryFrequency, borderZone } = watchedValues;

    if (hireDate && terminationDate && salary > 0) {
      try {
        const result = calculateFiniquito({
          hireDate,
          terminationDate,
          salary,
          salaryFrequency,
          borderZone,
          fiscalDailySalary: watchedValues.fiscalDailySalary,
          daysFactor: watchedValues.daysFactor,
          aguinaldoDays: watchedValues.aguinaldoDays,
          vacationDays: watchedValues.vacationDays,
          vacationPremium: watchedValues.vacationPremium,
          pendingVacationDays: watchedValues.pendingVacationDays,
          workedDays: watchedValues.workedDays,
          gratificationType: watchedValues.gratificationType,
          gratificationDays: watchedValues.gratificationDays,
          gratificationPesos: watchedValues.gratificationPesos,
          severanceDays: watchedValues.severanceDays,
          seniorityPremiumDays: watchedValues.seniorityPremiumDays,
          isrAmount: watchedValues.isrAmount,
          imssAmount: watchedValues.imssAmount,
          subsidyAmount: watchedValues.subsidyAmount,
          infonavitAmount: watchedValues.infonavitAmount,
          otherDeductions: watchedValues.otherDeductions
        });
        setCalculationResult(result);
      } catch (error) {
        console.error('Error calculando finiquito:', error);
      }
    }
  }, [watchedValues]);

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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Datos Básicos */}
        <Card>
          <CardHeader>
            <CardTitle>Datos Básicos</CardTitle>
            <CardDescription>Información del empleado</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
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
        <Card>
          <CardHeader>
            <CardTitle>Datos Salariales</CardTitle>
            <CardDescription>Salario y frecuencia de pago</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
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

        {/* Prestaciones */}
        <Card>
          <CardHeader>
            <CardTitle>Prestaciones</CardTitle>
            <CardDescription>Aguinaldo, vacaciones y prima vacacional</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
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
        <Card>
          <CardHeader>
            <CardTitle>Gratificación (Bidireccional)</CardTitle>
            <CardDescription>
              Ingresa días o pesos - el otro campo se calculará automáticamente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
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
        <Card>
          <CardHeader>
            <CardTitle>Indemnización</CardTitle>
            <CardDescription>
              Días de indemnización por despido (flexible, sin restricciones legales)
            </CardDescription>
          </CardHeader>
          <CardContent>
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
        <Card>
          <CardHeader>
            <CardTitle>Prima de Antigüedad</CardTitle>
            <CardDescription>
              Días de prima de antigüedad según antigüedad del trabajador
            </CardDescription>
          </CardHeader>
          <CardContent>
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
        <Card>
          <CardHeader>
            <CardTitle>Deducciones</CardTitle>
            <CardDescription>Montos a descontar del finiquito</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
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

        {/* Preview del Cálculo */}
        {calculationResult && (
          <>
            <Separator />
            <Card>
              <CardHeader>
                <CardTitle>Preview del Cálculo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Columna Fiscal */}
                  <div>
                    <h3 className="font-semibold mb-3">Columna Fiscal</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Aguinaldo:</span>
                        <span>${calculationResult.fiscalPerceptions.aguinaldoAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Vacaciones:</span>
                        <span>${calculationResult.fiscalPerceptions.vacationAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Prima Vacacional:</span>
                        <span>${calculationResult.fiscalPerceptions.vacationPremiumAmount.toFixed(2)}</span>
                      </div>
                      {calculationResult.fiscalPerceptions.severanceAmount > 0 && (
                        <div className="flex justify-between">
                          <span>Indemnización:</span>
                          <span>${calculationResult.fiscalPerceptions.severanceAmount.toFixed(2)}</span>
                        </div>
                      )}
                      {calculationResult.fiscalPerceptions.seniorityPremiumAmount > 0 && (
                        <div className="flex justify-between">
                          <span>Prima Antigüedad:</span>
                          <span>${calculationResult.fiscalPerceptions.seniorityPremiumAmount.toFixed(2)}</span>
                        </div>
                      )}
                      <Separator className="my-2" />
                      <div className="flex justify-between font-semibold">
                        <span>Total Percepciones:</span>
                        <span>${calculationResult.fiscalPerceptions.totalPerceptions.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-destructive">
                        <span>Deducciones:</span>
                        <span>-${calculationResult.deductions.totalDeductions.toFixed(2)}</span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between font-bold text-lg">
                        <span>Neto Fiscal:</span>
                        <span>${calculationResult.totals.netPayFiscal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Columna Real */}
                  <div>
                    <h3 className="font-semibold mb-3">Columna Real</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Aguinaldo:</span>
                        <span>${calculationResult.realPerceptions.aguinaldoAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Vacaciones:</span>
                        <span>${calculationResult.realPerceptions.vacationAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Prima Vacacional:</span>
                        <span>${calculationResult.realPerceptions.vacationPremiumAmount.toFixed(2)}</span>
                      </div>
                      {calculationResult.realPerceptions.gratificationAmount > 0 && (
                        <div className="flex justify-between">
                          <span>Gratificación:</span>
                          <span>${calculationResult.realPerceptions.gratificationAmount.toFixed(2)}</span>
                        </div>
                      )}
                      {calculationResult.realPerceptions.severanceAmount > 0 && (
                        <div className="flex justify-between">
                          <span>Indemnización:</span>
                          <span>${calculationResult.realPerceptions.severanceAmount.toFixed(2)}</span>
                        </div>
                      )}
                      {calculationResult.realPerceptions.seniorityPremiumAmount > 0 && (
                        <div className="flex justify-between">
                          <span>Prima Antigüedad:</span>
                          <span>${calculationResult.realPerceptions.seniorityPremiumAmount.toFixed(2)}</span>
                        </div>
                      )}
                      <Separator className="my-2" />
                      <div className="flex justify-between font-semibold">
                        <span>Total Percepciones:</span>
                        <span>${calculationResult.realPerceptions.totalPerceptions.toFixed(2)}</span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between font-bold text-lg">
                        <span>Neto Real:</span>
                        <span>${calculationResult.totals.netPayReal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Total */}
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    Total a Pagar: ${calculationResult.totals.netPayTotal.toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    {calculationResult.metadata.daysWorked} días laborados •{' '}
                    {calculationResult.metadata.yearsWorked.toFixed(4)} años
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Botones */}
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar Finiquito
          </Button>
        </div>
      </form>
    </Form>
  );
}
