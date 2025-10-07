import { useState, useEffect, useRef } from 'react';
import { useRoute, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { getDoughTypes, getExtras } from '../lib/api-config';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/lib/cart-store';
import PizzaCard from '@/components/pizza-card';
import { ImageModal } from '@/components/image-modal';
import { PizzaFlavor, CartItem } from '@/types';
import { Plus, Minus } from 'lucide-react';

// Função utilitária para extrair preço baseado no tamanho
const getPrice = (flavor: PizzaFlavor, size: 'grande' | 'media' | 'individual'): number => {
  if (typeof flavor.prices === 'object' && flavor.prices) {
    const prices = flavor.prices as Record<string, string>;
    const priceStr = prices[size] || prices.individual || '0';
    return parseFloat(priceStr);
  }
  return 0;
};

interface SelectedFlavor {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface DoughType {
  id: string;
  name: string;
  price: number;
}

interface Extra {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function Category() {
  const [, params] = useRoute('/category/:category');
  const { category } = params || {};
  const { toast } = useToast();
  const { addItem } = useCart();
  
  
  // Check if this is a drinks or appetizers category (simple interface)
  const isSimpleCategory = category === 'bebidas' || category === 'entradas';
  
  const [selectedSize, setSelectedSize] = useState<1 | 2 | 3>(1);
  const [selectedFlavors, setSelectedFlavors] = useState<SelectedFlavor[]>([]);
  const [selectedType, setSelectedType] = useState<'grande' | 'media' | 'individual'>('grande');
  const [selectedDough, setSelectedDough] = useState<DoughType | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<Extra[]>([]);
  const [selectedDrinks, setSelectedDrinks] = useState<{id: string, name: string, price: number, quantity: number}[]>([]);
  const [observations, setObservations] = useState<string>('');
  
  // Refs for auto-navigation
  const flavorsRef = useRef<HTMLDivElement>(null);
  const doughRef = useRef<HTMLDivElement>(null);
  const extrasRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLDivElement>(null);
  
  // Auto-navigation function with delay
  const scrollToSection = (ref: React.RefObject<HTMLDivElement>, delay = 800) => {
    setTimeout(() => {
      if (ref.current) {
        ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, delay);
  };
  const [drinkObservations, setDrinkObservations] = useState<string>('');

  // Buscar tipos de massa da API
  const { data: allDoughTypes = [] } = useQuery({
    queryKey: ['/dough-types'],
    queryFn: getDoughTypes,
  });

  // Buscar extras da API  
  const { data: allExtras = [] } = useQuery({
    queryKey: ['/extras'],
    queryFn: getExtras,
  });

  // Filtrar tipos de massa por categoria
  const doughTypes = (allDoughTypes || [])
    .filter((dough: any) => {
      if (category === 'salgadas') {
        return dough.category === 'salgada' || dough.category === 'salgadas';
      } else {
        return dough.category === 'doce' || dough.category === 'doces';
      }
    })
    .map((dough: any) => ({
      id: dough.id.toString(),
      name: dough.name,
      price: parseFloat(dough.price) || 0
    }));

  // Filtrar extras por categoria
  const availableExtras = (allExtras || [])
    .filter((extra: any) => {
      if (category === 'salgadas') {
        return extra.category === 'salgada' || extra.category === 'salgadas';
      } else {
        return extra.category === 'doce' || extra.category === 'doces';
      }
    })
    .map((extra: any) => ({
      id: extra.id.toString(),
      name: extra.name,
      price: parseFloat(extra.price) || 0
    }));

  // Configure based on category
  const availableTypes = category === 'salgadas' ? ['grande', 'individual'] : ['media', 'individual'];
  const maxFlavors = selectedType === 'individual' ? 2 : (category === 'doces' ? 2 : 3);
  const availableSizes = selectedType === 'individual' ? [1, 2] : (category === 'doces' ? [1, 2] : [1, 2, 3]);

  const { data: allFlavors, isLoading } = useQuery<PizzaFlavor[]>({
    queryKey: ['/flavors', category],
    enabled: !!category,
  });

  // For simple categories, show all flavors; for pizzas, all flavors support multiple sizes
  const flavors = allFlavors || [];

  // Reset selection when category or type changes
  useEffect(() => {
    setSelectedFlavors([]);
    setSelectedSize(1);
    // Reset dough selection when category changes
    setSelectedDough(null); // Let user choose dough type manually
    setSelectedExtras([]);
    setObservations('');
  }, [category, selectedType]);

  // Set default type when category changes
  useEffect(() => {
    if (category === 'salgadas') {
      setSelectedType('grande');
    } else if (category === 'doces') {
      setSelectedType('media');
    }
  }, [category]);

  const handleSizeSelect = (size: 1 | 2 | 3) => {
    setSelectedSize(size);
    setSelectedFlavors([]);
  };

  const handleFlavorIncrease = (flavor: PizzaFlavor) => {
    const existingFlavor = selectedFlavors.find(f => f.id === flavor.id);
    const totalQuantity = selectedFlavors.reduce((sum, f) => sum + f.quantity, 0);
    
    if (existingFlavor) {
      // Increase quantity of existing flavor
      if (totalQuantity < selectedSize) {
        setSelectedFlavors(prev => 
          prev.map(f => 
            f.id === flavor.id 
              ? { ...f, quantity: f.quantity + 1 }
              : f
          )
        );
        // Check if limit reached after update
        if (totalQuantity + 1 === selectedSize) {
          scrollToSection(doughRef);
        }
      } else {
        toast({
          title: "Limite atingido",
          description: `Você já selecionou o máximo de ${selectedSize} sabor${selectedSize > 1 ? 'es' : ''}.`,
          variant: "destructive",
        });
      }
    } else {
      // Add new flavor
      if (totalQuantity < selectedSize) {
        setSelectedFlavors(prev => [...prev, {
          id: flavor.id,
          name: flavor.name,
          price: getPrice(flavor, selectedType),
          quantity: 1,
        }]);
        // Check if limit reached after adding new flavor
        if (totalQuantity + 1 === selectedSize) {
          scrollToSection(doughRef);
        }
      } else {
        toast({
          title: "Limite atingido",
          description: `Você já selecionou o máximo de ${selectedSize} sabor${selectedSize > 1 ? 'es' : ''}.`,
          variant: "destructive",
        });
      }
    }
  };

  const handleFlavorDecrease = (flavor: PizzaFlavor) => {
    setSelectedFlavors(prev => {
      const updated = prev.map(f => 
        f.id === flavor.id 
          ? { ...f, quantity: f.quantity - 1 }
          : f
      ).filter(f => f.quantity > 0);
      return updated;
    });
  };

  const handleExtraSelect = (extra: { id: string; name: string; price: number }) => {
    const existingExtra = selectedExtras.find(e => e.id === extra.id);
    
    if (existingExtra) {
      // Increase quantity
      if (existingExtra.quantity < 3) {
        setSelectedExtras(prev => 
          prev.map(e => 
            e.id === extra.id 
              ? { ...e, quantity: e.quantity + 1 }
              : e
          )
        );
      } else {
        toast({
          title: "Limite atingido",
          description: "Máximo 3 unidades por extra.",
          variant: "destructive",
        });
      }
    } else {
      // Add new extra
      if (selectedExtras.length < 3) {
        const isFirstExtra = selectedExtras.length === 0;
        setSelectedExtras(prev => [...prev, {
          id: extra.id,
          name: extra.name,
          price: extra.price,
          quantity: 1,
        }]);
        // Navigate to confirmation section when first extra is added
        if (isFirstExtra) {
          scrollToSection(confirmRef, 1200); // Longer delay for extras
        }
      } else {
        toast({
          title: "Limite atingido",
          description: "Máximo 3 tipos de extras.",
          variant: "destructive",
        });
      }
    }
  };

  const handleExtraDecrease = (extraId: string) => {
    setSelectedExtras(prev => {
      const updated = prev.map(e => 
        e.id === extraId 
          ? { ...e, quantity: e.quantity - 1 }
          : e
      ).filter(e => e.quantity > 0);
      return updated;
    });
  };

  const addToCart = () => {
    if (selectedFlavors.length === 0) {
      toast({
        title: "Selecione os sabores",
        description: "Você precisa selecionar pelo menos um sabor.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedDough) {
      toast({
        title: "Selecione o tipo de massa",
        description: "Você precisa escolher um tipo de massa.",
        variant: "destructive",
      });
      return;
    }

    // Calculate price based on the most expensive flavor + dough + extras
    const maxFlavorPrice = Math.max(...selectedFlavors.map(f => f.price));
    const extrasPrice = selectedExtras.reduce((total, extra) => total + (extra.price * extra.quantity), 0);
    const totalPrice = maxFlavorPrice + selectedDough.price + extrasPrice;
    
    const slices = selectedType === 'individual' ? 4 : (selectedType === 'media' ? 6 : (selectedSize === 3 ? 9 : 8));

    const cartItem: CartItem = {
      id: Date.now().toString(),
      size: selectedSize.toString() as "1" | "2" | "3",
      type: selectedType,
      category: category as "salgadas" | "doces",
      slices,
      flavors: selectedFlavors.flatMap(f => Array(f.quantity).fill({ id: f.id, name: f.name, price: f.price })),
      doughType: selectedDough,
      extras: selectedExtras,
      observations: observations.trim() || undefined,
      price: totalPrice,
      quantity: 1,
    };

    addItem(cartItem);
    
    // Reset selection
    setSelectedFlavors([]);
    setSelectedDough(null);
    setSelectedExtras([]);
    setObservations('');
    
    const totalFlavors = selectedFlavors.reduce((sum, f) => sum + f.quantity, 0);
    toast({
      title: "Adicionado ao carrinho!",
      description: `Pizza ${selectedType === 'grande' ? 'Grande' : selectedType === 'media' ? 'Média' : 'Individual'} com ${totalFlavors} sabor${totalFlavors > 1 ? 'es' : ''} adicionada.`,
    });
  };

  const getTotalPrice = () => {
    if (selectedFlavors.length === 0) return 0;
    const maxFlavorPrice = Math.max(...selectedFlavors.map(f => f.price));
    const doughPrice = selectedDough?.price || 0;
    const extrasPrice = selectedExtras.reduce((total, extra) => total + (extra.price * extra.quantity), 0);
    return maxFlavorPrice + doughPrice + extrasPrice;
  };

  const handleDrinkSelect = (drink: PizzaFlavor) => {
    setSelectedDrinks(prev => {
      const existing = prev.find(d => d.id === drink.id);
      if (existing) {
        return prev.map(d => 
          d.id === drink.id ? { ...d, quantity: d.quantity + 1 } : d
        );
      } else {
        return [...prev, { 
          id: drink.id, 
          name: drink.name, 
          price: getPrice(drink, 'individual'), 
          quantity: 1 
        }];
      }
    });
  };

  const handleDrinkDecrease = (drinkId: string) => {
    setSelectedDrinks(prev => {
      return prev.map(drink => 
        drink.id === drinkId 
          ? { ...drink, quantity: Math.max(0, drink.quantity - 1) }
          : drink
      ).filter(drink => drink.quantity > 0);
    });
  };

  const addDrinksToCart = () => {
    selectedDrinks.forEach(drink => {
      for (let i = 0; i < drink.quantity; i++) {
        const cartItem: CartItem = {
          id: `${Date.now()}-${i}`,
          size: "1" as "1" | "2" | "3",
          type: "individual" as "grande" | "media" | "individual",
          category: category as "salgadas" | "doces" | "entradas" | "bebidas",
          slices: 1,
          flavors: [{
            id: drink.id,
            name: drink.name,
            price: drink.price,
          }],
          doughType: {
            id: 'none',
            name: 'N/A',
            price: 0,
          },
          extras: [],
          observations: drinkObservations || undefined,
          price: drink.price,
          quantity: 1,
        };

        addItem(cartItem);
      }
    });
    
    const totalItems = selectedDrinks.reduce((sum, drink) => sum + drink.quantity, 0);
    
    toast({
      title: "Bebidas adicionadas!",
      description: `${totalItems} bebida(s) adicionada(s) ao carrinho.`,
    });
    
    setSelectedDrinks([]);
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-muted animate-pulse rounded-lg h-24" />
          ))}
        </div>
      </div>
    );
  }

  // Render simple category page (drinks or appetizers)
  if (isSimpleCategory) {
    return (
      <div className="p-4 fade-in" data-testid={`page-category-${category}`}>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="text-category-title">
            {category === 'bebidas' ? 'Bebidas' : 'Entradas'}
          </h2>
          <p className="text-muted-foreground" data-testid="text-category-description">
            {category === 'bebidas' 
              ? 'Escolha suas bebidas favoritas para acompanhar seu pedido.'
              : 'Deliciosas entradas para começar sua refeição.'}
          </p>
        </div>

        {/* Items List */}
        <Card className="mb-6" data-testid={`card-${category}-selection`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold text-foreground" data-testid={`text-${category}-title`}>
                {category === 'bebidas' ? 'BEBIDAS' : 'ENTRADAS'}
              </h4>
            </div>
            <div className="space-y-4">
              {flavors && flavors.map((item: PizzaFlavor) => {
                const quantity = selectedDrinks.find(d => d.id === item.id)?.quantity || 0;
                
                return (
                  <Card key={item.id} className="bg-card border border-border rounded-lg" data-testid={`item-${category}-${item.id}`}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <ImageModal
                          imageUrl={item.imageUrl || 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400'}
                          alt={item.name}
                          trigger={
                            <img 
                              src={item.imageUrl || 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400'} 
                              alt={item.name}
                              className="w-20 h-20 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity"
                              data-testid={`img-${category}-${item.id}`}
                            />
                          }
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground" data-testid={`text-${category}-name-${item.id}`}>
                            {item.name}
                          </h4>
                          <p className="text-muted-foreground text-sm mb-2" data-testid={`text-${category}-description-${item.id}`}>
                            {item.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-primary font-bold" data-testid={`text-${category}-price-${item.id}`}>
                              R$ {getPrice(item, 'individual').toFixed(2)}
                            </span>
                            <div className="flex items-center gap-3">
                              <span className="font-medium" data-testid={`text-${category}-quantity-${item.id}`}>
                                {quantity}
                              </span>
                              {quantity > 0 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-8 h-8 rounded-full p-0"
                                  onClick={() => handleDrinkDecrease(item.id)}
                                  data-testid={`button-${category}-decrease-${item.id}`}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                variant="default"
                                size="sm"
                                className="w-8 h-8 rounded-full p-0 bg-primary text-primary-foreground"
                                onClick={() => handleDrinkSelect(item)}
                                data-testid={`button-${category}-add-${item.id}`}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
        
        {/* Observations */}
        <Card className="mt-6" data-testid={`card-${category}-observations`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold text-foreground" data-testid="text-observations-title">
                OBSERVAÇÕES
              </h4>
              <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded">
                Opcional
              </span>
            </div>
            <Textarea
              placeholder={category === 'bebidas' 
                ? 'Ex: Coca-Cola bem gelada, gelo à parte...'
                : 'Ex: Pão bem quente, sem cebola...'}
              value={drinkObservations}
              onChange={(e) => setDrinkObservations(e.target.value)}
              className="min-h-20 resize-none"
              data-testid={`textarea-${category}-observations`}
            />
          </CardContent>
        </Card>
        
        {selectedDrinks.length > 0 && (
          <div className="mt-6">
            <Button
              onClick={addDrinksToCart}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold transition-colors hover:bg-primary/90"
              data-testid={`button-add-${category}-to-cart`}
            >
              Adicionar {selectedDrinks.reduce((sum, item) => sum + item.quantity, 0)} {category === 'bebidas' ? 'bebida(s)' : 'entrada(s)'} ao carrinho
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 fade-in" data-testid={`page-category-${category}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="text-category-title">
          Pizzas {category === 'salgadas' ? 'Salgadas' : 'Doces'}
        </h2>
        <p className="text-muted-foreground" data-testid="text-category-description">
          {(selectedType === 'individual' || (category === 'doces' && selectedType === 'media'))
            ? 'Escolha entre 1 ou 2 sabores. Preço baseado no sabor mais caro.'
            : 'Escolha entre 1, 2 ou 3 sabores. Preço baseado no sabor mais caro.'
          }
        </p>
      </div>

      {/* Type Selection */}
      <div className="mb-6">
        <div className="grid grid-cols-2 gap-3">
          {availableTypes.map((type) => {
            const typeLabels = {
              'grande': { label: 'Grande', slices: '8-9 fatias' },
              'media': { label: 'Média', slices: '6 fatias' },
              'individual': { label: 'Individual', slices: '4 fatias' }
            };
            return (
              <Button
                key={type}
                variant={selectedType === type ? "default" : "outline"}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  selectedType === type 
                    ? 'border-primary bg-primary text-primary-foreground' 
                    : 'border-border bg-card text-foreground hover:border-primary/50'
                }`}
                onClick={() => setSelectedType(type as 'grande' | 'media' | 'individual')}
                data-testid={`button-type-${type}`}
              >
                <div className="font-semibold text-sm">
                  {typeLabels[type as keyof typeof typeLabels].label}
                </div>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Size Options */}
      <div className="flex gap-3 mb-6">
        {availableSizes.map((size) => (
          <Button
            key={size}
            variant={selectedSize === size ? "default" : "outline"}
            className={`flex-1 p-3 rounded-lg border-2 text-center transition-all ${
              selectedSize === size 
                ? 'border-primary bg-primary/10 text-primary' 
                : 'border-border bg-card text-foreground hover:border-primary/50'
            }`}
            onClick={() => handleSizeSelect(size as 1 | 2 | 3)}
            data-testid={`button-size-${size}`}
          >
            <div className="font-semibold">
              {size} Sabor{size > 1 ? 'es' : ''}
            </div>
          </Button>
        ))}
      </div>

      {/* Sabores Selection Box */}
      <Card className="mb-6" data-testid="card-sabores-selection">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-green-600" data-testid="text-sabores-instruction">
              Escolha até {selectedSize} {selectedSize === 1 ? 'opção' : 'opções'}
            </p>
            <span className="text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded">
              Obrigatório
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Pizza Flavors */}

      <div ref={flavorsRef} className="space-y-4 mb-6" data-testid="list-pizza-flavors">
        {flavors && flavors.map((flavor: PizzaFlavor) => {
          const selectedFlavor = selectedFlavors.find(f => f.id === flavor.id);
          const quantity = selectedFlavor?.quantity || 0;
          const totalQuantity = selectedFlavors.reduce((sum, f) => sum + f.quantity, 0);
          const disabled = totalQuantity >= selectedSize && quantity === 0;
          
          return (
            <PizzaCard
              key={flavor.id}
              flavor={flavor}
              quantity={quantity}
              price={getPrice(flavor, selectedType)}
              onIncrease={handleFlavorIncrease}
              onDecrease={handleFlavorDecrease}
              disabled={disabled}
            />
          );
        })}
      </div>

      {/* Dough Type Selection */}
      <Card ref={doughRef} className="mb-6" data-testid="card-dough-selection">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-semibold text-foreground" data-testid="text-dough-title">
              TIPO DE MASSA
            </h4>
            <span className="text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded">
              Obrigatório
            </span>
          </div>
          <p className="text-sm text-primary mb-4">
            Escolha até 1 opção
          </p>
          <div className="space-y-3">
            {doughTypes.map((dough: DoughType) => {
              const isSelected = selectedDough?.id === dough.id;
              const quantity = isSelected ? 1 : 0;
              
              return (
                <Card key={dough.id} className="bg-card border border-border rounded-lg" data-testid={`card-dough-${dough.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground" data-testid={`text-dough-name-${dough.id}`}>
                          {dough.name.toUpperCase()}
                        </h4>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-primary font-bold" data-testid={`text-dough-price-${dough.id}`}>
                            R$ {dough.price.toFixed(2)}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="font-medium" data-testid={`text-dough-quantity-${dough.id}`}>
                              {quantity}
                            </span>
                            {quantity > 0 && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-8 h-8 rounded-full p-0"
                                onClick={() => setSelectedDough(null)}
                                data-testid={`button-dough-decrease-${dough.id}`}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="default"
                              size="sm"
                              className="w-8 h-8 rounded-full p-0 bg-primary text-primary-foreground"
                              onClick={() => {
                                setSelectedDough(dough);
                                scrollToSection(extrasRef);
                              }}
                              disabled={isSelected}
                              data-testid={`button-dough-add-${dough.id}`}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Extras Selection */}
      <Card ref={extrasRef} className="mb-6" data-testid="card-extras-selection">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-semibold text-foreground" data-testid="text-extras-title">
              EXTRA
            </h4>
            <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded">
              Opcional
            </span>
          </div>
          <p className="text-sm text-primary mb-4">
            Escolha até 3 opções
          </p>
          <div className="space-y-3">
            {availableExtras.map((extra: Extra) => {
              const selectedExtra = selectedExtras.find(e => e.id === extra.id);
              const quantity = selectedExtra?.quantity || 0;
              
              return (
                <div key={extra.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-semibold text-foreground text-sm">
                      {extra.name.toUpperCase()}
                    </div>
                    <div className="text-primary text-sm">
                      R$ {extra.price.toFixed(2)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium" data-testid={`text-extra-quantity-${extra.id}`}>
                      {quantity}
                    </span>
                    {quantity > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-8 h-8 rounded-full p-0"
                        onClick={() => handleExtraDecrease(extra.id)}
                        data-testid={`button-extra-decrease-${extra.id}`}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="default"
                      size="sm"
                      className="w-8 h-8 rounded-full p-0 bg-primary text-primary-foreground"
                      onClick={() => handleExtraSelect(extra)}
                      data-testid={`button-extra-add-${extra.id}`}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Observations */}
      <Card className="mb-6" data-testid="card-observations">
        <CardContent className="p-4">
          <h4 className="text-lg font-semibold text-foreground mb-3" data-testid="text-observations-title">
            Observações
          </h4>
          <p className="text-sm text-muted-foreground mb-4">
            Possu alguma observação para incluir no seu pedido?
          </p>
          <Textarea
            placeholder="Ex: Tirar a cebola, pouco molho, etc."
            value={observations}
            onChange={(e) => {
              const text = e.target.value;
              if (text.length <= 250) {
                setObservations(text);
              }
            }}
            className="min-h-[100px] resize-none bg-[#f1f5f9]"
            data-testid="textarea-observations"
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-muted-foreground" data-testid="text-char-count">
              {observations.length}/250 caracteres
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Selected Flavors Display */}
      {selectedFlavors.length > 0 && (
        <Card ref={confirmRef} className="bg-muted" data-testid="card-selected-flavors">
          <CardContent className="p-4">
            <h4 className="font-semibold text-foreground mb-3" data-testid="text-selected-flavors-title">
              Sabores Selecionados
            </h4>
            <div className="space-y-2 mb-4">
              {selectedFlavors.map((flavor) => (
                <div key={flavor.id} className="flex justify-between items-center text-sm">
                  <span className="capitalize" data-testid={`text-selected-flavor-${flavor.id}`}>
                    {selectedFlavors.length === 1 ? `${flavor.quantity}x` : `1/${selectedFlavors.length}`} {flavor.name}
                  </span>
                  <span data-testid={`text-selected-price-${flavor.id}`}>
                    R$ {flavor.price.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-foreground" data-testid="text-total-price">
                Total: R$ {getTotalPrice().toFixed(2)}
              </span>
              <Button 
                onClick={addToCart}
                className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                data-testid="button-add-to-cart"
              >
                Adicionar ao Carrinho
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
