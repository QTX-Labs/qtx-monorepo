import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Separator } from '@workspace/ui/components/separator';
import { Badge } from '@workspace/ui/components/badge';
import { Plus } from 'lucide-react';
import type { Finiquito } from '@workspace/database';

import { FactoresTable, type FactorMonto } from './factores-table';
import { formatCurrency, formatDate } from '~/lib/finiquitos/format-helpers';

type ComplementoSectionProps = {
  finiquito: Finiquito;
};

export function ComplementoSection({ finiquito }: ComplementoSectionProps) {
  if (!finiquito.complementoActivado) {
    return null;
  }

  // Mapear factores y montos de complemento
  const allFactoresMontos: FactorMonto[] = [
    {
      concepto: 'Días Trabajados',
      factor: finiquito.factorDiasTrabajadosComplemento,
      monto: finiquito.montoDiasTrabajadosComplemento,
    },
    {
      concepto: 'Séptimo Día',
      factor: finiquito.factorSeptimoDiaComplemento,
      monto: finiquito.montoSeptimoDiaComplemento,
    },
    {
      concepto: 'Vacaciones',
      factor: finiquito.factorVacacionesComplemento,
      monto: finiquito.montoVacacionesComplemento,
    },
    {
      concepto: 'Prima Vacacional',
      factor: finiquito.factorPrimaVacacionalComplemento,
      monto: finiquito.montoPrimaVacacionalComplemento,
    },
    {
      concepto: 'Vacaciones Pendientes',
      factor: null,
      monto: finiquito.realPendingVacationAmount,
    },
    {
      concepto: 'Prima Vacacional Pendiente',
      factor: null,
      monto: finiquito.realPendingPremiumAmount,
    },
    {
      concepto: 'Aguinaldo',
      factor: finiquito.factorAguinaldoComplemento,
      monto: finiquito.montoAguinaldoComplemento,
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
            <Plus className="w-5 h-5" />
            Complemento
          </CardTitle>
          <Badge variant="outline">Diferencia</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Información del Complemento */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
          {finiquito.realHireDate && (
            <div>
              <span className="text-sm text-muted-foreground">Fecha Ingreso Real:</span>
              <p className="font-medium">{formatDate(finiquito.realHireDate)}</p>
            </div>
          )}
          <div>
            <span className="text-sm text-muted-foreground">Salario Diario Real:</span>
            <p className="font-medium font-mono">{formatCurrency(finiquito.realDailySalary)}</p>
          </div>
        </div>

        {/* Tabla de Factores y Montos */}
        <FactoresTable data={factoresMontos} />

        <Separator />

        {/* Nota sobre deducciones */}
        <div className="text-sm text-muted-foreground italic text-center p-3 bg-muted/30 rounded">
          El complemento representa la diferencia entre el salario real y fiscal.
          No tiene deducciones adicionales.
        </div>

        <Separator />

        {/* Neto */}
        <div className="flex justify-between items-center p-4 bg-primary/5 rounded-lg border border-primary/20">
          <span className="text-lg font-bold">NETO COMPLEMENTO:</span>
          <span className="text-2xl font-bold text-primary font-mono">
            {formatCurrency(finiquito.totalComplemento)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
