/* =============================================================================
   PANEL DE GESTIÓN · Gimnasios Xtreme
   -----------------------------------------------------------------------------
   Para lo que el club cambia a menudo: la hora de las clases (Horarios), las
   actividades que se dan (Actividades) y los precios (Cuotas y Bonos).
   El resto de la web se cambia en lib/manifest.js.

   Mismo sistema que el panel de la Casa Memoria Rural Viva:
   · Se entra con correo y contraseña (Supabase Auth). Solo pasan las cuentas
     que estén en la tabla «admins»: lo comprueba la base de datos.
   · Se edita sobre un borrador guardado en este dispositivo. «Publicar» lo
     guarda en la base de datos y Vercel reconstruye la web sola en un minuto.
     Cada publicación deja la anterior en el historial, por si hay que volver.

   Cómo está montado el editor:
   · Un esquema (COLECCIONES) describe qué campos tiene cada cosa. Todo lo
     demás —lista, formulario, vista previa— se genera de ahí, así que añadir
     un campo nuevo es añadir una línea al esquema.
   · Las colecciones van en lista + detalle, con la ficha real pintada al lado
     mientras escribes: se ve lo que va a salir publicado.
   Todo lo que lee y guarda pasa por window.Gestion (panel/gestion.js).
   ========================================================================== */
