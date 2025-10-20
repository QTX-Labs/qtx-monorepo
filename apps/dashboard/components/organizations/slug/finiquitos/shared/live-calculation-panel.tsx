'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Separator } from '@workspace/ui/components/separator';
import { Badge } from '@workspace/ui/components/badge';
import { cn } from '@workspace/ui/lib/utils';
import { Calculator, TrendingUp } from 'lucide-react';

import type { CalculateFiniquitoOutput } from '~/lib/finiquitos/types/calculate-finiquito-types';

type LiveCalculationPanelProps = {
  calculation: CalculateFiniquitoOutput | null;
  className?: string;
  sticky?: boolean;
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount);
}

type ConceptLineProps = {
  label: string;
  amount: number;
  isNegative?: boolean;
};

function ConceptLine({ label, amount, isNegative = false }: ConceptLineProps) {
  if (amount === 0) return null;

  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}:</span>
      <span className={cn("font-medium", isNegative && "text-destructive")}>
        {isNegative ? '-' : ''}{formatCurrency(Math.abs(amount))}
      </span>
    </div>
  );
}

export function LiveCalculationPanel({
  calculation,
  className,
  sticky = true,
}: LiveCalculationPanelProps) {
  if (!calculation) {
    return (
      <Card className={cn(sticky && 'sticky top-4', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calculator className="w-4 h-4" />
            Cálculo en Vivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Complete el Paso 1 para ver el cálculo en vivo
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(sticky && 'sticky top-4', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Calculator className="w-4 h-4" />
          Cálculo en Vivo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Finiquito */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-sm">FINIQUITO</h4>
            <Badge variant="secondary">Base</Badge>
          </div>
          <div className="space-y-2">
            {/* Percepciones Detalladas */}
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Percepciones</p>
              <ConceptLine label="Días Pendientes de Sueldo" amount={calculation.montos.finiquito.diasTrabajados.totalAmount} />
              <ConceptLine label="Séptimo Día" amount={calculation.montos.finiquito.septimoDia.totalAmount} />
              <ConceptLine label="Vacaciones" amount={calculation.montos.finiquito.vacaciones.totalAmount} />
              <ConceptLine label="Vacaciones Pendientes" amount={calculation.montos.finiquito.vacacionesPendientes.totalAmount} />
              <ConceptLine label="Prima Vacacional" amount={calculation.montos.finiquito.primaVacacional.totalAmount} />
              <ConceptLine label="Prima Vacacional Pendiente" amount={calculation.montos.finiquito.primaVacacionalPendiente.totalAmount} />
              <ConceptLine label="Aguinaldo" amount={calculation.montos.finiquito.aguinaldo.totalAmount} />
              {((calculation.factores.configuracionAdicional?.gratificacionPesos ?? 0) > 0) && (
                <ConceptLine label="Gratificación" amount={calculation.factores.configuracionAdicional?.gratificacionPesos ?? 0} />
              )}
              <Separator className="my-1.5" />
              <div className="flex justify-between text-sm font-semibold">
                <span>Total Percepciones:</span>
                <span>{formatCurrency(calculation.totales.finiquito.percepciones)}</span>
              </div>
            </div>

            {/* Deducciones Detalladas */}
            {calculation.totales.finiquito.deducciones > 0 && (
              <>
                <Separator className="my-2" />
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Deducciones</p>
                  <ConceptLine label="ISR Finiquito" amount={calculation.isr.isrFiniquito} isNegative />
                  <ConceptLine label="ISR Art. 174" amount={calculation.isr.isrArt174} isNegative />
                  <ConceptLine label="Infonavit" amount={calculation.deducciones.infonavit} isNegative />
                  <ConceptLine label="Fonacot" amount={calculation.deducciones.fonacot} isNegative />
                  <ConceptLine label="Otras Deducciones" amount={calculation.deducciones.otras} isNegative />
                  <ConceptLine label="Subsidio" amount={calculation.deducciones.subsidio} isNegative />
                  <Separator className="my-1.5" />
                  <div className="flex justify-between text-sm font-semibold">
                    <span>Total Deducciones:</span>
                    <span className="text-destructive">-{formatCurrency(calculation.totales.finiquito.deducciones)}</span>
                  </div>
                </div>
              </>
            )}

            {/* Neto */}
            <Separator className="my-2" />
            <div className="flex justify-between font-bold text-base">
              <span>Neto Finiquito:</span>
              <span className="text-primary">
                {formatCurrency(calculation.totales.finiquito.neto)}
              </span>
            </div>
          </div>
        </div>

        {/* Liquidación (si existe) */}
        {calculation.totales.liquidacion && (
          <>
            <Separator />
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm">LIQUIDACIÓN</h4>
                <Badge variant="default">Indemnización</Badge>
              </div>
              <div className="space-y-2">
                {/* Percepciones Detalladas */}
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Percepciones</p>
                  {calculation.montos.liquidacion && (
                    <>
                      <ConceptLine label="Indemnización 90 Días" amount={calculation.montos.liquidacion.indemnizacion90Dias.totalAmount} />
                      <ConceptLine label="Indemnización 20 Días" amount={calculation.montos.liquidacion.indemnizacion20Dias.totalAmount} />
                      <ConceptLine label="Prima de Antigüedad" amount={calculation.montos.liquidacion.primaAntiguedad.totalAmount} />
                    </>
                  )}
                  <Separator className="my-1.5" />
                  <div className="flex justify-between text-sm font-semibold">
                    <span>Total Percepciones:</span>
                    <span>{formatCurrency(calculation.totales.liquidacion.percepciones)}</span>
                  </div>
                </div>

                {/* Deducciones Detalladas */}
                {calculation.totales.liquidacion.deducciones > 0 && (
                  <>
                    <Separator className="my-2" />
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Deducciones</p>
                      <ConceptLine label="ISR Indemnización" amount={calculation.isr.isrIndemnizacion} isNegative />
                      <Separator className="my-1.5" />
                      <div className="flex justify-between text-sm font-semibold">
                        <span>Total Deducciones:</span>
                        <span className="text-destructive">-{formatCurrency(calculation.totales.liquidacion.deducciones)}</span>
                      </div>
                    </div>
                  </>
                )}

                {/* Neto */}
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-base">
                  <span>Neto Liquidación:</span>
                  <span className="text-primary">
                    {formatCurrency(calculation.totales.liquidacion.neto)}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Liquidación Complemento (si existe) */}
        {calculation.totales.liquidacionComplemento && (
          <>
            <Separator />
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm">LIQUIDACIÓN COMPLEMENTO</h4>
                <Badge variant="default">Indemnización Diferencia</Badge>
              </div>
              <div className="space-y-2">
                {/* Percepciones Detalladas */}
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Percepciones</p>
                  {calculation.montos.liquidacionComplemento && (
                    <>
                      <ConceptLine label="Indemnización 90 Días" amount={calculation.montos.liquidacionComplemento.indemnizacion90Dias.totalAmount} />
                      <ConceptLine label="Indemnización 20 Días" amount={calculation.montos.liquidacionComplemento.indemnizacion20Dias.totalAmount} />
                      <ConceptLine label="Prima de Antigüedad" amount={calculation.montos.liquidacionComplemento.primaAntiguedad.totalAmount} />
                    </>
                  )}
                  <Separator className="my-1.5" />
                  <div className="flex justify-between text-sm font-semibold">
                    <span>Total Percepciones:</span>
                    <span>{formatCurrency(calculation.totales.liquidacionComplemento.percepciones)}</span>
                  </div>
                </div>

                {/* Deducciones Detalladas */}
                {calculation.totales.liquidacionComplemento.deducciones > 0 && (
                  <>
                    <Separator className="my-2" />
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Deducciones</p>
                      <Separator className="my-1.5" />
                      <div className="flex justify-between text-sm font-semibold">
                        <span>Total Deducciones:</span>
                        <span className="text-destructive">-{formatCurrency(calculation.totales.liquidacionComplemento.deducciones)}</span>
                      </div>
                    </div>
                  </>
                )}

                {/* Neto */}
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-base">
                  <span>Neto Liquidación Complemento:</span>
                  <span className="text-primary">
                    {formatCurrency(calculation.totales.liquidacionComplemento.neto)}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Complemento (si existe) */}
        {calculation.totales.complemento && (
          <>
            <Separator />
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm">COMPLEMENTO</h4>
                <Badge variant="outline">Diferencia</Badge>
              </div>
              <div className="space-y-2">
                {/* Percepciones Detalladas */}
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Percepciones</p>
                  {calculation.montos.complemento && (
                    <>
                      <ConceptLine label="Días Pendientes de Sueldo" amount={calculation.montos.complemento.diasTrabajados.totalAmount} />
                      <ConceptLine label="Séptimo Día" amount={calculation.montos.complemento.septimoDia.totalAmount} />
                      <ConceptLine label="Vacaciones" amount={calculation.montos.complemento.vacaciones.totalAmount} />
                      <ConceptLine label="Vacaciones Pendientes" amount={calculation.montos.complemento.vacacionesPendientes.totalAmount} />
                      <ConceptLine label="Prima Vacacional" amount={calculation.montos.complemento.primaVacacional.totalAmount} />
                      <ConceptLine label="Prima Vacacional Pendiente" amount={calculation.montos.complemento.primaVacacionalPendiente.totalAmount} />
                      <ConceptLine label="Aguinaldo" amount={calculation.montos.complemento.aguinaldo.totalAmount} />
                    </>
                  )}
                  <Separator className="my-1.5" />
                  <div className="flex justify-between text-sm font-semibold">
                    <span>Total Percepciones:</span>
                    <span>{formatCurrency(calculation.totales.complemento.percepciones)}</span>
                  </div>
                </div>

                {/* Deducciones Detalladas */}
                {calculation.totales.complemento.deducciones > 0 && (
                  <>
                    <Separator className="my-2" />
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Deducciones</p>
                      {/* El complemento típicamente no tiene deducciones, pero si las tiene las mostramos */}
                      <Separator className="my-1.5" />
                      <div className="flex justify-between text-sm font-semibold">
                        <span>Total Deducciones:</span>
                        <span className="text-destructive">-{formatCurrency(calculation.totales.complemento.deducciones)}</span>
                      </div>
                    </div>
                  </>
                )}

                {/* Neto */}
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-base">
                  <span>Neto Complemento:</span>
                  <span className="text-primary">
                    {formatCurrency(calculation.totales.complemento.neto)}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Total a Pagar */}
        <Separator className="my-2" />
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="font-bold text-lg">TOTAL A PAGAR</span>
            </div>
            <span className="font-bold text-2xl text-primary">
              {formatCurrency(calculation.totales.totalAPagar)}
            </span>
          </div>
        </div>

        {/* Desglose de ISR */}
        <details className="text-xs">
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
            Ver desglose de ISR
          </summary>
          <div className="mt-2 space-y-1 pl-2 border-l-2 border-muted">
            <div className="flex justify-between">
              <span>ISR Finiquito:</span>
              <span>{formatCurrency(calculation.isr.isrFiniquito)}</span>
            </div>
            <div className="flex justify-between">
              <span>ISR Art. 174:</span>
              <span>{formatCurrency(calculation.isr.isrArt174)}</span>
            </div>
            <div className="flex justify-between">
              <span>ISR Indemnización:</span>
              <span>{formatCurrency(calculation.isr.isrIndemnizacion)}</span>
            </div>
            <Separator className="my-1" />
            <div className="flex justify-between font-semibold">
              <span>Total ISR:</span>
              <span>{formatCurrency(calculation.deducciones.isrTotal)}</span>
            </div>
          </div>
        </details>
      </CardContent>
    </Card>
  );
}
