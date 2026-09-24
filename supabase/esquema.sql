-- ============================================================
-- Gimnasios Xtreme Burgos · base de datos de la web y del panel
-- Mismo sistema que la Casa Memoria Rural Viva:
--   · Público (anon): ve los huecos ocupados (sin nombres) y solo puede CREAR
--     citas, plazas de clase y mensajes (por funciones que lo comprueban todo).
--   · Administración (tabla admins + cuenta de Auth): todo lo demás, desde el panel.
-- Se aplica una vez sobre un proyecto de Supabase vacío.
-- ============================================================

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
-- REGLAS: lo que el servidor necesita para comprobar las reservas
-- (centros, servicios de cita, franjas y cuadro horario con su aforo).
-- Es una copia de esas partes de lib/manifest.js; el panel la pone al día
-- sola al entrar si el manifiesto ha cambiado. El contenido de la web NO
-- vive aquí: se edita en lib/manifest.js.
-- ============================================================
create table public.reglas (
  id smallint primary key default 1 check (id = 1),
  datos jsonb not null,
  actualizado timestamptz not null default now()
);

-- ============================================================
-- CITAS: visita, día de prueba, valoración… (reservar.html)
-- ============================================================
create table public.citas (
  id uuid primary key default gen_random_uuid(),
  estado text not null default 'confirmada'
    check (estado in ('confirmada', 'atendida', 'no_vino', 'cancelada')),
  origen text not null default 'web' check (origen in ('web', 'telefono', 'recepcion')),
  servicio text not null check (char_length(servicio) between 1 and 40),
  centro text not null check (char_length(centro) between 1 and 40),
  fecha date not null,
  hora text not null check (hora ~ '^\d{2}:\d{2}$'),
  nombre text not null check (char_length(nombre) between 1 and 120),
  email text check (email is null or char_length(email) <= 200),
  telefono text check (telefono is null or char_length(telefono) <= 40),
  nota text check (nota is null or char_length(nota) <= 2000),
  creada timestamptz not null default now(),
  resuelta timestamptz
);
create index citas_hueco on public.citas (centro, fecha, hora) where estado = 'confirmada';
create index citas_fecha on public.citas (fecha);

-- ============================================================
-- PLAZAS EN CLASES DIRIGIDAS (horarios.html)
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
-- MENSAJES del formulario de contacto
-- ============================================================
create table public.mensajes (
  id uuid primary key default gen_random_uuid(),
  asunto text not null check (char_length(asunto) between 1 and 120),
  nombre text not null check (char_length(nombre) between 1 and 120),
  email text not null check (char_length(email) <= 200),
  telefono text check (telefono is null or char_length(telefono) <= 40),
  mensaje text not null check (char_length(mensaje) between 1 and 4000),
  leido boolean not null default false,
  creado timestamptz not null default now()
);
create index mensajes_creado on public.mensajes (creado desc);

-- ============================================================
-- Seguridad por filas
-- ============================================================
alter table public.admins        enable row level security;   -- sin políticas: nadie la lee desde fuera
alter table public.reglas        enable row level security;
alter table public.citas         enable row level security;
alter table public.inscripciones enable row level security;
alter table public.mensajes      enable row level security;

create policy "admin reglas" on public.reglas
  for all to authenticated using (public.es_admin()) with check (public.es_admin());

create policy "admin citas" on public.citas
  for all to authenticated using (public.es_admin()) with check (public.es_admin());
create policy "admin inscripciones" on public.inscripciones
  for all to authenticated using (public.es_admin()) with check (public.es_admin());
create policy "admin mensajes" on public.mensajes
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

-- Pedir una cita
create or replace function public.crear_cita(
  p_servicio text, p_centro text, p_fecha date, p_hora text,
  p_nombre text, p_email text, p_telefono text, p_nota text default null)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  r jsonb := (select datos -> 'reservas' from public.reglas where id = 1);
  c jsonb := (select datos -> 'centros' from public.reglas where id = 1);
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
               where centro = p_centro and fecha = p_fecha and hora = p_hora
                 and estado = 'confirmada') then
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
  a jsonb := (select datos -> 'agenda' from public.reglas where id = 1);
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

  plazas := coalesce((s ->> 'plazas')::int, (a ->> 'plazasPorDefecto')::int, 20);
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

