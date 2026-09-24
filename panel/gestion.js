/* Gimnasios Xtreme — datos del panel, contra Supabase.
   ------------------------------------------------------------------
   El panel habla SOLO con este archivo: sesión, contenido publicado
   (horarios, actividades, cuotas y bonos), fotos e historial.
   Todas las funciones que cambian algo devuelven una promesa con
   { ok: true, … } o { error: "texto para enseñar" }.

   Solo entra quien tenga cuenta en Supabase Auth Y su correo en la tabla
   admins. Lo decide la base de datos, no este archivo.

   Necesita antes: supabase-js (CDN) y lib/config.js.
   ------------------------------------------------------------------ */
(function () {
  "use strict";

  var CFG = window.__SUPABASE__ || {};
  if (!CFG.url || !CFG.key || !window.supabase || !window.supabase.createClient) {
    window.Gestion = { activo: false };
    return;
  }
  var sb = window.supabase.createClient(CFG.url, CFG.key, {
    auth: { persistSession: true, autoRefreshToken: true, storageKey: "xtreme-panel-sesion" }
  });

  var oyentes = [];
  var admin = false;
  var canal = null;
  var marca = "";               // huella de lo cargado, para no repintar si no cambia nada

  function iso(d) {
    var m = d.getMonth() + 1, dd = d.getDate();
    return d.getFullYear() + "-" + (m < 10 ? "0" : "") + m + "-" + (dd < 10 ? "0" : "") + dd;
  }
  function dias(n) { var d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + n); return iso(d); }
  function copia(o) { return JSON.parse(JSON.stringify(o)); }

  var cache = {
    cargado: false,
    contenido: null, publicado: null, actualizado: null,
    versiones: [], hook: ""
  };

  function avisar() {
    oyentes.forEach(function (fn) { try { fn(); } catch (x) { /* un oyente roto no para a los demás */ } });
  }

  function cargar() {
    if (!admin) return Promise.resolve(false);
    return Promise.all([
      sb.from("contenido").select("datos,actualizado,publicado").eq("id", 1).maybeSingle(),
      sb.from("versiones").select("id,guardada").order("guardada", { ascending: false }).limit(30),
      sb.from("sitio_privado").select("deploy_hook").eq("id", 1).maybeSingle()
    ]).then(function (res) {
      var fallo = res.filter(function (r) { return r.error; })[0];
      if (fallo) throw fallo.error;
      var c = res[0].data;
      cache.contenido = c ? c.datos : null;
      cache.actualizado = c ? c.actualizado : null;
      cache.publicado = c ? c.publicado : null;
      cache.versiones = res[1].data || [];
      cache.hook = res[2].data ? res[2].data.deploy_hook : "";
      cache.cargado = true;
      var nueva = JSON.stringify([cache.actualizado, cache.versiones, cache.hook]);
      if (nueva !== marca) { marca = nueva; avisar(); }
      return true;
    });
  }

  /* Tiempo real */
  var pendienteRecarga = null;
  function recargaSuave() {
    clearTimeout(pendienteRecarga);
    pendienteRecarga = setTimeout(function () { cargar().catch(function () {}); }, 250);
  }
  function abrirTiempoReal() {
    if (canal) return;
    canal = sb.channel("panel-xtreme")
      .on("postgres_changes", { event: "*", schema: "public", table: "contenido" }, recargaSuave)
      .subscribe();
    // por si el tiempo real se corta (móvil dormido, wifi que cambia…)
    document.addEventListener("visibilitychange", function () { if (!document.hidden && admin) recargaSuave(); });
  }
  function cerrarTiempoReal() {
    if (canal) { sb.removeChannel(canal); canal = null; }
  }

  /* Escritura */
  function red(e) { return { error: (e && e.message) ? "No se pudo guardar: " + e.message : "No se pudo guardar. ¿Hay conexión?" }; }
  function rpc(nombre, args) {
    return sb.rpc(nombre, args).then(function (r) {
      if (r.error) return red(r.error);
      var d = r.data || {};
      if (d.error) return { error: d.error };
      return cargar().then(function () { return d; }, function () { return d; });
    }, red);
  }
  function tabla(promesa) {
    return promesa.then(function (r) {
      if (r.error) return red(r.error);
      return cargar().then(function () { return { ok: true }; }, function () { return { ok: true }; });
    }, red);
  }
  function nulo(v) { v = v == null ? "" : String(v).trim(); return v === "" ? null : v; }

  function comprobarAdmin() {
    return sb.rpc("es_admin").then(function (a) {
      if (a.error || a.data !== true) return false;
      admin = true; abrirTiempoReal();
      return cargar().then(function () { return true; });
    });
  }

  window.Gestion = {
    activo: true,
    config: CFG,

    /* Lectura */
    estado: function () { return copia(cache); },
    recargar: function () { return cargar(); },
    alCambiar: function (fn) { oyentes.push(fn); },

    /* Sesión */
    entrar: function (correo, clave) {
      return sb.auth.signInWithPassword({ email: correo, password: clave }).then(function (r) {
        if (r.error) return { error: "Correo o contraseña incorrectos." };
        return comprobarAdmin().then(function (si) {
          if (si) return { ok: true };
          return sb.auth.signOut().then(function () { return { error: "Esta cuenta no tiene acceso al panel." }; });
        });
      }, red);
    },
    sesionActual: function () {
      return sb.auth.getSession().then(function (r) {
        if (!r.data || !r.data.session) return false;
        return comprobarAdmin();
      }).catch(function () { return false; });
    },
    correo: function () {
      return sb.auth.getSession().then(function (r) {
        return (r.data && r.data.session && r.data.session.user.email) || "";
      }).catch(function () { return ""; });
    },
    salir: function () {
      admin = false; cerrarTiempoReal();
      return sb.auth.signOut();
    },

    /* Contenido de la web */
    publicar: function (datos) { return rpc("publicar", { p_datos: datos }); },
    restaurar: function (id) { return rpc("restaurar_version", { p_id: id }); },
    guardarHook: function (url) {
      url = String(url || "").trim();
      if (url && !/^https:\/\/api\.vercel\.com\//.test(url)) {
        return Promise.resolve({ error: "Tiene que ser la dirección que da Vercel (empieza por https://api.vercel.com/)." });
      }
      return tabla(sb.from("sitio_privado").update({ deploy_hook: url }).eq("id", 1));
    },

    /* Fotos: se suben al almacén público «web» y se usa su dirección */
    subirFoto: function (blob, nombre) {
      var ruta = "img/" + nombre;
      return sb.storage.from("web").upload(ruta, blob, { upsert: true, contentType: blob.type, cacheControl: "31536000" })
        .then(function (r) {
          if (r.error) return red(r.error);
          return { ok: true, url: sb.storage.from("web").getPublicUrl(ruta).data.publicUrl };
        }, red);
    },

    util: { iso: iso, dias: dias }
  };
})();
