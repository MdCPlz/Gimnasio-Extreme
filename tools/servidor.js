// Servidor estático mínimo para ver la web y el panel en local. Solo desarrollo.
// Uso: node tools/servidor.js   →   http://localhost:8766/  y  /panel/
// Prueba del panel sin cuenta: node tools/generar-prueba.js y abrir /tools/panel-prueba.html
const http = require('http'), fs = require('fs'), path = require('path');
const raiz = path.join(__dirname, '..');
const puerto = +process.env.PORT || 8766;
const tipos = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8',
  '.js':'application/javascript; charset=utf-8', '.json':'application/json; charset=utf-8',
  '.jpg':'image/jpeg', '.webmanifest':'application/manifest+json', '.png':'image/png', '.webp':'image/webp',
  '.svg':'image/svg+xml', '.woff2':'font/woff2', '.xml':'application/xml', '.txt':'text/plain; charset=utf-8' };
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const f = path.join(raiz, p);
  if (!f.startsWith(raiz)) { res.writeHead(403).end('no'); return; }
  fs.readFile(f, (e, data) => {
    if (e) { res.writeHead(404, {'Content-Type':'text/plain'}).end('404 ' + p); return; }
    res.writeHead(200, { 'Content-Type': tipos[path.extname(f).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store' });
    res.end(data);
  });
}).listen(puerto, () => console.log('Web en http://localhost:' + puerto + '/ · panel en /panel/'));
