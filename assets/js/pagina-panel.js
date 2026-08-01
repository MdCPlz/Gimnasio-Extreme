/* =============================================================================
   PANEL DE GESTIÓN
   -----------------------------------------------------------------------------
   Edita el contenido del sitio EN ESTE NAVEGADOR y al final te descarga el
   lib/manifest.js listo para subir. Trabaja sobre un borrador guardado en tu
   dispositivo: puedes cerrar y seguir mañana.

   Cómo está montado:
   · Un esquema (COLECCIONES y BLOQUES) describe qué campos tiene cada cosa.
     Todo lo demás —lista, formulario, vista previa— se genera de ahí, así que
     añadir un campo nuevo es añadir una línea al esquema.
   · Las colecciones van en lista + detalle, con la ficha real pintada al lado
     mientras escribes: se ve lo que va a salir publicado, no un formulario a ciegas.

   La clave sólo desbloquea el editor en este dispositivo: no protege el servidor,
   porque no hay servidor. Si no quieres que sea público, no subas panel.html.
   ========================================================================== */
(function () {
  'use strict';

  var B = window.__BRAND__, P = window.XP, C = window.XC;
  var hueco = document.querySelector('[data-panel]');
  if (!B || !P || !hueco) return;

  var esc = P.esc, icono = P.icono, R = P.ruta;
  var CLAVE_SESION = 'xtreme.panel.abierto';
  var CLAVE_BORRADOR = 'xtreme.panel.borrador';

  function clona(o) { return JSON.parse(JSON.stringify(o)); }

  var datos = P.almacen.lee(CLAVE_BORRADOR, null) || clona(B);
  var sucio = !!P.almacen.lee(CLAVE_BORRADOR, null);
  var seccion = 'inicio';
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
      e.querySelector('span').textContent = 'Sin publicar';
    }
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
      intro: 'Las cuotas de socio. Si rellenas «precio antes», el precio sale ' +
             'tachado y la web calcula sola el porcentaje de descuento.',
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
          { c: 'precio', e: 'Precio', t: 'precio' },
          { c: 'precioAntes', e: 'Precio antes (para la oferta)', t: 'precio',
            ayuda: 'Vacío = sin oferta. Con valor, sale tachado y con el −%.' },
          { c: 'etiqueta', e: 'Etiqueta', t: 'texto',
            ayuda: 'La pegatina de arriba: «La más elegida», «Mejor precio»… Vacío = sin pegatina.' },
          { c: 'destacado', e: 'Destacar con borde lima', t: 'si-no' }
        ] },
        { titulo: 'Qué incluye', campos: [
          { c: 'resumen', e: 'Resumen', t: 'texto', ancho: true },
          { c: 'incluye', e: 'Ventajas', t: 'lista', ancho: true,
            ayuda: 'Una por línea. Cada una sale con su marca de verificación.' },
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

    equipo: {
      titulo: 'Equipo',
      icono: 'persona',
      intro: '⚠ Estas fichas son de ejemplo. Pide al club los nombres, las fotos y ' +
             'la titulación reales antes de publicar.',
      ruta: 'equipo.miembros',
      nombre: function (m) { return m.nombre; },
      pie: function (m) { return m.especialidad; },
      foto: function (m) { return m.foto; },
      vista: function (m) { return C.monitor(m); },
      nueva: function () {
        return { id: 'monitor-' + Date.now(), nombre: 'Nombre', especialidad: 'Sala',
                 bio: '', foto: '/assets/img/equipo-1.webp',
                 fotoFallback: '/assets/img/equipo-1.jpg', alt: 'Monitor' };
      },
      grupos: [
        { titulo: 'Quién es', dobles: true, campos: [
          { c: 'nombre', e: 'Nombre', t: 'texto' },
          { c: 'especialidad', e: 'Especialidad', t: 'texto' },
          { c: 'bio', e: 'Presentación', t: 'area', ancho: true,
            ayuda: 'Dos frases con algo concreto: qué clase lleva, en qué ayuda.' }
        ] },
        { titulo: 'Foto', dobles: true, campos: [
          { c: 'foto', e: 'Foto', t: 'imagen', par: 'fotoFallback' },
          { c: 'fotoFallback', e: 'Respaldo JPG (se rellena solo al importar)', t: 'imagen' },
          { c: 'alt', e: 'Descripción de la foto', t: 'texto', ancho: true }
        ] }
      ]
    },

    centros: {
      titulo: 'Centros',
      icono: 'pin',
      intro: 'Los tres gimnasios. El primero es el que sale como principal en el mapa ' +
             'y en los datos estructurados.',
      ruta: 'centros',
      nombre: function (x) { return x.nombre; },
      pie: function (x) { return x.calle; },
      foto: function (x) { return x.foto; },
      vista: function (x) { return C.centro(x); },
      nueva: function () {
        return { id: 'centro-' + Date.now(), nombre: 'Centro nuevo', zona: '', calle: '',
                 detalle: '', cp: '09005', ciudad: 'Burgos', telefono: '', telefonoTel: '',
                 horario: '24 horas, todos los días del año',
                 coords: { lat: 42.34385, lng: -3.69795 }, maps: '', mapaEmbed: '',
                 foto: '/assets/img/centro-1.webp', fotoFallback: '/assets/img/centro-1.jpg',
                 alt: 'Centro nuevo', principal: false };
      },
      grupos: [
        { titulo: 'Identificación', dobles: true, campos: [
          { c: 'nombre', e: 'Nombre', t: 'texto' },
          { c: 'zona', e: 'Zona', t: 'texto', ayuda: 'El barrio o la plaza: así lo ubica la gente.' }
        ] },
        { titulo: 'Dirección y contacto', dobles: true, campos: [
          { c: 'calle', e: 'Calle', t: 'texto' },
          { c: 'detalle', e: 'Detalle', t: 'texto', ayuda: '«con Plaza de España», por ejemplo.' },
          { c: 'cp', e: 'Código postal', t: 'texto' },
          { c: 'ciudad', e: 'Ciudad', t: 'texto' },
          { c: 'telefono', e: 'Teléfono', t: 'texto' },
          { c: 'telefonoTel', e: 'Teléfono para marcar', t: 'texto',
            ayuda: 'Sin espacios y con prefijo: +34947054800' },
          { c: 'horario', e: 'Horario', t: 'texto', ancho: true }
        ] },
        { titulo: 'Mapa', campos: [
          { c: 'maps', e: 'Enlace de Google Maps', t: 'texto', ancho: true },
          { c: 'mapaEmbed', e: 'Mapa incrustado', t: 'texto', ancho: true,
            ayuda: 'En Google Maps: Compartir → Insertar un mapa → copia sólo la dirección del src.' }
        ] },
        { titulo: 'Foto', dobles: true, campos: [
          { c: 'foto', e: 'Foto', t: 'imagen', par: 'fotoFallback' },
          { c: 'fotoFallback', e: 'Respaldo JPG (se rellena solo al importar)', t: 'imagen' },
          { c: 'alt', e: 'Descripción de la foto', t: 'texto', ancho: true }
        ] }
      ]
    },

    galeria: {
      titulo: 'Galería',
      icono: 'ampliar',
      intro: 'Las fotos del mosaico. La primera ocupa el doble en la rejilla, así que ' +
             'conviene que sea la mejor.',
      ruta: 'galeria.fotos',
      nombre: function (f, i) { return f.alt || 'Foto'; },
      pie: function (f) { return String(f.src || '').split('/').pop(); },
      foto: function (f) { return f.src; },
      nueva: function () {
        return { src: '/assets/img/gal-01.webp', fallback: '/assets/img/gal-01.jpg',
                 alt: 'Foto nueva', ancho: 1200, alto: 800 };
      },
      grupos: [
        { titulo: 'Imagen', dobles: true, campos: [
          { c: 'src', e: 'Foto', t: 'imagen', par: 'fallback', medida: [1200, 800] },
          { c: 'fallback', e: 'Respaldo JPG (se rellena solo al importar)', t: 'imagen', medida: [1200, 800] },
          { c: 'alt', e: 'Descripción de la foto', t: 'texto', ancho: true,
            ayuda: 'Qué se ve. Es lo que lee quien no puede ver la imagen, y lo que sale bajo el visor.' },
          { c: 'ancho', e: 'Ancho en píxeles', t: 'numero' },
          { c: 'alto', e: 'Alto en píxeles', t: 'numero' }
        ] }
      ]
    },

    resenas: {
      titulo: 'Reseñas',
      icono: 'estrella',
      intro: 'Las opiniones del carrusel. Las que apagues se quedan guardadas pero ' +
             'no salen publicadas.',
      ruta: 'resenas.opiniones',
      nombre: function (o) { return o.autor; },
      pie: function (o) { return o.estrellas + '★ · ' + String(o.texto).slice(0, 42) + '…'; },
      marca: function (o) { return o.publicar === false ? 'Oculta' : ''; },
      tono: function (o) { return o.publicar === false ? 'aviso' : ''; },
      vista: function (o) { return C.resena(o); },
      nueva: function () {
        return { autor: 'Cliente de Google', estrellas: 5, texto: '', publicar: true };
      },
      grupos: [
        { titulo: 'La opinión', dobles: true, campos: [
          { c: 'autor', e: 'Quién la firma', t: 'texto' },
          { c: 'estrellas', e: 'Estrellas', t: 'numero', min: 1, max: 5 },
          { c: 'texto', e: 'Texto', t: 'area', ancho: true,
            ayuda: 'Cópiala literal de Google. No la retoques: se nota.' },
          { c: 'publicar', e: 'Sacarla en el carrusel', t: 'si-no', ancho: true }
        ] }
      ]
    }
  };

  /* Bloques sueltos (no son listas): formularios normales */
  var BLOQUES = {
    portada: {
      titulo: 'Portada',
      icono: 'pantalla',
      intro: 'Lo primero que se ve: la presentación por scroll, el titular y los cuatro datos.',
      grupos: [
        { titulo: 'Titular', dobles: true, campos: [
          { r: 'hero.titulillo', e: 'Rótulo pequeño', t: 'texto' },
          { r: 'hero.palabraGigante', e: 'Palabra gigante del fondo', t: 'texto' },
          { r: 'hero.titulo', e: 'Titular', t: 'area', ancho: true,
            ayuda: 'Cada salto de línea es una línea. La última sale en lima.' },
          { r: 'hero.subtitulo', e: 'Subtítulo', t: 'area', ancho: true }
        ] },
        { titulo: 'Botones', dobles: true, campos: [
          { r: 'hero.ctaPrimario.texto', e: 'Botón principal', t: 'texto' },
          { r: 'hero.ctaPrimario.href', e: 'A dónde lleva', t: 'texto' },
          { r: 'hero.ctaSecundario.texto', e: 'Botón secundario', t: 'texto' },
          { r: 'hero.ctaSecundario.href', e: 'A dónde lleva', t: 'texto' }
        ] },
        { titulo: 'Presentación al entrar', campos: [
          { r: 'intro.activa', e: 'Mostrar la presentación por scroll', t: 'si-no',
            ayuda: 'Se salta sola si el visitante ya la vio hoy o pide menos movimiento.' },
          { r: 'intro.fotogramas.0.titulo', e: 'Pantalla 1 · título', t: 'texto' },
          { r: 'intro.fotogramas.0.texto', e: 'Pantalla 1 · texto', t: 'texto' },
          { r: 'intro.fotogramas.1.titulo', e: 'Pantalla 2 · título', t: 'texto' },
          { r: 'intro.fotogramas.1.texto', e: 'Pantalla 2 · texto', t: 'texto' },
          { r: 'intro.fotogramas.2.titulo', e: 'Pantalla 3 · título', t: 'texto' },
          { r: 'intro.fotogramas.2.texto', e: 'Pantalla 3 · texto', t: 'texto' }
        ] },
        { titulo: 'Vídeo de fondo', campos: [
          { r: 'hero.video.activo', e: 'Usar vídeo de fondo', t: 'si-no',
            ayuda: 'Si el archivo no existe se queda la foto. Instrucciones en assets/video/LEEME.txt' }
        ] }
      ]
    },

    oferta: {
      titulo: 'Oferta',
      icono: 'etiqueta',
      intro: 'La franja lima que cruza el sitio, y el aviso de precios pendientes.',
      grupos: [
        { titulo: 'Franja de promoción', campos: [
          { r: 'promocion.activa', e: 'Mostrar la franja', t: 'si-no' },
          { r: 'promocion.etiqueta', e: 'Pegatina', t: 'texto' },
          { r: 'promocion.titulo', e: 'Titular', t: 'texto', ancho: true },
          { r: 'promocion.texto', e: 'Texto', t: 'texto', ancho: true },
          { r: 'promocion.cta.texto', e: 'Enlace', t: 'texto' },
          { r: 'promocion.caduca', e: 'Caduca el', t: 'texto',
            ayuda: 'AAAA-MM-DD. Al llegar la fecha, la franja desaparece sola. Vacío = sin caducidad.' }
        ] },
        { titulo: 'Descuentos por colectivo', dobles: true, campos: [
          { r: 'tarifas.descuentosColectivo.0.nombre', e: 'Colectivo 1', t: 'texto' },
          { r: 'tarifas.descuentosColectivo.0.porcentaje', e: 'Descuento (%)', t: 'numero' },
          { r: 'tarifas.descuentosColectivo.1.nombre', e: 'Colectivo 2', t: 'texto' },
          { r: 'tarifas.descuentosColectivo.1.porcentaje', e: 'Descuento (%)', t: 'numero' },
          { r: 'tarifas.descuentosColectivo.2.nombre', e: 'Colectivo 3', t: 'texto' },
          { r: 'tarifas.descuentosColectivo.2.porcentaje', e: 'Descuento (%)', t: 'numero' }
        ] },
        { titulo: 'Avisos', campos: [
          { r: 'tarifas.aviso', e: 'Aviso rojo sobre los precios', t: 'texto', ancho: true,
            ayuda: 'Déjalo VACÍO cuando los precios ya sean los definitivos.' },
          { r: 'tarifas.letraPequena', e: 'Letra pequeña', t: 'area', ancho: true }
        ] }
      ]
    },

    contacto: {
      titulo: 'Contacto',
      icono: 'telefono',
      intro: 'Teléfonos, correos y horario. Estos datos salen en la cabecera, el pie y ' +
             'los formularios de todo el sitio.',
      grupos: [
        { titulo: 'Teléfono y correo', dobles: true, campos: [
          { r: 'contacto.telefono', e: 'Teléfono principal', t: 'texto' },
          { r: 'contacto.telefonoTel', e: 'Teléfono para marcar', t: 'texto',
            ayuda: 'Sin espacios y con prefijo: +34947054800' },
          { r: 'contacto.email', e: 'Correo de atención', t: 'texto',
            ayuda: '⚠ Confirma cuál es. Aquí llegan los avisos de los formularios.' },
          { r: 'contacto.emailReservas', e: 'Correo de reservas', t: 'texto' },
          { r: 'equipo.empleo.email', e: 'Correo de empleo', t: 'texto' },
          { r: 'contacto.whatsapp', e: 'WhatsApp', t: 'texto',
            ayuda: 'Sólo números, con prefijo: 34947054800. Vacío = sin WhatsApp.' },
          { r: 'contacto.altaOnline', e: 'Enlace de alta online', t: 'texto', ancho: true }
        ] },
        { titulo: 'Horario', campos: [
          { r: 'horario.resumen', e: 'Resumen', t: 'texto', ancho: true },
          { r: 'horario.recepcion', e: 'Horario de recepción', t: 'texto', ancho: true,
            ayuda: '⚠ Pendiente de confirmar con el club.' },
          { r: 'horario.nota', e: 'Nota', t: 'area', ancho: true }
        ] }
      ]
    },

    horaspunta: {
      titulo: 'Horas punta',
      icono: 'grafico',
      intro: 'El gráfico de ocupación. Los umbrales deciden a partir de qué porcentaje ' +
             'una hora se pinta en verde, en lima o en rojo.',
      grupos: [
        { titulo: 'Gráfico', dobles: true, campos: [
          { r: 'ocupacion.activa', e: 'Mostrar el gráfico', t: 'si-no', ancho: true },
          { r: 'ocupacion.titulo', e: 'Título', t: 'texto', ancho: true },
          { r: 'ocupacion.texto', e: 'Texto', t: 'area', ancho: true },
          { r: 'ocupacion.umbrales.tranquilo', e: 'Hasta qué % es «tranquilo»', t: 'numero' },
          { r: 'ocupacion.umbrales.normal', e: 'Hasta qué % es «movido»', t: 'numero',
            ayuda: 'Por encima de esto se pinta en rojo.' },
          { r: 'ocupacion.actualizaCada', e: 'Refrescar cada (segundos)', t: 'numero' }
        ] }
      ]
    },

    seo: {
      titulo: 'SEO y medición',
      icono: 'lupa',
      intro: 'Lo que Google enseña en los resultados y la analítica de visitas.',
      grupos: [
        { titulo: 'Buscadores', campos: [
          { r: 'seo.titulo', e: 'Título', t: 'texto', ancho: true,
            ayuda: 'Máximo 60 caracteres o Google lo corta.' },
          { r: 'seo.descripcion', e: 'Descripción', t: 'area', ancho: true,
            ayuda: 'Entre 140 y 160 caracteres.' }
        ] },
        { titulo: 'Medición', dobles: true, campos: [
          { r: 'legal.analitica.id', e: 'ID de Google Analytics', t: 'texto',
            ayuda: 'Vacío = no se carga nada de Google. Sólo se activa si el visitante acepta cookies.' },
          { r: 'seo.verificacionGoogle', e: 'Verificación de Search Console', t: 'texto' }
        ] }
      ]
    },

    acceso: {
      titulo: 'Acceso al panel',
      icono: 'candado',
      intro: 'La clave de este panel y el repositorio al que apunta el botón de GitHub.',
      grupos: [
        { titulo: 'Panel', dobles: true, campos: [
          { r: 'panel.clave', e: 'Clave del panel', t: 'texto',
            ayuda: 'Al cambiarla tendrás que volver a entrar con la nueva.' },
          { r: 'panel.repo', e: 'Repositorio de GitHub', t: 'texto',
            ayuda: 'usuario/repositorio. Sólo sirve para que el botón sepa a dónde ir.' }
        ] }
      ]
    }
  };

  /* Lo que hay que confirmar antes de publicar. Cada uno sabe comprobarse solo. */
  var PENDIENTES = [
    { id: 'precios', t: 'Confirmar los precios de las cuotas',
      d: 'Xtreme no publica sus precios en ningún sitio: los de la web son de mercado.',
      va: 'planes',
      hecho: function () { return !String(datos.tarifas.aviso || '').trim(); } },
    { id: 'equipo', t: 'Poner los monitores reales',
      d: 'Nombres, fotos y titulación. Ahora hay fichas de ejemplo.',
      va: 'equipo',
      hecho: function () { return datos.equipo.demo === false; } },
    { id: 'horario', t: 'Cargar el cuadro de clases del club',
      d: 'El que hay es una propuesta coherente con «+40 clases a la semana».',
      va: 'horarios',
      hecho: function () { return datos.agenda.demo === false; } },
    { id: 'correo', t: 'Confirmar el correo de atención',
      d: 'El único correo público del club es el de empleo.',
      va: 'contacto',
      hecho: function () { return datos.contacto.email !== 'info@gimnasiosxtreme.es'; } },
    { id: 'recepcion', t: 'Confirmar el horario de recepción',
      d: 'El 24 h es para entrenar; recepción tiene su propio horario.',
      va: 'contacto',
      hecho: function () { return !/⚠|confirmar/i.test(datos.horario.recepcion || '') &&
        datos.horario.recepcion !== B.horario.recepcion; } },
    { id: 'analitica', t: 'Poner el ID de analítica',
      d: 'Sin él no se mide nada. Opcional, pero conviene.',
      va: 'seo',
      hecho: function () { return !!String(datos.legal.analitica.id || '').trim(); } }
  ];

  /* ====================================================== PANTALLA DE CLAVE */
  function pideClave() {
    hueco.innerHTML =
      '<div class="contenedor" style="padding-block:clamp(3rem,10vh,7rem)">' +
        '<div class="acceso">' +
          '<div style="display:grid;place-items:center;margin-bottom:var(--e-5)">' +
            '<span style="width:3rem;height:3rem;display:grid;place-items:center;border-radius:50%;' +
              'background:var(--pizarra);color:var(--lima)">' + icono('candado', 22) + '</span></div>' +
          '<h1>Panel de gestión</h1>' +
          '<p>Edita las clases, las cuotas, las ofertas, el equipo y los textos. ' +
            'Al terminar te descargas el archivo y lo subes.</p>' +
          '<form class="formulario" id="pn-form" novalidate>' +
            '<div class="aviso aviso--error" id="pn-mal" hidden>' + icono('aviso', 18) +
              '<span>Esa clave no es. Está en <code>lib/manifest.js</code>, en el bloque «panel».</span></div>' +
            '<div class="campo"><label for="pn-clave">Clave</label>' +
              '<input type="password" id="pn-clave" autocomplete="current-password" ' +
                'placeholder="Clave del panel" autofocus></div>' +
            '<button class="boton boton--ancho" type="submit">Abrir el panel</button>' +
          '</form>' +
          '<p class="letra-pequena" style="margin-top:var(--e-5)">Esta clave sólo abre el editor ' +
            'en este navegador; no protege el servidor. Si no quieres que el panel sea accesible ' +
            'desde internet, no subas <code>panel.html</code> al alojamiento.</p>' +
        '</div>' +
      '</div>';

    document.getElementById('pn-form').addEventListener('submit', function (e) {
      e.preventDefault();
      if (document.getElementById('pn-clave').value === datos.panel.clave) {
        sessionStorage.setItem(CLAVE_SESION, '1');
        pintaPanel();
      } else {
        document.getElementById('pn-mal').hidden = false;
        document.getElementById('pn-clave').select();
      }
    });
  }

  /* ============================================================ EL ARMAZÓN */
  var NAV = [
    { id: 'inicio', n: 'Repaso', i: 'ok' },
    { id: 'clases', n: 'Clases', i: 'fuego', cuenta: function () { return datos.clases.length; } },
    { id: 'planes', n: 'Cuotas', i: 'tarjeta', cuenta: function () { return datos.tarifas.planes.length; } },
    { id: 'extras', n: 'Bonos', i: 'etiqueta', cuenta: function () { return datos.tarifas.extras.length; } },
    { id: 'oferta', n: 'Ofertas', i: 'etiqueta' },
    { id: 'horarios', n: 'Horarios', i: 'calendario', cuenta: function () { return datos.agenda.horario.length; } },
    { id: 'equipo', n: 'Equipo', i: 'persona', cuenta: function () { return datos.equipo.miembros.length; } },
    { id: 'centros', n: 'Centros', i: 'pin', cuenta: function () { return datos.centros.length; } },
    { id: 'galeria', n: 'Galería', i: 'ampliar', cuenta: function () { return datos.galeria.fotos.length; } },
    { id: 'resenas', n: 'Reseñas', i: 'estrella', cuenta: function () { return datos.resenas.opiniones.length; } },
    { id: 'portada', n: 'Portada', i: 'pantalla' },
    { id: 'horaspunta', n: 'Horas punta', i: 'grafico' },
    { id: 'contacto', n: 'Contacto', i: 'telefono' },
    { id: 'seo', n: 'SEO', i: 'lupa' },
    { id: 'acceso', n: 'Acceso', i: 'candado' }
  ];

  function pintaPanel() {
    hueco.innerHTML =
      '<div class="panel__barra">' +
        '<div class="contenedor">' +
          '<div class="panel__marca">' +
            '<img src="' + esc(R(datos.marca.logo.claro)) + '" alt="" width="169" height="84">' +
            '<span>Panel</span>' +
          '</div>' +
          '<span class="panel__estado" id="pn-estado"' + (sucio ? ' data-sucio="true"' : '') + '>' +
            '<i></i><span>' + (sucio ? 'Sin publicar' : 'Todo publicado') + '</span></span>' +
          '<button class="boton boton--fantasma boton--pequeno" type="button" id="pn-ver">' +
            icono('lupa', 16) + ' Ver la web</button>' +
          '<button class="boton boton--pequeno" type="button" id="pn-publicar">' +
            icono('guardar', 16) + ' Publicar</button>' +
        '</div>' +
      '</div>' +

      '<div class="contenedor" style="padding-top:var(--e-6);padding-bottom:var(--e-9)">' +
        '<div class="panel__cuerpo">' +
          '<nav class="panel__nav" id="pn-nav" aria-label="Secciones del panel"></nav>' +
          '<div id="pn-zona"></div>' +
        '</div>' +
      '</div>' +

      dialogoPublicar();

    document.getElementById('pn-ver').addEventListener('click', function () {
      window.open(R('/index.html'), '_blank', 'noopener');
    });
    document.getElementById('pn-publicar').addEventListener('click', abrePublicar);
    document.getElementById('pn-nav').addEventListener('click', function (e) {
      var b = e.target.closest('[data-va]');
      if (!b) return;
      irA(b.getAttribute('data-va'));
    });
    montaPublicar();
    pintaNav();
    pintaZona();

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
    pintaNav(); pintaZona();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function pintaNav() {
    document.getElementById('pn-nav').innerHTML = NAV.map(function (x) {
      var n = x.cuenta ? x.cuenta() : null;
      return '<button type="button" data-va="' + x.id + '"' +
        (seccion === x.id ? ' aria-current="true"' : '') + '>' +
        icono(x.i, 17) + x.n + (n != null ? '<b>' + n + '</b>' : '') + '</button>';
    }).join('');
  }

  function pintaZona() {
    /* Cambiamos el nodo entero, no sólo su contenido: así los oyentes de la
       sección anterior se van con él y no se acumulan al navegar. */
    var viejo = document.getElementById('pn-zona');
    var z = document.createElement('div');
    z.id = 'pn-zona';
    viejo.replaceWith(z);

    if (seccion === 'inicio') { z.innerHTML = vistaInicio(); montaInicio(); return; }
    if (seccion === 'horarios') { z.innerHTML = vistaHorarios(); montaHorarios(); return; }
    if (COLECCIONES[seccion]) { z.innerHTML = vistaColeccion(); montaColeccion(); return; }
    if (BLOQUES[seccion]) { z.innerHTML = vistaBloque(); enganchaCampos(z); return; }
  }

  /* ================================================================ REPASO */
  function vistaInicio() {
    var faltan = PENDIENTES.filter(function (p) { return !p.hecho(); });
    return '<div class="panel__titulo">' +
        '<h2>Repaso</h2>' +
        '<p>Lo que conviene tener resuelto antes de que la web salga a producción. ' +
          'Cada punto lleva a la sección donde se arregla.</p>' +
      '</div>' +

      '<div class="detalle__caja" style="margin-bottom:var(--e-5)">' +
        '<h3 style="font-size:var(--t-1);margin-bottom:var(--e-4)">' +
          (faltan.length
            ? 'Quedan ' + faltan.length + ' cosas por confirmar'
            : 'Todo confirmado, se puede publicar') + '</h3>' +
        PENDIENTES.map(function (p) {
          var ok = p.hecho();
          return '<div class="pendiente" data-hecho="' + ok + '">' +
            '<span class="pendiente__punto"></span>' +
            '<span class="pendiente__txt"><b>' + esc(p.t) + '</b>' +
              '<span>' + esc(p.d) + '</span></span>' +
            (ok ? '' : '<button type="button" data-va="' + esc(p.va) + '">Arreglarlo</button>') +
          '</div>';
        }).join('') +
      '</div>' +

      '<div class="detalle__caja" style="margin-bottom:var(--e-5)">' +
        '<h3 style="font-size:var(--t-1);margin-bottom:var(--e-4)">Cómo va el contenido</h3>' +
        '<div class="numeros">' +
          '<div class="numero"><b>' + datos.clases.length + '</b><span>clases, ' +
            datos.clases.filter(function (c) { return c.destacada; }).length + ' en portada</span></div>' +
          '<div class="numero"><b>' + datos.tarifas.planes.length + '</b><span>cuotas, ' +
            datos.tarifas.planes.filter(function (p) { return p.precioAntes; }).length +
            ' con oferta</span></div>' +
          '<div class="numero"><b>' + datos.agenda.horario.length + '</b><span>clases a la semana</span></div>' +
          '<div class="numero"><b>' +
            datos.resenas.opiniones.filter(function (o) { return o.publicar !== false; }).length +
            '</b><span>reseñas publicadas</span></div>' +
        '</div>' +
      '</div>' +

      '<div class="repaso">' +
        '<div class="repaso__ficha">' +
          '<h3>' + icono('guardar', 20) + 'Cómo se publica</h3>' +
          '<p style="color:var(--texto-suave);font-size:var(--t--1)">Los cambios se guardan solos ' +
            'aquí, en tu navegador, pero la web pública no cambia hasta que subes el archivo. ' +
            'Pulsa <b>Publicar</b> arriba (o ⌘S) y te explica los pasos.</p>' +
        '</div>' +
        '<div class="repaso__ficha">' +
          '<h3>' + icono('aviso', 20) + 'Si te lías</h3>' +
          '<p style="color:var(--texto-suave);font-size:var(--t--1)">Cada campo que cambies enseña ' +
            'un «deshacer» al lado del nombre, que lo devuelve a como estaba publicado. Y abajo ' +
            'tienes el botón para descartarlo todo de golpe.</p>' +
          '<p style="margin-top:var(--e-4)"><button class="boton boton--fantasma boton--pequeno" ' +
            'type="button" id="pn-descartar">Descartar todos mis cambios</button></p>' +
        '</div>' +
      '</div>';
  }

  function montaInicio() {
    var z = document.getElementById('pn-zona');
    z.addEventListener('click', function (e) {
      var b = e.target.closest('[data-va]');
      if (b) { irA(b.getAttribute('data-va')); return; }
      if (e.target.closest('#pn-descartar')) {
        if (!confirm('¿Seguro? Se pierde todo lo que hayas cambiado y no publicado.')) return;
        P.almacen.borra(CLAVE_BORRADOR);
        datos = clona(B); sucio = false;
        pintaPanel();
      }
    });
  }

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
              g.campos.map(function (c) { return campo(c, base + '.' + c.c); }).join('') +
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
    });

    z.addEventListener('click', function (e) {
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
              g.campos.map(function (c) { return campo(c, c.r); }).join('') +
            '</div></div>';
        }).join('') +
      '</div>';
  }

  /* ================================================================ CAMPOS */
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
        else { var z = document.getElementById('pn-zona'); z.innerHTML = vistaBloque(); enganchaCampos(z); }
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
  /* No hay servidor donde subir archivos, así que el trabajo lo hace el propio
     navegador: recorta la foto al tamaño exacto que usa esa ficha, la convierte
     a WebP y a JPG de respaldo, y te descarga los dos con el nombre correcto.
     Sólo queda copiarlos a assets/img/. La ruta del manifiesto se pone sola. */

  var MEDIDAS = {
    clases: [880, 660], equipo: [640, 800], centros: [760, 570],
    galeria: [1200, 800], portada: [1600, 900]
  };
  function medidaDe(s) { return MEDIDAS[s] || [880, 660]; }

  /* Vistas previas de lo recién importado: viven mientras no recargues */
  var previas = {};
  function previa(ruta) { return previas[ruta] || R(ruta || ''); }

  /* Archivos que el usuario todavía no ha copiado a la carpeta */
  var porCopiar = [];

  function nombreArchivo(rutaActual, item) {
    var base = '';
    var m = String(rutaActual || '').match(/\/assets\/img\/(.+?)\.(webp|jpg|jpeg|png)$/i);
    if (m) base = m[1];
    else {
      base = P.normaliza((item && (item.id || item.nombre)) || 'imagen').replace(/\s+/g, '-');
      base = (seccion === 'clases' ? 'clase-' : seccion === 'equipo' ? 'equipo-' :
              seccion === 'centros' ? 'centro-' : 'foto-') + base;
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

  function bajaBlob(blob, nombre) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = nombre;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
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

        bajaBlob(webp, base + '.webp');
        setTimeout(function () { bajaBlob(jpg, base + '.jpg'); }, 350);

        /* ruta del WebP y, si la ficha lo tiene, la del JPG de respaldo */
        var rutaWebp = '/assets/img/' + base + '.webp';
        var rutaJpg = '/assets/img/' + base + '.jpg';
        pon(ruta, rutaWebp);
        previas[rutaWebp] = URL.createObjectURL(webp);
        previas[rutaJpg] = previas[rutaWebp];

        var par = caja.getAttribute('data-par');
        if (par) {
          var rutaPar = ruta.replace(/\.[^.]+$/, '.' + par);
          if (lee(datos, rutaPar) !== undefined) pon(rutaPar, rutaJpg);
        }

        apunta(base + '.webp', Math.round(webp.size / 1024));
        apunta(base + '.jpg', Math.round(jpg.size / 1024));

        marcaSucio();
        if (COLECCIONES[seccion]) refrescaColeccion(); else pintaZona();
        avisaCopiar();
      });
    };
    img.onerror = function () {
      vista.removeAttribute('data-cargando');
      URL.revokeObjectURL(url);
      alert('No se ha podido leer esa imagen. Prueba a exportarla como JPG o PNG.');
    };
    img.src = url;
  }

  function apunta(nombre, kb) {
    porCopiar = porCopiar.filter(function (x) { return x.n !== nombre; });
    porCopiar.push({ n: nombre, kb: kb });
  }

  /* Recordatorio flotante para que no se quede a medias */
  function avisaCopiar() {
    var zona = document.getElementById('pn-zona');
    if (!zona || !porCopiar.length) return;
    var previo = zona.querySelector('.porcopiar');
    var html =
      '<div class="porcopiar">' + icono('guardar', 18) +
        '<div><b>' + porCopiar.length + ' archivo' + (porCopiar.length === 1 ? '' : 's') +
          ' descargado' + (porCopiar.length === 1 ? '' : 's') + ': cópialo' +
          (porCopiar.length === 1 ? '' : 's') + ' a <code>assets/img/</code></b>' +
          '<span>Están en tu carpeta de Descargas. La ruta ya está puesta en la ficha; ' +
          'sólo falta mover los archivos.</span>' +
          '<ul>' + porCopiar.map(function (f) {
            return '<li><code>' + esc(f.n) + '</code> · ' + f.kb + ' KB</li>';
          }).join('') + '</ul>' +
        '</div>' +
      '</div>';
    if (previo) previo.outerHTML = html;
    else zona.insertAdjacentHTML('afterbegin', html);
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
  function vistaHorarios() {
    var DIAS = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    var h = datos.agenda.horario;

    return '<div class="panel__titulo">' +
        '<h2>Cuadro de clases</h2>' +
        '<p>Qué clase, a qué hora, en qué centro y con cuántas plazas. Es lo que ve el ' +
          'socio al reservar. ⚠ El de ahora es una propuesta: sustitúyelo por el real.</p>' +
      '</div>' +

      '<div class="detalle__caja" style="margin-bottom:var(--e-5)">' +
        '<div class="campo">' +
          '<label class="palanca">' +
            '<input type="checkbox" data-ruta="agenda.demo" data-tipo="si-no"' +
              (datos.agenda.demo ? ' checked' : '') + '>' +
            '<span class="palanca__pista" aria-hidden="true"></span>' +
            '<span class="palanca__txt">Avisar de que el cuadro es de ejemplo' +
              '<small>Apágalo cuando cargues el horario real: quita el aviso rojo de la página.</small>' +
            '</span>' +
          '</label>' +
        '</div>' +
      '</div>' +

      '<div class="detalle__caja">' +
        '<div style="overflow-x:auto">' +
          '<table style="width:100%;border-collapse:collapse;font-size:var(--t--1);min-width:44rem">' +
            '<thead><tr>' +
              ['Día', 'Hora', 'Clase', 'Centro', 'Monitor', 'Plazas', ''].map(function (t) {
                return '<th style="text-align:left;padding:var(--e-2);border-bottom:1px solid var(--borde);' +
                  'font-family:var(--tipo-titulo);color:var(--lima);font-size:0.7rem;' +
                  'letter-spacing:.08em;text-transform:uppercase">' + t + '</th>';
              }).join('') +
            '</tr></thead><tbody>' +
            h.map(function (s, i) {
              return '<tr>' +
                celda('<select class="selector" data-ruta="agenda.horario.' + i + '.dia" data-tipo="numero">' +
                  [1, 2, 3, 4, 5, 6, 7].map(function (d) {
                    return '<option value="' + d + '"' + (s.dia === d ? ' selected' : '') + '>' +
                      DIAS[d] + '</option>';
                  }).join('') + '</select>') +
                celda('<input type="time" class="selector" style="width:6.5rem" ' +
                  'data-ruta="agenda.horario.' + i + '.hora" data-tipo="texto" value="' + esc(s.hora) + '">') +
                celda('<select class="selector" data-ruta="agenda.horario.' + i + '.clase" data-tipo="texto">' +
                  datos.clases.map(function (c) {
                    return '<option value="' + esc(c.id) + '"' + (s.clase === c.id ? ' selected' : '') + '>' +
                      esc(c.nombre) + '</option>';
                  }).join('') + '</select>') +
                celda('<select class="selector" data-ruta="agenda.horario.' + i + '.centro" data-tipo="texto">' +
                  datos.centros.map(function (c) {
                    return '<option value="' + esc(c.id) + '"' + (s.centro === c.id ? ' selected' : '') + '>' +
                      esc(c.nombre) + '</option>';
                  }).join('') + '</select>') +
                celda('<input class="selector" style="width:7rem" data-ruta="agenda.horario.' + i +
                  '.monitor" data-tipo="texto" value="' + esc(s.monitor || '') + '">') +
                celda('<input type="number" class="selector" style="width:4.5rem" min="1" ' +
                  'data-ruta="agenda.horario.' + i + '.plazas" data-tipo="numero" value="' +
                  (s.plazas || datos.agenda.plazasPorDefecto) + '">') +
                celda('<button class="boton boton--fantasma boton--pequeno" type="button" ' +
                  'data-quitar="' + i + '" aria-label="Quitar esta clase">' + icono('cerrar', 14) + '</button>') +
              '</tr>';
            }).join('') +
          '</tbody></table>' +
        '</div>' +
        '<div class="coleccion__acciones" style="border-top:1px solid var(--borde);margin-top:var(--e-4)">' +
          '<button class="boton boton--pequeno" type="button" id="pn-nueva-sesion">+ Añadir una clase al cuadro</button>' +
        '</div>' +
      '</div>';
  }

  function celda(html) {
    return '<td style="padding:var(--e-2);border-bottom:1px solid var(--borde);vertical-align:middle">' +
      html + '</td>';
  }

  function montaHorarios() {
    var z = document.getElementById('pn-zona');
    enganchaCampos(z);
    z.addEventListener('click', function (e) {
      var q = e.target.closest('[data-quitar]');
      if (q) {
        datos.agenda.horario.splice(+q.getAttribute('data-quitar'), 1);
        marcaSucio(); pintaNav(); pintaZona();
        return;
      }
      if (e.target.closest('#pn-nueva-sesion')) {
        var ultima = datos.agenda.horario[datos.agenda.horario.length - 1] || {};
        datos.agenda.horario.push({
          dia: ultima.dia || 1, hora: '19:00',
          clase: (datos.clases[0] || {}).id, centro: (datos.centros[0] || {}).id,
          monitor: '', plazas: datos.agenda.plazasPorDefecto
        });
        marcaSucio(); pintaNav(); pintaZona();
        var t = document.querySelector('#pn-zona table');
        if (t) t.scrollIntoView({ block: 'end', behavior: 'smooth' });
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
          '<div id="pn-dlg-pendientes"></div>' +
          '<ol class="receta">' +
            '<li><b>Descarga el archivo</b><span>Se te bajará un <code>manifest.js</code> con todo lo ' +
              'que has cambiado.</span></li>' +
            '<li><b>Súbelo a la carpeta <code>lib/</code></b><span>Por FTP, sustituyendo el ' +
              '<code>lib/manifest.js</code> que ya hay. O arrastrándolo en el panel de tu alojamiento.</span></li>' +
            '<li><b>Recarga la web</b><span>Los cambios salen al instante. Si no los ves, recarga ' +
              'forzando (⌘⇧R).</span></li>' +
          '</ol>' +
          '<div style="display:grid;gap:var(--e-3)">' +
            '<button class="boton boton--ancho" type="button" id="pn-bajar">' +
              icono('guardar', 18) + ' Descargar manifest.js</button>' +
            '<button class="boton boton--fantasma boton--ancho" type="button" id="pn-github">' +
              icono('github', 18) + ' Descargar y abrir GitHub</button>' +
            '<button class="boton boton--fantasma boton--ancho" type="button" id="pn-cerrar-dlg">' +
              'Seguir editando</button>' +
          '</div>' +
          '<p class="letra-pequena" style="margin-top:var(--e-5)">Mientras no subas el archivo, la ' +
            'web pública sigue como estaba. Tus cambios no se pierden: se quedan guardados aquí.</p>' +
        '</div>' +
      '</div>';
  }

  function montaPublicar() {
    var dlg = document.getElementById('pn-dialogo');
    document.getElementById('pn-bajar').addEventListener('click', descarga);
    document.getElementById('pn-github').addEventListener('click', aGitHub);
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
    var pend = document.getElementById('pn-dlg-pendientes');
    pend.innerHTML = porCopiar.length
      ? '<div class="porcopiar" style="margin:0 0 var(--e-5)">' + icono('aviso', 18) +
        '<div><b>No olvides copiar ' + porCopiar.length + ' imagen' +
        (porCopiar.length === 1 ? '' : 'es') + ' a assets/img/</b>' +
        '<ul>' + porCopiar.map(function (f) {
          return '<li><code>' + esc(f.n) + '</code></li>'; }).join('') + '</ul></div></div>'
      : '';
    document.getElementById('pn-dlg-resumen').textContent = cambios
      ? 'Has cambiado ' + cambios + (cambios === 1 ? ' cosa' : ' cosas') +
        '. Tres pasos y está publicado.'
      : 'No has cambiado nada todavía, pero puedes descargar el archivo igualmente.';
    dlg.setAttribute('data-abierto', 'true');
    document.body.classList.add('sin-scroll');
    document.getElementById('pn-bajar').focus();
  }
  function cierraPublicar() {
    var dlg = document.getElementById('pn-dialogo');
    if (!dlg) return;
    dlg.setAttribute('data-abierto', 'false');
    document.body.classList.remove('sin-scroll');
  }

  /* Cuántas hojas del árbol difieren del manifiesto publicado */
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

  function comoArchivo() {
    return '/* =============================================================================\n' +
      '   GIMNASIOS XTREME BURGOS — MANIFIESTO DE MARCA\n' +
      '   -----------------------------------------------------------------------------\n' +
      '   Generado desde el panel de gestión el ' +
      new Date().toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' }) + '.\n' +
      '   Éste es el ÚNICO archivo que hay que tocar para cambiar el contenido del sitio.\n' +
      '   No pongas claves ni secretos aquí: este archivo viaja al navegador.\n' +
      '   ========================================================================== */\n\n' +
      'window.__BRAND__ = ' + JSON.stringify(datos, null, 2) + ';\n';
  }

  function descarga() {
    var blob = new Blob([comoArchivo()], { type: 'text/javascript;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'manifest.js';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);

    var e = document.getElementById('pn-estado');
    if (e) {
      e.removeAttribute('data-sucio');
      e.querySelector('span').textContent = 'Descargado · súbelo a lib/';
    }
  }

  function aGitHub() {
    var repo = String(datos.panel.repo || '').trim();
    descarga();
    if (!repo) {
      alert('Para que este botón lleve a tu repositorio, ponlo en «Acceso → Repositorio de ' +
        'GitHub» (por ejemplo: miusuario/xtreme-web).\n\n' +
        'El archivo ya se te ha descargado: súbelo a lib/manifest.js.');
      return;
    }
    window.open('https://github.com/' + repo + '/edit/main/lib/manifest.js', '_blank', 'noopener');
  }

  window.addEventListener('beforeunload', function (e) {
    if (!sucio) return;
    e.preventDefault(); e.returnValue = '';
  });

  if (sessionStorage.getItem(CLAVE_SESION) === '1') pintaPanel();
  else pideClave();
})();
