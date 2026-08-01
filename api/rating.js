/* =============================================================================
   /api/rating — nota y número de reseñas de Google, con caché.
   -----------------------------------------------------------------------------
   La clave de Google va SÓLO en variables de entorno:
     GOOGLE_MAPS_API_KEY   clave de la Places API
     GOOGLE_PLACE_ID       ficha del negocio (la del centro principal)
   Si no están puestas, devuelve el valor de respaldo y la web ni se entera:
   en el navegador ya está pintada la nota del manifiesto.
   ========================================================================== */

/* Caché en memoria de la propia función: mientras el proceso viva, no volvemos
   a preguntarle a Google. Doce horas es de sobra para una nota que se mueve
   una décima al mes. */
let cache = { t: 0, datos: null };
const HORAS = 12 * 60 * 60 * 1000;

const RESPALDO = { rating: 4.5, total: 101, fuente: 'respaldo' };

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Sólo GET' });
  }

  /* Que la CDN también lo guarde: menos llamadas y respuesta instantánea. */
  res.setHeader('cache-control', 'public, s-maxage=43200, stale-while-revalidate=86400');

  if (cache.datos && Date.now() - cache.t < HORAS) {
    return res.status(200).json(cache.datos);
  }

  const clave = process.env.GOOGLE_MAPS_API_KEY;
  const place = process.env.GOOGLE_PLACE_ID;

  if (!clave || !place) {
    return res.status(200).json(RESPALDO);
  }

  try {
    const url = 'https://places.googleapis.com/v1/places/' + encodeURIComponent(place) +
      '?languageCode=es';
    const r = await fetch(url, {
      headers: {
        'X-Goog-Api-Key': clave,
        'X-Goog-FieldMask': 'rating,userRatingCount'
      }
    });
    if (!r.ok) throw new Error('Google respondió ' + r.status);
    const d = await r.json();
    if (typeof d.rating !== 'number') throw new Error('Sin nota en la respuesta');

    const datos = {
      rating: Math.round(d.rating * 10) / 10,
      total: d.userRatingCount || RESPALDO.total,
      fuente: 'google',
      actualizado: new Date().toISOString()
    };
    cache = { t: Date.now(), datos };
    return res.status(200).json(datos);
  } catch (e) {
    console.error('[rating]', e.message);
    /* Si teníamos algo viejo, mejor eso que nada */
    return res.status(200).json(cache.datos || RESPALDO);
  }
}
