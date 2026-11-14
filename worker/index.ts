import { SHERLOCK_INTENTS } from "../src/lib/sherlockCorpus";

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  REACTIONS: {
    get(key: string): Promise<string | null>;
    put(key: string, value: string): Promise<void>;
  };
  AI: { run(model: string, input: unknown): Promise<unknown> };
}

const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "DENY",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' https://github.com https://avatars.githubusercontent.com data:",
    "connect-src 'self' https://api.github.com https://github-contributions-api.jogruber.de",
    "font-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; "),
};

function withSecurityHeaders(response: Response, path = ""): Response {
  const headers = new Headers(response.headers);
  if (response.ok && path.startsWith("/assets/")) headers.set("Cache-Control", "public, max-age=31536000, immutable");
  else if (response.ok && (path.startsWith("/images/") || path.startsWith("/emoji/"))) headers.set("Cache-Control", "public, max-age=86400");
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(key, value);
  }
  return new Response(response.body, { status: response.status, headers });
}

// Anonymous per-emoji click counters. No IP, no cookies, no per-user
// identity is ever stored - just an integer per emoji in KV. Names match
// the EmojiReaction component's DEFAULT_EMOJI_DATA keys.
const REACTION_EMOJI = [
  "smiling-face-with-hearts",
  "star-struck",
  "confused-face",
  "pleading-face",
  "grinning-face-with-smiling-eyes",
] as const;

async function getReactionCounts(env: Env): Promise<Record<string, number>> {
  const counts = await Promise.all(
    REACTION_EMOJI.map((emoji) => env.REACTIONS.get(`count:${emoji}`)),
  );
  return Object.fromEntries(
    REACTION_EMOJI.map((emoji, i) => [emoji, Number(counts[i]) || 0]),
  );
}

async function handleReactions(request: Request, env: Env): Promise<Response> {
  if (request.method === "GET") {
    return Response.json(await getReactionCounts(env));
  }
  if (request.method === "POST") {
    let emoji: unknown;
    try {
      ({ emoji } = await request.json());
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }
    if (
      typeof emoji !== "string" ||
      !REACTION_EMOJI.includes(emoji as (typeof REACTION_EMOJI)[number])
    ) {
      return new Response("Unknown emoji", { status: 400 });
    }
    // ponytail: read-then-write, not atomic - KV has no native increment.
    // Fine for a low-traffic reaction counter; upgrade to a Durable Object
    // if concurrent clicks ever need exact accuracy.
    const current = Number(await env.REACTIONS.get(`count:${emoji}`)) || 0;
    const next = current + 1;
    await env.REACTIONS.put(`count:${emoji}`, String(next));
    return Response.json(await getReactionCounts(env));
  }
  return new Response("Method not allowed", { status: 405 });
}

type RerankerResult = { id?: number; score?: number };
const sigmoid = (value: number) => 1 / (1 + Math.exp(-value));

// The model ranks reviewed prompts only. It never writes visitor-facing copy,
// and the question is neither logged nor stored by this Worker.
async function handleSherlock(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const origin = request.headers.get("Origin");
  if (origin && origin !== new URL(request.url).origin) return new Response("Forbidden", { status: 403 });
  let query: unknown;
  try { ({ query } = await request.json()); } catch { return new Response("Invalid JSON", { status: 400 }); }
  if (typeof query !== "string" || !query.trim() || query.length > 280) return new Response("Invalid question", { status: 400 });
  try {
    const ranked = await env.AI.run("@cf/baai/bge-reranker-base", {
      query: query.trim(),
      contexts: SHERLOCK_INTENTS.map((intent) => ({ text: intent.prompts.join(". ") })),
      top_k: 1,
    }) as { response?: RerankerResult[] };
    const best = ranked.response?.[0];
    const score = typeof best?.score === "number" ? (best.score > 1 ? sigmoid(best.score) : best.score) : 0;
    // A wrong confident reply is worse than an honest hand-off. Clear local
    // phrase matches are handled in the client; this stricter bar is solely
    // for genuinely close paraphrases.
    const intent = typeof best?.id === "number" && score >= 0.85 ? SHERLOCK_INTENTS[best.id] : undefined;
    return Response.json({ intent: intent?.id ?? "fallback" });
  } catch {
    // The client-side matcher and fallback remain usable if the binding has
    // not been enabled yet or the edge call is temporarily unavailable.
    return Response.json({ intent: "fallback", semantic: false });
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api/reactions") {
      return withSecurityHeaders(await handleReactions(request, env));
    }
    if (url.pathname === "/api/sherlock") {
      return withSecurityHeaders(await handleSherlock(request, env));
    }
    return withSecurityHeaders(await env.ASSETS.fetch(request), url.pathname);
  },
};
