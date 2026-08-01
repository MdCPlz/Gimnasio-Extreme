/* =============================================================================
   SOCIO — sesión y reservas de clase del visitante.
   -----------------------------------------------------------------------------
   IMPORTANTE, para que no haya malentendidos: esto NO es un sistema de cuentas.
   No hay contraseñas ni servidor de usuarios. El socio se identifica con su
   correo para que la web recuerde SUS reservas EN SU dispositivo, y cada reserva
   se avisa al club por correo desde /api/inscripcion.
   El alta, la cuota y los recibos siguen estando en el sistema real del club.
   Expone window.XS.
   ========================================================================== */
(function () {
  'use strict';

  var B = window.__BRAND__, P = window.XP;
  if (!B || !P) return;

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

  /** Cuántas plazas ha cogido la web para esa sesión concreta. */
  function ocupadas(fecha, hora, clase, centro) {
    var id = idDe(fecha, hora, clase, centro);
    return todas().filter(function (x) { return x.id === id; }).length;
  }

  function apunta(datos) {
    var s = sesion();
    if (!s) return { ok: false, motivo: 'sin-sesion' };
    var id = idDe(datos.fecha, datos.hora, datos.clase, datos.centro);
    var r = todas();
    if (r.some(function (x) { return x.id === id && x.email === s.email; })) {
      return { ok: false, motivo: 'repetida' };
    }
    r.push({
      id: id, fecha: datos.fecha, hora: datos.hora, clase: datos.clase,
      centro: datos.centro, monitor: datos.monitor || '', email: s.email,
      nombre: s.nombre, creada: Date.now()
    });
    if (!P.almacen.guarda(CLAVE_RESERVAS, r)) return { ok: false, motivo: 'sin-espacio' };
    avisaAlClub('inscripcion', {
      nombre: s.nombre, email: s.email, fecha: datos.fecha, hora: datos.hora,
      clase: datos.clase, centro: datos.centro
    });
    document.dispatchEvent(new CustomEvent('xt:reservas'));
    return { ok: true };
  }

  function cancela(id) {
    var s = sesion();
    if (!s) return false;
    var r = todas(), antes = r.length;
    var fuera = r.filter(function (x) { return x.id === id && x.email === s.email; })[0];
    r = r.filter(function (x) { return !(x.id === id && x.email === s.email); });
    P.almacen.guarda(CLAVE_RESERVAS, r);
    if (fuera) {
      avisaAlClub('cancelacion', {
        nombre: s.nombre, email: s.email, fecha: fuera.fecha, hora: fuera.hora,
        clase: fuera.clase, centro: fuera.centro
      });
    }
    document.dispatchEvent(new CustomEvent('xt:reservas'));
    return r.length < antes;
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
