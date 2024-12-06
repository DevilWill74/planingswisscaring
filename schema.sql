-- Enable les extensions nécessaires
create extension if not exists "uuid-ossp";

-- Création de la table users
create table if not exists users (
    id uuid default uuid_generate_v4() primary key,
    username text unique not null,
    password text not null,
    role text not null check (role in ('admin', 'nurse')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Création de la table planning
create table if not exists planning (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references users(id) on delete cascade,
    date date not null,
    status text not null check (status in ('work', 'rest', 'vacation', 'training', 'unavailable', 'undefined')),
    note text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, date)
);

-- Désactiver temporairement RLS pour permettre l'accès public
alter table users disable row level security;
alter table planning disable row level security;

-- Création de l'utilisateur admin par défaut
insert into users (username, password, role)
values ('admin', 'admin123', 'admin')
on conflict (username) do nothing;

-- S'assurer que la colonne note existe
do $$ 
begin
    if not exists (select 1 from information_schema.columns 
                  where table_name = 'planning' and column_name = 'note') then
        alter table planning add column note text;
    end if;
end $$;