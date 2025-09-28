import * as React from 'react';

import { GridSection } from '~/components/fragments/grid-section';

export function StoryVision(): React.JSX.Element {
  return (
    <GridSection>
      <div className="container max-w-6xl py-20">
        <div className="grid gap-16 lg:grid-cols-2">
          <div>
            <h2 className="mb-8 text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Nuestra visión
            </h2>
            <p className="text-2xl font-medium leading-relaxed md:text-3xl">
              "La nómina no debería ser un dolor de cabeza mensual — debe ser
              automática, precisa y 100% compatible con las leyes mexicanas."
            </p>
          </div>
          <div className="space-y-6 text-base text-muted-foreground md:text-lg">
            <p>
              Como mexicanos que vivimos el problema, entendemos que las soluciones
              extranjeras no funcionan para México. Por eso creamos Quantix desde
              Silicon Valley pero con ADN 100% mexicano, respaldados por Y Combinator
              y fondos que creen en nosotros.
            </p>
            <p>
              Nuestra misión es simple: democratizar el acceso a herramientas de
              clase mundial para que cualquier empresa mexicana, desde una taquería
              hasta una maquiladora, pueda competir globalmente con procesos de RH
              eficientes y conformes con la ley.
            </p>
          </div>
        </div>
      </div>
    </GridSection>
  );
}
