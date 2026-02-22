import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useOrders } from "@/contexts/OrdersContext";
import { useBranding } from "@/contexts/BrandingContext";
import { useNavigate, Navigate } from "react-router-dom";
import { 
  CreditCard, 
  ShieldCheck, 
  Lock, 
  ArrowLeft, 
  Loader2, 
  Truck, 
  Store, 
  MapPin, 
  Phone, 
  User as UserIcon,
  CheckCircle2,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { processPayment } from "@/services/paymentService";
import { calculateShipping, ShippingOption } from "@/services/shippingService";

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const totalWeight = items.reduce((sum, item) => sum + (item.product.weight || 0.5) * item.quantity, 0);
  const { user, updateProfile } = useAuth();
  const { createOrder } = useOrders();
  const { settings } = useBranding();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1); // 1: Delivery, 2: Payment, 3: Success
  const [isProcessing, setIsProcessing] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');

  const [formData, setFormData] = useState({
    cardNumber: "",
    holderName: "",
    expiryDate: "",
    cvv: "",
    address: "",
    document: "",
    phone: "",
    type: "pf",
    cep: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: ""
  });

  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);

  const handleCepSearch = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            street: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
            state: data.uf,
            cep: cep
          }));
          toast.success("Endereço encontrado!");
          handleCalculateShipping(cleanCep);
        } else {
          toast.error("CEP não encontrado.");
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
      }
    }
  };

  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);

  if (!user) return <Navigate to="/auth" />;
  if (items.length === 0 && step !== 3) return <Navigate to="/carrinho" />;

  const handleCalculateShipping = async (cepCode?: string) => {
    const targetCep = cepCode || formData.cep.replace(/\D/g, '');
    if (targetCep.length < 8) return;

    setIsCalculatingShipping(true);
    try {
      const options = await calculateShipping(targetCep, items.length, totalWeight);
      setShippingOptions(options);
      setSelectedShipping(options[0]);
    } catch (error) {
      toast.error("Erro ao calcular frete");
    } finally {
      setIsCalculatingShipping(false);
    }
  };

  const shippingFee = deliveryMethod === 'pickup' ? 0 : (selectedShipping ? selectedShipping.price : (totalPrice >= 199 ? 0 : 19.90));
  const finalTotal = totalPrice + shippingFee;

  const handleFinishCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deliveryMethod === 'delivery' && !formData.street) {
      toast.error("Por favor, preencha o endereço de entrega.");
      return;
    }
    
    setIsProcessing(true);
    try {
      const order = await createOrder(
        user.id, 
        items, 
        finalTotal, 
        deliveryMethod === 'pickup' ? "Retirada na Loja" : `${formData.street}, ${formData.number} - ${formData.city}`, 
        formData.document, 
        formData.phone,
        deliveryMethod === 'pickup' ? "Retirada" : (selectedShipping?.name || "Frete Padrão"),
        shippingFee
      );

      const result: any = await processPayment(order.id, finalTotal, {
        cardNumber: formData.cardNumber,
        holderName: formData.holderName,
        expiryDate: formData.expiryDate,
        cvv: formData.cvv,
        installments: 1
      });

      if (result.success) {
        toast.success("Pagamento aprovado!");
        
        // Save address to profile if it doesn't have one
        if (user && !user.address?.cep && updateProfile) {
          updateProfile({
            address: {
              cep: formData.cep,
              street: formData.street,
              number: formData.number,
              complement: formData.complement,
              neighborhood: formData.neighborhood,
              city: formData.city,
              state: formData.state
            }
          }).catch(e => console.error("Falha ao salvar endereço no perfil:", e));
        }

        clearCart();
        setStep(3);
      } else {
        toast.error(result.message || "Erro no pagamento");
      }
    } catch (error: any) {
      toast.error("Ocorreu um erro no checkout.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (step === 3) {
    return (
      <main className="min-h-[80vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8 border-none shadow-premium">
          <div className="bg-primary/10 text-primary w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-display font-bold mb-2">Pedido Confirmado!</h1>
          <p className="text-muted-foreground mb-8">
            Obrigado por comprar conosco. Você receberá as atualizações do seu pedido por e-mail e WhatsApp.
          </p>
          <Button onClick={() => navigate("/pedidos")} className="w-full font-bold py-6">
            Ver Meus Pedidos
          </Button>
          <Button variant="ghost" onClick={() => navigate("/")} className="w-full mt-2">
            Voltar para a Loja
          </Button>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muted/30 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Checkout Flow */}
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-4 mb-2">
               <div className={`flex items-center gap-2 pb-2 border-b-2 transition-all ${step === 1 ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}>
                 <Badge variant={step === 1 ? "default" : "outline"} className="rounded-full h-6 w-6 p-0 flex items-center justify-center">1</Badge>
                 <span className="font-bold text-sm">Entrega</span>
               </div>
               <div className="h-px w-8 bg-muted mb-2"></div>
               <div className={`flex items-center gap-2 pb-2 border-b-2 transition-all ${step === 2 ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}>
                 <Badge variant={step === 2 ? "default" : "outline"} className="rounded-full h-6 w-6 p-0 flex items-center justify-center">2</Badge>
                 <span className="font-bold text-sm">Pagamento</span>
               </div>
            </div>

            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="border-none shadow-premium overflow-hidden">
                  <CardHeader className="bg-primary/5 pb-6">
                    <CardTitle className="text-2xl">Como deseja receber seu pedido?</CardTitle>
                    <CardDescription>Escolha entre entrega em casa ou retirada grátis.</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div 
                        onClick={() => setDeliveryMethod('delivery')}
                        className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center gap-3 text-center ${deliveryMethod === 'delivery' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-muted hover:border-primary/30'}`}
                      >
                        <div className={`p-4 rounded-full ${deliveryMethod === 'delivery' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                          <Truck className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-bold">Entrega em Casa</p>
                          <p className="text-xs text-muted-foreground">Loggi, Lalamove ou Sedex</p>
                        </div>
                      </div>
                      <div 
                        onClick={() => setDeliveryMethod('pickup')}
                        className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center gap-3 text-center ${deliveryMethod === 'pickup' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-muted hover:border-primary/30'}`}
                      >
                        <div className={`p-4 rounded-full ${deliveryMethod === 'pickup' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                          <Store className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-bold">Retirada na Loja</p>
                          <p className="text-xs text-muted-foreground">Grátis (Em 30 min)</p>
                        </div>
                      </div>
                    </div>

                    {deliveryMethod === 'delivery' ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>CEP</Label>
                            <Input 
                              placeholder="00000-000" 
                              value={formData.cep} 
                              onChange={e => {
                                const val = e.target.value;
                                setFormData({...formData, cep: val});
                                if (val.replace(/\D/g, '').length === 8) {
                                  handleCepSearch(val);
                                }
                              }}
                              maxLength={9}
                            />
                          </div>
                          <div className="md:col-span-2 space-y-2">
                            <Label>Endereço</Label>
                            <Input placeholder="Rua, Avenida..." value={formData.street} readOnly className="bg-muted/30" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                           <div className="space-y-2">
                             <Label>Número</Label>
                             <Input placeholder="123" value={formData.number} onChange={e => setFormData({...formData, number: e.target.value})} />
                           </div>
                           <div className="space-y-2">
                             <Label>Bairro</Label>
                             <Input value={formData.neighborhood} readOnly className="bg-muted/30" />
                           </div>
                           <div className="space-y-2">
                             <Label>Complemento</Label>
                             <Input placeholder="Apt, Sala, etc" value={formData.complement} onChange={e => setFormData({...formData, complement: e.target.value})} />
                           </div>
                           <div className="space-y-2 md:col-span-2">
                             <Label>Cidade/UF</Label>
                             <Input value={formData.city ? `${formData.city} - ${formData.state}` : ""} readOnly className="bg-muted/30" />
                           </div>
                        </div>

                        {shippingOptions.length > 0 && (
                          <div className="pt-4 space-y-3">
                            <p className="text-sm font-bold text-muted-foreground">Opções de Frete Disponíveis:</p>
                            {shippingOptions.map(opt => (
                              <div 
                                key={opt.id}
                                onClick={() => setSelectedShipping(opt)}
                                className={`p-4 rounded-xl border flex justify-between items-center cursor-pointer transition-all ${selectedShipping?.id === opt.id ? 'border-primary bg-primary/5' : 'bg-card'}`}
                              >
                                <div className="flex items-center gap-3">
                                  <Truck className="h-4 w-4 text-primary" />
                                  <div>
                                    <p className="text-sm font-bold">{opt.name}</p>
                                    <p className="text-[10px] text-muted-foreground">{opt.deliveryTime}</p>
                                  </div>
                                </div>
                                <span className="font-bold text-sm">R$ {opt.price.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-6 bg-muted/20 rounded-2xl border border-dashed border-primary/20 flex gap-4">
                         <MapPin className="h-6 w-6 text-primary shrink-0" />
                         <div>
                           <p className="font-bold text-sm">{settings.name} - Unidade Centro</p>
                           <p className="text-xs text-muted-foreground">Rua dos Pets, 123 - Centro, São Paulo - SP</p>
                           <p className="text-[10px] text-primary font-bold mt-2">Seg - Sáb: 09h às 19h</p>
                         </div>
                      </div>
                    )}

                    <Button className="w-full py-7 text-lg font-bold gap-2" onClick={() => setStep(2)}>
                      Ir para o Pagamento
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <form onSubmit={handleFinishCheckout} className="space-y-6">
                  <Card className="border-none shadow-premium">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-6 w-6 text-primary" />
                        Informações de Pagamento
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                           <Label>CPF/CNPJ do Titular</Label>
                           <Input placeholder="000.000.000-00" required value={formData.document} onChange={e => setFormData({...formData, document: e.target.value})} />
                         </div>
                         <div className="space-y-2">
                           <Label>WhatsApp para Contato</Label>
                           <Input placeholder="(11) 99999-9999" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                         </div>
                      </div>
                      
                      <div className="space-y-2 pt-4">
                        <Label>Número do Cartão</Label>
                        <Input placeholder="0000 0000 0000 0000" required value={formData.cardNumber} onChange={e => setFormData({...formData, cardNumber: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Validade</Label>
                          <Input placeholder="MM/AA" required value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <Label>CVV</Label>
                          <Input placeholder="123" required type="password" value={formData.cvv} onChange={e => setFormData({...formData, cvv: e.target.value})} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground px-2">
                    <Lock className="h-3 w-3" /> Pagamento 100% processado de forma segura via SSL.
                  </div>

                  <Button type="submit" className="w-full py-8 text-xl font-bold shadow-xl" disabled={isProcessing}>
                    {isProcessing ? <Loader2 className="h-6 w-6 animate-spin mr-2" /> : "Finalizar Compra"}
                    {!isProcessing && ` - R$ ${finalTotal.toFixed(2)}`}
                  </Button>
                  <Button variant="ghost" className="w-full" onClick={() => setStep(1)} type="button">
                    Voltar para Entrega
                  </Button>
                </form>
              </div>
            )}
          </div>

          {/* Right Sidebar: Review */}
          <div className="w-full lg:w-[380px]">
            <Card className="sticky top-24 border-none shadow-premium bg-card">
              <CardHeader>
                <CardTitle className="text-lg">Resumo da Compra</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                  {items.map(item => (
                    <div key={item.product.id} className="flex gap-3 items-center">
                      <img src={item.product.image} className="h-12 w-12 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">{item.quantity}un x R$ {item.product.price.toFixed(2)}</p>
                      </div>
                      <span className="text-sm font-bold">R$ {(item.quantity * item.product.price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Produtos:</span>
                    <span className="font-medium">R$ {totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Frete:</span>
                    <span className={`font-bold ${shippingFee === 0 ? 'text-green-600' : 'text-primary'}`}>
                      {shippingFee === 0 ? "GRÁTIS" : `R$ ${shippingFee.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                    <span>Total Final:</span>
                    <span className="text-primary">R$ {finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-center gap-2 p-3 bg-green-50 text-green-700 rounded-xl border border-green-100 text-[10px] font-bold">
                  <ShieldCheck className="h-4 w-4" />
                  COMPRA TOTALMENTE SEGURA
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
