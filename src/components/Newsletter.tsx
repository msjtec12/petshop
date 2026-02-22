import { useState } from "react";
import { Send } from "lucide-react";
import { motion } from "framer-motion";
import { useBranding } from "@/contexts/BrandingContext";

const Newsletter = () => {
  const { settings } = useBranding();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <section className="py-16 bg-primary">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-display font-bold text-primary-foreground mb-3">
            Receba novidades da {settings.name} 🐾
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-md mx-auto">
            Cadastre-se e ganhe 10% OFF na primeira compra!
          </p>

          {submitted ? (
            <p className="text-primary-foreground font-bold text-lg">✅ Cadastrado com sucesso!</p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                required
                placeholder="Seu melhor e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-5 py-3 rounded-lg bg-primary-foreground/10 border border-primary-foreground/30 text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:border-primary-foreground"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 bg-card text-foreground font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
              >
                Cadastrar <Send className="h-4 w-4" />
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default Newsletter;
