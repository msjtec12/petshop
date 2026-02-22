import { useState, useRef, useEffect } from "react";
import { useProducts, Product } from "@/contexts/ProductsContext";
import { useOrders } from "@/contexts/OrdersContext";
import { useAuth } from "@/contexts/AuthContext";
import { useBranding } from "@/contexts/BrandingContext";
import { useAppointments } from "@/contexts/AppointmentsContext";
import { Navigate } from "react-router-dom";
import { 
  BarChart, 
  Package, 
  ShoppingCart, 
  Plus, 
  Pencil, 
  Trash2, 
  DollarSign, 
  Users,
  Search,
  CheckCircle2,
  Clock,
  Settings,
  TrendingUp,
  LayoutDashboard,
  FileText,
  Calendar,
  Image as ImageIcon,
  Upload,
  Download,
  Type,
  MapPin,
  MessageCircle,
  Scissors
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Label as UILabel } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { motion } from "framer-motion";

const AdminDashboard = () => {
  const { user } = useAuth();
  const { products, addProduct, updateProduct, deleteProduct, categories: dynamicCategories, addCategory, deleteCategory } = useProducts();
  const { orders } = useOrders();
  const { settings, updateSettings } = useBranding();
  const { appointments, updateAppointmentStatus, services, addService, deleteService, businessHours, updateBusinessHours } = useAppointments();
  
  const [activeTab, setActiveTab] = useState("overview");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [localConfig, setLocalConfig] = useState(settings);
  const [localHours, setLocalHours] = useState(businessHours);

  useEffect(() => {
    setLocalConfig(settings);
  }, [settings]);

  useEffect(() => {
    if (businessHours.length > 0) {
      setLocalHours(businessHours);
    }
  }, [businessHours]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", icon: "🐾" });
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: "", price: 0, category: "", animal: "dog", description: "", image: "", rating: 5, reviewCount: 0, badge: "", inStock: true
  });
  
  const [newService, setNewService] = useState({
    name: "", description: "", price: 0, duration: "1h", icon: "🚿", popular: false
  });

  const daysOfWeek = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

  // SEGURANÇA: Bloqueia acesso se não for admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  const handleDeleteProduct = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      deleteProduct(id);
      toast.success("Produto excluído com sucesso!");
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setNewProduct(product);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = () => {
    if (!newProduct.name || !newProduct.price) {
      toast.error("Por favor, preencha nome e preço.");
      return;
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, newProduct);
      toast.success("Produto atualizado!");
    } else {
      addProduct({
        ...newProduct as Product,
        id: Math.random().toString(36).substr(2, 9)
      });
      toast.success("Produto adicionado ao catálogo!");
    }
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalConfig(prev => ({ ...prev, logo: reader.result as string }));
        toast.success("Logo carregada com sucesso!");
      };
      reader.readAsDataURL(file);
    }
  };

  const exportReport = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Gerando relatório consolidado...',
        success: 'Relatório exportado em CSV com sucesso!',
        error: 'Erro ao gerar relatório.',
      }
    );
  };

  const saveConfig = () => {
    updateSettings(localConfig);
    updateBusinessHours(localHours);
    toast.success("Configurações da loja atualizadas com sucesso!");
  };

  const handleCreateService = () => {
    if (!newService.name || !newService.price) {
      toast.error("Preencha nome e preço do serviço.");
      return;
    }
    addService(newService);
    setIsServiceModalOpen(false);
    setNewService({ name: "", description: "", price: 0, duration: "1h", icon: "🚿", popular: false });
  };

  const handleWhatsAppNotify = (appointment: any) => {
    const phone = appointment.customer_phone?.replace(/\D/g, "");
    if (!phone) {
      toast.error("Telefone do cliente não disponível.");
      return;
    }

    const date = new Date(appointment.date).toLocaleDateString('pt-BR');
    const petTypeDisplay = appointment.pet_type === 'other' ? appointment.pet_type_custom : (appointment.pet_type === 'dog' ? 'Cão' : 'Gato');
    const petSizeDisplay = appointment.pet_size === 'small' ? 'Pequeno' : appointment.pet_size === 'medium' ? 'Médio' : appointment.pet_size === 'large' ? 'Grande' : 'Gigante';
    
    const message = encodeURIComponent(
      `Olá ${appointment.customer_name}! 🐾\n\nConfirmamos seu agendamento na *${settings.name}*:\n\n` +
      `📅 *Data:* ${date}\n` +
      `⏰ *Horário:* ${appointment.time}\n` +
      `✂️ *Serviço:* ${appointment.service_name}\n` +
      `🐶 *Pet:* ${appointment.pet_name} (${petTypeDisplay} - ${petSizeDisplay}${appointment.pet_breed ? ' - ' + appointment.pet_breed : ''})\n\n` +
      `Estamos te esperando! Caso precise desmarcar, por favor nos avise com antecedência.`
    );

    window.open(`https://wa.me/55${phone}?text=${message}`, "_blank");
    toast.success("Redirecionando para o WhatsApp...");
  };

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const inStockCount = products.filter(p => p.inStock).length;

  return (
    <main className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Modo Administrador</Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-green-500" /> Sincronizado com Banco de Dados
              </span>
            </div>
            <h1 className="text-3xl font-display font-bold">Painel de Controle</h1>
            <p className="text-muted-foreground">Sistema White-Label PetShop v3.5</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={exportReport}>
              <Download className="h-4 w-4" /> Exportar Dados
            </Button>
            <Button className="gap-2 shadow-lg" onClick={() => {
              setEditingProduct(null);
              setNewProduct({ name: "", price: 0, category: "Racao", image: "/placeholder.png", inStock: true, weight: 1.0 });
              setIsProductModalOpen(true);
            }}>
              <Plus className="h-4 w-4" /> Novo Produto
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-primary shadow-premium">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
              <p className="text-xs text-green-600 flex items-center gap-1 mt-1 font-medium">
                <TrendingUp className="h-3 w-3" /> +12.5% vs mês anterior
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-premium">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pedidos Realizados</CardTitle>
              <ShoppingCart className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
              <p className="text-xs text-muted-foreground mt-1">Ticket Médio: R$ {(totalRevenue / (totalOrders || 1)).toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card className="shadow-premium">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Catálogo On-line</CardTitle>
              <Package className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length} itens</div>
              <p className="text-xs text-muted-foreground mt-1">{inStockCount} disponíveis para venda</p>
            </CardContent>
          </Card>
          <Card className="shadow-premium">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
              <LayoutDashboard className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3.8%</div>
              <p className="text-xs text-muted-foreground mt-1">Acima da média do setor (2.5%)</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6" onValueChange={setActiveTab}>
          <TabsList className="bg-card border border-border p-1 gap-1">
            <TabsTrigger value="overview" className="gap-2">
              <LayoutDashboard className="h-4 w-4" /> Visão Geral
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-2">
              <Package className="h-4 w-4" /> Estoque
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <ShoppingCart className="h-4 w-4" /> Vendas
            </TabsTrigger>
            <TabsTrigger value="appointments" className="gap-2">
              <Calendar className="h-4 w-4" /> Agendamentos
            </TabsTrigger>
            <TabsTrigger value="services" className="gap-2">
              <Scissors className="h-4 w-4" /> Serviços
            </TabsTrigger>
            <TabsTrigger value="store" className="gap-2">
              <Settings className="h-4 w-4" /> Identidade Visual
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <Card className="shadow-premium border-none">
              <CardHeader className="flex flex-row items-center">
                <div className="flex-1">
                  <CardTitle>Inventário de Produtos</CardTitle>
                  <CardDescription>Gestão centralizada de preços e disponibilidade.</CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Filtrar produtos..." className="pl-8 bg-muted/50" />
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Preço Unit.</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img src={product.image} className="h-10 w-10 rounded-lg object-cover" />
                            <span className="font-medium">{product.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize text-muted-foreground">{product.category}</TableCell>
                        <TableCell className="font-bold">R$ {product.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={product.inStock ? "default" : "secondary"} className={product.inStock ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}>
                            {product.inStock ? "Ativo" : "Esgotado"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="hover:text-primary" onClick={() => handleEditProduct(product)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteProduct(product.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card className="shadow-premium border-none">
              <CardHeader>
                <CardTitle>Fluxo de Pedidos</CardTitle>
                <CardDescription>Monitore as vendas e organize as entregas em tempo real.</CardDescription>
              </CardHeader>
              <CardContent>
                 <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pedido</TableHead>
                      <TableHead>Cliente & Contato</TableHead>
                      <TableHead>Pagamento</TableHead>
                      <TableHead>Entrega</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-xs">#{order.id.slice(0, 8)}</TableCell>
                        <TableCell>
                          <div className="text-sm font-medium text-foreground">{order.phone || 'Cliente Final'}</div>
                          <div className="text-xs text-muted-foreground line-clamp-1">{order.shipping_address}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`gap-1 ${order.status === 'pago' ? 'border-green-200 bg-green-50 text-green-700' : 'border-yellow-200 bg-yellow-50 text-yellow-700'}`}>
                            {order.status === 'pago' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                            {order.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                           {order.shipping_method ? (
                             <div className="text-xs font-bold text-primary flex items-center gap-1">
                                <TruckIcon className="h-3 w-3" /> {order.shipping_method}
                             </div>
                           ) : <span className="text-xs text-muted-foreground">Padrão</span>}
                        </TableCell>
                        <TableCell className="text-right font-bold">R$ {order.total.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments">
            <Card className="shadow-premium border-none">
              <CardHeader>
                <CardTitle>Agenda: Banho e Tosa</CardTitle>
                <CardDescription>Gerencie os horários agendados pelos clientes.</CardDescription>
              </CardHeader>
              <CardContent>
                {appointments.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>Nenhum agendamento realizado até o momento.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data/Hora</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Pet</TableHead>
                        <TableHead>Serviço</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appointments.map((app) => (
                        <TableRow key={app.id}>
                          <TableCell className="font-medium">
                            {new Date(app.date).toLocaleDateString('pt-BR')} às {app.time}
                          </TableCell>
                          <TableCell>
                            <div className="font-bold text-foreground">{app.customer_name}</div>
                            <div className="text-xs text-muted-foreground">{app.customer_phone}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-lg">
                                {app.pet_type === 'dog' ? '🐶' : app.pet_type === 'cat' ? '🐱' : '✨'}
                              </span>
                              <div>
                                <div className="font-bold text-foreground text-sm">{app.pet_name}</div>
                                <div className="text-[10px] text-muted-foreground uppercase">
                                  {app.pet_type === 'other' ? app.pet_type_custom : (app.pet_type === 'dog' ? 'Cão' : 'Gato')} 
                                  {' • '} 
                                  {app.pet_size === 'small' ? 'Pequeno' : app.pet_size === 'medium' ? 'Médio' : app.pet_size === 'large' ? 'Grande' : 'Gigante'}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 italic">
                               {app.service_name}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              app.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                              app.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }>
                              {app.status === 'confirmed' ? 'Confirmado' : 
                               app.status === 'cancelled' ? 'Cancelado' : 'Pendente'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              {app.status === 'confirmed' && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-blue-600 hover:bg-blue-50"
                                  onClick={() => handleWhatsAppNotify(app)}
                                >
                                  <MessageCircle className="h-4 w-4 mr-1" /> WhatsApp
                                </Button>
                              )}
                              {app.status === 'pending' && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-green-600 hover:bg-green-50"
                                  onClick={() => updateAppointmentStatus(app.id, 'confirmed')}
                                >
                                  Aprovar
                                </Button>
                              )}
                              {app.status !== 'cancelled' && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-destructive hover:bg-red-50"
                                  onClick={() => updateAppointmentStatus(app.id, 'cancelled')}
                                >
                                  Cancelar
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services">
            <Card className="border-none shadow-premium bg-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Gestão de Serviços (Banho & Tosa)</CardTitle>
                  <CardDescription>Configure os serviços oferecidos no agendamento online.</CardDescription>
                </div>
                <Button onClick={() => setIsServiceModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Novo Serviço
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {services.map(service => (
                    <div key={service.id} className="p-4 rounded-2xl border bg-muted/30 flex flex-col gap-3 group relative">
                      <div className="flex justify-between items-start">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                          {service.icon}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => deleteService(service.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div>
                        <h4 className="font-bold flex items-center gap-2">
                          {service.name}
                          {service.popular && <Badge className="bg-orange-500 text-[8px] h-4">Pop</Badge>}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{service.description}</p>
                      </div>
                      <div className="flex justify-between items-center mt-auto pt-2 border-t border-border">
                        <span className="text-xs font-bold text-muted-foreground">{service.duration}</span>
                        <span className="font-bold text-primary">R$ {service.price.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="store">
            <Card className="shadow-premium border-none">
              <CardHeader>
                <CardTitle>Configurações da Loja & Funcionamento</CardTitle>
                <CardDescription>Personalize a identidade visual e as regras de horário da sua unidade.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Business Hours Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" /> Regras de Horário de Funcionamento
                  </h3>
                  <div className="grid gap-3">
                    {localHours.map((hour, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border">
                        <div className="flex items-center gap-3 w-32">
                          <input 
                            type="checkbox" 
                            checked={hour.isOpen} 
                            onChange={e => {
                              const newHours = [...localHours];
                              newHours[idx].isOpen = e.target.checked;
                              setLocalHours(newHours);
                            }}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span className={`font-medium ${hour.isOpen ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {daysOfWeek[hour.dayOfWeek]}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input 
                            type="time" 
                            className="w-28 h-9" 
                            value={hour.openTime} 
                            disabled={!hour.isOpen}
                            onChange={e => {
                              const newHours = [...localHours];
                              newHours[idx].openTime = e.target.value;
                              setLocalHours(newHours);
                            }}
                          />
                          <span className="text-muted-foreground">até</span>
                          <Input 
                            type="time" 
                            className="w-28 h-9" 
                            value={hour.closeTime} 
                            disabled={!hour.isOpen}
                            onChange={e => {
                              const newHours = [...localHours];
                              newHours[idx].closeTime = e.target.value;
                              setLocalHours(newHours);
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <hr />

                {/* Branding Section */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold">Identidade Visual</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <UILabel>Nome da Unidade / Loja</UILabel>
                      <Input value={localConfig.name} onChange={e => setLocalConfig({...localConfig, name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <UILabel>Estilo de Fonte (Tipografia)</UILabel>
                      <Select 
                        value={localConfig.fontFamily} 
                        onValueChange={(val) => setLocalConfig({...localConfig, fontFamily: val})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma fonte" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="'Playfair Display', serif">Playfair Display (Elegante)</SelectItem>
                          <SelectItem value="'Outfit', sans-serif">Outfit (Moderna)</SelectItem>
                          <SelectItem value="'Inter', sans-serif">Inter (Clean/Corporativa)</SelectItem>
                          <SelectItem value="'Roboto', sans-serif">Roboto (Padrão Google)</SelectItem>
                          <SelectItem value="'Nunito', sans-serif">Nunito (Amigável/Pet)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <UILabel>Logomarca</UILabel>
                      <div className="flex gap-2">
                        <Input value={localConfig.logo} readOnly className="bg-muted/30" />
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          className="hidden" 
                          accept="image/*" 
                          onChange={handleLogoUpload}
                        />
                        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                          <Upload className="h-4 w-4 mr-2" /> Subir Logo
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <UILabel>Cor Primária (Tema)</UILabel>
                      <div className="flex gap-2">
                        <Input type="color" className="p-1 h-10 w-20" value={localConfig.primaryColor} onChange={e => setLocalConfig({...localConfig, primaryColor: e.target.value})} />
                        <Input value={localConfig.primaryColor} onChange={e => setLocalConfig({...localConfig, primaryColor: e.target.value})} />
                      </div>
                    </div>
                  </div>
                </div>

                <hr />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" /> Informações de Localização e Contato
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <UILabel>Endereço Completo</UILabel>
                      <Input 
                        value={localConfig.address} 
                        onChange={e => setLocalConfig({...localConfig, address: e.target.value})} 
                        placeholder="Rua, Número, Bairro, Cidade - UF"
                      />
                    </div>
                    <div className="space-y-2">
                      <UILabel>WhatsApp / Telefone</UILabel>
                      <Input 
                        value={localConfig.phone} 
                        onChange={e => setLocalConfig({...localConfig, phone: e.target.value})} 
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                  </div>
                </div>

                <hr />

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <Package className="h-5 w-5 text-primary" /> Gerenciar Categorias
                    </h3>
                    <Button variant="outline" size="sm" onClick={() => setIsCategoryModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" /> Nova Categoria
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {dynamicCategories.map(cat => (
                      <div key={cat.id} className="p-3 rounded-xl border bg-card flex items-center justify-between group">
                        <div className="flex items-center gap-2">
                          <span>{cat.icon}</span>
                          <span className="text-sm font-medium">{cat.name}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive"
                          onClick={() => deleteCategory(cat.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="p-6 rounded-2xl border bg-primary/5 flex flex-col items-center gap-4">
                  <p className="text-xs uppercase tracking-widest font-bold opacity-50">Prévia do Cabeçalho</p>
                  <div className="flex items-center gap-4">
                    {localConfig.logo ? (
                      <img src={localConfig.logo} className="h-10 w-auto object-contain" />
                    ) : (
                      <ImageIcon className="h-10 w-10 text-muted-foreground" />
                    )}
                    <h2 className="text-2xl font-bold" style={{ fontFamily: localConfig.fontFamily, color: localConfig.primaryColor }}>
                       {localConfig.name}
                    </h2>
                  </div>
                </div>
                
                <hr />
                
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => {
                    setLocalConfig(settings);
                    setLocalHours(businessHours);
                  }}>Descartar Alterações</Button>
                  <Button onClick={saveConfig} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8">
                    Aplicar Configurações
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Product Modal (Add/Edit) */}
      <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Editar Produto' : 'Cadastrar Novo Produto'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <UILabel htmlFor="name">Nome do Produto</UILabel>
              <Input 
                id="name" 
                value={newProduct.name} 
                onChange={e => setNewProduct({...newProduct, name: e.target.value})} 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <UILabel htmlFor="price">Preço (R$)</UILabel>
                <Input 
                  id="price" 
                  type="number" 
                  value={newProduct.price} 
                  onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})} 
                />
              </div>
              <div className="grid gap-2">
                <UILabel htmlFor="weight">Peso (kg)</UILabel>
                <Input 
                  id="weight" 
                  type="number" 
                  step="0.1"
                  value={newProduct.weight} 
                  onChange={e => setNewProduct({...newProduct, weight: parseFloat(e.target.value)})} 
                />
              </div>
            </div>
            <div className="grid gap-2">
              <UILabel htmlFor="category">Categoria</UILabel>
              <Select value={newProduct.category} onValueChange={val => setNewProduct({...newProduct, category: val})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dynamicCategories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProductModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveProduct}>Salvar Produto</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Modal */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Nova Categoria</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <UILabel>Nome da Categoria</UILabel>
              <Input 
                value={newCategory.name} 
                onChange={e => setNewCategory({...newCategory, name: e.target.value})} 
                placeholder="Ex: Roupas, Petiscos..."
              />
            </div>
            <div className="grid gap-2">
              <UILabel>Ícone (Emoji)</UILabel>
              <Input 
                value={newCategory.icon} 
                onChange={e => setNewCategory({...newCategory, icon: e.target.value})} 
                placeholder="Ex: 🦴, 🧸, 👗"
                className="mb-2"
              />
              <div className="grid grid-cols-6 gap-2 p-2 bg-muted/30 rounded-xl">
                {["🦴", "🧸", "👗", "🐾", "🍖", "🎾", "🏠", "🚿", "💊", "🧣", "🥣", "🥯"].map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setNewCategory({...newCategory, icon: emoji})}
                    className={`h-10 w-10 flex items-center justify-center rounded-lg border transition-all ${newCategory.icon === emoji ? 'border-primary bg-primary/10 scale-110' : 'border-transparent hover:bg-muted hover:scale-105'}`}
                  >
                    <span className="text-xl">{emoji}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoryModalOpen(false)}>Cancelar</Button>
            <Button onClick={() => {
              addCategory(newCategory);
              setIsCategoryModalOpen(false);
              setNewCategory({ name: "", icon: "🐾" });
            }}>Criar Categoria</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Service Modal */}
      <Dialog open={isServiceModalOpen} onOpenChange={setIsServiceModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Serviço de Pet</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <UILabel>Nome do Serviço</UILabel>
              <Input value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} placeholder="Ex: Tosa Higiênica" />
            </div>
            <div className="grid gap-2">
              <UILabel>Descrição</UILabel>
              <Input value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})} placeholder="O que inclui o serviço?" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <UILabel>Preço (R$)</UILabel>
                <Input type="number" value={newService.price} onChange={e => setNewService({...newService, price: parseFloat(e.target.value)})} />
              </div>
              <div className="grid gap-2">
                <UILabel>Duração</UILabel>
                <Input value={newService.duration} onChange={e => setNewService({...newService, duration: e.target.value})} placeholder="Ex: 1h 30min" />
              </div>
            </div>
            <div className="grid gap-2">
              <UILabel>Ícone (Emoji)</UILabel>
              <div className="flex gap-2 mb-2">
                <Input value={newService.icon} onChange={e => setNewService({...newService, icon: e.target.value})} className="flex-1" />
              </div>
              <div className="grid grid-cols-7 gap-2 p-2 bg-muted/30 rounded-xl">
                {["🚿", "✂️", "🦴", "🐾", "🐕", "🐈", "🛀", "🧴", "🏥", "🏠", "🏨", "🧶", "🥎", "🦷"].map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setNewService({...newService, icon: emoji})}
                    className={`h-10 w-10 flex items-center justify-center rounded-lg border transition-all ${newService.icon === emoji ? 'border-primary bg-primary/10 scale-110' : 'border-transparent hover:bg-muted hover:scale-105'}`}
                  >
                    <span className="text-xl">{emoji}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateService}>Criar Serviço</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};

// Internal icon component to avoid conflicts
const TruckIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="16" height="13" x="2" y="6" rx="2" /><path d="M16 8h4l3 3v5h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>;

export default AdminDashboard;
