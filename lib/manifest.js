/* =============================================================================
   GIMNASIOS XTREME BURGOS — MANIFIESTO DE MARCA
   -----------------------------------------------------------------------------
   Éste es el ÚNICO archivo que hay que tocar para cambiar el contenido del sitio.
   Nombres, teléfonos, precios, clases, monitores, reseñas, horarios y textos
   legales viven aquí. El resto del código sólo lee de `window.__BRAND__`.

   PROCEDENCIA DE LOS DATOS
   · Direcciones, teléfonos, clases, cifras de instalaciones y marcas de
     equipamiento: tomados de gimnasiosxtreme.es (consultado el 1 de agosto de
     2026) y de su sistema de altas gimnasiosxtreme.provis.es.
   · Razón social, NIF y domicilio fiscal: pie de gimnasiosxtreme.provis.es.
   · Valoración de Google: 4,5 sobre 101 reseñas (ficha del encargo).

   TODO LO MARCADO CON ⚠ HAY QUE CONFIRMARLO CON EL CLIENTE ANTES DE PUBLICAR.

   Reglas:
   · No pongas claves ni secretos aquí (este archivo viaja al navegador).
     Las claves van en variables de entorno. Ver README.md y .env.example.
   ========================================================================== */

window.__BRAND__ = {

  /* ---------------------------------------------------------------- identidad */
  nombre: 'Xtreme',
  nombreCompleto: 'Gimnasios Xtreme Burgos',
  nombreLegal: 'Fitness Sarmiento S.L.',
  nif: 'B09557158',
  claim: 'Tres gimnasios. Una cuota. 24 horas.',
  slogan: 'Tu gimnasio en Burgos, abierto siempre.',
  descripcion:
    'Tres gimnasios en Burgos abiertos las 24 horas todos los días del año. Con una sola ' +
    'cuota entras en los tres: 3.800 m² de instalaciones, 600 m² de peso libre, 120 máquinas ' +
    'guiadas, 100 puestos de cardio, 6 salas de clases colectivas y más de 40 clases dirigidas ' +
    'a la semana. Sauna en los tres centros y asesoramiento continuo.',
  web: 'https://gimnasiosxtreme.es',
  dominio: 'gimnasiosxtreme.es',
  idioma: 'es-ES',
  zonaHoraria: 'Europe/Madrid',

  /* ----------------------------------------------------------------- contacto */
  contacto: {
    telefono: '947 05 48 00',
    telefonoTel: '+34947054800',            // para href="tel:"
    whatsapp: '',                            // ⚠ si tienen WhatsApp, ponlo aquí: '34947054800'
    /* ⚠ El único correo público de la empresa es el de empleo. Confirma cuál es
       la dirección de atención al cliente antes de publicar: es la que recibirá
       los avisos de reservas y del formulario de contacto. */
    email: 'info@gimnasiosxtreme.es',
    emailReservas: 'info@gimnasiosxtreme.es',
    emailEmpleo: 'trabajaconnosotros@gimnasiosxtreme.es',
    direccion: {                             // sede principal, la de la ficha
      calle: 'Av. del Cid Campeador, 10',
      cp: '09005',
      ciudad: 'Burgos',
      provincia: 'Burgos',
      comunidad: 'Castilla y León',
      pais: 'España',
      paisISO: 'ES'
    },
    /* Domicilio fiscal de la sociedad (para el aviso legal, no es un centro) */
    domicilioFiscal: 'C/ Petronila Casado, 20 · 09005 Burgos',
    /* Sistema de altas y reserva de clases del cliente (Provis) */
    altaOnline: 'https://gimnasiosxtreme.provis.es/Public/Inicio.aspx'
  },

  /* ------------------------------------------------------------------ centros */
  /* Los tres gimnasios. El primero es el principal y el que sale en el mapa.
     ⚠ Las coordenadas son aproximadas a partir de la dirección postal: si el
     alfiler no cae en la puerta, ajústalas aquí (lat/lng) y listo. */
  centros: [
    {
      id: 'xtreme-1',
      nombre: 'Xtreme 1',
      zona: 'Plaza de España',
      calle: 'Av. del Cid Campeador, 10',
      detalle: 'con Plaza de España',
      cp: '09005',
      ciudad: 'Burgos',
      telefono: '947 05 48 00',
      telefonoTel: '+34947054800',
      horario: '24 horas, todos los días del año',
      coords: { lat: 42.34385, lng: -3.69795 },
      maps: 'https://www.google.com/maps/search/?api=1&query=Gimnasio+Xtreme%2C+Av.+del+Cid+Campeador+10%2C+09005+Burgos',
      mapaEmbed: 'https://www.google.com/maps?q=Av.+del+Cid+Campeador+10,+09005+Burgos&hl=es&z=16&output=embed',
      foto: '/assets/img/centro-1.webp',
      fotoFallback: '/assets/img/centro-1.jpg',
      alt: 'Sala de fitness del centro Xtreme 1 en la avenida del Cid Campeador',
      principal: true
    },
    {
      id: 'xtreme-2',
      nombre: 'Xtreme 2',
      zona: 'Plaza Francisco Sarmiento',
      calle: 'Plaza Francisco Sarmiento',
      detalle: '',
      cp: '09005',
      ciudad: 'Burgos',
      telefono: '947 07 68 77',
      telefonoTel: '+34947076877',
      horario: '24 horas, todos los días del año',
      coords: { lat: 42.34165, lng: -3.69640 },
      maps: 'https://www.google.com/maps/search/?api=1&query=Gimnasio+Xtreme+2%2C+Plaza+Francisco+Sarmiento%2C+09005+Burgos',
      mapaEmbed: 'https://www.google.com/maps?q=Plaza+Francisco+Sarmiento,+09005+Burgos&hl=es&z=16&output=embed',
      foto: '/assets/img/centro-2.webp',
      fotoFallback: '/assets/img/centro-2.jpg',
      alt: 'Zona de máquinas del centro Xtreme 2, en la plaza Francisco Sarmiento',
      principal: false
    },
    {
      id: 'xtreme-3',
      nombre: 'Xtreme 3',
      zona: 'Valencia del Cid',
      calle: 'Av. de Valencia del Cid, 1',
      detalle: '',
      cp: '09002',
      ciudad: 'Burgos',
      telefono: '947 27 67 23',
      telefonoTel: '+34947276723',
      horario: '24 horas, todos los días del año',
      coords: { lat: 42.34760, lng: -3.70455 },
      maps: 'https://www.google.com/maps/search/?api=1&query=Gimnasio+Xtreme+3%2C+Av.+de+Valencia+del+Cid+1%2C+09002+Burgos',
      mapaEmbed: 'https://www.google.com/maps?q=Av.+de+Valencia+del+Cid+1,+09002+Burgos&hl=es&z=16&output=embed',
      foto: '/assets/img/centro-3.webp',
      fotoFallback: '/assets/img/centro-3.jpg',
      alt: 'Sala de peso libre del centro Xtreme 3, en la avenida de Valencia del Cid',
      principal: false
    }
  ],

  /* ------------------------------------------------------------------- redes */
  redes: [
    { id: 'instagram', nombre: 'Instagram', url: 'https://www.instagram.com/xtreme_gimnasios/' },
    { id: 'facebook',  nombre: 'Facebook',  url: 'https://www.facebook.com/xtremeburgos' }
  ],

  /* ----------------------------------------------------------------- horario */
  horario: {
    resumen: '24 horas, todos los días del año',
    nota: 'Los tres centros abren las 24 horas los 365 días. El acceso fuera del horario ' +
          'de recepción se hace con la tarjeta de socio.',
    recepcion: 'Recepción atendida de 9:00 a 22:00 de lunes a viernes y de 10:00 a 14:00 los sábados.', // ⚠ confirmar
    dias: [
      { dia: 'Lunes',     abre: '00:00', cierra: '24:00', schema: 'Mo' },
      { dia: 'Martes',    abre: '00:00', cierra: '24:00', schema: 'Tu' },
      { dia: 'Miércoles', abre: '00:00', cierra: '24:00', schema: 'We' },
      { dia: 'Jueves',    abre: '00:00', cierra: '24:00', schema: 'Th' },
      { dia: 'Viernes',   abre: '00:00', cierra: '24:00', schema: 'Fr' },
      { dia: 'Sábado',    abre: '00:00', cierra: '24:00', schema: 'Sa' },
      { dia: 'Domingo',   abre: '00:00', cierra: '24:00', schema: 'Su' }
    ]
  },

  /* -------------------------------------------------------- identidad visual */
  /* Justificación de la paleta: los dos colores salen medidos del logotipo real
     (azul marino #003068 y lima oliva #7C8C2B); el azul se lleva a casi negro
     para las horas nocturnas del 24 h y la lima se sube de brillo para que
     funcione como acento de energía sobre fondo oscuro, así la web ordena la
     identidad que ya tienen en vez de inventar otra. */
  marca: {
    colores: {
      tinta:    '#050D18',   // fondo profundo, casi negro azulado
      acero:    '#0C1A2E',   // superficies elevadas sobre el fondo
      pizarra:  '#16273F',   // bordes y separadores en oscuro
      azul:     '#003068',   // azul del logotipo
      azulVivo: '#3E86D6',   // azul legible sobre fondo oscuro (enlaces, datos)
      lima:     '#C8E62D',   // acento principal: CTA, subrayados, cifras
      oliva:    '#7C8C2B',   // lima del logotipo, para fondos claros
      hueso:    '#F5F6F2',   // fondo claro
      humo:     '#DFE3DA',   // bordes en claro
      gris:     '#8A93A3',   // texto secundario sobre oscuro
      alerta:   '#FF6B57'    // errores de formulario
    },
    tipografia: {
      titulos: "'Archivo', 'Helvetica Neue', Arial, sans-serif",
      texto: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    },
    /* Logotipo oficial del cliente (descargado de gimnasiosxtreme.es).
       `claro` es la versión en negativo: el azul marino del logotipo no llega al
       contraste mínimo sobre el fondo oscuro del sitio, así que ahí se usa esta.
       ⚠ Si el club tiene el logotipo en vectorial (.svg o .ai), pásalo: se vería
       perfecto a cualquier tamaño. El PNG original mide sólo 169×84 px. */
    logo: {
      png: '/assets/img/Logo.png',
      png2x: '/assets/img/logo@3x.png',
      claro: '/assets/img/logo-claro.png',
      claro2x: '/assets/img/logo-claro@3x.png',
      alt: 'Gimnasios Xtreme Burgos, abierto 24 horas',
      proporcion: [169, 84]
    }
  },

  /* --------------------------------------------------------------------- SEO */
  seo: {
    titulo: 'Gimnasios Xtreme Burgos | 3 gimnasios 24 h con una sola cuota',
    tituloCorto: 'Xtreme Burgos',
    descripcion:
      'Tres gimnasios en Burgos abiertos 24 horas todos los días del año con una sola cuota. ' +
      '3.800 m² de instalaciones, 600 m² de peso libre, sauna y más de 40 clases dirigidas a la ' +
      'semana. Av. del Cid Campeador 10, Plaza Francisco Sarmiento y Valencia del Cid 1.',
    keywords: [
      'gimnasio Burgos', 'gimnasio 24 horas Burgos', 'gimnasio Avenida del Cid Burgos',
      'clases dirigidas Burgos', 'crossfit Burgos', 'ciclo indoor Burgos',
      'body pump Burgos', 'pilates Burgos', 'zumba Burgos', 'sauna gimnasio Burgos',
      'peso libre Burgos', 'gimnasio barato Burgos', 'entrenador personal Burgos'
    ],
    ogImage: '/assets/img/og-image.jpg',
    ogImageAlt: 'Gimnasios Xtreme Burgos — tres gimnasios abiertos 24 horas',
    autor: 'Gimnasios Xtreme Burgos',
    verificacionGoogle: ''
  },

  /* ------------------------------------------------- intro cinematográfica */
  /* Se recorre con el scroll antes de entrar a la portada. Se salta sola si el
     visitante ya la ha visto hoy o si tiene activado «reducir movimiento». */
  intro: {
    activa: true,
    saltarTexto: 'Saltar',
    fotogramas: [
      { titulo: 'Son las tres de la mañana', texto: 'y la puerta sigue abierta' },
      { titulo: 'Son las seis de la tarde',  texto: 'y hay sitio en la barra' },
      { titulo: 'Tres gimnasios',            texto: 'una sola cuota' }
    ],
    marca: 'XTREME'
  },

  /* ------------------------------------------------------------------- hero */
  hero: {
    titulillo: 'Burgos · Abierto 24 h',
    titulo: 'Entrena a la hora\nque tú puedas',
    palabraGigante: 'XTREME',
    subtitulo:
      'Tres gimnasios en Burgos, abiertos las 24 horas todos los días del año. Con una sola ' +
      'cuota entras en los tres, cuando quieras y las veces que quieras.',
    ctaPrimario:   { texto: 'Ver tarifas', href: '/tarifas.html' },
    ctaSecundario: { texto: 'Reservar una visita', href: '/reservar.html' },
    /* Vídeo de fondo. Se carga en diferido y sólo en pantallas grandes con buena
       conexión. Si el archivo no existe, se queda el póster: la portada nunca se
       rompe. Instrucciones en assets/video/LEEME.txt */
    video: {
      activo: true,
      mp4: '/assets/video/portada.mp4',
      webm: '/assets/video/portada.webm',
      poster: '/assets/img/hero-poster.webp',
      posterFallback: '/assets/img/hero-poster.jpg',
      alt: 'Sala de entrenamiento de Gimnasios Xtreme Burgos'
    },
    /* Datos que aparecen bajo la portada */
    datos: [
      { cifra: '3',     sufijo: '',   etiqueta: 'gimnasios, una cuota' },
      { cifra: '24',    sufijo: ' h', etiqueta: 'todos los días del año' },
      { cifra: '40',    sufijo: '+',  etiqueta: 'clases a la semana' },
      { cifra: '3.800', sufijo: ' m²', etiqueta: 'de instalaciones' }
    ]
  },

  /* ----------------------------------------------------------- instalaciones */
  /* Cifras publicadas por el propio cliente en gimnasiosxtreme.es/nosotros */
  instalaciones: {
    titulillo: 'Las instalaciones',
    titulo: 'Todo el metro cuadrado, dedicado a entrenar',
    texto:
      'Sin piscina, sin spa y sin listas de espera. Tres centros pensados sólo para fitness, ' +
      'con la sala llena de material y no de pasillos. La misma tarjeta abre los tres.',
    cifras: [
      { valor: 3800, sufijo: ' m²', etiqueta: 'de instalaciones a tu servicio' },
      { valor: 120,  sufijo: '',    etiqueta: 'máquinas guiadas' },
      { valor: 100,  sufijo: '',    etiqueta: 'puestos de cardio' },
      { valor: 600,  sufijo: ' m²', etiqueta: 'de peso libre' },
      { valor: 6,    sufijo: '',    etiqueta: 'salas de clases colectivas' }
    ],
    equipamiento: {
      titulo: 'Con lo que se entrena de verdad',
      texto: 'Máquinas de las marcas que usan los centros de alto rendimiento, renovadas ' +
             'de forma constante.',
      marcas: ['Technogym', 'Hammer Strength', 'Matrix', 'Cybex', 'Life Fitness', 'True', 'Les Mills', 'Precor', 'Azafit']
    },
    servicios: [
      { icono: 'reloj',    titulo: 'Acceso 24/7',           texto: 'Los 365 días del año, con tu tarjeta de socio.' },
      { icono: 'llave',    titulo: 'Los tres centros',      texto: 'Una cuota, tres gimnasios. Entra en el que te pille cerca.' },
      { icono: 'vapor',    titulo: 'Sauna',                 texto: 'En los tres centros, incluida en la cuota.' },
      { icono: 'pantalla', titulo: 'Salas virtuales',       texto: 'Clases proyectadas para entrenar dirigido a cualquier hora.' },
      { icono: 'manzana',  titulo: 'Asesoría nutricional',  texto: 'Nutrifitness, con seguimiento dentro del centro.' },
      { icono: 'pesa',     titulo: 'Asesoramiento continuo', texto: 'Monitores en sala que te corrigen y te planifican.' }
    ]
  },

  /* ------------------------------------------------------------------ clases */
  /* Descripciones tomadas literalmente de gimnasiosxtreme.es/clases (resumidas).
     ⚠ Las duraciones marcadas con «aprox» hay que confirmarlas. */
  categoriasClases: [
    { id: 'fuerza',   nombre: 'Fuerza y tono',    texto: 'Barra, discos y peso corporal para ganar músculo y sujetar la espalda.' },
    { id: 'cardio',   nombre: 'Cardio y quema',   texto: 'Intervalos, bici y coreografía para subir pulsaciones y bajar grasa.' },
    { id: 'cuerpo',   nombre: 'Cuerpo y mente',   texto: 'Movilidad, respiración y control postural. Se sale mejor de lo que se entra.' },
    { id: 'combate',  nombre: 'Combate',          texto: 'Artes marciales y boxeo adaptados a la sala, sin contacto.' }
  ],

  clases: [
    {
      id: 'body-pump', nombre: 'Body Pump', categoria: 'fuerza', destacada: true,
      resumen: 'Tonificación, mejor postura y menos dolores de espalda.',
      texto: 'La original: la clase con barra y discos que fortalece y tonifica todo el cuerpo. ' +
             'Trabajas los principales grupos musculares con squats, presses, elevaciones y curls. ' +
             'Diez tracks, buena música y el peso que tú elijas.',
      duracion: 55, intensidad: 4, nivel: 'Todos los niveles', calorias: '400-600',
      foto: '/assets/img/clase-body-pump.webp', fotoFallback: '/assets/img/clase-body-pump.jpg',
      alt: 'Clase de Body Pump con barra y discos en Gimnasios Xtreme'
    },
    {
      id: 'ciclo-indoor', nombre: 'Ciclo indoor', categoria: 'cardio', destacada: true,
      resumen: 'Cardio, quema de calorías y definición.',
      texto: 'Todo lo que harías sobre una bici de carretera, sobre una estática: llano, ' +
             'puertos y sprints. Tú controlas la resistencia, el monitor marca el ritmo.',
      duracion: 50, intensidad: 5, nivel: 'Todos los niveles', calorias: '450-700',
      foto: '/assets/img/clase-ciclo.webp', fotoFallback: '/assets/img/clase-ciclo.jpg',
      alt: 'Sala de ciclo indoor con bicicletas estáticas'
    },
    {
      id: 'crossfit', nombre: 'Crossfit', categoria: 'fuerza', destacada: true,
      resumen: 'Tono, cardio y resistencia muscular.',
      texto: 'Entrenamiento funcional constantemente variado y a alta intensidad. Fuerza y ' +
             'acondicionamiento completos, con movimientos que luego usas fuera del gimnasio.',
      duracion: 60, intensidad: 5, nivel: 'Intermedio', calorias: '500-800',
      foto: '/assets/img/clase-crossfit.webp', fotoFallback: '/assets/img/clase-crossfit.jpg',
      alt: 'Entrenamiento de crossfit con barras olímpicas'
    },
    {
      id: 'cross-hit-30', nombre: 'Cross-hit 30′', categoria: 'fuerza', destacada: false,
      resumen: 'El crossfit, en media hora.',
      texto: 'La misma idea del entrenamiento funcional a alta intensidad, condensada en ' +
             '30 minutos. Para los días en que sólo tienes ese hueco.',
      duracion: 30, intensidad: 5, nivel: 'Intermedio', calorias: '300-450',
      foto: '/assets/img/clase-crosshit.webp', fotoFallback: '/assets/img/clase-crosshit.jpg',
      alt: 'Entrenamiento funcional de alta intensidad de 30 minutos'
    },
    {
      id: 'aerohiit', nombre: 'Aerohiit', categoria: 'cardio', destacada: true,
      resumen: 'Cardio, fuerza y potencia muscular.',
      texto: 'Movimientos tomados de distintos deportes que mejoran la resistencia ' +
             'cardiovascular y la potencia. Intervalos aeróbicos combinados con fuerza y ' +
             'estabilización postural.',
      duracion: 55, intensidad: 5, nivel: 'Intermedio', calorias: '450-650',
      foto: '/assets/img/clase-aerohiit.webp', fotoFallback: '/assets/img/clase-aerohiit.jpg',
      alt: 'Clase de Aerohiit, entrenamiento por intervalos de alta intensidad'
    },
    {
      id: 'cardio-box', nombre: 'Cardio Box', categoria: 'combate', destacada: true,
      resumen: 'Fuerza, flexibilidad, coordinación y cardio.',
      texto: 'Programa cardiovascular inspirado en las artes marciales, con movimientos de ' +
             'karate, boxeo, taekwondo, tai chi y muay thai. Puñetazos, patadas y katas ' +
             'coreografiados. Sin contacto.',
      duracion: 55, intensidad: 4, nivel: 'Todos los niveles', calorias: '400-600',
      foto: '/assets/img/clase-cardio-box.webp', fotoFallback: '/assets/img/clase-cardio-box.jpg',
      alt: 'Clase de Cardio Box con movimientos de artes marciales'
    },
    {
      id: 'gap-step', nombre: 'Gap-Step', categoria: 'cardio', destacada: false,
      resumen: 'Piernas, glúteos y menos grasa corporal.',
      texto: 'Entrenamiento cardiovascular con step. Dos formatos: el clásico, fácil de ' +
             'seguir y con tracks para dejarse llevar; y el atlético, más directo. Los dos ' +
             'son un buen entreno de intervalos.',
      duracion: 50, intensidad: 4, nivel: 'Todos los niveles', calorias: '350-550',
      foto: '/assets/img/clase-gap-step.webp', fotoFallback: '/assets/img/clase-gap-step.jpg',
      alt: 'Clase de Gap-Step con plataformas de step'
    },
    {
      id: 'gap', nombre: 'GAP', categoria: 'fuerza', destacada: false,
      resumen: 'Glúteos, abdomen y piernas.',
      texto: 'Clase colectiva de tonificación específica. Se trabajan esos tres grupos ' +
             'entre 25 y 30 minutos para que rinda. Apta para todos los niveles: cada uno ' +
             'regula velocidad y repeticiones.',
      duracion: 30, intensidad: 3, nivel: 'Todos los niveles', calorias: '200-350',
      foto: '/assets/img/clase-gap.webp', fotoFallback: '/assets/img/clase-gap.jpg',
      alt: 'Clase de GAP trabajando glúteos, abdomen y piernas'
    },
    {
      id: 'abdominales-xpress', nombre: 'Abdominales Xpress', categoria: 'fuerza', destacada: false,
      resumen: 'Abdomen, en 20 minutos.',
      texto: 'Una clase de abdominales corta y con resultados: decenas de ejercicios, unos ' +
             'más divertidos que otros. Entra bien antes o después de la sala.',
      duracion: 20, intensidad: 3, nivel: 'Todos los niveles', calorias: '120-200',
      foto: '/assets/img/clase-abdominales.webp', fotoFallback: '/assets/img/clase-abdominales.jpg',
      alt: 'Clase corta de abdominales en colchoneta'
    },
    {
      id: 'hipopresivos', nombre: 'Hipopresivos', categoria: 'cuerpo', destacada: false,
      resumen: 'Postura, suelo pélvico y faja abdominal.',
      texto: 'Conjunto de técnicas posturales que bajan la presión intraabdominal y activan ' +
             'de forma refleja el suelo pélvico y la faja abdominal. Muy indicada en ' +
             'posparto y en dolor lumbar.',
      duracion: 45, intensidad: 2, nivel: 'Todos los niveles', calorias: '120-200',
      foto: '/assets/img/clase-hipopresivos.webp', fotoFallback: '/assets/img/clase-hipopresivos.jpg',
      alt: 'Clase de gimnasia abdominal hipopresiva'
    },
    {
      id: 'body-balance', nombre: 'Body Balance', categoria: 'cuerpo', destacada: true,
      resumen: 'Elasticidad, tono y equilibrio entre cuerpo y mente.',
      texto: 'Programa inspirado en yoga, tai chi y pilates que mejora flexibilidad y fuerza. ' +
             'Respiración controlada, concentración, estiramientos y posturas al ritmo de la ' +
             'música. Se sale en calma.',
      duracion: 55, intensidad: 2, nivel: 'Todos los niveles', calorias: '200-300',
      foto: '/assets/img/clase-body-balance.webp', fotoFallback: '/assets/img/clase-body-balance.jpg',
      alt: 'Clase de Body Balance con estiramientos y posturas de yoga'
    },
    {
      id: 'pilates', nombre: 'Pilates', categoria: 'cuerpo', destacada: false,
      resumen: 'Musculatura profunda, equilibrio y columna.',
      texto: 'Trabajo de los músculos internos que sostienen el equilibrio corporal y dan ' +
             'firmeza a la columna. Se usa mucho en rehabilitación, para el dolor de espalda ' +
             'y para corregir la postura.',
      duracion: 55, intensidad: 2, nivel: 'Todos los niveles', calorias: '180-280',
      foto: '/assets/img/clase-pilates.webp', fotoFallback: '/assets/img/clase-pilates.jpg',
      alt: 'Clase de pilates en colchoneta'
    },
    {
      id: 'zumba', nombre: 'Zumba', categoria: 'cardio', destacada: false,
      resumen: 'Cardio y flexibilidad, bailando.',
      texto: 'Música latina e internacional con movimientos de baile. Las rutinas incorporan ' +
             'entrenamiento por intervalos alternando ritmos rápidos y lentos. Se entrena ' +
             'sin darte cuenta de que estás entrenando.',
      duracion: 55, intensidad: 3, nivel: 'Todos los niveles', calorias: '350-500',
      foto: '/assets/img/clase-zumba.webp', fotoFallback: '/assets/img/clase-zumba.jpg',
      alt: 'Clase de Zumba con música latina'
    },
    {
      id: 'kick-boxing', nombre: 'Kick Boxing', categoria: 'combate', destacada: false,
      resumen: 'Técnica de golpeo, resistencia y coordinación.',
      texto: 'Técnica de puño y pierna sobre saco y manoplas, con acondicionamiento físico. ' +
             'Se empieza por la guardia y el desplazamiento: no hace falta saber pegar.',
      duracion: 60, intensidad: 4, nivel: 'Todos los niveles', calorias: '450-650',
      foto: '/assets/img/clase-kickboxing.webp', fotoFallback: '/assets/img/clase-kickboxing.jpg',
      alt: 'Entrenamiento de kick boxing con saco'
    },
    {
      id: 'judo', nombre: 'Judo', categoria: 'combate', destacada: false,
      resumen: 'Agarre, proyección y caída controlada.',
      texto: 'Judo tradicional en tatami: técnica de pie y de suelo, caídas y randori. ' +
             'Disciplina que sirve igual a un adulto que empieza que a quien vuelve tras años.',
      duracion: 60, intensidad: 4, nivel: 'Todos los niveles', calorias: '400-600',
      foto: '/assets/img/clase-judo.webp', fotoFallback: '/assets/img/clase-judo.jpg',
      alt: 'Entrenamiento de judo en tatami'
    },
    {
      id: 'krav-maga', nombre: 'Krav Maga', categoria: 'combate', destacada: false,
      resumen: 'Defensa personal aplicada.',
      texto: 'Sistema de defensa personal basado en reacciones naturales: liberaciones, ' +
             'defensas ante agarre y trabajo de distancia. Sin katas ni competición.',
      duracion: 60, intensidad: 4, nivel: 'Todos los niveles', calorias: '400-600',
      foto: '/assets/img/clase-krav-maga.webp', fotoFallback: '/assets/img/clase-krav-maga.jpg',
      alt: 'Clase de krav maga, defensa personal'
    }
  ],

  /* ----------------------------------------------------------------- tarifas */
  /* ⚠⚠ IMPORTANTE — PRECIOS PROVISIONALES ⚠⚠
     Gimnasios Xtreme NO publica sus precios: no están en gimnasiosxtreme.es ni
     en su sistema de altas (provis). Los importes de abajo son valores de
     mercado coherentes con un gimnasio 24 h de Burgos, puestos para que la web
     esté completa. SUSTITÚYELOS POR LOS REALES ANTES DE PUBLICAR.
     Lo que sí es real y viene de ellos: el modelo 3x1 y que hay descuento en
     las cuotas trimestrales y semestrales. */
  tarifas: {
    titulillo: 'Cuotas',
    titulo: 'Una cuota, tres gimnasios',
    texto: 'Sin permanencia y sin letra pequeña. Pagues lo que pagues, entras en los tres ' +
           'centros las 24 horas y todas las clases dirigidas van incluidas.',
    aviso: 'Precios pendientes de confirmar con el club.',   // pon '' para ocultarlo
    moneda: '€',
    /* `precio` es el precio final; `precioAntes` es el tachado (deja null si no
       hay oferta). `descuento` se calcula solo si pones precioAntes. */
    planes: [
      {
        id: 'mensual', nombre: 'Mensual', periodo: '/mes',
        precio: 32.90, precioAntes: null, destacado: false,
        resumen: 'Sin permanencia, te bajas cuando quieras.',
        incluye: ['Acceso 24 h a los tres centros', 'Todas las clases dirigidas', 'Sauna incluida', 'Asesoramiento en sala'],
        cta: 'Darme de alta'
      },
      {
        id: 'trimestral', nombre: 'Trimestral', periodo: '/3 meses',
        precio: 84.00, precioAntes: 98.70, destacado: true,
        etiqueta: 'La más elegida',
        resumen: 'Tres meses pagados de una vez. Sale a 28 € al mes.',
        incluye: ['Todo lo del plan mensual', 'Matrícula gratis', 'Congelación de 15 días al año', 'Invita a un amigo una vez al mes'],
        cta: 'Darme de alta'
      },
      {
        id: 'semestral', nombre: 'Semestral', periodo: '/6 meses',
        precio: 155.00, precioAntes: 197.40, destacado: false,
        resumen: 'Medio año cerrado. Sale a 25,83 € al mes.',
        incluye: ['Todo lo del plan trimestral', 'Congelación de 30 días', 'Revisión de composición corporal', 'Plan de entrenamiento inicial'],
        cta: 'Darme de alta'
      },
      {
        id: 'anual', nombre: 'Anual', periodo: '/año',
        precio: 279.00, precioAntes: 394.80, destacado: false,
        etiqueta: 'Mejor precio',
        resumen: 'El año entero. Sale a 23,25 € al mes.',
        incluye: ['Todo lo del plan semestral', 'Dos sesiones con entrenador personal', 'Camiseta de socio', 'Sin subidas durante 12 meses'],
        cta: 'Darme de alta'
      }
    ],
    /* Servicios sueltos que no son cuota */
    extras: [
      { id: 'matricula',  nombre: 'Matrícula de alta',        precio: 19.90, precioAntes: null, nota: 'Gratis con cuota trimestral o superior.' },
      { id: 'dia',        nombre: 'Entrada de día',           precio: 8.00,  precioAntes: null, nota: 'Acceso a un centro durante 24 h.' },
      { id: 'bono-10',    nombre: 'Bono de 10 entradas',      precio: 65.00, precioAntes: 80.00, nota: 'Sin caducidad.' },
      { id: 'personal-1', nombre: 'Entrenador personal',      precio: 30.00, precioAntes: null, nota: 'Sesión suelta de 60 minutos.' },
      { id: 'personal-5', nombre: 'Bono 5 sesiones personales', precio: 130.00, precioAntes: 150.00, nota: 'Caduca a los 3 meses.' },
      { id: 'nutricion',  nombre: 'Consulta de nutrición',    precio: 35.00, precioAntes: null, nota: 'Nutrifitness. Incluye estudio y pauta.' }
    ],
    /* Colectivos con precio especial */
    descuentosColectivo: [
      { nombre: 'Estudiante',   porcentaje: 15, nota: 'Con matrícula del curso en vigor.' },
      { nombre: 'Familia',      porcentaje: 10, nota: 'A partir del segundo miembro conviviente.' },
      { nombre: 'Desempleado',  porcentaje: 15, nota: 'Con tarjeta de demanda de empleo.' }
    ],
    letraPequena: 'Precios con IVA incluido. La cuota da acceso a los tres centros durante ' +
                  'las 24 horas del día. Las clases dirigidas requieren reserva de plaza y ' +
                  'están sujetas a aforo.'
  },

  /* --------------------------------------------------------------- promoción */
  /* Franja de oferta que cruza el sitio. Pon `activa: false` y desaparece. */
  promocion: {
    activa: true,
    titulo: 'Descuento en cuotas trimestrales y semestrales',
    texto: 'Entrena en tres gimnasios por el precio de uno, 24/7 todo el año.',
    etiqueta: 'Promoción en vigor',
    cta: { texto: 'Ver cuotas', href: '/tarifas.html' },
    caduca: ''   // 'YYYY-MM-DD' para que se oculte sola; vacío = sin caducidad
  },

  /* ------------------------------------------------------------------ equipo */
  /* ⚠⚠ EQUIPO PENDIENTE DE DATOS REALES ⚠⚠
     La página de monitores del cliente está vacía (el shortcode no llegó a
     configurarse). Alejandro, Susana y Diego son nombres reales citados en las
     reseñas públicas de Google; el resto de la ficha (especialidad, texto y
     foto) es de relleno. PIDE AL CLUB LA PLANTILLA REAL con foto y titulación
     y sustituye este bloque antes de publicar. */
  equipo: {
    titulillo: 'El equipo',
    titulo: 'Los que están en la sala',
    texto: 'Lo que más repiten las reseñas no son las máquinas: son los monitores. ' +
           'Plantilla estable, que te conoce por el nombre y sabe por dónde ibas la semana pasada.',
    demo: true,
    miembros: [
      { id: 'alejandro', nombre: 'Alejandro', especialidad: 'Sala y fuerza',        bio: 'Corrige la técnica antes de subir el peso. Si llevas un mes atascado en el mismo banco, habla con él.', foto: '/assets/img/equipo-1.webp', fotoFallback: '/assets/img/equipo-1.jpg', alt: 'Alejandro, monitor de sala y fuerza' },
      { id: 'susana',    nombre: 'Susana',    especialidad: 'Clases dirigidas',      bio: 'Body Pump y Body Balance. Lleva la clase de forma que el de la última fila también va al ritmo.', foto: '/assets/img/equipo-2.webp', fotoFallback: '/assets/img/equipo-2.jpg', alt: 'Susana, monitora de clases dirigidas' },
      { id: 'diego',     nombre: 'Diego',     especialidad: 'Ciclo indoor',          bio: 'Las clases de ciclo de las dos de la tarde. Marca el ritmo sin dejarse a nadie por el camino.', foto: '/assets/img/equipo-3.webp', fotoFallback: '/assets/img/equipo-3.jpg', alt: 'Diego, monitor de ciclo indoor' },
      { id: 'monitor-4', nombre: 'Nombre',    especialidad: 'Crossfit y funcional',  bio: 'Ficha de ejemplo. Sustituye nombre, foto y texto por los del monitor real.', foto: '/assets/img/equipo-4.webp', fotoFallback: '/assets/img/equipo-4.jpg', alt: 'Ficha de monitor pendiente de completar' },
      { id: 'monitor-5', nombre: 'Nombre',    especialidad: 'Cuerpo y mente',        bio: 'Ficha de ejemplo. Sustituye nombre, foto y texto por los del monitor real.', foto: '/assets/img/equipo-5.webp', fotoFallback: '/assets/img/equipo-5.jpg', alt: 'Ficha de monitor pendiente de completar' },
      { id: 'monitor-6', nombre: 'Nombre',    especialidad: 'Combate',               bio: 'Ficha de ejemplo. Sustituye nombre, foto y texto por los del monitor real.', foto: '/assets/img/equipo-6.webp', fotoFallback: '/assets/img/equipo-6.jpg', alt: 'Ficha de monitor pendiente de completar' }
    ],
    empleo: {
      titulo: 'Trabaja con nosotros',
      texto: 'Buscamos gente que se quede. Envía tu currículum y te contestamos.',
      email: 'trabajaconnosotros@gimnasiosxtreme.es'
    }
  },

  /* ----------------------------------------------------------------- reseñas */
  /* La nota y el número de reseñas se actualizan solos desde /api/rating.
     Los valores de abajo son el respaldo por si la función no responde. */
  resenas: {
    titulillo: 'Lo que dicen',
    titulo: 'Reseñas de Google',
    valoracion: 4.5,
    total: 101,
    fuente: 'Google',
    urlPerfil: 'https://www.google.com/maps/search/?api=1&query=Gimnasio+Xtreme+Burgos',
    /* `publicar: false` mantiene la reseña en el archivo pero fuera del carrusel.
       La tercera es una reseña real negativa: la dejo aquí para que no se pierda,
       pero fuera del carrusel de portada. Ponla en true si prefieres enseñarla. */
    opiniones: [
      { autor: 'Cliente de Google', estrellas: 5, texto: 'Los monitores son muy simpáticos y te ayudan con lo que necesites.', publicar: true },
      { autor: 'Cliente de Google', estrellas: 5, texto: 'Gran equipo, grandes profesionales y muy buen ambiente.', publicar: true },
      { autor: 'Cliente de Google', estrellas: 1, texto: 'Reclamé varias veces y no me han hecho ningún reembolso.', publicar: false }
    ]
  },

  /* ------------------------------------------------------------ horas punta */
  /* Gráfico de ocupación. `patron` son 24 valores (0-100) por día de la semana,
     de las 00:00 a las 23:00. Es la línea base histórica; encima se pinta la
     ocupación en vivo que llega de /api/ocupacion (o simulada si no hay API).
     ⚠ Ajusta estos patrones con los datos reales de los tornos del club. */
  ocupacion: {
    activa: true,
    titulillo: 'Horas punta',
    titulo: '¿Cuándo hay menos gente?',
    texto: 'La sala en tiempo real, centro por centro. Si tu hora está roja, prueba una franja ' +
           'antes: abrimos las 24 horas justo para eso.',
    umbrales: { tranquilo: 35, normal: 65 },   // < tranquilo = verde, < normal = medio, resto = lleno
    etiquetas: { tranquilo: 'Tranquilo', normal: 'Movido', lleno: 'Lleno' },
    actualizaCada: 60,   // segundos entre refrescos del dato en vivo
    aforo: { 'xtreme-1': 220, 'xtreme-2': 160, 'xtreme-3': 180 },
    patron: {
      'xtreme-1': {
        L: [6,4,3,2,3,8,26,48,55,44,38,42,50,46,38,44,62,84,96,88,70,48,28,14],
        M: [6,4,3,2,3,8,25,46,54,43,37,41,49,45,37,43,61,83,95,87,69,47,27,13],
        X: [6,4,3,2,3,8,26,48,55,44,38,42,50,46,38,44,62,85,97,89,71,49,28,14],
        J: [6,4,3,2,3,8,25,46,54,43,37,41,49,45,37,43,60,82,94,86,68,46,27,13],
        V: [6,4,3,2,3,8,24,44,50,40,35,39,47,44,36,41,56,74,82,70,52,36,24,15],
        S: [9,6,4,3,3,4,10,20,34,48,58,62,54,40,32,30,34,40,44,38,28,20,14,10],
        D: [8,5,4,3,3,4,8,16,28,42,52,56,48,36,28,26,30,36,42,40,30,20,13,9]
      },
      'xtreme-2': {
        L: [4,3,2,2,2,6,20,38,44,36,30,33,40,37,30,35,50,68,78,71,56,38,22,11],
        M: [4,3,2,2,2,6,19,37,43,35,29,32,39,36,29,34,49,67,77,70,55,37,21,10],
        X: [4,3,2,2,2,6,20,38,44,36,30,33,40,37,30,35,50,69,79,72,57,39,22,11],
        J: [4,3,2,2,2,6,19,37,43,35,29,32,39,36,29,34,48,66,76,69,54,36,21,10],
        V: [4,3,2,2,2,6,19,35,40,32,28,31,38,35,28,33,45,60,66,56,42,29,19,12],
        S: [7,5,3,2,2,3,8,16,27,38,46,50,43,32,26,24,27,32,35,30,22,16,11,8],
        D: [6,4,3,2,2,3,6,13,22,34,42,45,38,29,22,21,24,29,34,32,24,16,10,7]
      },
      'xtreme-3': {
        L: [5,3,3,2,3,7,22,42,49,39,33,36,44,41,33,38,55,75,86,79,62,42,25,12],
        M: [5,3,3,2,3,7,21,41,48,38,32,35,43,40,32,37,54,74,85,78,61,41,24,11],
        X: [5,3,3,2,3,7,22,42,49,39,33,36,44,41,33,38,55,76,87,80,63,43,25,12],
        J: [5,3,3,2,3,7,21,41,48,38,32,35,43,40,32,37,53,73,84,77,60,40,24,11],
        V: [5,3,3,2,3,7,21,39,44,35,31,34,42,39,31,36,50,66,73,62,46,32,21,13],
        S: [8,5,4,2,2,3,9,18,30,42,51,55,48,35,29,26,30,35,39,33,25,18,12,9],
        D: [7,4,3,2,2,3,7,14,25,37,46,50,42,32,25,23,27,32,37,35,26,18,11,8]
      }
    }
  },

  /* ------------------------------------------------------------- agenda/clases */
  /* Cuadro de clases dirigidas. `plazas` es el aforo de la sala; las reservas que
     se hagan desde la web se descuentan sobre ese número.
     ⚠ Este cuadro horario es una propuesta coherente con «más de 40 clases a la
     semana». Pide el cuadro real al club y sustituye este bloque. */
  agenda: {
    titulillo: 'Cuadro de clases',
    titulo: 'Más de 40 clases a la semana',
    texto: 'Reserva tu plaza desde aquí. Si no puedes venir, cancela y la dejas libre para otro.',
    demo: true,
    plazasPorDefecto: 24,
    horario: [
      /* dia: 1=lunes … 7=domingo */
      { dia: 1, hora: '07:00', clase: 'cross-hit-30', centro: 'xtreme-1', monitor: 'Alejandro', plazas: 20 },
      { dia: 1, hora: '09:30', clase: 'pilates',      centro: 'xtreme-2', monitor: 'Susana',    plazas: 18 },
      { dia: 1, hora: '10:30', clase: 'gap',          centro: 'xtreme-1', monitor: 'Susana',    plazas: 24 },
      { dia: 1, hora: '14:00', clase: 'ciclo-indoor', centro: 'xtreme-1', monitor: 'Diego',     plazas: 28 },
      { dia: 1, hora: '18:00', clase: 'body-pump',    centro: 'xtreme-1', monitor: 'Alejandro', plazas: 30 },
      { dia: 1, hora: '19:00', clase: 'aerohiit',     centro: 'xtreme-3', monitor: 'Diego',     plazas: 26 },
      { dia: 1, hora: '20:00', clase: 'body-balance', centro: 'xtreme-2', monitor: 'Susana',    plazas: 22 },

      { dia: 2, hora: '07:00', clase: 'ciclo-indoor', centro: 'xtreme-1', monitor: 'Diego',     plazas: 28 },
      { dia: 2, hora: '09:30', clase: 'hipopresivos', centro: 'xtreme-2', monitor: 'Susana',    plazas: 16 },
      { dia: 2, hora: '11:00', clase: 'zumba',        centro: 'xtreme-3', monitor: 'Susana',    plazas: 30 },
      { dia: 2, hora: '14:00', clase: 'cross-hit-30', centro: 'xtreme-1', monitor: 'Alejandro', plazas: 20 },
      { dia: 2, hora: '18:00', clase: 'crossfit',     centro: 'xtreme-3', monitor: 'Alejandro', plazas: 18 },
      { dia: 2, hora: '19:00', clase: 'cardio-box',   centro: 'xtreme-1', monitor: 'Diego',     plazas: 26 },
      { dia: 2, hora: '20:30', clase: 'kick-boxing',  centro: 'xtreme-2', monitor: 'Alejandro', plazas: 20 },

      { dia: 3, hora: '07:00', clase: 'cross-hit-30', centro: 'xtreme-1', monitor: 'Alejandro', plazas: 20 },
      { dia: 3, hora: '09:30', clase: 'pilates',      centro: 'xtreme-2', monitor: 'Susana',    plazas: 18 },
      { dia: 3, hora: '10:30', clase: 'gap-step',     centro: 'xtreme-1', monitor: 'Susana',    plazas: 24 },
      { dia: 3, hora: '14:00', clase: 'ciclo-indoor', centro: 'xtreme-1', monitor: 'Diego',     plazas: 28 },
      { dia: 3, hora: '18:00', clase: 'body-pump',    centro: 'xtreme-1', monitor: 'Alejandro', plazas: 30 },
      { dia: 3, hora: '19:00', clase: 'abdominales-xpress', centro: 'xtreme-2', monitor: 'Susana', plazas: 24 },
      { dia: 3, hora: '20:00', clase: 'judo',         centro: 'xtreme-3', monitor: 'Alejandro', plazas: 20 },

      { dia: 4, hora: '07:00', clase: 'ciclo-indoor', centro: 'xtreme-1', monitor: 'Diego',     plazas: 28 },
      { dia: 4, hora: '09:30', clase: 'hipopresivos', centro: 'xtreme-2', monitor: 'Susana',    plazas: 16 },
      { dia: 4, hora: '11:00', clase: 'body-balance', centro: 'xtreme-3', monitor: 'Susana',    plazas: 22 },
      { dia: 4, hora: '14:00', clase: 'gap',          centro: 'xtreme-1', monitor: 'Susana',    plazas: 24 },
      { dia: 4, hora: '18:00', clase: 'crossfit',     centro: 'xtreme-3', monitor: 'Alejandro', plazas: 18 },
      { dia: 4, hora: '19:00', clase: 'aerohiit',     centro: 'xtreme-1', monitor: 'Diego',     plazas: 26 },
      { dia: 4, hora: '20:30', clase: 'krav-maga',    centro: 'xtreme-2', monitor: 'Alejandro', plazas: 18 },

      { dia: 5, hora: '07:00', clase: 'cross-hit-30', centro: 'xtreme-1', monitor: 'Alejandro', plazas: 20 },
      { dia: 5, hora: '09:30', clase: 'pilates',      centro: 'xtreme-2', monitor: 'Susana',    plazas: 18 },
      { dia: 5, hora: '14:00', clase: 'ciclo-indoor', centro: 'xtreme-1', monitor: 'Diego',     plazas: 28 },
      { dia: 5, hora: '18:00', clase: 'body-pump',    centro: 'xtreme-1', monitor: 'Alejandro', plazas: 30 },
      { dia: 5, hora: '19:00', clase: 'zumba',        centro: 'xtreme-3', monitor: 'Susana',    plazas: 30 },
      { dia: 5, hora: '20:00', clase: 'cardio-box',   centro: 'xtreme-2', monitor: 'Diego',     plazas: 26 },

      { dia: 6, hora: '10:00', clase: 'body-pump',    centro: 'xtreme-1', monitor: 'Alejandro', plazas: 30 },
      { dia: 6, hora: '11:00', clase: 'ciclo-indoor', centro: 'xtreme-1', monitor: 'Diego',     plazas: 28 },
      { dia: 6, hora: '12:00', clase: 'body-balance', centro: 'xtreme-2', monitor: 'Susana',    plazas: 22 },
      { dia: 6, hora: '13:00', clase: 'crossfit',     centro: 'xtreme-3', monitor: 'Alejandro', plazas: 18 },

      { dia: 7, hora: '10:30', clase: 'aerohiit',     centro: 'xtreme-1', monitor: 'Diego',     plazas: 26 },
      { dia: 7, hora: '11:30', clase: 'gap',          centro: 'xtreme-2', monitor: 'Susana',    plazas: 24 },
      { dia: 7, hora: '12:30', clase: 'pilates',      centro: 'xtreme-1', monitor: 'Susana',    plazas: 18 }
    ]
  },

  /* ---------------------------------------------------------------- reservas */
  /* Cita para conocer el gimnasio, valoración física o entrenador personal.
     El aviso del hueco reservado le llega al club por correo (/api/reserva). */
  reservas: {
    titulillo: 'Cita previa',
    titulo: 'Ven a verlo antes de decidir',
    texto: 'Elige qué quieres hacer, el centro y la hora. Te esperamos con el nombre puesto: ' +
           'nada de venir y que no te atienda nadie.',
    servicios: [
      { id: 'visita',     nombre: 'Visita guiada al centro',   duracion: 30, texto: 'Te enseñamos la sala, las salas de clases y la sauna. Sin compromiso.' },
      { id: 'prueba',     nombre: 'Día de prueba',             duracion: 90, texto: 'Entrenas una sesión completa con un monitor pendiente de ti.' },
      { id: 'valoracion', nombre: 'Valoración física',         duracion: 45, texto: 'Composición corporal, movilidad y objetivos. Sales con un plan.' },
      { id: 'personal',   nombre: 'Sesión de entrenador personal', duracion: 60, texto: 'Sesión individual, adaptada a lo que quieras trabajar.' },
      { id: 'nutricion',  nombre: 'Consulta de nutrición',     duracion: 45, texto: 'Con Nutrifitness. Estudio y pauta para llevarte a casa.' }
    ],
    /* Franjas en las que hay alguien para atender. Las 24 h son para entrenar,
       no para reservar cita. ⚠ Confirma estas franjas con recepción. */
    franjas: {
      laborables: ['09:00','10:00','11:00','12:00','13:00','16:00','17:00','18:00','19:00','20:00','21:00'],
      sabado:     ['10:00','11:00','12:00','13:00'],
      domingo:    []
    },
    diasAntelacionMax: 45,
    politica: 'Si no puedes venir, avísanos con 12 horas y liberamos el hueco.'
  },

  /* ----------------------------------------------------------------- galería */
  galeria: {
    titulillo: 'Por dentro',
    titulo: 'Los tres centros, sin filtros',
    texto: 'Fotos reales de las salas. Lo que ves es lo que hay.',
    fotos: [
      { src: '/assets/img/gal-01.webp', fallback: '/assets/img/gal-01.jpg', alt: 'Sala principal de fitness con máquinas guiadas', ancho: 1024, alto: 768 },
      { src: '/assets/img/gal-02.webp', fallback: '/assets/img/gal-02.jpg', alt: 'Zona de peso libre con mancuernas y bancos', ancho: 840, alto: 540 },
      { src: '/assets/img/gal-03.webp', fallback: '/assets/img/gal-03.jpg', alt: 'Sala de ciclo indoor con bicicletas estáticas', ancho: 1254, alto: 836 },
      { src: '/assets/img/gal-04.webp', fallback: '/assets/img/gal-04.jpg', alt: 'Entrenamiento de crossfit con barra olímpica', ancho: 950, alto: 634 },
      { src: '/assets/img/gal-05.webp', fallback: '/assets/img/gal-05.jpg', alt: 'Clase colectiva en la sala de actividades dirigidas', ancho: 1200, alto: 630 },
      { src: '/assets/img/gal-06.webp', fallback: '/assets/img/gal-06.jpg', alt: 'Trabajo de suelo y colchoneta en clase de hipopresivos', ancho: 1480, alto: 1003 },
      { src: '/assets/img/gal-07.webp', fallback: '/assets/img/gal-07.jpg', alt: 'Entrenamiento de glúteos y piernas en máquina', ancho: 887, alto: 595 },
      { src: '/assets/img/gal-08.webp', fallback: '/assets/img/gal-08.jpg', alt: 'Zona de cardio con cintas y elípticas', ancho: 1170, alto: 780 }
    ]
  },

  /* ---------------------------------------------------------------- contacto */
  formulario: {
    titulillo: 'Escríbenos',
    titulo: 'Cuéntanos qué necesitas',
    texto: 'Te contestamos el mismo día. Si es urgente, llama al 947 05 48 00.',
    asuntos: [
      'Quiero darme de alta',
      'Dudas sobre las cuotas',
      'Clases dirigidas',
      'Entrenador personal',
      'Baja o incidencia con mi cuota',
      'Trabajar con vosotros',
      'Otra cosa'
    ],
    exito: 'Recibido. Te contestamos hoy mismo al correo que nos has dejado.',
    error: 'No hemos podido enviarlo. Llámanos al 947 05 48 00 y lo resolvemos.'
  },

  /* ------------------------------------------------------------- área socio */
  /* Acceso de socio. Funciona en el navegador (sin servidor de cuentas): guarda
     las reservas de ese socio en su propio dispositivo. Para cuotas y recibos,
     el enlace lleva al sistema real del club (Provis). */
  socio: {
    titulo: 'Área de socio',
    texto: 'Consulta y cancela tus reservas de clase.',
    aviso: 'Para ver recibos, cambiar la cuota o darte de baja, entra en el área personal del club.',
    urlClub: 'https://gimnasiosxtreme.provis.es/Public/Inicio.aspx'
  },

  /* ------------------------------------------------------------------- panel */
  /* Mini-CMS local. La clave NO da acceso a nada del servidor: sólo desbloquea
     el editor en este navegador. Cámbiala aquí. */
  panel: {
    clave: 'xtreme2026',
    titulo: 'Panel de gestión',
    texto: 'Edita clases, cuotas, ofertas, fotos y textos. Al terminar, descarga el manifest ' +
           'y súbelo a GitHub o al alojamiento por FTP.',
    repo: ''   // 'usuario/repositorio' para que el botón de GitHub apunte solo
  },

  /* ------------------------------------------------------------------ legal */
  legal: {
    titular: 'Fitness Sarmiento S.L.',
    nif: 'B09557158',
    domicilio: 'C/ Petronila Casado, 20 · 09005 Burgos (España)',
    email: 'info@gimnasiosxtreme.es',
    telefono: '947 05 48 00',
    registro: '',   // ⚠ datos del Registro Mercantil, si los tienen
    actualizado: '1 de agosto de 2026',
    /* Analítica: deja vacío hasta que el cliente dé su ID. Sólo se carga si el
       visitante acepta cookies de medición. */
    analitica: { proveedor: 'ga4', id: '' }
  }
};
