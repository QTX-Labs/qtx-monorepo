import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Separator } from '@workspace/ui/components/separator';
import { DollarSign } from 'lucide-react';
import type { Finiquito } from '@workspace/database';

import { formatCurrency } from '~/lib/finiquitos/format-helpers';

type TotalSectionProps = {
  finiquito: Finiquito;
};

export function TotalSection({ finiquito }: TotalSectionProps) {
  const totalDeduccionesManuales =
    (finiquito.montoDeduccionInfonavit ? Number(finiquito.montoDeduccionInfonavit) : 0) +
    (finiquito.montoDeduccionFonacot ? Number(finiquito.montoDeduccionFonacot) : 0) +
    (finiquito.montoDeduccionOtrasDeducciones ? Number(finiquito.montoDeduccionOtrasDeducciones) : 0) +
    (finiquito.montoDeduccionSubsidio ? Number(finiquito.montoDeduccionSubsidio) : 0);

  return (
    <Card className="border-2 border-primary">
      <CardHeader className="bg-primary text-primary-foreground">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <DollarSign className="w-6 h-6" />
          TOTAL A PAGAR
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {/* Desglose por Sección */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-medium">Finiquito:</span>
            <span className="font-mono text-lg font-semibold">
              {formatCurrency(finiquito.totalFiniquito)}
            </span>
          </div>

          {finiquito.liquidacionActivada && finiquito.totalLiquidacion && (
            <div className="flex justify-between items-center">
              <span className="font-medium">Liquidación:</span>
              <span className="font-mono text-lg font-semibold">
                {formatCurrency(finiquito.totalLiquidacion)}
              </span>
            </div>
          )}

          {finiquito.complementoActivado && finiquito.totalComplemento && (
            <div className="flex justify-between items-center">
              <span className="font-medium">Complemento:</span>
              <span className="font-mono text-lg font-semibold">
                {formatCurrency(finiquito.totalComplemento)}
              </span>
            </div>
          )}

          {totalDeduccionesManuales > 0 && (
            <div className="flex justify-between items-center">
              <span className="font-medium">Deducciones Manuales:</span>
              <span className="font-mono text-lg font-semibold text-destructive">
                -{formatCurrency(totalDeduccionesManuales)}
              </span>
            </div>
          )}
        </div>

        <Separator className="my-4" />

        {/* Total Final */}
        <div className="flex justify-between items-center p-6 bg-primary/10 rounded-lg">
          <span className="text-3xl font-bold">TOTAL:</span>
          <span className="text-4xl font-bold text-primary font-mono">
            {formatCurrency(finiquito.totalAPagar)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
