import { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ShoppingCart, Eye } from "lucide-react";
import { Button } from "../components/ui/button";
import { useCart } from "../context/CartContext";
import { toast } from "sonner";
import { Product } from "../types";

import { handleFirestoreError, OperationType } from "../lib/firestoreUtils";

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snapshot) => {
      const pList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(pList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "products");
      toast.error("Failed to load products. Please check your connection.");
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const categories = ["All", ...new Set(products.map((p) => p.category))];

  const filtered = activeCategory === "All" ? products : products.filter(p => p.category === activeCategory);

  const handleAddToCart = (p: Product) => {
    addItem({ 
       id: p.id,
       name: p.name,
       price: p.price,
       image: p.image,
       quantity: 1 
    });
    toast.success(`${p.name} added to cart`);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-paper">
      <div className="text-center space-y-6">
        <div className="w-12 h-12 border-[3px] border-royal-red border-t-transparent rounded-full animate-spin mx-auto shadow-sm"></div>
        <p className="text-royal-red font-bold tracking-[0.4em] text-[10px] uppercase">Curating Royal Boutique...</p>
      </div>
    </div>
  );

  if (products.length === 0) return (
     <div className="min-h-screen flex flex-col items-center justify-center bg-paper text-center px-6">
        <div className="space-y-10 max-w-lg">
            <h2 className="text-5xl font-serif italic tracking-tighter text-ink opacity-20">Collections are Private.</h2>
            <p className="text-ink/40 italic font-light leading-relaxed">Our master picklers are currently crafting the next batch of heritage. Please check back soon.</p>
        </div>
     </div>
  );

  return (
    <div className="min-h-screen bg-paper pt-24 pb-48 text-ink">
      <div className="max-w-7xl mx-auto px-6">
        <header className="mb-32 text-center">
            <span className="text-royal-red text-[10px] font-bold uppercase tracking-[0.5em] mb-10 block">Artisanal Curation</span>
            <h1 className="text-6xl md:text-9xl font-light tracking-tighter mb-12 font-serif italic text-ink">The <span className="text-ink/10 font-bold not-italic">Collections.</span></h1>
            <div className="flex flex-wrap justify-center gap-4">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-10 py-4 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] transition-all ${
                            activeCategory === cat 
                            ? "bg-ink text-white shadow-2xl scale-105" 
                            : "bg-white/60 text-ink/40 border border-ink/5 hover:border-ink/20"
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
          {filtered.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group"
            >
              <div className="aspect-[3/4] overflow-hidden rounded-[48px] relative mb-10 group bg-white shadow-sm border border-ink/5">
                <img src={product.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90 group-hover:opacity-100" alt={product.name} />
                <div className="absolute inset-0 bg-ink/10 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px] flex items-center justify-center space-x-6">
                    <Link to={`/product/${product.id}`}>
                        <Button size="icon" variant="secondary" className="rounded-full w-16 h-16 bg-white text-ink border-none shadow-xl hover:scale-110 transition-transform">
                            <Eye className="w-6 h-6" />
                        </Button>
                    </Link>
                    <Button
                        size="icon"
                        className="rounded-full w-16 h-16 bg-ink text-white hover:bg-ink shadow-xl hover:scale-110 transition-transform"
                        onClick={() => handleAddToCart(product)}
                    >
                        <ShoppingCart className="w-6 h-6" />
                    </Button>
                </div>
                <div className="absolute top-8 left-8">
                    <span className="bg-white/80 backdrop-blur-md text-ink text-[9px] uppercase font-bold tracking-[0.3em] px-5 py-2.5 rounded-full border border-ink/5 shadow-sm">
                        {product.category}
                    </span>
                </div>
              </div>
              <div className="flex justify-between items-start px-4">
                <div>
                   <h3 className="text-3xl font-serif italic text-ink mb-1 group-hover:text-royal-red transition-colors">{product.name}</h3>
                   <span className="text-ink/30 text-[10px] font-bold uppercase tracking-[0.3em]">{product.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
