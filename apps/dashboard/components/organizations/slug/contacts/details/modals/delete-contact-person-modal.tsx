'use client';

import NiceModal, { type NiceModalHocProps, useModal } from '@ebay/nice-modal-react';

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

export type DeleteContactPersonModalProps = NiceModalHocProps;

export const DeleteContactPersonModal = NiceModal.create<DeleteContactPersonModalProps>(
  () => {
    const modal = useModal();
    const handleConfirm = (): void => {
      modal.resolve(true);
      void modal.remove();
    };
    const handleCancel = (): void => {
      modal.resolve(false);
      void modal.remove();
    };
    return (
      <AlertDialog
        open={modal.visible}
        onOpenChange={handleCancel}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente esta
              persona de contacto.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }
);
