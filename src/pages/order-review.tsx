import { useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Camera } from 'lucide-react';
import { useCart } from '@/lib/cart-store';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { openWhatsApp } from '@/lib/whatsapp-service';
import { gerarPedidoImagem } from '@/utils/gerarPedidoImagem';
import { getApiUrl } from '@/lib/api-config';

interface OrderReviewData {
  customerName: string;
  customerPhone: string;
  deliveryMethod: 'pickup' | 'delivery';
  address?: {
    cep: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
  };
  paymentMethod: string;
  deliveryFee: number;
  notes?: string;
}

export default function OrderReview() {
  const [, navigate] = useLocation();
  const { state: cartState, subtotal, clearCart } = useCart();
  const { toast } = useToast();
  const [, params] = useRoute('/order-review/:data');
  
  // Get order data from URL params (encoded)
  const orderData: OrderReviewData = params?.data ? 
    JSON.parse(decodeURIComponent(params.data)) : null;

  if (!orderData) {
    navigate('/checkout');
    return null;
  }

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      const orderRequestData = {
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        deliveryMethod: orderData.deliveryMethod,
        address: orderData.address || null,
        paymentMethod: orderData.paymentMethod,
        items: cartState.items,
        subtotal: subtotal.toString(),
        deliveryFee: orderData.deliveryFee.toString(),
        total: (subtotal + orderData.deliveryFee).toString(),
        notes: orderData.notes || '',
      };

      const response = await apiRequest('POST', '/orders', orderRequestData);
      return await response.json();
    },
    onSuccess: (order) => {
      // Apenas limpar carrinho e mostrar sucesso
      clearCart();
      toast({
        title: "Pedido registrado!",
        description: "Redirecionando para o WhatsApp com sua imagem...",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao registrar pedido",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Nova função para enviar pedido com imagem diretamente
  const enviarPedidoWhatsApp = async () => {
    // Abre popup ANTES de qualquer await (evita bloqueio)
    console.log('🚀 Tentando abrir popup...');
    const popup = window.open("about:blank", "_blank", "width=800,height=600,scrollbars=yes,resizable=yes");
    
    if (popup) {
      console.log('✅ Popup criado com sucesso');
      popup.document.write(`
        <div style="padding: 20px; font-family: Arial; text-align: center;">
          <h2>🍕 Processando seu pedido...</h2>
          <p>Aguarde enquanto preparamos tudo para o WhatsApp!</p>
          <div style="margin: 20px 0;">
            <div style="border: 2px solid #ddd; border-radius: 50%; width: 40px; height: 40px; margin: 0 auto; border-top-color: #ff6b35; animation: spin 1s linear infinite;"></div>
          </div>
          <style>
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          </style>
        </div>
      `);
    } else {
      console.log('❌ Popup foi bloqueado pelo navegador');
    }

    try {
      // 1. Primeiro registrar o pedido no sistema
      const order = await createOrderMutation.mutateAsync();
      
      console.log('🔍 Iniciando captura de imagem...');
      
      // 2. Verificar se elemento existe
      const element = document.getElementById('order-summary');
      if (!element) {
        console.log('❌ Elemento #order-summary não encontrado no DOM');
        throw new Error('Elemento de pedido não encontrado');
      }
      
      console.log('✅ Elemento encontrado, gerando imagem...');
      
      // 3. Gerar imagem do card
      const dataUrl = await gerarPedidoImagem('order-summary');
      console.log('✅ Imagem capturada, tamanho:', dataUrl.length);
      
      // 4. Enviar para backend (Cloudinary)
      console.log('📡 Enviando para backend...');
      const resp = await fetch(getApiUrl('/orders/image'), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl }),
      });
      
      if (!resp.ok) {
        const error = await resp.text();
        console.log('❌ Erro no backend:', error);
        throw new Error('Falha no upload da imagem');
      }
      
      const { secure_url } = await resp.json();
      console.log('🎉 URL da imagem:', secure_url);
      
      // 4b. Encurtar o link da imagem
      console.log('🔗 Encurtando link...');
      let finalImageUrl = secure_url; // Fallback para URL original
      
      try {
        // Usar função utilitária para detectar URL automaticamente
        const { getShortenApiUrl } = await import('@/lib/url-utils');
        const shortenResp = await fetch(getShortenApiUrl(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ longUrl: secure_url })
        });
        
        if (shortenResp.ok) {
          const shortenData = await shortenResp.json();
          console.log('📊 Resposta do encurtador:', shortenData);
          
          const { shortUrl } = shortenData;
          finalImageUrl = shortUrl;
          console.log('✨ Link encurtado:', shortUrl);
          console.log('🔍 Link original:', secure_url);
        } else {
          console.log('⚠️ Falha ao encurtar, usando URL original');
        }
      } catch (shortenError) {
        console.log('⚠️ Erro ao encurtar link:', shortenError);
        // Continua com URL original
      }
      
      // 5. Buscar número do WhatsApp
      console.log('📞 Buscando número do WhatsApp...');
      const contactResponse = await fetch(getApiUrl('/public/contact'));
      
      if (!contactResponse.ok) {
        console.log('❌ Erro ao buscar contato:', contactResponse.status);
        throw new Error('Erro ao buscar número do WhatsApp');
      }
      
      const contactData = await contactResponse.json();
      console.log('📞 Dados de contato:', contactData);
      
      if (!contactData.whatsapp) {
        throw new Error('Número do WhatsApp não configurado no sistema');
      }
      
      let whatsappNumber = contactData.whatsapp;
      
      if (!whatsappNumber.startsWith('55')) {
        whatsappNumber = '55' + whatsappNumber;
      }
      
      console.log('📞 Número formatado:', whatsappNumber);
      
      // 6. Montar mensagem completa usando o serviço do WhatsApp
      console.log('📝 Montando mensagem completa...');
      
      // Montar objeto completo com todos os dados necessários
      const completeOrderData = {
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        deliveryMethod: orderData.deliveryMethod,
        address: orderData.address ? {
          cep: orderData.address.cep,
          street: orderData.address.street,
          number: orderData.address.number,
          complement: orderData.address.complement,
          neighborhood: orderData.address.neighborhood,
          city: 'São Paulo', // Valor padrão por enquanto
          state: 'SP' // Valor padrão por enquanto
        } : undefined,
        paymentMethod: orderData.paymentMethod,
        deliveryFee: orderData.deliveryFee,
        notes: orderData.notes,
        items: cartState.items,
        subtotal: subtotal,
        total: subtotal + orderData.deliveryFee,
        orderImageUrl: finalImageUrl
      };
      
      console.log('📊 Dados completos do pedido:', completeOrderData);
      
      // Usar a função completa de formatação do WhatsApp
      const { formatWhatsAppMessage } = await import('@/lib/whatsapp-service');
      const whatsappUrl = await formatWhatsAppMessage(completeOrderData);
      
      console.log('📝 Mensagem completa montada!');
      console.log('🔗 URL do WhatsApp:', whatsappUrl);
      
      // 7. Redirecionar popup para WhatsApp
      console.log('🚀 Redirecionando para WhatsApp...');
      if (popup && !popup.closed) {
        popup.location.href = whatsappUrl;
        console.log('✅ Popup redirecionado para WhatsApp');
      } else {
        console.log('❌ Popup não existe ou foi fechado, abrindo nova aba');
        // Tentar abrir nova aba diretamente
        const newTab = window.open(whatsappUrl, '_blank');
        if (!newTab) {
          console.log('❌ Nova aba também foi bloqueada');
          // Fallback: mostrar link clicável
          alert(`Popup bloqueado! Clique no link para abrir o WhatsApp:\n\n${whatsappUrl}`);
        } else {
          console.log('✅ Nova aba aberta com sucesso');
        }
      }
      
      // 8. Navegar para home
      console.log('🏠 Navegando para home...');
      navigate('/');
      console.log('✅ Processo completo!');
      
    } catch (error) {
      console.error('❌ Erro completo:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Não foi possível gerar/enviar o pedido.';
      
      if (popup) {
        popup.document.write(`
          <div style="padding: 20px; font-family: Arial;">
            <h2>❌ Erro ao processar pedido</h2>
            <p>${errorMessage}</p>
            <p><a href="#" onclick="window.close()">Fechar janela</a></p>
          </div>
        `);
      }
      
      toast({
        title: "Erro ao processar pedido",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels = {
      'debit': 'Cartão de débito',
      'credit': 'Cartão de crédito',
      'cash': 'Dinheiro',
      'pix': 'Pix',
      'Cartão de débito': 'Cartão de débito',
      'Cartão de crédito': 'Cartão de crédito',
      'Dinheiro': 'Dinheiro',
      'Pix': 'Pix',
    };
    return labels[method as keyof typeof labels] || method;
  };

  const totalPrice = subtotal + orderData.deliveryFee;

  return (
    <div className="p-4 pb-32 fade-in" data-testid="page-order-review">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground" data-testid="text-review-title">
          Reveja seu pedido
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/checkout')}
          className="text-muted-foreground hover:text-foreground p-2"
          data-testid="button-close-review"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <Card className="bg-accent/5 mb-6" id="order-summary">
        <CardContent className="p-4">
          {/* Order Items */}
          <div className="space-y-4 mb-6" data-testid="list-order-items">
            {cartState.items.map((item, index) => {
              const flavorNames = item.flavors.map(f => f.name).join(', ');
              const itemTotal = item.price * item.quantity;
              
              return (
                <div key={item.id} className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground" data-testid={`text-item-title-${index}`}>
                        {item.category === 'entradas' ? 'ENTRADA:' : 
                         item.category === 'bebidas' ? 'BEBIDA:' : 
                         (() => {
                           const flavorCount = item.flavors.length;
                           const sizeText = item.type.toUpperCase();
                           if (flavorCount === 1) {
                             return `${item.quantity}x ${sizeText} (${item.slices} FATIAS)`;
                           } else {
                             return `${item.quantity}x ${sizeText} ${flavorCount} SABORES (${item.slices} FATIAS)`;
                           }
                         })()
                        }
                      </h4>
                      {item.flavors.map((flavor, flavorIndex) => {
                        const flavorCount = item.flavors.length;
                        const fraction = flavorCount === 1 ? '' : flavorCount === 2 ? '1/2 ' : '1/3 ';
                        
                        return (
                          <div key={flavorIndex} className="flex justify-between text-sm ml-4">
                            <span data-testid={`text-flavor-${index}-${flavorIndex}`}>
                              {item.quantity}x {fraction}{flavor.name.toUpperCase()}
                            </span>
                            <span data-testid={`text-flavor-price-${index}-${flavorIndex}`}>
                              R$ {(flavor.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        );
                      })}
                      {/* Massa type */}
                      {item.doughType && item.category !== 'entradas' && item.category !== 'bebidas' && item.doughType.name !== 'N/A' && (
                        <div className="flex justify-between text-sm ml-4">
                          <span>
                            {item.quantity}x {item.doughType.name.toUpperCase()}
                          </span>
                          <span>R$ {(item.doughType.price * item.quantity).toFixed(2)}</span>
                        </div>
                      )}
                      {/* Extras */}
                      {item.extras && item.extras.map((extra, extraIndex) => (
                        <div key={extraIndex} className="flex justify-between text-sm ml-4">
                          <span data-testid={`text-extra-${index}-${extraIndex}`}>
                            {extra.quantity * item.quantity}x {extra.name.toUpperCase()}
                          </span>
                          <span data-testid={`text-extra-price-${index}-${extraIndex}`}>
                            R$ {(extra.price * extra.quantity * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                      {/* Observations */}
                      {item.observations && (
                        <div className="text-sm ml-4 mt-2 p-2 bg-muted/50 rounded">
                          <span className="font-medium text-muted-foreground">Observações: </span>
                          <span className="italic" data-testid={`text-observations-${index}`}>
                            {item.observations}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="border-b border-border pb-2"></div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="space-y-2 border-t border-border pt-4">
            <div className="flex justify-between">
              <span className="text-foreground">Subtotal</span>
              <span className="font-bold" data-testid="text-review-subtotal">
                R$ {subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground">Valor da entrega</span>
              <span className="font-bold" data-testid="text-review-delivery">
                R$ {orderData.deliveryFee.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-border pt-2">
              <span className="text-foreground">Total</span>
              <span data-testid="text-review-total">
                R$ {totalPrice.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Order Details */}
          <div className="mt-6 space-y-3 border-t border-border pt-4">
            <div className="flex justify-between">
              <span className="text-foreground">Forma de pagamento:</span>
              <span className="font-medium" data-testid="text-review-payment">
                {getPaymentMethodLabel(orderData.paymentMethod)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground">Entrega</span>
              <span className="font-medium" data-testid="text-review-delivery-method">
                {orderData.deliveryMethod === 'pickup' ? 'Retirar no balcão' : 'Entrega no endereço'}
              </span>
            </div>
            {orderData.address && (
              <div className="text-sm text-muted-foreground">
                <div>{orderData.address.street}, {orderData.address.number}</div>
                {orderData.address.complement && <div>{orderData.address.complement}</div>}
                <div>{orderData.address.neighborhood}</div>
                <div>CEP: {orderData.address.cep}</div>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-foreground">Cliente</span>
              <span className="font-medium" data-testid="text-review-customer">
                {orderData.customerName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground">Telefone</span>
              <span className="font-medium" data-testid="text-review-phone">
                {orderData.customerPhone}
              </span>
            </div>
            {orderData.notes && (
              <div className="flex justify-between">
                <span className="text-foreground">Observações</span>
                <span className="font-medium text-sm" data-testid="text-review-notes">
                  {orderData.notes}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-background p-4">
        <Button
          onClick={enviarPedidoWhatsApp}
          disabled={createOrderMutation.isPending}
          className="w-full bg-primary text-primary-foreground py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          data-testid="button-confirm-order"
        >
          {createOrderMutation.isPending ? 'Processando...' : 'Confirmar pedido agora!'}
        </Button>
      </div>
    </div>
  );
}