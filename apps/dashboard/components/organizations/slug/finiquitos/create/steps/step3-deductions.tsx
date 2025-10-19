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

  const form = useForm<Step3DeductionsType>({
    resolver: zodResolver(step3DeductionsSchema) as any, // Type inference issue with .default() on nested object
    defaultValues: step3Data || {
      deduccionesManuales: {
        infonavit: 0,
        fonacot: 0,
        otras: 0,
        subsidio: 0,
      },
    },
  });

  const watchedData = form.watch();

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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                    <FormField
                      control={form.control}
                      name="deduccionesManuales.subsidio"
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
                          <FormDescription>Subsidio al empleo u otros</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
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
                        <span>Total ISR (automático):</span>
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
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subsidio:</span>
                        <span className="font-mono">{formatCurrency(liveCalculation.deducciones.subsidio)}</span>
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
