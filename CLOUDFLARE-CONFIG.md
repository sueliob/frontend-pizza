# 🚨 CONFIGURAÇÃO OBRIGATÓRIA - Cloudflare Pages

## ✅ Backend Migrado para Cloudflare Workers

O backend agora roda em **Cloudflare Workers** (não mais Netlify Functions). A URL da API mudou!

## 🚀 Configurações de Build (Cloudflare Pages)

Ao configurar o deploy no Cloudflare Pages, use estas configurações exatas:

### **Configuração de Compilações e Implantações**

```
Nome do projeto: frontend-pizza
Ramificação de produção: main

Configurações da build:
├── Predefinição da estrutura: Nenhum
├── Comando da build: npm run build
├── Diretório de saída da build: dist
└── Diretório raiz (avançado): (deixar vazio)
```

### **Variáveis de Ambiente (OBRIGATÓRIO!)**

Na seção "Variáveis de ambiente (avançado)", clique em **Adicionar variável** e configure:

```
Nome: VITE_API_BASE
Valor: https://backend-pizzaria.SEU_SUBDOMAIN.workers.dev/api
```

⚠️ **Substitua `SEU_SUBDOMAIN` pelo subdomain real do seu Worker Cloudflare!**

---

## 📝 Configurar Variável de Ambiente (Passo a Passo)

### 1. Acesse o Cloudflare Pages Dashboard
- Vá em: https://dash.cloudflare.com/
- Selecione: **Pages** → **frontend-pizzaria** (ou nome do seu projeto)

### 2. Configure a Variável de Ambiente
- Clique em: **Settings** → **Environment variables**
- Adicione a variável:

```
Nome: VITE_API_BASE
Valor: https://backend-pizzaria.SEU_SUBDOMAIN.workers.dev/api
Environment: Production (e Preview se necessário)
```

**⚠️ IMPORTANTE:** Substitua `SEU_SUBDOMAIN` pelo subdomain real do seu Worker!

### 3. Faça o Redeploy
- Vá em: **Deployments**
- Clique em: **Retry deployment** no último deploy
- Ou faça um novo commit para triggerar deploy automático

## 🔍 Como Verificar se Funcionou

Após o deploy, abra o Console do navegador (F12) e procure por:
```
🔧 API Configuration: {
  isLocalhost: false,
  API_BASE: "https://backend-pizzaria.SEU_SUBDOMAIN.workers.dev/api",
  environment: "production",
  envVarSet: true
}
```

Se `envVarSet: false`, a variável ainda não foi configurada corretamente.

## 🎯 URLs Corretas (Cloudflare Workers)

**✅ CORRETO (Nova Arquitetura):**
- Frontend: `https://frontend-pizzaria.pages.dev`
- Backend API: `https://backend-pizzaria.SEU_SUBDOMAIN.workers.dev/api`
- Custom domain (opcional): `https://api.seudominio.com/api`

**❌ INCORRETO (Arquitetura Antiga - Netlify):**
- ~~`https://backend-pizzaria.netlify.app/.netlify/functions/api`~~ (OBSOLETO)

## 🔐 Mudanças na Autenticação

O sistema de autenticação foi atualizado:

### **Antes (Netlify)**
- JWT simples armazenado no localStorage

### **Agora (Cloudflare Workers)**
- **Access Token**: JWT (15min) retornado no body da resposta
- **Refresh Token**: Cookie HttpOnly (7 dias) rotacionado a cada uso
- **CSRF Protection**: Cookie `csrf_token` + header `x-csrf` obrigatório
- **Sessions**: Gerenciadas no PostgreSQL com revogação

### **Implementação Necessária no Frontend**

```javascript
// 1. Login - Sempre enviar credentials: 'include'
const response = await fetch(`${API_BASE}/admin/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // ⚠️ OBRIGATÓRIO para cookies!
  body: JSON.stringify({ username, password })
});

const { access_token } = await response.json();
// Armazenar access_token em memória (estado React), NÃO no localStorage

// 2. Requests autenticados
await fetch(`${API_BASE}/admin/flavors`, {
  headers: { 
    'Authorization': `Bearer ${access_token}`,
    'Content-Type': 'application/json'
  },
  credentials: 'include' // ⚠️ OBRIGATÓRIO para enviar cookies
});

