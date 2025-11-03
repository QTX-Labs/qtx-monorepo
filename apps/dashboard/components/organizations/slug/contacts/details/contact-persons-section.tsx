'use client';

import * as React from 'react';
import NiceModal from '@ebay/nice-modal-react';
import { MailIcon, PhoneIcon, PlusIcon, UserIcon } from 'lucide-react';

import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { cn } from '@workspace/ui/lib/utils';

import { AddContactPersonModal } from '~/components/organizations/slug/contacts/details/modals/add-contact-person-modal';
import { EditContactPersonModal } from '~/components/organizations/slug/contacts/details/modals/edit-contact-person-modal';
import type { ContactDto } from '~/types/dtos/contact-dto';
import type { ContactPersonDto } from '~/types/dtos/contact-person-dto';

export type ContactPersonsSectionProps =
  React.HtmlHTMLAttributes<HTMLDivElement> & {
    contact: ContactDto;
  };

export function ContactPersonsSection({
  contact,
  ...others
}: ContactPersonsSectionProps): React.JSX.Element {
  const canAddMore = contact.contactPersons.length < 3;

  const handleAddPerson = (): void => {
    void NiceModal.show(AddContactPersonModal, {
      contactId: contact.id
    });
  };

  const handleEditPerson = (person: ContactPersonDto): void => {
    void NiceModal.show(EditContactPersonModal, {
      person
    });
  };

  return (
    <Card {...others}>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-semibold tracking-tight">
          Personas de Contacto ({contact.contactPersons.length}/3)
        </CardTitle>
        {canAddMore && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7"
            onClick={handleAddPerson}
          >
            <PlusIcon className="mr-1 size-3" />
            Agregar
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {contact.contactPersons.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay personas de contacto agregadas
          </p>
        ) : (
          contact.contactPersons.map((person) => (
            <ContactPersonCard
              key={person.id}
              person={person}
              onEdit={() => handleEditPerson(person)}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}

type ContactPersonCardProps = {
  person: ContactPersonDto;
  onEdit: () => void;
};

function ContactPersonCard({
  person,
  onEdit
}: ContactPersonCardProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'rounded-lg border bg-card p-3 transition-colors hover:bg-accent/50',
        'cursor-pointer'
      )}
      onClick={onEdit}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <UserIcon className="size-4 shrink-0 text-muted-foreground" />
            <p className="text-sm font-medium">{person.name}</p>
            {person.isPrimary && (
              <Badge variant="default" className="text-xs">
                Principal
              </Badge>
            )}
          </div>
          {person.position && (
            <p className="text-xs text-muted-foreground">{person.position}</p>
          )}
          {person.email && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MailIcon className="size-3 shrink-0" />
              <span className="truncate">{person.email}</span>
            </div>
          )}
          {person.phone && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <PhoneIcon className="size-3 shrink-0" />
              <span>{person.phone}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
