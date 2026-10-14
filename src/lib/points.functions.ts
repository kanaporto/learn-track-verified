import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

/** Max plausible points: guards against absurd client-supplied values. */
const MAX_POINTS = 1_000_000;

/**
 * Syncs the signed-in explorer's points to their profile.
 * The points column is not writable by authenticated users directly;
 * only this server function (service role) may update it.
 */
export const syncMyPoints = createServerFn({ method: 'POST' })
  .inputValidator((input: { points: number }) => {
    const points = Number(input?.points);
    if (!Number.isInteger(points) || points < 0 || points > MAX_POINTS) {
      throw new Error('Invalid points value');
    }
    return { points };
  })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    const { userId } = context;
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ points: data.points, updated_at: new Date().toISOString() })
      .eq('id', userId);
    if (error) throw new Error('No se pudieron guardar los puntos');
    return { ok: true };
  });
