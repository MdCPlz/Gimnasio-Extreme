/* =============================================================================
   /api/reserva — cita previa (visita, prueba, valoración, personal, nutrición).
   El club recibe el aviso del hueco reservado y el visitante su confirmación.
   ========================================================================== */
import { enviaCorreo, pasaElLimite, ipDe, esc, limpia } from './_correo.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Sólo POST' });
  }

  const ip = ipDe(req);
  if (!pasaElLimite(ip, 6)) {
    return res.status(429).json({ error: 'Demasiadas reservas seguidas.' });
  }

  const d = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

  const servicio = limpia(d.servicio, 120);
  const centro = limpia(d.centro, 120);
  const fecha = limpia(d.fecha, 10);
  const hora = limpia(d.hora, 5);
  const nombre = limpia(d.nombre, 120);
  const email = limpia(d.email, 160);
  const telefono = limpia(d.telefono, 40);
  const nota = limpia(d.nota, 2000);

  if (!servicio || !centro || !nombre || !email || !telefono) {
    return res.status(400).json({ error: 'Faltan datos de la reserva.' });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || !/^\d{2}:\d{2}$/.test(hora)) {
    return res.status(400).json({ error: 'La fecha o la hora no son válidas.' });
  }
  /* No aceptamos citas en el pasado ni a más de un año vista */
  const cuando = new Date(`${fecha}T${hora}:00`);
  const ahora = new Date();
  if (isNaN(cuando) || cuando < new Date(ahora.getTime() - 3600e3) ||
      cuando > new Date(ahora.getTime() + 365 * 864e5)) {
    return res.status(400).json({ error: 'Esa fecha no es reservable.' });
  }

  const cabecera = `${servicio} · ${fecha} ${hora} · ${centro}`;
  const texto =
    `HUECO RESERVADO\n\n${cabecera}\n\n` +
    `Nombre: ${nombre}\nTeléfono: ${telefono}\nCorreo: ${email}\n` +
    (nota ? `\nNota del cliente:\n${nota}\n` : '') +
    `\n—\nIP: ${ip}`;

  const html =
    `<h2 style="font-family:system-ui">Hueco reservado</h2>` +
    `<p style="font-family:system-ui;font-size:18px"><b>${esc(cabecera)}</b></p>` +
    `<p style="font-family:system-ui"><b>Nombre:</b> ${esc(nombre)}<br>` +
    `<b>Teléfono:</b> <a href="tel:${esc(telefono)}">${esc(telefono)}</a><br>` +
    `<b>Correo:</b> <a href="mailto:${esc(email)}">${esc(email)}</a></p>` +
    (nota ? `<hr><p style="font-family:system-ui;white-space:pre-wrap">${esc(nota)}</p>` : '');

  const r = await enviaCorreo({
    asunto: `Cita · ${cabecera}`,
    texto, html, responder: email
  });

  if (!r.ok) return res.status(502).json({ error: 'No se ha podido registrar la cita.' });
  return res.status(200).json({ ok: true });
}
