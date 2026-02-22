/**
 * Serviço de Integração com Logística (Simulado)
 * Lalamove / Loggi
 */

export interface ShippingOption {
  id: string;
  name: string;
  price: number;
  deliveryTime: string; // Ex: "45-60 min"
  provider: 'lalamove' | 'loggi' | 'proprio';
}

export const calculateShipping = async (cep: string, itemsCount: number): Promise<ShippingOption[]> => {
  // Simula uma chamada de API que demora 1 segundo
  await new Promise(resolve => setTimeout(resolve, 1200));

  // Lógica fictícia: se o CEP for de SP (01000-000), o frete é mais barato
  const isSP = cep.startsWith('0');
  
  const options: ShippingOption[] = [
    {
      id: 'loggi-express',
      name: 'Loggi Express (Motoboy)',
      price: isSP ? 12.50 : 25.00,
      deliveryTime: '40-60 min',
      provider: 'loggi'
    },
    {
      id: 'lalamove-van',
      name: 'Lalamove Delivery',
      price: isSP ? 18.90 : 35.00,
      deliveryTime: '30-50 min',
      provider: 'lalamove'
    },
    {
      id: 'entrega-petshop',
      name: 'Entrega Própria PataFeliz',
      price: 0,
      deliveryTime: 'Até 2 horas',
      provider: 'proprio'
    }
  ];

  // Se o carrinho for muito pesado ou CEP longe, podemos filtrar opções
  return options;
};

export const createDeliveryOrder = async (orderId: string, address: string, provider: string) => {
  // Em produção, isso chamaria o Webhook da Loggi/Lalamove
  console.log(`Solicitando motoboy para pedido ${orderId} via ${provider}`);
  return { success: true, trackingUrl: 'https://track.loggi.com/mock' };
};