-- Mensaje del formulario de contacto
create or replace function public.enviar_mensaje(
  p_asunto text, p_nombre text, p_email text, p_telefono text, p_mensaje text)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
begin
  if char_length(trim(coalesce(p_asunto, ''))) < 1 or char_length(p_asunto) > 120 then
    return jsonb_build_object('error', 'Elige el motivo.');
  end if;
  if char_length(trim(coalesce(p_nombre, ''))) < 2 or char_length(p_nombre) > 120 then
    return jsonb_build_object('error', 'Pon tu nombre.');
  end if;
  if not public._correo_valido(p_email) then return jsonb_build_object('error', 'Revisa el correo.'); end if;
  if char_length(coalesce(p_telefono, '')) > 40 then return jsonb_build_object('error', 'Revisa el teléfono.'); end if;
  if char_length(trim(coalesce(p_mensaje, ''))) < 10 or char_length(p_mensaje) > 4000 then
    return jsonb_build_object('error', 'Cuéntanos un poco más (mínimo 10 letras).');
  end if;
  if (select count(*) from public.mensajes
        where lower(email) = lower(p_email) and creado > now() - interval '1 hour') >= 5 then
    return jsonb_build_object('error', 'Has enviado varios mensajes seguidos. Te contestamos enseguida.');
  end if;
  insert into public.mensajes (asunto, nombre, email, telefono, mensaje)
  values (trim(p_asunto), trim(p_nombre), trim(p_email), nullif(trim(coalesce(p_telefono, '')), ''), trim(p_mensaje));
  return jsonb_build_object('ok', true);
end $$;

-- ============================================================
-- Funciones del panel
-- ============================================================

-- Cita a mano (por teléfono o en recepción): se salta las franjas, no los choques
create or replace function public.crear_cita_manual(
  p_servicio text, p_centro text, p_fecha date, p_hora text,
  p_nombre text, p_email text default null, p_telefono text default null,
  p_nota text default null, p_origen text default 'telefono')
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare nuevo uuid;
begin
  if not public.es_admin() then return jsonb_build_object('error', 'No autorizado.'); end if;
  if p_fecha is null or coalesce(p_hora, '') !~ '^\d{2}:\d{2}$' then return jsonb_build_object('error', 'Revisa el día y la hora.'); end if;
  if char_length(trim(coalesce(p_nombre, ''))) < 1 then return jsonb_build_object('error', 'Falta el nombre.'); end if;
  if p_origen not in ('web', 'telefono', 'recepcion') then p_origen := 'telefono'; end if;
  perform pg_advisory_xact_lock(5151);
  if exists (select 1 from public.citas
               where centro = p_centro and fecha = p_fecha and hora = p_hora
                 and estado = 'confirmada') then
    return jsonb_build_object('error', 'Esa hora ya está cogida en ese centro.');
  end if;
  insert into public.citas (estado, origen, servicio, centro, fecha, hora, nombre, email, telefono, nota, resuelta)
  values ('confirmada', p_origen, p_servicio, p_centro, p_fecha, p_hora, trim(p_nombre),
          nullif(trim(coalesce(p_email, '')), ''), nullif(trim(coalesce(p_telefono, '')), ''),
          nullif(trim(coalesce(p_nota, '')), ''), now())
  returning id into nuevo;
  return jsonb_build_object('ok', true, 'id', nuevo);
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
revoke execute on function public.enviar_mensaje(text, text, text, text, text) from public;
grant  execute on function public.enviar_mensaje(text, text, text, text, text) to anon, authenticated;

revoke execute on function public.crear_cita_manual(text, text, date, text, text, text, text, text, text) from public, anon;
grant  execute on function public.crear_cita_manual(text, text, date, text, text, text, text, text, text) to authenticated;

-- ---------- Tiempo real para el panel ----------
alter publication supabase_realtime add table public.citas, public.inscripciones, public.mensajes;
