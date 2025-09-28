import * as React from 'react';
import {
  CalendarIcon,
  DollarSignIcon,
  GlobeIcon,
  LineChartIcon,
  MapPinIcon,
  TagsIcon,
  User2Icon
} from 'lucide-react';

import { Badge } from '@workspace/ui/components/badge';
import {
  Card,
  CardContent,
  CardFooter,
  type CardProps
} from '@workspace/ui/components/card';
import { cn } from '@workspace/ui/lib/utils';

function IMSSLogo(): React.JSX.Element {
  return (
    <div className="flex h-5 w-5 items-center justify-center rounded bg-green-600 text-xs font-bold text-white">
      IMSS
    </div>
  );
}

export function AiAdvisorCard({
  className,
  ...props
}: CardProps): React.JSX.Element {
  return (
    <Card
      className={cn('pb-0', className)}
      {...props}
    >
      <CardContent>
        <div className="mb-3 flex items-center gap-2">
          <IMSSLogo />
          <h2 className="text-xl font-semibold">Empresa Ejemplo S.A.</h2>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <GlobeIcon className="size-4 text-muted-foreground" />
            <span className="w-20 text-sm text-muted-foreground">RFC</span>
            <span className="text-sm">EEJ840315KJ3</span>
          </div>
          <div className="flex items-center gap-2">
            <User2Icon className="size-4 text-muted-foreground" />
            <span className="w-20 text-sm text-muted-foreground">Empleados</span>
            <span className="text-sm">248 activos</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="size-4 text-muted-foreground" />
            <span className="w-20 text-sm text-muted-foreground">Próx. nómina</span>
            <span className="text-sm">15 de diciembre</span>
          </div>
          <div className="flex items-center gap-2">
            <LineChartIcon className="size-4 text-muted-foreground" />
            <span className="w-20 text-sm text-muted-foreground">Nómina mes</span>
            <span className="text-sm">$3.2M MXN</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPinIcon className="size-4 text-muted-foreground" />
            <span className="w-20 text-sm text-muted-foreground">Ubicación</span>
            <span className="text-sm">Guadalajara, JAL</span>
          </div>
          <div className="flex items-center gap-2">
            <TagsIcon className="size-4 text-muted-foreground" />
            <span className="w-20 text-sm text-muted-foreground">Compliance</span>
            <div className="flex gap-1">
              <Badge
                variant="secondary"
                className="whitespace-nowrap pl-2 text-xs text-green-600"
              >
                SAT ✓
              </Badge>
              <Badge
                variant="secondary"
                className="whitespace-nowrap pl-2 text-xs text-green-600"
              >
                IMSS ✓
              </Badge>
              <Badge
                variant="secondary"
                className="whitespace-nowrap pl-2 text-xs text-green-600"
              >
                IDSE ✓
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DollarSignIcon className="size-4 text-muted-foreground" />
            <span className="w-20 text-sm text-muted-foreground">Ahorro anual</span>
            <span className="text-sm">$480K MXN vs. manual</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start space-y-4 rounded-b-xl bg-neutral-50 py-6 dark:bg-neutral-900">
        <h3 className="text-base font-semibold sm:text-lg">Asistente IA de Nómina</h3>
        <div className="min-h-10 max-w-md text-sm text-muted-foreground">
          Próxima declaración IMSS en 3 días. PTU calculado automáticamente.
          Aguinaldo se procesará el 20 de diciembre. Todo 100% conforme con la ley.
        </div>
      </CardFooter>
    </Card>
  );
}
