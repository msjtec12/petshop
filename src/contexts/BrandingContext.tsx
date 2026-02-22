import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * Interface representing the visual identity of the store.
 * Focus on "White-label" capabilities for selling to different petshops.
 */
interface BrandingSettings {
  name: string;
  logo: string;
  primaryColor: string; // Hex format: #f97316
  secondaryColor: string;
  fontFamily: string;
  address: string;
  phone: string;
  openingHours: string;
}

interface BrandingContextType {
  settings: BrandingSettings;
  updateSettings: (newSettings: Partial<BrandingSettings>) => void;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

const DEFAULT_SETTINGS: BrandingSettings = {
  name: "MeuPetLocal",
  logo: "/logo.png",
  primaryColor: "#f97316",
  secondaryColor: "#15803d",
  fontFamily: "'Playfair Display', serif",
  address: "Rua dos Pets, 123 - Centro, São Paulo - SP",
  phone: "(11) 99999-9999",
  openingHours: "Seg - Sáb: 09h às 19h",
};

export const BrandingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<BrandingSettings>(() => {
    const saved = localStorage.getItem('petshop_branding');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_SETTINGS, ...parsed };
      } catch (e) {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  // Function to convert Hex to HSL for Tailwind variables
  const hexToHSL = (hex: string): string => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex.substring(1, 3), 16);
      g = parseInt(hex.substring(3, 5), 16);
      b = parseInt(hex.substring(5, 7), 16);
    }
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s, l = (max + min) / 2;
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  useEffect(() => {
    // Apply branding to CSS Variables
    const root = document.documentElement;
    const hslPrimary = hexToHSL(settings.primaryColor);
    root.style.setProperty('--primary', hslPrimary);
    root.style.setProperty('--ring', hslPrimary);
    
    // Apply Font Family to Headings logic
    const fontValue = settings.fontFamily || "'Playfair Display', serif";
    root.style.setProperty('--font-display', fontValue);
    
    // Save to localStorage for persistence
    localStorage.setItem('petshop_branding', JSON.stringify(settings));
    document.title = settings.name;
  }, [settings]);

  const updateSettings = (newSettings: Partial<BrandingSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  console.log("BrandingProvider Initializing with:", settings.name);

  return (
    <BrandingContext.Provider value={{ settings, updateSettings }}>
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = () => {
  const context = useContext(BrandingContext);
  if (!context) {
    console.error("useBranding hook was called outside of BrandingProvider!");
    // Fallback to avoid complete crash if possible, though updateSettings won't work
    return { 
      settings: DEFAULT_SETTINGS, 
      updateSettings: () => console.warn("updateSettings called without provider") 
    } as BrandingContextType;
  }
  return context;
};
