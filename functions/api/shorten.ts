// Cloudflare Pages Function - Create Short Link
// URL: {auto-detected}/api/shorten

export async function onRequestPost(context: any) {
  const { request, env } = context;
  
  try {
    const { longUrl } = await request.json();
    
    if (!longUrl || !longUrl.startsWith('https://res.cloudinary.com/')) {
      return Response.json({ 
        error: 'URL inválida' 
      }, { status: 400 });
    }
    
    // Gerar código curto único
    const shortCode = Math.random().toString(36).substr(2, 8);
    
    // Salvar no KV com expiração de 24 horas (86400 segundos)
    await env.SHORT_LINKS.put(shortCode, longUrl, { 
      expirationTtl: 86400 
    });
    
    // Detectar e limpar URL automaticamente
    const requestOrigin = new URL(request.url).origin;
    
    console.log('🔍 URL original:', requestOrigin);
    
    // Limpar códigos de preview/branch do Cloudflare
    // Exemplo: https://abc123--frontend-pizzaria.pages.dev → https://frontend-pizzaria.pages.dev
    let cleanUrl = requestOrigin;
    
    if (cleanUrl.includes('--') && cleanUrl.includes('.pages.dev')) {
      // Remover o código antes de --
      const parts = cleanUrl.split('--');
      if (parts.length > 1) {
        // Reconstruir: https:// + domain depois de --
        cleanUrl = parts[0].split('://')[0] + '://' + parts.slice(1).join('--');
        console.log('🧹 URL limpa:', cleanUrl);
      }
    }
    
    const shortUrl = `${cleanUrl}/s/${shortCode}`;
    
    console.log('🔗 URL final gerada:', shortUrl);
    
    return Response.json({ 
      success: true,
      shortUrl,
      longUrl,
      expiresIn: '24 horas'
    });
    
  } catch (error) {
    return Response.json({ 
      error: 'Erro interno' 
    }, { status: 500 });
  }
}