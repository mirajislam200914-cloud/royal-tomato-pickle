import React, { createContext, useContext, useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { SystemSettings } from "../types";

import { handleFirestoreError, OperationType } from "../lib/firestoreUtils";

interface SettingsContextType {
  settings: SystemSettings;
  payment: {
    bkash: string;
    nagad: string;
    paypal: string;
  };
  loading: boolean;
}

const defaultSettings: SystemSettings = {
  smsEnabled: false,
  bankAccountInfo: "",
  referralBonus: 5,
  siteName: "Royal Tomato Pickle",
  logoText: "ROYAL",
  tagline: "Ultra-luxury international food e-commerce platform",
  contactEmail: "concierge@royaltomato.com",
  bkashNumber: "",
  nagadNumber: "",
  paypalEmail: "",
  heroTitle: "The Crown of Taste.",
  heroSubtitle: "Experience the ultra-premium fusion of sun-ripened tomatoes and heritage spices. Crafted for those who demand perfection in every bite.",
  heroImage: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=2070&auto=format&fit=crop",
  storyTitle: "Selected Heritage.",
  storySubtitle: "Est. 2024 • Royal Heritage",
  storyContent: "From the strictly guarded kitchens of our ancestors to the most discerning global tables. Our artisanal process is a labor of love.",
  processTitle: "Crafting memories, one jar at a time.",
  processSubtitle: "Heritage • 100% Sustainable",
  processContent: "Our artisanal process is a labor of love. We source only the most prestigious, sun-ripened tomatoes and blend them with our secret line of heritage spices. No preservatives, no shortcuts. Just pure royalty."
};

const defaultPayment = {
  bkash: "",
  nagad: "",
  paypal: ""
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [payment, setPayment] = useState(defaultPayment);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubGlobal = onSnapshot(doc(db, "settings", "global"), (snap) => {
      if (snap.exists()) {
        const newSettings = { ...defaultSettings, ...snap.data() } as SystemSettings;
        setSettings(newSettings);
        document.title = newSettings.siteName;
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "settings/global");
    });

    const unsubPayment = onSnapshot(doc(db, "settings", "payment"), (snap) => {
      if (snap.exists()) {
        setPayment(prev => ({ ...prev, ...snap.data() }));
      }
    }, (error) => {
       handleFirestoreError(error, OperationType.GET, "settings/payment");
    });

    // Check loading state after both initial snaps might have fired or failed
    setLoading(false);

    return () => {
      unsubGlobal();
      unsubPayment();
    };
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, payment, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
