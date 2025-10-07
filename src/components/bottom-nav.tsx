import { Button } from '@/components/ui/button';
import { Menu, ShoppingCart, Home } from 'lucide-react';
import { useLocation } from 'wouter';
import { useCart } from '@/lib/cart-store';

export default function BottomNav() {
  const [, navigate] = useLocation();
  const { totalItems } = useCart();

  return (
    <div 
      className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-background border-t border-border px-4 py-2"
      data-testid="bottom-nav"
    >
      <div className="flex items-center justify-around">
        <Button
          variant="ghost"
          className="flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-primary transition-colors"
          onClick={() => navigate('/menu')}
          data-testid="button-nav-menu"
        >
          <Menu className="h-5 w-5" />
          <span className="text-xs">Menu</span>
        </Button>
        
        <Button
          variant="ghost"
          className="flex flex-col items-center gap-1 p-2 relative"
          onClick={() => navigate('/cart')}
          data-testid="button-nav-cart"
        >
          <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center relative">
            <ShoppingCart className="text-primary-foreground h-5 w-5" />
            {totalItems > 0 && (
              <span 
                className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs rounded-full w-6 h-6 flex items-center justify-center"
                data-testid="text-nav-cart-count"
              >
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-xs text-primary font-medium">Carrinho</span>
        </Button>
        
        <Button
          variant="ghost"
          className="flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-primary transition-colors"
          onClick={() => navigate('/')}
          data-testid="button-nav-return"
        >
          <Home className="h-5 w-5" />
          <span className="text-xs">Retornar</span>
        </Button>
      </div>
    </div>
  );
}
