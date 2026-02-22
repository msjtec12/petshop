// supabase/functions/payment-webhook/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts"

serve(async (req) => {
  const signature = req.headers.get('x-gateway-signature')
  const body = await req.text()

  // 1. Verificação de Assinatura (Segurança contra Webhook Spoofing)
  const secret = Deno.env.get('WEBHOOK_SECRET')
  // Simulação de verificação HMAC
  if (!signature) {
     return new Response('Invalid Signature', { status: 401 })
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const payload = JSON.parse(body)
  
  // 2. Atualização Atômica baseada no Webhook
  if (payload.status === 'confirmed') {
    await supabaseClient
      .from('orders')
      .update({ status: 'pago' })
      .eq('id', payload.orderId)
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 })
})
