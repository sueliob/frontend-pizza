import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  ShoppingBag, 
  Settings, 
  Plus,
  Edit,
  Trash2,
  Pizza,
  Cookie,
  Utensils,
  Coffee,
  BarChart3,
  Clock,
  MapPin,
  Phone,
  Shield,
  Key,
  Share2
} from 'lucide-react';
import { getApiUrl } from '@/lib/api-config';
import { AuthStore, AuthUser } from '@/lib/auth-store';
import { apiPost, apiGet, apiPut, apiDelete } from '@/lib/api';

interface AdminState {
  isLoggedIn: boolean;
  user?: AuthUser;
}

export default function AdminComplete() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [adminState, setAdminState] = useState<AdminState>({
    isLoggedIn: false
  });
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load auth state from localStorage on mount
  useEffect(() => {
    const authState = AuthStore.getState();
    if (authState.isLoggedIn) {
      setAdminState({
        isLoggedIn: true,
        user: authState.user || undefined
      });
    }
    setIsCheckingAuth(false);
  }, []);

  // 🔐 Enhanced Bearer token login with new apiFetch
  const loginMutation = useMutation({
    mutationFn: async (creds: { username: string; password: string }) => {
      return await apiPost('/admin/login', creds);
    },
    onSuccess: (data) => {
      if (data.success && data.token && data.user) {
        // Save to localStorage using AuthStore
        AuthStore.setState(data.token, data.user);
        setAdminState({
          isLoggedIn: true,
          user: data.user
        });
        toast({
          title: "Login realizado!",
          description: `Bem-vindo, ${data.user.username}!`,
        });
      } else {
        toast({
          title: "Erro no login",
          description: data.message,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      const message = error.message;
      toast({
        title: message.includes('429') ? "Muitas tentativas" : "Erro de conexão",
        description: message,
        variant: "destructive",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(credentials);
  };

  // 🚪 Simple logout with localStorage cleanup
  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Just clear local state - no need to call server for simple token auth
      return { success: true };
    },
    onSuccess: () => {
      // Clear localStorage and local state
      AuthStore.clearState();
      setAdminState({ isLoggedIn: false });
      setCredentials({ username: '', password: '' });
      queryClient.clear();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com segurança.",
      });
    },
    onError: () => {
      // Always clear local state even if server call fails
      AuthStore.clearState();
      setAdminState({ isLoggedIn: false });
      setCredentials({ username: '', password: '' });
      queryClient.clear();
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };


  // Loading state durante verificação de auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-orange-500 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!adminState.isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Admin Login
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="username">Usuário</Label>
                <Input
                  id="username"
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="admin"
                />
              </div>
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="pizzaria123"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Pizza className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="hidden sm:inline">Painel Administrativo - Pizzaria</span>
              <span className="sm:hidden">Admin - Pizzaria</span>
            </h1>
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-xs sm:text-sm text-gray-600 truncate">
                Bem-vindo, {adminState.user?.username}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <div className="w-full overflow-x-auto pb-1">
            <TabsList className="w-full inline-flex sm:grid sm:grid-cols-3 lg:grid-cols-6 gap-1 h-auto p-1 min-w-max sm:min-w-0">
              <TabsTrigger value="dashboard" className="flex flex-col items-center justify-center gap-1 py-2 px-3 text-xs whitespace-nowrap">
                <BarChart3 className="h-5 w-5 flex-shrink-0" />
                <span className="text-[10px] font-medium">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="products" className="flex flex-col items-center justify-center gap-1 py-2 px-3 text-xs whitespace-nowrap">
                <ShoppingBag className="h-5 w-5 flex-shrink-0" />
                <span className="text-[10px] font-medium">Produtos</span>
              </TabsTrigger>
              <TabsTrigger value="dough" className="flex flex-col items-center justify-center gap-1 py-2 px-3 text-xs whitespace-nowrap">
                <Cookie className="h-5 w-5 flex-shrink-0" />
                <span className="text-[10px] font-medium">Massas</span>
              </TabsTrigger>
              <TabsTrigger value="extras" className="flex flex-col items-center justify-center gap-1 py-2 px-3 text-xs whitespace-nowrap">
                <Utensils className="h-5 w-5 flex-shrink-0" />
                <span className="text-[10px] font-medium">Extras</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex flex-col items-center justify-center gap-1 py-2 px-3 text-xs whitespace-nowrap">
                <Settings className="h-5 w-5 flex-shrink-0" />
                <span className="text-[10px] font-medium">Config</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex flex-col items-center justify-center gap-1 py-2 px-3 text-xs whitespace-nowrap">
                <Shield className="h-5 w-5 flex-shrink-0" />
                <span className="text-[10px] font-medium">Segurança</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard">
            <DashboardSection />
          </TabsContent>

          <TabsContent value="products">
            <ProductsSection />
          </TabsContent>

          <TabsContent value="dough">
            <DoughTypesSection />
          </TabsContent>

          <TabsContent value="extras">
            <ExtrasSection />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsSection />
          </TabsContent>

          <TabsContent value="security">
            <SecuritySection token="" adminState={adminState} setAdminState={setAdminState} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Dashboard Component
function DashboardSection() {
  const { data: dashboardData } = useQuery({
    queryKey: ['/admin/dashboard'],
    queryFn: async () => await apiGet('/admin/dashboard'),
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pedidos Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(dashboardData as any)?.todayOrders || 0}</div>
            <p className="text-xs text-green-600 mt-1">+3 desde ontem</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Receita Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {(dashboardData as any)?.monthlyRevenue?.toLocaleString('pt-BR') || '0'}
            </div>
            <p className="text-xs text-green-600 mt-1">+12% desde mês passado</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Produtos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(dashboardData as any)?.totalProducts || 0}</div>
            <p className="text-xs text-gray-600 mt-1">Sabores cadastrados</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Status Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-green-600 font-semibold">Online</div>
            <p className="text-xs text-gray-600 mt-1">Todos os serviços operacionais</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sabores Mais Populares</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(dashboardData as any)?.popularFlavors && Array.isArray((dashboardData as any).popularFlavors) && (dashboardData as any).popularFlavors.map((flavor: any, index: number) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="font-medium">{flavor.name}</span>
                  <span className="text-sm text-gray-600">{flavor.orders} pedidos</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pedidos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(dashboardData as any)?.recentOrders && Array.isArray((dashboardData as any).recentOrders) && (dashboardData as any).recentOrders.map((order: any) => (
                <div key={order.id} className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{order.customer}</div>
                    <div className="text-sm text-gray-600">#{order.id}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{order.total}</div>
                    <div className="text-xs text-gray-600 capitalize">{order.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Products Section Component
function ProductsSection() {
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: settings } = useQuery({
    queryKey: ['/admin/settings'],
    queryFn: async () => await apiGet('/admin/settings'),
  });

  const { data: flavors, isLoading, error, isError } = useQuery({
    queryKey: ['/admin/flavors'],
    queryFn: async () => {
      const data = await apiGet('/admin/flavors');
      return Array.isArray(data) ? data : [];
    },
    retry: (failureCount, error) => {
      if (error?.message?.includes('401') || error?.message?.includes('autenticação')) {
        return false;
      }
      return failureCount < 2;
    },
  });

  const addProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      return await apiPost('/admin/flavors', productData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/admin/flavors'] });
      setEditingProduct(null);
      toast({
        title: "Produto adicionado!",
        description: "O produto foi criado com sucesso.",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async (data: { id: number; updates: any }) => {
      return await apiPut(`/admin/flavors/${data.id}`, data.updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/admin/flavors'] });
      setEditingProduct(null);
      toast({
        title: "Produto atualizado!",
        description: "As alterações foram salvas com sucesso.",
      });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
        <h2 className="text-xl font-semibold">Gerenciar Produtos</h2>
        <Button 
          onClick={() => setEditingProduct({ 
            name: '', 
            description: '', 
            category: '', 
            image: '', 
            prices: {} 
          })}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          <span className="sm:hidden">Novo Produto</span>
          <span className="hidden sm:inline">Adicionar Produto</span>
        </Button>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 w-8 bg-gray-200 rounded"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-gray-200 rounded mb-3"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-red-600">
                <Shield className="h-8 w-8 mx-auto mb-2" />
                <h3 className="font-medium">Erro ao carregar produtos</h3>
                <p className="text-sm mt-1">
                  {(error as Error)?.message || 'Não foi possível conectar ao servidor'}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => queryClient.invalidateQueries({ queryKey: ['/admin/flavors'] })}
                className="mx-auto"
              >
                Tentar novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : !flavors || flavors.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-gray-500">
                <Pizza className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="font-medium">Nenhum produto cadastrado ainda</h3>
                <p className="text-sm mt-1">
                  Clique em "Adicionar Produto" para começar
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Entradas */}
          {flavors && Array.isArray(flavors) && flavors.filter((p: any) => p.category === 'entradas').length > 0 && (
            <div>
              <div className="flex items-center gap-4 mb-4">
                <h3 className="text-lg font-semibold text-orange-600">
                  {(settings as any)?.categories?.entradas || 'Entradas'}
                </h3>
                <div className="flex-1 h-px bg-orange-200"></div>
                <span className="text-sm text-gray-500">
                  {flavors && Array.isArray(flavors) ? flavors.filter((p: any) => p.category === 'entradas').length : 0} item(s)
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {flavors && Array.isArray(flavors) && flavors.filter((p: any) => p.category === 'entradas').map((flavor: any) => (
                  <ProductCard key={flavor.id} flavor={flavor} setEditingProduct={setEditingProduct} />
                ))}
              </div>
            </div>
          )}

          {/* Pizzas Salgadas */}
          {flavors && Array.isArray(flavors) && flavors.filter((p: any) => p.category === 'salgadas').length > 0 && (
            <div>
              <div className="flex items-center gap-4 mb-4">
                <h3 className="text-lg font-semibold text-red-600">
                  {(settings as any)?.categories?.salgadas || 'Pizzas Salgadas'}
                </h3>
                <div className="flex-1 h-px bg-red-200"></div>
                <span className="text-sm text-gray-500">
                  {flavors && Array.isArray(flavors) ? flavors.filter((p: any) => p.category === 'salgadas').length : 0} item(s)
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {flavors && Array.isArray(flavors) && flavors.filter((p: any) => p.category === 'salgadas').map((flavor: any) => (
                  <ProductCard key={flavor.id} flavor={flavor} setEditingProduct={setEditingProduct} />
                ))}
              </div>
            </div>
          )}

          {/* Pizzas Doces */}
          {flavors && Array.isArray(flavors) && flavors.filter((p: any) => p.category === 'doces').length > 0 && (
            <div>
              <div className="flex items-center gap-4 mb-4">
                <h3 className="text-lg font-semibold text-pink-600">
                  {(settings as any)?.categories?.doces || 'Pizzas Doces'}
                </h3>
                <div className="flex-1 h-px bg-pink-200"></div>
                <span className="text-sm text-gray-500">
                  {flavors && Array.isArray(flavors) ? flavors.filter((p: any) => p.category === 'doces').length : 0} item(s)
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {flavors && Array.isArray(flavors) && flavors.filter((p: any) => p.category === 'doces').map((flavor: any) => (
                  <ProductCard key={flavor.id} flavor={flavor} setEditingProduct={setEditingProduct} />
                ))}
              </div>
            </div>
          )}

          {/* Bebidas */}
          {flavors && Array.isArray(flavors) && flavors.filter((p: any) => p.category === 'bebidas').length > 0 && (
            <div>
              <div className="flex items-center gap-4 mb-4">
                <h3 className="text-lg font-semibold text-blue-600">
                  {(settings as any)?.categories?.bebidas || 'Bebidas'}
                </h3>
                <div className="flex-1 h-px bg-blue-200"></div>
                <span className="text-sm text-gray-500">
                  {flavors && Array.isArray(flavors) ? flavors.filter((p: any) => p.category === 'bebidas').length : 0} item(s)
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {flavors && Array.isArray(flavors) && flavors.filter((p: any) => p.category === 'bebidas').map((flavor: any) => (
                  <ProductCard key={flavor.id} flavor={flavor} setEditingProduct={setEditingProduct} />
                ))}
              </div>
            </div>
          )}

          {/* Mensagem se não houver produtos */}
          {(!flavors || flavors.length === 0) && (
            <div className="text-center py-12 text-gray-500">
              <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum produto cadastrado ainda.</p>
              <p className="text-sm">Clique em "Adicionar Produto" para começar.</p>
            </div>
          )}
        </div>
      )}

      {editingProduct && (
        <ProductEditModal
          product={editingProduct}
          onSave={(updates) => {
            if (editingProduct.id) {
              // Editar produto existente
              updateProductMutation.mutate({ id: editingProduct.id, updates });
            } else {
              // Criar novo produto
              addProductMutation.mutate(updates);
            }
          }}
          onClose={() => setEditingProduct(null)}
        />
      )}
    </div>
  );
}

// Product Card Component
function ProductCard({ flavor, setEditingProduct }: { flavor: any, setEditingProduct: (product: any) => void }) {
  return (
    <Card key={flavor.id}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{flavor.name}</CardTitle>
            <p className="text-sm text-gray-600 capitalize">{flavor.category}</p>
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setEditingProduct(flavor)}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="outline">
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {flavor.image && (
          <div className="mb-3">
            <img 
              src={flavor.image} 
              alt={flavor.name}
              className="w-full h-32 object-cover rounded-md"
            />
          </div>
        )}
        <p className="text-sm text-gray-600 mb-2">{flavor.description}</p>
        <div className="space-y-1">
          {typeof flavor.prices === 'object' ? (
            Object.entries(flavor.prices).map(([size, price]) => (
              <div key={size} className="flex justify-between text-sm">
                <span className="capitalize">{size}:</span>
                <span>R$ {String(price)}</span>
              </div>
            ))
          ) : (
            <div className="text-sm">R$ {flavor.prices}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to get default prices by category
function getCategoryDefaultPrices(category: string) {
  switch(category) {
    case 'salgadas':
      return { grande: 0, individual: 0 };
    case 'doces':
      return { media: 0, individual: 0 };
    case 'entradas':
    case 'bebidas':
      return { unico: 0 };
    default:
      return {};
  }
}

// Product Edit Modal Component
function ProductEditModal({ 
  product, 
  onSave, 
  onClose 
}: { 
  product: any; 
  onSave: (updates: any) => void; 
  onClose: () => void; 
}) {
  const [formData, setFormData] = useState({
    name: product.name || '',
    description: product.description || '',
    category: product.category || '',
    image: product.image || '',
    prices: product.prices || getCategoryDefaultPrices(product.category || '')
  });

  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('image', file);

      const response = await fetch(getApiUrl('/admin/upload-image'), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${AuthStore.getToken()}` },
        body: formDataUpload,
      });

      const result = await response.json();
      
      if (result.success) {
        setFormData(prev => ({ ...prev, image: result.imageUrl }));
        toast({
          title: "Imagem enviada!",
          description: "A imagem foi carregada com sucesso.",
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: "Erro no upload",
        description: "Não foi possível carregar a imagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Editar Produto</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Nome do Produto</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nome do sabor"
              required
            />
          </div>

          <div>
            <Label>Descrição</Label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição do sabor"
            />
          </div>

          <div>
            <Label>Categoria</Label>
            <select
              value={formData.category}
              onChange={(e) => {
                const newCategory = e.target.value;
                setFormData(prev => ({ 
                  ...prev, 
                  category: newCategory,
                  prices: getCategoryDefaultPrices(newCategory)
                }));
              }}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="">Selecione...</option>
              <option value="salgadas">Pizzas Salgadas</option>
              <option value="doces">Pizzas Doces</option>
              <option value="entradas">Entradas</option>
              <option value="bebidas">Bebidas</option>
            </select>
          </div>

          <div>
            <Label>Imagem do Produto</Label>
            <div className="space-y-3">
              {formData.image && (
                <div className="relative">
                  <img 
                    src={formData.image} 
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-md"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                  >
                    Remover
                  </Button>
                </div>
              )}
              
              {/* Opção 1: URL da imagem */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Opção 1: URL da Imagem</Label>
                <Input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                  placeholder="https://example.com/imagem.jpg"
                  className="w-full"
                />
                <p className="text-xs text-gray-500">Cole o link de uma imagem da internet</p>
              </div>

              {/* Divisor */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-sm text-gray-500">OU</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>
              
              {/* Opção 2: Upload de arquivo */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Opção 2: Upload de Arquivo</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                    disabled={uploading}
                    className="flex-1"
                  />
                  {uploading && <span className="text-sm text-gray-600">Enviando...</span>}
                </div>
                <p className="text-xs text-gray-500">Faça upload de uma imagem do seu dispositivo</p>
              </div>
            </div>
          </div>

          <div>
            <Label>Preços</Label>
            <div className="space-y-3">
              {/* Pizzas Salgadas: Grande e Individual */}
              {formData.category === 'salgadas' && (
                <>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Pizza Grande</h4>
                    <div className="flex gap-2 items-center">
                      <span className="w-16 text-sm">R$</span>
                      <Input
                        type="number"
                        step="0.50"
                        value={formData.prices.grande || ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          prices: { ...prev.prices, grande: parseFloat(e.target.value) || 0 }
                        }))}
                        placeholder="35.00"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Pizza Individual</h4>
                    <div className="flex gap-2 items-center">
                      <span className="w-16 text-sm">R$</span>
                      <Input
                        type="number"
                        step="0.50"
                        value={formData.prices.individual || ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          prices: { ...prev.prices, individual: parseFloat(e.target.value) || 0 }
                        }))}
                        placeholder="18.00"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Pizzas Doces: Média e Individual */}
              {formData.category === 'doces' && (
                <>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Pizza Média</h4>
                    <div className="flex gap-2 items-center">
                      <span className="w-16 text-sm">R$</span>
                      <Input
                        type="number"
                        step="0.50"
                        value={formData.prices.media || ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          prices: { ...prev.prices, media: parseFloat(e.target.value) || 0 }
                        }))}
                        placeholder="28.00"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Pizza Individual</h4>
                    <div className="flex gap-2 items-center">
                      <span className="w-16 text-sm">R$</span>
                      <Input
                        type="number"
                        step="0.50"
                        value={formData.prices.individual || ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          prices: { ...prev.prices, individual: parseFloat(e.target.value) || 0 }
                        }))}
                        placeholder="16.00"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Entradas e Bebidas: Preço único */}
              {(formData.category === 'entradas' || formData.category === 'bebidas') && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Preço</h4>
                  <div className="flex gap-2 items-center">
                    <span className="w-16 text-sm">R$</span>
                    <Input
                      type="number"
                      step="0.50"
                      value={formData.prices.unico || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        prices: { ...prev.prices, unico: parseFloat(e.target.value) || 0 }
                      }))}
                      placeholder="15.00"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              Salvar Alterações
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Dough Types Section Component  
function DoughTypesSection() {
  const [editingDough, setEditingDough] = useState<any>(null);
  const [addingDough, setAddingDough] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: doughTypes, isLoading } = useQuery({
    queryKey: ['/admin/dough-types'],
    queryFn: async () => await apiGet('/admin/dough-types'),
  });

  const updateDoughMutation = useMutation({
    mutationFn: async (data: { id: number; updates: any }) => {
      return await apiPut(`/admin/dough-types/${data.id}`, data.updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/admin/dough-types'] });
      setEditingDough(null);
      toast({
        title: "Tipo de massa atualizado!",
        description: "As alterações foram salvas com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar massa",
        description: `Falha: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const createDoughMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiPost('/admin/dough-types', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/admin/dough-types'] });
      setAddingDough(false);
      toast({
        title: "Nova massa adicionada!",
        description: "O tipo de massa foi criado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar massa",
        description: `Falha: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteDoughMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiDelete(`/admin/dough-types/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/admin/dough-types'] });
      toast({
        title: "Massa removida!",
        description: "O tipo de massa foi excluído com sucesso.",
      });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Tipos de Massa</h2>
        <Button 
          className="flex items-center gap-2"
          onClick={() => setAddingDough(true)}
          disabled={createDoughMutation.isPending}
        >
          <Plus className="h-4 w-4" />
          {createDoughMutation.isPending ? 'Adicionando...' : 'Adicionar Massa'}
        </Button>
      </div>
      
      {isLoading ? (
        <div className="text-center py-12">Carregando massas...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {doughTypes && Array.isArray(doughTypes) && doughTypes.map((dough: any) => (
            <Card key={dough.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{dough.name}</CardTitle>
                    <p className="text-sm text-gray-600 capitalize">{dough.category}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setEditingDough(dough)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        if (window.confirm(`Tem certeza que deseja excluir "${dough.name}"?`)) {
                          deleteDoughMutation.mutate(dough.id);
                        }
                      }}
                      disabled={deleteDoughMutation.isPending}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">{dough.description}</p>
                <div className="text-sm">
                  <span className="font-medium">Preço adicional: </span>
                  R$ {dough.price}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {editingDough && (
        <DoughEditModal
          dough={editingDough}
          onSave={(updates) => updateDoughMutation.mutate({ id: editingDough.id, updates })}
          onClose={() => setEditingDough(null)}
        />
      )}

      {addingDough && (
        <DoughAddModal
          onSave={(data) => createDoughMutation.mutate(data)}
          onClose={() => setAddingDough(false)}
        />
      )}
    </div>
  );
}

// Extras Section Component (Extras para Pizzas Salgadas e Doces)
function ExtrasSection() {
  const [editingExtra, setEditingExtra] = useState<any>(null);
  const [addingExtra, setAddingExtra] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('salgadas');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: extras, isLoading } = useQuery({
    queryKey: ['/admin/extras'],
    queryFn: async () => await apiGet('/admin/extras'),
  });

  const updateExtraMutation = useMutation({
    mutationFn: async (data: { id: number; updates: any }) => {
      return await apiPut(`/admin/extras/${data.id}`, data.updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/admin/extras'] });
      setEditingExtra(null);
      toast({
        title: "Extra atualizado!",
        description: "As alterações foram salvas com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar extra",
        description: `Falha: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const createExtraMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiPost('/admin/extras', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/admin/extras'] });
      setAddingExtra(false);
      toast({
        title: "Novo extra adicionado!",
        description: "O extra foi criado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar extra",
        description: `Falha: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteExtraMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiDelete(`/admin/extras/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/admin/extras'] });
      toast({
        title: "Extra removido!",
        description: "O extra foi excluído com sucesso.",
      });
    },
  });

  // Filtrar extras por categoria
  const filteredExtras = (extras && Array.isArray(extras)) 
    ? extras.filter((extra: any) => extra.category === selectedCategory) 
    : [];
  

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Extras e Adicionais</h2>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={selectedCategory === 'salgadas' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('salgadas')}
            >
              <Pizza className="h-4 w-4 mr-1" />
              Pizzas Salgadas
            </Button>
            <Button
              size="sm"
              variant={selectedCategory === 'doces' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('doces')}
            >
              <Cookie className="h-4 w-4 mr-1" />
              Pizzas Doces
            </Button>
          </div>
        </div>
        <Button 
          className="flex items-center gap-2"
          onClick={() => setAddingExtra(true)}
          disabled={createExtraMutation.isPending}
        >
          <Plus className="h-4 w-4" />
          {createExtraMutation.isPending ? 'Adicionando...' : 'Adicionar Extra'}
        </Button>
      </div>
      
      {isLoading ? (
        <div className="text-center py-12">Carregando extras...</div>
      ) : filteredExtras.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            Nenhum extra encontrado para a categoria "{selectedCategory}".
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Total de extras carregados: {extras?.length || 0}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExtras.map((extra: any) => (
            <Card key={extra.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{extra.name}</CardTitle>
                    <p className="text-sm text-gray-600 capitalize">Para Pizzas {extra.category}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setEditingExtra(extra)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        if (window.confirm(`Tem certeza que deseja excluir "${extra.name}"?`)) {
                          deleteExtraMutation.mutate(extra.id);
                        }
                      }}
                      disabled={deleteExtraMutation.isPending}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">{extra.description}</p>
                <div className="text-sm">
                  <span className="font-medium">Preço: </span>
                  R$ {extra.price}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {editingExtra && (
        <ExtraEditModal
          extra={editingExtra}
          onSave={(updates) => updateExtraMutation.mutate({ id: editingExtra.id, updates })}
          onClose={() => setEditingExtra(null)}
        />
      )}

      {addingExtra && (
        <ExtraAddModal
          defaultCategory={selectedCategory}
          onSave={(data) => createExtraMutation.mutate(data)}
          onClose={() => setAddingExtra(false)}
        />
      )}
    </div>
  );
}

// Settings Section Component
function SettingsSection() {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: settings } = useQuery({
    queryKey: ['/admin/settings'],
    queryFn: async () => await apiGet('/admin/settings'),
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: { section: string; data: any }) => {
      return await apiPut('/admin/settings', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/admin/settings'] });
      setEditingSection(null);
      toast({
        title: "Configurações atualizadas!",
        description: "As alterações foram salvas com sucesso.",
      });
    },
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Configurações da Pizzaria</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Horários de Funcionamento
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setEditingSection(editingSection === 'hours' ? null : 'hours')}
              >
                <Edit className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {editingSection === 'hours' ? (
              <BusinessHoursForm 
                settings={settings} 
                onSave={(data) => updateSettingsMutation.mutate({ section: 'hours', data })}
                onCancel={() => setEditingSection(null)}
              />
            ) : (
              <div className="space-y-2">
                {(settings as any)?.businessHours && typeof (settings as any).businessHours === 'object' && Object.entries((settings as any).businessHours).map(([day, hours]: [string, any]) => (
                  <div key={day} className="flex justify-between items-center">
                    <span className="capitalize font-medium">{day}:</span>
                    <span className="text-sm">
                      {hours.isOpen ? `${hours.open} - ${hours.close}` : 'Fechado'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contato
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setEditingSection(editingSection === 'contact' ? null : 'contact')}
              >
                <Edit className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {editingSection === 'contact' ? (
              <ContactForm 
                settings={settings} 
                onSave={(data) => updateSettingsMutation.mutate({ section: 'contact', data })}
                onCancel={() => setEditingSection(null)}
              />
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">WhatsApp:</span>
                  <span className="text-sm">{settings?.contact?.whatsapp || 'Não configurado'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Telefone:</span>
                  <span className="text-sm">{settings?.contact?.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Email:</span>
                  <span className="text-sm">{settings?.contact?.email}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Endereço
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setEditingSection(editingSection === 'address' ? null : 'address')}
              >
                <Edit className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {editingSection === 'address' ? (
              <AddressForm 
                settings={settings} 
                onSave={(data) => updateSettingsMutation.mutate({ section: 'address', data })}
                onCancel={() => setEditingSection(null)}
              />
            ) : (
              <div className="space-y-2">
                <div>
                  <p className="font-medium">{settings?.address?.street}, {settings?.address?.number}</p>
                  <p className="text-sm text-gray-600">{settings?.address?.neighborhood}</p>
                  <p className="text-sm text-gray-600">{settings?.address?.city} - {settings?.address?.state}</p>
                  <p className="text-sm text-gray-600">CEP: {settings?.address?.cep}</p>
                </div>
                {settings?.address?.coordinates && (
                  <div className="text-xs text-gray-500">
                    Lat: {settings.address.coordinates.lat}, Lng: {settings.address.coordinates.lng}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Taxas de Entrega</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setEditingSection(editingSection === 'delivery' ? null : 'delivery')}
              >
                <Edit className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {editingSection === 'delivery' ? (
              <DeliveryForm 
                settings={settings} 
                onSave={(data) => updateSettingsMutation.mutate({ section: 'delivery', data })}
                onCancel={() => setEditingSection(null)}
              />
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Taxa base:</span>
                  <span className="text-sm">R$ {settings?.delivery?.baseFee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Por faixa:</span>
                  <span className="text-sm">R$ {settings?.delivery?.feePerRange}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Faixa (km):</span>
                  <span className="text-sm">{settings?.delivery?.kmRange} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Tempo base:</span>
                  <span className="text-sm">{settings?.delivery?.baseTime} min</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Pizza className="h-5 w-5" />
                Aparência da Pizzaria
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setEditingSection(editingSection === 'branding' ? null : 'branding')}
              >
                <Edit className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {editingSection === 'branding' ? (
              <BrandingForm 
                settings={settings} 
                onSave={(data) => updateSettingsMutation.mutate({ section: 'branding', data })}
                onCancel={() => setEditingSection(null)}
              />
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Nome:</span>
                  <span className="text-sm">{settings?.branding?.name || 'pizzaria'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Slogan:</span>
                  <span className="text-sm">{settings?.branding?.slogan || 'pizza de qualidade'}</span>
                </div>
                <div className="space-y-1">
                  <span className="font-medium">Logo:</span>
                  {settings?.branding?.logoUrl ? (
                    <img 
                      src={settings.branding.logoUrl} 
                      alt="Logo" 
                      className="w-16 h-16 object-contain border rounded"
                    />
                  ) : (
                    <span className="text-sm text-gray-500">Não definido</span>
                  )}
                </div>
                <div className="space-y-1">
                  <span className="font-medium">Imagem de Fundo:</span>
                  {settings?.branding?.backgroundUrl ? (
                    <img 
                      src={settings.branding.backgroundUrl} 
                      alt="Fundo" 
                      className="w-24 h-16 object-cover border rounded"
                    />
                  ) : (
                    <span className="text-sm text-gray-500">Não definido</span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Redes Sociais
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setEditingSection(editingSection === 'social' ? null : 'social')}
              >
                <Edit className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {editingSection === 'social' ? (
              <SocialForm 
                settings={settings} 
                onSave={(data) => updateSettingsMutation.mutate({ section: 'social', data })}
                onCancel={() => setEditingSection(null)}
              />
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Facebook:</span>
                  <span className="text-sm">{settings?.social?.facebook || 'Não definido'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Instagram:</span>
                  <span className="text-sm">{settings?.social?.instagram || 'Não definido'}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Nomes das Categorias
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setEditingSection(editingSection === 'categories' ? null : 'categories')}
              >
                <Edit className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {editingSection === 'categories' ? (
              <CategoriesForm 
                settings={settings} 
                onSave={(data) => updateSettingsMutation.mutate({ section: 'categories', data })}
                onCancel={() => setEditingSection(null)}
              />
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Entradas:</span>
                  <span className="text-sm">{settings?.categories?.entradas || 'Entradas'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Pizzas Salgadas:</span>
                  <span className="text-sm">{settings?.categories?.salgadas || 'Pizzas Salgadas'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Pizzas Doces:</span>
                  <span className="text-sm">{settings?.categories?.doces || 'Pizzas Doces'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Bebidas:</span>
                  <span className="text-sm">{settings?.categories?.bebidas || 'Bebidas'}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Business Hours Form Component
function BusinessHoursForm({ settings, onSave, onCancel }: { settings: any, onSave: (data: any) => void, onCancel: () => void }) {
  const [hours, setHours] = useState(settings?.businessHours || {
    domingo: { isOpen: false, open: '18:00', close: '23:00' },
    segunda: { isOpen: true, open: '18:00', close: '23:00' },
    terca: { isOpen: true, open: '18:00', close: '23:00' },
    quarta: { isOpen: true, open: '18:00', close: '23:00' },
    quinta: { isOpen: true, open: '18:00', close: '23:00' },
    sexta: { isOpen: true, open: '18:00', close: '23:30' },
    sabado: { isOpen: true, open: '18:00', close: '23:30' },
  });

  return (
    <div className="space-y-4">
      {Object.entries(hours).map(([day, dayHours]: [string, any]) => (
        <div key={day} className="flex items-center gap-3">
          <div className="w-20">
            <span className="capitalize font-medium">{day}:</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={dayHours.isOpen}
              onChange={(e) => setHours((prev: any) => ({
                ...prev,
                [day]: { ...prev[day], isOpen: e.target.checked }
              }))}
              className="h-4 w-4"
            />
            {dayHours.isOpen && (
              <>
                <Input
                  type="time"
                  value={dayHours.open}
                  onChange={(e) => setHours((prev: any) => ({
                    ...prev,
                    [day]: { ...prev[day], open: e.target.value }
                  }))}
                  className="w-24"
                />
                <span>às</span>
                <Input
                  type="time"
                  value={dayHours.close}
                  onChange={(e) => setHours((prev: any) => ({
                    ...prev,
                    [day]: { ...prev[day], close: e.target.value }
                  }))}
                  className="w-24"
                />
              </>
            )}
          </div>
        </div>
      ))}
      <div className="flex gap-2 pt-4">
        <Button onClick={() => onSave({ businessHours: hours })} size="sm">
          Salvar
        </Button>
        <Button variant="outline" onClick={onCancel} size="sm">
          Cancelar
        </Button>
      </div>
    </div>
  );
}

// Contact Form Component
function ContactForm({ settings, onSave, onCancel }: { settings: any, onSave: (data: any) => void, onCancel: () => void }) {
  const [contact, setContact] = useState({
    whatsapp: settings?.contact?.whatsapp || '',
    phone: settings?.contact?.phone || '',
    email: settings?.contact?.email || '',
  });

  return (
    <div className="space-y-4">
      <div>
        <Label>WhatsApp (com DDD)</Label>
        <Input
          type="tel"
          value={contact.whatsapp}
          onChange={(e) => setContact(prev => ({ ...prev, whatsapp: e.target.value }))}
          placeholder="11999998888"
        />
      </div>
      <div>
        <Label>Telefone</Label>
        <Input
          type="tel"
          value={contact.phone}
          onChange={(e) => setContact(prev => ({ ...prev, phone: e.target.value }))}
          placeholder="(11) 3456-7890"
        />
      </div>
      <div>
        <Label>Email</Label>
        <Input
          type="email"
          value={contact.email}
          onChange={(e) => setContact(prev => ({ ...prev, email: e.target.value }))}
          placeholder="contato@pizzaria.com"
        />
      </div>
      <div className="flex gap-2 pt-2">
        <Button onClick={() => onSave({ contact })} size="sm">
          Salvar
        </Button>
        <Button variant="outline" onClick={onCancel} size="sm">
          Cancelar
        </Button>
      </div>
    </div>
  );
}

// Address Form Component
function AddressForm({ settings, onSave, onCancel }: { settings: any, onSave: (data: any) => void, onCancel: () => void }) {
  const [address, setAddress] = useState({
    street: settings?.address?.street || '',
    number: settings?.address?.number || '',
    neighborhood: settings?.address?.neighborhood || '',
    city: settings?.address?.city || '',
    state: settings?.address?.state || '',
    cep: settings?.address?.cep || '',
    coordinates: settings?.address?.coordinates || { lat: 0, lng: 0 },
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Rua</Label>
          <Input
            value={address.street}
            onChange={(e) => setAddress(prev => ({ ...prev, street: e.target.value }))}
            placeholder="Rua das Flores"
          />
        </div>
        <div>
          <Label>Número</Label>
          <Input
            value={address.number}
            onChange={(e) => setAddress(prev => ({ ...prev, number: e.target.value }))}
            placeholder="123"
          />
        </div>
      </div>
      <div>
        <Label>Bairro</Label>
        <Input
          value={address.neighborhood}
          onChange={(e) => setAddress(prev => ({ ...prev, neighborhood: e.target.value }))}
          placeholder="Centro"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Cidade</Label>
          <Input
            value={address.city}
            onChange={(e) => setAddress(prev => ({ ...prev, city: e.target.value }))}
            placeholder="São Paulo"
          />
        </div>
        <div>
          <Label>Estado</Label>
          <Input
            value={address.state}
            onChange={(e) => setAddress(prev => ({ ...prev, state: e.target.value }))}
            placeholder="SP"
          />
        </div>
      </div>
      <div>
        <Label>CEP</Label>
        <Input
          value={address.cep}
          onChange={(e) => setAddress(prev => ({ ...prev, cep: e.target.value }))}
          placeholder="01234-567"
        />
      </div>
      <div className="flex gap-2 pt-2">
        <Button onClick={() => onSave({ address })} size="sm">
          Salvar
        </Button>
        <Button variant="outline" onClick={onCancel} size="sm">
          Cancelar
        </Button>
      </div>
    </div>
  );
}

// Delivery Form Component
function DeliveryForm({ settings, onSave, onCancel }: { settings: any, onSave: (data: any) => void, onCancel: () => void }) {
  const [delivery, setDelivery] = useState({
    baseFee: settings?.delivery?.baseFee || 5.00,
    feePerRange: settings?.delivery?.feePerRange || 2.50,
    kmRange: settings?.delivery?.kmRange || 3,
    baseTime: settings?.delivery?.baseTime || 45,
  });

  return (
    <div className="space-y-4">
      <div>
        <Label>Taxa Base (R$)</Label>
        <Input
          type="number"
          step="0.50"
          value={delivery.baseFee}
          onChange={(e) => setDelivery(prev => ({ ...prev, baseFee: parseFloat(e.target.value) }))}
        />
      </div>
      <div>
        <Label>Taxa por Faixa (R$)</Label>
        <Input
          type="number"
          step="0.50"
          value={delivery.feePerRange}
          onChange={(e) => setDelivery(prev => ({ ...prev, feePerRange: parseFloat(e.target.value) }))}
        />
      </div>
      <div>
        <Label>Faixa de Distância (km)</Label>
        <Input
          type="number"
          value={delivery.kmRange}
          onChange={(e) => setDelivery(prev => ({ ...prev, kmRange: parseInt(e.target.value) }))}
        />
      </div>
      <div>
        <Label>Tempo Base de Entrega (min)</Label>
        <Input
          type="number"
          value={delivery.baseTime}
          onChange={(e) => setDelivery(prev => ({ ...prev, baseTime: parseInt(e.target.value) }))}
        />
      </div>
      <div className="flex gap-2 pt-2">
        <Button onClick={() => onSave({ delivery })} size="sm">
          Salvar
        </Button>
        <Button variant="outline" onClick={onCancel} size="sm">
          Cancelar
        </Button>
      </div>
    </div>
  );
}

// Dough Add Modal Component
function DoughAddModal({ 
  onSave, 
  onClose 
}: { 
  onSave: (data: any) => void; 
  onClose: () => void; 
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Nova Massa</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Nome da Massa</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Massa Integral"
              required
            />
          </div>

          <div>
            <Label>Descrição</Label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição da massa"
            />
          </div>

          <div>
            <Label>Categoria</Label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="">Selecione...</option>
              <option value="salgada">Massa Salgada</option>
              <option value="doce">Massa Doce</option>
            </select>
          </div>

          <div>
            <Label>Preço Adicional (R$)</Label>
            <Input
              type="number"
              step="0.50"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
              placeholder="5.00"
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              Criar Massa
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Dough Edit Modal Component
function DoughEditModal({ 
  dough, 
  onSave, 
  onClose 
}: { 
  dough: any; 
  onSave: (updates: any) => void; 
  onClose: () => void; 
}) {
  
  const [formData, setFormData] = useState({
    name: dough.name || '',
    description: dough.description || '',
    category: dough.category || '',
    price: dough.price || 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Editar Tipo de Massa</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Nome da Massa</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Massa Integral"
              required
            />
          </div>

          <div>
            <Label>Descrição</Label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição da massa"
            />
          </div>

          <div>
            <Label>Categoria</Label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="">Selecione...</option>
              <option value="salgada">Massa Salgada</option>
              <option value="doce">Massa Doce</option>
            </select>
          </div>

          <div>
            <Label>Preço Adicional (R$)</Label>
            <Input
              type="number"
              step="0.50"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
              placeholder="5.00"
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              Salvar Alterações
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}


// Extra Add Modal Component
function ExtraAddModal({ 
  defaultCategory,
  onSave, 
  onClose 
}: { 
  defaultCategory: string;
  onSave: (data: any) => void; 
  onClose: () => void; 
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: defaultCategory, // salgadas ou doces
    price: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Novo Extra</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Nome do Extra</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Queijo Extra, Bacon"
              required
            />
          </div>

          <div>
            <Label>Descrição</Label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição do extra"
            />
          </div>

          <div>
            <Label>Categoria</Label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="salgadas">Salgadas</option>
              <option value="doces">Doces</option>
            </select>
          </div>

          <div>
            <Label>Preço Adicional (R$)</Label>
            <Input
              type="number"
              step="0.50"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
              placeholder="3.00"
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              Adicionar Extra
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Extra Edit Modal Component
function ExtraEditModal({ 
  extra, 
  onSave, 
  onClose 
}: { 
  extra: any; 
  onSave: (updates: any) => void; 
  onClose: () => void; 
}) {
  
  const [formData, setFormData] = useState({
    name: extra.name || '',
    description: extra.description || '',
    category: extra.category || 'salgadas',
    price: extra.price || 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Editar Extra</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Nome do Extra</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Queijo Extra, Bacon"
              required
            />
          </div>

          <div>
            <Label>Descrição</Label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição do extra"
            />
          </div>

          <div>
            <Label>Categoria</Label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="salgadas">Salgadas</option>
              <option value="doces">Doces</option>
            </select>
          </div>

          <div>
            <Label>Preço Adicional (R$)</Label>
            <Input
              type="number"
              step="0.50"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
              placeholder="3.00"
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              Salvar Alterações
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Categories Form Component
function CategoriesForm({ settings, onSave, onCancel }: { settings: any, onSave: (data: any) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState({
    entradas: settings?.categories?.entradas || 'Entradas',
    salgadas: settings?.categories?.salgadas || 'Pizzas Salgadas',
    doces: settings?.categories?.doces || 'Pizzas Doces',
    bebidas: settings?.categories?.bebidas || 'Bebidas'
  });

  return (
    <div className="space-y-4">
      <div>
        <Label>Nome para Entradas</Label>
        <Input
          value={formData.entradas}
          onChange={(e) => setFormData(prev => ({ ...prev, entradas: e.target.value }))}
          placeholder="Ex: Entradas"
        />
      </div>

      <div>
        <Label>Nome para Pizzas Salgadas</Label>
        <Input
          value={formData.salgadas}
          onChange={(e) => setFormData(prev => ({ ...prev, salgadas: e.target.value }))}
          placeholder="Ex: Pizzas Salgadas"
        />
      </div>

      <div>
        <Label>Nome para Pizzas Doces</Label>
        <Input
          value={formData.doces}
          onChange={(e) => setFormData(prev => ({ ...prev, doces: e.target.value }))}
          placeholder="Ex: Pizzas Doces"
        />
      </div>

      <div>
        <Label>Nome para Bebidas</Label>
        <Input
          value={formData.bebidas}
          onChange={(e) => setFormData(prev => ({ ...prev, bebidas: e.target.value }))}
          placeholder="Ex: Bebidas"
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button onClick={() => onSave({ categories: formData })} size="sm">
          Salvar
        </Button>
        <Button onClick={onCancel} variant="outline" size="sm">
          Cancelar
        </Button>
      </div>
    </div>
  );
}

// Social Form Component
function SocialForm({ settings, onSave, onCancel }: { settings: any, onSave: (data: any) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState({
    facebook: settings?.social?.facebook || '',
    instagram: settings?.social?.instagram || ''
  });

  return (
    <div className="space-y-4">
      <div>
        <Label>Link do Facebook</Label>
        <Input
          value={formData.facebook}
          onChange={(e) => setFormData(prev => ({ ...prev, facebook: e.target.value }))}
          placeholder="https://facebook.com/sua-pizzaria"
        />
      </div>

      <div>
        <Label>Link do Instagram</Label>
        <Input
          value={formData.instagram}
          onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
          placeholder="https://instagram.com/sua-pizzaria"
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button onClick={() => onSave({ social: formData })} size="sm">
          Salvar
        </Button>
        <Button onClick={onCancel} variant="outline" size="sm">
          Cancelar
        </Button>
      </div>
    </div>
  );
}

// Branding Form Component
function BrandingForm({ settings, onSave, onCancel }: { settings: any, onSave: (data: any) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState({
    name: settings?.branding?.name || 'pizzaria',
    slogan: settings?.branding?.slogan || 'pizza de qualidade',
    logoUrl: settings?.branding?.logoUrl || '',
    backgroundUrl: settings?.branding?.backgroundUrl || ''
  });

  return (
    <div className="space-y-4">
      <div>
        <Label>Nome da Pizzaria</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Ex: BRASCATTA"
        />
      </div>

      <div>
        <Label>Slogan</Label>
        <Input
          value={formData.slogan}
          onChange={(e) => setFormData(prev => ({ ...prev, slogan: e.target.value }))}
          placeholder="Ex: pizza de qualidade"
        />
      </div>

      <div>
        <Label>URL do Logo</Label>
        <Input
          value={formData.logoUrl}
          onChange={(e) => setFormData(prev => ({ ...prev, logoUrl: e.target.value }))}
          placeholder="https://exemplo.com/logo.png"
        />
        {formData.logoUrl && (
          <div className="mt-2">
            <img 
              src={formData.logoUrl} 
              alt="Preview do Logo" 
              className="w-16 h-16 object-contain border rounded"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>

      <div>
        <Label>URL da Imagem de Fundo</Label>
        <Input
          value={formData.backgroundUrl}
          onChange={(e) => setFormData(prev => ({ ...prev, backgroundUrl: e.target.value }))}
          placeholder="https://exemplo.com/fundo.jpg"
        />
        {formData.backgroundUrl && (
          <div className="mt-2">
            <img 
              src={formData.backgroundUrl} 
              alt="Preview do Fundo" 
              className="w-24 h-16 object-cover border rounded"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-4">
        <Button onClick={() => onSave({ branding: formData })} size="sm">
          Salvar
        </Button>
        <Button onClick={onCancel} variant="outline" size="sm">
          Cancelar
        </Button>
      </div>
    </div>
  );
}

// Security Section Component
function SecuritySection({ 
  token, 
  adminState, 
  setAdminState 
}: { 
  token: string; 
  adminState: any;
  setAdminState: (state: any) => void;
}) {
  const [editingCredentials, setEditingCredentials] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newUsername: adminState.user?.username || 'admin',
    newPassword: '',
    confirmPassword: ''
  });
  const { toast } = useToast();

  const updateCredentialsMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiPut('/admin/update-credentials', data);
    },
    onSuccess: (data) => {
      if (data.success) {
        setAdminState({
          ...adminState,
          user: { ...adminState.user, username: formData.newUsername }
        });
        setEditingCredentials(false);
        setFormData({
          currentPassword: '',
          newUsername: formData.newUsername,
          newPassword: '',
          confirmPassword: ''
        });
        toast({
          title: "Credenciais atualizadas!",
          description: "Login e senha foram alterados com sucesso.",
        });
      } else {
        toast({
          title: "Erro na atualização",
          description: data.message || "Não foi possível atualizar as credenciais.",
          variant: "destructive",
        });
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Erro na validação",
        description: "As senhas não conferem.",
        variant: "destructive",
      });
      return;
    }

    if (formData.newPassword.length < 6) {
      toast({
        title: "Erro na validação",
        description: "A nova senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    updateCredentialsMutation.mutate({
      currentPassword: formData.currentPassword,
      newUsername: formData.newUsername,
      newPassword: formData.newPassword
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Configurações de Segurança</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Credenciais de Acesso
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setEditingCredentials(!editingCredentials)}
              >
                <Edit className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {editingCredentials ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Senha Atual</Label>
                  <Input
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Digite sua senha atual"
                    required
                  />
                </div>

                <div>
                  <Label>Novo Usuário</Label>
                  <Input
                    value={formData.newUsername}
                    onChange={(e) => setFormData(prev => ({ ...prev, newUsername: e.target.value }))}
                    placeholder="Novo nome de usuário"
                    required
                  />
                </div>

                <div>
                  <Label>Nova Senha</Label>
                  <Input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Digite a nova senha (min. 6 caracteres)"
                    required
                  />
                </div>

                <div>
                  <Label>Confirmar Nova Senha</Label>
                  <Input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirme a nova senha"
                    required
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    type="submit" 
                    className="flex-1"
                    disabled={updateCredentialsMutation.isPending}
                  >
                    {updateCredentialsMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setEditingCredentials(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Usuário:</span>
                  <span className="text-sm">{adminState.user?.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Senha:</span>
                  <span className="text-sm">••••••••</span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Clique no ícone de edição para alterar suas credenciais de acesso.
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Informações de Segurança
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Último Login:</span>
                <span className="text-sm">Agora</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Sessão Ativa:</span>
                <span className="text-sm text-green-600">Sim</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Token Válido:</span>
                <span className="text-sm text-green-600">Sim</span>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <h4 className="text-sm font-medium mb-2">Dicas de Segurança:</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Use uma senha forte com pelo menos 6 caracteres</li>
                <li>• Altere suas credenciais regularmente</li>
                <li>• Não compartilhe suas credenciais de acesso</li>
                <li>• Faça logout ao sair do painel</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}