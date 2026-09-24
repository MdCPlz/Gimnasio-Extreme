// Prepara las dos carpetas que se suben a Vercel (el mismo sistema que la web de Nuria):
//   dist/gimnasios-xtreme        → la web pública (sin el panel, las herramientas ni la base de datos)
//   dist/panel-gimnasios-xtreme  → el panel, suelto, con lo que necesita de la web
//
// El contenido: si lib/config.js apunta a la base de datos, el lib/manifest.js que
// se publica es lo último que se publicó desde el panel. Si la base no responde,
// el script falla a propósito: Vercel deja la versión anterior en vez de publicar
// contenido viejo. Si nunca se ha publicado nada, se usa el lib/manifest.js del repositorio.
//
// Uso:  node tools/publicar.js [URL de la web]
// La URL de la web se usa en el botón «Ver la web» del panel.
const fs = require("fs");
const path = require("path");

const raiz = path.join(__dirname, "..");
const dist = path.join(raiz, "dist");
const urlWeb = (process.argv[2] || "").replace(/\/$/, "");

function borrar(p) { fs.rmSync(p, { recursive: true, force: true }); }
// Vacía una carpeta de publicación sin tocar su enlace con Vercel ni con su propio GitHub
function vaciar(p) {
  fs.mkdirSync(p, { recursive: true });
  for (const n of fs.readdirSync(p)) if (n !== ".vercel" && n !== ".git") borrar(path.join(p, n));
}
function copiar(de, a) {
  fs.mkdirSync(path.dirname(a), { recursive: true });
  fs.cpSync(de, a, { recursive: true });
}

/* ---------------- El contenido publicado desde el panel ---------------- */
function leeConfig() {
  const txt = fs.readFileSync(path.join(raiz, "lib", "config.js"), "utf8");
  const url = (/url:\s*"([^"]*)"/.exec(txt) || [])[1] || "";
  const key = (/key:\s*"([^"]*)"/.exec(txt) || [])[1] || "";
  return { url: url.replace(/\/$/, ""), key };
}

async function contenidoPublicado() {
  const { url, key } = leeConfig();
  if (!url || !key) return null;
  const r = await fetch(url + "/rest/v1/contenido?id=eq.1&select=datos,actualizado", {
    headers: { apikey: key, authorization: "Bearer " + key }
  });
  if (!r.ok) throw new Error("La base de datos respondió " + r.status + ": " + (await r.text()).slice(0, 200));
  const filas = await r.json();
  return filas[0] || null;
}

function manifiesto(fila) {
  if (!fila) return fs.readFileSync(path.join(raiz, "lib", "manifest.js"), "utf8");
  return "/* =============================================================================\n" +
    "   GIMNASIOS XTREME BURGOS — MANIFIESTO DE MARCA\n" +
    "   Generado al publicar con lo último guardado desde el panel (" + fila.actualizado + ").\n" +
    "   No se edita aquí: se edita en el panel.\n" +
    "   ========================================================================== */\n\n" +
    "window.__BRAND__ = " + JSON.stringify(fila.datos, null, 2) + ";\n";
}

