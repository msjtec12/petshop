import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Mail, ShieldCheck, Key } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useState } from "react";

const Profile = () => {
  const { user, logout, isLoading } = useAuth();

  // Enquanto carrega a sessão, não redireciona
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (!user) return <Navigate to="/auth" />;

  return (
    <main className="min-h-screen bg-muted/30 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl font-display font-bold mb-8">Meu Perfil</h1>
        
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
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Habilitação</p>
                  <p className="font-medium capitalize">{user.role || 'Usuário Regular'}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex gap-4">
              <Button variant="outline" className="flex-1" onClick={() => window.history.back()}>Voltar</Button>
              <Button variant="destructive" className="flex-1" onClick={logout}>Sair da Conta</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};


export default Profile;

