# Plan de Traducción Completa a Español - QTX Monorepo

## 📋 Resumen Ejecutivo

Este documento detalla el plan para traducir completamente la plataforma QTX al español, incluyendo las tres aplicaciones principales (Dashboard, Marketing y API Pública) y todos sus componentes.

## 🎯 Objetivos

1. **Traducción completa** de toda la interfaz de usuario al español
2. **Mantener consistencia** en la terminología y tono a través de toda la plataforma
3. **Implementar i18n** para soportar múltiples idiomas en el futuro
4. **Documentar** el proceso para facilitar futuras traducciones

## 🏗️ Arquitectura de Traducción

### Opción 1: Traducción Directa (Corto plazo)
- Modificar directamente los textos en los componentes
- Rápido de implementar
- Sin overhead de configuración

### Opción 2: Sistema i18n (Recomendado - Largo plazo)
- Implementar `next-intl` o `next-i18next`
- Archivos de traducción JSON separados
- Soporte para múltiples idiomas
- Cambio dinámico de idioma

## 📁 Estructura del Proyecto

### Aplicaciones a Traducir

#### 1. Dashboard (`/apps/dashboard`)
- **Páginas principales**
  - ✅ `/organizations` - Organizaciones (COMPLETADO)
  - ⏳ `/auth/*` - Autenticación
  - ⏳ `/onboarding/*` - Proceso de incorporación
  - ⏳ `/organizations/[slug]/home` - Inicio
  - ⏳ `/organizations/[slug]/contacts` - Contactos
  - ⏳ `/organizations/[slug]/clientes` - Clientes
  - ⏳ `/organizations/[slug]/mis-empresas` - Mis Empresas
  - ⏳ `/organizations/[slug]/settings/*` - Configuración

#### 2. Marketing (`/apps/marketing`)
- **Páginas**
  - ⏳ Página principal
  - ⏳ `/pricing` - Precios
  - ⏳ `/blog` - Blog
  - ⏳ `/docs` - Documentación
  - ⏳ `/careers` - Carreras
  - ⏳ `/contact` - Contacto
  - ⏳ `/story` - Historia
  - ⏳ Políticas legales

#### 3. API Pública (`/apps/public-api`)
- ⏳ Documentación Swagger
- ⏳ Mensajes de error de API

### Paquetes Compartidos (`/packages`)
- ⏳ `@workspace/ui` - Componentes de UI
- ⏳ `@workspace/common` - Utilidades comunes
- ⏳ `@workspace/email` - Plantillas de email
- ⏳ `@workspace/auth` - Mensajes de autenticación

## 📝 Glosario de Términos

### Términos de Negocio
| Inglés | Español |
|--------|---------|
| Organization | Organización |
| Dashboard | Panel de Control |
| Settings | Configuración |
| Members | Miembros |
| Billing | Facturación |
| Subscription | Suscripción |
| Invoice | Factura |
| Contact | Contacto |
| Lead | Prospecto |
| Customer | Cliente |
| Opportunity | Oportunidad |
| Activity | Actividad |
| Task | Tarea |
| Note | Nota |

### Términos de UI
| Inglés | Español |
|--------|---------|
| Sign in | Iniciar sesión |
| Sign out | Cerrar sesión |
| Sign up | Registrarse |
| Submit | Enviar |
| Cancel | Cancelar |
| Save | Guardar |
| Delete | Eliminar |
| Edit | Editar |
| Create | Crear |
| Update | Actualizar |
| Search | Buscar |
| Filter | Filtrar |
| Sort | Ordenar |
| Export | Exportar |
| Import | Importar |
| Download | Descargar |
| Upload | Subir |
| Preview | Vista previa |
| Back | Volver |
| Next | Siguiente |
| Previous | Anterior |
| Loading | Cargando |
| Error | Error |
| Success | Éxito |
| Warning | Advertencia |
| Info | Información |

### Mensajes Comunes
| Inglés | Español |
|--------|---------|
| No results found | No se encontraron resultados |
| Something went wrong | Algo salió mal |
| Please try again | Por favor, intenta de nuevo |
| Required field | Campo obligatorio |
| Invalid email | Email inválido |
| Password too short | Contraseña muy corta |
| Passwords don't match | Las contraseñas no coinciden |
| Account created successfully | Cuenta creada exitosamente |
| Changes saved | Cambios guardados |
| Are you sure? | ¿Estás seguro? |
| This action cannot be undone | Esta acción no se puede deshacer |

