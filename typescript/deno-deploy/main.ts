import { serve } from 'https://deno.land/std@0.161.0/http/server.ts';
import { router } from 'https://deno.land/x/rutt@0.0.13/mod.ts';

// dist.ts: INJECT BETWEEN
import { routes } from './routes.ts';
// dist.ts: INJECT BETWEEN

serve(router(routes));
