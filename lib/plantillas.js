/* =============================================================================
   PLANTILLAS — utilidades compartidas: escapado, iconos, formatos y fechas.
   No contiene ni un dato del negocio: todo eso vive en lib/manifest.js.
   Expone window.XP.
   ========================================================================== */
(function () {
  'use strict';

  var B = window.__BRAND__ || {};

  /* ------------------------------------------------------------------ rutas */
  /* Todas las rutas del sitio son RELATIVAS a la raíz del proyecto. Así la web
     funciona igual abierta con doble clic (file://), subida por FTP a una
     subcarpeta o publicada en la raíz del dominio.
     Cada página declara su profundidad en <html data-raiz="."> (raíz) o
     <html data-raiz=".."> (páginas dentro de legal/). */
  var RAIZ = (document.documentElement.getAttribute('data-raiz') || '.').replace(/\/$/, '');

  function ruta(p) {
    if (!p) return '';
    if (/^(https?:|mailto:|tel:|#|data:)/i.test(p)) return p;
    return RAIZ + '/' + String(p).replace(/^\.?\//, '');
  }

  /* --------------------------------------------------------------- escapar */
  var MAPA = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  function esc(v) {
    if (v == null) return '';
    return String(v).replace(/[&<>"']/g, function (c) { return MAPA[c]; });
  }
  /* Para atributos que van dentro de comillas simples en JS inline */
  function escAtr(v) { return esc(v).replace(/\n/g, ' '); }

  /* --------------------------------------------------------------- iconos */
  /* Trazo de 1,6 px, esquinas redondeadas: el mismo dibujo en todo el sitio. */
  var TRAZOS = {
    telefono:  '<path d="M4.5 3h3l1.5 4-2 1.4a11 11 0 0 0 4.6 4.6L13 11l4 1.5v3a1.5 1.5 0 0 1-1.7 1.5A13.5 13.5 0 0 1 3 4.7 1.5 1.5 0 0 1 4.5 3Z"/>',
    correo:    '<rect x="2.5" y="4.5" width="15" height="11" rx="1.5"/><path d="m3 5.5 7 5 7-5"/>',
    pin:       '<path d="M10 17.5s6-5.2 6-9.3A6 6 0 0 0 4 8.2c0 4.1 6 9.3 6 9.3Z"/><circle cx="10" cy="8" r="2.2"/>',
    reloj:     '<circle cx="10" cy="10" r="7.5"/><path d="M10 5.5V10l3 1.8"/>',
    calendario:'<rect x="2.8" y="4" width="14.4" height="13" rx="1.6"/><path d="M2.8 8h14.4M6.5 2.5v3M13.5 2.5v3"/>',
    fuego:     '<path d="M10 17.5c2.9 0 5-2 5-4.7 0-3.4-3.2-4.6-2.5-8.3-2 .6-3.4 2.2-3.4 4 0 .9-.6 1.3-1.1.9-.7-.5-1-1.4-1-2.3C5.7 8.4 5 10.2 5 12.3c0 3 2.2 5.2 5 5.2Z"/>',
    persona:   '<circle cx="10" cy="6.8" r="3.2"/><path d="M3.8 17c.6-3.3 3.1-5 6.2-5s5.6 1.7 6.2 5"/>',
    lupa:      '<circle cx="8.8" cy="8.8" r="5.5"/><path d="m13 13 4 4"/>',
    ampliar:   '<path d="M12 3h5v5M8 17H3v-5M17 3l-6 6M3 17l6-6"/>',
    cerrar:    '<path d="m5 5 10 10M15 5 5 15"/>',
    flecha:    '<path d="M4 10h11M11 6l4 4-4 4"/>',
    izquierda: '<path d="M16 10H5M9 6l-4 4 4 4"/>',
    derecha:   '<path d="M4 10h11M11 6l4 4-4 4"/>',
    arriba:    '<path d="M10 16V5M6 9l4-4 4 4"/>',
    estrella:  '<path d="m10 2.6 2.3 4.7 5.2.8-3.8 3.6.9 5.1-4.6-2.4-4.6 2.4.9-5.1L2.5 8.1l5.2-.8Z" fill="currentColor" stroke="none"/>',
    media:     '<defs><linearGradient id="me"><stop offset="50%" stop-color="currentColor"/><stop offset="50%" stop-color="transparent"/></linearGradient></defs><path d="m10 2.6 2.3 4.7 5.2.8-3.8 3.6.9 5.1-4.6-2.4-4.6 2.4.9-5.1L2.5 8.1l5.2-.8Z" fill="url(#me)" stroke="currentColor" stroke-width="1.1"/>',
    vacia:     '<path d="m10 2.6 2.3 4.7 5.2.8-3.8 3.6.9 5.1-4.6-2.4-4.6 2.4.9-5.1L2.5 8.1l5.2-.8Z" fill="none" stroke="currentColor" stroke-width="1.1"/>',
    llave:     '<circle cx="6.5" cy="13.5" r="3"/><path d="m8.7 11.3 7-7M13.5 6.5l2 2M11.8 8.2l2 2"/>',
    vapor:     '<path d="M6 14c0-2 2-2.6 2-4.4C8 8 6.8 7 6.8 5.5M10 14c0-2 2-2.6 2-4.4 0-1.6-1.2-2.6-1.2-4.1M14 14c0-2 2-2.6 2-4.4"/><path d="M3 17h14"/>',
    pantalla:  '<rect x="2.5" y="3.5" width="15" height="10" rx="1.5"/><path d="M7 17h6M10 13.5V17"/>',
    manzana:   '<path d="M10 6.5c-1-1.6-3-2.2-4.4-1.1C4 6.6 4 9.4 5.3 12c1 2 2.5 3.6 4.7 3.6s3.7-1.6 4.7-3.6c1.3-2.6 1.3-5.4-.3-6.6-1.4-1.1-3.4-.5-4.4 1.1Z"/><path d="M10 6.5V4.4c0-.9.8-1.7 1.8-1.9"/>',
    pesa:      '<path d="M3 8v4M5.5 6v8M14.5 6v8M17 8v4M5.5 10h9"/>',
    corazon:   '<path d="M10 16.2S3.5 12.4 3.5 7.9A3.4 3.4 0 0 1 10 6.3a3.4 3.4 0 0 1 6.5 1.6c0 4.5-6.5 8.3-6.5 8.3Z"/>',
    aviso:     '<circle cx="10" cy="10" r="7.5"/><path d="M10 6v4.5M10 13.4v.1"/>',
    ok:        '<circle cx="10" cy="10" r="7.5"/><path d="m6.5 10.2 2.4 2.4 4.6-4.9"/>',
    info:      '<circle cx="10" cy="10" r="7.5"/><path d="M10 9v5M10 6.4v.1"/>',
    candado:   '<rect x="4" y="8.5" width="12" height="8.5" rx="1.6"/><path d="M6.8 8.5V6.4a3.2 3.2 0 0 1 6.4 0v2.1"/>',
    salir:     '<path d="M12 14v2.5A1.5 1.5 0 0 1 10.5 18h-6A1.5 1.5 0 0 1 3 16.5v-13A1.5 1.5 0 0 1 4.5 2h6A1.5 1.5 0 0 1 12 3.5V6"/><path d="M8 10h9M14 7l3 3-3 3"/>',
    guardar:   '<path d="M10 3v9M6.5 8.5 10 12l3.5-3.5"/><path d="M3.5 13v2.5A1.5 1.5 0 0 0 5 17h10a1.5 1.5 0 0 0 1.5-1.5V13"/>',
    github:    '<path d="M10 1.6a8.4 8.4 0 0 0-2.7 16.4c.4.1.6-.2.6-.4v-1.5c-2.3.5-2.8-1.1-2.8-1.1-.4-1-.9-1.2-.9-1.2-.8-.5 0-.5 0-.5.8.1 1.3.9 1.3.9.7 1.3 2 .9 2.5.7.1-.6.3-.9.6-1.1-1.9-.2-3.8-.9-3.8-4.1 0-.9.3-1.6.8-2.2 0-.2-.3-1 .1-2.1 0 0 .7-.2 2.2.8a7.6 7.6 0 0 1 4 0c1.5-1 2.2-.8 2.2-.8.4 1.1.2 1.9.1 2.1.5.6.8 1.3.8 2.2 0 3.2-1.9 3.9-3.8 4.1.3.3.6.8.6 1.6v2.4c0 .2.2.5.6.4A8.4 8.4 0 0 0 10 1.6Z" fill="currentColor" stroke="none"/>',
    instagram: '<rect x="3" y="3" width="14" height="14" rx="4"/><circle cx="10" cy="10" r="3.4"/><circle cx="14.3" cy="5.8" r="1" fill="currentColor" stroke="none"/>',
    facebook:  '<path d="M11.5 18v-7h2.3l.4-2.7h-2.7V6.6c0-.8.2-1.3 1.3-1.3h1.5V2.9c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.1H6v2.7h2.4v7h3.1Z" fill="currentColor" stroke="none"/>',
    whatsapp:  '<path d="M3 17l1-3.4A6.9 6.9 0 1 1 6.6 16L3 17Z"/><path d="M7.6 7.4c.2-.4.4-.4.6-.4h.5c.2 0 .4 0 .6.5l.6 1.5c0 .2 0 .4-.1.5l-.4.5c-.1.2-.2.3 0 .6a6 6 0 0 0 2.5 2.1c.3.1.4 0 .6-.1l.6-.7c.2-.2.3-.1.5 0l1.4.7c.2.1.3.2.3.3v.6c-.1.4-.6.9-1 1-1.7.3-4-1-5.5-3.4-.6-1-.9-2.1-1-3 0-.4.2-.7.4-.7Z" fill="currentColor" stroke="none"/>',
    mapa:      '<path d="M2.5 5.4 7 3.5l6 2.2 4.5-1.9v10.8L13 16.5l-6-2.2-4.5 1.9V5.4Z"/><path d="M7 3.5v10.8M13 6v10.5"/>',
    grafico:   '<path d="M3 17h14"/><path d="M6 17V9.5M10 17V4.5M14 17v-5"/>',
    tarjeta:   '<rect x="2.5" y="4.5" width="15" height="11" rx="1.8"/><path d="M2.5 8.5h15M5.5 12.5h3"/>',
    etiqueta:  '<path d="m9.4 2.8 7.8 7.8-6.6 6.6-7.8-7.8V2.8Z"/><circle cx="6.4" cy="6.4" r="1.2"/>'
  };

  function icono(nombre, tam) {
    var d = TRAZOS[nombre];
    if (!d) return '';
    var s = tam || 20;
    return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 20 20" fill="none" ' +
      'stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" ' +
      'aria-hidden="true" focusable="false">' + d + '</svg>';
  }

  /* --------------------------------------------------------------- estrellas */
  function estrellas(nota, tam) {
    var html = '', i, llenas = Math.floor(nota), media = nota - llenas >= 0.25 && nota - llenas < 0.75;
    var redondeoArriba = nota - llenas >= 0.75;
    if (redondeoArriba) llenas += 1;
    for (i = 0; i < 5; i++) {
      if (i < llenas) html += icono('estrella', tam || 16);
      else if (i === llenas && media) html += icono('media', tam || 16);
      else html += icono('vacia', tam || 16);
    }
    return '<span class="estrellas" role="img" aria-label="' +
      esc(nota.toFixed(1).replace('.', ',')) + ' sobre 5">' + html + '</span>';
  }

  /* ---------------------------------------------------------------- formato */
  var fmtEuro = new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  var fmtEnteroOEuro = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 });

  function euros(n) {
    if (n == null) return '';
    return (Math.round(n * 100) % 100 === 0 ? fmtEnteroOEuro.format(n) : fmtEuro.format(n)) + ' €';
  }
  /* `useGrouping: always` porque, por defecto, es-ES no separa los millares en
     los números de cuatro cifras: escribiría «3800» donde el resto del sitio
     dice «3.800». Los años nunca pasan por aquí. */
  var fmtNumero = new Intl.NumberFormat('es-ES', { useGrouping: 'always' });
  function numero(n) {
    try { return fmtNumero.format(n); }
    catch (e) { return new Intl.NumberFormat('es-ES').format(n); }
  }

  function descuento(precio, antes) {
    if (!antes || !precio || antes <= precio) return 0;
    return Math.round((1 - precio / antes) * 100);
  }

  function minutos(m) {
    if (!m) return '';
    if (m < 60) return m + ' min';
    var h = Math.floor(m / 60), r = m % 60;
    return r ? h + ' h ' + r + ' min' : h + ' h';
  }

  /* ------------------------------------------------------------------ fechas */
  var DIAS_CORTOS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  var DIAS_LARGOS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
    'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

  function iso(f) {
    return f.getFullYear() + '-' + pad(f.getMonth() + 1) + '-' + pad(f.getDate());
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function deIso(s) {
    var p = String(s).split('-');
    return new Date(+p[0], +p[1] - 1, +p[2]);
  }
  /* Mayúscula sólo en la primera letra: 'lunes, 3 de agosto' → 'Lunes, 3 de
     agosto'. CSS con `capitalize` pondría también 'De Agosto'. */
  function mayus(s) {
    s = String(s || '');
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function fechaLarga(f) {
    return DIAS_LARGOS[f.getDay()] + ', ' + f.getDate() + ' de ' + MESES[f.getMonth()];
  }
  function fechaCorta(f) {
    return f.getDate() + ' ' + MESES_CORTOS[f.getMonth()];
  }
  /* lunes = 1 … domingo = 7, como en el manifiesto */
  function diaSemana(f) { return f.getDay() === 0 ? 7 : f.getDay(); }

  /* ---------------------------------------------------------------- buscar */
  function normaliza(s) {
    return String(s || '').toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  /* -------------------------------------------------------------- catálogo */
  function claseDe(id) {
    var c = (B.clases || []).filter(function (x) { return x.id === id; });
    return c[0] || null;
  }
  function centroDe(id) {
    var c = (B.centros || []).filter(function (x) { return x.id === id; });
    return c[0] || null;
  }
  function categoriaDe(id) {
    var c = (B.categoriasClases || []).filter(function (x) { return x.id === id; });
    return c[0] || null;
  }

  /* ------------------------------------------------------------ imagen <picture> */
  /* WebP con respaldo JPG. Si la foto no existe, el navegador se queda con el JPG;
     si tampoco, `onerror` deja el hueco con el color de fondo, sin icono roto. */
  function foto(o) {
    var w = o.ancho ? ' width="' + o.ancho + '"' : '';
    var h = o.alto ? ' height="' + o.alto + '"' : '';
    var carga = o.prioridad ? ' fetchpriority="high"' : ' loading="lazy" decoding="async"';
    var sizes = o.sizes ? ' sizes="' + esc(o.sizes) + '"' : '';
    return '<picture>' +
      (o.webp ? '<source srcset="' + esc(ruta(o.webp)) + '" type="image/webp"' + sizes + '>' : '') +
      '<img src="' + esc(ruta(o.jpg || o.webp)) + '" alt="' + esc(o.alt || '') + '"' + w + h + carga + sizes +
      ' onerror="this.style.visibility=\'hidden\'">' +
      '</picture>';
  }

  /* ----------------------------------------------------------- almacenamiento */
  /* localStorage envuelto: en navegación privada puede lanzar excepción. */
  var almacen = {
    lee: function (clave, pordefecto) {
      try {
        var v = window.localStorage.getItem(clave);
        return v == null ? pordefecto : JSON.parse(v);
      } catch (e) { return pordefecto; }
    },
    guarda: function (clave, valor) {
      try { window.localStorage.setItem(clave, JSON.stringify(valor)); return true; }
      catch (e) { return false; }
    },
    borra: function (clave) {
      try { window.localStorage.removeItem(clave); } catch (e) { /* nada */ }
    }
  };

  window.XP = {
    ruta: ruta, esc: esc, escAtr: escAtr, icono: icono, estrellas: estrellas,
    euros: euros, numero: numero, descuento: descuento, minutos: minutos,
    mayus: mayus, iso: iso, deIso: deIso, pad: pad, fechaLarga: fechaLarga, fechaCorta: fechaCorta,
    diaSemana: diaSemana, DIAS_CORTOS: DIAS_CORTOS, DIAS_LARGOS: DIAS_LARGOS, MESES: MESES,
    normaliza: normaliza, claseDe: claseDe, centroDe: centroDe, categoriaDe: categoriaDe,
    foto: foto, almacen: almacen
  };
})();
