// Types para o frontend
export interface CartItem {
  id: string;
  name?: string;
  price: number;
  quantity: number;
  size?: "1" | "2" | "3";  // Para compatibilidade
  type: 'grande' | 'media' | 'individual';
  category: string;
  slices?: number;  // Para compatibilidade
  flavors: Array<{
    id: string;
    name: string;
    price: number;
  }>;
  doughType?: {
    id: string;
    name: string;
    price: number;
  };
  extras?: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  observations?: string;
  image?: string;
}

export interface PizzaFlavor {
  id: string;
  name: string;
  description?: string;
  prices: Record<string, string> | number;
  category: 'salgadas' | 'doces' | 'entradas' | 'bebidas';
  imageUrl?: string;
  isActive: boolean;
}

export interface Address {
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface DeliveryInfo extends Address {
  fee: number;
  distance?: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  deliveryInfo: DeliveryInfo;
  customerName: string;
  customerPhone: string;
  notes?: string;
  total: number;
  createdAt: string;
}