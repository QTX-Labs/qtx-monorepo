'use client';

import * as React from 'react';
import NiceModal from '@ebay/nice-modal-react';

import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardFooter,
  type CardProps
} from '@workspace/ui/components/card';
import { Separator } from '@workspace/ui/components/separator';
import { cn } from '@workspace/ui/lib/utils';

import { DeleteAccountModal } from '~/components/organizations/slug/settings/account/profile/delete-account-modal';

export type DeleteAccountCardProps = CardProps & {
  ownedOrganizations: { name: string; slug: string }[];
};

export function DeleteAccountCard({
  ownedOrganizations,
  className,
  ...other
}: DeleteAccountCardProps): React.JSX.Element {
  const handleShowDeleteAccountModal = (): void => {
    NiceModal.show(DeleteAccountModal, { ownedOrganizations });
  };
  return (
    <Card
      className={cn('border-destructive', className)}
      {...other}
    >
      <CardContent>
        <p className="text-sm font-normal text-muted-foreground">
          Eliminar tu cuenta es irreversible. Todos tus datos serán
          eliminados permanentemente de nuestros servidores.
        </p>
      </CardContent>
      <Separator />
      <CardFooter className="flex w-full justify-end">
        <Button
          type="button"
          variant="destructive"
          size="default"
          onClick={handleShowDeleteAccountModal}
        >
          Eliminar cuenta
        </Button>
      </CardFooter>
    </Card>
  );
}
