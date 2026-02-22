import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, Search, Heart, User, Menu, X, PawPrint, Scissors } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useBranding } from "@/contexts/BrandingContext";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/produtos", label: "Produtos" },
  { to: "/servicos", label: "Serviços", icon: <Scissors className="h-4 w-4" /> },
];

const Header = () => {
  const { totalItems, setIsCartOpen } = useCart();
  const { settings } = useBranding();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground text-center text-xs md:text-sm py-1.5 font-medium px-4">
        🐾 Frete grátis em compras acima de R$ 199 | Bem-vindo à <span className="font-bold underline">{settings.name}</span>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
             {settings.logo === "/logo.png" ? (
               <PawPrint className="h-8 w-8 text-primary transition-transform group-hover:rotate-12" />
             ) : (
               <img src={settings.logo} alt={settings.name} className="h-10 w-auto object-contain" />
             )}
            <span className="text-xl md:text-2xl font-display font-bold text-foreground">
              {settings.name.split(' ').map((word, i) => (
                <span key={i} className={i === 1 ? "text-primary" : ""}>{word}{' '}</span>
              ))}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className={`text-sm font-semibold transition-colors hover:text-primary flex items-center gap-1.5 ${
                  location.pathname === link.to ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-3">
            <button className="hidden md:flex p-2 rounded-full hover:bg-accent transition-colors" aria-label="Buscar">
              <Search className="h-5 w-5 text-muted-foreground" />
            </button>
            <button className="hidden md:flex p-2 rounded-full hover:bg-accent transition-colors" aria-label="Favoritos">
              <Heart className="h-5 w-5 text-muted-foreground" />
            </button>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex p-0.5 rounded-full hover:bg-accent transition-colors outline-none border border-border">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">{user.name[0]}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/perfil">Meu Perfil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/pedidos">Meus Pedidos</Link>
                  </DropdownMenuItem>
                  {user.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="text-primary font-bold">
                        Painel Admin
                      </Link>
                    </DropdownMenuItem>
                  )}


                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer" onClick={logout}>
                    Sair da Conta
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth" className="hidden md:flex p-2 rounded-full hover:bg-accent transition-colors" aria-label="Conta">
                <User className="h-5 w-5 text-muted-foreground" />
              </Link>
            )}

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-full hover:bg-accent transition-colors"
              aria-label="Carrinho"
            >
              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-4 w-4 md:h-5 md:w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
            <button className="lg:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden border-t border-border overflow-hidden bg-card"
          >
            <nav className="flex flex-col p-4 gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="text-base font-semibold py-2 text-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
              {!user && (
                <Link
                  to="/auth"
                  onClick={() => setMobileOpen(false)}
                  className="text-base font-semibold py-2 text-primary flex items-center gap-2"
                >
                  <User className="h-4 w-4" /> Entrar / Cadastrar
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
