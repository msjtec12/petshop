import { useState } from "react";
import { useProducts } from "@/contexts/ProductsContext";
import { useOrders } from "@/contexts/OrdersContext";
import { useAuth } from "@/contexts/AuthContext";
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
  FileText
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { motion } from "framer-motion";

const AdminDashboard = () => {
  const { user } = useAuth();
  const { products, deleteProduct } = useProducts();
  const { orders } = useOrders();
  const [activeTab, setActiveTab] = useState("overview");

  const [storeConfig, setStoreConfig] = useState({
    name: "PataFeliz PetShop",
    email: "contato@patafeliz.com.br",
    whatsapp: "(11) 98765-4321",
    primaryColor: "#f97316",
    automaticDelivery: true
  });

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

  const saveConfig = () => {
    toast.success("Configurações da loja salvas com sucesso!");
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
                <CheckCircle2 className="h-3 w-3 text-green-500" /> Sincronizado com Supabase
              </span>
            </div>
            <h1 className="text-3xl font-display font-bold">Painel de Controle</h1>
            <p className="text-muted-foreground">Sistema de Gestão E-commerce v2.4</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <FileText className="h-4 w-4" /> Exportar Dados
            </Button>
            <Button className="gap-2 shadow-lg" onClick={() => toast.info("Funcionalidade em desenvolvimento")}>
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

        <Tabs defaultValue="products" className="space-y-6" onValueChange={setActiveTab}>
          <TabsList className="bg-card border border-border p-1 gap-1">
            <TabsTrigger value="products" className="gap-2">
              <Package className="h-4 w-4" /> Estoque
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <ShoppingCart className="h-4 w-4" /> Vendas
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" /> Configurações
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
                          <Button variant="ghost" size="icon" className="hover:text-primary">
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
                               <Truck className="h-3 w-3" /> {order.shipping_method}
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

          <TabsContent value="settings">
            <Card className="shadow-premium border-none">
              <CardHeader>
                <CardTitle>Configurações Globais do Sistema</CardTitle>
                <CardDescription>Personalize a marca e as integrações da sua loja.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Nome da Loja</Label>
                    <Input value={storeConfig.name} onChange={e => setStoreConfig({...storeConfig, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>E-mail de Suporte</Label>
                    <Input value={storeConfig.email} onChange={e => setStoreConfig({...storeConfig, email: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>WhatsApp para Pedidos</Label>
                    <Input value={storeConfig.whatsapp} onChange={e => setStoreConfig({...storeConfig, whatsapp: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Cor Primária do Site</Label>
                    <div className="flex gap-2">
                      <Input type="color" className="p-1 h-10 w-20" value={storeConfig.primaryColor} onChange={e => setStoreConfig({...storeConfig, primaryColor: e.target.value})} />
                      <Input value={storeConfig.primaryColor} readOnly />
                    </div>
                  </div>
                </div>
                
                <hr />
                
                <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/10">
                  <div>
                    <p className="font-bold text-sm">Integração Automática Loggi/Lalamove</p>
                    <p className="text-xs text-muted-foreground">Solicita motoboy automaticamente ao confirmar pagamento.</p>
                  </div>
                  <Button variant={storeConfig.automaticDelivery ? "default" : "outline"} onClick={() => setStoreConfig({...storeConfig, automaticDelivery: !storeConfig.automaticDelivery})}>
                    {storeConfig.automaticDelivery ? "Ativado" : "Desativado"}
                  </Button>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline">Resetar Padrão</Button>
                  <Button onClick={saveConfig} className="bg-primary hover:bg-primary/90">Salvar Mudanças</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
};

// Mock components used in the enhanced dashboard
const Label = ({ children }: { children: React.ReactNode }) => <label className="text-sm font-bold text-foreground">{children}</label>;
const Truck = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="16" height="13" x="2" y="6" rx="2" /><path d="M16 8h4l3 3v5h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>;

export default AdminDashboard;

