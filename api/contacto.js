/* =============================================================================
   /api/contacto — recibe el formulario de contacto y avisa al club por correo.
   ========================================================================== */
import { enviaCorreo, pasaElLimite, ipDe, esc, limpia } from './_correo.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Sólo POST' });
  }

  const ip = ipDe(req);
  if (!pasaElLimite(ip)) {
    return res.status(429).json({ error: 'Demasiados envíos seguidos. Prueba en unos minutos.' });
  }

  const d = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

  if (d.web) return res.status(200).json({ ok: true });          // trampa de robots

  const nombre = limpia(d.nombre, 120);
  const email = limpia(d.email, 160);
  const telefono = limpia(d.telefono, 40);
  const asunto = limpia(d.asunto, 120);
  const mensaje = limpia(d.mensaje, 4000);

  if (!nombre || !email || !asunto || mensaje.length < 10) {
    return res.status(400).json({ error: 'Faltan datos obligatorios.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) {
    return res.status(400).json({ error: 'El correo no es válido.' });
  }

  const texto =
    `Nuevo mensaje desde la web\n\n` +
    `Asunto: ${asunto}\n` +
    `Nombre: ${nombre}\n` +
    `Correo: ${email}\n` +
    (telefono ? `Teléfono: ${telefono}\n` : '') +
    `\n${mensaje}\n\n—\nIP: ${ip}`;

  const html =
    `<h2 style="font-family:system-ui">Nuevo mensaje desde la web</h2>` +
    `<p style="font-family:system-ui"><b>Asunto:</b> ${esc(asunto)}<br>` +
    `<b>Nombre:</b> ${esc(nombre)}<br>` +
    `<b>Correo:</b> <a href="mailto:${esc(email)}">${esc(email)}</a><br>` +
    (telefono ? `<b>Teléfono:</b> <a href="tel:${esc(telefono)}">${esc(telefono)}</a><br>` : '') +
    `</p><hr><p style="font-family:system-ui;white-space:pre-wrap">${esc(mensaje)}</p>`;

  const r = await enviaCorreo({
    asunto: `Web · ${asunto} · ${nombre}`,
    texto, html, responder: email
  });

  if (!r.ok) return res.status(502).json({ error: 'No se ha podido enviar.' });
  return res.status(200).json({ ok: true });
}
