# HR Design System - Guía de Implementación

Sistema de diseño moderno, audaz y juguetón inspirado en HR tech con alta energía y empatía.

## 🎨 Colores Principales

### Electric Blue (Primario)
```css
--primary: #0046FF (oklch(0.42 0.22 264.5))
```
- Uso: Fondos principales, CTAs, navegación
- Representa: Confianza, innovación, energía

### Colores de Acento

```css
--neon-lime: #00FF85 (oklch(0.88 0.22 158))
--sunny-yellow: #FFD600 (oklch(0.88 0.20 95))
--warm-orange: #FF9100 (oklch(0.72 0.18 48))
--heart-red: #E91E63 (oklch(0.60 0.22 12))
--cool-cyan: #00BCD4 (oklch(0.70 0.14 210))
```

## 🔤 Tipografía

### Filosofía
- **Títulos**: Font-black, lowercase, tracking super-tight
- **Cuerpo**: Font-medium a regular, sentence case
- **Contraste**: Siempre alto contraste (blanco sobre azul)

### Ejemplos de Uso

```tsx
// Título Hero
<h1 className="text-6xl font-black lowercase tracking-super-tight text-primary">
  la nómina del futuro
</h1>

// Título con gradiente
<h2 className="bg-gradient-to-r from-primary via-neon-lime to-primary bg-clip-text text-transparent">
  para méxico
</h2>

// Texto de cuerpo
<p className="text-lg lowercase text-primary-foreground/90">
  únete a las empresas que están transformando su gestión
</p>
```

## 🎭 Elementos Decorativos

### Formas Orgánicas (Blobs)

```tsx
// Blob básico
<div className="size-32 blob-shape bg-neon-lime opacity-20 animate-float" />

// Blob con gradiente
<div className="size-64 blob-shape-2 bg-sunny-gradient opacity-30 animate-float-large" />

// Círculo decorativo con blur
<div className="size-80 rounded-full bg-primary-dark opacity-40 blur-3xl animate-rotate-slow" />
```

### Clases de Blob Disponibles
- `.blob-shape` - Forma orgánica estilo 1
- `.blob-shape-2` - Forma orgánica estilo 2
- `.blob-shape-3` - Forma orgánica estilo 3

## ✨ Animaciones

### Animaciones Disponibles

```tsx
// Float suave (arriba y abajo)
<div className="animate-float">Content</div>

// Float grande (más movimiento)
<div className="animate-float-large">Content</div>

// Rotación lenta
<div className="animate-rotate-slow">Content</div>

// Pulse scale
<div className="animate-pulse-scale">Content</div>

// Bounce in (entrada)
<div className="animate-bounce-in">Content</div>
```

## 🎯 Componentes Base

### Card Mejorado

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@workspace/ui/components/card';

<Card className="relative overflow-hidden shadow-lg hover:shadow-xl">
  {/* Blob decorativo */}
  <div className="absolute right-0 top-0 size-32 rounded-full bg-neon-lime opacity-5 blur-3xl" />

  <CardHeader>
    <CardTitle className="font-bold lowercase tracking-tight">
      título de la card
    </CardTitle>
  </CardHeader>

  <CardContent>
    {/* Contenido */}
  </CardContent>
</Card>
```

### Botones Estilizados

```tsx
import { Button } from '@workspace/ui/components/button';

// Botón primario con efecto
<Button
  variant="default"
  size="lg"
  className="rounded-2xl lowercase tracking-tight hover:scale-105"
>
  empieza gratis ahora
  <span className="ml-2 animate-bounce text-neon-lime">→</span>
</Button>

// Botón outline
<Button
  variant="outline"
  className="rounded-2xl border-2 border-primary lowercase hover:bg-primary/10"
>
  solicitar demo
</Button>
```

### Hero Section

```tsx
<section className="relative overflow-hidden bg-primary py-24">
  {/* Decoración de fondo */}
  <div className="absolute left-10 top-10 size-64 rounded-full bg-primary-dark opacity-30 blur-3xl animate-rotate-slow" />
  <div className="absolute right-10 bottom-10 size-80 rounded-full bg-primary-darker opacity-40 blur-3xl animate-float-large" />
  <div className="absolute left-1/4 top-1/4 size-32 blob-shape bg-neon-lime opacity-20 animate-float" />

  <div className="container relative z-10">
    <h1 className="text-6xl font-black lowercase tracking-super-tight text-white">
      <span className="bg-gradient-to-r from-white via-neon-lime to-white bg-clip-text text-transparent">
        título impactante
      </span>
    </h1>

    <p className="mt-4 text-lg text-white/90">
      descripción clara y directa
    </p>

    <Button size="lg" className="mt-8 bg-white text-primary">
      call to action
    </Button>
  </div>
