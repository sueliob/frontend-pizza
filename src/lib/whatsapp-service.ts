import { CartItem, Address } from '@/types';
import { getApiUrl } from './api-config';

interface OrderData {
  customerName: string;
  customerPhone: string;
  items: CartItem[];
  deliveryMethod: 'pickup' | 'delivery';
  address?: Address;
  paymentMethod: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  notes?: string;
  orderImageUrl?: string; // Nova propriedade para a imagem
}

// Cache para o número do WhatsApp (forçamos limpar o cache)
let cachedWhatsAppNumber: string | null = null;

// Função para buscar o número do WhatsApp das configurações
async function getWhatsAppNumber(): Promise<string> {
  // DEBUG: sempre buscar novo número (sem cache temporário)
  // if (cachedWhatsAppNumber) {
  //   return cachedWhatsAppNumber;
  // }
  
  try {
    console.log('Buscando número do WhatsApp via API...');
    const response = await fetch(getApiUrl('/public/contact'));
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Dados de contato recebidos:', data);
      
      // Formatar o número com código do país se não tiver
      if (!data.whatsapp) {
        throw new Error('Número do WhatsApp não configurado no banco de dados');
      }
      
      let whatsappNumber = data.whatsapp;
      
      // Adicionar código do país se necessário
      if (!whatsappNumber.startsWith('55')) {
        whatsappNumber = '55' + whatsappNumber;
      }
      
      console.log('Número final formatado:', whatsappNumber);
      cachedWhatsAppNumber = whatsappNumber;
      return whatsappNumber;
    } else {
      console.error('Erro na resposta da API:', response.statusText);
    }
  } catch (error) {
    console.error('Erro ao buscar número do WhatsApp:', error);
    throw new Error('Não foi possível obter o número do WhatsApp. Por favor, verifique as configurações do sistema.');
  }
  
  throw new Error('Número do WhatsApp não disponível no momento.');
}

