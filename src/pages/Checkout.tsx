import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useOrders } from "@/contexts/OrdersContext";
import { useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CreditCard, ShieldCheck, Lock, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { processPayment } from "@/services/paymentService";

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { createOrder } = useOrders();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({
    cardNumber: "",
    holderName: "",
    expiryDate: "",
    cvv: "",
    address: "",
    document: "",
    phone: "",
    type: "pf" // pf or pj
  });

  if (!user) return <Navigate to="/auth" />;
  if (items.length === 0) return <Navigate to="/carrinho" />;

  const shipping = totalPrice >= 199 ? 0 : 19.90;
  const finalTotal = totalPrice + shipping;

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // 1. Criar pedido com status 'pendente' e dados fiscais
      const order = await createOrder(
        user.id, 
        items, 
        finalTotal, 
        formData.address, 
        formData.document, 
        formData.phone
      );

      
      // 2. Processar Pagamento via Service (Simulando API Segura)
      const result: any = await processPayment(order.id, finalTotal, {
        cardNumber: formData.cardNumber,
        holderName: formData.holderName,
        expiryDate: formData.expiryDate,
        cvv: formData.cvv,
        installments: 1
      });

      if (result.success) {
        toast.success("Pagamento aprovado! Pedido realizado.");
        clearCart();
        navigate("/pedidos");
      } else {
        toast.error(result.message || "Erro no pagamento");
      }
    } catch (error: any) {
      toast.error("Ocorreu um erro no checkout.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-muted/30 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <button onClick={() => navigate("/carrinho")} className="flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Voltar ao carrinho
        </button>

        <div className="grid lg:grid-cols-2 gap-8">
          <form onSubmit={handlePayment} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" /> Dados de Pagamento
                </CardTitle>
                <CardDescription>Sua transação é protegida por criptografia de ponta a ponta.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <Label>Tipo de Cliente</Label>
                    <div className="flex gap-2">
                      <Button 
                        type="button" 
                        variant={formData.type === 'pf' ? 'default' : 'outline'}
                        className="flex-1"
                        onClick={() => setFormData({...formData, type: 'pf'})}
                      >PF</Button>
                      <Button 
                        type="button" 
                        variant={formData.type === 'pj' ? 'default' : 'outline'}
                        className="flex-1"
                        onClick={() => setFormData({...formData, type: 'pj'})}
                      >PJ</Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="document">{formData.type === 'pf' ? 'CPF' : 'CNPJ'}</Label>
                    <Input 
                      id="document" 
                      required 
                      placeholder={formData.type === 'pf' ? '000.000.000-00' : '00.000.000/0000-00'} 
                      value={formData.document}
                      onChange={e => setFormData({...formData, document: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone / WhatsApp</Label>
                  <Input 
                    id="phone" 
                    required 
                    placeholder="(00) 00000-0000" 
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Endereço de Entrega Completo</Label>
                  <Input 
                    id="address" 
                    required 
                    placeholder="Rua, Número, Bairro, CEP, Cidade - UF" 
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                  />
                </div>


                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Número do Cartão</Label>
                  <div className="relative">
                    <Input 
                      id="cardNumber" 
                      required 
                      placeholder="0000 0000 0000 0000" 
                      maxLength={19}
                      value={formData.cardNumber}
                      onChange={e => setFormData({...formData, cardNumber: e.target.value})}
                    />
                    <CreditCard className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="holderName">Nome no Cartão</Label>
                  <Input 
                    id="holderName" 
                    required 
                    placeholder="COMO ESTÁ NO CARTÃO" 
                    value={formData.holderName}
                    onChange={e => setFormData({...formData, holderName: e.target.value.toUpperCase()})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Validade</Label>
                    <Input 
                      id="expiry" 
                      required 
                      placeholder="MM/AA" 
                      maxLength={5}
                      value={formData.expiryDate}
                      onChange={e => setFormData({...formData, expiryDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <div className="relative">
                      <Input 
                        id="cvv" 
                        required 
                        type="password" 
                        placeholder="123" 
                        maxLength={4}
                        value={formData.cvv}
                        onChange={e => setFormData({...formData, cvv: e.target.value})}
                      />
                      <Lock className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center gap-2 px-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-green-500" />
              Sua segurança é nossa prioridade. Não armazenamos o seu código CVV.
            </div>

            <Button type="submit" className="w-full py-6 text-lg font-bold" disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processando...
                </>
              ) : (
                `Pagar R$ ${finalTotal.toFixed(2)}`
              )}
            </Button>
          </form>

          {/* Pedido Resumo */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between items-center text-sm">
                    <div className="flex gap-3">
                      <span className="text-muted-foreground font-bold">{item.quantity}x</span>
                      <span className="font-medium line-clamp-1">{item.product.name}</span>
                    </div>
                    <span className="font-bold">R$ {(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                
                <div className="border-t border-dashed pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>R$ {totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Frete</span>
                    <span className="text-green-600 font-bold">{shipping === 0 ? "GRÁTIS" : `R$ ${shipping.toFixed(2)}`}</span>
                  </div>
                </div>

                <div className="border-t pt-4 flex justify-between items-center">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-2xl font-bold text-primary">R$ {finalTotal.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Checkout;
