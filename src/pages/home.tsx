import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, Circle } from 'lucide-react';
import { useLocation } from 'wouter';
import { getApiUrl } from '@/lib/api-config';

// Horários de funcionamento da pizzaria
const OPENING_HOURS = {
  // Horário: 18:00 às 23:00 (todos os dias)
  open: 18, // 18:00
  close: 23 // 23:00
};

function useRestaurantStatus() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const checkStatus = () => {
      const now = new Date();
      const currentHour = now.getHours();
      
      // Verifica se está dentro do horário de funcionamento
      const isCurrentlyOpen = currentHour >= OPENING_HOURS.open && currentHour < OPENING_HOURS.close;
      setIsOpen(isCurrentlyOpen);
      
    };

    // Verifica status inicial
    checkStatus();
    
    // Atualiza a cada minuto
    const interval = setInterval(checkStatus, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return isOpen;
}

interface BrandingData {
  name: string;
  slogan: string;
  logoUrl: string;
  backgroundUrl: string;
}

export default function Home() {
  const [, navigate] = useLocation();
  const isOpen = useRestaurantStatus();
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
              slogan: settings.branding.slogan,
              logoUrl: settings.branding.logo,
              backgroundUrl: settings.branding.backgroundUrl
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

  return (
    <div className="p-4 fade-in" data-testid="page-home">
      {/* Hero Section */}
      {isLoading ? (
        <div className="relative rounded-lg overflow-hidden mb-6 h-64 bg-gray-200 animate-pulse" data-testid="hero-skeleton">
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
            <div className="flex items-end gap-3 sm:gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-300 rounded-lg animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-6 w-32 bg-gray-300 rounded animate-pulse"></div>
                <div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div 
          className="relative rounded-lg overflow-hidden mb-6 h-64"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${brandingData?.backgroundUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
          data-testid="hero-section"
        >
        {/* Status - Estamos Abertos/Fechados */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
          <div className="bg-white rounded-full px-2 py-1 sm:px-3 sm:py-2 flex items-center gap-1 sm:gap-2 shadow-lg" data-testid={isOpen ? "status-open" : "status-closed"}>
            <Circle className={`w-2 h-2 sm:w-3 sm:h-3 ${isOpen ? 'text-green-500 fill-green-500' : 'text-red-500 fill-red-500'}`} />
            <span className="text-xs sm:text-sm font-medium text-gray-800">
              {isOpen ? 'Estamos abertos!' : 'Estamos fechados!'}
            </span>
          </div>
        </div>
        
        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
          <div className="flex items-end justify-between">
            {/* Logo and Text */}
            <div className="flex items-end gap-3 sm:gap-4">
              {brandingData?.logoUrl && (
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-lg p-1.5 sm:p-2 shadow-lg">
                  <img 
                    src={brandingData.logoUrl} 
                    alt={`${brandingData.name} Logo`} 
                    className="w-full h-full object-contain"
                    data-testid="img-logo"
                  />
                </div>
              )}
              <div className="text-white mb-1 sm:mb-2">
                {brandingData?.name && (
                  <h1 className="text-xl sm:text-2xl font-bold mb-0.5 sm:mb-1" data-testid="text-pizzaria-title">
                    {brandingData.name}
                  </h1>
                )}
                {brandingData?.slogan && (
                  <p className="text-xs sm:text-sm opacity-90" data-testid="text-pizzaria-subtitle">
                    {brandingData.slogan}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        </div>
      )}
      {/* Entradas */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground" data-testid="text-entradas-title">Entradas</h3>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/category/entradas')}>
          <CardContent className="p-4" data-testid="card-entradas">
            <div className="flex items-center gap-4">
              <img 
                src="https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=120" 
                alt="Entradas" 
                className="w-16 h-16 rounded-lg object-cover"
                data-testid="img-entradas"
              />
              <div className="flex-1">
                <h4 className="font-semibold text-foreground" data-testid="text-entradas-title">
                  Entradas
                </h4>
                <p className="text-muted-foreground text-sm" data-testid="text-entradas-description">
                  Pão de Calabresa • Lascas de Massa
                </p>
                <p className="text-primary font-medium" data-testid="text-entradas-price">
                  A partir de R$ 12,00
                </p>
              </div>
              <ChevronRight className="text-muted-foreground h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Categories */}
      <div className="space-y-4 mt-8">
        <h3 className="text-xl font-semibold text-foreground" data-testid="text-categories-title">Pizzas</h3>
        
        {/* Pizzas Salgadas */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/category/salgadas')}>
          <CardContent className="p-4" data-testid="card-salgadas-pizzas">
            <div className="flex items-center gap-4">
              <img 
                src="https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=120" 
                alt="Pizza Salgada" 
                className="w-16 h-16 rounded-lg object-cover"
                data-testid="img-salgadas-pizza"
              />
              <div className="flex-1">
                <h4 className="font-semibold text-foreground" data-testid="text-salgadas-pizza-title">
                  Pizzas Salgadas
                </h4>
                <p className="text-muted-foreground text-sm" data-testid="text-salgadas-pizza-description">
                  Grande (8-9 fatias) • Individual (4 fatias)
                </p>
                <p className="text-primary font-medium" data-testid="text-salgadas-pizza-price">
                  A partir de R$ 18,00
                </p>
              </div>
              <ChevronRight className="text-muted-foreground h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Pizzas Doces */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/category/doces')}>
          <CardContent className="p-4" data-testid="card-doces-pizzas">
            <div className="flex items-center gap-4">
              <img 
                src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=120" 
                alt="Pizza Doce" 
                className="w-16 h-16 rounded-lg object-cover"
                data-testid="img-doces-pizza"
              />
              <div className="flex-1">
                <h4 className="font-semibold text-foreground" data-testid="text-doces-pizza-title">
                  Pizzas Doces
                </h4>
                <p className="text-muted-foreground text-sm" data-testid="text-doces-pizza-description">
                  Média (6 fatias) • Individual (4 fatias)
                </p>
                <p className="text-primary font-medium" data-testid="text-doces-pizza-price">
                  A partir de R$ 12,00
                </p>
              </div>
              <ChevronRight className="text-muted-foreground h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Bebidas */}
      <div className="space-y-4 mt-8">
        <h3 className="text-xl font-semibold text-foreground" data-testid="text-bebidas-title">Bebidas</h3>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/category/bebidas')}>
          <CardContent className="p-4" data-testid="card-bebidas">
            <div className="flex items-center gap-4">
              <img 
                src="https://images.unsplash.com/photo-1544145945-f90425340c7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=120" 
                alt="Bebidas" 
                className="w-16 h-16 rounded-lg object-cover"
                data-testid="img-bebidas"
              />
              <div className="flex-1">
                <h4 className="font-semibold text-foreground" data-testid="text-bebidas-title">
                  Bebidas
                </h4>
                <p className="text-muted-foreground text-sm" data-testid="text-bebidas-description">
                  Refrigerantes • Sucos • Águas
                </p>
                <p className="text-primary font-medium" data-testid="text-bebidas-price">
                  A partir de R$ 3,50
                </p>
              </div>
              <ChevronRight className="text-muted-foreground h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
