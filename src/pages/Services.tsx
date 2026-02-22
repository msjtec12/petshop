import { useState, useMemo } from "react";
import { useBranding } from "@/contexts/BrandingContext";
import { useAppointments } from "@/contexts/AppointmentsContext";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Scissors, 
  ShowerHead, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  Info,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Services = () => {
  const { settings } = useBranding();
  const { user } = useAuth();
  const { createAppointment, isSlotAvailable, services, businessHours } = useAppointments();
  const navigate = useNavigate();
  
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [petName, setPetName] = useState("");
  const [petType, setPetType] = useState<'dog' | 'cat' | 'other'>('dog');
  const [petTypeCustom, setPetTypeCustom] = useState("");
  const [petSize, setPetSize] = useState<'small' | 'medium' | 'large' | 'giant'>('small');
  const [petBreed, setPetBreed] = useState("");
  const [step, setStep] = useState(1); 
  const [isBooking, setIsBooking] = useState(false);

  // Calcula horários disponíveis dinamicamente
  const timeSlots = useMemo(() => {
    if (!selectedDate) return [];
    
    const dateObj = new Date(selectedDate);
    const dayOfWeek = dateObj.getUTCDay();
    const config = businessHours.find(h => h.dayOfWeek === dayOfWeek);

    if (!config || !config.isOpen) return [];

    const slots = [];
    let current = new Date(`2000-01-01T${config.openTime}`);
    const end = new Date(`2000-01-01T${config.closeTime}`);

    while (current < end) {
      const time = current.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit', hour12: false });
      slots.push(time);
      current = new Date(current.getTime() + config.slotDuration * 60000);
    }

    return slots;
  }, [selectedDate, businessHours]);

  const selectedService = services.find(s => s.id === selectedServiceId);

  const handleBooking = async () => {
    if (!user) {
      toast.error("Por favor, faça login para agendar.");
      navigate("/auth");
      return;
    }

    if (!selectedService || !selectedDate || !selectedTime || !petName || isBooking) {
      return;
    }

    setIsBooking(true);

    try {
      await createAppointment({
        customer_id: user.id,
        service_id: selectedService.id,
        service_name: selectedService.name,
        date: selectedDate,
        time: selectedTime,
        total: selectedService.price,
        customer_name: user.name,
        customer_phone: user.phone || user.email, 
        pet_name: petName,
        pet_type: petType,
        pet_type_custom: petType === 'other' ? petTypeCustom : undefined,
        pet_size: petSize,
        pet_breed: petBreed
      });
      
      toast.success("Agendamento realizado com sucesso!");
      setStep(1);
      setSelectedServiceId(null);
      setSelectedDate("");
      setSelectedTime("");
      setPetName("");
      setPetBreed("");
      navigate("/pedidos");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsBooking(false);
    }
  };

  const getDayLabel = (offset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return {
      label: d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
      day: d.getDate(),
      iso: d.toISOString().split('T')[0]
    };
  };

  const nextSevenDays = Array.from({ length: 7 }, (_, i) => getDayLabel(i + 1));

  return (
    <main className="min-h-screen bg-muted/30 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 bg-primary/10 text-primary border-primary/20">
            Estética Canina & Felina
          </Badge>
          <h1 className="text-4xl font-display font-bold mb-4">Agende um Horário</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Escolha o melhor serviço para o seu pet e garanta o bem-estar dele com nossos especialistas.
          </p>
        </div>

        {/* Stepper */}
        <div className="flex justify-center mb-10">
           <div className="flex items-center gap-4">
             <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= 1 ? 'bg-primary text-white scale-110' : 'bg-muted text-muted-foreground'}`}>1</div>
             <div className={`h-px w-8 transition-all ${step >= 2 ? 'bg-primary' : 'bg-muted'}`}></div>
             <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= 2 ? 'bg-primary text-white scale-110' : 'bg-muted text-muted-foreground'}`}>2</div>
             <div className={`h-px w-8 transition-all ${step >= 3 ? 'bg-primary' : 'bg-muted'}`}></div>
             <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= 3 ? 'bg-primary text-white scale-110' : 'bg-muted text-muted-foreground'}`}>3</div>
             <div className={`h-px w-8 transition-all ${step >= 4 ? 'bg-primary' : 'bg-muted'}`}></div>
             <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= 4 ? 'bg-primary text-white scale-110' : 'bg-muted text-muted-foreground'}`}>4</div>
           </div>
        </div>

        {step === 1 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
            {services.map((service) => (
              <Card 
                key={service.id} 
                className={`relative cursor-pointer transition-all hover:shadow-lg border-2 ${selectedServiceId === service.id ? 'border-primary shadow-md ring-1 ring-primary' : 'border-transparent'}`}
                onClick={() => setSelectedServiceId(service.id)}
              >
                {service.popular && (
                  <Badge className="absolute -top-3 left-4 bg-orange-500 hover:bg-orange-600">Mais Procurado</Badge>
                )}
                <CardHeader>
                   <div className={`p-3 rounded-xl w-12 h-12 flex items-center justify-center text-2xl mb-2 ${selectedServiceId === service.id ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>
                    {service.icon || '🐾'}
                  </div>
                  <CardTitle className="text-xl">{service.name}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {service.duration}
                      </p>
                      <p className="text-2xl font-bold text-primary">R$ {service.price.toFixed(2)}</p>
                    </div>
                    {selectedServiceId === service.id && (
                       <CheckCircle2 className="h-6 w-6 text-primary" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="max-w-md mx-auto animate-in fade-in slide-in-from-right-4">
            <Card className="shadow-premium border-none">
              <CardHeader>
                <CardTitle>Identificação do Pet</CardTitle>
                <CardDescription>Conte-nos um pouco sobre quem irá receber o serviço.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold">Nome do Pet</label>
                  <input 
                    type="text" 
                    className="w-full p-3 rounded-xl border bg-muted/50 focus:ring-2 focus:ring-primary outline-none"
                    placeholder="Ex: Totó, Mel..."
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Tipo de Pet</label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      variant={petType === 'dog' ? 'default' : 'outline'} 
                      onClick={() => setPetType('dog')}
                      className="gap-1 px-2 text-xs"
                    >
                      🐶 Cão
                    </Button>
                    <Button 
                      variant={petType === 'cat' ? 'default' : 'outline'} 
                      onClick={() => setPetType('cat')}
                      className="gap-1 px-2 text-xs"
                    >
                      🐱 Gato
                    </Button>
                    <Button 
                      variant={petType === 'other' ? 'default' : 'outline'} 
                      onClick={() => setPetType('other')}
                      className="gap-1 px-2 text-xs"
                    >
                      ✨ Outro
                    </Button>
                  </div>
                </div>

                {petType === 'other' && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <label className="text-sm font-bold">Qual animal?</label>
                    <input 
                      type="text" 
                      className="w-full p-3 rounded-xl border bg-muted/50 focus:ring-2 focus:ring-primary outline-none"
                      placeholder="Ex: Coelho, Furão..."
                      value={petTypeCustom}
                      onChange={(e) => setPetTypeCustom(e.target.value)}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-bold">Porte do Pet</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'small', label: 'Pequeno (-10kg)' },
                      { id: 'medium', label: 'Médio (10-20kg)' },
                      { id: 'large', label: 'Grande (20-40kg)' },
                      { id: 'giant', label: 'Gigante (+40kg)' }
                    ].map((size) => (
                      <Button
                        key={size.id}
                        variant={petSize === size.id ? 'default' : 'outline'}
                        onClick={() => setPetSize(size.id as any)}
                        className="text-xs py-1 h-auto"
                      >
                        {size.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Raça (Opcional)</label>
                  <input 
                    type="text" 
                    className="w-full p-3 rounded-xl border bg-muted/50 focus:ring-2 focus:ring-primary outline-none"
                    placeholder="Ex: Poodle, Persa..."
                    value={petBreed}
                    onChange={(e) => setPetBreed(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 3 && (
          <Card className="shadow-premium border-none animate-in fade-in slide-in-from-right-4">
            <CardHeader>
              <CardTitle>Escolha o Dia e Horário</CardTitle>
              <CardDescription>Clique em um dia e depois em um horário disponível.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                {nextSevenDays.map((dateObj) => (
                  <Button 
                    key={dateObj.iso} 
                    variant={selectedDate === dateObj.iso ? "default" : "outline"} 
                    className={`h-20 flex flex-col gap-1 items-center transition-all ${selectedDate === dateObj.iso ? 'scale-105 shadow-md' : ''}`}
                    onClick={() => {
                      setSelectedDate(dateObj.iso);
                      setSelectedTime(""); // Reset time when date changes
                    }}
                  >
                    <span className={`text-[10px] uppercase ${selectedDate === dateObj.iso ? 'text-white/70' : 'opacity-50'}`}>{dateObj.label}</span>
                    <span className="font-bold text-lg">{dateObj.day}</span>
                  </Button>
                ))}
              </div>

              {selectedDate && (
                <div className="space-y-4 animate-in fade-in zoom-in-95">
                  <p className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Horários Disponíveis:
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 pt-2">
                  {timeSlots.length > 0 ? (
                    timeSlots.map((time) => {
                      const available = isSlotAvailable(selectedDate, time);
                      return (
                        <Button
                          key={time}
                          type="button"
                          variant={selectedTime === time ? "default" : "outline"}
                          className={`h-12 text-lg font-bold ${!available ? 'opacity-50 cursor-not-allowed bg-muted' : ''}`}
                          onClick={() => available && setSelectedTime(time)}
                          disabled={!available}
                        >
                          {time}
                        </Button>
                      );
                    })
                  ) : (
                    <div className="col-span-full p-6 text-center bg-muted/30 rounded-2xl">
                      <p className="text-muted-foreground italic">
                        {selectedDate ? "Estamos fechados nesta data. Por favor, escolha outro dia." : "Selecione uma data para ver os horários."}
                      </p>
                    </div>
                  )}
                </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {step === 4 && selectedService && (
           <Card className="shadow-premium border-primary/20 animate-in fade-in zoom-in-95">
             <CardHeader className="text-center">
               <div className="bg-green-100 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                 <CheckCircle2 className="h-8 w-8" />
               </div>
               <CardTitle>Quase lá, {user?.name.split(' ')[0]}!</CardTitle>
               <CardDescription>Confirme os dados do agendamento abaixo.</CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
               <div className="bg-muted/50 p-6 rounded-2xl space-y-4">
                 <div className="grid grid-cols-2 gap-4 border-b border-muted-foreground/10 pb-4">
                   <div>
                     <p className="text-xs text-muted-foreground uppercase font-bold">Serviço</p>
                     <p className="font-bold flex items-center gap-2 mt-1">
                        {selectedService.name}
                     </p>
                   </div>
                   <div>
                     <p className="text-xs text-muted-foreground uppercase font-bold">Pet</p>
                     <p className="font-bold mt-1">
                        {petType === 'dog' ? '🐶' : petType === 'cat' ? '🐱' : '✨'} {petName} 
                        <span className="text-[10px] block opacity-70">
                          {petType === 'other' ? petTypeCustom : (petType === 'dog' ? 'Cão' : 'Gato')} 
                          {' • '} {petSize === 'small' ? 'Pequeno' : petSize === 'medium' ? 'Médio' : petSize === 'large' ? 'Grande' : 'Gigante'}
                        </span>
                     </p>
                   </div>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-muted-foreground">Data e Hora:</span>
                   <span className="font-bold text-foreground">
                     {new Date(selectedDate).toLocaleDateString('pt-BR')} às {selectedTime}
                   </span>
                 </div>
                 <div className="flex justify-between items-center border-t border-muted-foreground/10 pt-4 mt-2">
                   <span className="text-muted-foreground text-lg">Total a Pagar:</span>
                   <span className="text-2xl font-bold text-primary">R$ {selectedService.price.toFixed(2)}</span>
                 </div>
               </div>
               <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 flex gap-3 items-start">
                 <AlertCircle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                 <p className="text-xs text-orange-800 leading-relaxed font-medium">
                   Confirme para reservar este horário. Se precisar desmarcar, avise com antecedência.
                 </p>
               </div>
             </CardContent>
           </Card>
        )}

        <div className="flex justify-between mt-8">
          <Button 
            variant="ghost" 
            disabled={step === 1}
            onClick={() => setStep(step - 1)}
          >
            Voltar
          </Button>
          <Button 
            className="gap-2 px-8 font-bold min-w-[180px]"
            disabled={
              (step === 1 && !selectedServiceId) || 
              (step === 2 && (!petName || (petType === 'other' && !petTypeCustom))) || 
              (step === 3 && (!selectedDate || !selectedTime)) || 
              isBooking
            }
            onClick={() => step < 4 ? setStep(step + 1) : handleBooking()}
          >
            {isBooking ? "Processando..." : (step === 4 ? "Confirmar Reserva" : "Próximo Passo")}
            <ChevronRight className={`h-4 w-4 ${isBooking ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
    </main>
  );
};

export default Services;
