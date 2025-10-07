import { ArrowLeft, ShoppingCart, Menu } from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/cart-store';
import { useState, useEffect } from 'react';
import { getApiUrl } from '@/lib/api-config';

interface BrandingData {
  name: string;
  slogan: string;
}

export default function Header() {
  const [location, navigate] = useLocation();
  const { totalItems } = useCart();
  const [showSideMenu, setShowSideMenu] = useState(false);
  const [brandingData, setBrandingData] = useState<BrandingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Buscar dados de branding das configurações administrativas
  useEffect(() => {
    const fetchBrandingData = async () => {
      try {
        const adminResponse = await fetch(getApiUrl('/public/settings'));
        
        if (adminResponse.ok) {
          const settings = await adminResponse.json();
          if (settings?.branding) {
            setBrandingData({
              name: settings.branding.name,
              slogan: settings.branding.slogan
            });
          }
        } else {
          console.error('Falha ao carregar configurações de branding');
        }
      } catch (error) {
        console.error('Erro ao carregar branding:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrandingData();
  }, []);

  const getTitle = () => {
    if (isLoading) return ''; // Vazio durante carregamento
    if (location === '/') return brandingData?.name || '';
    if (location.startsWith('/category/salgadas')) return 'Pizzas Salgadas';
    if (location.startsWith('/category/doces')) return 'Pizzas Doces';
    if (location.startsWith('/category/entradas')) return 'Entradas';
    if (location.startsWith('/category/bebidas')) return 'Bebidas';
    if (location === '/cart') return 'Carrinho';
    if (location === '/checkout') return 'Checkout';
    if (location.startsWith('/order-review')) return 'Revisar Pedido';
    if (location === '/menu') return 'Menu';
    return brandingData?.name || '';
  };

  const showBackButton = location !== '/';

  const goBack = () => {
    if (location === '/checkout') {
      navigate('/cart');
    } else if (location.startsWith('/order-review')) {
      navigate('/checkout');
    } else if (location === '/menu') {
      navigate('/');
    } else {
      navigate('/');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border px-4 py-3">
      <div className="flex items-center justify-between">
        {showBackButton ? (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={goBack}
            className="text-foreground hover:text-primary transition-colors p-2 -ml-2"
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        ) : (
          <div className="w-10" />
        )}
        
        {isLoading ? (
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" data-testid="skeleton-header-title"></div>
        ) : (
          <h1 className="text-xl font-bold text-foreground" data-testid="text-header-title">
            {getTitle()}
          </h1>
        )}
        
        <div className="w-10" />
      </div>

      {/* Side Menu Overlay */}
      {showSideMenu && (
        <div className="fixed inset-0 z-50" data-testid="overlay-sidemenu">
          <div 
            className="fixed inset-0 bg-black/50" 
            onClick={() => setShowSideMenu(false)}
          />
          <div className="fixed right-0 top-0 h-full w-80 bg-background shadow-xl transform transition-transform duration-300">
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-foreground">Menu</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSideMenu(false)}
                  className="text-muted-foreground hover:text-foreground p-2"
                  data-testid="button-close-menu"
                >
                  ×
                </Button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-foreground mb-3">Categorias</h4>
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 p-3"
                      onClick={() => {
                        navigate('/category/entradas');
                        setShowSideMenu(false);
                      }}
                      data-testid="button-nav-entradas"
                    >
                      <div className="w-1 h-6 bg-orange-500 rounded" />
                      <span className="font-medium">ENTRADAS</span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 p-3"
                      onClick={() => {
                        navigate('/category/salgadas');
                        setShowSideMenu(false);
                      }}
                      data-testid="button-nav-salgadas-pizzas"
                    >
                      <div className="w-1 h-6 bg-primary rounded" />
                      <span className="font-medium">PIZZAS SALGADAS</span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 p-3"
                      onClick={() => {
                        navigate('/category/doces');
                        setShowSideMenu(false);
                      }}
                      data-testid="button-nav-doces-pizzas"
                    >
                      <div className="w-1 h-6 bg-accent rounded" />
                      <span className="font-medium">PIZZAS DOCES</span>
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 p-3"
                      onClick={() => {
                        navigate('/category/bebidas');
                        setShowSideMenu(false);
                      }}
                      data-testid="button-nav-bebidas"
                    >
                      <div className="w-1 h-6 bg-blue-500 rounded" />
                      <span className="font-medium">BEBIDAS</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
