export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  animal: string;
  brand: string;
  rating: number;
  reviewCount: number;
  badge?: "novo" | "promoção" | "mais vendido";
  variations?: { label: string; options: string[] }[];
  inStock: boolean;
  weight?: number; // Peso em kg para cálculo de frete
}

export const categories = [
  { id: "racao", name: "Ração", icon: "🦴", animal: "all" },
  { id: "brinquedos", name: "Brinquedos", icon: "🧸", animal: "all" },
  { id: "higiene", name: "Higiene", icon: "🧴", animal: "all" },
  { id: "acessorios", name: "Acessórios", icon: "🎀", animal: "all" },
  { id: "camas", name: "Camas & Casas", icon: "🏠", animal: "all" },
  { id: "saude", name: "Saúde", icon: "💊", animal: "all" },
];

export const animals = [
  { id: "cachorro", name: "Cães", emoji: "🐕" },
  { id: "gato", name: "Gatos", emoji: "🐈" },
  { id: "aves", name: "Aves", emoji: "🐦" },
  { id: "roedores", name: "Roedores", emoji: "🐹" },
];

export const products: Product[] = [
  {
    id: "1",
    name: "Ração Premium Golden Retriever Adulto",
    description: "Ração super premium para cães adultos de porte grande. Formulação balanceada com proteínas de alta qualidade, ômega 3 e 6 para pelagem brilhante.",
    price: 189.90,
    originalPrice: 229.90,
    image: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400&h=400&fit=crop",
    category: "racao",
    animal: "cachorro",
    brand: "Royal Canin",
    rating: 4.8,
    reviewCount: 234,
    badge: "mais vendido",
    variations: [{ label: "Peso", options: ["3kg", "7.5kg", "15kg"] }],
    inStock: true,
    weight: 15.0
  },
  {
    id: "2",
    name: "Brinquedo Interativo Kong Classic",
    description: "Brinquedo de borracha resistente, ideal para cães que adoram mastigar. Pode ser recheado com petiscos.",
    price: 79.90,
    image: "https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=400&h=400&fit=crop",
    category: "brinquedos",
    animal: "cachorro",
    brand: "Kong",
    rating: 4.9,
    reviewCount: 189,
    badge: "mais vendido",
    variations: [{ label: "Tamanho", options: ["P", "M", "G"] }],
    inStock: true,
    weight: 0.3
  },
  {
    id: "3",
    name: "Ração Gatos Castrados Premium",
    description: "Ração especialmente formulada para gatos castrados, com controle de peso e prevenção de cálculos urinários.",
    price: 149.90,
    originalPrice: 179.90,
    image: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=400&fit=crop",
    category: "racao",
    animal: "gato",
    brand: "Whiskas Premium",
    rating: 4.7,
    reviewCount: 156,
    badge: "promoção",
    variations: [{ label: "Peso", options: ["1kg", "3kg", "10kg"] }],
    inStock: true,
    weight: 10.0
  },
  {
    id: "4",
    name: "Shampoo Neutro Pets Hipoalergênico",
    description: "Shampoo suave para cães e gatos com pele sensível. Fórmula sem parabenos, pH balanceado.",
    price: 34.90,
    image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=400&fit=crop",
    category: "higiene",
    animal: "cachorro",
    brand: "Pet Clean",
    rating: 4.6,
    reviewCount: 98,
    badge: "novo",
    inStock: true,
    weight: 0.5
  },
  {
    id: "5",
    name: "Coleira Ajustável com LED",
    description: "Coleira com luz LED recarregável para passeios noturnos. Resistente à água, com 3 modos de iluminação.",
    price: 59.90,
    originalPrice: 89.90,
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop",
    category: "acessorios",
    animal: "cachorro",
    brand: "PetSafe",
    rating: 4.5,
    reviewCount: 67,
    badge: "promoção",
    variations: [{ label: "Tamanho", options: ["PP", "P", "M", "G"] }],
    inStock: true,
    weight: 0.2
  },
  {
    id: "6",
    name: "Cama Ortopédica para Pets",
    description: "Cama com espuma viscoelástica, ideal para pets idosos ou com problemas articulares. Capa removível e lavável.",
    price: 259.90,
    image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=400&fit=crop",
    category: "camas",
    animal: "cachorro",
    brand: "Pet Dreams",
    rating: 4.9,
    reviewCount: 203,
    badge: "mais vendido",
    variations: [{ label: "Tamanho", options: ["P", "M", "G", "GG"] }],
    inStock: true,
    weight: 2.5
  },
  {
    id: "7",
    name: "Arranhador Torre para Gatos",
    description: "Torre arranhador com 3 níveis, plataformas, rede e brinquedo pendente. Revestido em sisal natural.",
    price: 199.90,
    originalPrice: 249.90,
    image: "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=400&h=400&fit=crop",
    category: "brinquedos",
    animal: "gato",
    brand: "Cat Life",
    rating: 4.7,
    reviewCount: 145,
    badge: "promoção",
    inStock: true,
    weight: 5.0
  },
  {
    id: "8",
    name: "Antipulgas e Carrapatos Frontline",
    description: "Proteção por 30 dias contra pulgas, carrapatos e piolhos. Aplicação fácil spot-on.",
    price: 89.90,
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=400&fit=crop",
    category: "saude",
    animal: "cachorro",
    brand: "Frontline",
    rating: 4.8,
    reviewCount: 312,
    badge: "mais vendido",
    variations: [{ label: "Peso do Pet", options: ["até 10kg", "10-20kg", "20-40kg", "40kg+"] }],
    inStock: true,
    weight: 0.1
  },
];

export const testimonials = [
  { name: "Maria Silva", avatar: "M", text: "Entrega super rápida! Meu cachorro adorou a ração. Já virou cliente fiel!", rating: 5, pet: "Tutora do Thor 🐕" },
  { name: "João Santos", avatar: "J", text: "Melhor petshop online! Preços ótimos e produtos de qualidade.", rating: 5, pet: "Tutor da Luna 🐈" },
  { name: "Ana Costa", avatar: "A", text: "Atendimento incrível. Tive um problema e resolveram na hora!", rating: 5, pet: "Tutora da Mel 🐕" },
];
