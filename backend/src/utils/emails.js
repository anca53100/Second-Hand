const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

export function passwordResetEmail({ name, link, minutes }) {
  const firstName = String(name).trim().split(/\s+/)[0] || 'hola';
  const subject = 'Restablece tu contraseña de Second Hand';

  const text = [
    `Hola, ${firstName}:`,
    '',
    'Recibimos una solicitud para restablecer la contraseña de tu cuenta de Second Hand.',
    `Abre este enlace para elegir una nueva. Vence en ${minutes} minutos y solo se puede usar una vez:`,
    '',
    link,
    '',
    'Si no la pediste, ignora este correo: tu contraseña sigue igual.',
  ].join('\n');

  const html = `<!doctype html>
<html lang="es">
  <body style="margin:0;padding:24px;background:#f4f5f1;font-family:Arial,Helvetica,sans-serif;color:#1d3d32;">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px;">
      <p style="margin:0 0 24px;font-size:20px;font-weight:bold;color:#2f5d4f;">Second Hand</p>
      <p style="margin:0 0 16px;font-size:16px;">Hola, ${escapeHtml(firstName)}:</p>
      <p style="margin:0 0 24px;font-size:16px;line-height:1.5;">
        Recibimos una solicitud para restablecer la contraseña de tu cuenta. Pulsa el botón para elegir una nueva.
      </p>
      <p style="margin:0 0 24px;">
        <a href="${escapeHtml(link)}" style="display:inline-block;background:#2f5d4f;color:#ffffff;text-decoration:none;font-weight:bold;font-size:16px;padding:14px 24px;border-radius:10px;">Restablecer contraseña</a>
      </p>
      <p style="margin:0 0 16px;font-size:14px;line-height:1.5;color:#4a5a52;">
        El enlace vence en ${minutes} minutos y solo se puede usar una vez. Si el botón no funciona, copia esta dirección en tu navegador:<br>
        <span style="word-break:break-all;">${escapeHtml(link)}</span>
      </p>
      <p style="margin:0;font-size:14px;line-height:1.5;color:#4a5a52;">Si no la pediste, ignora este correo: tu contraseña sigue igual.</p>
    </div>
  </body>
</html>`;

  return { subject, text, html };
}
