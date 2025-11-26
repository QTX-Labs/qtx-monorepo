'use client';

import NiceModal, { type NiceModalHocProps } from '@ebay/nice-modal-react';
import { AlertTriangle } from 'lucide-react';

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
import { useMediaQuery } from '@workspace/ui/hooks/use-media-query';
import { MediaQueries } from '@workspace/ui/lib/media-queries';

import { useEnhancedModal } from '~/hooks/use-enhanced-modal';

export type Step1ChangesWarningModalProps = NiceModalHocProps;

/**
 * Step 1 Changes Warning Modal
 *
 * Displays a warning dialog when user returns from Step 2 to Step 1,
 * makes changes to critical fields, and attempts to advance to Step 2 again.
 *
 * The user can choose to:
 * - Recalculate factors (replaces Step 2 manual edits)
 * - Maintain manual edits (reverts Step 1 changes)
 *
 * Resolves with:
 * - true: User wants to recalculate factors (discard Step 2 edits)
 * - false: User wants to maintain Step 2 edits (revert Step 1 changes)
 * - null: User cancelled the dialog
 *
 * Usage:
 * ```ts
 * const shouldRecalculate = await NiceModal.show(Step1ChangesWarningModal);
 * if (shouldRecalculate === true) {
 *   // Recalculate factors, update Step 2
 * } else if (shouldRecalculate === false) {
 *   // Revert Step 1 changes, keep Step 2 as-is
 * }
 * ```
 */
export const Step1ChangesWarningModal = NiceModal.create<Step1ChangesWarningModalProps>(
  () => {
    const modal = useEnhancedModal();
    const mdUp = useMediaQuery(MediaQueries.MdUp, { ssr: false });

    const handleRecalculate = () => {
      modal.resolve(true);
      modal.handleClose();
    };

    const handleMaintainEdits = () => {
      modal.resolve(false);
      modal.handleClose();
    };

    const handleCancel = () => {
      modal.resolve(null);
      modal.handleClose();
    };

    const title = 'Cambios detectados en factores base';
    const description = (
      <>
        Detectamos que realizaste cambios que afectan el cálculo de factores.
        <br />
        <br />
        Si continúas, <strong className="text-foreground font-semibold">recalcularemos los factores del paso 2</strong> y esto{' '}
        <strong className="text-foreground font-semibold">reemplazará cualquier factor que hayas modificado manualmente</strong>.
        <br />
        <br />
        ¿Qué deseas hacer?
      </>
    );

    const renderButtons = (
      <>
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleMaintainEdits}
        >
          Mantener mis ediciones
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={handleRecalculate}
        >
          Sí, recalcular factores
        </Button>
      </>
    );

    return mdUp ? (
      <AlertDialog open={modal.visible}>
        <AlertDialogContent
          className="max-w-2xl"
          onClose={handleCancel}
          onAnimationEndCapture={modal.handleAnimationEndCapture}
        >
          <AlertDialogHeader>
            <div className="flex items-start gap-3">
              <AlertTriangle className="size-5 shrink-0 text-destructive mt-0.5" />
              <div className="flex-1">
                <AlertDialogTitle>{title}</AlertDialogTitle>
                <AlertDialogDescription className="mt-2">
                  {description}
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            {renderButtons}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ) : (
      <Drawer
        open={modal.visible}
        onOpenChange={(open) => {
          if (!open) handleCancel();
        }}
      >
        <DrawerContent>
          <DrawerHeader className="text-left">
            <div className="flex items-start gap-3">
              <AlertTriangle className="size-5 shrink-0 text-destructive mt-0.5" />
              <div className="flex-1">
                <DrawerTitle>{title}</DrawerTitle>
                <DrawerDescription className="mt-2">
                  {description}
                </DrawerDescription>
              </div>
            </div>
          </DrawerHeader>
          <DrawerFooter className="flex-col-reverse pt-4 gap-2">
            {renderButtons}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }
);
