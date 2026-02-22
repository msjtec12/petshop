import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, products as initialProducts } from "@/data/products";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface ProductsContextType {
  products: Product[];
  categories: { id: string; name: string; icon: string; animal: string }[];
  isLoading: boolean;
  addProduct: (product: Omit<Product, "id">) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addCategory: (category: { name: string; icon: string }) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  refreshProducts: () => Promise<void>;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const ProductsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; icon: string; animal: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const mapFromDB = (p: any): Product => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: parseFloat(p.price),
    originalPrice: p.original_price ? parseFloat(p.original_price) : undefined,
    image: p.image,
    category: p.category,
    animal: p.animal,
    brand: p.brand,
    rating: parseFloat(p.rating),
    reviewCount: p.review_count,
    badge: p.badge,
    variations: p.variations,
    inStock: p.in_stock,
    weight: p.weight ? parseFloat(p.weight) : undefined
  });

  const mapToDB = (p: Partial<Product>) => {
    const dbObj: any = {};
    if (p.name !== undefined) dbObj.name = p.name;
    if (p.description !== undefined) dbObj.description = p.description;
    if (p.price !== undefined) dbObj.price = p.price;
    if (p.originalPrice !== undefined) dbObj.original_price = p.originalPrice;
    if (p.image !== undefined) dbObj.image = p.image;
    if (p.category !== undefined) dbObj.category = p.category;
    if (p.animal !== undefined) dbObj.animal = p.animal;
    if (p.brand !== undefined) dbObj.brand = p.brand;
    if (p.rating !== undefined) dbObj.rating = p.rating;
    if (p.reviewCount !== undefined) dbObj.review_count = p.reviewCount;
    if (p.badge !== undefined) dbObj.badge = p.badge;
    if (p.variations !== undefined) dbObj.variations = p.variations;
    if (p.inStock !== undefined) dbObj.in_stock = p.inStock;
    if (p.weight !== undefined) dbObj.weight = p.weight;
    return dbObj;
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
      setProducts(initialProducts);
    } else if (data && data.length > 0) {
      setProducts(data.map(mapFromDB));
    } else {
      setProducts(initialProducts);
    }
    setIsLoading(false);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) {
      console.error("Error fetching categories:", error);
      const { categories: initialCats } = await import("@/data/products");
      setCategories(initialCats);
    } else if (data && data.length > 0) {
      setCategories(data);
    } else {
      const { categories: initialCats } = await import("@/data/products");
      setCategories(initialCats);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const addProduct = async (p: Omit<Product, "id">) => {
    const { data, error } = await supabase
      .from('products')
      .insert([mapToDB(p)])
      .select();

    if (error) {
      toast.error("Erro ao adicionar produto: " + error.message);
      throw error;
    }
    setProducts(prev => [mapFromDB(data[0]), ...prev]);
  };

  const updateProduct = async (id: string, p: Partial<Product>) => {
    const { error } = await supabase
      .from('products')
      .update(mapToDB(p))
      .eq('id', id);

    if (error) {
      toast.error("Erro ao atualizar produto: " + error.message);
      throw error;
    }
    setProducts(prev => prev.map(item => item.id === id ? { ...item, ...p } : item));
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Erro ao excluir produto: " + error.message);
      throw error;
    }
    setProducts(prev => prev.filter(item => item.id !== id));
  };

  const addCategory = async (cat: { name: string; icon: string }) => {
    const newCat = { 
      id: cat.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-'), 
      name: cat.name, 
      icon: cat.icon || "🐾", 
      animal: "all" 
    };
    
    const { data, error } = await supabase.from('categories').insert([newCat]).select();
    
    if (error) {
      console.warn("Supabase category error, saving locally");
      setCategories(prev => [...prev, newCat]);
    } else {
      setCategories(prev => [...prev, data[0]]);
    }
    toast.success("Categoria criada com sucesso!");
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) console.warn("Supabase delete category error");
    setCategories(prev => prev.filter(c => c.id !== id));
    toast.success("Categoria removida!");
  };

  return (
    <ProductsContext.Provider value={{ 
      products, 
      categories,
      isLoading, 
      addProduct, 
      updateProduct, 
      deleteProduct, 
      addCategory,
      deleteCategory,
      refreshProducts: fetchProducts 
    }}>
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts must be used within ProductsProvider");
  return ctx;
};
