'use client';

import * as React from 'react';
import { StarIcon } from 'lucide-react';

import { Button, type ButtonProps } from '@workspace/ui/components/button';
import { toast } from '@workspace/ui/components/sonner';
import { cn } from '@workspace/ui/lib/utils';

import { addFavorite } from '~/actions/favorites/add-favorite';
import { removeFavorite } from '~/actions/favorites/remove-favorite';
import type { ContactDto } from '~/types/dtos/contact-dto';

export type ContactFavoriteToggleProps = ButtonProps & {
  contact: ContactDto;
  addedToFavorites: boolean;
};

export function ContactFavoriteToggle({
  contact,
  addedToFavorites,
  className,
  ...other
}: ContactFavoriteToggleProps): React.JSX.Element {
  const description = addedToFavorites ? 'Quitar de favoritos' : 'Agregar a favoritos';
  const handleToggleFavorite = async (): Promise<void> => {
    if (addedToFavorites) {
      const result = await removeFavorite({ contactId: contact.id });
      if (result?.serverError || result?.validationErrors) {
        toast.error('No se pudo quitar de favoritos');
      }
    } else {
      const result = await addFavorite({ contactId: contact.id });
      if (result?.serverError || result?.validationErrors) {
        toast.error('No se pudo agregar a favoritos');
      }
    }
  };
  return (
    <Button
      type="button"
      variant="ghost"
      title={description}
      onClick={handleToggleFavorite}
      className={cn('size-9', className)}
      {...other}
    >
      <StarIcon
        className={cn('size-4 shrink-0', addedToFavorites && 'fill-primary')}
      />
      <span className="sr-only">{description}</span>
    </Button>
  );
}
