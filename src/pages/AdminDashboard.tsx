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
  Clock
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
  const { products, deleteProduct, addProduct } = useProducts();
  const { orders } = useOrders();
  const [activeTab, setActiveTab] = useState("overview");

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

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const inStockCount = products.filter(p => p.inStock).length;

  return (
    <main className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold">Painel Administrativo</h1>
            <p className="text-muted-foreground">Gerencie seus produtos, pedidos e clientes</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Relatórios</Button>
            <Button onClick={() => toast.info("Funcionalidade em desenvolvimento")}>
              <Plus className="h-4 w-4 mr-2" /> Novo Produto
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
              <p className="text-xs text-muted-foreground">+12% em relação ao mês anterior</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pedidos Totais</CardTitle>
              <ShoppingCart className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
              <p className="text-xs text-muted-foreground">24 novos pedidos ignorando mocks</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Em Estoque</CardTitle>
              <Package className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inStockCount}</div>
              <p className="text-xs text-muted-foreground">de um total de {products.length} itens</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Clientes</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">48</div>
              <p className="text-xs text-muted-foreground">+4 esta semana</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="products" className="space-y-6" onValueChange={setActiveTab}>
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" /> Produtos
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" /> Pedidos
            </TabsTrigger>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" /> Visão Geral
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <Card>
              <CardHeader className="flex flex-row items-center">
                <div className="flex-1">
                  <CardTitle>Produtos</CardTitle>
                  <CardDescription>Visualize e gerencie seu catálogo de produtos.</CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar..." className="pl-8" />
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Imagem</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Estoque</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <img src={product.image} alt={product.name} className="h-10 w-10 rounded-md object-cover" />
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="capitalize">{product.category}</TableCell>
                        <TableCell>R$ {product.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={product.inStock ? "default" : "secondary"}>
                            {product.inStock ? "Disponível" : "Indisponível"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => toast.info("Editar funcionalidade em breve")}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteProduct(product.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Últimos Pedidos</CardTitle>
                <CardDescription>Acompanhe e atualize o status dos pedidos.</CardDescription>
              </CardHeader>
              <CardContent>
                 <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Detalhes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum pedido realizado ainda.</TableCell>
                      </TableRow>
                    ) : (
                      orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-xs">#{order.id}</TableCell>
                          <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>R$ {order.total.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="flex w-fit items-center gap-1">
                              {order.status === "pago" ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <Clock className="h-3 w-3 text-yellow-500" />}
                              {order.status.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground">
                            {order.items.length} itens
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
};

export default AdminDashboard;
