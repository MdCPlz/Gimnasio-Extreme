# Gimnasios Xtreme Burgos — web

Sitio estático en HTML, CSS y JavaScript sin frameworks, con panel de gestión y base
de datos en Supabase. **No hay que compilar nada**: `tools/publicar.js` solo copia
archivos y mete el contenido publicado.

---

## Lo primero: qué hay que confirmar antes de publicar

Está todo marcado con ⚠ dentro de `lib/manifest.js` y en la sección **Repaso** del panel. Resumido:

| Qué | Estado | Dónde se cambia |
|---|---|---|
| **Precios de las cuotas** | ✅ **Reales.** Sacados del sistema de altas del club (`gimnasiosxtreme.provis.es` → INSCRIPCIÓN / ALTAS / TARIFAS) el 1 de agosto de 2026. Revísalos cada temporada. | `tarifas.planes` y `tarifas.extras` |
| **Fichas de los monitores** | ❗ **De ejemplo.** La página de monitores del cliente está vacía. Alejandro, Susana y Diego son nombres reales citados en sus reseñas de Google; el resto de la ficha es relleno. | `equipo.miembros` |
| **Cuadro de clases** | ⚠ **Mixto.** Las artes marciales llevan el horario real del club; el resto de clases dirigidas es una propuesta coherente con «más de 40 a la semana». Pide el cuadro completo. | `agenda.horario` |
| **Correo de atención** | ⚠ El único correo público del club es el de empleo. Hay que confirmar cuál recibe los avisos. | `contacto.email` |
| **Patrones de ocupación** | ⚠ Estimados. Se ajustan con los datos de los tornos. | `ocupacion.patron` |
| **Coordenadas de los centros** | ⚠ Aproximadas a partir de la dirección postal. | `centros[].coords` |
| **Horario de recepción** | ⚠ Sin confirmar. | `horario.recepcion` |

Lo que **sí** es real y viene de ellos: las tres direcciones y teléfonos, la razón
social (Fitness Sarmiento S.L., NIF B09557158), las cifras de instalaciones
(3.800 m², 120 máquinas, 100 puestos de cardio, 600 m² de peso libre, 6 salas),
las clases con sus descripciones, las marcas de equipamiento, el modelo 3x1, el
horario 24 h, el logotipo y **todos los precios**.

### Los precios, tal y como los cobra el club

| Cuota | Precio | Al mes | Matrícula |
|---|---|---|---|
| Mensual | 39,90 € | 39,90 € | 3 € |
| Trimestral | 113,00 € | 37,67 € | — |
| Semestral (no interrumpible) | 205,00 € | 34,17 € | — |
| Entrada de día | 9,00 € | — | Llave 3 € (pago único) |
| Bono 7 días | 21,90 € | — | Incluye pulsera |
| Bono 15 días | 29,90 € | — | Incluye pulsera |
| Judo adultos / Kick Boxing / Krav Maga | 41,00 €/mes | — | 21 € (Krav Maga, sin matrícula) |
| Judo infantil / Taekwondo | 34,00 €/mes | — | 21 € |
| Judo en colegios | 26,00 €/mes | — | — |

De 14 a 17 años: mismas cuotas, con acceso de 06:00 a 24:00 en vez de 24 horas.
Descuento familiar: el primero paga completo y el resto la mensual al 50 %.

**Un detalle deliberado:** las cuotas largas **no** llevan precio tachado, porque
nunca han costado otra cosa. En su lugar se enseña el equivalente mensual y el
ahorro real frente a pagar mes a mes (26,80 € al año la trimestral, 68,80 € la
semestral). El porcentaje del distintivo se calcula sobre eso, no sobre un
precio inventado. Si algún día el club rebaja de verdad una cuota, se rellena
`precioAntes` y aparece el tachado.

---

## En internet

Mismo sistema que la web de Nuria Peña (Casa Memoria Rural Viva): web y panel
separados, cada uno en su repositorio y su proyecto de Vercel, y una base de
datos de Supabase que comparten.

| | Dirección |
|---|---|
| Web | https://gimnasios-xtreme.vercel.app (hasta que se apunte el dominio) |
| Panel | https://panel-gimnasios-xtreme.vercel.app (privado, no indexado) |

Base de datos: proyecto de Supabase **gimnasios-xtreme** (su propia cuenta, no
la de RACHA ni la de la Casa). La estructura entera está en `supabase/esquema.sql`.
La web habla con ella por `lib/datos.js`; el panel, por `panel/gestion.js`.
La conexión (dirección y clave **pública**) está en `lib/config.js`.

> Con `lib/config.js` vacío la web funciona igual que antes, sin base: las
> citas y los mensajes llegan solo por correo y las plazas de clase viven en el
> dispositivo de cada socio. El panel, en cambio, necesita la base.

