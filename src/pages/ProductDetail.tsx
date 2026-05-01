import { useParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import { Star, ShieldCheck, Truck, RefreshCw, ShoppingCart, Plus, Minus, Share2, Heart } from "lucide-react";
import { Button } from "../components/ui/button";
import { useCart } from "../context/CartContext";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Product } from "../types";

import { handleFirestoreError, OperationType } from "../lib/firestoreUtils";

export default function ProductDetail() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const ref = doc(db, "products", id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setProduct({ id: snap.id, ...snap.data() } as Product);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `products/${id}`);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-paper">
      <div className="text-center space-y-6">
        <div className="w-12 h-12 border-[3px] border-royal-red border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-royal-red font-bold tracking-[0.4em] text-[10px] uppercase">Unveiling heritage...</p>
      </div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center bg-paper text-center px-6">
      <div className="space-y-10 max-w-lg">
        <h2 className="text-5xl font-serif italic tracking-tighter text-ink opacity-20">Lost Heritage.</h2>
        <p className="text-ink/40 max-w-sm mx-auto italic font-light">This specific jar of heritage has been removed from our current collection or does not exist.</p>
        <Link to="/shop">
           <Button className="bg-ink text-white rounded-full px-12 py-8 text-[10px] font-bold uppercase tracking-[0.3em] shadow-xl">Explore Collections</Button>
        </Link>
      </div>
    </div>
  );

  const handleAddToCart = () => {
    addItem({ 
       id: product.id,
       name: product.name,
       price: product.price,
       image: product.image,
       quantity 
    });
    toast.success(`Added ${quantity} x ${product.name} to bag`);
  };

  return (
    <div className="bg-paper min-h-screen pt-24 pb-48 text-ink">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-start">
          {/* Image Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="aspect-[4/5] rounded-[64px] overflow-hidden bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-ink/5 relative group">
              <img src={product.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt={product.name} />
              <div className="absolute inset-0 bg-ink/5 group-hover:bg-transparent transition-colors" />
            </div>
            <div className="grid grid-cols-3 gap-8">
               {[product.image, product.image, product.image].map((img, i) => (
                 <div key={i} className="aspect-square rounded-[32px] overflow-hidden cursor-pointer border-2 border-transparent hover:border-royal-red transition-all shadow-sm group">
                    <img src={img} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="Detail" />
                 </div>
               ))}
            </div>
          </motion.div>

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:sticky lg:top-32"
          >
            <div className="flex items-center space-x-3 text-[10px] font-bold text-royal-red uppercase tracking-[0.4em] mb-10">
                <span>{product.category}</span>
                <div className="w-1.5 h-1.5 bg-royal-red/30 rounded-full" />
                <span>Small Batch Heritage</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-serif italic tracking-tighter mb-8 leading-none">{product.name}</h1>
            
            <div className="flex items-center space-x-10 mb-12">
                <span className="text-4xl font-bold tracking-tight text-ink">${product.price.toFixed(2)}</span>
                <div className="flex items-center space-x-1.5 text-royal-red/40">
                    {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-4 h-4 fill-current" />)}
                    <span className="ml-4 text-[10px] text-ink/20 uppercase tracking-[0.2em] font-bold">(124 Global Patronage)</span>
                </div>
            </div>

            <p className="text-ink/40 text-xl font-light leading-relaxed mb-16 max-w-lg italic font-serif">
                "{product.description}"
            </p>

            <div className="space-y-10 mb-16">
                <div className="flex flex-col sm:flex-row items-center space-y-6 sm:space-y-0 sm:space-x-8">
                    <div className="flex items-center space-x-10 bg-white/60 border border-ink/5 px-10 py-6 rounded-full backdrop-blur-xl shadow-sm">
                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className={`p-2 transition-colors ${quantity > 1 ? 'text-ink hover:text-royal-red' : 'text-ink/10 cursor-not-allowed'}`}>
                            <Minus className="w-5 h-5" />
                        </button>
                        <span className="text-2xl font-serif italic w-8 text-center tabular-nums">{quantity}</span>
                        <button onClick={() => setQuantity(quantity + 1)} className="p-2 text-ink hover:text-royal-red transition-colors">
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                    <Button
                        onClick={handleAddToCart}
                        className="w-full sm:flex-1 rounded-full py-12 text-[10px] font-bold uppercase tracking-[0.4em] bg-ink text-white hover:bg-ink/90 group shadow-3xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Secure Selection
                        <ShoppingCart className="ml-4 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>
                
                <div className="flex space-x-6">
                    <Button variant="outline" className="flex-1 rounded-full border-ink/5 hover:bg-white text-ink/40 hover:text-ink py-8 text-[10px] uppercase font-bold tracking-[0.2em] shadow-sm">
                        <Heart className="mr-3 w-4 h-4" /> Patron Wishlist
                    </Button>
                    <Button variant="outline" className="flex-1 rounded-full border-ink/5 hover:bg-white text-ink/40 hover:text-ink py-8 text-[10px] uppercase font-bold tracking-[0.2em] shadow-sm">
                        <Share2 className="mr-3 w-4 h-4" /> Share Lineage
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 py-12 border-t border-ink/5">
                {[
                    { icon: ShieldCheck, text: "Heritage Certified" },
                    { icon: Truck, text: "Global Diplomatic Shipping" },
                    { icon: RefreshCw, text: "Guaranteed Satisfaction" },
                ].map((item, i) => (
                    <div key={i} className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-2xl bg-ink/5 flex items-center justify-center mb-4">
                            <item.icon className="w-5 h-5 text-ink/40" />
                        </div>
                        <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-ink/30 max-w-[80px]">{item.text}</span>
                    </div>
                ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
