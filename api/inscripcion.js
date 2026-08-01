/* =============================================================================
   /api/inscripcion — avisa al club de una plaza cogida o liberada en una clase.
   ========================================================================== */
import { enviaCorreo, pasaElLimite, ipDe, esc, limpia } from './_correo.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Sólo POST' });
  }

  const ip = ipDe(req);
  if (!pasaElLimite(ip, 20)) {
    return res.status(429).json({ error: 'Demasiadas peticiones seguidas.' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const tipo = body.tipo === 'cancelacion' ? 'cancelacion' : 'inscripcion';
  const d = body.datos || {};

  const nombre = limpia(d.nombre, 120);
  const email = limpia(d.email, 160);
  const clase = limpia(d.clase, 80);
  const centro = limpia(d.centro, 80);
  const fecha = limpia(d.fecha, 10);
  const hora = limpia(d.hora, 5);

  if (!nombre || !email || !clase || !fecha || !hora) {
    return res.status(400).json({ error: 'Faltan datos de la inscripción.' });
  }

  const titulo = tipo === 'cancelacion' ? 'Plaza liberada' : 'Plaza reservada';
  const linea = `${clase} · ${fecha} ${hora} · ${centro}`;

  const r = await enviaCorreo({
    asunto: `${titulo} · ${linea}`,
    texto: `${titulo.toUpperCase()}\n\n${linea}\n\nSocio: ${nombre}\nCorreo: ${email}\n\n—\nIP: ${ip}`,
    html: `<h2 style="font-family:system-ui">${esc(titulo)}</h2>` +
      `<p style="font-family:system-ui;font-size:17px"><b>${esc(linea)}</b></p>` +
      `<p style="font-family:system-ui">Socio: ${esc(nombre)}<br>` +
      `Correo: <a href="mailto:${esc(email)}">${esc(email)}</a></p>`,
    responder: email
  });

  if (!r.ok) return res.status(502).json({ error: 'No se ha podido avisar al club.' });
  return res.status(200).json({ ok: true });
}
