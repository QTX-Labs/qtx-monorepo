'use client';

import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
import { Switch } from '@workspace/ui/components/switch';
import { Separator } from '@workspace/ui/components/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';

import { step3DeductionsSchema, type Step3Deductions as Step3DeductionsType } from '~/lib/finiquitos/schemas/step3-deductions-schema';
import { useWizard } from '../wizard-context';
import { WizardNavigation } from '../wizard-navigation';
import { LiveCalculationPanel } from '../../shared/live-calculation-panel';
import { useLiveCalculation } from '../hooks/use-live-calculation';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount);
}

export function Step3Deductions() {
  const { step1Data, step2Data, step3Data, updateStep3, updateLiveCalculation, goNext } = useWizard();

  // Verificar si liquidación está activada para mostrar/ocultar campo ISR Indemnización
  const liquidacionActivada = step1Data?.liquidacionActivada ?? false;

  const form = useForm<Step3DeductionsType>({
    resolver: zodResolver(step3DeductionsSchema) as any, // Type inference issue with .default() on nested object
    defaultValues: step3Data || {
      deduccionesManuales: {
        infonavit: 0,
        fonacot: 0,
        otras: 0,
      },
      enableManualISR: false,
      manualISR: {
        isrFiniquito: undefined,
        isrArt174: undefined,
        isrIndemnizacion: undefined,
      },
    },
  });

  const watchedData = form.watch();
  const enableManualISR = form.watch('enableManualISR');

  // Cálculo en vivo
  const liveCalculation = useLiveCalculation({
    step1Data,
    step2Data,
    step3Data: watchedData,
  });

  // Actualizar context con cálculo en vivo
  useEffect(() => {
    if (liveCalculation) {
      updateLiveCalculation(liveCalculation);
    }
  }, [liveCalculation, updateLiveCalculation]);

  // Auto-poblar valores de ISR cuando se activa el modo manual
  useEffect(() => {
    if (enableManualISR && liveCalculation) {
      const currentValues = form.getValues('manualISR');

      // Solo inicializar si los campos están vacíos
      if (!currentValues?.isrFiniquito && !currentValues?.isrArt174 && !currentValues?.isrIndemnizacion) {
        form.setValue('manualISR', {
          isrFiniquito: liveCalculation.isr.isrFiniquito,
          isrArt174: liveCalculation.isr.isrArt174,
          isrIndemnizacion: liveCalculation.isr.isrIndemnizacion,
        });
      }
    }
  }, [enableManualISR, liveCalculation, form]);

  const onSubmit = (data: Step3DeductionsType) => {
    updateStep3(data);
    goNext();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Formulario de Deducciones */}
      <div className="lg:col-span-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Deducciones Manuales</h3>
              <p className="text-sm text-muted-foreground mb-6">
                El ISR se calcula automáticamente. Ingrese las deducciones adicionales si aplican.
              </p>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Deducciones Adicionales</CardTitle>
                  <CardDescription>
                    Estos montos se restarán del total a pagar
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="deduccionesManuales.infonavit"
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
                          <FormDescription>Monto de crédito Infonavit</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="deduccionesManuales.fonacot"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fonacot</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormDescription>Monto de crédito Fonacot</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="deduccionesManuales.otras"
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
                          <FormDescription>Préstamos, descuentos, etc.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Edición Manual de ISR */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-base">ISR (Impuesto Sobre la Renta)</CardTitle>
                  <CardDescription>
                    El ISR se calcula automáticamente. Active la edición manual solo si necesita ajustar los valores.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="enableManualISR"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Editar valores de ISR manualmente</FormLabel>
                          <FormDescription>
                            Activar para modificar los valores calculados automáticamente
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value || false}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {enableManualISR && liveCalculation && (
                    <div className={`grid grid-cols-1 gap-4 pt-4 ${liquidacionActivada ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
                      <FormField
                        control={form.control}
                        name="manualISR.isrFiniquito"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ISR Finiquito</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                {...field}
                                value={field.value ?? ''}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                              />
                            </FormControl>
                            <FormDescription>
                              Calculado: {formatCurrency(liveCalculation.isr.isrFiniquito)}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="manualISR.isrArt174"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ISR Art. 174</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                {...field}
                                value={field.value ?? ''}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                              />
                            </FormControl>
                            <FormDescription>
                              Calculado: {formatCurrency(liveCalculation.isr.isrArt174)}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {liquidacionActivada && (
                        <FormField
                          control={form.control}
                          name="manualISR.isrIndemnizacion"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ISR Indemnización</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  {...field}
                                  value={field.value ?? ''}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                                />
                              </FormControl>
                              <FormDescription>
                                Calculado: {formatCurrency(liveCalculation.isr.isrIndemnizacion)}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Resumen de Deducciones */}
              {liveCalculation && (
                <Card className="mt-6 border-muted">
                  <CardHeader>
                    <CardTitle className="text-base">Resumen de Deducciones</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ISR Finiquito:</span>
                        <span className="font-mono">{formatCurrency(liveCalculation.isr.isrFiniquito)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ISR Art. 174:</span>
                        <span className="font-mono">{formatCurrency(liveCalculation.isr.isrArt174)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ISR Indemnización:</span>
                        <span className="font-mono">{formatCurrency(liveCalculation.isr.isrIndemnizacion)}</span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between font-semibold">
                        <span>Total ISR{enableManualISR ? ' (editado)' : ' (automático)'}:</span>
                        <span className="font-mono">{formatCurrency(liveCalculation.deducciones.isrTotal)}</span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Infonavit:</span>
                        <span className="font-mono">{formatCurrency(liveCalculation.deducciones.infonavit)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fonacot:</span>
                        <span className="font-mono">{formatCurrency(liveCalculation.deducciones.fonacot)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Otras:</span>
                        <span className="font-mono">{formatCurrency(liveCalculation.deducciones.otras)}</span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between font-bold text-base">
                        <span>TOTAL DEDUCCIONES:</span>
                        <span className="font-mono text-destructive">{formatCurrency(liveCalculation.deducciones.total)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <Separator />

            <WizardNavigation
              nextLabel="Continuar a Revisión"
              onNext={form.handleSubmit(onSubmit)}
              nextDisabled={!form.formState.isValid}
            />
          </form>
        </Form>
      </div>

      {/* Panel de Cálculo en Vivo */}
      <div className="lg:col-span-1">
        <LiveCalculationPanel calculation={liveCalculation} sticky />
      </div>
    </div>
  );
}