### Qué guarda la base de datos

| Tabla | Qué es | Quién escribe |
|---|---|---|
| `citas` | Visitas, días de prueba, valoraciones… (reservar.html) | La web (función `crear_cita`) y el panel |
| `inscripciones` | Plazas en clases dirigidas (horarios.html) | La web (`apuntarse`, `soltar_plaza`) y el panel |
| `mensajes` | Formulario de contacto | La web (`enviar_mensaje`) |
| `contenido` | Todo el manifiesto: clases, cuotas, horarios, textos… | Solo el panel (`publicar`) |
| `versiones` | Las 30 últimas publicaciones, para volver atrás | Automático |
| `admins` | Correos con acceso al panel | A mano, en Supabase |

Sin sesión (la web) solo se ven huecos ocupados y plazas cogidas, **sin
nombres**, y solo se puede crear. Las funciones comprueban en el servidor que la
hora esté dentro de las franjas, que la clase exista en el horario publicado y
que quede aforo: no se puede reservar saltándose la web.

Los correos de aviso (`api/`, con Resend) siguen funcionando igual; ahora son
un extra: si fallan, la cita o el mensaje ya está guardado y sale en el panel.

### Publicar

Dos repositorios de GitHub, cada uno conectado a su proyecto de Vercel:

| GitHub | Vercel | Qué publica |
|---|---|---|
| `MdCPlz/Gimnasio-Extreme` (este) | `gimnasios-xtreme` | la web: Vercel ejecuta `tools/publicar.js` y sirve solo `dist/gimnasios-xtreme` (ver `vercel.json`); las funciones de `api/` las monta aparte |
| `MdCPlz/panel-gimnasios-xtreme` | `panel-gimnasios-xtreme` | el panel, tal cual |

**El código de la web** se publica solo con cada `git push` a este repositorio.

**El contenido** (precios, clases, horarios, textos, fotos) se publica desde el
panel con el botón *Publicar*: se guarda en la base de datos y el panel llama al
*Deploy Hook* de Vercel, que reconstruye la web con lo publicado. Tarda un minuto.
El Deploy Hook se crea en Vercel → proyecto de la web → Settings → Git → Deploy
Hooks (rama `main`) y se pega en el panel, sección **Publicación**.

**El panel** se edita aquí, en `panel/`, y se publica así:

```bash
node tools/publicar.js https://gimnasios-xtreme.vercel.app
cd dist/panel-gimnasios-xtreme
git add -A && git commit -m "Descripción del cambio" && git push
```

`dist/panel-gimnasios-xtreme` es una copia de trabajo del repositorio del panel:
el script la regenera sin tocar su `.git`. El repositorio del panel no se edita a mano.

> **Ojo con Vercel y este repositorio.** Sin el `vercel.json` de la raíz,
> Vercel publicaría el repositorio entero, con `panel/`, `tools/`, `supabase/`
> y este README a la vista. Le pasó a la web de la Casa el 24/09/2026. No borrarlo.
> Tras cualquier cambio de despliegue, comprobar que `/panel/`, `/tools/` y
> `/README.md` dan 404 en la web.

### Dar acceso al panel

1. Supabase → Authentication → Users → Add user → Create new user: correo,
   contraseña y *Auto Confirm User* marcado.
2. Ese correo tiene que estar en la lista de administración:
   `insert into public.admins (email) values ('correo@ejemplo.es');`

Una cuenta que no esté en `admins` no ve ni cambia nada aunque tenga contraseña.

### Probar en local

```bash
node tools/servidor.js
```

Web en http://localhost:8766/ y panel en http://localhost:8766/panel/.
Para ver el panel **sin cuenta ni base de datos**, con datos de ejemplo:
`node tools/generar-prueba.js` y abrir http://localhost:8766/tools/panel-prueba.html
(en la consola, `__simulaWeb()` hace llegar una cita y un mensaje como desde la web).

---

## El panel

Se entra con correo y contraseña. Está pensado también para el móvil y se puede
instalar como app («Añadir a pantalla de inicio»).

**Día a día** — lo que llega de la web aparece al momento, con aviso:

- **Hoy** — citas de hoy, clases de hoy con su gente y mensajes sin leer.
- **Citas** — próximas, de hoy, pasadas y canceladas, por centro. Cada una se
  marca como atendida, no vino o cancelada (al cancelar, la hora vuelve a quedar
  libre en la web). *Nueva cita* para las que llegan por teléfono o en recepción.
- **Plazas en clases** — quién se ha apuntado a cada clase de las dos próximas
  semanas, con el aforo, y un botón para liberar una plaza.
- **Mensajes** — el formulario de contacto, con *Responder*.

**La web** — el editor de contenido de siempre:

