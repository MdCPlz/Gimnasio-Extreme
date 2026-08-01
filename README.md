# Gimnasios Xtreme Burgos — web

Sitio estático en HTML, CSS y JavaScript sin frameworks. Se sube tal cual por FTP
o se arrastra a cualquier alojamiento. **No hay que compilar nada.**

---

## Lo primero: qué hay que confirmar antes de publicar

Está todo marcado con ⚠ dentro de `lib/manifest.js`. Resumido:

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

## Cómo se cambia el contenido

**Todo** vive en un único archivo: **`lib/manifest.js`**. Ni un precio ni un
teléfono están repartidos por el código. Hay dos formas de tocarlo:

### 1. A mano
Abre `lib/manifest.js` con cualquier editor de texto, cambia lo que sea y guarda.
Está comentado línea a línea.

### 2. Con el panel de gestión
Abre `panel.html` y mete la clave (`xtreme2026`, se cambia dentro del propio
panel o en `manifest.js → panel.clave`).

**Cómo está organizado**

- **Repaso** — lo primero que ves: la lista de lo que falta por confirmar antes
  de publicar, con un botón que te lleva a arreglarlo. Cuando esté todo en
  verde, la web está lista.
- **Clases, Cuotas, Bonos, Horarios, Equipo, Centros, Galería, Reseñas** — cada
  una es una lista a la izquierda y la ficha a la derecha, con **la tarjeta real
  pintada al lado mientras escribes**. Se pueden añadir, duplicar, reordenar y
  eliminar elementos, y hay buscador cuando la lista es larga.
- **Ofertas, Portada, Horas punta, Contacto, SEO, Acceso** — formularios
  normales para los textos y los ajustes.

**Importar fotos.** En cualquier campo de imagen puedes arrastrar una foto o
pulsar «Importar foto…». El panel la recorta al tamaño exacto que usa esa ficha,
la convierte a **WebP + JPG** y te descarga los dos archivos ya optimizados y con
el nombre correcto. La ruta se rellena sola; a ti sólo te queda **copiar los dos
archivos a `assets/img/`**. El panel te recuerda cuáles faltan por copiar.

**Publicar.** Botón *Publicar* (o ⌘S). Te explica los tres pasos y te descarga el
`manifest.js`. Lo subes a `lib/` y ya está en la web.

> Los cambios se guardan solos en tu navegador: puedes cerrar y seguir mañana.
> Cada campo que tocas enseña un «deshacer» que lo devuelve a como estaba
> publicado, y hay un botón para descartarlo todo.
>
> La clave sólo desbloquea el editor en tu dispositivo, **no protege el
> servidor**: `manifest.js` viaja al navegador y cualquiera puede leerla. Si no
> quieres que el panel sea accesible desde internet, **no subas `panel.html`** o
> protégelo con la autenticación del alojamiento.

---

## Subir la web

### Por FTP (lo más simple)
Arrastra **todo el contenido de esta carpeta** a la raíz pública del alojamiento
(`public_html`, `www` o similar). Ya está.

Funciona igual abriendo `index.html` con doble clic, subida a la raíz del dominio
o dentro de una subcarpeta: todas las rutas son relativas.

**Sin configurar nada más funciona todo** menos tres cosas, que necesitan
funciones de servidor (ver abajo): el envío de los formularios por correo, la
nota de Google en vivo y la ocupación real. Cuando fallan, la web no se rompe:
el formulario ofrece abrir el correo con el mensaje ya escrito, la nota sale del
manifiesto y el gráfico usa el patrón histórico.

### Con funciones de servidor (Vercel, Netlify…)
La carpeta `api/` son funciones serverless en JavaScript. Si el alojamiento las
soporta, se activan solas al subir. Hay que poner las variables de entorno del
archivo `.env.example` en el panel del proveedor.

**Las claves nunca van en el repositorio.** `.gitignore` ya excluye `.env`.

| Variable | Para qué | ¿Obligatoria? |
|---|---|---|
| `RESEND_API_KEY` | Enviar los correos de contacto y reservas | Para que lleguen los avisos |
| `CORREO_DESTINO` | A dónde llegan | Sí, si usas el correo |
| `CORREO_ORIGEN` | Remitente verificado | Sí, si usas el correo |
| `GOOGLE_MAPS_API_KEY` | Nota de Google en vivo | No |
| `GOOGLE_PLACE_ID` | Ficha del negocio | No |
| `OCUPACION_URL` | Ocupación real de los tornos | No |

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
panel.html            Mini-CMS (no lo subas si no quieres que sea público)
404.html              Página de error

lib/manifest.js       ← TODO EL CONTENIDO ESTÁ AQUÍ
lib/plantillas.js     Utilidades: iconos, formatos, fechas, rutas
assets/css/           Hoja de estilo y tipografías
assets/js/            Un archivo por pieza del sitio
assets/img/           Fotos en WebP + JPG de respaldo, favicons y og:image
assets/fonts/         Archivo e Inter, servidas desde el propio sitio
assets/video/         Aquí va el vídeo de la portada (ver LEEME.txt)
api/                  Funciones de servidor (correo, nota de Google, ocupación)
legal/                Aviso legal, privacidad y cookies
```

---

## Detalles que conviene saber

**El vídeo de portada** no está incluido: hay que grabarlo o comprarlo. Mientras
no exista, la portada se queda con la foto de fondo y se ve perfecta. Instrucciones
en `assets/video/LEEME.txt`.

**Las reservas de clase y el área de socio** funcionan en el navegador del
visitante: no hay base de datos. Al club le llega un correo por cada plaza
cogida o liberada. Si algún día necesitan un sistema de verdad con aforo
compartido entre todos los socios, hay que conectar `api/inscripcion.js` a su
sistema de gestión.

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
