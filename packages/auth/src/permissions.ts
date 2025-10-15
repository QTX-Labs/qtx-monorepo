import { NotFoundError } from '@workspace/common/errors';
import { Role } from '@workspace/database';
import { prisma } from '@workspace/database/client';
import { getAuthOrganizationContext } from './context';

export async function isOrganizationOwner(
  userId: string,
  organizationId: string
): Promise<boolean> {
  const membership = await prisma.membership.findFirst({
    where: { userId, organizationId },
    select: { isOwner: true }
  });
  if (!membership) {
    throw new NotFoundError('Membership not found');
  }

  return membership.isOwner;
}

export async function isOrganizationAdmin(
  userId: string,
  organizationId: string
): Promise<boolean> {
  const membership = await prisma.membership.findFirst({
    where: { userId, organizationId },
    select: { role: true }
  });
  if (!membership) {
    throw new NotFoundError('Membership not found');
  }

  return membership.role === Role.ADMIN;
}

export async function isOrganizationMember(
  userId: string,
  organizationId: string
): Promise<boolean> {
  const membership = await prisma.membership.findFirst({
    where: { userId, organizationId },
    select: { role: true }
  });
  if (!membership) {
    throw new NotFoundError('Membership not found');
  }

  return membership.role === Role.MEMBER;
}

/**
 * Verifica si el usuario actual es administrador en la organización activa
 * Usa el contexto de autenticación actual
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  try {
    const { session, organization } = await getAuthOrganizationContext();
    return await isOrganizationAdmin(session.user.id, organization.id);
  } catch (error) {
    console.error('Error checking if current user is admin:', error);
    return false;
  }
}

/**
 * Verifica si el usuario actual es propietario o admin en la organización activa
 */
export async function isCurrentUserAdminOrOwner(): Promise<boolean> {
  try {
    const { session, organization } = await getAuthOrganizationContext();
    const isOwner = await isOrganizationOwner(session.user.id, organization.id);
    const isAdmin = await isOrganizationAdmin(session.user.id, organization.id);
    return isOwner || isAdmin;
  } catch (error) {
    console.error('Error checking if current user is admin or owner:', error);
    return false;
  }
}
