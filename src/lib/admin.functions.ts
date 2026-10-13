import { createServerFn } from '@tanstack/react-start';

export const checkAdminPassword = createServerFn({ method: 'POST' })
  .inputValidator((d: { password: string }) => ({ password: String(d?.password ?? '').slice(0, 200) }))
  .handler(async ({ data }) => {
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected) return { ok: false };
    const enc = new TextEncoder();
    const [a, b] = await Promise.all([crypto.subtle.digest('SHA-256', enc.encode(data.password)), crypto.subtle.digest('SHA-256', enc.encode(expected))]);
    const x = new Uint8Array(a), y = new Uint8Array(b);
    let diff = 0; for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
    return { ok: diff === 0 };
  });
