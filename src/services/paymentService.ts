import { supabase } from "@/lib/supabase";

export interface PaymentData {
  cardNumber: string;
  holderName: string;
  expiryDate: string;
  cvv: string;
  installments: number;
}

export const processPayment = async (orderId: string, amount: number, paymentData: PaymentData) => {
  try {
    // PROTEÇÃO: Chamada exclusiva via Edge Function
    // Nenhuma chave de API ou segredo de negócio no frontend
    const { data, error } = await supabase.functions.invoke('process-payment', {
      body: { 
        orderId, 
        amount, 
        paymentMethod: 'credit_card',
        // Em produção, você enviaria um Token gerado pelo SDK do Gateway, nunca os dados puros do cartão
        cardToken: 'tok_simulation_secure_' + Math.random().toString(36).slice(2)
      }
    });

    if (error) throw error;
    return { success: true, transactionId: data.transactionId };

  } catch (error: any) {
    console.error("Falha na segurança do pagamento:", error.message);
    return { 
      success: false, 
      message: "Erro no processamento seguro. Tente novamente mais tarde." 
    };
  }
};

