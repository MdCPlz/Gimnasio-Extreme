-- ============================================================
-- Gimnasios Xtreme Burgos · base de datos de la web y del panel
-- Mismo sistema que la Casa Memoria Rural Viva:
--   · Administración (cuenta de Auth + correo en «admins»): edita desde el
--     panel horarios, actividades, cuotas y bonos, y publica.
--   · Público (anon): lee el contenido publicado, ve los huecos ocupados
--     (sin nombres) y solo puede CREAR citas y plazas de clase, con
--     funciones que lo comprueban todo en el servidor.
-- Se aplica una vez sobre un proyecto de Supabase vacío.
-- ============================================================

create extension if not exists pg_net;

-- ---------- Quién administra ----------
create table public.admins (
  email text primary key
);

create or replace function public.es_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.admins
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- ============================================================
-- CONTENIDO: el manifiesto de la web (lib/manifest.js) tal y como se
-- publica desde el panel. Al publicar, Vercel reconstruye la web con él.
-- ============================================================
create table public.contenido (
  id smallint primary key default 1 check (id = 1),
  datos jsonb not null,
  actualizado timestamptz not null default now(),
  publicado timestamptz            -- última vez que se pidió a Vercel reconstruir
);

-- La dirección secreta que manda a Vercel reconstruir la web (Deploy Hook)
create table public.sitio_privado (
  id smallint primary key default 1 check (id = 1),
  deploy_hook text not null default '' check (char_length(deploy_hook) <= 300)
);
insert into public.sitio_privado default values;

-- Historial: la versión anterior de cada publicación (se guardan 30)
create table public.versiones (
  id bigint generated always as identity primary key,
  datos jsonb not null,
  guardada timestamptz not null default now()
);

create or replace function public._guardar_version()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if old.datos is distinct from new.datos then
    insert into public.versiones (datos) values (old.datos);
    delete from public.versiones
      where id not in (select id from public.versiones order by guardada desc limit 30);
  end if;
  new.actualizado := now();
  return new;
end $$;
revoke execute on function public._guardar_version() from public, anon, authenticated;

create trigger contenido_version before update on public.contenido
  for each row execute function public._guardar_version();

-- ============================================================
-- CITAS: visita, día de prueba, valoración… (reservar.html)
-- Sirven para que dos personas no cojan la misma hora en el mismo centro.
-- ============================================================
create table public.citas (
  id uuid primary key default gen_random_uuid(),
  estado text not null default 'confirmada' check (estado in ('confirmada', 'cancelada')),
  servicio text not null check (char_length(servicio) between 1 and 40),
  centro text not null check (char_length(centro) between 1 and 40),
  fecha date not null,
  hora text not null check (hora ~ '^\d{2}:\d{2}$'),
  nombre text not null check (char_length(nombre) between 1 and 120),
  email text check (email is null or char_length(email) <= 200),
  telefono text check (telefono is null or char_length(telefono) <= 40),
  nota text check (nota is null or char_length(nota) <= 2000),
  creada timestamptz not null default now()
);
create index citas_hueco on public.citas (centro, fecha, hora) where estado = 'confirmada';

-- ============================================================
-- PLAZAS EN CLASES DIRIGIDAS (horarios.html): aforo compartido
-- ============================================================
create table public.inscripciones (
  id uuid primary key default gen_random_uuid(),
  estado text not null default 'activa' check (estado in ('activa', 'cancelada')),
  fecha date not null,
  hora text not null check (hora ~ '^\d{2}:\d{2}$'),
  clase text not null check (char_length(clase) between 1 and 60),
  centro text not null check (char_length(centro) between 1 and 40),
  nombre text not null check (char_length(nombre) between 1 and 120),
  email text not null check (char_length(email) <= 200),
  creada timestamptz not null default now(),
  cancelada timestamptz
);
create index inscripciones_sesion on public.inscripciones (fecha, hora, clase, centro) where estado = 'activa';
create unique index inscripciones_una_por_socio on public.inscripciones (fecha, hora, clase, centro, lower(email)) where estado = 'activa';

