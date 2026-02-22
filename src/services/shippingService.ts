import { supabase } from "@/lib/supabase";

export interface ShippingOption {
  id: string;
  name: string;
  price: number;
  deliveryTime: string;
}

export const calculateShipping = async (cep: string, itemsCount: number, totalWeight: number): Promise<ShippingOption[]> => {
  // SEGURANÇA: O cálculo agora é feito no servidor (Edge Function)
  // Evita que o usuário manipule o preço do frete via console do navegador
  const { data, error } = await supabase.functions.invoke('calculate-shipping', {
    body: { cep, itemsCount, totalWeight }
  });

  if (error) {
    console.error("Erro ao calcular frete seguro:", error.message);
    return [];
  }

  return data;
};

export const createDeliveryOrder = async (orderId: string, address: string, provider: string) => {
  // PROTEÇÃO: Chamada direta de backend para backend (Loggi/Lalamove)
  const { data, error } = await supabase.functions.invoke('process-delivery', {
    body: { orderId, address, provider }
  });

  if (error) throw error;
  return data;
};

