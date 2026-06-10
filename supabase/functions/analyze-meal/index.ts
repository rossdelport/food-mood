// analyze-meal — estimate macros + calories from a meal photo using Claude vision.
// Deno edge function (raw fetch; no Deno Anthropic SDK). Returns structured JSON
// via tool use. Guards: image-size cap + per-user rate limit.
import { createClient } from 'npm:@supabase/supabase-js@2';

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-haiku-4-5';

const MAX_BASE64 = 2_000_000; // ~1.5MB image
const RATE_LIMIT = 15; // analyses per user per window
const WINDOW_MS = 60_000;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

const MACRO_TOOL = {
  name: 'log_macros',
  description: 'Record the estimated macronutrients and calories for the meal in the photo.',
  input_schema: {
    type: 'object',
    properties: {
      title: { type: 'string', description: "Short 2-4 word name for the meal, e.g. 'Oat bowl with berries'." },
      protein: { type: 'integer', description: 'Estimated grams of protein for the portion shown.' },
      carbs: { type: 'integer', description: 'Estimated grams of carbohydrates.' },
      fat: { type: 'integer', description: 'Estimated grams of fat.' },
      calories: { type: 'integer', description: 'Estimated total calories.' },
      confidence: { type: 'string', enum: ['high', 'medium', 'low'], description: 'Confidence in the estimate.' },
    },
    required: ['title', 'protein', 'carbs', 'fat', 'calories'],
    additionalProperties: false,
  },
};

const SYSTEM = `You are a nutrition estimation assistant for a food-tracking app.
Given a photo of a meal, estimate the macronutrients (protein, carbs, fat) in grams
and total calories for the portion actually shown. Be realistic about portion size.
Always respond by calling the log_macros tool. If the image is clearly not food,
return zeros for all macros and a title of "Not a meal".`;

// Decode the user id from the (already JWT-verified) bearer token.
function userIdFromAuth(req: Request): string | null {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  try {
    const part = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(part));
    return payload.sub ?? null;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) return json({ error: 'ANTHROPIC_API_KEY is not configured' }, 500);

  const uid = userIdFromAuth(req);
  if (!uid) return json({ error: 'Unauthorized' }, 401);

  let imageBase64: string | undefined;
  let mimeType = 'image/jpeg';
  try {
    const body = await req.json();
    imageBase64 = body.imageBase64;
    if (body.mimeType) mimeType = body.mimeType;
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }
  if (!imageBase64) return json({ error: 'Missing imageBase64' }, 400);
  if (imageBase64.length > MAX_BASE64) return json({ error: 'Image too large' }, 413);

  // Per-user rate limit (service role bypasses RLS on analyze_log).
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  try {
    const since = new Date(Date.now() - WINDOW_MS).toISOString();
    const { count } = await admin
      .from('analyze_log')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', uid)
      .gte('created_at', since);
    if ((count ?? 0) >= RATE_LIMIT) return json({ error: 'Slow down a moment and try again.' }, 429);
    await admin.from('analyze_log').insert({ user_id: uid });
  } catch {
    // if the limiter errors, fail open rather than block legitimate use
  }

  const anthropicReq = {
    model: MODEL,
    max_tokens: 1024,
    system: SYSTEM,
    tools: [MACRO_TOOL],
    tool_choice: { type: 'tool', name: 'log_macros' },
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mimeType, data: imageBase64 } },
          { type: 'text', text: 'Estimate the macros and calories for this meal.' },
        ],
      },
    ],
  };

  let res: Response;
  try {
    res = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify(anthropicReq),
    });
  } catch (e) {
    return json({ error: `Failed to reach Claude API: ${e}` }, 502);
  }

  if (!res.ok) {
    const text = await res.text();
    return json({ error: `Claude API error ${res.status}`, detail: text }, 502);
  }

  const data = await res.json();
  const toolBlock = Array.isArray(data.content)
    ? data.content.find((b: { type: string; name?: string }) => b.type === 'tool_use' && b.name === 'log_macros')
    : undefined;
  if (!toolBlock?.input) return json({ error: 'Model did not return macros', raw: data }, 502);

  const m = toolBlock.input;
  return json({
    title: String(m.title ?? 'Logged meal'),
    protein: Math.max(0, Math.round(Number(m.protein) || 0)),
    carbs: Math.max(0, Math.round(Number(m.carbs) || 0)),
    fat: Math.max(0, Math.round(Number(m.fat) || 0)),
    calories: Math.max(0, Math.round(Number(m.calories) || 0)),
    confidence: m.confidence ?? 'medium',
  });
});
