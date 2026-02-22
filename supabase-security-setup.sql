-- 1. EXTENSIONS & SCHEMA SETUP
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'petshop', 'cliente');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Isolamento por Tenant e Roles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name text,
  email text,
  role user_role DEFAULT 'cliente',
  tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000000', -- ID da Loja para multi-tenant
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS no Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. PRODUCTS TABLE (Proteção de Escrita)
-- (Assumindo que a tabela já existe, vamos apenas reforçar o RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 5. ORDERS TABLE (Isolamento de Dados Sensíveis)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 6. POLICIES: PROFILES
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 7. POLICIES: PRODUCTS
CREATE POLICY "Products are viewable by everyone" ON public.products
  FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Only admins can modify products" ON public.products
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 8. POLICIES: ORDERS (Isolamento Crítico)
CREATE POLICY "Clients can view their own orders" ON public.orders
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Petshops/Admins can view all shop orders" ON public.orders
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'petshop'))
  );

CREATE POLICY "Clients can create their own orders" ON public.orders
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Restrição: CLIENTES NÃO PODEM ATUALIZAR STATUS OU PREÇO
CREATE POLICY "Only admins can update order status" ON public.orders
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'petshop'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'petshop'))
  );

-- 9. FUNCTIONS & TRIGGERS
-- Auto-cria profile no cadastro do Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (new.id, new.raw_user_meta_data->>'name', new.email, 'cliente');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 10. VALIDAÇÃO SERVER-SIDE (Database Level)
-- Garantir que o total não seja negativo
ALTER TABLE public.orders ADD CONSTRAINT check_total_positive CHECK (total >= 0);
