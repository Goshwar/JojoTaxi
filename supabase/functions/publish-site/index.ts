/**
 * Triggers a Netlify rebuild so the published site catches up with a price
 * change made in the admin dashboard.
 *
 * Why this exists as an Edge Function rather than a fetch from the browser:
 * the build hook URL is a capability. Anyone holding it can spend the site's
 * build minutes at will. Putting it in a `VITE_` variable would inline it into
 * the client bundle, where any visitor can read it. Here the URL is a
 * server-side secret and the caller has to prove they are a signed-in admin
 * before it is used.
 *
 * Deploy:  already deployed to the `Tours` project.
 * Secret:  set NETLIFY_BUILD_HOOK in Supabase → Edge Functions → Secrets to the
 *          hook created under Netlify → Site settings → Build & deploy →
 *          Build hooks. Until it is set this returns 503 and the dashboard
 *          says so plainly.
 */
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Use POST.' }, 405);

  const hook = Deno.env.get('NETLIFY_BUILD_HOOK');
  if (!hook) {
    return json(
      { error: 'Publishing is not configured yet — NETLIFY_BUILD_HOOK is not set on this project.' },
      503
    );
  }

  const authHeader = req.headers.get('Authorization') ?? '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return json({ error: 'Sign in to publish.' }, 401);

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('SUPABASE_PUBLISHABLE_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  );

  // The gateway's own JWT check is not enough on its own: the project's
  // anon key IS a valid JWT, so a request carrying nothing but the public key
  // would pass it. getUser() resolves to a real user only for a signed-in
  // session, which is the check that actually matters here.
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return json({ error: 'Sign in to publish.' }, 401);

  let response: Response;
  try {
    response = await fetch(hook, { method: 'POST' });
  } catch (error) {
    return json(
      { error: `Could not reach Netlify: ${error instanceof Error ? error.message : 'network error'}` },
      502
    );
  }

  if (!response.ok) {
    return json({ error: `Netlify refused the build request (${response.status}).` }, 502);
  }

  // Recorded only after Netlify accepted the build, so the dashboard never
  // shows the site as published when no build was actually started.
  const { error: stampError } = await supabase
    .from('pricing_settings')
    .update({ last_published_at: new Date().toISOString() })
    .eq('id', 1);

  return json({
    ok: true,
    publishedAt: new Date().toISOString(),
    warning: stampError
      ? `Build started, but the publish time could not be recorded: ${stampError.message}`
      : undefined,
  });
});
