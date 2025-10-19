import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Separator } from '@workspace/ui/components/separator';
import { Badge } from '@workspace/ui/components/badge';
import { Building2 } from 'lucide-react';
import type { Finiquito } from '@workspace/database';

import { FactoresTable, type FactorMonto } from './factores-table';
import { formatCurrency } from '~/lib/finiquitos/format-helpers';

type LiquidacionSectionProps = {
  finiquito: Finiquito;
};

export function LiquidacionSection({ finiquito }: LiquidacionSectionProps) {
  if (!finiquito.liquidacionActivada) {
    return null;
  }

  // Mapear factores y montos de liquidación
  const factoresMontos: FactorMonto[] = [
    {
      concepto: 'Indemnización 90 Días',
      factor: finiquito.factorIndemnizacion90Dias,
      monto: finiquito.montoIndemnizacion90Dias,
    },
    {
      concepto: 'Indemnización 20 Días por Año',
      factor: finiquito.factorIndemnizacion20Dias,
      monto: finiquito.montoIndemnizacion20Dias,
    },
    {
      concepto: 'Prima de Antigüedad',
      factor: finiquito.factorPrimaAntiguedad,
      monto: finiquito.montoPrimaAntiguedad,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Liquidación
          </CardTitle>
          <Badge>Indemnización</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tabla de Factores y Montos */}
        <FactoresTable data={factoresMontos} />

        <Separator />

        {/* Deducciones */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Deducciones</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">ISR Indemnización:</span>
              <span className="font-mono">{formatCurrency(finiquito.isrIndemnizacion)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total Deducciones:</span>
              <span className="font-mono text-destructive">
                {formatCurrency(finiquito.totalDeduccionesLiquidacion)}
              </span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Neto */}
        <div className="flex justify-between items-center p-4 bg-primary/5 rounded-lg border border-primary/20">
          <span className="text-lg font-bold">NETO LIQUIDACIÓN:</span>
          <span className="text-2xl font-bold text-primary font-mono">
            {formatCurrency(finiquito.totalLiquidacion)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
