// Cloudflare Pages Function - Link Shortener  
// URL: {auto-detected}/s/[code]

export async function onRequest(context: any) {
  const { params, env } = context;
  const shortCode = params.code;
  
  // Buscar URL original no KV
  const longUrl = await env.SHORT_LINKS.get(shortCode);
  
  if (!longUrl) {
    return new Response('Link não encontrado ou expirado', { 
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
  
  // Redirecionar para URL original
  return Response.redirect(longUrl, 302);
}