</section>
```

## 🎨 Gradientes Predefinidos

```css
.bg-neon-lime-gradient     /* Lime a Cyan */
.bg-sunny-gradient         /* Yellow a Orange */
.bg-electric-blue-gradient /* Blue a Dark Blue */
```

### Uso de Gradientes

```tsx
// Fondo con gradiente
<div className="bg-neon-lime-gradient p-8 rounded-2xl">
  Content
</div>

// Texto con gradiente
<h2 className="bg-gradient-to-r from-primary via-neon-lime to-primary bg-clip-text text-transparent">
  Texto con gradiente
</h2>
```

## 📐 Layout y Espaciado

### Principios
- **Márgenes generosos**: 80-120px de los bordes para contenido principal
- **Gaps entre elementos**: 40-80px entre grupos visuales
- **Radius aumentados**: rounded-2xl (1rem) para modernidad

### Ejemplo de Sección

```tsx
<section className="relative overflow-hidden py-24">
  {/* Decoraciones */}
  <div className="absolute left-1/4 top-20 size-64 bg-sunny-yellow opacity-10 blur-3xl animate-float-large" />

  {/* Contenido con z-index */}
  <div className="container relative z-10 space-y-12">
    <div className="max-w-2xl mx-auto text-center">
      <h2 className="text-4xl font-black lowercase">título</h2>
      <p className="mt-4">descripción</p>
    </div>

    {/* Grid de contenido */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Cards */}
    </div>
  </div>
</section>
```

## 🎯 Patrones Comunes

### CTA Section

```tsx
<section className="relative overflow-hidden bg-primary py-24">
  <div className="absolute left-10 top-10 size-64 rounded-full bg-primary-dark opacity-30 blur-3xl animate-rotate-slow" />
  <div className="absolute bottom-10 right-10 size-80 rounded-full bg-primary-darker opacity-40 blur-3xl animate-float-large" />

  <div className="container relative z-10 text-center">
    <h3 className="text-5xl font-black lowercase text-white">
      ¿listo para comenzar?
    </h3>
    <p className="mt-4 text-lg text-white/90">
      únete a las empresas que están transformando
    </p>
    <Button size="lg" className="mt-8 bg-white text-primary">
      empieza ahora
    </Button>
  </div>
</section>
```

### Card con Estadísticas

```tsx
<Card className="relative overflow-hidden">
  <div className="absolute right-0 top-0 size-32 rounded-full bg-neon-lime opacity-5 blur-3xl" />

  <CardHeader>
    <CardTitle className="font-bold lowercase">métrica importante</CardTitle>
  </CardHeader>

  <CardContent>
    <div className="text-4xl font-black">
      <span className="bg-gradient-to-r from-primary to-neon-lime bg-clip-text text-transparent">
        1,234
      </span>
    </div>
    <p className="text-sm text-muted-foreground">descripción de la métrica</p>
  </CardContent>
</Card>
```

## 🌟 Best Practices

1. **Contraste**: Siempre usar blanco sobre azul eléctrico, nunca claro sobre claro
2. **Lowercase**: Preferir lowercase en títulos grandes para modernidad
3. **Animaciones sutiles**: Usar float y pulse, no excederse
4. **2-3 colores por composición**: No mezclar todos los acentos
5. **Espacios generosos**: Dejar respirar el contenido
6. **Radius consistentes**: rounded-2xl para elementos principales
7. **Blobs decorativos**: 2-4 por sección, con blur y opacidad baja

## 🎨 Modo Oscuro

El sistema incluye soporte completo para dark mode con fondo azul eléctrico:

```tsx
// Los colores se ajustan automáticamente en dark mode
<div className="bg-background text-foreground">
  {/* Electric blue background en dark mode */}
</div>
```

## 📱 Responsive

Todos los componentes son responsive por defecto. Usa las variantes de Tailwind:

```tsx
<h1 className="text-4xl md:text-5xl lg:text-6xl font-black lowercase">
  título responsive
</h1>
```

## 🚀 Quick Start

1. Los colores ya están configurados en `globals.css`
2. Las animaciones y utilidades están disponibles globalmente
3. Los componentes base (Card, Button) ya están actualizados
4. Usa las clases de ejemplo directamente en tus componentes

## 💡 Ejemplos de Implementación

Ver componentes actualizados:
- `/apps/marketing/components/sections/hero.tsx`
- `/apps/marketing/components/sections/cta.tsx`
- `/apps/marketing/components/sections/pricing-hero.tsx`
- `/apps/dashboard/components/organizations/slug/home/lead-generation-card.tsx`
