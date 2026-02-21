import React, { createContext, useContext, useState, useEffect } from "react";
import { CartItem } from "./CartContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface Order {
  id: string;
  user_id: string;
  items: any; // Stored as JSONB in Postgres
  total: number;
  status: "pendente" | "pago" | "enviado" | "entregue" | "cancelado";
  created_at: string;
  shipping_address: string;
}

interface OrdersContextType {
  orders: Order[];
  isLoading: boolean;
  createOrder: (userId: string, items: CartItem[], total: number, address: string, document: string, phone: string) => Promise<Order>;
  getOrdersByUser: (userId: string) => Order[];
  refreshOrders: () => Promise<void>;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export const OrdersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
    } else {
      setOrders(data as Order[]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const createOrder = async (userId: string, items: CartItem[], total: number, address: string, document: string, phone: string): Promise<Order> => {
    const newOrder = {
      user_id: userId,
      items: items, // Supabase handles JSON array
      total,
      status: "pendente",
      shipping_address: address,
      document,
      phone
    };


    
    const { data, error } = await supabase
      .from('orders')
      .insert([newOrder])
      .select();

    if (error) {
      toast.error("Erro ao processar pedido: " + error.message);
      throw error;
    }

    const createdOrder = data[0] as Order;
    setOrders(prev => [createdOrder, ...prev]);
    return createdOrder;
  };

  const getOrdersByUser = (userId: string) => orders.filter(o => o.user_id === userId);

  return (
    <OrdersContext.Provider value={{ 
      orders, 
      isLoading, 
      createOrder, 
      getOrdersByUser, 
      refreshOrders: fetchOrders 
    }}>
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = () => {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used within OrdersProvider");
  return ctx;
};
