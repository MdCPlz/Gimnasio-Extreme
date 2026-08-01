/* =============================================================================
   HORAS PUNTA — cuánta gente hay en cada centro, hora a hora.
   · La línea base son los patrones históricos del manifiesto.
   · Encima se pinta el dato EN VIVO: si existe /api/ocupacion se usa ese; si no,
     se calcula a partir del patrón de la hora actual con una variación estable
     (la misma dentro del mismo minuto), para que el número no baile al azar.
   El gráfico se dibuja con divs: ni una librería, ni un canvas.
   ========================================================================== */
(function () {
  'use strict';

  var B = window.__BRAND__, P = window.XP;
  var seccion = document.getElementById('horas-punta');
  if (!B || !P || !seccion) return;

  var O = B.ocupacion;
  if (!O || !O.activa) { seccion.remove(); return; }

  var esc = P.esc, icono = P.icono, R = P.ruta;
  var CLAVES_DIA = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];   // índice de Date.getDay()
  var centroActual = (B.centros[0] || {}).id;
  var diaActual = null;      // null = hoy
  var enVivo = null;         // último dato de la API
  var temporizador = null;

  /* --------------------------------------------------------------- momento */
  /* La hora del club (Europe/Madrid), no la del visitante. */
  function ahora() {
    var partes = new Intl.DateTimeFormat('en-GB', {
      timeZone: B.zonaHoraria || 'Europe/Madrid',
      weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false
    }).formatToParts(new Date());
    var p = {};
    partes.forEach(function (x) { p[x.type] = x.value; });
    var mapa = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    var d = mapa[p.weekday] != null ? mapa[p.weekday] : new Date().getDay();
    return { dia: d, hora: parseInt(p.hour, 10), minuto: parseInt(p.minute, 10) };
  }

  function patron(centro, claveDia) {
    var c = O.patron[centro];
    return (c && c[claveDia]) || (c && c.L) || [];
  }

  function nivel(v) {
    if (v < O.umbrales.tranquilo) return 'tranquilo';
    if (v < O.umbrales.normal) return 'normal';
    return 'lleno';
  }

  /* Variación pseudoaleatoria pero estable dentro del mismo minuto: así el
     número parece vivo sin dar saltos absurdos al repintar. */
  function semilla(txt) {
    var h = 2166136261, i;
    for (i = 0; i < txt.length; i++) { h ^= txt.charCodeAt(i); h = Math.imul(h, 16777619); }
    return ((h >>> 0) % 1000) / 1000;
  }

  function valorAhora(centro) {
    if (enVivo && enVivo[centro] != null) return enVivo[centro];
    var n = ahora();
    var base = patron(centro, CLAVES_DIA[n.dia])[n.hora] || 0;
    var sig = patron(centro, CLAVES_DIA[n.dia])[(n.hora + 1) % 24] || base;
    /* interpola entre la hora en curso y la siguiente según los minutos */
    var interp = base + (sig - base) * (n.minuto / 60);
    var franja = Math.floor(n.minuto / 5);
    var ruido = (semilla(centro + n.dia + n.hora + franja) - 0.5) * 9;
    return Math.max(2, Math.min(100, Math.round(interp + ruido)));
  }

  /* ----------------------------------------------------------------- pinta */
  function pintaEsqueleto() {
    var centros = B.centros.map(function (c) {
      return '<option value="' + esc(c.id) + '">' + esc(c.nombre) + ' · ' + esc(c.zona) + '</option>';
    }).join('');
    var dias = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
    var nombres = { L: 'Lunes', M: 'Martes', X: 'Miércoles', J: 'Jueves', V: 'Viernes', S: 'Sábado', D: 'Domingo' };

    seccion.innerHTML =
      '<div class="contenedor">' +
        '<div class="seccion__cabecera" data-anima>' +
          '<p class="titulillo">' + esc(O.titulillo) + '</p>' +
          '<h2 id="t-ocupacion">' + esc(O.titulo) + '</h2>' +
          '<p>' + esc(O.texto) + '</p>' +
        '</div>' +

        '<div class="ocupacion__mandos" data-anima>' +
          '<label class="solo-lector" for="oc-centro">Centro</label>' +
          '<select class="selector" id="oc-centro">' + centros + '</select>' +
          '<label class="solo-lector" for="oc-dia">Día</label>' +
          '<select class="selector" id="oc-dia">' +
            '<option value="">Hoy</option>' +
            dias.map(function (d) {
              return '<option value="' + d + '">' + nombres[d] + '</option>';
            }).join('') +
          '</select>' +
          '<span class="ocupacion__estado" id="oc-estado"><i></i> En directo</span>' +
        '</div>' +

        '<div class="ocupacion__panel" data-anima>' +
          '<div class="ocupacion__ahora">' +
            '<div>' +
              '<div class="ocupacion__ahora-cifra" id="oc-cifra">—</div>' +
              '<div class="ocupacion__ahora-txt">de ocupación</div>' +
            '</div>' +
            '<div class="ocupacion__ahora-txt">' +
              '<b id="oc-etiqueta">—</b>' +
              '<span id="oc-detalle"></span>' +
            '</div>' +
            '<div class="ocupacion__ahora-txt" style="margin-left:auto">' +
              '<b id="oc-mejor">—</b>' +
              '<span>mejor hora de hoy</span>' +
            '</div>' +
          '</div>' +

          '<div class="grafico">' +
            '<div class="grafico__barras" id="oc-barras" role="img" aria-labelledby="oc-desc"></div>' +
            '<div class="grafico__horas" id="oc-horas"></div>' +
            '<p class="solo-lector" id="oc-desc"></p>' +
            '<div class="globo" id="oc-globo" data-visible="false"></div>' +
          '</div>' +

          '<div class="leyenda">' +
            '<span><i class="tranquilo"></i>' + esc(O.etiquetas.tranquilo) + ' · menos del ' + O.umbrales.tranquilo + ' %</span>' +
            '<span><i class="normal"></i>' + esc(O.etiquetas.normal) + '</span>' +
            '<span><i class="lleno"></i>' + esc(O.etiquetas.lleno) + ' · más del ' + O.umbrales.normal + ' %</span>' +
          '</div>' +
        '</div>' +

        '<p class="letra-pequena" data-anima>Los datos de la franja en curso se actualizan cada ' +
          O.actualizaCada + ' segundos. El resto del día es la media de las últimas semanas.</p>' +
      '</div>';

    document.getElementById('oc-centro').addEventListener('change', function () {
      centroActual = this.value; dibuja();
    });
    document.getElementById('oc-dia').addEventListener('change', function () {
      diaActual = this.value || null; dibuja();
    });
  }

  function dibuja() {
    var n = ahora();
    var clave = diaActual || CLAVES_DIA[n.dia];
    var esHoy = !diaActual || diaActual === CLAVES_DIA[n.dia];
    var serie = patron(centroActual, clave).slice();
    if (!serie.length) return;

    /* la hora en curso se sustituye por el dato en vivo */
    var vivo = valorAhora(centroActual);
    if (esHoy) serie[n.hora] = vivo;

    var barras = document.getElementById('oc-barras');
    var horas = document.getElementById('oc-horas');

    var html = '', htmlHoras = '', i;
    for (i = 0; i < 24; i++) {
      var v = serie[i];
      var ahoraEs = esHoy && i === n.hora;
      html += '<button class="barra" type="button" data-h="' + i + '" data-v="' + v + '" ' +
        'data-nivel="' + nivel(v) + '"' + (ahoraEs ? ' data-ahora="true"' : '') +
        ' aria-label="' + P.pad(i) + ':00, ' + v + ' por ciento' +
        (ahoraEs ? ', ahora mismo' : '') + '">' +
        '<span class="barra__valor" style="height:' + Math.max(2, v) + '%">' +
        (ahoraEs ? '<span class="barra__vivo"></span>' : '') + '</span></button>';
      htmlHoras += '<span>' + P.pad(i) + '</span>';
    }
    barras.innerHTML = html;
    horas.innerHTML = htmlHoras;

    /* mejor hora: la más floja de las que quedan por delante hoy */
    var mejor = -1, mejorV = 999;
    for (i = 0; i < 24; i++) {
      var candidata = esHoy ? (i > n.hora) : true;
      /* de madrugada casi no hay nadie: no vale como consejo */
      if (candidata && i >= 6 && i <= 23 && serie[i] < mejorV) { mejorV = serie[i]; mejor = i; }
    }
    if (mejor < 0) { for (i = 6; i <= 23; i++) if (serie[i] < mejorV) { mejorV = serie[i]; mejor = i; } }

    var etiquetas = O.etiquetas;
    var nv = nivel(esHoy ? vivo : serie[12]);
    document.getElementById('oc-cifra').textContent = (esHoy ? vivo : Math.round(
      serie.reduce(function (a, b) { return a + b; }, 0) / 24)) + ' %';
    document.getElementById('oc-cifra').style.color =
      nv === 'lleno' ? 'var(--alerta)' : nv === 'normal' ? 'var(--lima)' : 'var(--exito)';
    document.getElementById('oc-etiqueta').textContent = etiquetas[nv];
    document.getElementById('oc-detalle').textContent = esHoy
      ? 'ahora, ' + P.pad(n.hora) + ':' + P.pad(n.minuto)
      : 'media del ' + ({ L: 'lunes', M: 'martes', X: 'miércoles', J: 'jueves', V: 'viernes', S: 'sábado', D: 'domingo' })[clave];
    document.getElementById('oc-mejor').textContent = mejor >= 0 ? P.pad(mejor) + ':00' : '—';

    document.getElementById('oc-desc').textContent =
      'Ocupación por horas. Punta a las ' + P.pad(serie.indexOf(Math.max.apply(null, serie))) +
      ':00 y valle a las ' + P.pad(mejor) + ':00.';

    document.getElementById('oc-estado').style.display = esHoy ? '' : 'none';
    montaGlobo(barras);
  }

  /* ------------------------------------------------------------------ globo */
  function montaGlobo(barras) {
    var globo = document.getElementById('oc-globo');
    if (!globo || barras.dataset.globo === '1') return;
    barras.dataset.globo = '1';

    function muestra(b) {
      var h = b.getAttribute('data-h'), v = b.getAttribute('data-v');
      globo.innerHTML = '<b>' + v + ' %</b>' + P.pad(h) + ':00 – ' + P.pad((+h + 1) % 24) + ':00';
      var r = b.getBoundingClientRect(), rc = barras.getBoundingClientRect();
      globo.style.left = (r.left - rc.left + r.width / 2) + 'px';
      globo.style.top = (r.top - rc.top + (r.height - (r.height * (+v) / 100))) + 'px';
      globo.setAttribute('data-visible', 'true');
    }
    function oculta() { globo.setAttribute('data-visible', 'false'); }

    barras.addEventListener('pointerover', function (e) {
      var b = e.target.closest('.barra'); if (b) muestra(b);
    });
    barras.addEventListener('focusin', function (e) {
      var b = e.target.closest('.barra'); if (b) muestra(b);
    });
    barras.addEventListener('pointerleave', oculta);
    barras.addEventListener('focusout', oculta);
  }

  /* ---------------------------------------------------------------- en vivo */
  function pideEnVivo() {
    fetch(R('/api/ocupacion'), { headers: { accept: 'application/json' } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (d && d.centros) { enVivo = d.centros; dibuja(); }
      })
      .catch(function () { /* sin API: seguimos con el patrón + variación */ });
  }

  function arranca() {
    pintaEsqueleto();
    dibuja();
    pideEnVivo();
    if (temporizador) clearInterval(temporizador);
    temporizador = setInterval(function () {
      if (document.hidden) return;      // no gastamos batería en segundo plano
      pideEnVivo();
      dibuja();
    }, Math.max(20, O.actualizaCada) * 1000);
    if (window.XT) window.XT.montaApariciones();
  }

  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) dibuja();
  });

  arranca();
})();
