// supabase/functions/calculate-shipping/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { cep, itemsCount } = await req.json()
    
    // Nenhuma chave de API (Lalamove/Loggi) fica no frontend
    const LALAMOVE_SECRET = Deno.env.get('LALAMOVE_SECRET')
    
    // Simulação de chamada externa segura
    // Aqui aconteceria o cálculo real usando as chaves secretas
    const isSP = cep.startsWith('0');
    
    const options = [
      { id: 'loggi-express', name: 'Loggi Motoboy', price: isSP ? 12.50 : 25.00, deliveryTime: '40-60 min' },
      { id: 'lalamove-van', name: 'Lalamove Delivery', price: isSP ? 18.90 : 35.00, deliveryTime: '30-50 min' }
    ];

    return new Response(JSON.stringify(options), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
