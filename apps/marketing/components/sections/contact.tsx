'use client';

import * as React from 'react';
import { MailIcon, MapPinIcon, PhoneIcon } from 'lucide-react';

import { Button } from '@workspace/ui/components/button';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { toast } from '@workspace/ui/components/sonner';
import { Textarea } from '@workspace/ui/components/textarea';

import { GridSection } from '~/components/fragments/grid-section';
import { SiteHeading } from '~/components/fragments/site-heading';

export function Contact(): React.JSX.Element {
  const handleSendMessage = (): void => {
    toast.error("Aún no está implementado.");
  };
  return (
    <GridSection>
      <div className="container space-y-20 py-20">
        <SiteHeading
          badge="Contacto"
          title={
            <>
              ¡Nos encantaría escucharte!
            </>
          }
        />
        <div className="lg:container lg:max-w-6xl ">
          <div className="flex flex-col justify-between gap-10 lg:flex-row lg:gap-20">
            <div className="order-2 space-y-8 text-center lg:order-1 lg:w-1/2 lg:text-left">
              <h3 className="hidden max-w-fit text-4xl font-semibold lg:block">
                Contáctanos
              </h3>
              <p className="text-muted-foreground lg:max-w-[80%]">
                Si tienes alguna pregunta, no dudes en contactar a nuestro equipo.
                Te responderemos en menos de 48 horas.
              </p>
              <div className="space-y-4">
                <h4 className="hidden text-lg font-medium lg:block">
                  Detalles de contacto
                </h4>
                <div className="flex flex-col items-center gap-3 lg:items-start">
                  <ContactInfo
                    icon={PhoneIcon}
                    text="+52 55 1234 5678"
                  />
                  <ContactInfo
                    icon={MailIcon}
                    text="hola@qtx.mx"
                  />
                  <ContactInfo
                    icon={MapPinIcon}
                    text="Ciudad de México, México"
                  />
                </div>
              </div>
            </div>
            <Card className="order-1 mx-auto w-full py-6 lg:py-10 max-w-lg shadow-lg lg:order-2 lg:w-1/2">
              <CardContent className="flex flex-col gap-6 px-6 lg:px-10">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 grid w-full items-center gap-1.5 sm:col-span-1">
                    <Label htmlFor="firstname">Nombre</Label>
                    <Input
                      id="firstname"
                      type="text"
                      placeholder="Juan"
                    />
                  </div>
                  <div className="col-span-2 grid w-full items-center gap-1.5 sm:col-span-1">
                    <Label htmlFor="lastname">Apellido</Label>
                    <Input
                      id="lastname"
                      type="text"
                      placeholder="Pérez"
                    />
                  </div>
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="juan.perez@ejemplo.com"
                  />
                </div>
                <div className="grid w-full gap-1.5">
                  <Label htmlFor="message">Mensaje</Label>
                  <Textarea
                    id="message"
                    placeholder="Escribe tu mensaje aquí."
                    rows={6}
                  />
                </div>
                <Button
                  type="button"
                  className="w-full"
                  onClick={handleSendMessage}
                >
                  Enviar mensaje
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </GridSection>
  );
}

type ContactInfoProps = {
  icon: React.ElementType;
  text: string;
};

function ContactInfo({
  icon: Icon,
  text
}: ContactInfoProps): React.JSX.Element {
  return (
    <div className="flex items-center gap-2 text-sm lg:w-64">
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <span>{text}</span>
    </div>
  );
}