export async function formatWhatsAppMessage(order: OrderData): Promise<string> {
  const phoneNumber = await getWhatsAppNumber();
  
  let message = `🍕 *NOVO PEDIDO*\n`;
  message += `👤 *Cliente:* ${order.customerName}\n`;
  message += `📱 *Telefone:* ${order.customerPhone}\n`;
  
  // Delivery info
  if (order.deliveryMethod === 'pickup') {
    message += `🚚 *Entrega:* Retirada no balcão\n\n`;
  } else {
    message += `🚚 *Entrega:* Entrega no local\n\n`;
    if (order.address) {
      message += `📍 *Endereço:*\n`;
      message += `${order.address.street}, ${order.address.number}\n`;
      if (order.address.complement) {
        message += `${order.address.complement}\n`;
      }
      message += `${order.address.neighborhood} - CEP: ${order.address.cep}\n\n`;
    }
  }
  
  // Separar itens por categoria na ordem desejada
  const entradas = order.items.filter(item => item.category === 'entradas');
  const pizzasSalgadas = order.items.filter(item => item.category === 'salgadas');
  const pizzasDoces = order.items.filter(item => item.category === 'doces');
  const bebidas = order.items.filter(item => item.category === 'bebidas');
  
  message += `🍕 *Pedidos:*\n`;
  
  let itemIndex = 1;
  
  // Processar entradas
  entradas.forEach((item) => {
    message += `${itemIndex}. *${item.quantity}x Entrada*\n`;
    
    item.flavors.forEach(flavor => {
      message += `- ${flavor.name}\n`;
    });
    
    // Add extras if available
    if (item.extras && item.extras.length > 0) {
      message += `*Extras:* ${item.extras.map(e => `${e.name} (${e.quantity}x)`).join(', ')}\n`;
    }
    
    // Add observations if available
    if (item.observations) {
      message += `📝 *Obs:* ${item.observations}\n`;
    }
    
    message += `Valor: R$ ${(item.price * item.quantity).toFixed(2)}\n`;
    itemIndex++;
  });
  
  // Processar pizzas salgadas
  pizzasSalgadas.forEach((item) => {
    const flavorCount = item.flavors.length;
    let pizzaTitle = '';
    
    if (flavorCount === 1) {
      pizzaTitle = `*${item.quantity}x Pizza ${item.type === 'grande' ? 'Grande' : item.type === 'media' ? 'Média' : 'Individual'}*`;
    } else {
      pizzaTitle = `*${item.quantity}x Pizza ${item.type === 'grande' ? 'Grande' : item.type === 'media' ? 'Média' : 'Individual'} (${flavorCount} Sabores)*`;
    }
    
    message += `${itemIndex}. ${pizzaTitle}\n`;
    
    // Add dough type
    if (item.doughType) {
      message += `    *Massa:* ${item.doughType.name}\n`;
    }
    
    // Add flavors with fractions
    const fraction = flavorCount === 1 ? '' : flavorCount === 2 ? '1/2 ' : '1/3 ';
    item.flavors.forEach(flavor => {
      message += `    - ${fraction}${flavor.name}\n`;
    });
    
    // Add extras if available
    if (item.extras && item.extras.length > 0) {
      message += `*Extras:* ${item.extras.map(e => `${e.name} (${e.quantity}x)`).join(', ')}\n`;
    }
    
    // Add observations if available
    if (item.observations) {
      message += `📝 *Obs:* ${item.observations}\n`;
    }
    
    message += `Valor: R$ ${(item.price * item.quantity).toFixed(2)}\n`;
    itemIndex++;
  });
  
  // Processar pizzas doces
  pizzasDoces.forEach((item) => {
    const flavorCount = item.flavors.length;
    let pizzaTitle = '';
    
    if (flavorCount === 1) {
      pizzaTitle = `*${item.quantity}x Pizza ${item.type === 'grande' ? 'Grande' : item.type === 'media' ? 'Média' : 'Individual'}*`;
    } else {
      pizzaTitle = `*${item.quantity}x Pizza ${item.type === 'grande' ? 'Grande' : item.type === 'media' ? 'Média' : 'Individual'} (${flavorCount} Sabores)*`;
    }
    
    message += `${itemIndex}. ${pizzaTitle}\n`;
    
    // Add dough type
    if (item.doughType) {
      message += `    *Massa:* ${item.doughType.name}\n`;
    }
    
    // Add flavors with fractions
    const fraction = flavorCount === 1 ? '' : flavorCount === 2 ? '1/2 ' : '1/3 ';
    item.flavors.forEach(flavor => {
      message += `    - ${fraction}${flavor.name}\n`;
    });
    
    // Add extras if available
    if (item.extras && item.extras.length > 0) {
      message += `*Extras:* ${item.extras.map(e => `${e.name} (${e.quantity}x)`).join(', ')}\n`;
    }
    
    // Add observations if available
    if (item.observations) {
      message += `📝 *Obs:* ${item.observations}\n`;
    }
    
    message += `Valor: R$ ${(item.price * item.quantity).toFixed(2)}\n`;
    itemIndex++;
  });
  
  // Processar bebidas
  bebidas.forEach((item) => {
    message += `${itemIndex}. *${item.quantity}x Bebida*\n`;
    
    item.flavors.forEach(flavor => {
      message += `- ${flavor.name}\n`;
    });
    
    // Add extras if available
    if (item.extras && item.extras.length > 0) {
      message += `*Extras:* ${item.extras.map(e => `${e.name} (${e.quantity}x)`).join(', ')}\n`;
    }
    
    // Add observations if available
    if (item.observations) {
      message += `📝 *Obs:* ${item.observations}\n`;
    }
    
    message += `Valor: R$ ${(item.price * item.quantity).toFixed(2)}\n`;
    itemIndex++;
  });
  
  // Total  
  message += `\n💰 *Resumo:*\n`;
  message += `Subtotal: R$ ${order.subtotal.toFixed(2)}\n`;
  message += `Entrega: R$ ${order.deliveryFee.toFixed(2)}\n`;
  message += `*Total: R$ ${order.total.toFixed(2)}*\n\n`;
  
  // Payment
  message += `💳 *Pagamento:* ${order.paymentMethod}\n`;
  
  // Notes
  if (order.notes) {
    message += `\n📝 *Observações:* ${order.notes}\n`;
  }
  
  message += `\n*Comprovante (válido por 24h):*\n`;
  
  // Add image URL if available
  if (order.orderImageUrl) {
    message += `${order.orderImageUrl}\n`;
  }
  
  message += `*Pedido via WhatsApp.*`;
  
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
}

export async function openWhatsApp(order: OrderData): Promise<void> {
  const message = await formatWhatsAppMessage(order);
  window.open(message, '_blank');
}
