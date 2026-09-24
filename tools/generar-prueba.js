// Genera tools/panel-prueba.html a partir del panel real, pero conectado a
// tools/supabase-falso.js (datos de ejemplo en memoria). Sirve para revisar el
// panel sin cuenta ni base de datos. Se abre en http://localhost:8766/tools/panel-prueba.html
const fs = require("fs");
const path = require("path");
const raiz = path.join(__dirname, "..");

let h = fs.readFileSync(path.join(raiz, "panel", "index.html"), "utf8");
h = h.replace(/(href|src)="((panel\.(css|js)|gestion\.js|manifest\.webmanifest)[^"]*)"/g, '$1="../panel/$2"');
h = h.replace(/<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/@supabase[^"]*"><\/script>/, '<script src="supabase-falso.js"></script>');
h = h.replace('<script src="../lib/config.js"></script>',
  '<script src="../lib/config.js"></script>\n<script>window.__SUPABASE__ = { url: "https://prueba.local", key: "prueba" };</script>');
h = h.replace("<title>", "<title>PRUEBA · ");
fs.writeFileSync(path.join(__dirname, "panel-prueba.html"), h);
console.log("tools/panel-prueba.html generado");
