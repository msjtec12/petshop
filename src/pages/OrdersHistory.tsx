import { useOrders } from "@/contexts/OrdersContext";
import { useAuth } from "@/contexts/AuthContext";
import { useAppointments } from "@/contexts/AppointmentsContext";
import { Link, Navigate } from "react-router-dom";
import { Package, Calendar, ChevronRight, ShoppingBag, Clock, Scissors } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

const OrdersHistory = () => {
  const { user } = useAuth();
  const { getOrdersByUser } = useOrders();
  const { appointments } = useAppointments();

  if (!user) {
    return <Navigate to="/auth" />;
  }

  const userOrders = getOrdersByUser(user.id);
  const userAppointments = appointments.filter(app => app.customer_id === user.id);

  return (
    <main className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-primary/10 rounded-2xl text-primary">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold">Meus Pedidos & Agendamentos</h1>
            <p className="text-muted-foreground">Gerencie suas compras e horários marcados</p>
          </div>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="bg-muted p-1">
            <TabsTrigger value="products" className="gap-2">
              <Package className="h-4 w-4" /> Compras
            </TabsTrigger>
            <TabsTrigger value="appointments" className="gap-2">
              <Calendar className="h-4 w-4" /> Agendamentos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            {userOrders.length === 0 ? (
              <Card className="border-dashed py-12 text-center">
                <CardContent>
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-4 text-4xl">
                    📦
                  </div>
                  <h2 className="text-xl font-bold mb-2">Você ainda não tem pedidos</h2>
                  <p className="text-muted-foreground mb-6">Que tal começar a explorar nossos produtos?</p>
                  <Button asChild>
                    <Link to="/produtos">Ir para a Loja</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {userOrders.map((order, idx) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="overflow-hidden hover:border-primary/50 transition-colors">
                      <CardHeader className="bg-muted/50 py-4 px-6">
                        <div className="flex flex-wrap justify-between items-center gap-4">
                          <div className="flex items-center gap-4">
                            <span className="font-mono text-sm font-bold text-primary">#{order.id}</span>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {new Date(order.created_at).toLocaleDateString("pt-BR")}
                            </div>
                          </div>
                          <Badge variant={order.status === "pago" ? "default" : "secondary"}>
                            {order.status.toUpperCase()}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-center">
                          <div className="flex -space-x-3 overflow-hidden">
                            {order.items.slice(0, 4).map((item, i) => (
                              <img
                                key={i}
                                className="inline-block h-12 w-12 rounded-full ring-2 ring-background object-cover"
                                src={item.product.image}
                                alt={item.product.name}
                              />
                            ))}
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Total do pedido</p>
                            <p className="text-lg font-bold text-foreground">
                              R$ {order.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="appointments">
            {userAppointments.length === 0 ? (
              <Card className="border-dashed py-12 text-center">
                <CardContent>
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-4 text-4xl">
                    ✂️
                  </div>
                  <h2 className="text-xl font-bold mb-2">Sem agendamentos</h2>
                  <p className="text-muted-foreground mb-6">Seu pet merece um banho ou tosa! Agende agora.</p>
                  <Button asChild>
                    <Link to="/servicos">Ver Serviços</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {userAppointments.map((app, idx) => (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="overflow-hidden hover:border-primary/50 transition-colors">
                      <CardHeader className="bg-muted/50 py-4 px-6">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="bg-primary/20 p-2 rounded-lg text-primary">
                              {app.pet_type === 'dog' ? '🐶' : app.pet_type === 'cat' ? '🐱' : '✨'}
                            </div>
                            <div>
                              <p className="text-sm font-bold">{app.pet_name}</p>
                              <p className="text-[10px] text-muted-foreground uppercase">{app.service_name}</p>
                            </div>
                          </div>
                          <Badge variant={app.status === 'confirmed' ? 'default' : app.status === 'pending' ? 'secondary' : 'destructive'}>
                            {app.status === 'confirmed' ? 'Confirmado' : app.status === 'pending' ? 'Pendente' : 'Cancelado'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-center">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-primary" />
                              <span className="font-medium">{new Date(app.date).toLocaleDateString("pt-BR")}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-primary" />
                              <span className="font-medium">{app.time}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Valor do serviço</p>
                            <p className="text-lg font-bold text-primary">R$ {app.total.toFixed(2)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
};

export default OrdersHistory;
