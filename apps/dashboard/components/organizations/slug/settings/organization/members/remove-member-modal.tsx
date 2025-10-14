'use client';

import NiceModal, { type NiceModalHocProps } from '@ebay/nice-modal-react';
import { AlertCircleIcon } from 'lucide-react';
import { type SubmitHandler } from 'react-hook-form';

import { Alert, AlertDescription } from '@workspace/ui/components/alert';
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
import { FormProvider } from '@workspace/ui/components/form';
import { toast } from '@workspace/ui/components/sonner';
import { useMediaQuery } from '@workspace/ui/hooks/use-media-query';
import { MediaQueries } from '@workspace/ui/lib/media-queries';

import { removeMember } from '~/actions/members/remove-member';
import { useEnhancedModal } from '~/hooks/use-enhanced-modal';
import { useZodForm } from '~/hooks/use-zod-form';
import {
  removeMemberSchema,
  type RemoveMemberSchema
} from '~/schemas/members/remove-member-schema';
import type { MemberDto } from '~/types/dtos/member-dto';
import type { ProfileDto } from '~/types/dtos/profile-dto';

export type RemoveMemberModalProps = NiceModalHocProps & {
  profile: ProfileDto;
  member: MemberDto;
};

export const RemoveMemberModal = NiceModal.create<RemoveMemberModalProps>(
  ({ profile, member }) => {
    const modal = useEnhancedModal();
    const mdUp = useMediaQuery(MediaQueries.MdUp, { ssr: false });
    const methods = useZodForm({
      schema: removeMemberSchema,
      mode: 'all',
      defaultValues: {
        id: member.id
      }
    });
    const isLeaving = profile.id === member.id;
    const title = isLeaving ? '¿Salir de la organización?' : '¿Eliminar este miembro?';
    const canSubmit =
      !methods.formState.isSubmitting &&
      methods.formState.isValid &&
      !member.isOwner;
    const onSubmit: SubmitHandler<RemoveMemberSchema> = async (values) => {
      if (!canSubmit) {
        return;
      }
      modal.handleClose();
      const result = await removeMember(values);
      if (!result?.serverError && !result?.validationErrors) {
        toast.success(isLeaving ? 'Has salido de la organización' : 'Miembro eliminado');
      } else {
        toast.error(
          isLeaving ? 'No se pudo salir de la organización' : 'No se pudo eliminar el miembro'
        );
      }
    };
    const renderDescription = isLeaving ? (
      <>
        ¿Estás seguro de que deseas salir de la organización? Perderás todo
        el acceso a la organización.
      </>
    ) : (
      <>
        ¿Estás seguro de que deseas eliminar a{' '}
        <strong className="text-foreground font-medium">{member.name}</strong>?
        Perderá todo el acceso a la organización.
      </>
    );
    const renderForm = (
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <input
          type="hidden"
          className="hidden"
          disabled={methods.formState.isSubmitting}
          {...methods.register('id')}
        />
        {member.isOwner && (
          <Alert variant="warning">
            <AlertCircleIcon className="size-[18px] shrink-0" />
            <AlertDescription className="inline">
              {isLeaving
                ? 'Por favor asigna otro propietario antes de salir de la organización.'
                : 'Por favor informa al miembro que asigne otro propietario.'}
            </AlertDescription>
          </Alert>
        )}
      </form>
    );
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
          disabled={!canSubmit}
          loading={methods.formState.isSubmitting}
          onClick={methods.handleSubmit(onSubmit)}
        >
          {isLeaving ? 'Sí, salir' : 'Sí, eliminar'}
        </Button>
      </>
    );
    return (
      <FormProvider {...methods}>
        {mdUp ? (
          <AlertDialog open={modal.visible}>
            <AlertDialogContent
              className="max-w-sm"
              onClose={modal.handleClose}
              onAnimationEndCapture={modal.handleAnimationEndCapture}
            >
              <AlertDialogHeader>
                <AlertDialogTitle>{title}</AlertDialogTitle>
                <AlertDialogDescription>
                  {renderDescription}
                </AlertDialogDescription>
              </AlertDialogHeader>
              {renderForm}
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
                <DrawerDescription>{renderDescription}</DrawerDescription>
              </DrawerHeader>
              {renderForm}
              <DrawerFooter className="flex-col-reverse pt-4">
                {renderButtons}
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        )}
      </FormProvider>
    );
  }
);
