import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: string;
  icon: string; // Icon name or emoji
  popular?: boolean;
}

export interface BusinessHours {
  dayOfWeek: number; // 0-6 (Sun-Sat)
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  slotDuration: number; // minutes
}

export interface Appointment {
  id: string;
  customer_id: string;
  service_id: number;
  service_name: string;
  date: string; // ISO string
  time: string; // HH:mm
  status: 'pending' | 'confirmed' | 'cancelled';
  total: number;
  customer_name?: string;
  customer_phone?: string;
  pet_name: string;
  pet_type: 'dog' | 'cat' | 'other';
  pet_type_custom?: string;
  pet_size: 'small' | 'medium' | 'large' | 'giant';
  pet_breed?: string;
}

interface AppointmentsContextType {
  appointments: Appointment[];
  services: Service[];
  businessHours: BusinessHours[];
  isLoading: boolean;
  createAppointment: (appointment: Omit<Appointment, "id" | "status">) => Promise<Appointment>;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => Promise<void>;
  isSlotAvailable: (date: string, time: string) => boolean;
  addService: (service: Omit<Service, "id">) => Promise<void>;
  updateService: (id: number, service: Partial<Service>) => Promise<void>;
  deleteService: (id: number) => Promise<void>;
  updateBusinessHours: (hours: BusinessHours[]) => Promise<void>;
}

const AppointmentsContext = createContext<AppointmentsContextType | undefined>(undefined);

export const AppointmentsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBusinessHours = async () => {
    const { data, error } = await supabase.from('business_hours').select('*').order('dayOfWeek', { ascending: true });
    if (error || !data || data.length === 0) {
      // Default: Mon-Sat 08:00-18:00
      setBusinessHours([
        { dayOfWeek: 0, isOpen: false, openTime: "08:00", closeTime: "18:00", slotDuration: 90 },
        { dayOfWeek: 1, isOpen: true, openTime: "08:00", closeTime: "18:00", slotDuration: 90 },
        { dayOfWeek: 2, isOpen: true, openTime: "08:00", closeTime: "18:00", slotDuration: 90 },
        { dayOfWeek: 3, isOpen: true, openTime: "08:00", closeTime: "18:00", slotDuration: 90 },
        { dayOfWeek: 4, isOpen: true, openTime: "08:00", closeTime: "18:00", slotDuration: 90 },
        { dayOfWeek: 5, isOpen: true, openTime: "08:00", closeTime: "18:00", slotDuration: 90 },
        { dayOfWeek: 6, isOpen: true, openTime: "08:00", closeTime: "14:00", slotDuration: 90 },
      ]);
    } else {
      setBusinessHours(data);
    }
  };

  const fetchServices = async () => {
    const { data, error } = await supabase.from('services').select('*').order('id', { ascending: true });
    if (error || !data || data.length === 0) {
      // Default services if none in DB
      setServices([
        { id: 1, name: "Banho & Higiene", description: "Limpeza profunda, corte de unhas e limpeza de ouvidos.", price: 60, duration: "1h", icon: "🚿", popular: true },
        { id: 2, name: "Tosa Máquina", description: "Corte padrão com máquina para todas as raças.", price: 90, duration: "1h 30min", icon: "✂️" },
        { id: 3, name: "Tosa Tesoura", description: "Corte detalhado feito inteiramente na tesoura.", price: 120, duration: "2h 30min", icon: "🎨" }
      ]);
    } else {
      setServices(data);
    }
  };

  const fetchAppointments = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.error("Error fetching appointments:", error);
      // Fallback to local storage or empty for now
      const saved = localStorage.getItem('petshop_appointments');
      if (saved) setAppointments(JSON.parse(saved));
    } else {
      setAppointments(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBusinessHours();
    fetchServices();
    fetchAppointments();
  }, []);

  useEffect(() => {
    localStorage.setItem('petshop_appointments', JSON.stringify(appointments));
  }, [appointments]);

  const isSlotAvailable = (date: string, time: string) => {
    // Check business hours first
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getUTCDay(); // 0 is Sunday, 6 is Saturday
    const config = businessHours.find(h => h.dayOfWeek === dayOfWeek);

    if (!config || !config.isOpen) return false;
    
    // Simple check: is time within open/close range?
    if (time < config.openTime || time >= config.closeTime) return false;

    // Check existing appointments
    return !appointments.some(app => 
      app.date === date && 
      app.time === time && 
      app.status !== 'cancelled'
    );
  };

  const createAppointment = async (app: Omit<Appointment, "id" | "status">): Promise<Appointment> => {
    if (!isSlotAvailable(app.date, app.time)) {
      throw new Error("Este horário já está preenchido. Por favor, escolha outro.");
    }

    const newApp: Appointment = {
      ...app,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending'
    };

    // Try to save to Supabase
    const { data, error } = await supabase
      .from('appointments')
      .insert([newApp])
      .select();

    if (error) {
      console.warn("Supabase error, saving locally:", error);
      setAppointments(prev => [...prev, newApp]);
      return newApp;
    }

    setAppointments(prev => [...prev, data[0]]);
    return data[0];
  };

  const updateAppointmentStatus = async (id: string, status: Appointment['status']) => {
    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id);

    if (error) {
       console.warn("Supabase update error, updating locally");
    }
    
    setAppointments(prev => prev.map(app => app.id === id ? { ...app, status } : app));
  };

  const addService = async (s: Omit<Service, "id">) => {
    const { data, error } = await supabase.from('services').insert([s]).select();
    if (!error && data) {
      setServices(prev => [...prev, data[0]]);
      toast.success("Serviço adicionado!");
    } else {
      // Fallback
      const newService = { ...s, id: Date.now() };
      setServices(prev => [...prev, newService]);
      toast.success("Serviço adicionado localmente");
    }
  };

  const updateService = async (id: number, s: Partial<Service>) => {
    const { error } = await supabase.from('services').update(s).eq('id', id);
    if (!error) {
      setServices(prev => prev.map(item => item.id === id ? { ...item, ...s } : item));
      toast.success("Serviço atualizado!");
    }
  };

  const deleteService = async (id: number) => {
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (!error) {
      setServices(prev => prev.filter(s => s.id !== id));
      toast.success("Serviço removido!");
    }
  };

  const updateBusinessHours = async (hours: BusinessHours[]) => {
    const { error } = await supabase.from('business_hours').upsert(hours);
    if (!error) {
      setBusinessHours(hours);
      toast.success("Horários de funcionamento atualizados!");
    } else {
      setBusinessHours(hours);
      toast.success("Horários salvos localmente");
    }
  };

  return (
    <AppointmentsContext.Provider value={{ 
      appointments, 
      services,
      businessHours,
      isLoading, 
      createAppointment, 
      updateAppointmentStatus,
      isSlotAvailable,
      addService,
      updateService,
      deleteService,
      updateBusinessHours
    }}>
      {children}
    </AppointmentsContext.Provider>
  );
};

export const useAppointments = () => {
  const context = useContext(AppointmentsContext);
  if (!context) throw new Error("useAppointments must be used within AppointmentsProvider");
  return context;
};
