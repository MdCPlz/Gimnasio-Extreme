/* Supabase falso, SOLO para probar el panel en local sin cuenta ni base de
   datos (tools/panel-prueba.html). Imita las pocas llamadas que usa
   panel/gestion.js, con datos de ejemplo en memoria. No se publica. */
(function () {
  "use strict";
  var B = window.__BRAND__;
  function iso(d) { var m = d.getMonth() + 1, dd = d.getDate(); return d.getFullYear() + "-" + (m < 10 ? "0" : "") + m + "-" + (dd < 10 ? "0" : "") + dd; }
  function dia(n) { var d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + n); return iso(d); }
  function id() { return Math.random().toString(36).slice(2, 10); }
  function hace(h) { return new Date(Date.now() - h * 3600000).toISOString(); }
  function dow(isoF) { var p = isoF.split("-"); var d = new Date(+p[0], +p[1] - 1, +p[2]).getDay(); return d === 0 ? 7 : d; }

  var NOMBRES = ["Lucía Pérez", "Javier Gómez", "Marta Ruiz", "Sergio Alonso", "Elena Díez", "Pablo Martín",
    "Andrea Sáez", "Hugo Ortega", "Irene Marcos", "Daniel Arribas", "Nerea Calvo", "Óscar Miguel"];
  function correo(n) { return n.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, ".") + "@ejemplo.es"; }

  var db = {
    contenido: [{ id: 1, datos: JSON.parse(JSON.stringify(B)), actualizado: hace(30), publicado: hace(30) }],
    sitio_privado: [{ id: 1, deploy_hook: "" }],
    versiones: [{ id: 3, guardada: hace(30) }, { id: 2, guardada: hace(200) }, { id: 1, guardada: hace(900) }],
    citas: [
      { id: id(), estado: "confirmada", origen: "web", servicio: "visita", centro: "xtreme-1", fecha: dia(0), hora: "10:00", nombre: "Laura Martín", email: "laura@ejemplo.es", telefono: "600 000 001", nota: "Vengo con mi pareja.", creada: hace(20) },
      { id: id(), estado: "confirmada", origen: "telefono", servicio: "valoracion", centro: "xtreme-2", fecha: dia(0), hora: "17:00", nombre: "Carlos Ruiz", email: null, telefono: "600 222 333", nota: null, creada: hace(8) },
      { id: id(), estado: "atendida", origen: "web", servicio: "prueba", centro: "xtreme-1", fecha: dia(0), hora: "09:00", nombre: "Ana Beltrán", email: "ana@ejemplo.es", telefono: "611 111 111", nota: null, creada: hace(40) },
      { id: id(), estado: "confirmada", origen: "web", servicio: "personal", centro: "xtreme-3", fecha: dia(1), hora: "18:00", nombre: "Marta Gil", email: "marta@ejemplo.es", telefono: "622 333 444", nota: "Me recupero de una lesión de rodilla.", creada: hace(3) },
      { id: id(), estado: "confirmada", origen: "web", servicio: "nutricion", centro: "xtreme-1", fecha: dia(3), hora: "12:00", nombre: "Iván Mora", email: "ivan@ejemplo.es", telefono: "633 444 555", nota: null, creada: hace(1) },
      { id: id(), estado: "no_vino", origen: "web", servicio: "visita", centro: "xtreme-2", fecha: dia(-2), hora: "19:00", nombre: "Rubén Sanz", email: "ruben@ejemplo.es", telefono: "644 555 666", nota: null, creada: hace(90) },
      { id: id(), estado: "cancelada", origen: "web", servicio: "prueba", centro: "xtreme-1", fecha: dia(2), hora: "11:00", nombre: "Sara León", email: "sara@ejemplo.es", telefono: "655 666 777", nota: null, creada: hace(50) }
    ],
    inscripciones: [],
    mensajes: [
      { id: id(), asunto: "Quiero darme de alta", nombre: "Alberto Hernando", email: "alberto@ejemplo.es", telefono: "666 777 888", mensaje: "Hola, ¿la matrícula se paga también con la cuota trimestral? Gracias.", leido: false, creado: hace(2) },
      { id: id(), asunto: "Clases dirigidas", nombre: "Cristina Vela", email: "cristina@ejemplo.es", telefono: null, mensaje: "¿Hay pilates los sábados en Xtreme 2?", leido: false, creado: hace(26) },
      { id: id(), asunto: "Otra cosa", nombre: "Tomás Rey", email: "tomas@ejemplo.es", telefono: null, mensaje: "Me dejé una sudadera gris en el vestuario el martes.", leido: true, creado: hace(80) }
    ]
  };

  /* Plazas cogidas en las clases de hoy y mañana, según el horario real del manifiesto */
  [0, 1, 2].forEach(function (n) {
    var f = dia(n);
    B.agenda.horario.filter(function (s) { return s.dia === dow(f); }).forEach(function (s, k) {
      var cuantas = (k * 5 + n * 3) % 9;
      for (var i = 0; i < cuantas; i++) {
        var nom = NOMBRES[(k + i + n) % NOMBRES.length];
        db.inscripciones.push({ id: id(), estado: "activa", fecha: f, hora: s.hora, clase: s.clase, centro: s.centro,
          nombre: nom, email: correo(nom), creada: hace(i + 1) });
      }
    });
  });

  function res(data) { return Promise.resolve({ data: data == null ? null : JSON.parse(JSON.stringify(data)), error: null }); }

  function consulta(tabla) {
    var q = { op: "select", filtros: [], valores: null, uno: false, limite: null };
    var b = {
      select: function () { return b; },
      order: function () { return b; },
      limit: function (n) { q.limite = n; return b; },
      eq: function (k, v) { q.filtros.push(function (f) { return f[k] === v; }); return b; },
      gte: function (k, v) { q.filtros.push(function (f) { return f[k] >= v; }); return b; },
      single: function () { q.uno = true; return b; },
      maybeSingle: function () { q.uno = true; return b; },
      update: function (v) { q.op = "update"; q.valores = v; return b; },
      delete: function () { q.op = "delete"; return b; },
      then: function (ok, mal) {
        var filas = db[tabla].filter(function (f) { return q.filtros.every(function (c) { return c(f); }); });
        if (q.op === "update") filas.forEach(function (f) { Object.assign(f, q.valores); });
        if (q.op === "delete") db[tabla] = db[tabla].filter(function (f) { return filas.indexOf(f) === -1; });
        if (q.limite) filas = filas.slice(0, q.limite);
        return res(q.uno ? (filas[0] || null) : filas).then(ok, mal);
      }
    };
    return b;
  }

  function rpc(nombre, a) {
    var r;
    switch (nombre) {
      case "es_admin": r = true; break;
      case "crear_cita_manual":
        if (db.citas.some(function (c) { return c.estado === "confirmada" && c.centro === a.p_centro && c.fecha === a.p_fecha && c.hora === a.p_hora; })) {
          r = { error: "Esa hora ya está cogida en ese centro." }; break;
        }
        db.citas.push({ id: id(), estado: "confirmada", origen: a.p_origen, servicio: a.p_servicio, centro: a.p_centro,
          fecha: a.p_fecha, hora: a.p_hora, nombre: a.p_nombre, email: a.p_email, telefono: a.p_telefono, nota: a.p_nota,
          creada: new Date().toISOString() });
        r = { ok: true };
        break;
      case "publicar":
        db.versiones.unshift({ id: db.versiones.length + 1, guardada: db.contenido[0].actualizado });
        db.contenido[0].datos = a.p_datos;
        db.contenido[0].actualizado = new Date().toISOString();
        r = { ok: true, reconstruye: !!db.sitio_privado[0].deploy_hook };
        if (r.reconstruye) db.contenido[0].publicado = db.contenido[0].actualizado;
        break;
      case "restaurar_version": r = { ok: true, reconstruye: false }; break;
      default: r = { error: "No disponible en la prueba." };
    }
    return { then: function (ok, mal) { return res(r).then(ok, mal); } };
  }

  var fotos = {};
  window.supabase = {
    createClient: function () {
      return {
        from: consulta,
        rpc: rpc,
        storage: { from: function () { return {
          upload: function (ruta, blob) { fotos[ruta] = URL.createObjectURL(blob); return res({ path: ruta }); },
          getPublicUrl: function (ruta) { return { data: { publicUrl: fotos[ruta] } }; }
        }; } },
        auth: {
          getSession: function () { return Promise.resolve({ data: { session: { user: { email: "recepcion@prueba.local" } } } }); },
          signInWithPassword: function () { return Promise.resolve({ data: {}, error: null }); },
          signOut: function () { return Promise.resolve({}); }
        },
        channel: function () { var c = { on: function () { return c; }, subscribe: function () { return c; } }; return c; },
        removeChannel: function () {}
      };
    }
  };

  /* Para probar los avisos: window.__simulaWeb() mete una cita y un mensaje como si llegaran de la web */
  window.__simulaWeb = function () {
    db.citas.push({ id: id(), estado: "confirmada", origen: "web", servicio: "visita", centro: "xtreme-3", fecha: dia(1),
      hora: "19:00", nombre: "Noelia Tapia", email: "noelia@ejemplo.es", telefono: "677 888 999", nota: null, creada: new Date().toISOString() });
    db.mensajes.unshift({ id: id(), asunto: "Dudas sobre las cuotas", nombre: "Raúl Pardo", email: "raul@ejemplo.es",
      telefono: null, mensaje: "¿Puedo pausar la cuota semestral en verano?", leido: false, creado: new Date().toISOString() });
    return window.Gestion.recargar();
  };
})();
