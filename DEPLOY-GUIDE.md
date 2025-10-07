# 🚀 Deploy no Cloudflare Pages

## Passo a Passo

### 1. Configurar Repositório
```bash
# Fazer commit do código
git add .
git commit -m "Frontend separado para Cloudflare Pages"
git push origin main
```

### 2. Cloudflare Pages
1. Acesse https://dash.cloudflare.com/
2. Vá em **Pages** > **Create a project**
3. Conecte seu repositório GitHub
4. Configure:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (raiz)

### 3. Variáveis de Ambiente
Adicione no Cloudflare Pages:
```
VITE_API_URL=https://seu-backend.netlify.app/.netlify/functions/api
```

### 4. Deploy Automático
- Cada push no `main` = deploy automático
- Preview para outras branches

## ✅ Pronto!
Seu frontend estará disponível em: `https://seu-projeto.pages.dev`