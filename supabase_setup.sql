-- ==========================================
-- BUSSI KALUSTOHALLINTA - DATABASE SETUP
-- Kopsaa tämä koko koodi Supabasen SQL Editoriin ja paina "Run".
-- Tämä koodi luo profiilit, huoltohistorian ja turvallisuussäännöt (RLS).
-- ==========================================

-- 1. Luo profiles taulu (roolien hallinta)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  role text not null check (role in ('admin', 'mechanic', 'driver')) default 'driver',
  full_name text
);

-- 2. Automaattinen profiilin luonti kun uusi käyttäjä rekisteröityy
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', COALESCE(new.raw_user_meta_data->>'role', 'driver'));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Luo maintenance_logs taulu (Huoltohistoria)
CREATE TABLE IF NOT EXISTS public.maintenance_logs (
  id uuid default uuid_generate_v4() primary key,
  vehicle text not null,
  description text not null,
  mechanic_id uuid references public.profiles(id) on delete set null,
  date timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Ota RLS (Row Level Security) käyttöön
ALTER TABLE public.defects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_logs ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- RLS SÄÄNNÖT: DEFECTS
-- ==========================================
-- Kaikki sisäänkirjautuneet saavat lukea vikoja
CREATE POLICY "Kaikki näkevät viat" ON public.defects FOR SELECT USING (auth.uid() IS NOT NULL);

-- Kaikki sisäänkirjautuneet saavat lisätä vikoja
CREATE POLICY "Kaikki saavat lisätä vikoja" ON public.defects FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Kaikki sisäänkirjautuneet saavat päivittää (muokata) vikoja
CREATE POLICY "Kaikki saavat muokata vikoja" ON public.defects FOR UPDATE USING (auth.uid() IS NOT NULL);

-- VAIN ADMIN SAA POISTAA VIKOJA
CREATE POLICY "Vain admin saa poistaa" ON public.defects FOR DELETE USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- ==========================================
-- RLS SÄÄNNÖT: MAINTENANCE_LOGS
-- ==========================================
-- Kaikki saavat lukea huoltoja
CREATE POLICY "Kaikki näkevät huollot" ON public.maintenance_logs FOR SELECT USING (auth.uid() IS NOT NULL);

-- Korjaamo ja admin saavat lisätä huoltoja
CREATE POLICY "Korjaamo ja admin lisää" ON public.maintenance_logs FOR INSERT WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'mechanic')
);

-- Vain admin saa poistaa huoltoja
CREATE POLICY "Admin poistaa huollot" ON public.maintenance_logs FOR DELETE USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- ==========================================
-- RLS SÄÄNNÖT: PROFILES
-- ==========================================
-- Kaikki näkevät toistensa profiilit
CREATE POLICY "Kaikki näkevät profiilit" ON public.profiles FOR SELECT USING (auth.uid() IS NOT NULL);

-- Admin saa päivittää profiileja (esim vaihtaa rooleja)
CREATE POLICY "Admin muokkaa profiileja" ON public.profiles FOR UPDATE USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);
