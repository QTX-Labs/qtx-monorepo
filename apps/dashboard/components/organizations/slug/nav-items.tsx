import {
  BellIcon,
  BuildingIcon,
  CodeIcon,
  CreditCardIcon,
  FileTextIcon,
  HomeIcon,
  LockKeyholeIcon,
  SettingsIcon,
  StoreIcon,
  UserIcon,
  UserPlus2Icon,
  UsersIcon
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { replaceOrgSlug, routes } from '@workspace/routes';

type NavItem = {
  title: string;
  href: string;
  disabled?: boolean;
  external?: boolean;
  icon: LucideIcon;
};

export function createMainNavItems(slug: string): NavItem[] {
  return [
    {
      title: 'Inicio',
      href: replaceOrgSlug(routes.dashboard.organizations.slug.Home, slug),
      icon: HomeIcon
    },
    {
      title: 'Clientes',
      href: replaceOrgSlug(routes.dashboard.organizations.slug.Clientes, slug),
      icon: UsersIcon
    },
    {
      title: 'Mis Empresas',
      href: replaceOrgSlug(routes.dashboard.organizations.slug.MisEmpresas, slug),
      icon: BuildingIcon
    },
    {
      title: 'Finiquitos',
      href: replaceOrgSlug(routes.dashboard.organizations.slug.Finiquitos, slug),
      icon: FileTextIcon
    },
    {
      title: 'Contactos',
      href: replaceOrgSlug(routes.dashboard.organizations.slug.Contacts, slug),
      icon: UsersIcon
    },
    {
      title: 'Configuración',
      href: replaceOrgSlug(
        routes.dashboard.organizations.slug.settings.Index,
        slug
      ),
      icon: SettingsIcon
    }
  ];
}

export function createAccountNavItems(slug: string): NavItem[] {
  return [
    {
      title: 'Perfil',
      href: replaceOrgSlug(
        routes.dashboard.organizations.slug.settings.account.Profile,
        slug
      ),
      icon: UserIcon
    },
    {
      title: 'Seguridad',
      href: replaceOrgSlug(
        routes.dashboard.organizations.slug.settings.account.Security,
        slug
      ),
      icon: LockKeyholeIcon
    },
    {
      title: 'Notificaciones',
      href: replaceOrgSlug(
        routes.dashboard.organizations.slug.settings.account.Notifications,
        slug
      ),
      icon: BellIcon
    }
  ];
}

export function createOrganizationNavItems(slug: string): NavItem[] {
  return [
    {
      title: 'General',
      href: replaceOrgSlug(
        routes.dashboard.organizations.slug.settings.organization.General,
        slug
      ),
      icon: StoreIcon
    },
    {
      title: 'Miembros',
      href: replaceOrgSlug(
        routes.dashboard.organizations.slug.settings.organization.Members,
        slug
      ),
      icon: UserPlus2Icon
    },
    {
      title: 'Facturación',
      href: replaceOrgSlug(
        routes.dashboard.organizations.slug.settings.organization.Billing,
        slug
      ),
      icon: CreditCardIcon
    },
    {
      title: 'Desarrolladores',
      href: replaceOrgSlug(
        routes.dashboard.organizations.slug.settings.organization.Developers,
        slug
      ),
      icon: CodeIcon
    }
  ];
}
