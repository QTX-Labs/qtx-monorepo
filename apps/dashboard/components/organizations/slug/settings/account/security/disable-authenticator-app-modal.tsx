'use client';

import NiceModal, { type NiceModalHocProps } from '@ebay/nice-modal-react';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@workspace/ui/components/alert-dialog';
import { Button } from '@workspace/ui/components/button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle
} from '@workspace/ui/components/drawer';
import { toast } from '@workspace/ui/components/sonner';
import { useMediaQuery } from '@workspace/ui/hooks/use-media-query';
import { MediaQueries } from '@workspace/ui/lib/media-queries';

import { disableAuthenticatorApp } from '~/actions/account/disable-authenticator-app';
import { useEnhancedModal } from '~/hooks/use-enhanced-modal';

export type DisableAuthenticatorAppModalProps = NiceModalHocProps;

export const DisableAuthenticatorAppModal =
  NiceModal.create<DisableAuthenticatorAppModalProps>(() => {
    const modal = useEnhancedModal();
    const mdUp = useMediaQuery(MediaQueries.MdUp, { ssr: false });
    const title = '¿Deshabilitar app autenticadora?';
    const description =
      'La app autenticadora será deshabilitada, ¿estás seguro de que deseas continuar?';
    const handleSubmit = async () => {
      const result = await disableAuthenticatorApp();
      if (!result?.serverError && !result?.validationErrors) {
        toast.success('App autenticadora deshabilitada');
        modal.handleClose();
      } else {
        toast.error('No se pudo deshabilitar la app autenticadora');
      }
    };
    const renderButtons = (
      <>
        <Button
          type="button"
          variant="outline"
          onClick={modal.handleClose}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={handleSubmit}
        >
          Sí, deshabilitar
        </Button>
      </>
    );
    return (
      <>
        {mdUp ? (
          <AlertDialog open={modal.visible}>
            <AlertDialogContent
              className="max-w-sm"
              onClose={modal.handleClose}
              onAnimationEndCapture={modal.handleAnimationEndCapture}
            >
              <AlertDialogHeader>
                <AlertDialogTitle>{title}</AlertDialogTitle>
                <AlertDialogDescription>{description}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>{renderButtons}</AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <Drawer
            open={modal.visible}
            onOpenChange={modal.handleOpenChange}
          >
            <DrawerContent>
              <DrawerHeader className="text-left">
                <DrawerTitle>{title}</DrawerTitle>
                <DrawerDescription>{description}</DrawerDescription>
              </DrawerHeader>
              <DrawerFooter className="flex-col-reverse pt-4">
                {renderButtons}
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        )}
      </>
    );
  });
