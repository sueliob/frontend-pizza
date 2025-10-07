# 🚨 CONFIGURAÇÃO OBRIGATÓRIA - Cloudflare Pages

## ❌ ERRO: POST /api/admin/login 405 (Method Not Allowed)

**Motivo:** A variável `VITE_API_BASE` não está configurada no Cloudflare Pages, então o frontend está tentando chamar a API no próprio domínio ao invés do backend no Netlify.

## ✅ SOLUÇÃO: Configurar Variável de Ambiente

### 1. Acesse o Cloudflare Pages Dashboard
- Vá em: https://dash.cloudflare.com/
- Selecione: **Pages** → **frontend-pizzaria**

### 2. Configure a Variável de Ambiente
- Clique em: **Settings** → **Environment variables**
- Adicione a variável:

```
Nome: VITE_API_BASE
Valor: https://backend-pizzaria.netlify.app/.netlify/functions/api
Environment: Production (e Preview se necessário)
```

### 3. Faça o Redeploy
- Vá em: **Deployments**
- Clique em: **Retry deployment** no último deploy
- Ou faça um novo commit para triggerar deploy automático

## 🔍 Como Verificar se Funcionou

Após o deploy, abra o Console do navegador (F12) e procure por:
```
🔧 API Configuration: {
  isLocalhost: false,
  API_BASE: "https://backend-pizzaria.netlify.app/.netlify/functions/api",
  environment: "production",
  envVarSet: true
}
```

Se `envVarSet: false`, a variável ainda não foi configurada corretamente.

## 🎯 URLs Corretas

**✅ CORRETO:**
- Frontend: `https://frontend-pizzaria.pages.dev`
- Backend API: `https://backend-pizzaria.netlify.app/.netlify/functions/api`

**❌ INCORRETO (erro atual):**
- Frontend tentando chamar API: `https://frontend-pizzaria.pages.dev/api/admin/login`

---

**💡 Dica:** Sempre que adicionar variáveis `VITE_*` no `.env`, lembre de configurá-las também no Cloudflare Pages!