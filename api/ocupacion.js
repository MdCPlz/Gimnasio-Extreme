/* =============================================================================
   /api/ocupacion — ocupación en vivo de cada centro, para el gráfico de horas
   punta. Devuelve un porcentaje (0-100) por centro.
   -----------------------------------------------------------------------------
   CÓMO CONECTARLO CON LOS DATOS REALES DEL CLUB
   El gráfico funciona sin esta función: el navegador usa el patrón histórico
   del manifiesto. Cuando el club pueda dar el dato de los tornos, hay dos vías:

   1) La forma fácil: que su sistema publique un JSON en una URL y se pone esa
      URL en la variable de entorno OCUPACION_URL. Formato esperado:
         { "xtreme-1": 62, "xtreme-2": 40, "xtreme-3": 51 }
      (también vale { "centros": { ... } })

   2) La forma directa: sustituir `leeDelClub()` por la consulta a su base de
      datos o a la API de Provis, y devolver el mismo objeto.

   Sin nada configurado devuelve 204 y el navegador sigue con su estimación.
   ========================================================================== */

let cache = { t: 0, datos: null };
const VENTANA = 60 * 1000;   // un minuto: es un dato en vivo, no conviene más

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Sólo GET' });
  }

  res.setHeader('cache-control', 'public, s-maxage=60, stale-while-revalidate=120');

  if (cache.datos && Date.now() - cache.t < VENTANA) {
    return res.status(200).json(cache.datos);
  }

  const datos = await leeDelClub();
  if (!datos) return res.status(204).end();

  const salida = { centros: datos, actualizado: new Date().toISOString() };
  cache = { t: Date.now(), datos: salida };
  return res.status(200).json(salida);
}

async function leeDelClub() {
  const url = process.env.OCUPACION_URL;
  if (!url) return null;

  try {
    const r = await fetch(url, {
      headers: process.env.OCUPACION_TOKEN
        ? { authorization: `Bearer ${process.env.OCUPACION_TOKEN}` }
        : {}
    });
    if (!r.ok) throw new Error('El sistema del club respondió ' + r.status);
    const d = await r.json();
    const bruto = d.centros || d;

    /* Sólo dejamos pasar números entre 0 y 100: si el sistema manda cualquier
       otra cosa, mejor no pintar nada que pintar un disparate. */
    const limpio = {};
    for (const [id, v] of Object.entries(bruto)) {
      const n = Number(v);
      if (Number.isFinite(n)) limpio[id] = Math.max(0, Math.min(100, Math.round(n)));
    }
    return Object.keys(limpio).length ? limpio : null;
  } catch (e) {
    console.error('[ocupacion]', e.message);
    return null;
  }
}
