REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (display_name, age, updated_at) ON public.profiles TO authenticated;
COMMENT ON COLUMN public.profiles.points IS 'Server-managed: updated only via the syncMyPoints server function (service role). Authenticated users cannot write this column directly.';