-- ============================================================
-- Seguridad por filas
-- ============================================================
alter table public.admins        enable row level security;   -- sin políticas: nadie la lee desde fuera
alter table public.contenido     enable row level security;
alter table public.sitio_privado enable row level security;
alter table public.versiones     enable row level security;
alter table public.citas         enable row level security;
alter table public.inscripciones enable row level security;

create policy "contenido publico" on public.contenido
  for select to anon, authenticated using (true);
create policy "admin cambia contenido" on public.contenido
  for all to authenticated using (public.es_admin()) with check (public.es_admin());

create policy "admin publicacion" on public.sitio_privado
  for all to authenticated using (public.es_admin()) with check (public.es_admin());
create policy "admin historial" on public.versiones
  for select to authenticated using (public.es_admin());

create policy "admin citas" on public.citas
  for all to authenticated using (public.es_admin()) with check (public.es_admin());
create policy "admin inscripciones" on public.inscripciones
  for all to authenticated using (public.es_admin()) with check (public.es_admin());

-- ============================================================
-- Funciones públicas (la web)
-- ============================================================

-- Huecos de cita ya cogidos, sin datos personales
create or replace function public.huecos_ocupados(p_desde date, p_hasta date)
returns table (centro text, fecha date, hora text)
language sql stable security definer set search_path = public as $$
  select c.centro, c.fecha, c.hora from public.citas c
    where c.estado = 'confirmada'
      and c.fecha between p_desde and least(p_hasta, p_desde + 120);
$$;

-- Plazas cogidas en cada sesión de clase, sin datos personales
create or replace function public.plazas_ocupadas(p_desde date, p_hasta date)
returns table (fecha date, hora text, clase text, centro text, cogidas integer)
language sql stable security definer set search_path = public as $$
  select i.fecha, i.hora, i.clase, i.centro, count(*)::int from public.inscripciones i
    where i.estado = 'activa' and i.fecha between p_desde and least(p_hasta, p_desde + 60)
    group by i.fecha, i.hora, i.clase, i.centro;
$$;

create or replace function public._correo_valido(p text)
returns boolean language sql immutable as $$
  select coalesce(p, '') ~* '^[^@\s]+@[^@\s]+\.[a-z]{2,}$' and char_length(p) <= 200;
$$;

-- Pedir una cita. Las franjas, los servicios y los centros salen del contenido publicado.
create or replace function public.crear_cita(
  p_servicio text, p_centro text, p_fecha date, p_hora text,
  p_nombre text, p_email text, p_telefono text, p_nota text default null)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  r jsonb := (select datos -> 'reservas' from public.contenido where id = 1);
  c jsonb := (select datos -> 'centros' from public.contenido where id = 1);
  franjas jsonb;
  dow int := extract(isodow from p_fecha);
  nuevo uuid;
begin
  if r is null then return jsonb_build_object('error', 'Las citas no están disponibles ahora mismo.'); end if;
  if not exists (select 1 from jsonb_array_elements(r -> 'servicios') s where s ->> 'id' = p_servicio) then
    return jsonb_build_object('error', 'Elige qué quieres hacer.');
  end if;
  if not exists (select 1 from jsonb_array_elements(c) x where x ->> 'id' = p_centro) then
    return jsonb_build_object('error', 'Elige un centro.');
  end if;
  if p_fecha is null or p_fecha < current_date
     or p_fecha > current_date + coalesce((r ->> 'diasAntelacionMax')::int, 45) then
    return jsonb_build_object('error', 'Esa fecha no es reservable.');
  end if;
  franjas := case when dow = 7 then r -> 'franjas' -> 'domingo'
                  when dow = 6 then r -> 'franjas' -> 'sabado'
                  else r -> 'franjas' -> 'laborables' end;
  if franjas is null or not (franjas @> to_jsonb(p_hora)) then
    return jsonb_build_object('error', 'Esa hora no está disponible ese día.');
  end if;
  if (p_fecha + p_hora::time) < (now() at time zone 'Europe/Madrid') + interval '1 hour' then
    return jsonb_build_object('error', 'Esa hora ya ha pasado o es demasiado pronto.');
  end if;
  if char_length(trim(coalesce(p_nombre, ''))) < 2 or char_length(p_nombre) > 120 then
    return jsonb_build_object('error', 'Pon tu nombre.');
  end if;
  if not public._correo_valido(p_email) then return jsonb_build_object('error', 'Revisa el correo.'); end if;
  if coalesce(p_telefono, '') !~ '^[+\d][\d\s().-]{7,}$' or char_length(p_telefono) > 40 then
    return jsonb_build_object('error', 'Revisa el teléfono.');
  end if;
  if char_length(coalesce(p_nota, '')) > 2000 then return jsonb_build_object('error', 'La nota es demasiado larga.'); end if;
  -- freno al spam: como mucho tres citas por delante con el mismo correo
  if (select count(*) from public.citas
        where lower(email) = lower(p_email) and estado = 'confirmada' and fecha >= current_date) >= 3 then
    return jsonb_build_object('error', 'Ya tienes tres citas por delante. Llámanos si necesitas otra.');
  end if;

  perform pg_advisory_xact_lock(5151);
  if exists (select 1 from public.citas
               where centro = p_centro and fecha = p_fecha and hora = p_hora and estado = 'confirmada') then
    return jsonb_build_object('error', 'Alguien acaba de coger esa hora. Elige otra.');
  end if;

  insert into public.citas (servicio, centro, fecha, hora, nombre, email, telefono, nota)
  values (p_servicio, p_centro, p_fecha, p_hora, trim(p_nombre), trim(p_email), trim(p_telefono),
          nullif(trim(coalesce(p_nota, '')), ''))
  returning id into nuevo;
  return jsonb_build_object('ok', true, 'id', nuevo);
