import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Separator } from '@workspace/ui/components/separator';
import { MinusCircle } from 'lucide-react';
import type { Finiquito } from '@workspace/database';

import { formatCurrency } from '~/lib/finiquitos/format-helpers';

type DeduccionesManualesSectionProps = {
  finiquito: Finiquito;
};

export function DeduccionesManualesSection({ finiquito }: DeduccionesManualesSectionProps) {
  const deducciones = [
    {
      nombre: 'Infonavit',
      monto: finiquito.montoDeduccionInfonavit,
    },
    {
      nombre: 'Fonacot',
      monto: finiquito.montoDeduccionFonacot,
    },
    {
      nombre: 'Otras Deducciones',
      monto: finiquito.montoDeduccionOtrasDeducciones,
    },
    {
      nombre: 'Subsidio',
      monto: finiquito.montoDeduccionSubsidio,
    },
  ].filter(d => d.monto && Number(d.monto) > 0);

  // Si no hay deducciones manuales, no mostrar la sección
  if (deducciones.length === 0) {
    return null;
  }

  const totalDeducciones = deducciones.reduce((sum, d) => {
    const amount = d.monto ? Number(d.monto) : 0;
    return sum + amount;
  }, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MinusCircle className="w-5 h-5" />
          Deducciones Manuales
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {deducciones.map((deduccion) => (
            <div key={deduccion.nombre} className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{deduccion.nombre}:</span>
              <span className="font-mono font-medium">{formatCurrency(deduccion.monto)}</span>
            </div>
          ))}
        </div>

        <Separator />

        <div className="flex justify-between items-center font-bold">
          <span>TOTAL DEDUCCIONES MANUALES:</span>
          <span className="font-mono text-destructive text-lg">
            {formatCurrency(totalDeducciones)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
