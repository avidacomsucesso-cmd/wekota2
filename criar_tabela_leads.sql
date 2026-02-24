-- Copie e cole este código no "SQL Editor" do seu painel Supabase para criar a tabela necessária.

create table leads (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text,
  email text,
  whatsapp text,
  country text,
  plan text,
  status text default 'new'
);

-- Habilitar RLS (Row Level Security) é opcional mas recomendado para produção
-- alter table leads enable row level security;
-- create policy "Enable insert for everyone" on leads for insert with check (true);
