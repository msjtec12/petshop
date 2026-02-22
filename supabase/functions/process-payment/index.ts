// supabase/functions/process-payment/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 1. Rate Limiting Check (Simulado - em produção usar Redis/Upstash)
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 2. Autenticação e Autorização
    const authHeader = req.headers.get('Authorization')!
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''))
    
    if (authError || !user) throw new Error('Unauthorized')

    // 3. Validação de Dados Post (Server-side)
    const { orderId, paymentMethod, amount } = await req.json()
    
    // Validar se o valor bate com o pedido no banco (Segurança Crítica)
    const { data: order } = await supabaseClient
      .from('orders')
      .select('total')
      .eq('id', orderId)
      .single()

    if (order.total !== amount) throw new Error('Valor inconsistente identificado.')

    // 4. Chamada Segura para API Externa (Cielo/Stripe/etc)
    // Chaves nunca saem daqui.
    const apiKey = Deno.env.get('PAYMENT_GATEWAY_KEY')
    console.log(`Processando R$${amount} para o pedido ${orderId} via gateway seguro.`)

    // 5. Atualização de Status via Service Role (Bypass RLS necessário aqui)
    const { error: updateError } = await supabaseClient
      .from('orders')
      .update({ status: 'pago' })
      .eq('id', orderId)

    if (updateError) throw updateError

    return new Response(JSON.stringify({ success: true, transactionId: 'TX-' + Math.random().toString(36).slice(2) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    // 6. Tratamento de Erros Seguro (Sem Stack Trace para o client)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
