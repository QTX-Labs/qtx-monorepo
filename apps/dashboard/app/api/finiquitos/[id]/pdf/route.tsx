import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';

import { getAuthOrganizationContext } from '@workspace/auth/context';
import { NotFoundError } from '@workspace/common/errors';

import { getFiniquitoById } from '~/data/finiquitos/get-finiquito-by-id';
import { FiniquitoPDF } from '~/lib/finiquitos/pdf/finiquito-pdf-template';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticación
    await getAuthOrganizationContext();

    const { id } = await params;

    // Obtener el finiquito
    const finiquito = await getFiniquitoById(id);

    if (!finiquito) {
      throw new NotFoundError('Finiquito no encontrado');
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

    return NextResponse.json(
      { error: 'Error al generar el PDF' },
      { status: 500 }
    );
  }
}
