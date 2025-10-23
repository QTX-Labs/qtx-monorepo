'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { MoreHorizontal, Download, Trash2, Loader2 } from 'lucide-react';
import { type Finiquito, type User } from '@workspace/database';
import { useAction } from 'next-safe-action/hooks';
import { toast } from 'sonner';
import { useRouter, useParams } from 'next/navigation';
import numeral from 'numeral';

import { Button } from '@workspace/ui/components/button';
import { toLocalDate } from '~/lib/finiquitos/utils';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@workspace/ui/components/card';
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

  if (finiquitos.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">
            No hay finiquitos registrados aún
          </p>
        </CardContent>
      </Card>
    );
  }

  const isLoading = isDownloading || deleteStatus === 'executing';

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Historial de Finiquitos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empleado</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha de Baja</TableHead>
                <TableHead>Total a Pagar</TableHead>
                <TableHead>Creado Por</TableHead>
                <TableHead>Fecha de Creación</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {finiquitos.map((finiquito) => (
                <TableRow
                  key={finiquito.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleRowClick(finiquito.id)}
                >
                  <TableCell className="font-medium">
                    {finiquito.employeeName}
                  </TableCell>
                  <TableCell>{finiquito.empresaName || '-'}</TableCell>
                  <TableCell>{finiquito.clientName || '-'}</TableCell>
                  <TableCell>
                    {format(toLocalDate(finiquito.terminationDate), 'PPP', {
                      locale: es
                    })}
                  </TableCell>
                  <TableCell>
                    ${numeral(Number(finiquito.version === 2 ? finiquito.totalAPagar : finiquito.totalToPay)).format('0,0.00')}
                  </TableCell>
                  <TableCell>{finiquito.user.name}</TableCell>
                  <TableCell>
                    {format(toLocalDate(finiquito.createdAt), 'PPP', {
                      locale: es
                    })}
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
        </CardContent>
      </Card>

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
