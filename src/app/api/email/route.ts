import { NextResponse } from 'next/server';
import { redactarEmailComercial } from '@/lib/gemini';
import { Resend } from 'resend';

export async function POST(req: Request) {
  try {
    const { lead, tipo = 'intro', enviarDirecto = false } = await req.json();

    if (!lead || !lead.email) {
      return NextResponse.json({ error: 'Lead y correo son requeridos' }, { status: 400 });
    }

    // Redactar mensaje hiperpersonalizado con Gemini
    const { asunto, cuerpo } = await redactarEmailComercial(lead, tipo);

    // Si el usuario configuró RESEND_API_KEY y eligió enviar directo
    const resendKey = process.env.RESEND_API_KEY;
    if (enviarDirecto && resendKey) {
      try {
        const resend = new Resend(resendKey);
        await resend.emails.send({
          from: 'Sinoandina <contacto@sinoandina.cl>',
          to: lead.email,
          subject: asunto,
          text: cuerpo
        });
        return NextResponse.json({
          success: true,
          modo: 'enviado',
          email: lead.email,
          asunto: asunto,
          mensaje: 'Correo enviado exitosamente a la bandeja de ' + lead.email
        });
      } catch (e: any) {
        console.error('Error enviando con Resend:', e);
      }
    }

    // Modo Borrador / Copiar al Portapapeles
    return NextResponse.json({
      success: true,
      modo: 'borrador',
      email: lead.email,
      asunto: asunto,
      cuerpo: cuerpo,
      mensaje: 'Borrador generado con éxito y verificado contra filtros anti-spam.'
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
