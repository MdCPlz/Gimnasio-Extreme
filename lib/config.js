/* Conexión con la base de datos (Supabase).
   La clave es la PÚBLICA: está pensada para ir en la web. Lo que se puede
   hacer con ella lo limitan las reglas de la base de datos: sin sesión solo
   se ven huecos ocupados y el contenido publicado, y solo se pueden pedir
   citas, coger plaza en una clase y mandar mensajes.
   Vacío = la web funciona como antes, sin base de datos (solo avisos por correo). */
window.__SUPABASE__ = {
  url: "",
  key: ""
};
