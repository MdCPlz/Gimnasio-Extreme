/* =============================================================================
   PÁGINAS LEGALES — aviso legal, privacidad y cookies.
   Los textos se arman con los datos del manifiesto para que no haya dos sitios
   donde cambiar el NIF o el domicilio.
   ⚠ Son textos base ajustados a este sitio, no un dictamen jurídico. Que los
   revise el asesor del club antes de publicar.
   ========================================================================== */
(function () {
  'use strict';

  var B = window.__BRAND__, P = window.XP, T = window.XT;
  var hueco = document.querySelector('[data-legal]');
  if (!B || !P || !hueco) return;

  var esc = P.esc, R = P.ruta;
  var L = B.legal;
  var cual = hueco.getAttribute('data-legal');

  function indice(items) {
    return '<nav class="legal__indice" aria-label="Contenido de la página"><ol>' +
      items.map(function (x, i) {
        return '<li><a href="#s' + (i + 1) + '">' + esc(x) + '</a></li>';
      }).join('') + '</ol></nav>';
  }

  function h2(n, t) { return '<h2 id="s' + n + '">' + esc(t) + '</h2>'; }

  var titular =
    '<table><tbody>' +
      '<tr><th scope="row">Titular</th><td>' + esc(L.titular) + '</td></tr>' +
      '<tr><th scope="row">NIF</th><td>' + esc(L.nif) + '</td></tr>' +
      '<tr><th scope="row">Domicilio</th><td>' + esc(L.domicilio) + '</td></tr>' +
      '<tr><th scope="row">Teléfono</th><td><a href="tel:' + esc(B.contacto.telefonoTel) + '">' +
        esc(L.telefono) + '</a></td></tr>' +
      '<tr><th scope="row">Correo</th><td><a href="mailto:' + esc(L.email) + '">' +
        esc(L.email) + '</a></td></tr>' +
      '<tr><th scope="row">Sitio web</th><td>' + esc(B.web) + '</td></tr>' +
      (L.registro ? '<tr><th scope="row">Registro Mercantil</th><td>' + esc(L.registro) + '</td></tr>' : '') +
    '</tbody></table>';

  /* ------------------------------------------------------------ aviso legal */
  function avisoLegal() {
    return '<h1>Aviso legal</h1>' +
      '<p class="legal__actualizado">Última actualización: ' + esc(L.actualizado) + '</p>' +
      indice(['Quién es el titular de esta web', 'Qué eres tú aquí y qué puedes hacer',
        'De quién son los textos y las fotos', 'Enlaces a otras webs',
        'Hasta dónde llega nuestra responsabilidad', 'Qué ley se aplica']) +

      h2(1, 'Quién es el titular de esta web') +
      '<p>En cumplimiento de la Ley 34/2002, de servicios de la sociedad de la información y de ' +
        'comercio electrónico (LSSI-CE), estos son los datos del titular:</p>' + titular +

      h2(2, 'Qué eres tú aquí y qué puedes hacer') +
      '<p>Al navegar por esta web te conviertes en usuario y aceptas estas condiciones. Puedes ' +
        'consultar la información, usar el buscador de clases, reservar plaza en una clase o pedir ' +
        'cita, y escribirnos por el formulario. Lo que no puedes hacer es usar la web para nada ' +
        'ilícito, intentar tumbarla, extraer sus contenidos de forma masiva o suplantar a nadie.</p>' +
      '<p>La reserva de plaza y la cita previa que se hacen desde esta web no sustituyen al alta ' +
        'como socio, que se gestiona en el propio gimnasio o en el sistema de altas del club.</p>' +

      h2(3, 'De quién son los textos y las fotos') +
      '<p>Los textos, el diseño, el código, las fotografías y las marcas que aparecen en esta web ' +
        'pertenecen a ' + esc(L.titular) + ' o a terceros que han autorizado su uso. Puedes verlos y ' +
        'compartir el enlace, pero no reproducirlos, copiarlos ni reutilizarlos con fines comerciales ' +
        'sin permiso por escrito.</p>' +
      '<p>Las marcas comerciales de los programas de clases dirigidas y de las marcas de ' +
        'equipamiento pertenecen a sus respectivos titulares y se citan sólo para identificar los ' +
        'servicios y el material del gimnasio.</p>' +

      h2(4, 'Enlaces a otras webs') +
      '<p>Esta web enlaza a sitios de terceros: redes sociales, Google Maps y el sistema de altas ' +
        'y gestión de socios del club. No controlamos esos sitios ni respondemos de su contenido ' +
        'ni de sus políticas de privacidad. Cuando salgas de aquí, revisa las suyas.</p>' +

      h2(5, 'Hasta dónde llega nuestra responsabilidad') +
      '<p>Cuidamos que la información esté al día, pero no podemos garantizar que no haya erratas ' +
        'ni que la web esté disponible sin interrupciones. Los precios, horarios y cuadros de clases ' +
        'publicados son informativos: los válidos son los que se confirman en el propio centro. ' +
        'Ante cualquier duda, llama al ' + esc(L.telefono) + '.</p>' +
      '<p>Entrenar tiene riesgos. La información sobre clases y ejercicios que hay en esta web es ' +
        'divulgativa y no sustituye el consejo de un médico ni el de los monitores del centro. Si ' +
        'tienes una lesión o una patología, consúltalo antes de empezar.</p>' +

      h2(6, 'Qué ley se aplica') +
      '<p>Estas condiciones se rigen por la legislación española. Para cualquier controversia, las ' +
        'partes se someten a los juzgados y tribunales de Burgos, salvo que la normativa de consumo ' +
        'establezca otro fuero para el usuario consumidor.</p>';
  }

  /* ------------------------------------------------------------ privacidad */
  function privacidad() {
    return '<h1>Política de privacidad</h1>' +
      '<p class="legal__actualizado">Última actualización: ' + esc(L.actualizado) + '</p>' +
      indice(['Quién trata tus datos', 'Qué datos recogemos y para qué',
        'Por qué podemos tratarlos', 'A quién se los damos', 'Cuánto los guardamos',
        'Qué derechos tienes', 'Menores de edad', 'Seguridad']) +

      h2(1, 'Quién trata tus datos') +
      '<p>El responsable del tratamiento es:</p>' + titular +
      '<p>Puedes escribirnos a <a href="mailto:' + esc(L.email) + '">' + esc(L.email) +
        '</a> para cualquier cosa relacionada con tus datos.</p>' +

      h2(2, 'Qué datos recogemos y para qué') +
      '<table><thead><tr><th>Para qué</th><th>Qué recogemos</th></tr></thead><tbody>' +
        '<tr><td>Contestar a tu mensaje del formulario de contacto</td>' +
          '<td>Nombre, correo, teléfono (si lo pones), asunto y lo que nos escribas</td></tr>' +
        '<tr><td>Gestionar una cita previa (visita, prueba, valoración, entrenador personal o nutrición)</td>' +
          '<td>Nombre, correo, teléfono, centro, día, hora y lo que nos cuentes en la nota</td></tr>' +
        '<tr><td>Guardar tu plaza en una clase dirigida</td>' +
          '<td>Nombre y correo, además de la clase, el día y el centro</td></tr>' +
        '<tr><td>Recibir tu candidatura de empleo</td>' +
          '<td>Los datos que incluyas en el correo y en el currículum</td></tr>' +
        '<tr><td>Saber cuánta gente visita la web y qué páginas ve</td>' +
          '<td>Datos de navegación agregados, sólo si aceptas las cookies de medición</td></tr>' +
      '</tbody></table>' +
      '<p>No usamos tus datos para perfilarte ni tomamos decisiones automatizadas sobre ti.</p>' +
      '<p><b>Un detalle técnico que conviene que sepas:</b> el nombre y el correo con los que entras ' +
        'en el área de socio, y las clases que reservas, se guardan en el almacenamiento local de tu ' +
        'propio navegador, en tu dispositivo. Si borras los datos del navegador, desaparecen. Al club ' +
        'le llega además un aviso por correo de cada reserva y de cada cancelación, para poder contar ' +
        'con tu plaza.</p>' +

      h2(3, 'Por qué podemos tratarlos') +
      '<ul>' +
        '<li><b>Tu consentimiento</b>, que das al marcar la casilla del formulario o al aceptar las ' +
          'cookies. Puedes retirarlo cuando quieras.</li>' +
        '<li><b>La ejecución de un contrato o de medidas precontractuales</b>, cuando pides cita o ' +
          'reservas plaza.</li>' +
        '<li><b>Nuestro interés legítimo</b> en atender las consultas que nos haces y en mantener la ' +
          'web segura y funcionando.</li>' +
      '</ul>' +

      h2(4, 'A quién se los damos') +
      '<p>No vendemos ni cedemos tus datos. Sólo acceden a ellos quienes nos prestan servicios ' +
        'necesarios para que esto funcione, siempre con contrato de encargado de tratamiento:</p>' +
      '<ul>' +
        '<li>La empresa que aloja la web y el servicio que envía los correos de aviso.</li>' +
        '<li>Google, si aceptas las cookies de medición (Google Analytics) o cargas el mapa ' +
          '(Google Maps).</li>' +
        '<li>El proveedor del sistema de gestión de socios del club, cuando te das de alta a través ' +
          'de su plataforma.</li>' +
      '</ul>' +
      '<p>Algunos de estos proveedores pueden estar fuera del Espacio Económico Europeo. En ese caso ' +
        'la transferencia se ampara en las cláusulas contractuales tipo aprobadas por la Comisión ' +
        'Europea o en una decisión de adecuación.</p>' +

      h2(5, 'Cuánto los guardamos') +
      '<p>Las consultas del formulario, un año desde que quedan resueltas. Las citas y las reservas, ' +
        'mientras hagan falta para gestionarlas y después el tiempo necesario para atender ' +
        'reclamaciones. Los currículums, un año, salvo que nos pidas que los borremos antes. Los ' +
        'datos de medición, según la configuración de la herramienta, con un máximo de 14 meses.</p>' +

      h2(6, 'Qué derechos tienes') +
      '<p>Puedes pedirnos acceder a tus datos, rectificarlos, suprimirlos, limitar su tratamiento, ' +
        'oponerte a él y solicitar su portabilidad. Escríbenos a <a href="mailto:' + esc(L.email) +
        '">' + esc(L.email) + '</a> indicando qué quieres ejercer y adjuntando copia de un documento ' +
        'que acredite tu identidad. Te contestamos en un mes como máximo.</p>' +
      '<p>Si crees que no hemos hecho las cosas bien, puedes reclamar ante la Agencia Española de ' +
        'Protección de Datos (<a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">' +
        'www.aepd.es</a>).</p>' +

      h2(7, 'Menores de edad') +
      '<p>Esta web no está dirigida a menores de 14 años. Para el acceso de menores al gimnasio hace ' +
        'falta la autorización firmada de su padre, madre o tutor, que se entrega en el propio ' +
        'centro.</p>' +

      h2(8, 'Seguridad') +
      '<p>Aplicamos medidas técnicas y organizativas razonables para proteger tus datos. La web viaja ' +
        'cifrada (HTTPS) y el acceso a la información está limitado a quien la necesita para su ' +
        'trabajo.</p>';
  }

  /* --------------------------------------------------------------- cookies */
  function cookies() {
    return '<h1>Política de cookies</h1>' +
      '<p class="legal__actualizado">Última actualización: ' + esc(L.actualizado) + '</p>' +
      indice(['Qué es una cookie', 'Qué usamos en esta web', 'El mapa y por qué está bloqueado',
        'Cómo cambiar tu elección', 'Cómo borrarlas desde el navegador']) +

      h2(1, 'Qué es una cookie') +
      '<p>Un archivo pequeño que la web guarda en tu dispositivo para recordar algo entre visitas. ' +
        'Aquí usamos además el almacenamiento local del navegador, que funciona parecido y sirve ' +
        'para lo mismo: recordar cosas sin tener que preguntártelas otra vez.</p>' +

      h2(2, 'Qué usamos en esta web') +
      '<table><thead><tr><th>Nombre</th><th>Tipo</th><th>Para qué</th><th>Duración</th></tr></thead>' +
      '<tbody>' +
        '<tr><td>xtreme.cookies.v1</td><td>Necesaria</td>' +
          '<td>Recuerda qué has aceptado en este mismo aviso, para no volver a preguntártelo.</td>' +
          '<td>Hasta que borres los datos del navegador</td></tr>' +
        '<tr><td>xtreme.socio</td><td>Necesaria</td>' +
          '<td>Guarda el nombre y el correo con los que entras al área de socio.</td>' +
          '<td>Hasta que pulses «Salir» o borres los datos</td></tr>' +
        '<tr><td>xtreme.reservas</td><td>Necesaria</td>' +
          '<td>Guarda las clases que has reservado desde la web.</td>' +
          '<td>Las reservas se borran solas 30 días después de la clase</td></tr>' +
        '<tr><td>xtreme.intro</td><td>Necesaria</td>' +
          '<td>Recuerda que ya has visto la presentación de la portada, para no repetírtela.</td>' +
          '<td>12 horas</td></tr>' +
        '<tr><td>xtreme.rating</td><td>Necesaria</td>' +
          '<td>Guarda la nota de Google unas horas para no pedirla en cada visita.</td>' +
          '<td>6 horas</td></tr>' +
        '<tr><td>_ga, _ga_*</td><td>Medición</td>' +
          '<td>Google Analytics: cuánta gente entra y qué páginas ve, de forma agregada. ' +
            'Sólo se cargan si las aceptas.</td>' +
          '<td>Hasta 14 meses</td></tr>' +
        '<tr><td>NID, CONSENT y similares</td><td>Mapas</td>' +
          '<td>Las pone Google al cargar el mapa. Sólo se cargan si aceptas ver el mapa.</td>' +
          '<td>Las fija Google</td></tr>' +
      '</tbody></table>' +
      '<p>Las cookies necesarias no se pueden desactivar porque sin ellas la web no puede recordar ' +
        'ni siquiera tu elección sobre cookies.</p>' +

      h2(3, 'El mapa y por qué está bloqueado') +
      '<p>El mapa de las páginas de centros y de contacto lo sirve Google, y cargarlo implica ' +
        'conectar con sus servidores. Por eso no se carga hasta que tú lo autorizas: mientras tanto ' +
        'verás un recuadro con un botón para verlo y un enlace para abrirlo directamente en Google ' +
        'Maps.</p>' +

      h2(4, 'Cómo cambiar tu elección') +
      '<p>Cuando quieras, desde este mismo sitio:</p>' +
      '<p><button class="boton" type="button" data-abrir-cookies>Abrir las preferencias de cookies</button></p>' +
      '<p>También tienes el enlace «Preferencias de cookies» en el pie de todas las páginas.</p>' +

      h2(5, 'Cómo borrarlas desde el navegador') +
      '<p>Todos los navegadores permiten ver y borrar las cookies y el almacenamiento local de un ' +
        'sitio. Suele estar en Ajustes → Privacidad. Ten en cuenta que si las borras, perderás las ' +
        'reservas guardadas en este dispositivo y la web volverá a preguntarte por las cookies.</p>' +
      '<p>Puedes consultar también el ' +
        '<a href="' + R('/legal/privacidad.html') + '">detalle de cómo tratamos tus datos</a> y el ' +
        '<a href="' + R('/legal/aviso-legal.html') + '">aviso legal</a>.</p>';
  }

  hueco.innerHTML = cual === 'aviso' ? avisoLegal()
    : cual === 'privacidad' ? privacidad()
    : cookies();

  if (T) T.montaApariciones();
})();
