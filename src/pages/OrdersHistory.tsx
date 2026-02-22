import { useOrders } from "@/contexts/OrdersContext";
import { useAuth } from "@/contexts/AuthContext";
import { Link, Navigate } from "react-router-dom";
import { Package, Calendar, ChevronRight, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

const OrdersHistory = () => {
  const { user } = useAuth();
  const { getOrdersByUser } = useOrders();

  if (!user) {
    return <Navigate to="/auth" />;
  }

  const userOrders = getOrdersByUser(user.id);

  return (
    <main className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-primary/10 rounded-2xl text-primary">
            <Package className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold">Meus Pedidos</h1>
            <p className="text-muted-foreground">Histórico de todas as suas compras</p>
          </div>
        </div>

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
                        {order.items.length > 4 && (
                          <div className="flex items-center justify-center h-12 w-12 rounded-full ring-2 ring-background bg-muted text-xs font-bold">
                            +{order.items.length - 4}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        {order.shipping_method && (
                          <p className="text-[10px] text-primary font-bold uppercase tracking-wider mb-1">
                            🚚 {order.shipping_method}
                          </p>
                        )}
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
      </div>
    </main>
  );
};

export default OrdersHistory;
