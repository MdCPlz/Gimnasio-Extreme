/* =============================================================================
   PÁGINA DE CLASES — catálogo con buscador y filtros por categoría.
   El estado va en la URL (?q=&cat=) para que se pueda compartir un filtro.
   ========================================================================== */
(function () {
  'use strict';

  var B = window.__BRAND__, P = window.XP, C = window.XC, T = window.XT;
  var mandos = document.querySelector('[data-clases-mandos]');
  var lista = document.getElementById('lista-clases');
  var vacio = document.getElementById('sin-clases');
  if (!B || !P || !C || !lista) return;

  var esc = P.esc, icono = P.icono;
  var params = new URLSearchParams(location.search);
  var estado = { q: params.get('q') || '', cat: params.get('cat') || 'todas' };

  /* Índice de búsqueda: nombre, resumen, texto, categoría y nivel. */
  var indice = B.clases.map(function (c) {
    var cat = P.categoriaDe(c.categoria);
    return {
      c: c,
      texto: P.normaliza([c.nombre, c.resumen, c.texto, c.nivel, cat ? cat.nombre : ''].join(' '))
    };
  });

  mandos.innerHTML =
    '<div class="buscador" data-anima>' +
      '<label class="solo-lector" for="buscar-clase">Buscar una clase</label>' +
      icono('lupa', 18) +
      '<input type="search" id="buscar-clase" placeholder="Buscar: pump, ciclo, espalda…" ' +
        'value="' + esc(estado.q) + '" autocomplete="off">' +
      '<button class="buscador__limpiar" type="button" aria-label="Borrar la búsqueda"' +
        (estado.q ? '' : ' hidden') + '>' + icono('cerrar', 16) + '</button>' +
    '</div>' +
    '<div class="filtros" role="group" aria-label="Filtrar por tipo de clase" data-anima>' +
      '<button class="filtro" type="button" data-cat="todas" aria-pressed="' +
        (estado.cat === 'todas') + '">Todas <span aria-hidden="true">(' + B.clases.length + ')</span></button>' +
      B.categoriasClases.map(function (k) {
        var n = B.clases.filter(function (c) { return c.categoria === k.id; }).length;
        return '<button class="filtro" type="button" data-cat="' + esc(k.id) + '" aria-pressed="' +
          (estado.cat === k.id) + '">' + esc(k.nombre) + ' <span aria-hidden="true">(' + n + ')</span></button>';
      }).join('') +
    '</div>' +
    '<p class="solo-lector" role="status" aria-live="polite" id="conteo-clases"></p>';

  var entrada = document.getElementById('buscar-clase');
  var limpiar = mandos.querySelector('.buscador__limpiar');

  function pinta() {
    var q = P.normaliza(estado.q);
    var res = indice.filter(function (x) {
      if (estado.cat !== 'todas' && x.c.categoria !== estado.cat) return false;
      if (!q) return true;
      return q.split(' ').every(function (t) { return x.texto.indexOf(t) > -1; });
    }).map(function (x) { return x.c; });

    if (!res.length) {
      lista.innerHTML = '';
      vacio.hidden = false;
      vacio.innerHTML =
        '<div class="sin-resultados">' +
          '<h3>Ninguna clase encaja con eso</h3>' +
          '<p>Prueba con otra palabra o quita el filtro. Si buscas algo que no damos, ' +
            'dínoslo: el cuadro de clases cambia cada temporada.</p>' +
          '<p style="margin-top:1.5rem"><button class="boton boton--fantasma" type="button" ' +
            'data-reset>Ver las ' + B.clases.length + ' clases</button></p>' +
        '</div>';
    } else {
      vacio.hidden = true;
      vacio.innerHTML = '';
      lista.innerHTML = res.map(function (c, k) {
        return C.clase(c, { anima: true })
          .replace('data-anima', 'data-anima data-retraso="' + Math.min(4, (k % 3) + 1) + '"');
      }).join('');
    }

    var conteo = document.getElementById('conteo-clases');
    if (conteo) conteo.textContent = res.length === 1 ? '1 clase' : res.length + ' clases';

    var url = new URL(location.href);
    if (estado.q) url.searchParams.set('q', estado.q); else url.searchParams.delete('q');
    if (estado.cat !== 'todas') url.searchParams.set('cat', estado.cat); else url.searchParams.delete('cat');
    history.replaceState(null, '', url.pathname + (url.search || '') );

    if (T) T.montaApariciones();
  }

  entrada.addEventListener('input', T ? T.retrasa(function () {
    estado.q = entrada.value;
    limpiar.hidden = !estado.q;
    pinta();
  }, 140) : function () { estado.q = entrada.value; pinta(); });

  limpiar.addEventListener('click', function () {
    estado.q = ''; entrada.value = ''; limpiar.hidden = true; entrada.focus(); pinta();
  });

  mandos.addEventListener('click', function (e) {
    var b = e.target.closest('[data-cat]');
    if (!b) return;
    estado.cat = b.getAttribute('data-cat');
    Array.prototype.slice.call(mandos.querySelectorAll('[data-cat]')).forEach(function (x) {
      x.setAttribute('aria-pressed', String(x === b));
    });
    pinta();
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('[data-reset]')) return;
    estado.q = ''; estado.cat = 'todas';
    entrada.value = ''; limpiar.hidden = true;
    Array.prototype.slice.call(mandos.querySelectorAll('[data-cat]')).forEach(function (x) {
      x.setAttribute('aria-pressed', String(x.getAttribute('data-cat') === 'todas'));
    });
    pinta();
  });

  pinta();
})();
