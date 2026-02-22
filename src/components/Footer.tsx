import { Link } from "react-router-dom";
import { PawPrint, Instagram, Facebook, Mail, Phone, MapPin } from "lucide-react";
import { useBranding } from "@/contexts/BrandingContext";

const Footer = () => {
  const { settings } = useBranding();
  
  return (
    <footer className="bg-foreground text-muted pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              {settings.logo === "/logo.png" ? (
                <PawPrint className="h-7 w-7 text-primary" />
              ) : (
                <img src={settings.logo} className="h-8 w-auto object-contain" />
              )}
              <span className="text-xl font-display font-bold text-card">
                 {settings.name}
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Tudo o que seu pet precisa com carinho e qualidade. Entregamos amor em cada pedido! 🐾
            </p>
            <div className="flex gap-3">
              <a href="#" className="p-2 rounded-full bg-muted/10 hover:bg-primary/20 transition-colors">
                <Instagram className="h-4 w-4 text-card" />
              </a>
              <a href="#" className="p-2 rounded-full bg-muted/10 hover:bg-primary/20 transition-colors">
                <Facebook className="h-4 w-4 text-card" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-card mb-4">Categorias</h4>
            <ul className="space-y-2 text-sm">
              {["Ração", "Brinquedos", "Higiene", "Acessórios", "Saúde"].map((item) => (
                <li key={item}>
                  <Link to="/produtos" className="text-muted-foreground hover:text-primary transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-card mb-4">Institucional</h4>
            <ul className="space-y-2 text-sm">
              {["Sobre nós", "Política de troca", "Privacidade", "Termos de uso"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-card mb-4">Contato</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" /> {settings.phone}
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" /> contato@{settings.name.toLowerCase().replace(/\s+/g, '')}.com
              </li>
              <li className="flex items-start gap-2 text-muted-foreground max-w-[200px]">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" /> {settings.address}
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-muted/20 pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {settings.name}. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
