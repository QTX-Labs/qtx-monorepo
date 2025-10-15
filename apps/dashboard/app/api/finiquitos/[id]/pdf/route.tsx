import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';

import { getAuthContext } from '@workspace/auth/context';
import { NotFoundError, ForbiddenError } from '@workspace/common/errors';
import { prisma } from '@workspace/database/client';

import { FiniquitoPDF } from '~/lib/finiquitos/pdf/finiquito-pdf-template';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticación básica
    const { session } = await getAuthContext();

    const { id } = await params;

    // Obtener el finiquito directamente con Prisma
    const finiquito = await prisma.finiquito.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        attachments: true
      }
    });

    if (!finiquito) {
      throw new NotFoundError('Finiquito no encontrado');
    }

    // Verificar que el usuario tenga acceso a la organización del finiquito
    const membership = await prisma.membership.findFirst({
      where: {
        userId: session.user.id,
        organizationId: finiquito.organizationId
      }
    });

    if (!membership) {
      throw new ForbiddenError('No tienes acceso a este finiquito');
    }

    // Generar PDF
    const pdfBuffer = await renderToBuffer(<FiniquitoPDF finiquito={finiquito} />);

    // Retornar PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="finiquito-${finiquito.employeeName.replace(/\s+/g, '-')}-${finiquito.id.slice(0, 8)}.pdf"`
      }
    });
  } catch (error) {
    console.error('Error generando PDF:', error);

    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Error al generar el PDF' },
      { status: 500 }
    );
  }
}
