ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS age smallint;
CREATE OR REPLACE FUNCTION public.validate_profile_age() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.age IS NOT NULL AND (NEW.age < 10 OR NEW.age > 120) THEN RAISE EXCEPTION 'Edad no válida'; END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS validate_profile_age ON public.profiles;
CREATE TRIGGER validate_profile_age BEFORE INSERT OR UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.validate_profile_age();
GRANT DELETE ON public.player_progress TO authenticated;
CREATE POLICY "Players delete own progress" ON public.player_progress FOR DELETE TO authenticated USING (auth.uid() = user_id);