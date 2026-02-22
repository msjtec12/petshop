import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Mail, ShieldCheck, Key, Phone, MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useState } from "react";

const Profile = () => {
  const { user, logout, isLoading, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: {
      cep: user?.address?.cep || "",
      street: user?.address?.street || "",
      number: user?.address?.number || "",
      complement: user?.address?.complement || "",
      neighborhood: user?.address?.neighborhood || "",
      city: user?.address?.city || "",
      state: user?.address?.state || ""
    }
  });

  const [searchingCep, setSearchingCep] = useState(false);

  const handleCepSearch = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, "");
    setFormData(prev => ({ ...prev, address: { ...prev.address, cep: cleanCep } }));
    
    if (cleanCep.length === 8) {
      setSearchingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            address: {
              ...prev.address,
              street: data.logradouro,
              neighborhood: data.bairro,
              city: data.localidade,
              state: data.uf
            }
          }));
          toast.success("Endereço preenchido!");
        } else {
          toast.error("CEP não encontrado.");
        }
      } catch (error) {
        toast.error("Erro ao buscar CEP.");
      } finally {
        setSearchingCep(false);
      }
    }
  };

  const handleSave = async () => {
    try {
      await updateProfile({
        name: formData.name,
        phone: formData.phone,
        address: formData.address
      });
      setIsEditing(false);
      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      toast.error("Ocorreu um erro ao salvar o perfil.");
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (!user) return <Navigate to="/auth" />;

  return (
    <main className="min-h-screen bg-muted/30 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-display font-bold">Meu Perfil</h1>
          {!isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(true)}>Editar Perfil</Button>
          )}
        </div>
        
        <Card className="overflow-hidden border-none shadow-premium bg-card">
          <CardHeader className="bg-primary text-primary-foreground pb-12 pt-12 relative">
            <div className="absolute -bottom-12 left-8 border-4 border-card rounded-full overflow-hidden">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="bg-secondary text-secondary-foreground text-2xl">{user.name[0]}</AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-2xl">{user.name}</CardTitle>
            <CardDescription className="text-primary-foreground/80">{user.role === 'admin' ? 'Administrador' : 'Cliente'}</CardDescription>
          </CardHeader>
          <CardContent className="pt-16 pb-8 space-y-6">
            {!isEditing ? (
              <div className="grid gap-4">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
                  <div className="bg-primary/10 p-2 rounded-lg text-primary">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Nome Completo</p>
                    <p className="font-medium">{user.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
                  <div className="bg-primary/10 p-2 rounded-lg text-primary">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">E-mail</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
                  <div className="bg-primary/10 p-2 rounded-lg text-primary">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">WhatsApp/Telefone</p>
                    <p className="font-medium">{user.phone || "Não cadastrado"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
                  <div className="bg-primary/10 p-2 rounded-lg text-primary">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Membro desde</p>
                    <p className="font-medium">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : 'Fevereiro de 2024'}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" /> Endereço Principal
                  </h4>
                  {user.address?.cep ? (
                    <div className="bg-muted/30 border border-muted-foreground/10 p-4 rounded-2xl">
                      <p className="text-sm font-bold">{user.address.street}, {user.address.number}</p>
                      {user.address.complement && <p className="text-xs text-muted-foreground">{user.address.complement}</p>}
                      <p className="text-xs text-muted-foreground">{user.address.neighborhood} - {user.address.city}/{user.address.state}</p>
                      <p className="text-[10px] text-primary font-mono mt-1">{user.address.cep}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Nenhum endereço cadastrado.</p>
                  )}
                </div>
                
                <div className="pt-4 flex gap-4">
                  <Button variant="outline" className="flex-1" onClick={() => window.history.back()}>Voltar</Button>
                  <Button variant="destructive" className="flex-1" onClick={logout}>Sair da Conta</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="grid gap-2">
                  <p className="text-xs font-bold uppercase text-muted-foreground">Informações Básicas</p>
                  <input 
                    type="text" 
                    placeholder="Seu Nome"
                    className="w-full p-3 rounded-xl border bg-muted/50 focus:ring-2 focus:ring-primary outline-none"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                  <input 
                    type="text" 
                    placeholder="WhatsApp (Ex: 11999999999)"
                    className="w-full p-3 rounded-xl border bg-muted/50 focus:ring-2 focus:ring-primary outline-none"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>

                <div className="grid gap-2 pt-2">
                  <p className="text-xs font-bold uppercase text-muted-foreground">Endereço (CEP Auto-fill)</p>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="CEP (Somente números)"
                      className="w-full p-3 rounded-xl border bg-muted/50 focus:ring-2 focus:ring-primary outline-none"
                      value={formData.address.cep}
                      onChange={(e) => handleCepSearch(e.target.value)}
                      maxLength={8}
                    />
                    {searchingCep && <div className="absolute right-3 top-3 animate-spin text-primary">⏳</div>}
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <input 
                      type="text" 
                      placeholder="Rua"
                      className="col-span-3 p-3 rounded-xl border bg-muted/50 focus:ring-2 focus:ring-primary outline-none"
                      value={formData.address.street}
                      onChange={(e) => setFormData({...formData, address: {...formData.address, street: e.target.value}})}
                    />
                    <input 
                      type="text" 
                      placeholder="Nº"
                      className="p-3 rounded-xl border bg-muted/50 focus:ring-2 focus:ring-primary outline-none"
                      value={formData.address.number}
                      onChange={(e) => setFormData({...formData, address: {...formData.address, number: e.target.value}})}
                    />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Complemento (Apto, Bloco, etc)"
                    className="w-full p-3 rounded-xl border bg-muted/50 focus:ring-2 focus:ring-primary outline-none"
                    value={formData.address.complement}
                    onChange={(e) => setFormData({...formData, address: {...formData.address, complement: e.target.value}})}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" 
                      placeholder="Bairro"
                      className="p-3 rounded-xl border bg-muted/50 focus:ring-2 focus:ring-primary outline-none"
                      value={formData.address.neighborhood}
                      disabled
                    />
                    <input 
                      type="text" 
                      placeholder="Cidade"
                      className="p-3 rounded-xl border bg-muted/50 focus:ring-2 focus:ring-primary outline-none"
                      value={formData.address.city}
                      disabled
                    />
                  </div>
                </div>

                <div className="pt-6 flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setIsEditing(false)}>Cancelar</Button>
                  <Button className="flex-1 font-bold" onClick={handleSave}>Salvar Alterações</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
};


export default Profile;

