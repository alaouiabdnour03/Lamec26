-- Run this in your Supabase SQL Editor

-- 1. Create the clients table
CREATE TABLE IF NOT EXISTS public.clients (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name text NOT NULL,
  ice text NOT NULL UNIQUE,
  access_code text NOT NULL,
  cnss_employees text,
  email text,
  phone text,
  ca text,
  sector text,
  activity text,
  custom_activity text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create the diagnostics table
CREATE TABLE IF NOT EXISTS public.diagnostics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  current_step integer NOT NULL DEFAULT 1,
  data jsonb DEFAULT '{}'::jsonb,
  report_url text,
  report_filename text,
  report_size_kb numeric,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable Row Level Security (RLS) on public tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostics ENABLE ROW LEVEL SECURITY;

-- 4. Create policies for anonymous access to public tables
DROP POLICY IF EXISTS "Allow anon select on clients" ON public.clients;
CREATE POLICY "Allow anon select on clients" ON public.clients FOR SELECT TO anon USING (true);
DROP POLICY IF EXISTS "Allow anon insert on clients" ON public.clients;
CREATE POLICY "Allow anon insert on clients" ON public.clients FOR INSERT TO anon WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon update on clients" ON public.clients;
CREATE POLICY "Allow anon update on clients" ON public.clients FOR UPDATE TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon select on diagnostics" ON public.diagnostics;
CREATE POLICY "Allow anon select on diagnostics" ON public.diagnostics FOR SELECT TO anon USING (true);
DROP POLICY IF EXISTS "Allow anon insert on diagnostics" ON public.diagnostics;
CREATE POLICY "Allow anon insert on diagnostics" ON public.diagnostics FOR INSERT TO anon WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon update on diagnostics" ON public.diagnostics;
CREATE POLICY "Allow anon update on diagnostics" ON public.diagnostics FOR UPDATE TO anon USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon delete on diagnostics" ON public.diagnostics;
CREATE POLICY "Allow anon delete on diagnostics" ON public.diagnostics FOR DELETE TO anon USING (true);

-- 5. Storage: For the reports bucket, it is highly recommended to use the Supabase Dashboard.
-- Go to "Storage" in the Supabase Dashboard, create a new bucket named "reports", and make it Public.
-- Then go to "Storage > Policies" and create a policy to allow ALL operations for anon users on the "reports" bucket.
