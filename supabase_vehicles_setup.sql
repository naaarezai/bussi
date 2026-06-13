-- ==========================================
-- BUSSI KALUSTOHALLINTA - VEHICLES SETUP
-- ==========================================

-- 1. Luo vehicles taulu (autojen hallinta)
CREATE TABLE IF NOT EXISTS public.vehicles (
  id text primary key, -- esim "Auto 1"
  model text not null, -- esim "Scania Citywide"
  license_plate text, -- esim "ABC-123" (vapaaehtoinen)
  is_active boolean default true, -- piilotetaanko auto käytöstä
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Ota RLS (Row Level Security) käyttöön
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- 3. RLS SÄÄNNÖT
-- Kaikki sisäänkirjautuneet saavat lukea autot
CREATE POLICY "Kaikki näkevät autot" ON public.vehicles FOR SELECT USING (auth.uid() IS NOT NULL);

-- VAIN ADMIN saa lisätä autoja
CREATE POLICY "Vain admin lisää autoja" ON public.vehicles FOR INSERT WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- VAIN ADMIN saa muokata autoja (esim. asettaa is_active = false)
CREATE POLICY "Vain admin muokkaa autoja" ON public.vehicles FOR UPDATE USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- 4. Syötetään muutama oletusauto jotta lista ei ole tyhjä (esimerkiksi)
INSERT INTO public.vehicles (id, model, license_plate) VALUES
('Auto 1', 'Scania Citywide', 'ABC-123'),
('Auto 2', 'Volvo B8R', 'DEF-456'),
('Auto 3', 'VDL Citea', 'GHI-789')
ON CONFLICT (id) DO NOTHING;
