-- 1. EXTENSIONS & SCHEMA SETUP
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'petshop', 'cliente');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. TABLES SETUP

-- PROFILES (Isolamento por Tenant e Roles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name text,
  email text,
  phone text,
  address jsonb DEFAULT '{}'::jsonb,
  role user_role DEFAULT 'cliente',
  tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000000',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name text NOT NULL,
    icon text,
    created_at timestamp with time zone DEFAULT now()
);

-- SERVICES
CREATE TABLE IF NOT EXISTS public.services (
    id SERIAL PRIMARY KEY,
    name text NOT NULL,
    description text,
    price decimal(10,2) NOT NULL,
    duration text NOT NULL,
    icon text,
    popular boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

-- APPOINTMENTS
CREATE TABLE IF NOT EXISTS public.appointments (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id uuid REFERENCES public.profiles(id),
    customer_name text,
    customer_phone text,
    pet_name text,
    pet_type text,
    service_id integer REFERENCES public.services(id),
    service_name text,
    date text NOT NULL, -- Stored as string for matching local state for now
    time text NOT NULL,
    total decimal(10,2) NOT NULL,
    status text DEFAULT 'pending',
    created_at timestamp with time zone DEFAULT now()
);

-- BUSINESS HOURS
CREATE TABLE IF NOT EXISTS public.business_hours (
    dayOfWeek integer PRIMARY KEY, -- 0-6 (Sun-Sat)
    isOpen boolean DEFAULT true,
    openTime text DEFAULT '08:00',
    closeTime text DEFAULT '18:00',
    slotDuration integer DEFAULT 90
);

-- PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  price decimal(10,2) NOT NULL,
  category_id uuid REFERENCES public.categories(id),
  animal text,
  description text,
  image text,
  rating decimal(3,2) DEFAULT 5.0,
  review_count integer DEFAULT 0,
  badge text,
  in_stock boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id),
  items jsonb NOT NULL,
  total decimal(10,2) NOT NULL,
  status text DEFAULT 'pendente',
  payment_method text,
  shipping_address jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- 4. ROW LEVEL SECURITY (RLS)

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 5. POLICIES: PROFILES (Anti-Recursion Fix)
-- Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Admins can view all profiles (Using metadata to avoid recursion)
CREATE POLICY "Admins can view all" ON public.profiles FOR SELECT USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- 6. POLICIES: CATEGORIES & SERVICES
CREATE POLICY "Read access for everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admin full access categories" ON public.categories FOR ALL USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

CREATE POLICY "Read access for everyone services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Admin full access services" ON public.services FOR ALL USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- 7. POLICIES: APPOINTMENTS
CREATE POLICY "Users view own appointments" ON public.appointments FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Users create own appointments" ON public.appointments FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Admins view all appointments" ON public.appointments FOR SELECT USING ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'petshop'));
CREATE POLICY "Admins update all appointments" ON public.appointments FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'petshop'));

-- 8. POLICIES: BUSINESS HOURS
CREATE POLICY "Read business hours" ON public.business_hours FOR SELECT USING (true);
CREATE POLICY "Admin update business hours" ON public.business_hours FOR ALL USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- 9. POLICIES: PRODUCTS
CREATE POLICY "Read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admin full access products" ON public.products FOR ALL USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- 10. POLICIES: ORDERS
CREATE POLICY "Users view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all orders" ON public.orders FOR SELECT USING ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'petshop'));
CREATE POLICY "Admins update orders" ON public.orders FOR UPDATE USING ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'petshop'));

-- 11. FUNCTIONS & TRIGGERS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (new.id, new.raw_user_meta_data->>'name', new.email, 'cliente');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Clear old trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Constraint
ALTER TABLE public.orders ADD CONSTRAINT check_total_positive CHECK (total >= 0);
