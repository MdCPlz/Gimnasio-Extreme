/* =============================================================================
   ENVÍO DE CORREO — utilidad compartida por las funciones de la carpeta /api.
   Usa Resend (https://resend.com) por ser el más simple de configurar, pero
   sólo necesita una petición HTTP: cambiar de proveedor es cambiar esta función.

   LAS CLAVES VAN EN VARIABLES DE ENTORNO, NUNCA EN EL REPOSITORIO:
     RESEND_API_KEY   clave del proveedor de correo
     CORREO_DESTINO   a dónde llegan los avisos del club
     CORREO_ORIGEN    remitente verificado en el proveedor
   Ver .env.example y README.md.
   ========================================================================== */

export async function enviaCorreo({ asunto, texto, html, responder }) {
  const clave = process.env.RESEND_API_KEY;
  const destino = process.env.CORREO_DESTINO;
  const origen = process.env.CORREO_ORIGEN || 'Web Xtreme <web@gimnasiosxtreme.es>';

  if (!clave || !destino) {
    /* Sin configurar: lo decimos claro en el log del servidor y devolvemos error
       para que el navegador ofrezca al visitante la alternativa por correo. */
    console.error('[correo] Falta RESEND_API_KEY o CORREO_DESTINO en las variables de entorno.');
    return { ok: false, motivo: 'sin-configurar' };
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${clave}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      from: origen,
      to: destino.split(',').map((x) => x.trim()).filter(Boolean),
      subject: asunto,
      text: texto,
      html: html || undefined,
      reply_to: responder || undefined
    })
  });

  if (!res.ok) {
    console.error('[correo] El proveedor respondió', res.status, await res.text());
    return { ok: false, motivo: 'proveedor' };
  }
  return { ok: true };
}

/* Nadie debería poder disparar cientos de correos desde el formulario. Es un
   límite en memoria: sencillo, suficiente para un sitio de este tamaño y sin
   depender de ninguna base de datos. */
const visitas = new Map();

export function pasaElLimite(ip, maximo = 5, ventanaMs = 10 * 60 * 1000) {
  const ahora = Date.now();
  const previas = (visitas.get(ip) || []).filter((t) => ahora - t < ventanaMs);
  if (previas.length >= maximo) return false;
  previas.push(ahora);
  visitas.set(ip, previas);
  /* limpieza perezosa para que el mapa no crezca sin fin */
  if (visitas.size > 500) {
    for (const [k, v] of visitas) {
      if (!v.some((t) => ahora - t < ventanaMs)) visitas.delete(k);
    }
  }
  return true;
}

export function ipDe(req) {
  const h = req.headers || {};
  return (h['x-forwarded-for'] || '').split(',')[0].trim() || h['x-real-ip'] || 'desconocida';
}

/** Escapa para meter texto de usuario dentro del HTML del correo. */
export function esc(v) {
  return String(v == null ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Corta cadenas larguísimas antes de meterlas en un correo. */
export function limpia(v, max = 2000) {
  return String(v == null ? '' : v).trim().slice(0, max);
}
