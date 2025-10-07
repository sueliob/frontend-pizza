import { apiRequest } from './queryClient';

export interface CEPData {
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  deliveryFee: string;
  estimatedTime: string;
  distance?: number;
}

export async function lookupCEP(cep: string): Promise<CEPData> {
  const cleanCEP = cep.replace(/\D/g, '');
  
  console.log(`🏠 [CEP] Iniciando busca para CEP: ${cleanCEP}`);
  
  if (cleanCEP.length !== 8) {
    console.error(`❌ [CEP] CEP inválido: ${cleanCEP} (deve ter 8 dígitos)`);
    throw new Error('CEP deve ter 8 dígitos');
  }

  try {
    // Primeiro: Buscar endereço no ViaCEP
    console.log(`🔍 [CEP] Consultando ViaCEP: ${cleanCEP}`);
    const viacepResponse = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
    const viacepData = await viacepResponse.json();
    
    console.log(`📍 [CEP] Dados do ViaCEP:`, viacepData);
    
    if (viacepData.erro) {
      console.error(`❌ [CEP] CEP não encontrado no ViaCEP: ${cleanCEP}`);
      throw new Error('CEP não encontrado');
    }

    // Segundo: Calcular taxa usando o backend (fórmula original)
    const addressData = {
      street: viacepData.logradouro || '',
      neighborhood: viacepData.bairro || '',
      city: viacepData.localidade || '',
      state: viacepData.uf || ''
    };
    
    console.log(`🚚 [CEP] Calculando entrega para:`, { cep: cleanCEP, address: addressData });
    
    const deliveryResponse = await apiRequest('POST', '/calculate-distance', {
      cep: cleanCEP,
      address: addressData
    });
    
    const deliveryData = await deliveryResponse.json();
    console.log(`💰 [CEP] Dados de entrega calculados:`, deliveryData);

    const result = {
      cep: viacepData.cep,
      street: viacepData.logradouro || '',
      neighborhood: viacepData.bairro || '',
      city: viacepData.localidade || '',
      state: viacepData.uf || '',
      deliveryFee: deliveryData.deliveryFee,
      estimatedTime: deliveryData.estimatedTime,
      distance: deliveryData.distance
    };
    
    console.log(`✅ [CEP] Busca concluída com sucesso:`, result);
    return result;
  } catch (error) {
    console.error(`❌ [CEP] Erro na busca:`, error);
    throw new Error('Erro ao buscar CEP ou calcular entrega');
  }
}

export function formatCEP(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 5) {
    return cleaned;
  }
  return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`;
}
