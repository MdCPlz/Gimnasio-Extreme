/* =============================================================================
   SOCIO — sesión y reservas de clase del visitante.
   -----------------------------------------------------------------------------
   IMPORTANTE, para que no haya malentendidos: esto NO es un sistema de cuentas.
   No hay contraseñas. El socio se identifica con su correo y la web recuerda
   SUS reservas EN SU dispositivo.
   Con la base de datos conectada (window.XD.activo), cada plaza se guarda en
   ella: el aforo es compartido por todos los socios y el club la ve en el
   panel al momento. Sin ella, la plaza solo vive en el dispositivo y el club
   se entera por correo (/api/inscripcion).
   apunta() y cancela() devuelven siempre una promesa.
   El alta, la cuota y los recibos siguen estando en el sistema real del club.
   Expone window.XS.
   ========================================================================== */
(function () {
  'use strict';

  var B = window.__BRAND__, P = window.XP, D = window.XD;
  if (!B || !P) return;
  var enBase = !!(D && D.activo);

  var CLAVE_SESION = 'xtreme.socio';
  var CLAVE_RESERVAS = 'xtreme.reservas';

  function sesion() { return P.almacen.lee(CLAVE_SESION, null); }

  function entra(datos) {
    var s = {
      nombre: String(datos.nombre || '').trim(),
      email: String(datos.email || '').trim().toLowerCase(),
      desde: Date.now()
    };
    P.almacen.guarda(CLAVE_SESION, s);
    document.dispatchEvent(new CustomEvent('xt:socio', { detail: s }));
    return s;
  }

  function sale() {
    P.almacen.borra(CLAVE_SESION);
    document.dispatchEvent(new CustomEvent('xt:socio', { detail: null }));
  }

  function iniciales(nombre) {
    var p = String(nombre || '?').trim().split(/\s+/);
    return ((p[0] || '?')[0] + (p[1] ? p[1][0] : '')).toUpperCase();
  }

  /* ------------------------------------------------------------- reservas */
  /* Cada reserva: { id, fecha 'YYYY-MM-DD', hora, clase, centro, email } */
  function todas() {
    var r = P.almacen.lee(CLAVE_RESERVAS, []);
    return Array.isArray(r) ? limpiaViejas(r) : [];
  }

  /* Las clases pasadas dejan de ocupar sitio a los 30 días */
  function limpiaViejas(r) {
    var limite = new Date();
    limite.setDate(limite.getDate() - 30);
    var lim = P.iso(limite);
    var vivas = r.filter(function (x) { return x.fecha >= lim; });
    if (vivas.length !== r.length) P.almacen.guarda(CLAVE_RESERVAS, vivas);
    return vivas;
  }

  function mias() {
    var s = sesion();
    if (!s) return [];
    return todas().filter(function (x) { return x.email === s.email; })
      .sort(function (a, b) { return (a.fecha + a.hora) < (b.fecha + b.hora) ? -1 : 1; });
  }

  function proximas() {
    var hoy = P.iso(new Date());
    return mias().filter(function (x) { return x.fecha >= hoy; });
  }

  function idDe(fecha, hora, clase, centro) {
    return [fecha, hora, clase, centro].join('|');
  }

  function tengo(fecha, hora, clase, centro) {
    var s = sesion();
    if (!s) return false;
    var id = idDe(fecha, hora, clase, centro);
    return todas().some(function (x) { return x.id === id && x.email === s.email; });
  }

  /** Cuántas plazas hay cogidas en esa sesión concreta. */
  function ocupadas(fecha, hora, clase, centro) {
    if (enBase) return D.cogidas(fecha, hora, clase, centro);
    var id = idDe(fecha, hora, clase, centro);
    return todas().filter(function (x) { return x.id === id; }).length;
  }

  function apunta(datos) {
    var s = sesion();
    if (!s) return Promise.resolve({ ok: false, motivo: 'sin-sesion' });
    var id = idDe(datos.fecha, datos.hora, datos.clase, datos.centro);
    if (todas().some(function (x) { return x.id === id && x.email === s.email; })) {
      return Promise.resolve({ ok: false, motivo: 'repetida' });
    }
    var guardaAqui = function (idBase) {
      var r = todas();
      r.push({
        id: id, base: idBase || null, fecha: datos.fecha, hora: datos.hora, clase: datos.clase,
        centro: datos.centro, monitor: datos.monitor || '', email: s.email,
        nombre: s.nombre, creada: Date.now()
      });
      var ok = P.almacen.guarda(CLAVE_RESERVAS, r);
      avisaAlClub('inscripcion', {
        nombre: s.nombre, email: s.email, fecha: datos.fecha, hora: datos.hora,
        clase: datos.clase, centro: datos.centro
      });
      document.dispatchEvent(new CustomEvent('xt:reservas'));
      return ok;
    };

    if (!enBase) {
      return Promise.resolve(guardaAqui(null) ? { ok: true } : { ok: false, motivo: 'sin-espacio' });
    }
    return D.apuntarse({
      fecha: datos.fecha, hora: datos.hora, clase: datos.clase, centro: datos.centro,
      nombre: s.nombre, email: s.email
    }).then(function (r) {
      if (!r.ok) return { ok: false, motivo: 'base', error: r.error };
      guardaAqui(r.id);          // si el navegador no deja guardar, la plaza sigue en la base
      return { ok: true };
    });
  }

  function cancela(id) {
    var s = sesion();
    if (!s) return Promise.resolve(false);
    var fuera = todas().filter(function (x) { return x.id === id && x.email === s.email; })[0];
    if (!fuera) return Promise.resolve(false);

    var quitaAqui = function () {
      P.almacen.guarda(CLAVE_RESERVAS, todas().filter(function (x) {
        return !(x.id === id && x.email === s.email);
      }));
      avisaAlClub('cancelacion', {
        nombre: s.nombre, email: s.email, fecha: fuera.fecha, hora: fuera.hora,
        clase: fuera.clase, centro: fuera.centro
      });
      document.dispatchEvent(new CustomEvent('xt:reservas'));
      return true;
    };

    if (!enBase || !fuera.base) return Promise.resolve(quitaAqui());
    return D.soltarPlaza(fuera.base, s.email).then(function (r) {
      /* «No encuentro esa reserva» = el club ya la quitó: se quita también aquí */
      if (r.ok || (r.error && !r.red)) return quitaAqui();
      alert(r.error || 'No se ha podido cancelar. Prueba otra vez.');
      return false;
    });
  }

  /* El club recibe el aviso por correo. Si la función no está publicada (por
     ejemplo, con la web subida por FTP a un alojamiento sin Node), la reserva
     se guarda igual en el dispositivo del socio y no se pierde nada. */
  function avisaAlClub(tipo, datos) {
    try {
      fetch(P.ruta('/api/inscripcion'), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ tipo: tipo, datos: datos })
      }).catch(function () { /* silencio: no molestamos al socio con esto */ });
    } catch (e) { /* nada */ }
  }

  window.XS = {
    sesion: sesion, entra: entra, sale: sale, iniciales: iniciales,
    mias: mias, proximas: proximas, tengo: tengo, ocupadas: ocupadas,
    apunta: apunta, cancela: cancela, idDe: idDe
  };
})();