// 3. Refresh token (quando access_token expirar - 15min)
const csrfToken = getCookie('csrf_token'); // Ler cookie csrf_token
await fetch(`${API_BASE}/admin/refresh`, {
  method: 'POST',
  headers: { 'x-csrf': csrfToken }, // ⚠️ OBRIGATÓRIO
  credentials: 'include' // ⚠️ OBRIGATÓRIO
});

// 4. Logout - Revogar sessão no backend
const csrfToken = getCookie('csrf_token');
await fetch(`${API_BASE}/admin/logout`, {
  method: 'POST',
  headers: { 'x-csrf': csrfToken }, // ⚠️ OBRIGATÓRIO
  credentials: 'include' // ⚠️ OBRIGATÓRIO
});
```

### **Helper para Ler Cookies**
```javascript
function getCookie(name: string): string {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || '';
  return '';
}
```

## ⚠️ Erros Comuns

### **❌ Erro: 405 Method Not Allowed**
**Causa:** `VITE_API_BASE` não configurado, frontend tenta chamar API no próprio domínio
**Solução:** Configurar `VITE_API_BASE` conforme instruções acima

### **❌ Erro: 403 CSRF**
**Causa:** Frontend não está enviando header `x-csrf` nos endpoints `/refresh` e `/logout`
**Solução:** Adicionar header `x-csrf` com valor do cookie `csrf_token`

### **❌ Erro: 401 Unauthorized após 15min**
**Causa:** Access token expirou (comportamento normal)
**Solução:** Implementar refresh automático quando receber 401

### **❌ Erro: Cookies não são enviados**
**Causa:** `credentials: 'include'` não está nas requisições fetch
**Solução:** Adicionar `credentials: 'include'` em TODAS as requisições

## 🔄 Migração do Código Existente

Se você tem código antigo que usa localStorage para tokens:

### **Remover (Antigo)**
```javascript
// ❌ NÃO FAZER MAIS
localStorage.setItem('admin_token', token);
const token = localStorage.getItem('admin_token');
```

### **Adicionar (Novo)**
```javascript
// ✅ Access token em memória (estado React)
const [accessToken, setAccessToken] = useState<string | null>(null);

// ✅ Refresh token em cookie HttpOnly (gerenciado pelo backend)
// Você NÃO precisa armazenar refresh_token no frontend!

// ✅ Sempre enviar credentials: 'include'
fetch(url, {
  credentials: 'include',
  headers: { 'Authorization': `Bearer ${accessToken}` }
});
```

## 🧪 Testar a Configuração

```bash
# 1. Verificar API está acessível
curl https://backend-pizzaria.SEU_SUBDOMAIN.workers.dev/api/health

# 2. Testar login
curl -X POST https://backend-pizzaria.SEU_SUBDOMAIN.workers.dev/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"sua_senha"}' \
  -c cookies.txt -v

# 3. Verificar cookies retornados
# Deve ter: refresh_token (HttpOnly) e csrf_token

# 4. Testar refresh
curl -X POST https://backend-pizzaria.SEU_SUBDOMAIN.workers.dev/api/admin/refresh \
  -H "x-csrf: VALOR_DO_CSRF_TOKEN" \
  -b cookies.txt -v
```

## 📋 Checklist de Atualização

- [ ] ✅ `VITE_API_BASE` configurado no Cloudflare Pages
- [ ] ✅ URL aponta para `.workers.dev/api` (não `.netlify.app`)
- [ ] ✅ `credentials: 'include'` em TODAS as requisições fetch
- [ ] ✅ Access token armazenado em memória (não localStorage)
- [ ] ✅ Header `x-csrf` implementado para `/refresh` e `/logout`
- [ ] ✅ Helper `getCookie()` implementado
- [ ] ✅ Lógica de refresh automático ao receber 401
- [ ] ✅ Logout revoga sessão no backend
- [ ] ✅ Deploy refeito após configurar variáveis

---

**💡 Dica:** Use as DevTools (F12) → **Application** → **Cookies** para verificar se `refresh_token` e `csrf_token` estão sendo definidos após login!