end $$;

-- Coger plaza en una clase. El aforo sale del cuadro horario publicado.
create or replace function public.apuntarse(
  p_fecha date, p_hora text, p_clase text, p_centro text, p_nombre text, p_email text)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  a jsonb := (select datos -> 'agenda' from public.contenido where id = 1);
  s jsonb;
  plazas int;
  cogidas int;
  nuevo uuid;
begin
  if a is null then return jsonb_build_object('error', 'Las reservas de clase no están disponibles ahora mismo.'); end if;
  select e into s from jsonb_array_elements(a -> 'horario') e
    where (e ->> 'dia')::int = extract(isodow from p_fecha)::int
      and e ->> 'hora' = p_hora and e ->> 'clase' = p_clase and e ->> 'centro' = p_centro
    limit 1;
  if s is null then return jsonb_build_object('error', 'Esa clase ya no está en el horario.'); end if;
  if p_fecha > current_date + 14 then return jsonb_build_object('error', 'Solo se reserva con dos semanas de antelación.'); end if;
  if (p_fecha + p_hora::time) < (now() at time zone 'Europe/Madrid') + interval '30 minutes' then
    return jsonb_build_object('error', 'Esa clase ya ha empezado.');
  end if;
  if char_length(trim(coalesce(p_nombre, ''))) < 2 or char_length(p_nombre) > 120 then
    return jsonb_build_object('error', 'Pon tu nombre.');
  end if;
  if not public._correo_valido(p_email) then return jsonb_build_object('error', 'Revisa el correo.'); end if;
  if (select count(*) from public.inscripciones
        where lower(email) = lower(p_email) and estado = 'activa' and fecha >= current_date) >= 10 then
    return jsonb_build_object('error', 'Tienes ya diez clases reservadas. Cancela alguna antes de coger otra.');
  end if;

  plazas := coalesce(nullif(s ->> 'plazas', '')::int, (a ->> 'plazasPorDefecto')::int, 20);
  perform pg_advisory_xact_lock(5252);
  if exists (select 1 from public.inscripciones
               where fecha = p_fecha and hora = p_hora and clase = p_clase and centro = p_centro
                 and lower(email) = lower(p_email) and estado = 'activa') then
    return jsonb_build_object('error', 'Ya tienes plaza en esta clase.');
  end if;
  select count(*) into cogidas from public.inscripciones
    where fecha = p_fecha and hora = p_hora and clase = p_clase and centro = p_centro and estado = 'activa';
  if cogidas >= plazas then return jsonb_build_object('error', 'Se acaba de llenar. Prueba con otra sesión.'); end if;

  insert into public.inscripciones (fecha, hora, clase, centro, nombre, email)
  values (p_fecha, p_hora, p_clase, p_centro, trim(p_nombre), lower(trim(p_email)))
  returning id into nuevo;
  return jsonb_build_object('ok', true, 'id', nuevo, 'libres', plazas - cogidas - 1);
