import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useOrders } from "@/contexts/OrdersContext";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ArrowLeft, ShoppingCart, CreditCard } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const Cart = () => {
  const { items, updateQuantity, removeItem, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { createOrder } = useOrders();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      toast.info("Acesse sua conta para finalizar a compra.");
      navigate("/auth");
      return;
    }
    navigate("/checkout");
  };



  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="h-20 w-20 text-muted-foreground/30 mx-auto mb-4" />
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">Carrinho vazio</h1>
          <p className="text-muted-foreground mb-6">Que tal explorar nossos produtos?</p>
          <Link
            to="/produtos"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity shadow-primary"
          >
            Ver Produtos
          </Link>
        </div>
      </main>
    );
  }

  const shipping = totalPrice >= 199 ? 0 : 19.90;
  const finalTotal = totalPrice + shipping;

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Link to="/produtos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4" /> Continuar comprando
        </Link>

        <h1 className="text-3xl font-display font-bold text-foreground mb-8">Meu Carrinho</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, i) => (
              <motion.div
                key={item.product.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex gap-4 bg-card rounded-xl border border-border p-4 shadow-card"
              >
                <img src={item.product.image} alt={item.product.name} className="w-24 h-24 object-cover rounded-lg" />
                <div className="flex-1 min-w-0">
                  <Link to={`/produto/${item.product.id}`} className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1">
                    {item.product.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">{item.product.brand}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="p-1.5 rounded border border-border hover:bg-muted">
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="font-bold w-8 text-center text-foreground">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="p-1.5 rounded border border-border hover:bg-muted">
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <span className="font-bold text-primary text-lg">R$ {(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
                <button onClick={() => removeItem(item.product.id)} className="self-start p-2 text-destructive hover:bg-destructive/10 rounded">
                  <Trash2 className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-card h-fit sticky top-28 space-y-4">
            <h2 className="font-display font-bold text-lg text-foreground">Resumo do Pedido</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-foreground">
                <span>Subtotal</span>
                <span>R$ {totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-foreground">
                <span>Frete</span>
                <span className={shipping === 0 ? "text-secondary font-semibold" : ""}>
                  {shipping === 0 ? "Grátis!" : `R$ ${shipping.toFixed(2)}`}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-muted-foreground">
                  Faltam R$ {(199 - totalPrice).toFixed(2)} para frete grátis
                </p>
              )}
            </div>
            <div className="border-t border-border pt-4 flex justify-between text-lg font-bold">
              <span className="text-foreground">Total</span>
              <span className="text-primary">R$ {finalTotal.toFixed(2)}</span>
            </div>
            <button 
              onClick={handleCheckout}
              className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-lg hover:opacity-90 transition-opacity shadow-primary flex items-center justify-center gap-2"
            >
              <CreditCard className="h-5 w-5" /> Finalizar Compra
            </button>

          </div>
        </div>
      </div>
    </main>
  );
};

export default Cart;
