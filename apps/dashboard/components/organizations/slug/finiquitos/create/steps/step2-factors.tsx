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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@workspace/ui/components/accordion';

import { step2FactorsSchema, type Step2Factors as Step2FactorsType } from '~/lib/finiquitos/schemas/step2-factors-schema';
import { useWizard } from '../wizard-context';
import { WizardNavigation } from '../wizard-navigation';
import { LiveCalculationPanel } from '../../shared/live-calculation-panel';
import { useLiveCalculation } from '../hooks/use-live-calculation';

export function Step2Factors() {
  const { step1Data, step2Data, step3Data, updateStep2, updateLiveCalculation, goNext } = useWizard();

  const form = useForm<Step2FactorsType>({
    resolver: zodResolver(step2FactorsSchema),
    defaultValues: step2Data || {
      factoresFiniquito: {
        diasTrabajados: 0,
        septimoDia: 0,
        vacaciones: 0,
        primaVacacional: 0,
        aguinaldo: 0,
      },
      factoresLiquidacion: undefined,
      factoresComplemento: undefined,
    },
  });

  const watchedData = form.watch();

  // Cálculo en vivo
  const liveCalculation = useLiveCalculation({
    step1Data,
    step2Data: watchedData,
    step3Data,
  });

  // Actualizar context con cálculo en vivo
  useEffect(() => {
    if (liveCalculation) {
      updateLiveCalculation(liveCalculation);
    }
  }, [liveCalculation, updateLiveCalculation]);

  const onSubmit = (data: Step2FactorsType) => {
    updateStep2(data);
    goNext();
  };

  const liquidacionActivada = step1Data?.liquidacionActivada;
  const complementoActivado = step1Data?.complementoActivado;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Formulario de Factores */}
      <div className="lg:col-span-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Factores Calculados (Editables)</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Los siguientes factores han sido calculados automáticamente. Puede editarlos si es necesario.
              </p>

              <Accordion type="multiple" defaultValue={['finiquito', 'liquidacion', 'complemento']} className="space-y-4">
                {/* Factores de Finiquito */}
                <AccordionItem value="finiquito" className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <span className="font-semibold">Factores de Finiquito</span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="factoresFiniquito.diasTrabajados"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Días Trabajados</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.0001"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormDescription>Días laborados en el periodo</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="factoresFiniquito.septimoDia"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Séptimo Día</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.0001"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormDescription>Descanso semanal proporcional</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="factoresFiniquito.vacaciones"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Vacaciones</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.0001"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormDescription>Vacaciones proporcionales</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="factoresFiniquito.primaVacacional"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Prima Vacacional</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.0001"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormDescription>25% (o más) sobre vacaciones</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="factoresFiniquito.aguinaldo"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Aguinaldo</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.0001"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormDescription>Aguinaldo proporcional</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Factores de Liquidación (si activado) */}
                {liquidacionActivada && (
                  <AccordionItem value="liquidacion" className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <span className="font-semibold">Factores de Liquidación</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="factoresLiquidacion.indemnizacion90Dias"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Indemnización 90 Días</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.0001"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormDescription>3 meses de salario</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="factoresLiquidacion.indemnizacion20Dias"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Indemnización 20 Días por Año</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.0001"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormDescription>20 días por año trabajado</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="factoresLiquidacion.primaAntiguedad"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Prima de Antigüedad</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.0001"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormDescription>12 días por año (topado)</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* Factores de Complemento (si activado) */}
                {complementoActivado && (
                  <AccordionItem value="complemento" className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <span className="font-semibold">Factores de Complemento</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="factoresComplemento.diasTrabajados"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Días Trabajados</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.0001"
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
                            name="factoresComplemento.septimoDia"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Séptimo Día</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.0001"
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
                            name="factoresComplemento.vacaciones"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Vacaciones</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.0001"
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
                            name="factoresComplemento.primaVacacional"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Prima Vacacional</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.0001"
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
                            name="factoresComplemento.aguinaldo"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Aguinaldo</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.0001"
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
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </div>

            <Separator />

            <WizardNavigation
              nextLabel="Continuar a Deducciones"
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
