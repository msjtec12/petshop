import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useOrders } from "@/contexts/OrdersContext";
import { useNavigate, Navigate } from "react-router-dom";
import { CreditCard, ShieldCheck, Lock, ArrowLeft, Loader2, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { processPayment } from "@/services/paymentService";
import { calculateShipping, ShippingOption } from "@/services/shippingService";

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
    type: "pf", // pf or pj
    cep: ""
  });

  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);

  if (!user) return <Navigate to="/auth" />;
  if (items.length === 0) return <Navigate to="/carrinho" />;

  const handleCalculateShipping = async () => {
    if (formData.cep.replace(/\D/g, '').length < 8) {
      toast.error("Por favor, digite um CEP válido");
      return;
    }
    setIsCalculatingShipping(true);
    try {
      const options = await calculateShipping(formData.cep, items.length);
      setShippingOptions(options);
      setSelectedShipping(options[0]); // Seleciona o primeiro por padrão
      toast.success("Opções de entrega atualizadas!");
    } catch (error) {
      toast.error("Erro ao calcular opções de entrega");
    } finally {
      setIsCalculatingShipping(false);
    }
  };

  const shippingFee = selectedShipping ? selectedShipping.price : (totalPrice >= 199 ? 0 : 19.90);
  const finalTotal = totalPrice + shippingFee;

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedShipping && totalPrice < 199) {
      toast.error("Por favor, calcule e selecione uma opção de entrega.");
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Criar pedido com status 'pendente' e dados fiscais + logística
      const order = await createOrder(
        user.id, 
        items, 
        finalTotal, 
        formData.address, 
        formData.document, 
        formData.phone,
        selectedShipping?.name || "Frete Padrão",
        shippingFee
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
          <div className="space-y-6">
            {/* Seção de Entrega (Lalamove/Loggi) */}
            <Card className="border-primary/20 shadow-premium">
              <CardHeader className="bg-primary/5">
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Truck className="h-5 w-5" /> Entrega Expressa
                </CardTitle>
                <CardDescription>Receba seus produtos hoje via Loggi ou Lalamove.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="cep">Calcular Frete pelo CEP</Label>
                    <Input 
                      id="cep" 
                      placeholder="00000-000" 
                      value={formData.cep}
                      onChange={e => setFormData({...formData, cep: e.target.value})}
                      maxLength={9}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="border-primary text-primary hover:bg-primary/10"
                      onClick={handleCalculateShipping}
                      disabled={isCalculatingShipping}
                    >
                      {isCalculatingShipping ? <Loader2 className="h-4 w-4 animate-spin" /> : "Calcular"}
                    </Button>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  {shippingOptions.map((option) => (
                    <div 
                      key={option.id}
                      onClick={() => setSelectedShipping(option)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex justify-between items-center ${
                        selectedShipping?.id === option.id 
                        ? 'border-primary bg-primary/5 shadow-md' 
                        : 'border-muted bg-card hover:border-primary/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${selectedShipping?.id === option.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                          <Truck className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">{option.name}</p>
                          <p className="text-xs text-muted-foreground italic">🕒 {option.deliveryTime}</p>
                        </div>
                      </div>
                      <p className="font-bold text-primary">
                        {option.price === 0 ? "GRÁTIS" : `R$ ${option.price.toFixed(2)}`}
                      </p>
                    </div>
                  ))}
                  
                  {shippingOptions.length === 0 && !isCalculatingShipping && (
                    <div className="text-center py-4 text-sm text-muted-foreground border-2 border-dashed rounded-xl">
                      Digite seu CEP para ver as opções de entrega local.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <form onSubmit={handlePayment} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" /> Dados de Pagamento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
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

                  <hr className="my-4" />

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
                      <Input 
                        id="cvv" 
                        required 
                        type="password" 
                        placeholder="123" 
                        maxLength={4}
                        value={formData.cvv}
                        onChange={e => setFormData({...formData, cvv: e.target.value})}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center gap-2 px-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-green-500" />
                Certificado de Criptografia SSL Ativo.
              </div>

              <Button type="submit" className="w-full py-6 text-lg font-bold shadow-lg" disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Verificando...
                  </>
                ) : (
                  `Concluir Compra - R$ ${finalTotal.toFixed(2)}`
                )}
              </Button>
            </form>
          </div>

          {/* Resumo */}
          <div className="space-y-6">
            <Card className="sticky top-24 shadow-premium border-none bg-primary/5">
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between items-center text-sm">
                    <div className="flex gap-3">
                      <span className="text-muted-foreground font-bold">{item.quantity}x</span>
                      <span className="font-medium">{item.product.name}</span>
                    </div>
                    <span className="font-bold">R$ {(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                
                <div className="border-t border-primary/10 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal dos Produtos</span>
                    <span>R$ {totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Serviço de Entrega</span>
                    <span className="text-primary font-bold">
                      {shippingFee === 0 ? "GRÁTIS" : `R$ ${shippingFee.toFixed(2)}`}
                    </span>
                  </div>
                </div>

                <div className="border-t border-primary/20 pt-4 flex justify-between items-center">
                  <span className="text-lg font-bold">Total Final</span>
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