- **Repaso** — lo que falta por confirmar antes de salir a producción.
- **Clases, Cuotas, Bonos, Horarios, Equipo, Centros, Galería, Reseñas** — lista
  a la izquierda y ficha a la derecha, con **la tarjeta real pintada al lado
  mientras escribes**. Se pueden añadir, duplicar, reordenar y eliminar.
- **Ofertas, Portada, Horas punta, Contacto, SEO** — formularios normales.

**Importar fotos.** En cualquier campo de imagen se arrastra una foto o se pulsa
«Importar foto…». El panel la recorta al tamaño exacto de esa ficha, la convierte
a WebP + JPG y **la sube sola** al almacén de fotos de Supabase. No hay que copiar
nada a ningún sitio: sale en la web al publicar.

**Publicar** (o Ctrl+S). Los cambios se guardan como borrador en el dispositivo
mientras se edita; cada campo tocado tiene su «deshacer». Al publicar, se guardan
en la base de datos y la web se reconstruye sola.

**Publicación** — el Deploy Hook de Vercel, el **historial** de las 30 últimas
publicaciones con «Volver a esta», y una copia descargable del contenido.

---

## Qué hay dentro

```
index.html            Portada: intro por scroll, vídeo, cifras, clases, horas
                      punta, cuotas, reseñas, equipo y centros
clases.html           Catálogo con buscador y filtros por tipo
tarifas.html          Cuotas, extras, descuentos por colectivo y dudas
horarios.html         Cuadro de clases con plazas y reserva
centros.html          Los tres gimnasios con mapa
reservar.html         Cita previa: servicio, centro, día y hora
contacto.html         Formulario validado y datos de los tres centros
galeria.html          Mosaico con visor ampliable
area-socio.html       Acceso de socio: sus reservas
404.html              Página de error

lib/manifest.js       Contenido de partida. En producción lo sustituye el que
                      se publica desde el panel (lo genera tools/publicar.js)
lib/config.js         Conexión con Supabase (clave pública)
lib/datos.js          Lo que la web lee y escribe en la base de datos
lib/plantillas.js     Utilidades: iconos, formatos, fechas, rutas
assets/css/           Hoja de estilo y tipografías
assets/js/            Un archivo por pieza del sitio
assets/img/           Fotos en WebP + JPG de respaldo, favicons y og:image
assets/fonts/         Archivo e Inter, servidas desde el propio sitio
assets/video/         Aquí va el vídeo de la portada (ver LEEME.txt)
api/                  Funciones de servidor (correo, nota de Google, ocupación)
legal/                Aviso legal, privacidad y cookies

panel/                El panel (se publica aparte, ver «Publicar»)
supabase/esquema.sql  La base de datos entera: tablas, reglas y funciones
tools/                Publicar, servidor local y prueba del panel. No se publica
vercel.json           Cómo construye Vercel la web. No borrar
```

---

## Detalles que conviene saber

**El vídeo de portada** no está incluido: hay que grabarlo o comprarlo. Mientras
no exista, la portada se queda con la foto de fondo y se ve perfecta. Instrucciones
en `assets/video/LEEME.txt`.

**Las reservas de clase** van contra la base de datos: el aforo es compartido
por todos los socios y el club las ve en el panel. El socio se identifica solo
con su correo (no hay contraseñas de socio) y la web recuerda sus reservas en
su dispositivo. El alta, la cuota y los recibos siguen en el sistema del club (Provis).

**El mapa de Google no se carga** hasta que el visitante acepta las cookies de
mapas. Mientras tanto sale un recuadro con un botón y un enlace a Google Maps.
Es un requisito del RGPD, no un despiste.

**La analítica** está preparada pero apagada: en cuanto se ponga el ID en
`legal.analitica.id`, se cargará sólo para quien acepte las cookies de medición.

**Accesibilidad:** contraste AA, navegación completa con teclado, foco visible,
textos alternativos en todas las imágenes y respeto a «reducir movimiento» del
sistema (con esa opción activada, la intro no aparece y las animaciones se
desactivan).

---

## Créditos de las imágenes

**Todas las fotos son del propio gimnasio.** Vienen del reportaje profesional que
el club publicó en su web en febrero de 2025 (36 fotos a 2560 px), más las fotos
oficiales de Pilates y Body Balance. Nada de bancos de imágenes: la sala que se
ve en cada ficha es la suya.

Cada clase lleva la foto que de verdad la representa —la clase colectiva de
golpeo en Cardio Box, los steps apilados en Gap-Step, los judokas en el tatami
en Judo, la sala de ciclo en Ciclo indoor— y la galería es una selección de ese
mismo reportaje.

Lo único que sigue siendo material generado son **los retratos del equipo**:
siluetas con los colores de la marca, pendientes de sustituir por las fotos
reales de los monitores.
