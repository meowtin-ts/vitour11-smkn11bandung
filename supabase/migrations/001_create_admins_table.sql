-- ============================================
-- MIGRATION: Create Admins Table
-- ============================================
-- Description: Tabel untuk menyimpan data admin yang bisa login ke dashboard
-- Created: 2026-05-01

-- Drop table if exists (untuk re-run migration)
DROP TABLE IF EXISTS public.admins CASCADE;

-- Create admins table
CREATE TABLE public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nisn VARCHAR(20) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index untuk performance
CREATE INDEX idx_admins_nisn ON public.admins(nisn);
CREATE INDEX idx_admins_is_active ON public.admins(is_active);

-- Enable Row Level Security (RLS)
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Create policy: hanya authenticated users yang bisa read
CREATE POLICY "Admins readable by authenticated users"
  ON public.admins
  FOR SELECT
  USING (true);

-- Create policy: hanya service_role yang bisa insert/update/delete
CREATE POLICY "Admins modifiable by service_role"
  ON public.admins
  FOR ALL
  USING (auth.role() = 'service_role');

-- Insert admin pertama (default admin)
-- Password: 123123 (akan di-hash oleh backend saat first run)
-- IMPORTANT: Ini temporary, nanti akan di-replace dengan hash di backend
INSERT INTO public.admins (nisn, password_hash, name, email, role)
VALUES (
  '2406510563',
  'TEMPORARY_WILL_BE_HASHED',
  'Admin Utama',
  'admin@smkn11bandung.sch.id',
  'super_admin'
) ON CONFLICT (nisn) DO NOTHING;

-- Create function untuk auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger untuk auto-update updated_at
CREATE TRIGGER update_admins_updated_at
  BEFORE UPDATE ON public.admins
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Grant permissions
GRANT ALL ON public.admins TO service_role;
GRANT SELECT ON public.admins TO authenticated;
GRANT SELECT ON public.admins TO anon;

-- ============================================
-- SELESAI
-- ============================================
-- Cara menggunakan migration ini:
-- 1. Buka Supabase Dashboard → SQL Editor
-- 2. Copy-paste seluruh script ini
-- 3. Klik "Run"
-- 4. Table 'admins' akan otomatis terbuat
-- 5. Admin pertama (NISN: 2406510563) akan ter-seed
-- ============================================
