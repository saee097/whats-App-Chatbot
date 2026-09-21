-- Aether Support / Harbor & Co — Supabase production schema
-- Enable extensions
create extension if not exists vector;
create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  phone text,
  role text not null check (role in ('admin','agent','customer')),
  status text not null default 'active',
  password_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  customer_id text not null,
  customer_name text not null,
  customer_email text,
  customer_phone text,
  channel text not null check (channel in ('website','whatsapp')),
  status text not null default 'open',
  assigned_agent_id uuid references users(id),
  last_message text,
  last_message_at timestamptz not null default now(),
  unread_count int not null default 0,
  bot_paused boolean not null default false,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender text not null check (sender in ('customer','bot','agent','system')),
  sender_name text not null,
  body text not null,
  message_type text not null default 'text',
  whatsapp_message_id text,
  status text not null default 'sent',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists knowledge (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  category text not null default 'General',
  embedding vector(1536),
  status text not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric not null,
  stock int not null default 0,
  images text[] default '{}',
  sku text unique,
  category text,
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id text primary key,
  customer_id text not null,
  customer_name text not null,
  items jsonb not null,
  total_amount numeric not null,
  status text not null,
  delivery_address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table conversations enable row level security;
alter table messages enable row level security;
alter table knowledge enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table users enable row level security;

-- Staff can read/write via service role in API routes.
-- Authenticated agents:
create policy "staff read conversations" on conversations
  for select to authenticated using (true);
create policy "staff write conversations" on conversations
  for all to authenticated using (true) with check (true);

create index if not exists knowledge_embedding_idx
  on knowledge using ivfflat (embedding vector_cosine_ops) with (lists = 20);
