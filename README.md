# 🍕 Pizzaria Frontend

Frontend React completo para aplicação de pizzaria com painel administrativo, captura de imagem de pedidos e integração avançada com WhatsApp. Deploy via **Cloudflare Pages**.

## ✨ Principais Funcionalidades

### 🛍️ **Sistema de Pedidos Avançado**
- **Menu 100% dinâmico**: Todos os dados vêm do banco PostgreSQL
- **Categorização inteligente**: Sabores, extras e massas por categoria
- **Carrinho otimizado**: Preços dinâmicos com lógica de maior preço
- **Entrega inteligente**: Cache CEP + Google Maps + fallback
- **Customização completa**: Escolha de massas, extras e quantidades
- **Validação robusta**: ViaCEP + coordenadas automáticas
- **Loading states profissionais**: Zero flash de conteúdo hardcoded
- **UX otimizada**: Skeletons animados durante carregamento

### 📱 **Integração WhatsApp Avançada**
- Formatação profissional de mensagens
- Captura automática de screenshot do pedido
- Upload seguro para Cloudinary com limpeza automática (24h)
- **Encurtamento de URLs** usando Cloudflare Functions
- Links limpos: `frontend-pizzaria.pages.dev/s/abc123`

### 👨‍💼 **Painel Admin de Produção**
- **Sistema de usuários**: Multi-role com controle de acesso
- **Bulk Import**: Importação em massa via CSV/JSON
- **CRUD completo**: Sabores, extras, tipos de massa
- **Configurações centralizadas**: Horários, contato, delivery
- **Dashboard analytics**: Estatísticas em tempo real
- **Gerenciamento de dados**: Zero hardcoded, tudo no banco

### 🖼️ **Sistema de Captura de Imagem**
- Screenshot automático do resumo do pedido
- Upload direto para Cloudinary
- Compressão e otimização automática
- Fallbacks inteligentes para diferentes navegadores

## 🚀 Deploy no Cloudflare Pages

### 1. Configuração do KV para Encurtamento de URLs
```bash
# Criar KV namespace no Cloudflare Dashboard
Nome: SHORT_LINKS

# Configurar no Pages
Workers & Pages → Seu projeto → Settings → Functions
KV namespace bindings:
- Variable name: SHORT_LINKS
- KV namespace: SHORT_LINKS
```

### 2. Variáveis de Ambiente
Configure no **Cloudflare Pages** (Settings → Environment variables):

```env
# API Backend (OBRIGATÓRIO!)
VITE_API_BASE=https://backend-pizza.SEU_SUBDOMAIN.workers.dev/api

# Google Maps (opcional)
VITE_GOOGLE_MAPS_API_KEY=sua_chave_google_maps

# Cloudinary (obrigatório)
VITE_CLOUDINARY_CLOUD_NAME=seu_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=seu_preset
```

**⚠️ IMPORTANTE:** 
- Se não configurar `VITE_API_BASE`, você receberá erro 405 ao tentar fazer login no admin!
- O backend agora usa **Cloudflare Workers** (não mais Netlify Functions)
- URL da API mudou de `.netlify.app/.netlify/functions/api` para `.workers.dev/api`

### 3. Deploy Automático
1. Conecte repositório ao Cloudflare Pages
2. Configure build command: `npm run build`
3. Diretório output: `dist`
4. Deploy automático no `git push`

## 🛠️ Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Configurar ambiente
cp .env.example .env
# Editar .env com suas configurações

# Executar desenvolvimento
npm run dev
```

## 📂 Estrutura do Projeto

```
src/
├── components/         # Componentes reutilizáveis
│   ├── ui/                   # Componentes shadcn/ui
│   ├── header.tsx            # Header com loading state
│   └── ...
├── pages/             # Páginas principais
│   ├── admin-complete.tsx    # Painel admin com bulk import
│   ├── home.tsx              # Home com skeleton loaders
│   ├── order-review.tsx      # Revisão e captura de pedido
│   └── ...
├── lib/               # Serviços e utilitários
│   ├── api-config.ts         # Configuração de APIs
│   ├── whatsapp-service.ts   # Integração WhatsApp
│   ├── cep-service.ts        # Cache CEP inteligente
│   └── queryClient.ts        # TanStack Query configurado
├── utils/             # Funções auxiliares
│   └── gerarPedidoImagem.ts  # Captura de screenshot
└── hooks/             # Hooks customizados

functions/             # Cloudflare Functions
├── api/
│   └── shorten.ts     # API encurtamento
└── s/
    └── [code].ts      # Redirecionamento
```

## 🔧 Cloudflare Functions

### Encurtamento de URLs
- **POST** `/api/shorten` → Criar link curto
- **GET** `/s/{código}` → Redirecionar para URL original
- **Expiração**: 24 horas (sincronizado com imagens)

### **🔥 Integração com Bulk Import**
- Interface admin para importação em massa
- Upload de arquivos CSV/JSON
- Validação em tempo real
- Preview antes da importação
- Logs detalhados de sucesso/erro

### Exemplo de Uso
```javascript
// Criar link curto
const response = await fetch('/api/shorten', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    longUrl: 'https://res.cloudinary.com/...' 
  })
});

