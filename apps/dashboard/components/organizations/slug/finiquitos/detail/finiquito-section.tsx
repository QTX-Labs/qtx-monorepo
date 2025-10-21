import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Separator } from '@workspace/ui/components/separator';
import { Badge } from '@workspace/ui/components/badge';
import { Wallet } from 'lucide-react';
import type { Finiquito } from '@workspace/database';

import { FactoresTable, type FactorMonto } from './factores-table';
import { formatCurrency } from '~/lib/finiquitos/format-helpers';

type FiniquitoSectionProps = {
  finiquito: Finiquito;
};

export function FiniquitoSection({ finiquito }: FiniquitoSectionProps) {
  // Mapear factores y montos de finiquito
  const allFactoresMontos: FactorMonto[] = [
    {
      concepto: 'Días Trabajados',
      factor: finiquito.factorDiasTrabajadosFiniquito,
      monto: finiquito.montoDiasTrabajadosFiniquito,
    },
    {
      concepto: 'Séptimo Día',
      factor: finiquito.factorSeptimoDiaFiniquito,
      monto: finiquito.montoSeptimoDiaFiniquito,
    },
    {
      concepto: 'Vacaciones',
      factor: finiquito.factorVacacionesFiniquito,
      monto: finiquito.montoVacacionesFiniquito,
    },
    {
      concepto: 'Prima Vacacional',
      factor: finiquito.factorPrimaVacacionalFiniquito,
      monto: finiquito.montoPrimaVacacionalFiniquito,
    },
    {
      concepto: 'Vacaciones Pendientes',
      factor: null,
      monto: finiquito.fiscalPendingVacationAmount,
    },
    {
      concepto: 'Prima Vacacional Pendiente',
      factor: null,
      monto: finiquito.fiscalPendingPremiumAmount,
    },
    {
      concepto: 'Aguinaldo',
      factor: finiquito.factorAguinaldoFiniquito,
      monto: finiquito.montoAguinaldoFiniquito,
    },
    {
      concepto: 'Gratificación',
      factor: null,
      monto: finiquito.realGratificationAmount,
    },
  ];

  // Filtrar solo conceptos con monto > 0
  const factoresMontos = allFactoresMontos.filter(item => {
    const amount = item.monto ? (typeof item.monto === 'number' ? item.monto : Number(item.monto)) : 0;
    return amount > 0;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Finiquito
          </CardTitle>
          <Badge variant="secondary">Base</Badge>
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
              <span className="text-muted-foreground">ISR Finiquito:</span>
              <span className="font-mono">{formatCurrency(finiquito.isrFiniquito)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">ISR Art. 174:</span>
              <span className="font-mono">{formatCurrency(finiquito.isrArt174)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total Deducciones:</span>
              <span className="font-mono text-destructive">
                {formatCurrency(finiquito.totalDeduccionesFiniquito)}
              </span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Neto */}
        <div className="flex justify-between items-center p-4 bg-primary/5 rounded-lg border border-primary/20">
          <span className="text-lg font-bold">NETO FINIQUITO:</span>
          <span className="text-2xl font-bold text-primary font-mono">
            {formatCurrency(finiquito.totalFiniquito)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
