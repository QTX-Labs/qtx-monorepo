'use client';

import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { MoreHorizontal, Download, Trash2, Loader2, Search, ArrowUp, ArrowDown } from 'lucide-react';
import { useDebounce } from '@workspace/ui/hooks/use-debounce';
import { type Finiquito, type User } from '@workspace/database';
import { useAction } from 'next-safe-action/hooks';
import { toast } from 'sonner';
import { useRouter, useParams } from 'next/navigation';
import numeral from 'numeral';

import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { toLocalDate } from '~/lib/finiquitos/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@workspace/ui/components/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@workspace/ui/components/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@workspace/ui/components/table';

import { deleteFiniquito } from '~/actions/finiquitos/delete-finiquito';

type FiniquitoListItem = Pick<
  Finiquito,
  | 'id'
  | 'employeeName'
  | 'empresaName'
  | 'clientName'
  | 'hireDate'
  | 'terminationDate'
  | 'salary'
  | 'salaryFrequency'
  | 'borderZone'
  | 'totalToPay'
  | 'totalAPagar'
  | 'version'
  | 'createdAt'
  | 'gratificationDays'
> & {
  user: Pick<User, 'name' | 'email'>;
};

interface FiniquitosListProps {
  finiquitos: FiniquitoListItem[];
}

