import { useCart } from "../context/CartContext";
import { motion, AnimatePresence } from "motion/react";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";
import { Separator } from "../components/ui/separator";

export default function Cart() {
  const { items, removeItem, total, addItem, updateQuantity } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-6 text-ink">
        <div className="w-32 h-32 bg-ink/5 rounded-full flex items-center justify-center mb-10 shadow-inner">
            <ShoppingBag className="w-12 h-12 text-ink/20" />
        </div>
        <h2 className="text-5xl font-serif italic mb-6">Your bag is empty.</h2>
        <p className="text-ink/40 mb-16 max-w-xs text-center font-light leading-relaxed">Looks like you haven't added any luxury pickles to your collection yet.</p>
        <Link to="/shop">
          <Button className="rounded-full px-16 py-8 bg-ink text-white hover:bg-ink/90 text-[10px] uppercase font-bold tracking-[0.4em] shadow-2xl">Return to Boutique</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-paper min-h-screen text-ink pt-24 pb-48">
      <div className="max-w-7xl mx-auto px-6">
        <header className="mb-32">
          <span className="text-royal-red text-[10px] font-bold uppercase tracking-[0.5em] mb-6 block">Your Selection</span>
          <h1 className="text-6xl md:text-9xl font-light tracking-tighter font-serif italic">Your <span className="text-ink/10 font-bold not-italic">Bag.</span></h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-32">
          <div className="lg:col-span-2 space-y-16">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center space-x-10 group"
                >
                  <div className="w-40 h-52 rounded-[48px] overflow-hidden bg-white shadow-[0_16px_32px_-12px_rgba(0,0,0,0.1)] border border-ink/5 flex-shrink-0">
                    <img src={item.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt={item.name} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-8">
                      <div>
                          <h3 className="text-3xl font-serif italic text-ink mb-2">{item.name}</h3>
                          <p className="text-[10px] text-ink/30 uppercase tracking-[0.3em] font-bold">Small Batch • Heritage Curation</p>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="p-3 text-ink/10 hover:text-royal-red transition-all hover:scale-110">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-8 bg-paper border border-ink/5 px-8 py-4 rounded-full shadow-inner">
                          <button 
                              onClick={() => updateQuantity(item.id, -1)} 
                              className={`p-1 transition-colors ${item.quantity > 1 ? 'text-ink/40 hover:text-ink' : 'text-ink/10 cursor-not-allowed'}`}
                              disabled={item.quantity <= 1}
                          >
                              <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-lg font-serif italic w-6 text-center tabular-nums">{item.quantity}</span>
                          <button 
                              onClick={() => updateQuantity(item.id, 1)} 
                              className="p-1 text-ink/40 hover:text-ink transition-colors"
                          >
                              <Plus className="w-4 h-4" />
                          </button>
                      </div>
                      <span className="text-2xl font-bold tracking-tight text-ink">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="lg:sticky lg:top-32 h-fit space-y-10">
              <div className="bg-white/60 backdrop-blur-xl p-12 rounded-[64px] border border-ink/5 shadow-2xl">
                  <h3 className="text-2xl font-serif italic mb-12 text-ink/60">Executive Summary</h3>
                  <div className="space-y-6 text-[10px] font-bold uppercase tracking-[0.3em]">
                      <div className="flex justify-between text-ink/30 italic">
                          <span>Subtotal Value</span>
                          <span>${total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-ink/30 italic">
                          <span>Shipping</span>
                          <span className="text-royal-red">TBD at Checkout</span>
                      </div>
                      <Separator className="bg-ink/5" />
                      <div className="flex justify-between text-3xl pt-6 font-serif italic text-ink normal-case tracking-tighter">
                          <span>Grand total</span>
                          <span className="font-bold">${total.toFixed(2)}</span>
                      </div>
                  </div>
                  <Link to="/checkout" className="block mt-16">
                     <Button className="w-full rounded-full py-12 text-[10px] uppercase font-bold tracking-[0.4em] bg-ink text-white hover:bg-ink/90 group shadow-3xl transition-all hover:scale-[1.02] active:scale-[0.98]">
                         Proceed to Secure Portal
                         <ArrowRight className="ml-4 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                     </Button>
                  </Link>
              </div>
              
              <div className="bg-ink/5 p-10 rounded-[48px] border border-ink/5">
                  <p className="text-[10px] text-ink/30 leading-relaxed font-medium italic">
                      By purchasing, you agree to our premium member terms and conditions. Luxury takes time; expect delivery within 3-5 business days.
                  </p>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
