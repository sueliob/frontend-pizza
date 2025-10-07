import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PizzaFlavor } from '@/types';
import { Plus, Minus } from 'lucide-react';
import { ImageModal } from './image-modal';

interface PizzaCardProps {
  flavor: PizzaFlavor;
  quantity: number;
  price: number; // Preço calculado baseado no tamanho
  onIncrease: (flavor: PizzaFlavor) => void;
  onDecrease: (flavor: PizzaFlavor) => void;
  disabled?: boolean;
}

export default function PizzaCard({ flavor, quantity, price, onIncrease, onDecrease, disabled }: PizzaCardProps) {
  return (
    <Card className="bg-card border border-border rounded-lg" data-testid={`card-pizza-${flavor.id}`}>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <ImageModal
            imageUrl={flavor.imageUrl || 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400'}
            alt={flavor.name}
            trigger={
              <img 
                src={flavor.imageUrl || 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400'} 
                alt={flavor.name}
                className="w-20 h-20 rounded-lg object-cover pizza-image cursor-pointer hover:opacity-80 transition-opacity"
                data-testid={`img-pizza-${flavor.id}`}
              />
            }
          />
          <div className="flex-1">
            <h4 className="font-semibold text-foreground" data-testid={`text-pizza-name-${flavor.id}`}>
              {flavor.name}
            </h4>
            <p className="text-muted-foreground text-sm mb-2" data-testid={`text-pizza-description-${flavor.id}`}>
              {flavor.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-primary font-bold" data-testid={`text-pizza-price-${flavor.id}`}>
                R$ {price.toFixed(2)}
              </span>
              <div className="flex items-center gap-3">
                <span className="font-medium" data-testid={`text-flavor-quantity-${flavor.id}`}>
                  {quantity}
                </span>
                {quantity > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-8 h-8 rounded-full p-0"
                    onClick={() => onDecrease(flavor)}
                    data-testid={`button-flavor-decrease-${flavor.id}`}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                )}
                <Button
                  variant="default"
                  size="sm"
                  className="w-8 h-8 rounded-full p-0 bg-primary text-primary-foreground"
                  onClick={() => onIncrease(flavor)}
                  disabled={disabled}
                  data-testid={`button-flavor-add-${flavor.id}`}
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
}
