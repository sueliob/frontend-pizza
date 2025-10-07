import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Store, Truck, CreditCard, Banknote, QrCode } from 'lucide-react';
import { useLocation } from 'wouter';
import { useCart } from '@/lib/cart-store';
import { useToast } from '@/hooks/use-toast';
import { lookupCEP, formatCEP } from '@/lib/cep-service';
import { getApiUrl } from '@/lib/api-config';
// Schemas locais para validação

const checkoutSchema = z.object({
  customerName: z.string().min(1, 'Nome é obrigatório'),
  customerPhone: z.string().min(10, 'Telefone inválido'),
  deliveryMethod: z.enum(['pickup', 'delivery']),
  paymentMethod: z.enum(['debit', 'credit', 'cash', 'pix']),
  cep: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  notes: z.string().optional(),
}).refine((data) => {
  if (data.deliveryMethod === 'delivery') {
    return data.cep && data.street && data.number && data.neighborhood;
  }
  return true;
}, {
  message: 'Endereço completo é obrigatório para entrega',
  path: ['street'],
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const [, navigate] = useLocation();
  const { state: cartState, subtotal } = useCart();
  const { toast } = useToast();
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [deliveryDistance, setDeliveryDistance] = useState(0);
  const [isLoadingCEP, setIsLoadingCEP] = useState(false);
  const [lastCalculatedAddress, setLastCalculatedAddress] = useState('');

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: '',
      customerPhone: '',
      deliveryMethod: 'pickup',
      paymentMethod: 'debit',
      cep: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      notes: '',
    },
  });

  // Watch address fields for automatic calculation
  const watchedFields = form.watch(['cep', 'street', 'number', 'neighborhood', 'deliveryMethod']);

  // Automatic delivery calculation when address is complete
  useEffect(() => {
    const [cep, street, number, neighborhood, deliveryMethod] = watchedFields;
    
    if (deliveryMethod === 'pickup') {
      // Reset delivery fee for pickup
      setDeliveryFee(0);
      setDeliveryDistance(0);
      setLastCalculatedAddress('');
      return;
    }
    
    // Only calculate if delivery method is selected and all required fields are filled
    if (deliveryMethod === 'delivery' && cep && street && number && neighborhood && !isLoadingCEP) {
      const cleanCEP = cep.replace(/\D/g, '');
      const currentAddress = `${cleanCEP}-${street}-${number}-${neighborhood}`;
      
      // Only calculate if address changed and CEP is valid
      if (cleanCEP.length === 8 && currentAddress !== lastCalculatedAddress) {
        // Use timeout to debounce the calls
        const timeoutId = setTimeout(() => {
          setLastCalculatedAddress(currentAddress);
          handleDeliveryCalculation(cleanCEP);
        }, 800);
        
        return () => clearTimeout(timeoutId);
      }
    }
  }, [watchedFields, isLoadingCEP, lastCalculatedAddress]);

  const proceedToReview = (data: CheckoutForm) => {
    // Prepare order data for review
    const reviewData = {
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      deliveryMethod: data.deliveryMethod,
      address: data.deliveryMethod === 'delivery' ? {
        cep: data.cep!,
        street: data.street!,
        number: data.number!,
        complement: data.complement || '',
        neighborhood: data.neighborhood!,
      } : undefined,
      paymentMethod: getPaymentMethodLabel(data.paymentMethod),
      deliveryFee,
      notes: data.notes || '',
    };

    // Navigate to review page with encoded data
    const encodedData = encodeURIComponent(JSON.stringify(reviewData));
    navigate(`/order-review/${encodedData}`);
  };

  const handleCEPSearch = async (cep: string) => {
    const cleanCEP = cep.replace(/\D/g, '');
    if (cleanCEP.length !== 8) return;

    setIsLoadingCEP(true);
    try {
      // Buscar apenas endereço no ViaCEP (sem calcular taxa ainda)
      const viacepResponse = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
      const data = await viacepResponse.json();
      
      if (data.erro) {
        throw new Error('CEP não encontrado');
      }
      
      // Preencher automaticamente os campos de endereço
      form.setValue('street', data.logradouro || '');
      form.setValue('neighborhood', data.bairro || '');
      
      toast({
        title: "Endereço encontrado!",
        description: `${data.logradouro}, ${data.bairro} - ${data.localidade}/${data.uf}`,
      });
      
      // Se já tem número, calcular taxa automaticamente
      const currentNumber = form.getValues('number');
      if (currentNumber && currentNumber.trim()) {
        setTimeout(() => handleDeliveryCalculation(cleanCEP), 500);
      }
    } catch (error) {
      toast({
        title: "CEP não encontrado",
        description: "Verifique o CEP e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingCEP(false);
    }
  };

  const handleDeliveryCalculation = async (cep: string) => {
    const cleanCEP = cep.replace(/\D/g, '');
    if (cleanCEP.length !== 8) return;

    setIsLoadingCEP(true);
    try {
      // Preparar dados completos do endereço para Google Maps
      const addressData = {
        street: form.getValues('street') || '',
        number: form.getValues('number') || '',
        neighborhood: form.getValues('neighborhood') || '',
        city: 'São Paulo', // Assumindo SP
        state: 'SP'
      };
      
      // Calcular taxa usando Google Maps (preciso) + fallback CEP
      const response = await fetch(getApiUrl('/calculate-distance'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          cep: cleanCEP, 
          address: addressData 
        })
      });
      
      if (!response.ok) {
        throw new Error('Erro ao calcular distância');
      }
      
      const data = await response.json();
      
      // Definir dados de entrega
      setDeliveryFee(parseFloat(data.deliveryFee));
      setDeliveryDistance(data.distance || 0);
      
      const method = data.usedGoogleMaps ? '🗺️ Google Maps' : '📍 CEP';
      
      toast({
        title: "Taxa calculada!",
        description: `${addressData.street}, ${addressData.neighborhood} • ${data.distance}km • ${data.estimatedTime} • Taxa: R$ ${data.deliveryFee} (${method})`,
      });
    } catch (error) {
      toast({
        title: "Erro no cálculo",
        description: "Não foi possível calcular a taxa de entrega.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingCEP(false);
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels = {
      debit: 'Cartão de débito',
      credit: 'Cartão de crédito',
      cash: 'Dinheiro',
      pix: 'Pix',
    };
    return labels[method as keyof typeof labels] || method;
  };

  const onSubmit = (data: CheckoutForm) => {
    proceedToReview(data);
  };

  const watchDeliveryMethod = form.watch('deliveryMethod');

  return (
    <div className="p-4 pb-32 fade-in" data-testid="page-checkout">
      <h2 className="text-2xl font-bold text-foreground mb-6" data-testid="text-checkout-title">
        Checkout
      </h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Delivery Method */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-4" data-testid="text-delivery-method-title">
              Selecione o método de entrega
            </h3>
            <FormField
              control={form.control}
              name="deliveryMethod"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="space-y-3"
                    >
                      <div className="flex items-center gap-4 p-4 border-2 border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors data-[state=checked]:border-primary data-[state=checked]:bg-primary/5">
                        <RadioGroupItem value="pickup" />
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Store className="text-primary h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground" data-testid="text-pickup-title">
                            Retirar no balcão
                          </h4>
                          <p className="text-muted-foreground text-sm" data-testid="text-pickup-description">
                            Retire o seu pedido em nosso endereço
                          </p>
                          <p className="text-primary font-bold" data-testid="text-pickup-price">
                            R$ 0,00
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 p-4 border-2 border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors data-[state=checked]:border-primary data-[state=checked]:bg-primary/5">
                        <RadioGroupItem value="delivery" />
                        <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                          <Truck className="text-accent h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground" data-testid="text-delivery-title">
                            Entrega no seu local
                          </h4>
                          <p className="text-muted-foreground text-sm" data-testid="text-delivery-description">
                            Selecione o seu endereço
                          </p>
                          <p className="text-accent font-bold" data-testid="text-delivery-price">
                            {deliveryFee > 0 ? `R$ ${deliveryFee.toFixed(2)}` : 'Calcular pela região'}
                          </p>
                        </div>
                      </div>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {/* Customer Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-4" data-testid="text-customer-info-title">
              Preencha com seus dados
            </h3>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seu nome</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Seu nome" 
                        className="bg-[#f1f5f9]"
                        {...field} 
                        data-testid="input-customer-name"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="customerPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seu Telefone</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="(11) 99999-9999" 
                        type="tel"
                        className="bg-[#f1f5f9]"
                        {...field} 
                        data-testid="input-customer-phone"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Address Form (shown when delivery is selected) */}
          {watchDeliveryMethod === 'delivery' && (
            <div className="mb-6" data-testid="section-address-form">
              <h3 className="text-lg font-semibold text-foreground mb-4" data-testid="text-address-title">
                Endereço de entrega
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="cep"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CEP</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="00000-000"
                            {...field}
                            onChange={(e) => {
                              const formatted = formatCEP(e.target.value);
                              field.onChange(formatted);
                            }}
                            onBlur={() => {
                              if (field.value && field.value.replace(/\D/g, '').length === 8) {
                                handleCEPSearch(field.value);
                              }
                            }}
                            data-testid="input-cep"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="button"
                    variant="secondary"
                    className="self-end"
                    disabled={isLoadingCEP}
                    onClick={() => handleDeliveryCalculation(form.getValues('cep') || '')}
                    data-testid="button-calculate-delivery"
                  >
                    {isLoadingCEP ? 'Calculando...' : 'Recalcular entrega'}
                  </Button>
                </div>
                
                <FormField
                  control={form.control}
                  name="street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rua</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Sua rua" 
                          {...field} 
                          data-testid="input-street"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Número" 
                            {...field}
                            onChange={(e) => {
                              field.onChange(e.target.value);
                              // Se CEP está preenchido e número foi inserido, calcular taxa
                              const currentCEP = form.getValues('cep');
                              if (e.target.value.trim() && currentCEP && currentCEP.replace(/\D/g, '').length === 8) {
                                setTimeout(() => handleDeliveryCalculation(currentCEP), 500);
                              }
                            }}
                            data-testid="input-number"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="complement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Complemento</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Apto, casa..." 
                            {...field} 
                            data-testid="input-complement"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="neighborhood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bairro</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Seu bairro" 
                          {...field} 
                          data-testid="input-neighborhood"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-4" data-testid="text-payment-method-title">
              Método de pagamento
            </h3>
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="space-y-3"
                    >
                      {[
                        { value: 'debit', icon: CreditCard, label: 'Cartão de débito' },
                        { value: 'credit', icon: CreditCard, label: 'Cartão de crédito' },
                        { value: 'cash', icon: Banknote, label: 'Dinheiro' },
                        { value: 'pix', icon: QrCode, label: 'Pix' },
                      ].map((payment) => (
                        <div key={payment.value} className="flex items-center gap-4 p-4 border-2 border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors data-[state=checked]:border-primary data-[state=checked]:bg-primary/5">
                          <RadioGroupItem value={payment.value} />
                          <payment.icon className="h-5 w-5 text-muted-foreground" />
                          <span className="flex-1 font-medium text-foreground" data-testid={`text-payment-${payment.value}`}>
                            {payment.label}
                          </span>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {/* Order Notes */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-2" data-testid="text-notes-title">
              Observações
            </h3>
            <p className="text-muted-foreground text-sm mb-3" data-testid="text-notes-description">
              Possui alguma observação para incluir no seu pedido?
            </p>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea 
                      placeholder="Caso queira, você pode incluir uma observação."
                      className="resize-none h-24 bg-[#f1f5f9]"
                      maxLength={250}
                      {...field}
                      data-testid="textarea-notes"
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground mt-2" data-testid="text-notes-counter">
                    {field.value?.length || 0}/250 caracteres
                  </p>
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>

      {/* Fixed Bottom Summary */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-background border-t border-border p-4 z-50 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm text-muted-foreground" data-testid="text-summary-subtotal">
              Subtotal: R$ {subtotal.toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground" data-testid="text-summary-delivery">
              Entrega: {deliveryFee > 0 ? `R$ ${deliveryFee.toFixed(2)}` : 'Grátis'}
            </div>
          </div>
          <div className="text-lg font-bold text-foreground" data-testid="text-summary-total">
            Total: R$ {(subtotal + deliveryFee).toFixed(2)}
          </div>
        </div>
        <Button 
          onClick={form.handleSubmit(onSubmit)}
          className="w-full bg-primary text-primary-foreground py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          data-testid="button-proceed-review"
        >
          Prosseguir para a revisão
        </Button>
      </div>
    </div>
  );
}
