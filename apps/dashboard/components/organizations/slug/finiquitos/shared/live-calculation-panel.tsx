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
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-sm">FINIQUITO</h4>
            <Badge variant="secondary">Base</Badge>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Percepciones:</span>
              <span className="font-medium">
                {formatCurrency(calculation.totales.finiquito.percepciones)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Deducciones:</span>
              <span className="font-medium text-destructive">
                -{formatCurrency(calculation.totales.finiquito.deducciones)}
              </span>
            </div>
            <Separator className="my-1" />
            <div className="flex justify-between font-semibold">
              <span>Neto:</span>
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
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm">LIQUIDACIÓN</h4>
                <Badge variant="default">Indemnización</Badge>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Percepciones:</span>
                  <span className="font-medium">
                    {formatCurrency(calculation.totales.liquidacion.percepciones)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Deducciones:</span>
                  <span className="font-medium text-destructive">
                    -{formatCurrency(calculation.totales.liquidacion.deducciones)}
                  </span>
                </div>
                <Separator className="my-1" />
                <div className="flex justify-between font-semibold">
                  <span>Neto:</span>
                  <span className="text-primary">
                    {formatCurrency(calculation.totales.liquidacion.neto)}
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
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm">COMPLEMENTO</h4>
                <Badge variant="outline">Diferencia</Badge>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Percepciones:</span>
                  <span className="font-medium">
                    {formatCurrency(calculation.totales.complemento.percepciones)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Deducciones:</span>
                  <span className="font-medium text-destructive">
                    -{formatCurrency(calculation.totales.complemento.deducciones)}
                  </span>
                </div>
                <Separator className="my-1" />
                <div className="flex justify-between font-semibold">
                  <span>Neto:</span>
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