end $$;

-- Soltar la plaza. Hace falta el identificador (solo lo tiene quien reservó) y su correo.
create or replace function public.soltar_plaza(p_id uuid, p_email text)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
begin
  update public.inscripciones set estado = 'cancelada', cancelada = now()
    where id = p_id and lower(email) = lower(coalesce(p_email, '')) and estado = 'activa';
  if not found then return jsonb_build_object('error', 'No encuentro esa reserva.'); end if;
  return jsonb_build_object('ok', true);
end $$;

-- ============================================================
-- Funciones del panel
-- ============================================================

-- Publicar: guarda el contenido y avisa a Vercel para que reconstruya la web
create or replace function public.publicar(p_datos jsonb)
returns jsonb language plpgsql volatile security definer set search_path = public, extensions as $$
declare hook text;
begin
  if not public.es_admin() then return jsonb_build_object('error', 'No autorizado.'); end if;
  if p_datos is null or jsonb_typeof(p_datos) <> 'object' or p_datos -> 'centros' is null then
    return jsonb_build_object('error', 'El contenido no es válido.');
  end if;
  if octet_length(p_datos::text) > 900000 then return jsonb_build_object('error', 'El contenido es demasiado grande.'); end if;
  insert into public.contenido (id, datos) values (1, p_datos)
    on conflict (id) do update set datos = excluded.datos;
  select deploy_hook into hook from public.sitio_privado where id = 1;
  if coalesce(hook, '') ~ '^https://api\.vercel\.com/' then
    perform net.http_post(url := hook, body := '{}'::jsonb);
    update public.contenido set publicado = now() where id = 1;
    return jsonb_build_object('ok', true, 'reconstruye', true);
  end if;
  return jsonb_build_object('ok', true, 'reconstruye', false);
end $$;

-- Volver a una versión anterior (y reconstruir)
create or replace function public.restaurar_version(p_id bigint)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare v jsonb;
begin
  if not public.es_admin() then return jsonb_build_object('error', 'No autorizado.'); end if;
  select datos into v from public.versiones where id = p_id;
  if v is null then return jsonb_build_object('error', 'No encuentro esa versión.'); end if;
  return public.publicar(v);
end $$;

-- ---------- Permisos de las funciones ----------
revoke execute on function public.es_admin() from public, anon;
grant  execute on function public.es_admin() to authenticated;
revoke execute on function public._correo_valido(text) from public, anon, authenticated;

grant execute on function public.huecos_ocupados(date, date) to anon, authenticated;
grant execute on function public.plazas_ocupadas(date, date) to anon, authenticated;
revoke execute on function public.crear_cita(text, text, date, text, text, text, text, text) from public;
grant  execute on function public.crear_cita(text, text, date, text, text, text, text, text) to anon, authenticated;
revoke execute on function public.apuntarse(date, text, text, text, text, text) from public;
grant  execute on function public.apuntarse(date, text, text, text, text, text) to anon, authenticated;
revoke execute on function public.soltar_plaza(uuid, text) from public;
grant  execute on function public.soltar_plaza(uuid, text) to anon, authenticated;

revoke execute on function public.publicar(jsonb) from public, anon;
grant  execute on function public.publicar(jsonb) to authenticated;
revoke execute on function public.restaurar_version(bigint) from public, anon;
grant  execute on function public.restaurar_version(bigint) to authenticated;

-- ---------- Fotos que se suben desde el panel ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('web', 'web', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "web: admin sube fotos" on storage.objects for insert to authenticated
  with check (bucket_id = 'web' and public.es_admin());
create policy "web: admin cambia fotos" on storage.objects for update to authenticated
  using (bucket_id = 'web' and public.es_admin()) with check (bucket_id = 'web' and public.es_admin());
create policy "web: admin borra fotos" on storage.objects for delete to authenticated
  using (bucket_id = 'web' and public.es_admin());

-- ---------- Tiempo real para el panel (si otra persona publica) ----------
alter publication supabase_realtime add table public.contenido;
