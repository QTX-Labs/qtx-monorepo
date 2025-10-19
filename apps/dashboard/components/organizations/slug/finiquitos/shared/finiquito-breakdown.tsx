'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Separator } from '@workspace/ui/components/separator';

import type {
  CalculateFiniquitoOutput,
  FactoresFiniquito,
  MontosFiniquito,
  FactoresLiquidacion,
  MontosLiquidacion,
} from '~/lib/finiquitos/types/calculate-finiquito-types';

type FiniquitoBreakdownProps = {
  calculation: CalculateFiniquitoOutput;
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount);
}

function formatFactor(factor: number): string {
  return factor.toFixed(4);
}

type FiniquitoTableProps = {
  factores: FactoresFiniquito;
  montos: MontosFiniquito;
  title: string;
  badge: string;
  badgeVariant?: 'default' | 'secondary' | 'outline';
};

function FiniquitoTable({ factores, montos, title, badge, badgeVariant = 'secondary' }: FiniquitoTableProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">{title}</h3>
        <Badge variant={badgeVariant}>{badge}</Badge>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Concepto</TableHead>
            <TableHead className="text-right">Factor (días)</TableHead>
            <TableHead className="text-right">Monto</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Días Trabajados</TableCell>
            <TableCell className="text-right font-mono">{formatFactor(factores.diasTrabajados)}</TableCell>
            <TableCell className="text-right font-mono">{formatCurrency(montos.diasTrabajados.totalAmount)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Séptimo Día</TableCell>
            <TableCell className="text-right font-mono">{formatFactor(factores.septimoDia)}</TableCell>
            <TableCell className="text-right font-mono">{formatCurrency(montos.septimoDia.totalAmount)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Vacaciones</TableCell>
            <TableCell className="text-right font-mono">{formatFactor(factores.vacaciones)}</TableCell>
            <TableCell className="text-right font-mono">{formatCurrency(montos.vacaciones.totalAmount)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Prima Vacacional</TableCell>
            <TableCell className="text-right font-mono">{formatFactor(factores.primaVacacional)}</TableCell>
            <TableCell className="text-right font-mono">{formatCurrency(montos.primaVacacional.totalAmount)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-semibold">Aguinaldo</TableCell>
            <TableCell className="text-right font-mono">{formatFactor(factores.aguinaldo)}</TableCell>
            <TableCell className="text-right font-mono">{formatCurrency(montos.aguinaldo.totalAmount)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}

type LiquidacionTableProps = {
  factores: FactoresLiquidacion;
  montos: MontosLiquidacion;
};

function LiquidacionTable({ factores, montos }: LiquidacionTableProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">LIQUIDACIÓN</h3>
        <Badge variant="default">Indemnización</Badge>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Concepto</TableHead>
            <TableHead className="text-right">Factor (días)</TableHead>
            <TableHead className="text-right">Monto</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Indemnización 90 Días</TableCell>
            <TableCell className="text-right font-mono">{formatFactor(factores.indemnizacion90Dias)}</TableCell>
            <TableCell className="text-right font-mono">{formatCurrency(montos.indemnizacion90Dias.totalAmount)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Indemnización 20 Días por Año</TableCell>
            <TableCell className="text-right font-mono">{formatFactor(factores.indemnizacion20Dias)}</TableCell>
            <TableCell className="text-right font-mono">{formatCurrency(montos.indemnizacion20Dias.totalAmount)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-semibold">Prima de Antigüedad</TableCell>
            <TableCell className="text-right font-mono">{formatFactor(factores.primaAntiguedad)}</TableCell>
            <TableCell className="text-right font-mono">{formatCurrency(montos.primaAntiguedad.totalAmount)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}

export function FiniquitoBreakdown({ calculation }: FiniquitoBreakdownProps) {
  return (
    <div className="space-y-6">
      {/* Finiquito */}
      <Card>
        <CardContent className="pt-6">
          <FiniquitoTable
            factores={calculation.factores.finiquito}
            montos={calculation.montos.finiquito}
            title="FINIQUITO"
            badge="Base"
            badgeVariant="secondary"
          />
          <Separator className="my-4" />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Percepciones Totales:</span>
            <span className="font-semibold">{formatCurrency(calculation.totales.finiquito.percepciones)}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-muted-foreground">Deducciones Totales:</span>
            <span className="font-semibold text-destructive">-{formatCurrency(calculation.totales.finiquito.deducciones)}</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between font-bold text-lg">
            <span>Neto Finiquito:</span>
            <span className="text-primary">{formatCurrency(calculation.totales.finiquito.neto)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Liquidación */}
      {calculation.factores.liquidacion && calculation.montos.liquidacion && calculation.totales.liquidacion && (
        <Card>
          <CardContent className="pt-6">
            <LiquidacionTable
              factores={calculation.factores.liquidacion}
              montos={calculation.montos.liquidacion}
            />
            <Separator className="my-4" />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Percepciones Totales:</span>
              <span className="font-semibold">{formatCurrency(calculation.totales.liquidacion.percepciones)}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-muted-foreground">Deducciones Totales:</span>
              <span className="font-semibold text-destructive">-{formatCurrency(calculation.totales.liquidacion.deducciones)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-bold text-lg">
              <span>Neto Liquidación:</span>
              <span className="text-primary">{formatCurrency(calculation.totales.liquidacion.neto)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Complemento */}
      {calculation.factores.complemento && calculation.montos.complemento && calculation.totales.complemento && (
        <Card>
          <CardContent className="pt-6">
            <FiniquitoTable
              factores={calculation.factores.complemento}
              montos={calculation.montos.complemento}
              title="COMPLEMENTO"
              badge="Diferencia"
              badgeVariant="outline"
            />
            <Separator className="my-4" />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Percepciones Totales:</span>
              <span className="font-semibold">{formatCurrency(calculation.totales.complemento.percepciones)}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-muted-foreground">Deducciones Totales:</span>
              <span className="font-semibold text-destructive">-{formatCurrency(calculation.totales.complemento.deducciones)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-bold text-lg">
              <span>Neto Complemento:</span>
              <span className="text-primary">{formatCurrency(calculation.totales.complemento.neto)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deducciones Detalladas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Deducciones Detalladas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">ISR Finiquito:</span>
              <span className="font-mono">{formatCurrency(calculation.isr.isrFiniquito)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ISR Art. 174:</span>
              <span className="font-mono">{formatCurrency(calculation.isr.isrArt174)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ISR Indemnización:</span>
              <span className="font-mono">{formatCurrency(calculation.isr.isrIndemnizacion)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Infonavit:</span>
              <span className="font-mono">{formatCurrency(calculation.deducciones.infonavit)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fonacot:</span>
              <span className="font-mono">{formatCurrency(calculation.deducciones.fonacot)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Otras Deducciones:</span>
              <span className="font-mono">{formatCurrency(calculation.deducciones.otras)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subsidio:</span>
              <span className="font-mono">{formatCurrency(calculation.deducciones.subsidio)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-bold">
              <span>Total Deducciones:</span>
              <span className="font-mono text-destructive">{formatCurrency(calculation.deducciones.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Final */}
      <Card className="border-primary bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">TOTAL A PAGAR</span>
            <span className="text-3xl font-bold text-primary">{formatCurrency(calculation.totales.totalAPagar)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