## 🚀 Fases de Implementación

### Fase 1: Traducción del Dashboard (Prioridad Alta)
**Duración estimada:** 2-3 días

1. **Autenticación** (`/auth/*`)
   - Sign in/Sign up
   - Recuperación de contraseña
   - Verificación de email
   - Autenticación de dos factores

2. **Onboarding** (`/onboarding/*`)
   - Configuración de usuario
   - Creación de organización

3. **Navegación principal**
   - Menú lateral
   - Breadcrumbs
   - Header/Footer

4. **Home/Dashboard**
   - Widgets y métricas
   - Gráficos y estadísticas

5. **Gestión de Contactos**
   - Lista de contactos
   - Detalle de contacto
   - Formularios CRUD

### Fase 2: Traducción de Configuración (Prioridad Media)
**Duración estimada:** 2 días

1. **Configuración de cuenta**
   - Perfil personal
   - Seguridad
   - Notificaciones

2. **Configuración de organización**
   - Información general
   - Miembros del equipo
   - Facturación
   - Desarrolladores (API Keys, Webhooks)

### Fase 3: Traducción del Sitio de Marketing (Prioridad Media)
**Duración estimada:** 1-2 días

1. Landing page
2. Página de precios
3. Documentación
4. Blog (títulos y navegación)
5. Páginas legales

### Fase 4: Emails y Notificaciones (Prioridad Baja)
**Duración estimada:** 1 día

1. Plantillas de email transaccional
2. Notificaciones del sistema
3. Emails de marketing

### Fase 5: Documentación de API (Prioridad Baja)
**Duración estimada:** 1 día

1. Documentación Swagger
2. Mensajes de error de API
3. Respuestas de validación

## 🛠️ Proceso de Traducción

### Para cada componente:

1. **Identificar textos**
   ```bash
   grep -r "[\"\'].*[A-Za-z].*[\"\']" <archivo>
   ```

2. **Crear lista de traducciones**
   - Documentar texto original
   - Proponer traducción
   - Validar consistencia con glosario

3. **Implementar cambios**
   - Modificar archivos
   - Probar visualmente
   - Verificar responsive

4. **Control de calidad**
   - Revisar ortografía
   - Validar contexto
   - Verificar consistencia

## 📊 Métricas de Progreso

### Estado Actual
- **Total de archivos a traducir:** ~150
- **Archivos completados:** 3
- **Progreso:** 2%

### Componentes por Aplicación
- **Dashboard:** ~100 archivos
- **Marketing:** ~30 archivos
- **Public API:** ~10 archivos
- **Packages compartidos:** ~10 archivos

## 🔧 Herramientas Recomendadas

### Para implementación i18n futura:
1. **next-intl** - Recomendado para Next.js 15
2. **Formato de archivos:** JSON
3. **Estructura:**
   ```
   /locales
     /es
       common.json
       dashboard.json
       auth.json
     /en
       common.json
       dashboard.json
       auth.json
   ```

## ✅ Checklist de Validación

Para cada página traducida, verificar:

- [ ] Todos los textos visibles están en español
- [ ] Los placeholders están traducidos
- [ ] Los mensajes de error están traducidos
- [ ] Los tooltips están traducidos
- [ ] Los textos de accesibilidad (aria-labels) están traducidos
- [ ] La página se ve bien en móvil
- [ ] No hay texto cortado o desbordado
- [ ] Los formularios funcionan correctamente
- [ ] Las validaciones muestran mensajes en español

## 🎯 Siguientes Pasos Inmediatos

1. **Prioridad 1:** Traducir páginas de autenticación (`/auth/*`)
2. **Prioridad 2:** Traducir proceso de onboarding
3. **Prioridad 3:** Traducir navegación principal y dashboard
4. **Prioridad 4:** Implementar sistema i18n para escalabilidad

## 📚 Referencias

- [Next.js Internationalization](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Guía de estilo español](https://www.rae.es/)

## 🤝 Convenciones de Traducción

1. **Usar "tú" en lugar de "usted"** para mantener un tono amigable
2. **Evitar anglicismos** cuando exista una palabra en español
3. **Mantener términos técnicos** cuando sean ampliamente conocidos (ej: Dashboard, API)
4. **Ser consistente** con el género y número gramatical
5. **Priorizar claridad** sobre traducción literal

---

**Última actualización:** 13 de Octubre, 2025
**Estado:** En progreso
**Próxima revisión:** Al completar Fase 1