(function () {
  'use strict';

  var B = window.__BRAND__, P = window.XP, C = window.XC, G = window.Gestion;
  var hueco = document.querySelector('[data-panel]');
  if (!B || !P || !hueco) return;

  var esc = P.esc, icono = P.icono, R = P.ruta;
  var CLAVE_BORRADOR = 'xtreme.panel.borrador';

  function clona(o) { return JSON.parse(JSON.stringify(o)); }

  var datos = P.almacen.lee(CLAVE_BORRADOR, null) || clona(B);
  var sucio = !!P.almacen.lee(CLAVE_BORRADOR, null);
  var seccion = 'resumen';
  var correo = '';

  /* B es el contenido PUBLICADO. Se cambia en su sitio (no se sustituye el
     objeto) porque plantillas.js y componentes.js guardan esa misma referencia. */
  function reemplazaB(nuevo) {
    var k;
    for (k in B) if (Object.prototype.hasOwnProperty.call(B, k)) delete B[k];
    nuevo = clona(nuevo);
    for (k in nuevo) B[k] = nuevo[k];
  }
  var indice = 0;          // elemento seleccionado dentro de la colección
  var filtro = '';

  /* ------------------------------------------------------- leer y escribir */
  function lee(objeto, ruta) {
    var partes = String(ruta).split('.'), o = objeto, i;
    for (i = 0; i < partes.length; i++) {
      if (o == null) return undefined;
      o = o[partes[i]];
    }
    return o;
  }
  function pon(ruta, valor) {
    var partes = String(ruta).split('.'), o = datos, i;
    for (i = 0; i < partes.length - 1; i++) o = o[partes[i]];
    o[partes[partes.length - 1]] = valor;
  }

  function marcaSucio() {
    sucio = true;
    P.almacen.guarda(CLAVE_BORRADOR, datos);
    var e = document.getElementById('pn-estado');
    if (e) {
      e.setAttribute('data-sucio', 'true');
      e.querySelector('span').textContent = 'Web: cambios sin publicar';
    }
    pintaCambios();
  }

  /* Barra fija de «cambios sin publicar»: aparece en cuanto se toca algo y
     no se va hasta publicar o descartar. Así nunca se queda nada a medias. */
  var ultimoAviso = 0;
  function pintaCambios() {
    var b = document.getElementById('pn-cambios');
    if (!b) return;
    var n = sucio ? cuentaCambios() : 0;
    if (!n && sucio) { sucio = false; P.almacen.borra(CLAVE_BORRADOR); pintaEstado(); return; }
    b.hidden = !n;
    document.body.classList.toggle('p-con-cambios', !!n);
    if (n) {
      b.querySelector('[data-n]').textContent = n === 1 ? '1 cambio sin publicar' : n + ' cambios sin publicar';
      /* pequeño latido la primera vez, para que se vea */
      if (Date.now() - ultimoAviso > 60000) { ultimoAviso = Date.now(); b.classList.remove('p-late'); void b.offsetWidth; b.classList.add('p-late'); }
    }
  }
  function descartaTodo() {
    if (!confirm('¿Descartar los cambios sin publicar? La web se queda como está.')) return;
    P.almacen.borra(CLAVE_BORRADOR);
    datos = clona(B); sucio = false;
    pintaEstado(); pintaNav(); pintaZona();
    tostada('Cambios descartados. <b>Todo vuelve a estar como en la web.</b>');
  }

  /* =========================================================== EL ESQUEMA */
  /* tipo: texto · area · numero · precio · si-no · imagen · lista · opciones */

  var COLECCIONES = {
    clases: {
      titulo: 'Clases',
      icono: 'fuego',
      intro: 'Las clases dirigidas que salen en el catálogo y en el cuadro horario. ' +
             'Las marcadas como destacadas son las que aparecen en la portada.',
      ruta: 'clases',
      nombre: function (c) { return c.nombre || 'Sin nombre'; },
      pie: function (c) {
        var k = P.categoriaDe(c.categoria);
        return (k ? k.nombre : c.categoria) + ' · ' + P.minutos(c.duracion);
      },
      foto: function (c) { return c.foto; },
      marca: function (c) { return c.destacada ? 'Portada' : ''; },
      vista: function (c) { return C.clase(c); },
      nueva: function () {
        return {
          id: 'clase-' + Date.now(), nombre: 'Clase nueva', categoria: 'fuerza',
          destacada: false, resumen: 'En una línea, qué se trabaja.',
          texto: 'Explica la clase como se la contarías a alguien en recepción.',
          duracion: 55, intensidad: 3, nivel: 'Todos los niveles', calorias: '',
          foto: '/assets/img/clase-body-pump.webp',
          fotoFallback: '/assets/img/clase-body-pump.jpg',
          alt: 'Clase nueva'
        };
      },
      grupos: [
        { titulo: 'Lo que se lee', dobles: true, campos: [
          { c: 'nombre', e: 'Nombre', t: 'texto' },
          { c: 'categoria', t: 'opciones', e: 'Tipo de clase',
            ops: function () {
              return (datos.categoriasClases || []).map(function (k) {
                return { v: k.id, n: k.nombre };
              });
            } },
          { c: 'resumen', e: 'Resumen', t: 'texto', ancho: true,
            ayuda: 'Una línea. Sale en verde bajo el título.' },
          { c: 'texto', e: 'Descripción', t: 'area', ancho: true,
            ayuda: 'Dos o tres frases. Nada de «la mejor clase»: di qué se hace.' }
        ] },
        { titulo: 'Ficha técnica', dobles: true, campos: [
          { c: 'duracion', e: 'Duración (minutos)', t: 'numero' },
          { c: 'intensidad', e: 'Intensidad (1 a 5)', t: 'numero',
            min: 1, max: 5, ayuda: 'Son las cinco barritas de la ficha.' },
          { c: 'nivel', e: 'Nivel', t: 'texto' },
          { c: 'calorias', e: 'Calorías (informativo)', t: 'texto' }
        ] },
        { titulo: 'Foto', dobles: true, campos: [
          { c: 'foto', e: 'Foto', t: 'imagen', par: 'fotoFallback' },
          { c: 'fotoFallback', e: 'Respaldo JPG (se rellena solo al importar)', t: 'imagen' },
          { c: 'alt', e: 'Descripción de la foto', t: 'texto', ancho: true,
            ayuda: 'Para quien no la ve. Describe lo que sale, no repitas el nombre.' }
        ] },
        { titulo: 'Dónde aparece', campos: [
          { c: 'destacada', e: 'Sacarla en la portada', t: 'si-no',
            ayuda: 'La portada enseña seis. Si marcas más, salen las seis primeras.' }
        ] }
      ]
    },

    planes: {
      titulo: 'Cuotas',
      icono: 'tarjeta',
      intro: 'Las cuotas de socio, con los precios reales del sistema de altas del club. ' +
             '«Al mes» y «ahorro» son lo que se enseña como argumento de venta; el ' +
             'porcentaje se calcula solo frente a la cuota mensual.',
      ruta: 'tarifas.planes',
      nombre: function (p) { return p.nombre; },
      pie: function (p) {
        var d = P.descuento(p.precio, p.precioAntes);
        return P.euros(p.precio) + p.periodo + (d ? '  −' + d + ' %' : '');
      },
      marca: function (p) { return p.destacado ? 'Destacada' : ''; },
      vista: function (p) { return C.plan(p); },
      nueva: function () {
        return {
          id: 'cuota-' + Date.now(), nombre: 'Cuota nueva', periodo: '/mes',
          precio: 30, precioAntes: null, destacado: false, etiqueta: '',
          resumen: 'En una línea, para quién es.',
          incluye: ['Acceso 24 h a los tres centros', 'Todas las clases dirigidas'],
          cta: 'Darme de alta'
        };
      },
      grupos: [
        { titulo: 'Nombre y precio', dobles: true, campos: [
          { c: 'nombre', e: 'Nombre', t: 'texto' },
          { c: 'periodo', e: 'Periodo', t: 'texto', ayuda: 'Va pegado al precio: /mes, /3 meses…' },
          { c: 'precio', e: 'Precio del periodo completo', t: 'precio' },
          { c: 'alMes', e: 'Equivalente al mes', t: 'precio',
            ayuda: 'Lo que sale por mes. Es el dato que más mira la gente.' },
          { c: 'matricula', e: 'Tarifa de inscripción', t: 'precio',
            ayuda: '0 = sin matrícula.' },
          { c: 'ahorroAlAno', e: 'Ahorro al año', t: 'precio',
            ayuda: 'Frente a pagar mes a mes. 0 = no se enseña.' },
          { c: 'precioAntes', e: 'Precio antes (sólo si hay rebaja de verdad)', t: 'precio',
            ayuda: 'Vacío salvo que el club baje el precio. Con valor, sale tachado.' },
          { c: 'etiqueta', e: 'Etiqueta', t: 'texto',
            ayuda: 'La pegatina de arriba: «La más elegida», «Mejor precio»… Vacío = sin pegatina.' },
          { c: 'destacado', e: 'Destacar con borde lima', t: 'si-no' }
        ] },
        { titulo: 'Qué incluye', campos: [
          { c: 'resumen', e: 'Resumen', t: 'texto', ancho: true },
          { c: 'incluye', e: 'Ventajas', t: 'lista', ancho: true,
            ayuda: 'Una por línea. Cada una sale con su marca de verificación.' },
          { c: 'nota', e: 'Letra pequeña de la cuota', t: 'texto', ancho: true,
            ayuda: 'Por ejemplo: «Cuota no interrumpible».' },
          { c: 'cta', e: 'Texto del botón', t: 'texto' }
        ] }
      ]
    },

    extras: {
      titulo: 'Bonos y extras',
      icono: 'etiqueta',
      intro: 'Lo que se paga aparte de la cuota: entradas de día, bonos, entrenador ' +
             'personal y nutrición.',
      ruta: 'tarifas.extras',
      nombre: function (x) { return x.nombre; },
      pie: function (x) {
        var d = P.descuento(x.precio, x.precioAntes);
        return P.euros(x.precio) + (d ? '  −' + d + ' %' : '');
      },
      nueva: function () {
        return { id: 'extra-' + Date.now(), nombre: 'Servicio nuevo', precio: 20,
                 precioAntes: null, nota: '' };
      },
      grupos: [
        { titulo: 'Datos', dobles: true, campos: [
          { c: 'nombre', e: 'Nombre', t: 'texto' },
          { c: 'precio', e: 'Precio', t: 'precio' },
          { c: 'precioAntes', e: 'Precio antes', t: 'precio' },
          { c: 'nota', e: 'Nota', t: 'texto', ancho: true,
            ayuda: 'La letra pequeña: «Sin caducidad», «Sesión de 60 minutos»…' }
        ] }
      ]
    },

  };

  /*   };

  /* Bloques sueltos (no son listas): formularios normales */
  /* Formularios sueltos (sin lista). Ahora no hay ninguno: el panel solo
     lleva colecciones y el cuadro horario. */
  var BLOQUES = {};

  /* ===================================================== PANTALLA DE ACCESO */
  function pideAcceso() {
    hueco.innerHTML =
      '<div class="contenedor" style="padding-block:clamp(3rem,10vh,7rem)">' +
        '<div class="acceso">' +
          '<div style="display:grid;place-items:center;margin-bottom:var(--e-5)">' +
            '<img src="' + esc(R(B.marca.logo.claro)) + '" alt="Gimnasios Xtreme" width="169" height="84" ' +
              'style="width:8.5rem;height:auto"></div>' +
          '<h1>Panel del gimnasio</h1>' +
          '<p>Horarios, actividades y precios de la web.</p>' +
          '<form class="formulario" id="pn-form" novalidate>' +
            '<div class="aviso aviso--error" id="pn-mal" hidden>' + icono('aviso', 18) + '<span></span></div>' +
            '<div class="campo"><label for="pn-correo">Correo</label>' +
              '<input type="email" id="pn-correo" autocomplete="username" placeholder="tu correo" autofocus></div>' +
            '<div class="campo"><label for="pn-clave">Contraseña</label>' +
              '<input type="password" id="pn-clave" autocomplete="current-password" placeholder="••••••••"></div>' +
            '<button class="boton boton--ancho" type="submit" id="pn-entrar">Entrar</button>' +
          '</form>' +
          '<p class="letra-pequena" style="margin-top:var(--e-5)">Acceso privado para el equipo del club.</p>' +
        '</div>' +
      '</div>';

    document.getElementById('pn-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var mal = document.getElementById('pn-mal'), boton = document.getElementById('pn-entrar');
      mal.hidden = true;
      boton.disabled = true; boton.textContent = 'Entrando…';
      G.entrar(document.getElementById('pn-correo').value.trim(), document.getElementById('pn-clave').value)
        .then(function (r) {
          boton.disabled = false; boton.textContent = 'Entrar';
          if (r.error) {
            mal.querySelector('span').textContent = r.error;
            mal.hidden = false;
            document.getElementById('pn-clave').select();
            return;
          }
          arranca();
        });
    });
  }

  function sinBase() {
    hueco.innerHTML =
      '<div class="contenedor" style="padding-block:clamp(3rem,10vh,7rem)"><div class="acceso">' +
        '<h1>Falta conectar la base de datos</h1>' +
        '<p>Rellena <code>lib/config.js</code> con la dirección y la clave pública del proyecto ' +
          'de Supabase. Está explicado en el README.</p>' +
      '</div></div>';
  }

  function arranca() {
    var e = G.estado();
    if (e.contenido) reemplazaB(e.contenido);
    var b = P.almacen.lee(CLAVE_BORRADOR, null);
    datos = b || clona(B);
    sucio = !!b;
    publicadoVisto = e.actualizado;
    var inicial = (location.hash || '').slice(1);
    if (NAV.some(function (x) { return x.id === inicial; })) seccion = inicial;
    G.correo().then(function (c) { correo = c; var n = document.getElementById('pn-yo'); if (n) n.textContent = c; });
    pintaPanel();
  }

  /* ============================================================ EL ARMAZÓN */
  var NAV = [
    { id: 'resumen', n: 'Visión general', i: 'grafico' },
    { grupo: 'La web' },
    { id: 'horarios', n: 'Horarios', i: 'reloj', cuenta: function () { return datos.agenda.horario.length; } },
    { id: 'clases', n: 'Actividades', i: 'fuego', cuenta: function () { return datos.clases.length; } },
    { id: 'planes', n: 'Cuotas', i: 'tarjeta', cuenta: function () { return datos.tarifas.planes.length; } },
    { id: 'extras', n: 'Bonos', i: 'etiqueta', cuenta: function () { return datos.tarifas.extras.length; } },
    { grupo: 'Ajustes' },
    { id: 'publicacion', n: 'Publicación', i: 'candado' }
  ];
  var OPERACION = { resumen: 1, publicacion: 1 };

  function pintaPanel() {
    hueco.innerHTML =
      '<div class="panel__barra">' +
        '<div class="contenedor contenedor--panel">' +
          '<div class="panel__marca">' +
            '<img src="' + esc(R(datos.marca.logo.claro)) + '" alt="" width="169" height="84">' +
            '<span>Panel</span>' +
          '</div>' +
          '<span class="panel__estado" id="pn-estado"' + (sucio ? ' data-sucio="true"' : '') + '>' +
            '<i></i><span>' + (sucio ? 'Web: cambios sin publicar' : 'Web: todo publicado') + '</span></span>' +
          '<button class="boton boton--fantasma boton--pequeno p-barra-btn" type="button" id="pn-ver" aria-label="Ver la web">' +
            icono('pantalla', 16) + '<span class="p-solo-ancho">Ver la web</span></button>' +
          '<button class="boton boton--pequeno p-publicar" type="button" id="pn-publicar">' +
            icono('guardar', 16) + '<span>Publicar</span></button>' +
          '<button class="boton boton--fantasma boton--pequeno p-barra-btn" type="button" id="pn-salir" aria-label="Salir">' +
            icono('salir', 16) + '<span class="p-solo-ancho">Salir</span></button>' +
        '</div>' +
      '</div>' +

      '<div class="contenedor contenedor--panel" style="padding-top:var(--e-6);padding-bottom:var(--e-9)">' +
        '<div class="panel__cuerpo">' +
          '<nav class="panel__nav" id="pn-nav" aria-label="Secciones del panel"></nav>' +
          '<div id="pn-zona"></div>' +
        '</div>' +
      '</div>' +

      '<div class="p-cambios" id="pn-cambios" role="status" hidden>' +
        '<span class="p-cambios__txt">' + icono('aviso', 16) + '<b data-n></b></span>' +
        '<button class="boton boton--fantasma boton--pequeno" type="button" data-cambios="descartar">Descartar</button>' +
        '<button class="boton boton--pequeno" type="button" data-cambios="publicar">' + icono('guardar', 15) + ' Publicar</button>' +
      '</div>' +
      '<nav class="p-tabs" id="pn-tabs" aria-label="Secciones"></nav>' +
      dialogoPublicar();

    document.getElementById('pn-ver').addEventListener('click', function () {
      abrirVisor((window.__PANEL__ && window.__PANEL__.web) || R('/index.html'));
    });
    document.getElementById('pn-publicar').addEventListener('click', abrePublicar);
    document.getElementById('pn-cambios').addEventListener('click', function (e) {
      var b = e.target.closest('[data-cambios]');
      if (!b) return;
      if (b.getAttribute('data-cambios') === 'publicar') abrePublicar(); else descartaTodo();
    });
    document.getElementById('pn-salir').addEventListener('click', function () {
      if (sucio && !confirm('Tienes cambios de la web sin publicar. Se quedan guardados en este ' +
        'dispositivo. ¿Salir igualmente?')) return;
      G.salir().then(function () { pideAcceso(); });
    });
    ['pn-nav', 'pn-tabs'].forEach(function (id) {
      document.getElementById(id).addEventListener('click', function (e) {
        var b = e.target.closest('[data-va]');
        if (!b) return;
        irA(b.getAttribute('data-va'));
      });
    });
    montaPublicar();
    pintaNav();
    pintaZona();
    pintaCambios();

    if (!pintaPanel.atajos) {
      pintaPanel.atajos = true;
      document.addEventListener('keydown', function (e) {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
          e.preventDefault(); abrePublicar();
        }
      });
    }
  }

  function irA(id) {
    seccion = id; indice = 0; filtro = '';
    if (history.replaceState) history.replaceState(null, '', '#' + id);
    pintaNav(); pintaZona();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* Móvil: las mismas secciones, en pestañas abajo, al alcance del pulgar */
  var NOMBRE_CORTO = { resumen: 'General' };
  function pintaTabs() {
    var tabs = document.getElementById('pn-tabs');
    if (!tabs) return;
    tabs.innerHTML = NAV.filter(function (x) { return !x.grupo && x.id !== 'publicacion'; }).map(function (x) {
      return '<button type="button" data-va="' + x.id + '"' + (seccion === x.id ? ' aria-current="true"' : '') + '>' +
        '<span class="p-tabs__ico">' + icono(x.i, 20) + '</span>' +
        esc(NOMBRE_CORTO[x.id] || x.n) + '</button>';
    }).join('');
  }

  function pintaNav() {
    pintaTabs();
    var nav = document.getElementById('pn-nav');
    if (!nav) return;
    nav.innerHTML = NAV.map(function (x) {
      if (x.grupo) return '<p class="p-nav-grupo">' + esc(x.grupo) + '</p>';
      var n = x.cuenta ? x.cuenta() : null;
      var a = x.aviso ? x.aviso() : null;
      return '<button type="button" data-va="' + x.id + '"' +
        (seccion === x.id ? ' aria-current="true"' : '') + '>' +
        icono(x.i, 17) + x.n +
        (a ? '<b class="p-aviso' + (x.fuerte ? ' p-aviso--fuerte' : '') + '">' + a + '</b>'
           : n != null ? '<b>' + n + '</b>' : '') + '</button>';
    }).join('');
  }

  function pintaZona() {
    /* Cambiamos el nodo entero, no sólo su contenido: así los oyentes de la
       sección anterior se van con él y no se acumulan al navegar. */
    var viejo = document.getElementById('pn-zona');
    if (!viejo) return;
    var z = document.createElement('div');
    z.id = 'pn-zona';
    viejo.replaceWith(z);

    if (OPERACION[seccion]) { z.innerHTML = VISTAS_OP[seccion](); montaOperacion(z); return; }
    if (seccion === 'horarios') { z.innerHTML = vistaHorarios(); montaHorarios(); return; }
    if (COLECCIONES[seccion]) { z.innerHTML = vistaColeccion(); montaColeccion(); return; }
    if (BLOQUES[seccion]) { z.innerHTML = vistaBloque(); enganchaCampos(z); return; }
  }

  /* ============================================================ PUBLICACIÓN */
  function titulo(t, p, extra) {
    return '<div class="panel__titulo p-titulo-acc"><div><h2>' + esc(t) + '</h2>' +
      (p ? '<p>' + p + '</p>' : '') + '</div>' + (extra || '') + '</div>';
  }

  /* ----- Publicación: Vercel, historial y cuenta ----- */
  function vistaPublicacion() {
    var e = G.estado();
    var f = function (ts) { return ts ? new Date(ts).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' }) : '—'; };
    return titulo('Publicación', 'Cómo llegan a la web los cambios de contenido, y cómo volver atrás.') +
      '<div class="detalle__caja" style="margin-bottom:var(--e-5)">' +
        '<div class="detalle__grupo"><h4>Estado</h4>' +
          '<div class="numeros">' +
            '<div class="numero"><b style="font-size:var(--t-1)">' + esc(f(e.actualizado)) + '</b><span>último cambio guardado</span></div>' +
            '<div class="numero"><b style="font-size:var(--t-1)">' + esc(f(e.publicado)) + '</b><span>última vez que se pidió a Vercel reconstruir</span></div>' +
          '</div>' +
          (sucio ? '<p class="campo__ayuda" style="margin-top:var(--e-3)">Tienes cambios sin publicar en este dispositivo.</p>' : '') +
        '</div>' +
        '<div class="detalle__grupo"><h4>Reconstrucción automática (Vercel)</h4>' +
          '<div class="detalle__campos"><div class="campo ancho">' +
            '<div class="campo__cabecera"><label for="pn-hook">Deploy Hook</label></div>' +
            '<input type="url" id="pn-hook" placeholder="https://api.vercel.com/v1/integrations/deploy/…" value="' + esc(e.hook) + '">' +
            '<p class="campo__ayuda">Vercel → proyecto de la web → Settings → Git → Deploy Hooks → crear uno ' +
              'para la rama <code>main</code> y pegar aquí la dirección. Con ella, «Publicar» actualiza la web sola. ' +
              'Es secreta: solo la ve quien administra.</p>' +
          '</div></div>' +
          '<p><button class="boton boton--pequeno" type="button" data-op="guardar-hook">Guardar</button></p>' +
        '</div>' +
      '</div>' +

      '<div class="detalle__caja" style="margin-bottom:var(--e-5)">' +
        '<div class="detalle__grupo"><h4>Historial</h4>' +
          '<p class="campo__ayuda" style="margin-bottom:var(--e-3)">Cada vez que publicas se guarda cómo estaba la web ' +
            'antes (las 30 últimas). «Volver a esta» la publica otra vez tal cual.</p>' +
          (e.versiones.length ? '<ul class="p-gente">' + e.versiones.map(function (v) {
            return '<li><span>' + esc(f(v.guardada)) + '</span>' +
              '<button class="boton boton--fantasma boton--pequeno" type="button" data-restaurar="' + v.id + '">Volver a esta</button></li>';
          }).join('') + '</ul>' : '<p class="p-nada">Todavía no hay versiones anteriores.</p>') +
          '<p style="margin-top:var(--e-4)"><button class="boton boton--fantasma boton--pequeno" type="button" data-op="copia">' +
            icono('guardar', 15) + ' Descargar copia del contenido (manifest.js)</button></p>' +
        '</div>' +
      '</div>' +

      '<div class="detalle__caja">' +
        '<div class="detalle__grupo"><h4>Tu cuenta</h4>' +
          '<p>Has entrado como <b id="pn-yo">' + esc(correo) + '</b>.</p>' +
          '<p class="campo__ayuda">Para dar acceso a otra persona: en Supabase, Authentication → Users → ' +
            'Add user (con «Auto Confirm User»), y añadir su correo a la tabla <code>admins</code>. ' +
            'Una cuenta que no esté en <code>admins</code> no ve nada aunque tenga contraseña.</p>' +
        '</div>' +
      '</div>';
  }

  /* ----- Visión general: cómo está todo de un vistazo ----- */
  var DIAS_SEMANA = ['', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
  function actividad(id) {
    return datos.clases.filter(function (c) { return c.id === id; })[0] || { nombre: id, duracion: 0 };
  }
  function euro(n) { return n == null || n === '' ? '—' : P.euros(n); }

  function vistaResumen() {
    var e = G.estado();
    var hoy = new Date(), dHoy = P.diaSemana(hoy);
    var f = function (ts) { return ts ? new Date(ts).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' }) : ''; };
    var horario = datos.agenda.horario;
    var deHoy = horario.filter(function (x) { return x.dia === dHoy; })
      .sort(function (a, b) { return a.hora < b.hora ? -1 : 1; });
    var ahora = P.pad(hoy.getHours()) + ':' + P.pad(hoy.getMinutes());
    var siguiente = deHoy.filter(function (x) { return x.hora >= ahora; })[0];
    var planes = datos.tarifas.planes, extras = datos.tarifas.extras;
    var desde = planes.reduce(function (m, x) { var v = +x.alMes || +x.precio; return v && (m == null || v < m) ? v : m; }, null);
    var plazas = horario.reduce(function (n, x) { return n + (+x.plazas || +datos.agenda.plazasPorDefecto || 0); }, 0);
    var cambios = cuentaCambios();

    var porDia = [1, 2, 3, 4, 5, 6, 7].map(function (d) { return horario.filter(function (x) { return x.dia === d; }).length; });
    var tope = Math.max.apply(null, porDia.concat(1));

    var guia = P.almacen.lee('xtreme.panel.guia', true) !== false;
    return titulo('Visión general', esc(P.mayus(P.fechaLarga(hoy))) + '. Cómo está la web ahora mismo.') +

      (guia ? '<div class="p-guia">' +
        '<button class="p-guia__cerrar" type="button" data-op="cerrar-guia" aria-label="Cerrar la guía">' + icono('cerrar', 16) + '</button>' +
        '<h3>Así se usa, en tres pasos</h3>' +
        '<ol>' +
          '<li><b>Elige qué cambiar</b><span>Horarios, Actividades, Cuotas o Bonos, en el menú.</span></li>' +
          '<li><b>Cámbialo</b><span>Se guarda solo en este móvil mientras editas. Si te equivocas, «deshacer» junto a cada campo.</span></li>' +
          '<li><b>Pulsa Publicar</b><span>En un minuto está en la web. Si no te convence, en Publicación vuelves atrás.</span></li>' +
        '</ol></div>' : '') +

      /* estado de la publicación */
      '<div class="p-estado-web"' + (sucio ? ' data-sucio="true"' : '') + '>' +
        '<span class="p-estado-web__ico">' + icono(sucio ? 'aviso' : 'ok', 22) + '</span>' +
        '<div><b>' + (sucio ? cambios + (cambios === 1 ? ' cambio sin publicar' : ' cambios sin publicar')
                            : 'La web está al día') + '</b>' +
          '<span>' + (sucio ? 'Lo ves tú en este dispositivo; la gente aún no. Pulsa Publicar cuando acabes.'
                            : (e.actualizado ? 'Última publicación: ' + esc(f(e.actualizado)) + '.' : 'Todavía no se ha publicado nada desde el panel.')) +
          '</span></div>' +
        (sucio ? '<button class="boton boton--pequeno" type="button" data-op="publicar">' + icono('guardar', 15) + ' Publicar</button>' : '') +
      '</div>' +

      /* cifras */
      '<div class="numeros p-numeros">' +
        '<button type="button" class="numero" data-va="horarios"><b>' + horario.length + '</b><span>clases a la semana</span></button>' +
        '<button type="button" class="numero" data-va="clases"><b>' + datos.clases.length + '</b><span>actividades</span></button>' +
        '<button type="button" class="numero" data-va="planes"><b>' + (desde ? P.euros(desde) : '—') + '</b><span>cuota más barata al mes</span></button>' +
        '<button type="button" class="numero" data-va="horarios"><b>' + P.numero(plazas) + '</b><span>plazas a la semana</span></button>' +
      '</div>' +

      '<div class="p-general">' +
        /* hoy */
        '<section class="detalle__caja">' +
          '<div class="p-caja-cab"><h3>Hoy, ' + esc(DIAS_SEMANA[dHoy]) + '</h3>' +
            '<button class="p-enlace" type="button" data-va="horarios">Cambiar horarios ' + icono('derecha', 14) + '</button></div>' +
          (deHoy.length ? '<ul class="p-hoy">' + deHoy.map(function (x) {
            var a = actividad(x.clase), c = P.centroDe(x.centro);
            var pasada = x.hora < ahora;
            return '<li' + (x === siguiente ? ' data-siguiente="true"' : pasada ? ' data-pasada="true"' : '') + '>' +
              '<b>' + esc(x.hora) + '</b>' +
              '<span><b>' + esc(a.nombre) + '</b><small>' + esc(c ? c.nombre : x.centro) +
                (x.monitor ? ' · ' + esc(x.monitor) : '') + ' · ' + (x.plazas || datos.agenda.plazasPorDefecto) + ' plazas</small></span>' +
              (x === siguiente ? '<em>Siguiente</em>' : '') +
            '</li>';
          }).join('') + '</ul>' : '<p class="p-nada">Hoy no hay clases dirigidas.</p>') +
        '</section>' +

        /* la semana */
        '<section class="detalle__caja">' +
          '<div class="p-caja-cab"><h3>Clases por día</h3></div>' +
          '<div class="p-barras">' + porDia.map(function (n, i) {
            return '<div' + (i + 1 === dHoy ? ' data-hoy="true"' : '') + '><em>' + n + '</em>' +
              '<i style="height:' + Math.round(n / tope * 100) + '%"></i><span>' + esc(DIAS_SEMANA[i + 1].slice(0, 3)) + '</span></div>';
          }).join('') + '</div>' +
          '<div class="p-centros">' + B.centros.map(function (c) {
            var n = horario.filter(function (x) { return x.centro === c.id; }).length;
            return '<span><b>' + n + '</b> en ' + esc(c.nombre) + '</span>';
          }).join('') + '</div>' +
        '</section>' +

        /* precios */
        '<section class="detalle__caja">' +
          '<div class="p-caja-cab"><h3>Precios</h3>' +
            '<button class="p-enlace" type="button" data-va="planes">Cambiar cuotas ' + icono('derecha', 14) + '</button></div>' +
          '<ul class="p-precios">' +
            planes.map(function (x) {
              return '<li><span>' + esc(x.nombre) + '</span><b>' + euro(x.precio) + '</b></li>';
            }).join('') +
            extras.map(function (x) {
              return '<li class="p-precios__bono"><span>' + esc(x.nombre) + '</span><b>' + euro(x.precio) + '</b></li>';
            }).join('') +
          '</ul>' +
        '</section>' +
      '</div>' +

      '<p class="p-ajustes"><button class="p-enlace" type="button" data-va="publicacion">' + icono('candado', 14) +
        ' Publicación, historial y cuenta ' + icono('derecha', 14) + '</button></p>';
  }

  var VISTAS_OP = { resumen: vistaResumen, publicacion: vistaPublicacion };

  /* Espera la respuesta del servidor: si va bien avisa; si no, lo dice. */
  function hacer(promesa, ok, despues) {
    document.body.classList.add('p-ocupado');
    return Promise.resolve(promesa).then(function (r) {
      document.body.classList.remove('p-ocupado');
      if (r && r.error) { tostada(esc(r.error), 'mal'); return false; }
      if (ok) tostada(typeof ok === 'function' ? ok(r) : ok);
      if (despues) despues(r);
      return true;
    }, function () {
      document.body.classList.remove('p-ocupado');
      tostada('No se pudo guardar. ¿Hay conexión?', 'mal');
      return false;
    });
  }

  function montaOperacion(z) {
    z.addEventListener('click', function (e) {
      var t = e.target.closest('button');
      if (!t) return;
      if (t.getAttribute('data-va')) { irA(t.getAttribute('data-va')); return; }
      if (t.getAttribute('data-op') === 'publicar') { abrePublicar(); return; }
      if (t.getAttribute('data-op') === 'cerrar-guia') { P.almacen.guarda('xtreme.panel.guia', false); pintaZona(); return; }
      if (t.getAttribute('data-restaurar')) {
        if (sucio && !confirm('Tienes cambios sin publicar: se perderán. ¿Seguir?')) return;
        if (!confirm('¿Volver a publicar la web tal y como estaba en esta versión?')) return;
        hacer(G.restaurar(+t.getAttribute('data-restaurar')), function (r) {
          return r.reconstruye ? 'Versión recuperada. <b>La web se actualiza en un minuto.</b>' : 'Versión recuperada y guardada.';
        }, function () { recargaContenido(true); pintaNav(); pintaZona(); });
        return;
      }
      switch (t.getAttribute('data-op')) {
        case 'guardar-hook':
          hacer(G.guardarHook(document.getElementById('pn-hook').value), 'Guardado. <b>«Publicar» ya actualiza la web sola.</b>');
          break;
        case 'copia': descarga(); break;
      }
    });
  }

  /* ----- Avisos flotantes ----- */
  function tostada(html, tipo) {
    var caja = document.querySelector('[data-tostadas]');
    if (!caja) return;
    var t = document.createElement('div');
    t.className = 'p-tostada' + (tipo ? ' p-tostada--' + tipo : '');
    t.innerHTML = '<i>' + (tipo === 'mal' ? '!' : '✓') + '</i><span>' + html + '</span>';
    caja.appendChild(t);
    setTimeout(function () { t.classList.add('fuera'); }, 4600);
    setTimeout(function () { t.remove(); }, 5000);
  }

  /* ----- «Ver la web» sin salir del panel ----- */
  var visor = document.querySelector('[data-visor]'), marco = document.querySelector('[data-visor-marco]');
  function abrirVisor(href) {
    var destino = new URL(href, location.href).href;
    if (marco.getAttribute('src') !== destino) marco.setAttribute('src', destino);
    document.querySelector('[data-visor-fuera]').href = destino;
    visor.hidden = false;
    document.documentElement.classList.add('p-visor-abierto');
    if (history.pushState) history.pushState({ visor: 1 }, '', location.href);
    document.querySelector('[data-cerrar-visor]').focus();
  }
  function cerrarVisor(desdeHistoria) {
    if (visor.hidden) return;
    visor.hidden = true;
    document.documentElement.classList.remove('p-visor-abierto');
    if (!desdeHistoria && history.state && history.state.visor) history.back();
  }
  window.addEventListener('popstate', function () { cerrarVisor(true); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !visor.hidden) cerrarVisor(); });
  document.querySelector('[data-cerrar-visor]').addEventListener('click', function () { cerrarVisor(); });

  /* ----- Si otra persona publica desde otro dispositivo, lo publicado cambia ----- */
  var publicadoVisto = null;
  function recargaContenido(forzar) {
    var e = G.estado();
    if (!e.contenido) return;
    if (!forzar && e.actualizado === publicadoVisto) return;
    publicadoVisto = e.actualizado;
    reemplazaB(e.contenido);
    if (forzar || !sucio) {
      datos = clona(B); sucio = false; P.almacen.borra(CLAVE_BORRADOR);
      pintaEstado();
    }
  }
  if (G && G.activo) G.alCambiar(function () {
    if (!document.getElementById('pn-zona')) return;
    var antes = publicadoVisto;
    recargaContenido(false);
    if (antes !== publicadoVisto && !sucio) { pintaNav(); pintaZona(); }
    else if (OPERACION[seccion]) pintaZona();
  });

  /* =========================================================== COLECCIONES */
  function vistaColeccion() {
    var col = COLECCIONES[seccion];
    var lista = lee(datos, col.ruta) || [];
    if (indice >= lista.length) indice = Math.max(0, lista.length - 1);

    return '<div class="panel__titulo">' +
        '<h2>' + esc(col.titulo) + '</h2>' +
        '<p>' + esc(col.intro) + '</p>' +
      '</div>' +
      '<div class="coleccion">' +
        '<div>' +
          '<div class="buscador" style="margin-bottom:var(--e-3);max-width:none">' +
            '<label class="solo-lector" for="pn-buscar">Buscar</label>' +
            icono('lupa', 18) +
            '<input type="search" id="pn-buscar" placeholder="Buscar…" value="' + esc(filtro) + '">' +
            '<button class="buscador__limpiar" type="button"' + (filtro ? '' : ' hidden') +
              ' aria-label="Borrar">' + icono('cerrar', 16) + '</button>' +
          '</div>' +
          '<div class="coleccion__lista" id="pn-lista">' + filas(col, lista) + '</div>' +
          '<div class="coleccion__acciones">' +
            '<button class="boton boton--pequeno" type="button" data-accion="nuevo">+ Añadir</button>' +
            '<button class="boton boton--fantasma boton--pequeno" type="button" data-accion="duplicar">Duplicar</button>' +
          '</div>' +
        '</div>' +
        '<div id="pn-detalle">' + (lista.length ? detalle(col, lista) : vacia()) + '</div>' +
      '</div>';
  }

  function filas(col, lista) {
    var q = P.normaliza(filtro);
    var visibles = lista.map(function (x, i) { return { x: x, i: i }; })
      .filter(function (o) {
        if (!q) return true;
        return P.normaliza(JSON.stringify(o.x)).indexOf(q) > -1;
      });
    if (!visibles.length) {
      return '<p class="campo__ayuda" style="padding:var(--e-4);text-align:center">' +
        'Nada coincide con «' + esc(filtro) + '».</p>';
    }
    return visibles.map(function (o) {
      var marca = col.marca ? col.marca(o.x) : '';
      var tono = col.tono ? col.tono(o.x) : '';
      var foto = col.foto ? col.foto(o.x) : '';
      return '<button class="item" type="button" data-i="' + o.i + '"' +
          (o.i === indice ? ' aria-current="true"' : '') + '>' +
        '<span class="item__foto">' +
          (foto ? '<img src="' + esc(R(foto)) + '" alt="" loading="lazy" ' +
                  'onerror="this.remove()">' : icono('etiqueta', 16)) + '</span>' +
        '<span class="item__txt"><b>' + esc(col.nombre(o.x)) + '</b>' +
          '<span>' + esc(col.pie ? col.pie(o.x) : '') + '</span></span>' +
        (marca ? '<span class="item__marca"' + (tono ? ' data-tono="' + tono + '"' : '') + '>' +
          esc(marca) + '</span>' : '') +
      '</button>';
    }).join('');
  }

  function vacia() {
    return '<div class="vacio">' + icono('etiqueta', 34) +
      '<h3>Aquí no hay nada todavía</h3>' +
      '<p>Pulsa «Añadir» para crear el primero.</p></div>';
  }

  function detalle(col, lista) {
    var item = lista[indice];
    if (!item) return vacia();
    var base = col.ruta + '.' + indice;

    return '<div class="detalle">' +
      '<div class="detalle__caja">' +
        '<button class="p-volver-lista" type="button" data-volver-lista>' + icono('izquierda', 15) + ' Volver a la lista</button>' +
        '<div class="detalle__cabecera">' +
          '<h3>' + esc(col.nombre(item)) + '</h3>' +
          '<button class="boton boton--fantasma boton--pequeno" type="button" data-accion="subir"' +
            (indice === 0 ? ' disabled' : '') + ' aria-label="Subir">↑</button>' +
          '<button class="boton boton--fantasma boton--pequeno" type="button" data-accion="bajar"' +
            (indice >= lista.length - 1 ? ' disabled' : '') + ' aria-label="Bajar">↓</button>' +
          '<button class="boton boton--fantasma boton--pequeno" type="button" data-accion="borrar">' +
            'Eliminar</button>' +
        '</div>' +
        col.grupos.map(function (g) {
          return '<div class="detalle__grupo"><h4>' + esc(g.titulo) + '</h4>' +
            '<div class="detalle__campos' + (g.dobles ? ' detalle__campos--2' : '') + '">' +
              camposDe(g).map(function (c) { return campo(c, base + '.' + c.c); }).join('') +
            '</div></div>';
        }).join('') +
      '</div>' +
      (col.vista
        ? '<aside class="vista"><p class="vista__titulo">' + icono('lupa', 14) +
            'Así queda</p><div class="vista__lienzo" id="pn-vista">' +
            col.vista(item) + '</div>' +
            '<p class="vista__nota">Se actualiza según escribes.</p></aside>'
        : '') +
    '</div>';
  }

  function montaColeccion() {
    var z = document.getElementById('pn-zona');
    var col = COLECCIONES[seccion];

    var buscar = document.getElementById('pn-buscar');
    buscar.addEventListener('input', function () {
      filtro = buscar.value;
      document.getElementById('pn-lista').innerHTML = filas(col, lee(datos, col.ruta) || []);
      z.querySelector('.buscador__limpiar').hidden = !filtro;
    });
    z.querySelector('.buscador__limpiar').addEventListener('click', function () {
      filtro = ''; buscar.value = ''; buscar.focus();
      document.getElementById('pn-lista').innerHTML = filas(col, lee(datos, col.ruta) || []);
      this.hidden = true;
    });

    document.getElementById('pn-lista').addEventListener('click', function (e) {
      var b = e.target.closest('[data-i]');
      if (!b) return;
      indice = +b.getAttribute('data-i');
      refrescaColeccion();
      /* en el móvil la ficha queda debajo de la lista: se baja hasta ella */
      var det = document.getElementById('pn-detalle');
      if (det && det.getBoundingClientRect().top > document.getElementById('pn-lista').getBoundingClientRect().bottom) {
        det.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });

    z.addEventListener('click', function (e) {
      if (e.target.closest('[data-volver-lista]')) {
        document.getElementById('pn-lista').scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      var b = e.target.closest('[data-accion]');
      if (!b) return;
      var a = b.getAttribute('data-accion');
      var lista = lee(datos, col.ruta);

      if (a === 'nuevo') { lista.push(col.nueva()); indice = lista.length - 1; }
      if (a === 'duplicar' && lista[indice]) {
        var copia = clona(lista[indice]);
        if (copia.id) copia.id = copia.id + '-copia-' + Date.now().toString(36);
        copia.nombre = (copia.nombre || '') + ' (copia)';
        lista.splice(indice + 1, 0, copia); indice += 1;
      }
      if (a === 'borrar') {
        if (!confirm('¿Eliminar «' + col.nombre(lista[indice]) + '»?')) return;
        lista.splice(indice, 1);
        if (indice >= lista.length) indice = Math.max(0, lista.length - 1);
      }
      if (a === 'subir' && indice > 0) {
        lista.splice(indice - 1, 0, lista.splice(indice, 1)[0]); indice -= 1;
      }
      if (a === 'bajar' && indice < lista.length - 1) {
        lista.splice(indice + 1, 0, lista.splice(indice, 1)[0]); indice += 1;
      }
      marcaSucio();
      pintaNav();
      refrescaColeccion();
    });

    enganchaCampos(z);
  }

  function refrescaColeccion() {
    var col = COLECCIONES[seccion];
    var lista = lee(datos, col.ruta) || [];
    document.getElementById('pn-lista').innerHTML = filas(col, lista);
    document.getElementById('pn-detalle').innerHTML = lista.length ? detalle(col, lista) : vacia();
    enganchaCampos(document.getElementById('pn-detalle'));
  }

  /* Sólo repinta la vista previa y la fila de la lista: si repintáramos todo, el
     cursor saltaría al principio del campo con cada tecla. */
  function refrescaSuave() {
    var col = COLECCIONES[seccion];
    if (!col) return;
    var lista = lee(datos, col.ruta) || [];
    var item = lista[indice];
    if (!item) return;

    var vista = document.getElementById('pn-vista');
    if (vista && col.vista) vista.innerHTML = col.vista(item);

    var fila = document.querySelector('#pn-lista [data-i="' + indice + '"]');
    if (fila) {
      var b = fila.querySelector('.item__txt b'), s = fila.querySelector('.item__txt span');
      if (b) b.textContent = col.nombre(item);
      if (s) s.textContent = col.pie ? col.pie(item) : '';
    }
    var titulo = document.querySelector('.detalle__cabecera h3');
    if (titulo) titulo.textContent = col.nombre(item);
  }

  /* ================================================================ BLOQUES */
  function vistaBloque() {
    var bl = BLOQUES[seccion];
    return '<div class="panel__titulo">' +
        '<h2>' + esc(bl.titulo) + '</h2>' +
        '<p>' + esc(bl.intro) + '</p>' +
      '</div>' +
      '<div class="detalle__caja">' +
        bl.grupos.map(function (g) {
          return '<div class="detalle__grupo"><h4>' + esc(g.titulo) + '</h4>' +
            '<div class="detalle__campos' + (g.dobles ? ' detalle__campos--2' : '') + '">' +
              camposDe(g).map(function (c) { return campo(c, c.r); }).join('') +
            '</div></div>';
        }).join('') +
      '</div>';
  }

  /* ================================================================ CAMPOS */
  function camposDe(g) {
    return typeof g.campos === 'function' ? g.campos() : g.campos;
  }

  function campo(def, ruta) {
    var v = lee(datos, ruta);
    var original = lee(B, ruta);
    var cambiado = JSON.stringify(v) !== JSON.stringify(original);
    var id = 'f-' + ruta.replace(/\./g, '-');
    var ancho = def.ancho ? ' ancho' : '';

    /* el interruptor lleva su etiqueta dentro */
    if (def.t === 'si-no') {
      return '<div class="campo' + ancho + (cambiado ? ' campo--tocado' : '') + '" data-campo="' + esc(ruta) + '">' +
        '<label class="palanca">' +
          '<input type="checkbox" data-ruta="' + esc(ruta) + '" data-tipo="si-no"' +
            (v ? ' checked' : '') + '>' +
          '<span class="palanca__pista" aria-hidden="true"></span>' +
          '<span class="palanca__txt">' + esc(def.e) +
            (def.ayuda ? '<small>' + esc(def.ayuda) + '</small>' : '') + '</span>' +
        '</label>' +
        botonDeshacer(ruta, cambiado) +
      '</div>';
    }

    var control;
    if (def.t === 'area') {
      control = '<textarea id="' + id + '" data-ruta="' + esc(ruta) + '" data-tipo="texto" ' +
        'rows="4">' + esc(v == null ? '' : v) + '</textarea>';
    } else if (def.t === 'lista') {
      control = '<textarea id="' + id + '" data-ruta="' + esc(ruta) + '" data-tipo="lista" ' +
        'rows="5">' + esc((v || []).join('\n')) + '</textarea>';
    } else if (def.t === 'opciones') {
      var ops = typeof def.ops === 'function' ? def.ops() : def.ops;
      control = '<select id="' + id + '" data-ruta="' + esc(ruta) + '" data-tipo="texto">' +
        ops.map(function (o) {
          return '<option value="' + esc(o.v) + '"' + (o.v === v ? ' selected' : '') + '>' +
            esc(o.n) + '</option>';
        }).join('') + '</select>';
    } else if (def.t === 'imagen') {
      var medida = def.medida || medidaDe(seccion);
      control =
        '<div class="imagen" data-importa="' + esc(ruta) + '" ' +
            'data-ancho="' + medida[0] + '" data-alto="' + medida[1] + '"' +
            (def.par ? ' data-par="' + esc(def.par) + '"' : '') + '>' +
          '<span class="imagen__vista" data-vista-de="' + esc(ruta) + '">' +
            '<img src="' + esc(previa(v)) + '" alt="">' + '</span>' +
          '<div>' +
            '<div class="imagen__mandos">' +
              '<button class="boton boton--pequeno" type="button" data-elegir>' +
                icono('guardar', 15) + ' Importar foto…</button>' +
            '</div>' +
            '<input type="file" accept="image/*" data-archivo>' +
            '<input type="text" class="imagen__ruta" id="' + id + '" data-ruta="' + esc(ruta) + '" ' +
              'data-tipo="imagen" list="pn-imagenes" value="' + esc(v == null ? '' : v) + '">' +
            '<p class="imagen__pista">Arrastra una foto aquí o pulsa el botón. Se recorta a ' +
              '<b>' + medida[0] + '×' + medida[1] + '</b> y se convierte a WebP + JPG.</p>' +
          '</div>' +
        '</div>';
    } else if (def.t === 'precio' || def.t === 'numero') {
      control = '<input type="number" id="' + id + '" data-ruta="' + esc(ruta) + '" ' +
        'data-tipo="numero" step="' + (def.t === 'precio' ? '0.01' : '1') + '"' +
        (def.min != null ? ' min="' + def.min + '"' : '') +
        (def.max != null ? ' max="' + def.max + '"' : '') +
        ' value="' + (v == null ? '' : esc(v)) + '">';
    } else {
      control = '<input type="text" id="' + id + '" data-ruta="' + esc(ruta) + '" ' +
        'data-tipo="texto" value="' + esc(v == null ? '' : v) + '">';
    }

    return '<div class="campo' + ancho + (cambiado ? ' campo--tocado' : '') + '" data-campo="' + esc(ruta) + '">' +
      '<div class="campo__cabecera">' +
        '<label for="' + id + '">' + esc(def.e) + '</label>' +
        botonDeshacer(ruta, cambiado) +
      '</div>' +
      control +
      (def.ayuda && def.t !== 'imagen' ? '<p class="campo__ayuda">' + esc(def.ayuda) + '</p>' : '') +
    '</div>';
  }

  function botonDeshacer(ruta, visible) {
    return '<button class="campo__deshacer" type="button" data-deshacer="' + esc(ruta) + '"' +
      (visible ? '' : ' hidden') + '>deshacer</button>';
  }

  function enganchaCampos(ctx) {
    Array.prototype.slice.call(ctx.querySelectorAll('[data-ruta]')).forEach(function (n) {
      var evento = (n.type === 'checkbox' || n.tagName === 'SELECT') ? 'change' : 'input';
      n.addEventListener(evento, function () {
        var tipo = n.getAttribute('data-tipo');
        var v;
        if (tipo === 'si-no') v = n.checked;
        else if (tipo === 'numero') v = n.value === '' ? null : parseFloat(n.value);
        else if (tipo === 'lista') {
          v = n.value.split('\n').map(function (x) { return x.trim(); }).filter(Boolean);
        } else v = n.value;

        pon(n.getAttribute('data-ruta'), v);
        marcaSucio();
        actualizaCampo(n.getAttribute('data-ruta'));
        if (tipo === 'imagen') actualizaMiniatura(n.getAttribute('data-ruta'), v);
        refrescaSuave();
      });
    });

    Array.prototype.slice.call(ctx.querySelectorAll('[data-deshacer]')).forEach(function (b) {
      b.addEventListener('click', function () {
        var ruta = b.getAttribute('data-deshacer');
        var original = lee(B, ruta);
        pon(ruta, original === undefined ? '' : clona({ v: original }).v);
        marcaSucio();
        if (COLECCIONES[seccion]) refrescaColeccion();
        else pintaZona();
      });
    });

    montaImportadores(ctx);

    /* miniaturas rotas bien señaladas desde el principio */
    Array.prototype.slice.call(ctx.querySelectorAll('.imagen__vista img')).forEach(function (img) {
      img.addEventListener('error', function () {
        img.parentElement.setAttribute('data-falla', 'true');
      });
      img.addEventListener('load', function () {
        img.parentElement.removeAttribute('data-falla');
      });
    });
  }

  function actualizaCampo(ruta) {
    var caja = document.querySelector('[data-campo="' + ruta + '"]');
    if (!caja) return;
    var cambiado = JSON.stringify(lee(datos, ruta)) !== JSON.stringify(lee(B, ruta));
    caja.classList.toggle('campo--tocado', cambiado);
    var d = caja.querySelector('[data-deshacer]');
    if (d) d.hidden = !cambiado;
  }

  function actualizaMiniatura(ruta, valor) {
    var v = document.querySelector('[data-vista-de="' + ruta + '"] img');
    if (!v) return;
    v.parentElement.removeAttribute('data-falla');
    v.src = previa(valor);
  }

  /* ==================================================== IMPORTAR IMÁGENES */
  /* El navegador recorta la foto al tamaño exacto que usa esa ficha, la
     convierte a WebP y a JPG de respaldo, y sube los dos al almacén de fotos
     de la base de datos. La dirección se pone sola en la ficha: al publicar,
     la web ya la usa. No hay que copiar nada a ningún sitio. */

  var MEDIDAS = {
    clases: [880, 660]
  };
  function medidaDe(s) { return MEDIDAS[s] || [880, 660]; }

  function previa(ruta) { return R(ruta || ''); }


  function nombreArchivo(rutaActual, item) {
    var base = '';
    var m = String(rutaActual || '').match(/\/assets\/img\/(.+?)\.(webp|jpg|jpeg|png)$/i) ||
      /* foto ya subida al almacén: se le quita la marca de tiempo del final */
      String(rutaActual || '').match(/\/storage\/v1\/object\/public\/web\/img\/(.+?)-[a-z0-9]{8}\.(webp|jpg)$/i);
    if (m) base = m[1];
    else {
      base = P.normaliza((item && (item.id || item.nombre)) || 'imagen').replace(/\s+/g, '-');
      base = (seccion === 'clases' ? 'clase-' : 'foto-') + base;
    }
    return base;
  }

  function dibuja(img, ancho, alto) {
    var lienzo = document.createElement('canvas');
    lienzo.width = ancho; lienzo.height = alto;
    var ctx = lienzo.getContext('2d');
    ctx.imageSmoothingQuality = 'high';

    /* recorte centrado a la proporción de destino, como en el sitio */
    var objetivo = ancho / alto, origen = img.width / img.height;
    var rw = img.width, rh = img.height;
    if (origen > objetivo) rw = img.height * objetivo; else rh = img.width / objetivo;
    ctx.drawImage(img, (img.width - rw) / 2, (img.height - rh) / 2, rw, rh, 0, 0, ancho, alto);
    return lienzo;
  }

  function aBlob(lienzo, tipo, calidad) {
    return new Promise(function (r) { lienzo.toBlob(r, tipo, calidad); });
  }

  function importaFoto(caja, archivo) {
    if (!archivo || !/^image\//.test(archivo.type)) {
      alert('Eso no parece una imagen. Vale JPG, PNG, WebP o HEIC.');
      return;
    }
    var ruta = caja.getAttribute('data-importa');
    var ancho = +caja.getAttribute('data-ancho'), alto = +caja.getAttribute('data-alto');
    var vista = caja.querySelector('.imagen__vista');
    vista.setAttribute('data-cargando', 'true');

    var url = URL.createObjectURL(archivo);
    var img = new Image();
    img.onload = function () {
      var lienzo = dibuja(img, ancho, alto);
      URL.revokeObjectURL(url);

      var col = COLECCIONES[seccion];
      var item = col ? (lee(datos, col.ruta) || [])[indice] : null;
      var base = nombreArchivo(lee(datos, ruta), item);

      Promise.all([
        aBlob(lienzo, 'image/webp', 0.76),
        aBlob(lienzo, 'image/jpeg', 0.82)
      ]).then(function (b) {
        var webp = b[0], jpg = b[1];
        vista.removeAttribute('data-cargando');

        if (!webp) {   // navegador antiguo sin WebP: seguimos sólo con JPG
          webp = jpg;
          alert('Tu navegador no sabe generar WebP, así que se ha creado sólo el JPG. ' +
            'Funciona igual, pesa algo más.');
        }

        /* nombre único: así nunca se sirve una versión vieja desde la caché */
        var nombre = base + '-' + Date.now().toString(36);
        vista.setAttribute('data-cargando', 'true');
        Promise.all([
          G.subirFoto(webp, nombre + (webp === jpg ? '.jpg' : '.webp')),
          webp === jpg ? Promise.resolve(null) : G.subirFoto(jpg, nombre + '.jpg')
        ]).then(function (r) {
          vista.removeAttribute('data-cargando');
          var fallo = r.filter(function (x) { return x && x.error; })[0];
          if (fallo) { tostada(esc(fallo.error), 'mal'); return; }
          var urlWebp = r[0].url, urlJpg = r[1] ? r[1].url : r[0].url;
          pon(ruta, urlWebp);
          var par = caja.getAttribute('data-par');
          if (par) {
            var rutaPar = ruta.replace(/\.[^.]+$/, '.' + par);
            if (lee(datos, rutaPar) !== undefined) pon(rutaPar, urlJpg);
          }
          marcaSucio();
          if (COLECCIONES[seccion]) refrescaColeccion(); else pintaZona();
          tostada('Foto subida (' + Math.round(webp.size / 1024) + ' KB). <b>Sale en la web al publicar.</b>');
        });
      });
    };
    img.onerror = function () {
      vista.removeAttribute('data-cargando');
      URL.revokeObjectURL(url);
      alert('No se ha podido leer esa imagen. Prueba a exportarla como JPG o PNG.');
    };
    img.src = url;
  }

  function montaImportadores(ctx) {
    Array.prototype.slice.call(ctx.querySelectorAll('[data-importa]')).forEach(function (caja) {
      var entrada = caja.querySelector('[data-archivo]');
      caja.querySelector('[data-elegir]').addEventListener('click', function () { entrada.click(); });
      entrada.addEventListener('change', function () {
        if (entrada.files && entrada.files[0]) importaFoto(caja, entrada.files[0]);
        entrada.value = '';
      });
      ['dragenter', 'dragover'].forEach(function (ev) {
        caja.addEventListener(ev, function (e) {
          e.preventDefault(); caja.setAttribute('data-soltando', 'true');
        });
      });
      ['dragleave', 'drop'].forEach(function (ev) {
        caja.addEventListener(ev, function (e) {
          e.preventDefault(); caja.removeAttribute('data-soltando');
        });
      });
      caja.addEventListener('drop', function (e) {
        var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (f) importaFoto(caja, f);
      });
    });
  }

  /* Sugerencias del selector de imagen: todas las que ya usa el sitio */
  function listaImagenes() {
    var vistas = {};
    JSON.stringify(datos).replace(/\/assets\/img\/[^"]+/g, function (m) { vistas[m] = 1; return m; });
    return '<datalist id="pn-imagenes">' +
      Object.keys(vistas).sort().map(function (x) {
        return '<option value="' + esc(x) + '">';
      }).join('') + '</datalist>';
  }

  /* ============================================================== HORARIOS */
  /* Se ve un día cada vez (el de hoy al entrar): así el cuadro cabe en el
     móvil y es fácil cambiar la hora de una clase concreta. «Toda la semana»
     enseña el cuadro entero, ordenado. */
  var diaHorario = P.diaSemana(new Date());

  function vistaHorarios() {
    var DIAS = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    var CORTOS = ['', 'L', 'M', 'X', 'J', 'V', 'S', 'D'];
    var h = datos.agenda.horario;
    var filas = h.map(function (s, i) { return { s: s, i: i }; })
      .filter(function (o) { return diaHorario === 0 || o.s.dia === diaHorario; })
      .sort(function (a, b) { return (a.s.dia - b.s.dia) || (a.s.hora < b.s.hora ? -1 : a.s.hora > b.s.hora ? 1 : 0); });

    return '<div class="panel__titulo">' +
        '<h2>Horarios</h2>' +
        '<p>Qué clase, a qué hora, en qué centro y con cuántas plazas. Es lo que ve el ' +
          'socio al reservar.</p>' +
      '</div>' +

      '<div class="p-dias" role="group" aria-label="Día">' +
        [1, 2, 3, 4, 5, 6, 7].map(function (d) {
          var n = h.filter(function (s) { return s.dia === d; }).length;
          return '<button type="button" class="p-dia-btn" data-ver-dia="' + d + '"' +
            (diaHorario === d ? ' aria-pressed="true"' : '') + ' aria-label="' + DIAS[d] + ', ' + n + ' clases">' +
            '<b>' + CORTOS[d] + '</b><small>' + n + '</small></button>';
        }).join('') +
        '<button type="button" class="p-dia-btn p-dia-btn--todo" data-ver-dia="0"' +
          (diaHorario === 0 ? ' aria-pressed="true"' : '') + '><b>Semana</b><small>' + h.length + '</small></button>' +
      '</div>' +

      '<div class="detalle__caja">' +
        '<h3 class="p-cuadro-titulo">' + (diaHorario ? DIAS[diaHorario] : 'Toda la semana') +
          ' · ' + filas.length + (filas.length === 1 ? ' clase' : ' clases') + '</h3>' +
        (filas.length ? '<table class="p-cuadro">' +
          '<thead><tr>' +
            ['Día', 'Hora', 'Clase', 'Centro', 'Monitor', 'Plazas', ''].map(function (t) {
              return '<th>' + t + '</th>';
            }).join('') +
          '</tr></thead><tbody>' +
          filas.map(function (o) {
            var s = o.s, i = o.i;
            return '<tr>' +
              '<td class="p-c-dia" data-et="Día"><select class="selector" data-ruta="agenda.horario.' + i + '.dia" data-tipo="numero">' +
                [1, 2, 3, 4, 5, 6, 7].map(function (d) {
                  return '<option value="' + d + '"' + (s.dia === d ? ' selected' : '') + '>' + DIAS[d] + '</option>';
                }).join('') + '</select></td>' +
              '<td class="p-c-hora" data-et="Hora"><input type="time" class="selector" ' +
                'data-ruta="agenda.horario.' + i + '.hora" data-tipo="texto" value="' + esc(s.hora) + '"></td>' +
              '<td class="p-c-clase" data-et="Clase"><select class="selector" data-ruta="agenda.horario.' + i + '.clase" data-tipo="texto">' +
                datos.clases.map(function (c) {
                  return '<option value="' + esc(c.id) + '"' + (s.clase === c.id ? ' selected' : '') + '>' + esc(c.nombre) + '</option>';
                }).join('') + '</select></td>' +
              '<td class="p-c-centro" data-et="Centro"><select class="selector" data-ruta="agenda.horario.' + i + '.centro" data-tipo="texto">' +
                datos.centros.map(function (c) {
                  return '<option value="' + esc(c.id) + '"' + (s.centro === c.id ? ' selected' : '') + '>' + esc(c.nombre) + '</option>';
                }).join('') + '</select></td>' +
              '<td class="p-c-monitor" data-et="Monitor"><input class="selector" data-ruta="agenda.horario.' + i +
                '.monitor" data-tipo="texto" value="' + esc(s.monitor || '') + '" placeholder="Sin asignar"></td>' +
              '<td class="p-c-plazas" data-et="Plazas"><input type="number" class="selector" min="1" inputmode="numeric" ' +
                'data-ruta="agenda.horario.' + i + '.plazas" data-tipo="numero" value="' +
                (s.plazas || datos.agenda.plazasPorDefecto) + '"></td>' +
              '<td class="p-c-quitar"><button class="boton boton--fantasma boton--pequeno" type="button" ' +
                'data-quitar="' + i + '" aria-label="Quitar esta clase">' + icono('cerrar', 14) +
                '<span class="p-solo-movil">Quitar</span></button></td>' +
            '</tr>';
          }).join('') +
        '</tbody></table>' : '<p class="p-nada">Este día no hay clases.</p>') +
        '<div class="coleccion__acciones" style="border-top:1px solid var(--borde);margin-top:var(--e-4)">' +
          '<button class="boton boton--pequeno" type="button" id="pn-nueva-sesion">+ Añadir una clase' +
            (diaHorario ? ' el ' + DIAS[diaHorario].toLowerCase() : '') + '</button>' +
        '</div>' +
      '</div>' +

      '<div class="detalle__caja" style="margin-top:var(--e-5)">' +
        '<div class="campo">' +
          '<label class="palanca">' +
            '<input type="checkbox" data-ruta="agenda.demo" data-tipo="si-no"' +
              (datos.agenda.demo ? ' checked' : '') + '>' +
            '<span class="palanca__pista" aria-hidden="true"></span>' +
            '<span class="palanca__txt">Avisar en la web de que el cuadro es de ejemplo' +
              '<small>Apágalo cuando esté el horario real: quita el aviso rojo de la página.</small>' +
            '</span>' +
          '</label>' +
        '</div>' +
      '</div>';
  }

  function montaHorarios() {
    var z = document.getElementById('pn-zona');
    enganchaCampos(z);
    /* al cambiar el día de una clase, se reordena el cuadro */
    z.addEventListener('change', function (e) {
      if (/\.dia$/.test(e.target.getAttribute('data-ruta') || '')) { pintaNav(); pintaZona(); }
    });
    z.addEventListener('click', function (e) {
      var d = e.target.closest('[data-ver-dia]');
      if (d) { diaHorario = +d.getAttribute('data-ver-dia'); pintaZona(); return; }
      var q = e.target.closest('[data-quitar]');
      if (q) {
        var s = datos.agenda.horario[+q.getAttribute('data-quitar')];
        var a = datos.clases.filter(function (c) { return c.id === s.clase; })[0];
        if (!confirm('¿Quitar ' + (a ? a.nombre : 'esta clase') + ' de las ' + s.hora + '?')) return;
        datos.agenda.horario.splice(+q.getAttribute('data-quitar'), 1);
        marcaSucio(); pintaNav(); pintaZona();
        return;
      }
      if (e.target.closest('#pn-nueva-sesion')) {
        var ultima = datos.agenda.horario[datos.agenda.horario.length - 1] || {};
        datos.agenda.horario.push({
          dia: diaHorario || ultima.dia || 1, hora: '19:00',
          clase: (datos.clases[0] || {}).id, centro: (datos.centros[0] || {}).id,
          monitor: '', plazas: datos.agenda.plazasPorDefecto
        });
        marcaSucio(); pintaNav(); pintaZona();
        var filas = document.querySelectorAll('#pn-zona .p-cuadro tbody tr');
        /* la nueva va a las 19:00: se busca por su índice */
        var ultimaFila = document.querySelector('#pn-zona [data-ruta="agenda.horario.' + (datos.agenda.horario.length - 1) + '.hora"]');
        if (ultimaFila) { ultimaFila.closest('tr').scrollIntoView({ block: 'center', behavior: 'smooth' }); ultimaFila.focus(); }
        else if (filas.length) filas[filas.length - 1].scrollIntoView({ block: 'center' });
      }
    });
  }

  /* ============================================================== PUBLICAR */
  function dialogoPublicar() {
    return listaImagenes() +
      '<div class="publicar" id="pn-dialogo" data-abierto="false" role="dialog" aria-modal="true" ' +
        'aria-labelledby="pn-dlg-t">' +
        '<div class="publicar__caja">' +
          '<h2 id="pn-dlg-t">Publicar los cambios</h2>' +
          '<p id="pn-dlg-resumen"></p>' +
          '<ol class="receta">' +
            '<li><b>Se guarda en la base de datos</b><span>Y la versión anterior queda en el historial, ' +
              'por si hay que volver atrás.</span></li>' +
            '<li><b>La web se reconstruye sola</b><span>Tarda alrededor de un minuto. Si no ves el cambio, ' +
              'recarga la página.</span></li>' +
          '</ol>' +
          '<div style="display:grid;gap:var(--e-3)">' +
            '<button class="boton boton--ancho" type="button" id="pn-publicar-ya">' +
              icono('guardar', 18) + ' Publicar ahora</button>' +
            '<button class="boton boton--fantasma boton--ancho" type="button" id="pn-cerrar-dlg">' +
              'Seguir editando</button>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function montaPublicar() {
    var dlg = document.getElementById('pn-dialogo');
    document.getElementById('pn-publicar-ya').addEventListener('click', publicaYa);
    document.getElementById('pn-cerrar-dlg').addEventListener('click', cierraPublicar);
    dlg.addEventListener('click', function (e) { if (e.target === dlg) cierraPublicar(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && dlg.getAttribute('data-abierto') === 'true') cierraPublicar();
    });
  }

  function abrePublicar() {
    var dlg = document.getElementById('pn-dialogo');
    if (!dlg) return;
    var cambios = cuentaCambios();
    document.getElementById('pn-dlg-resumen').textContent = cambios
      ? 'Has cambiado ' + cambios + (cambios === 1 ? ' cosa' : ' cosas') + ' en la web.'
      : 'No has cambiado nada en la web todavía.';
    document.getElementById('pn-publicar-ya').disabled = !cambios;
    dlg.setAttribute('data-abierto', 'true');
    document.body.classList.add('sin-scroll');
    document.getElementById(cambios ? 'pn-publicar-ya' : 'pn-cerrar-dlg').focus();
  }
  function cierraPublicar() {
    var dlg = document.getElementById('pn-dialogo');
    if (!dlg) return;
    dlg.setAttribute('data-abierto', 'false');
    document.body.classList.remove('sin-scroll');
  }

  function publicaYa() {
    var b = document.getElementById('pn-publicar-ya');
    b.disabled = true; b.setAttribute('data-cargando', 'true');
    var copia = clona(datos);
    hacer(G.publicar(copia), function (r) {
      return r.reconstruye
        ? 'Publicado. <b>La web se actualiza en un minuto.</b>'
        : 'Guardado en la base de datos. <b>Falta el Deploy Hook de Vercel</b> para que la web se actualice sola (Publicación).';
    }, function () {
      reemplazaB(copia);
      publicadoVisto = G.estado().actualizado;
      /* si se ha seguido escribiendo mientras se publicaba, eso sigue como borrador */
      if (JSON.stringify(datos) === JSON.stringify(copia)) { sucio = false; P.almacen.borra(CLAVE_BORRADOR); }
      cierraPublicar();
      pintaEstado();
      if (OPERACION[seccion]) pintaZona();
    }).then(function () { b.disabled = false; b.removeAttribute('data-cargando'); });
  }

  function pintaEstado() {
    pintaCambios();
    var e = document.getElementById('pn-estado');
    if (!e) return;
    if (sucio) e.setAttribute('data-sucio', 'true'); else e.removeAttribute('data-sucio');
    e.querySelector('span').textContent = sucio ? 'Web: cambios sin publicar' : 'Web: todo publicado';
  }

  /* Cuántas hojas del árbol difieren del contenido publicado */
  function cuentaCambios() {
    var n = 0;
    (function anda(a, b) {
      if (a === b) return;
      if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
        if (JSON.stringify(a) !== JSON.stringify(b)) n++;
        return;
      }
      var claves = {}, k;
      for (k in a) claves[k] = 1;
      for (k in b) claves[k] = 1;
      for (k in claves) anda(a[k], b[k]);
    })(datos, B);
    return n;
  }

  /* Copia de seguridad: el contenido publicado como lib/manifest.js */
  function comoArchivo() {
    return '/* =============================================================================\n' +
      '   GIMNASIOS XTREME BURGOS — MANIFIESTO DE MARCA\n' +
      '   -----------------------------------------------------------------------------\n' +
      '   Copia descargada desde el panel el ' +
      new Date().toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' }) + '.\n' +
      '   El contenido de verdad vive en la base de datos; al publicar, la web se\n' +
      '   construye con él. Este archivo es solo el respaldo del repositorio.\n' +
      '   No pongas claves ni secretos aquí: este archivo viaja al navegador.\n' +
      '   ========================================================================== */\n\n' +
      'window.__BRAND__ = ' + JSON.stringify(B, null, 2) + ';\n';
  }

  function descarga() {
    var blob = new Blob([comoArchivo()], { type: 'text/javascript;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'manifest.js';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  }

  window.addEventListener('beforeunload', function (e) {
    if (!sucio || !document.getElementById('pn-zona')) return;
    e.preventDefault(); e.returnValue = '';
  });

  /* ---------------------------------------------------------------- arranque */
  if (!G || !G.activo) { sinBase(); return; }
  hueco.innerHTML = '<p class="p-cargando">Cargando…</p>';
  G.sesionActual().then(function (si) { if (si) arranca(); else pideAcceso(); });
})();
