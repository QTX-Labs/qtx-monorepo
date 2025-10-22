import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Separator } from '@workspace/ui/components/separator';
import { Badge } from '@workspace/ui/components/badge';
import { Building2, Plus } from 'lucide-react';
import type { Finiquito } from '@workspace/database';

import { FactoresTable, type FactorMonto } from './factores-table';
import { formatCurrency } from '~/lib/finiquitos/format-helpers';

type LiquidacionComplementoSectionProps = {
  finiquito: Finiquito;
};

export function LiquidacionComplementoSection({ finiquito }: LiquidacionComplementoSectionProps) {
  // Solo mostrar si liquidación Y complemento están activados
  if (!finiquito.liquidacionActivada || !finiquito.complementoActivado) {
    return null;
  }

  // Mapear factores y montos de liquidación complemento
  const allFactoresMontos: FactorMonto[] = [
    {
      concepto: 'Indemnización 90 Días',
      factor: finiquito.factorIndemnizacion90DiasComplemento,
      monto: finiquito.montoIndemnizacion90DiasComplemento,
    },
    {
      concepto: 'Indemnización 20 Días por Año',
      factor: finiquito.factorIndemnizacion20DiasComplemento,
      monto: finiquito.montoIndemnizacion20DiasComplemento,
    },
    {
      concepto: 'Prima de Antigüedad',
      factor: finiquito.factorPrimaAntiguedadComplemento,
      monto: finiquito.montoPrimaAntiguedadComplemento,
    },
  ];

  // Filtrar solo conceptos con monto > 0 O factor > 0
  const factoresMontos = allFactoresMontos.filter(item => {
    const amount = item.monto ? (typeof item.monto === 'number' ? item.monto : Number(item.monto)) : 0;
    const factor = item.factor ? (typeof item.factor === 'number' ? item.factor : Number(item.factor)) : 0;
    return amount > 0 || factor > 0;
  });

  // Si no hay conceptos con valor, no mostrar la sección
  if (factoresMontos.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            <Plus className="w-4 h-4" />
            Liquidación Complemento
          </CardTitle>
          <Badge variant="outline">Diferencia</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tabla de Factores y Montos */}
        <FactoresTable data={factoresMontos} />

        <Separator />

        {/* Nota sobre deducciones */}
        <div className="text-sm text-muted-foreground italic text-center p-3 bg-muted/30 rounded">
          Liquidación complementaria calculada con salario real.
          No tiene deducciones adicionales.
        </div>

        <Separator />

        {/* Neto */}
        <div className="flex justify-between items-center p-4 bg-primary/5 rounded-lg border border-primary/20">
          <span className="text-lg font-bold">NETO LIQUIDACIÓN COMPLEMENTO:</span>
          <span className="text-2xl font-bold text-primary font-mono">
            {formatCurrency(finiquito.totalLiquidacionComplemento)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
