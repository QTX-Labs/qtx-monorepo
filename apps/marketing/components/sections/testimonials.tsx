'use client';

import * as React from 'react';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { motion } from 'motion/react';

import { APP_NAME } from '@workspace/common/app';
import { cn } from '@workspace/ui/lib/utils';

import { GridSection } from '~/components/fragments/grid-section';
import { Marquee } from '~/components/fragments/marquee';

const DATA = [
  {
    name: 'Carlos Hernández',
    role: 'Director de Finanzas en Grupo Industrial Monterrey',
    img: 'https://randomuser.me/api/portraits/men/91.jpg',
    description: (
      <p>
        Con {APP_NAME} procesamos la nómina de 850 empleados en 3 horas.{' '}
        <strong>
          Reducimos errores en cálculos de ISR en 99% y eliminamos multas del SAT.
        </strong>{' '}
        El timbrado CFDI 4.0 ahora es automático e instantáneo.
      </p>
    )
  },
  {
    name: 'María González',
    role: 'Gerente de RH en Maquiladora TechParts Juárez',
    img: 'https://randomuser.me/api/portraits/women/12.jpg',
    description: (
      <p>
        {APP_NAME} maneja perfectamente nuestros 3 turnos y horas extras.{' '}
        <strong>Ahorramos 120 horas al mes en procesamiento de nómina.</strong>{' '}
        La integración con IMSS e IDSE es impecable.
      </p>
    )
  },
  {
    name: 'Alejandro Ramírez',
    role: 'Contador Público en Despacho Contable Ramírez y Asociados',
    img: 'https://randomuser.me/api/portraits/men/45.jpg',
    description: (
      <p>
        Manejamos la nómina de 45 PyMEs con {APP_NAME}.{' '}
        <strong>
          Reducimos el tiempo de cálculo de PTU y aguinaldo en 80%.
        </strong>{' '}
        Nuestros clientes están encantados con el portal del empleado.
      </p>
    )
  },
  {
    name: 'Patricia López',
    role: 'Directora de Operaciones en Cadena de Restaurantes La Casa',
    img: 'https://randomuser.me/api/portraits/women/83.jpg',
    description: (
      <p>
        {APP_NAME} calcula automáticamente propinas, tiempo extra y festivos.{' '}
        <strong>
          Pasamos auditorías del IMSS sin observaciones desde que lo usamos.
        </strong>{' '}
        Perfecto para el sector restaurantero.
      </p>
    )
  },
  {
    name: 'Roberto Martínez',
    role: 'CFO en Startup Fintech MexPay',
    img: 'https://randomuser.me/api/portraits/men/1.jpg',
    description: (
      <p>
        Como startup, necesitábamos cumplir con regulaciones desde día 1.{' '}
        <strong>
          {APP_NAME} nos evitó contratar 2 especialistas en nómina.
        </strong>{' '}
        Escalamos de 5 a 150 empleados sin problemas.
      </p>
    )
  },
  {
    name: 'Ana Sánchez',
    role: 'Jefa de Capital Humano en Constructora del Bajío',
    img: 'https://randomuser.me/api/portraits/women/5.jpg',
    description: (
      <p>
        Manejamos nómina semanal para 500 trabajadores de construcción.{' '}
        <strong>Los cálculos de Infonavit y fonacot ahora son perfectos.</strong>{' '}
        {APP_NAME} se actualiza automáticamente con cambios de ley.
      </p>
    )
  },
  {
    name: 'Miguel Rodríguez',
    role: 'Director Administrativo en Hospital Privado San Ángel',
    img: 'https://randomuser.me/api/portraits/men/14.jpg',
    description: (
      <p>
        {APP_NAME} maneja guardias, bonos y prestaciones superiores a la ley.{' '}
        <strong>
          Redujimos quejas de empleados por errores en nómina a cero.
        </strong>{' '}
        El cálculo de ISR es transparente y preciso.
      </p>
    )
  },
  {
    name: 'Laura Fernández',
    role: 'Socia en Consultoría de RH TalentoMX',
    img: 'https://randomuser.me/api/portraits/women/56.jpg',
    description: (
      <p>
        Implementamos {APP_NAME} en 20 clientes este año.{' '}
        <strong>
          Todos reportan ahorro mínimo del 60% en tiempo de procesamiento.
        </strong>{' '}
        La migración desde otros sistemas es sorprendentemente fácil.
      </p>
    )
  },
  {
    name: 'Jorge Mendoza',
    role: 'Gerente General en Transportes del Pacífico',
    img: 'https://randomuser.me/api/portraits/men/18.jpg',
    description: (
      <p>
        Con choferes en 8 estados, {APP_NAME} calcula viáticos e ISR local perfectamente.{' '}
        <strong>
          Evitamos multas de $500,000 MXN por errores en declaraciones.
        </strong>{' '}
        Indispensable para empresas de transporte.
      </p>
    )
  },
  {
    name: 'Claudia Torres',
    role: 'VP de Finanzas en Grupo Educativo Futuro',
    img: 'https://randomuser.me/api/portraits/women/73.jpg',
    description: (
      <p>
        Procesamos nómina de maestros, administrativos y personal de apoyo.{' '}
        <strong>
          El cálculo de prima vacacional y aguinaldo ahora toma minutos.
        </strong>{' '}
        {APP_NAME} cumple perfectamente con regulaciones SEP.
      </p>
    )
  },
  {
    name: 'Fernando García',
    role: 'Director de Administración en Farmacéutica Nacional',
    img: 'https://randomuser.me/api/portraits/men/25.jpg',
    description: (
      <p>
        {APP_NAME} maneja comisiones de ventas y bonos por productividad sin errores.{' '}
        <strong>Pasamos de 5 días a 5 horas para cerrar la nómina quincenal.</strong>{' '}
        La integración con bancos para dispersión es excelente.
      </p>
    )
  },
  {
    name: 'Beatriz Morales',
    role: 'Gerente de Nómina en Centro de Contacto GlobalCall',
    img: 'https://randomuser.me/api/portraits/women/78.jpg',
    description: (
      <p>
        Con 2,000 agentes y alta rotación, {APP_NAME} es un salvavidas.{' '}
        <strong>Procesamos finiquitos en minutos, no días.</strong>{' '}
        Los recibos digitales reducen costos de impresión 100%.
      </p>
    )
  },
  {
    name: 'Ricardo Jiménez',
    role: 'CEO en Agencia Digital CreativaMX',
    img: 'https://randomuser.me/api/portraits/men/54.jpg',
    description: (
      <p>
        Como agencia manejamos empleados y freelancers. {APP_NAME} procesa ambos.{' '}
        <strong>Ahorramos $15,000 MXN mensuales vs. nuestro contador anterior.</strong>{' '}
        El soporte responde en minutos, no días.
      </p>
    )
  }
];

