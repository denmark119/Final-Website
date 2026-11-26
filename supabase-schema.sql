create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default 'Patient',
  phone text,
  joined_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  doctor_name text not null,
  specialty text not null,
  starts_at timestamptz not null,
  reason text,
  status text not null default 'confirmed'
    check (status in ('confirmed', 'completed', 'cancelled')),
  consultation_fee numeric(10, 2) not null default 60.00,
  discount_percent numeric(5, 2) not null default 0
    check (discount_percent in (0, 10, 15)),
  amount_due numeric(10, 2) generated always as (
    round(consultation_fee * (1 - discount_percent / 100), 2)
  ) stored,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists appointments_user_status_start_idx
  on public.appointments (user_id, status, starts_at);

alter table public.profiles enable row level security;
alter table public.appointments enable row level security;

revoke all on public.profiles, public.appointments from public, anon, authenticated;
grant select on public.profiles, public.appointments to authenticated;
grant update (full_name, phone) on public.profiles to authenticated;
grant insert (doctor_name, specialty, starts_at, reason)
  on public.appointments to authenticated;

drop policy if exists "Patients can read their own profile" on public.profiles;
create policy "Patients can read their own profile"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));

drop policy if exists "Patients can update their own profile" on public.profiles;
create policy "Patients can update their own profile"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

drop policy if exists "Patients can read their own appointments" on public.appointments;
create policy "Patients can read their own appointments"
  on public.appointments for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Patients can create their own appointments" on public.appointments;
create policy "Patients can create their own appointments"
  on public.appointments for insert to authenticated
  with check (user_id = (select auth.uid()));

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, full_name, joined_at)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'Patient'
    ),
    new.created_at
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists create_profile_after_signup on auth.users;
create trigger create_profile_after_signup
  after insert on auth.users
  for each row execute function public.create_profile_for_new_user();

revoke all on function public.create_profile_for_new_user() from public, anon, authenticated;

create or replace function public.prepare_patient_appointment()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  patient_id uuid := auth.uid();
  member_since timestamptz;
  completed_visits integer;
begin
  if patient_id is null then
    raise exception 'Sign in before booking an appointment.';
  end if;
  if new.starts_at <= now() then
    raise exception 'Choose an appointment time in the future.';
  end if;

  select joined_at into member_since
  from public.profiles
  where id = patient_id;

  if member_since is null then
    raise exception 'Your patient profile is not ready yet.';
  end if;

  select count(*)::integer into completed_visits
  from public.appointments
  where user_id = patient_id and status = 'completed';

  new.user_id := patient_id;
  new.status := 'confirmed';
  new.consultation_fee := 60.00;
  new.completed_at := null;

  if member_since <= now() - interval '12 months' and completed_visits >= 10 then
    new.discount_percent := 15;
  elsif member_since <= now() - interval '6 months' and completed_visits >= 5 then
    new.discount_percent := 10;
  else
    new.discount_percent := 0;
  end if;

  return new;
end;
$$;

drop trigger if exists prepare_patient_appointment_before_insert on public.appointments;
create trigger prepare_patient_appointment_before_insert
  before insert on public.appointments
  for each row execute function public.prepare_patient_appointment();

revoke all on function public.prepare_patient_appointment() from public, anon, authenticated;

create or replace function public.get_my_loyalty_status()
returns table (
  joined_at timestamptz,
  completed_appointments integer,
  discount_percent numeric,
  next_discount_percent numeric,
  next_membership_months integer,
  next_completed_appointments integer
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    p.joined_at,
    count(a.id)::integer,
    case
      when p.joined_at <= now() - interval '12 months' and count(a.id) >= 10 then 15::numeric
      when p.joined_at <= now() - interval '6 months' and count(a.id) >= 5 then 10::numeric
      else 0::numeric
    end,
    case
      when p.joined_at <= now() - interval '12 months' and count(a.id) >= 10 then null::numeric
      when p.joined_at <= now() - interval '6 months' and count(a.id) >= 5 then 15::numeric
      else 10::numeric
    end,
    case
      when p.joined_at <= now() - interval '12 months' and count(a.id) >= 10 then null::integer
      when p.joined_at <= now() - interval '6 months' and count(a.id) >= 5 then 12
      else 6
    end,
    case
      when p.joined_at <= now() - interval '12 months' and count(a.id) >= 10 then null::integer
      when p.joined_at <= now() - interval '6 months' and count(a.id) >= 5 then 10
      else 5
    end
  from public.profiles p
  left join public.appointments a
    on a.user_id = p.id and a.status = 'completed'
  where p.id = auth.uid()
  group by p.id, p.joined_at;
$$;

revoke all on function public.get_my_loyalty_status() from public, anon;
grant execute on function public.get_my_loyalty_status() to authenticated;