(async function () {
  let fila;
  try {
    fila = await contenidoPublicado();
  } catch (e) {
    console.error("No se ha podido leer el contenido de la base de datos:", e.message);
    process.exit(1);
  }
  const mani = manifiesto(fila);

  /* ---------------- Web ---------------- */
  const web = path.join(dist, "gimnasios-xtreme");
  vaciar(web);
  // api/ la construye Vercel como funciones desde la raíz: no debe servirse como archivos
  const fuera = new Set(["panel", "tools", "supabase", "api", "dist", "node_modules", ".git", ".vercel", ".claude",
    "README.md", ".env", ".env.example", ".gitignore", "vercel.json", ".vercelignore", "package.json"]);
  for (const n of fs.readdirSync(raiz)) {
    if (fuera.has(n)) continue;
    copiar(path.join(raiz, n), path.join(web, n));
  }
  fs.writeFileSync(path.join(web, "lib", "manifest.js"), mani);
  // Las cabeceras de la web están en el vercel.json de la raíz: Vercel la construye desde GitHub.

  /* ---------------- Panel ---------------- */
  const panel = path.join(dist, "panel-gimnasios-xtreme");
  vaciar(panel);
  for (const n of fs.readdirSync(path.join(raiz, "panel"))) copiar(path.join(raiz, "panel", n), path.join(panel, n));
  for (const n of ["css", "fonts", "img"]) copiar(path.join(raiz, "assets", n), path.join(panel, "assets", n));
  for (const n of ["nucleo.js", "componentes.js"]) copiar(path.join(raiz, "assets", "js", n), path.join(panel, "assets", "js", n));
  for (const n of ["plantillas.js", "config.js"]) copiar(path.join(raiz, "lib", n), path.join(panel, "lib", n));
  fs.writeFileSync(path.join(panel, "lib", "manifest.js"), mani);

  let html = fs.readFileSync(path.join(panel, "index.html"), "utf8");
  html = html.replace('data-raiz=".."', 'data-raiz="."');
  html = html.replace('web: "../index.html"', 'web: ' + JSON.stringify(urlWeb ? urlWeb + "/" : "../index.html"));
  html = html.replace(/"\.\.\//g, '"');
  /* Sin base de datos todavía: el panel sale en MODO PRUEBA, con datos de
     ejemplo en memoria y un aviso bien visible, para poder revisarlo en el
     móvil. En cuanto lib/config.js tenga la base, sale el panel de verdad. */
  if (!leeConfig().url) {
    copiar(path.join(raiz, "tools", "supabase-falso.js"), path.join(panel, "supabase-falso.js"));
    html = html.replace(/<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/@supabase[^"]*"><\/script>/, '<script src="supabase-falso.js"></script>');
    html = html.replace('<script src="lib/config.js"></script>',
      '<script src="lib/config.js"></script>\n<script>window.__SUPABASE__ = { url: "https://prueba.local", key: "prueba" };</script>');
    html = html.replace("<body>", '<body>\n<p class="p-modo-prueba">Modo prueba · datos de ejemplo · no se guarda nada</p>');
    html = html.replace("<title>", "<title>PRUEBA · ");
  }
  fs.writeFileSync(path.join(panel, "index.html"), html);
  const wm = path.join(panel, "manifest.webmanifest");
  fs.writeFileSync(wm, fs.readFileSync(wm, "utf8").replace(/"\.\.\//g, '"'));
  fs.writeFileSync(path.join(panel, "vercel.json"), JSON.stringify({
    headers: [
      { source: "/(.*)", headers: [
        { key: "X-Robots-Tag", value: "noindex, nofollow" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "no-referrer" },
        { key: "Cache-Control", value: "no-store" }
      ] }
    ]
  }, null, 2));
  fs.writeFileSync(path.join(panel, "robots.txt"), "User-agent: *\nDisallow: /\n");

  // Archivos propios del repositorio del panel. Ese repositorio es una SALIDA
  // de este: no se edita allí, se regenera aquí.
  fs.writeFileSync(path.join(panel, ".gitignore"), ".vercel/\n");
  fs.writeFileSync(path.join(panel, ".vercelignore"), "README.md\n.gitignore\n");
  fs.writeFileSync(path.join(panel, "README.md"), [
    "# Panel · Gimnasios Xtreme",
    "",
    "Panel privado del gimnasio: citas, plazas en clases, mensajes y contenido de la web.",
    "",
    "**No se edita aquí.** Este repositorio lo genera `tools/publicar.js` desde el",
    "repositorio principal de la web (github.com/MdCPlz/Gimnasio-Extreme), que es",
    "donde vive el código de verdad. Cada subida a este repositorio la publica",
    "Vercel automáticamente en la dirección del panel.",
    "",
    "Para publicar un cambio del panel, desde el repositorio principal:",
    "",
    "```bash",
    "node tools/publicar.js " + (urlWeb || "<url de la web>"),
    "cd dist/panel-gimnasios-xtreme",
    "git add -A && git commit -m \"Descripción del cambio\" && git push",
    "```",
    "",
    "Datos: Supabase. Acceso solo para las cuentas de la tabla `admins`.",
    ""
  ].join("\n"));

  console.log("dist/gimnasios-xtreme y dist/panel-gimnasios-xtreme listos · contenido: " +
    (fila ? "el publicado desde el panel (" + fila.actualizado + ")" : "lib/manifest.js del repositorio") +
    (urlWeb ? " · «Ver la web» → " + urlWeb : ""));
})();
