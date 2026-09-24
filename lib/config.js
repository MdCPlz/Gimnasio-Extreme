/* Conexión con la base de datos (Supabase), proyecto gimnasios-xtreme.
   La clave es la PÚBLICA: está pensada para ir en la web. Lo que se puede
   hacer con ella lo limitan las reglas de la base de datos: sin sesión solo
   se ve el contenido publicado y los huecos ocupados (sin nombres), y solo
   se pueden pedir citas y coger plaza en una clase.
   Vacío = la web funciona sin base de datos (solo avisos por correo). */
window.__SUPABASE__ = {
  url: "https://desinsnxeopqaaayuiht.supabase.co",
  key: "sb_publishable_pmkwhgF1ZnIxUFmnQOzJ6g_CXzos0ep"
};