const { shortUrl } = await response.json();
// shortUrl: "https://frontend-pizzaria.pages.dev/s/abc123"
```

## 🏗️ Tecnologias

### **Core**
- **React 18** + TypeScript
- **Vite** (build tool ultrarrápido)
- **Tailwind CSS** + **shadcn/ui** (design system)

### **Estado e Roteamento**
- **TanStack Query** (gerenciamento de estado servidor)
- **Wouter** (roteamento client-side)
- **Context API** (estado local)
- **Loading States** (skeleton loaders profissionais)
- **TypeScript Interfaces** (type safety completa)

### **Integração de Serviços**
- **Google Maps API** (cálculo de entrega)  
- **Cloudinary** (hospedagem de imagens)
- **ViaCEP** (validação de endereços)
- **WhatsApp Business API** (envio de pedidos)

### **Cloudflare**
- **Pages** (hospedagem + CI/CD)
- **Functions** (encurtamento serverless)
- **KV Storage** (cache de links)

## 📋 Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento local
npm run build        # Build para produção
npm run preview      # Preview do build local
npm run lint         # Verificar código
npm run type-check   # Verificar TypeScript
```

## 🔐 Autenticação Admin

O painel administrativo usa autenticação JWT + Refresh Tokens:

### **Fluxo de Autenticação**
1. **Login**: Credenciais → Retorna `access_token` (15min) + cookies HttpOnly
2. **Access Token**: Armazenado em memória (estado React)
3. **Refresh Token**: Cookie HttpOnly, seguro, rotacionado a cada uso
4. **CSRF Protection**: Cookie `csrf_token` + header `x-csrf` obrigatório
5. **Renovação**: Automática via `/api/admin/refresh` quando token expira
6. **Logout**: Revoga sessão no banco + limpa cookies

### **Implementação no Frontend**
```javascript
// Login
const response = await fetch(`${API_BASE}/admin/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // Importante para cookies!
  body: JSON.stringify({ username, password })
});

const { access_token } = await response.json();

// Requests autenticados
await fetch(`${API_BASE}/admin/flavors`, {
  headers: { 
    'Authorization': `Bearer ${access_token}`,
    'Content-Type': 'application/json'
  },
  credentials: 'include' // Envia cookies automaticamente
});

// Refresh token (quando access_token expirar)
const csrfToken = getCookie('csrf_token');
await fetch(`${API_BASE}/admin/refresh`, {
  method: 'POST',
  headers: { 'x-csrf': csrfToken },
  credentials: 'include'
});
```

**⚠️ Importante:** O frontend deve enviar `credentials: 'include'` em todas as requisições para incluir cookies HttpOnly.

## 📊 Monitoramento

### Logs de Produção
- **Cloudflare Pages**: Analytics nativo
- **Functions**: Real-time logs no dashboard
- **Console**: Logs estruturados para debug

### Métricas Importantes
- Taxa de conversão de pedidos
- Performance de captura de imagem
- Taxa de sucesso no encurtamento
- Tempo de resposta da API

## 🐛 Troubleshooting

### Problemas Comuns

**Captura de imagem falha:**
```bash
# Verifique se o Cloudinary está configurado
console.log(process.env.VITE_CLOUDINARY_CLOUD_NAME)
```

**Links não encurtam:**
```bash
# Verifique KV namespace no Cloudflare
SHORT_LINKS binding deve estar ativo
```

**Admin não carrega:**
```bash
# Verificar cookies de autenticação (DevTools → Application → Cookies)
# Deve ter: refresh_token (HttpOnly) e csrf_token

# Verificar se access_token está em memória (estado React)
# Se 401: implementar lógica de refresh automático

# Verificar se credentials: 'include' está em todas as requisições
```

## 🎯 Melhorias Implementadas

- [x] **Sistema 100% Database-driven**: Zero dados hardcoded
- [x] **Bulk Import Interface**: Admin pode importar produtos
- [x] **Cache CEP Inteligente**: Performance otimizada
- [x] **Sistema Admin Robusto**: Multi-usuário com roles
- [x] **Integração Completa**: Frontend ↔ Backend sincronizado
- [x] **Loading States Profissionais**: Skeleton loaders sem flash
- [x] **Type Safety Completa**: Interfaces TypeScript para todos os dados
- [x] **UX Otimizada**: Estados de carregamento responsivos
- [x] **Fallbacks Robustos**: Degradação graceful em caso de falhas de API

## 🔮 Próximas Melhorias

- [ ] PWA (Progressive Web App)
- [ ] Notificações push
- [ ] Sistema de avaliações
- [ ] Integração com delivery partners
- [ ] Analytics avançados

---

**🚀 Deploy pronto em minutos com Cloudflare Pages!**