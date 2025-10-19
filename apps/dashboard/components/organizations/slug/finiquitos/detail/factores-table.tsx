import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';
import type { Decimal } from '@prisma/client/runtime/library';

import { formatCurrency, formatNumber } from '~/lib/finiquitos/format-helpers';

export type FactorMonto = {
  concepto: string;
  factor: number | Decimal | null | undefined;
  baseGravable?: number | Decimal | null | undefined;
  baseExenta?: number | Decimal | null | undefined;
  monto: number | Decimal | null | undefined;
};

type FactoresTableProps = {
  data: FactorMonto[];
  showBaseGravable?: boolean;
  showBaseExenta?: boolean;
};

export function FactoresTable({
  data,
  showBaseGravable = false,
  showBaseExenta = false,
}: FactoresTableProps) {
  const totalMonto = data.reduce((sum, item) => {
    const amount = item.monto ? (typeof item.monto === 'number' ? item.monto : Number(item.monto)) : 0;
    return sum + amount;
  }, 0);

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Concepto</TableHead>
            <TableHead className="text-right">Factor (días)</TableHead>
            {showBaseGravable && (
              <TableHead className="text-right">Base Gravable</TableHead>
            )}
            {showBaseExenta && (
              <TableHead className="text-right">Base Exenta</TableHead>
            )}
            <TableHead className="text-right">Monto</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={`${item.concepto}-${index}`}>
              <TableCell className="font-medium">{item.concepto}</TableCell>
              <TableCell className="text-right font-mono text-sm">
                {formatNumber(item.factor ? Number(item.factor) : 0, 4)}
              </TableCell>
              {showBaseGravable && (
                <TableCell className="text-right font-mono text-sm">
                  {item.baseGravable ? formatCurrency(item.baseGravable) : '-'}
                </TableCell>
              )}
              {showBaseExenta && (
                <TableCell className="text-right font-mono text-sm">
                  {item.baseExenta ? formatCurrency(item.baseExenta) : '-'}
                </TableCell>
              )}
              <TableCell className="text-right font-mono">
                {formatCurrency(item.monto)}
              </TableCell>
            </TableRow>
          ))}
          <TableRow className="font-bold bg-muted/50">
            <TableCell colSpan={showBaseGravable || showBaseExenta ? 4 : 2}>
              PERCEPCIONES TOTALES
            </TableCell>
            <TableCell className="text-right font-mono text-lg">
              {formatCurrency(totalMonto)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
