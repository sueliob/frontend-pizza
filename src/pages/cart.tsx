import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import { useLocation } from 'wouter';
import { useCart } from '@/lib/cart-store';

export default function Cart() {
  const [, navigate] = useLocation();
  const { state, removeItem, updateQuantity, subtotal } = useCart();
  
  const getSizeInPortuguese = (type: string) => {
    const sizeMap: { [key: string]: string } = {
      'large': 'GRANDE',
      'medium': 'MÉDIA',
      'small': 'PEQUENA'
    };
    return sizeMap[type.toLowerCase()] || type.toUpperCase();
  };

  if (state.items.length === 0) {
    return (
      <div className="p-4" data-testid="page-cart-empty">
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2" data-testid="text-empty-cart-title">
            Seu carrinho está vazio
          </h3>
          <p className="text-muted-foreground mb-6" data-testid="text-empty-cart-description">
            Inclua produtos para prosseguir com sua compra
          </p>
          <Button 
            onClick={() => navigate('/')}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            data-testid="button-return-to-menu"
          >
            Retornar para os produtos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-32 fade-in" data-testid="page-cart">
      <h2 className="text-2xl font-bold text-foreground mb-6" data-testid="text-cart-title">
        Carrinho
      </h2>
      
      <div className="space-y-4 mb-6" data-testid="list-cart-items">
        {state.items.map((item) => {
          const flavorNames = item.flavors.map(f => f.name).join(', ');
          
          return (
            <Card key={item.id} className="bg-card border border-border rounded-lg">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <img 
                    src="https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400" 
                    alt="Pizza" 
                    className="w-16 h-16 rounded-lg object-cover"
                    data-testid={`img-cart-item-${item.id}`}
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground" data-testid={`text-cart-item-title-${item.id}`}>
                      {item.category === 'entradas' ? 'ENTRADA:' : 
                       item.category === 'bebidas' ? 'BEBIDA:' : 
                       (() => {
                         const flavorCount = item.flavors.length;
                         const sizeText = getSizeInPortuguese(item.type).toUpperCase();
                         if (flavorCount === 1) {
                           return `${sizeText} (${item.slices} FATIAS)`;
                         } else {
                           return `${sizeText} ${flavorCount} SABORES (${item.slices} FATIAS)`;
                         }
                       })()
                      }
                    </h4>
                    <div className="text-muted-foreground text-sm capitalize mb-1" data-testid={`text-cart-item-flavors-${item.id}`}>
                      {item.category === 'entradas' || item.category === 'bebidas' 
                        ? flavorNames 
                        : item.flavors.map((flavor, index) => {
                            const flavorCount = item.flavors.length;
                            const fraction = flavorCount === 1 ? '' : flavorCount === 2 ? '1/2 ' : '1/3 ';
                            return (
                              <div key={index}>
                                {fraction}{flavor.name}
                              </div>
                            );
                          })}
                    </div>
                    {item.doughType && item.category !== 'entradas' && item.category !== 'bebidas' && (
                      <p className="text-muted-foreground text-xs mb-1" data-testid={`text-cart-item-dough-${item.id}`}>
                        Massa: {item.doughType.name}
                      </p>
                    )}
                    {item.extras && item.extras.length > 0 && (
                      <p className="text-muted-foreground text-xs mb-1" data-testid={`text-cart-item-extras-${item.id}`}>
                        Extras: {item.extras.map(extra => `${extra.name} (${extra.quantity}x)`).join(', ')}
                      </p>
                    )}
                    {item.observations && (
                      <p className="text-muted-foreground text-xs mb-2 italic" data-testid={`text-cart-item-observations-${item.id}`}>
                        Obs: {item.observations}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-primary font-bold" data-testid={`text-cart-item-price-${item.id}`}>
                        R$ {item.price.toFixed(2)}
                      </span>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-8 h-8 rounded-full"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          data-testid={`button-decrease-${item.id}`}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="font-medium" data-testid={`text-quantity-${item.id}`}>
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-8 h-8 rounded-full"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          data-testid={`button-increase-${item.id}`}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive/80 p-2"
                    onClick={() => removeItem(item.id)}
                    data-testid={`button-remove-${item.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Fixed Bottom Summary */}
      <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-background border-t border-border p-4">
        <div className="flex items-center justify-between text-lg font-bold text-foreground mb-6">
          <span>Subtotal:</span>
          <span data-testid="text-cart-subtotal">R$ {subtotal.toFixed(2)}</span>
        </div>
        <Button 
          onClick={() => navigate('/checkout')}
          className="w-full bg-primary text-primary-foreground py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          data-testid="button-proceed-checkout"
        >
          Prosseguir para o checkout
        </Button>
      </div>
    </div>
  );
}
