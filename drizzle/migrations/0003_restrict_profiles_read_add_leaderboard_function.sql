DROP POLICY "Players can see leaderboard names and points" ON public.profiles;
CREATE POLICY "Players read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.get_leaderboard()
RETURNS TABLE (id uuid, display_name text, points integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.display_name, p.points
  FROM public.profiles p
  ORDER BY p.points DESC
  LIMIT 50;
$$;

REVOKE ALL ON FUNCTION public.get_leaderboard() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_leaderboard() TO authenticated;