export function Testimonials(): React.JSX.Element {
  return (
    <GridSection hideVerticalGridLines>
      <div className="container border-x py-20 md:border-none">
        <h2 className="mb-8 text-center text-3xl font-semibold md:text-5xl lg:text-left">
          Más de 1,000 empresas mexicanas confían en nosotros
        </h2>
        <div className="relative mt-6 max-h-[640px] overflow-hidden">
          <div className="gap-4 md:columns-2 xl:columns-3 2xl:columns-4">
            {Array(Math.ceil(DATA.length / 3))
              .fill(0)
              .map((_, i) => (
                <Marquee
                  vertical
                  key={i}
                  className={cn({
                    '[--duration:60s]': i === 1,
                    '[--duration:30s]': i === 2,
                    '[--duration:70s]': i === 3
                  })}
                >
                  {DATA.slice(i * 3, (i + 1) * 3).map((testimonial, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        delay: Math.random() * 0.4,
                        duration: 1
                      }}
                      className="mb-4 flex w-full break-inside-avoid flex-col items-center justify-between gap-6 rounded-xl border bg-background p-4 dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]"
                    >
                      <div className="select-none text-sm font-normal text-muted-foreground">
                        {testimonial.description}
                        <div className="flex flex-row py-1">
                          <Star className="size-4 fill-yellow-500 text-yellow-500" />
                          <Star className="size-4 fill-yellow-500 text-yellow-500" />
                          <Star className="size-4 fill-yellow-500 text-yellow-500" />
                          <Star className="size-4 fill-yellow-500 text-yellow-500" />
                          <Star className="size-4 fill-yellow-500 text-yellow-500" />
                        </div>
                      </div>
                      <div className="flex w-full select-none items-center justify-start gap-5">
                        <Image
                          width={40}
                          height={40}
                          src={testimonial.img || ''}
                          alt={testimonial.name}
                          className="size-8 rounded-full ring-1 ring-border ring-offset-4"
                        />
                        <div>
                          <p className="text-sm font-medium">
                            {testimonial.name}
                          </p>
                          <p className="text-xs font-normal text-muted-foreground">
                            {testimonial.role}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </Marquee>
              ))}
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 w-full bg-linear-to-t from-background from-20%" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1/4 w-full bg-linear-to-b from-background from-20%" />
        </div>
      </div>
    </GridSection>
  );
}