export function FiniquitosList({ finiquitos }: FiniquitosListProps) {
  const router = useRouter();
  const params = useParams();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('createdAt-desc');

  // Default date range: 15 days before and 15 days after today
  const getDefaultDateFrom = () => {
    const date = new Date();
    date.setDate(date.getDate() - 15);
    return format(date, 'yyyy-MM-dd');
  };

  const getDefaultDateTo = () => {
    const date = new Date();
    date.setDate(date.getDate() + 15);
    return format(date, 'yyyy-MM-dd');
  };

  const [dateFrom, setDateFrom] = useState(getDefaultDateFrom());
  const [dateTo, setDateTo] = useState(getDefaultDateTo());

  // Debounced filter values
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const debouncedDateFrom = useDebounce(dateFrom, 300);
  const debouncedDateTo = useDebounce(dateTo, 300);

  const { execute: executeDelete, status: deleteStatus } = useAction(deleteFiniquito, {
    onSuccess: () => {
      toast.success('Finiquito eliminado exitosamente');
      setDeleteDialogOpen(false);
      setSelectedId(null);
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'Error al eliminar el finiquito');
    }
  });

  const handleDownloadPDF = async (id: string) => {
    try {
      setIsDownloading(true);
      const response = await fetch(`/api/finiquitos/${id}/pdf`);

      if (!response.ok) {
        throw new Error('Error al generar PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `finiquito-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('PDF generado exitosamente');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Error al generar PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setSelectedId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedId) {
      executeDelete({ id: selectedId });
    }
  };

  const handleRowClick = (id: string) => {
    router.push(`/organizations/${params.slug}/finiquitos/${id}`);
  };

  // Filter and sort finiquitos using debounced values and memoization
  const filteredAndSortedFiniquitos = useMemo(() => {
    // First, filter
    const filtered = finiquitos.filter((finiquito) => {
      // Combined search filter (employee name OR empresa name)
      if (debouncedSearchQuery) {
        const query = debouncedSearchQuery.toLowerCase();
        const matchesEmployee = finiquito.employeeName.toLowerCase().includes(query);
        const matchesEmpresa = finiquito.empresaName?.toLowerCase().includes(query);

        if (!matchesEmployee && !matchesEmpresa) {
          return false;
        }
      }

      // Date range filter (based on createdAt)
      if (debouncedDateFrom) {
        const finiquitoDate = format(new Date(finiquito.createdAt), 'yyyy-MM-dd');
        if (finiquitoDate < debouncedDateFrom) {
          return false;
        }
      }

      if (debouncedDateTo) {
        const finiquitoDate = format(new Date(finiquito.createdAt), 'yyyy-MM-dd');
        if (finiquitoDate > debouncedDateTo) {
          return false;
        }
      }

      return true;
    });

    // Then, sort
    const [field, direction] = sortBy.split('-') as [string, 'asc' | 'desc'];

    return [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (field) {
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'totalAPagar':
          comparison = Number(a.totalAPagar ?? a.totalToPay) - Number(b.totalAPagar ?? b.totalToPay);
          break;
        case 'employeeName':
          comparison = a.employeeName.localeCompare(b.employeeName);
          break;
        case 'terminationDate':
          comparison = new Date(a.terminationDate).getTime() - new Date(b.terminationDate).getTime();
          break;
      }

      return direction === 'desc' ? -comparison : comparison;
    });
  }, [finiquitos, debouncedSearchQuery, debouncedDateFrom, debouncedDateTo, sortBy]);

  const isLoading = isDownloading || deleteStatus === 'executing';

  if (finiquitos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">
          No hay finiquitos registrados aún
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Filters Section */}
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-2 flex-1">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-auto">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt-desc">
                    <div className="flex items-center gap-2">
                      <ArrowDown className="h-4 w-4" />
                      Fecha de Creación (más reciente)
                    </div>
                  </SelectItem>
                  <SelectItem value="createdAt-asc">
                    <div className="flex items-center gap-2">
                      <ArrowUp className="h-4 w-4" />
                      Fecha de Creación (más antigua)
                    </div>
                  </SelectItem>
                  <SelectItem value="totalAPagar-desc">
                    <div className="flex items-center gap-2">
                      <ArrowDown className="h-4 w-4" />
                      Total a Pagar (mayor a menor)
                    </div>
                  </SelectItem>
                  <SelectItem value="totalAPagar-asc">
                    <div className="flex items-center gap-2">
                      <ArrowUp className="h-4 w-4" />
                      Total a Pagar (menor a mayor)
                    </div>
                  </SelectItem>
                  <SelectItem value="employeeName-asc">
                    <div className="flex items-center gap-2">
                      <ArrowUp className="h-4 w-4" />
                      Empleado (A-Z)
                    </div>
                  </SelectItem>
                  <SelectItem value="employeeName-desc">
                    <div className="flex items-center gap-2">
                      <ArrowDown className="h-4 w-4" />
                      Empleado (Z-A)
                    </div>
                  </SelectItem>
                  <SelectItem value="terminationDate-desc">
                    <div className="flex items-center gap-2">
                      <ArrowDown className="h-4 w-4" />
                      Fecha de Baja (más reciente)
                    </div>
                  </SelectItem>
                  <SelectItem value="terminationDate-asc">
                    <div className="flex items-center gap-2">
                      <ArrowUp className="h-4 w-4" />
                      Fecha de Baja (más antigua)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por empleado o empresa..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2 sm:ml-auto">
              <Input
                type="date"
                className="w-[150px]"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
              <Input
                type="date"
                className="w-[150px]"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block align-middle">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Fecha de Creación</TableHead>
                    <TableHead className="w-[200px]">Empleado</TableHead>
                    <TableHead className="w-[140px]">Total a Pagar</TableHead>
                    <TableHead>Días de Gratificación</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Fecha de Baja</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedFiniquitos.map((finiquito) => (
                    <TableRow
                      key={finiquito.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleRowClick(finiquito.id)}
                    >
                      <TableCell className="font-semibold">
                        <div className="flex flex-col">
                          <span className="text-sm">
                            {format(new Date(finiquito.createdAt), 'yyyy-MM-dd')}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(finiquito.createdAt), 'hh:mm a')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-base">
                        {finiquito.employeeName}
                      </TableCell>
                      <TableCell className="font-bold text-lg text-primary">
                        ${numeral(Number(finiquito.totalAPagar ?? finiquito.totalToPay)).format('0,0.00')}
                      </TableCell>
                      <TableCell className="text-sm text-center">
                        {finiquito.gratificationDays
                          ? numeral(Number(finiquito.gratificationDays)).format('0,0.00')
                          : '-'
                        }
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{finiquito.empresaName || '-'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{finiquito.clientName || '-'}</TableCell>
                      <TableCell className="text-sm">
                        {format(toLocalDate(finiquito.terminationDate), 'yyyy-MM-dd')}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={isLoading}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <MoreHorizontal className="h-4 w-4" />
                              )}
                              <span className="sr-only">Abrir menú</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadPDF(finiquito.id);
                              }}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Descargar PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(finiquito.id);
                              }}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el finiquito
              y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteStatus === 'executing'}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteStatus === 'executing'}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteStatus === 'executing' && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
