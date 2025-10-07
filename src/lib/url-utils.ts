/**
 * Utilitários para detecção automática de URL base
 */

/**
 * Detecta a URL base do projeto automaticamente
 * Funciona tanto em desenvolvimento quanto em produção
 * Remove códigos de preview do Cloudflare automaticamente
 */
export function getBaseUrl(): string {
  // Em desenvolvimento, usar localhost
  if (import.meta.env.DEV) {
    return window.location.origin;
  }
  
  // Em produção, tentar variável de ambiente primeiro
  if (import.meta.env.VITE_BASE_URL) {
    return import.meta.env.VITE_BASE_URL;
  }
  
  // Fallback: usar a URL atual, mas limpar códigos de preview
  let cleanUrl = window.location.origin;
  
  // Limpar códigos de preview/branch do Cloudflare
  // Exemplo: https://abc123--frontend-pizzaria.pages.dev → https://frontend-pizzaria.pages.dev
  if (cleanUrl.includes('--') && cleanUrl.includes('.pages.dev')) {
    const parts = cleanUrl.split('--');
    if (parts.length > 1) {
      // Reconstruir: https:// + domain depois de --
      cleanUrl = parts[0].split('://')[0] + '://' + parts.slice(1).join('--');
      console.log('🧹 Frontend URL limpa:', cleanUrl);
    }
  }
  
  return cleanUrl;
}

/**
 * Gera URL do encurtador automaticamente
 */
export function getShortenApiUrl(): string {
  return `${getBaseUrl()}/api/shorten`;
}