import { motion } from "motion/react";
import Hero from "../components/Hero";
import { Link } from "react-router-dom";
import { ArrowUpRight, Send, MapPin, Mail, Phone, Star } from "lucide-react";
import { Button } from "../components/ui/button";
import { useState } from "react";
import { db } from "../lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { toast } from "sonner";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { handleFirestoreError, OperationType } from "../lib/firestoreUtils";
import { useSettings } from "../context/SettingsContext";

export default function Home() {
  const { settings } = useSettings();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please provide all details for our royal concierge.");
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "messages"), {
        ...formData,
        status: 'unread',
        createdAt: new Date().toISOString()
      });
      toast.success("Message gracefully received. Our concierge will contact you shortly.");
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "messages");
      toast.error("A system error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-paper text-ink">
      <Hero />
      
      {/* Featured Products Mini Grid */}
      <section id="story" className="py-32 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-end justify-between mb-24">
          <div className="mb-12 md:mb-0 max-w-2xl">
            <span className="text-royal-red text-[10px] font-bold uppercase tracking-[0.4em] mb-6 block">
              {settings.storySubtitle || "Our Heritage"}
            </span>
            <h2 className="text-5xl md:text-8xl font-serif font-light tracking-tighter mb-8 leading-none">
              {settings.storyTitle ? (
                  <span>{settings.storyTitle}</span>
              ) : (
                  <>Selected <br/><span className="text-ink/10 italic">Heritage.</span></>
              )}
            </h2>
            <p className="text-ink/40 max-w-lg text-lg font-light leading-relaxed">
                {settings.storyContent || "From the strictly guarded kitchens of our ancestors to the most discerning global tables."}
            </p>
          </div>
          <Link to="/shop" className="group flex items-center space-x-4 text-[10px] uppercase tracking-[0.4em] font-bold text-ink">
            <span>Explore Boutique</span>
            <div className="w-14 h-14 rounded-full border border-ink/5 flex items-center justify-center group-hover:bg-ink group-hover:text-white transition-all shadow-sm">
                <ArrowUpRight className="w-4 h-4" />
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {[
            { id: "spicy-sun-tomato", name: "Premium Spicy Tomato", price: "$24.00", img: "https://images.unsplash.com/photo-1590779033100-9f60a05a013d?q=80&w=1974&auto=format&fit=crop" },
            { id: "smoky-garlic-fusion", name: "Imperial Garlic Blend", price: "$28.00", img: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?q=80&w=1974&auto=format&fit=crop" },
            { id: "heritage-blend", name: "The Royal Heritage", price: "$32.00", img: "https://images.unsplash.com/photo-1512149673953-1e251807ec7c?q=80&w=1974&auto=format&fit=crop" },
          ].map((product, i) => (
            <Link
              key={product.id}
              to={`/shop`}
              className="block group cursor-pointer"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="aspect-[3/4] overflow-hidden rounded-[40px] relative mb-8 shadow-sm">
                   <img src={product.img} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt={product.name} />
                   <div className="absolute inset-0 bg-ink/5 group-hover:bg-transparent transition-colors" />
                </div>
                <div className="flex justify-between items-center px-2">
                    <div>
                        <h3 className="text-xl font-serif italic tracking-tight mb-1">{product.name}</h3>
                        <p className="text-ink/30 text-xs font-bold uppercase tracking-widest">{product.price}</p>
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-ink/20 group-hover:text-royal-red transition-colors" />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>
 
      {/* Experience Section */}
      <section id="process" className="bg-white/40 py-48 overflow-hidden border-y border-ink/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
            <div className="relative group">
                <div className="aspect-[4/5] rounded-[64px] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] relative">
                    <img src="https://images.unsplash.com/photo-1606914469225-068361730922?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="Artisanal Process" />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/20 to-transparent" />
                </div>
                <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-ink rounded-full flex flex-col items-center justify-center p-12 text-center shadow-3xl transform rotate-12 transition-transform group-hover:rotate-0 duration-700">
                    <span className="text-white/40 text-[10px] font-bold uppercase tracking-[0.3em] mb-3">Authentic</span>
                    <span className="text-white text-2xl font-serif italic leading-tight">Master Craftsmanship</span>
                </div>
            </div>
            <div className="space-y-12">
                 <span className="text-royal-red text-[10px] font-bold uppercase tracking-[0.4em]">
                    {settings.processSubtitle || "How it's Made"}
                 </span>
                 <h2 className="text-5xl md:text-7xl font-light leading-[0.95] tracking-tighter text-ink">
                    {settings.processTitle ? (
                        <span>{settings.processTitle}</span>
                    ) : (
                        <>Crafting memories, <br/><span className="italic font-serif text-royal-red underline underline-offset-[24px] decoration-1">one jar at a time.</span></>
                    )}
                 </h2>
                 <p className="text-ink/40 text-xl font-light leading-relaxed max-w-lg">
                    {settings.processContent || "Our artisanal process is a labor of love. We source only the most prestigious, sun-ripened tomatoes and blend them with our secret line of heritage spices."}
                 </p>
                 <div className="flex items-center space-x-12 pt-12">
                    <Link to="/shop">
                        <Button className="rounded-full bg-ink text-white hover:bg-ink/80 px-12 py-10 text-[10px] uppercase tracking-[0.3em] font-bold shadow-xl">Start Your Collection</Button>
                    </Link>
                    <div className="flex flex-col">
                        <span className="text-3xl font-serif text-ink italic">4.9/5</span>
                        <span className="text-[10px] uppercase tracking-widest text-ink/30 font-bold">Patron Rating</span>
                    </div>
                 </div>
            </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-48 px-6 max-w-6xl mx-auto">
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
            <div className="max-w-md">
               <span className="text-royal-red text-[10px] font-bold uppercase tracking-[0.5em] mb-10 block">Imperial Inquiries</span>
               <h2 className="text-4xl md:text-7xl font-light tracking-tighter mb-10 leading-tight text-ink font-display">Connect with our <br/><span className="italic font-serif">Royal Concierge.</span></h2>
               <p className="text-ink/40 mb-16 text-lg leading-relaxed font-light">Whether you have a custom request or wish to discuss an enterprise partnership, our elite team is at your service.</p>
               
               <div className="space-y-10 pt-12 border-t border-ink/5">
                  <div className="flex items-center space-x-6 group cursor-pointer">
                     <div className="w-14 h-14 rounded-2xl bg-ink/5 flex items-center justify-center group-hover:bg-royal-red group-hover:text-white transition-all">
                        <Mail className="w-5 h-5" />
                     </div>
                     <div>
                        <span className="text-[10px] uppercase tracking-widest text-ink/40 font-bold block mb-1">Electronic Mail</span>
                        <span className="text-sm font-medium text-ink/80 group-hover:text-royal-red transition-colors">{settings.contactEmail || "concierge@royaltomato.com"}</span>
                     </div>
                  </div>
                  <div className="flex items-center space-x-6 group cursor-pointer">
                     <div className="w-14 h-14 rounded-2xl bg-ink/5 flex items-center justify-center group-hover:bg-royal-red group-hover:text-white transition-all">
                        <MapPin className="w-5 h-5" />
                     </div>
                     <div>
                        <span className="text-[10px] uppercase tracking-widest text-ink/40 font-bold block mb-1">Executive Curation Center</span>
                        <span className="text-sm font-medium text-ink/80 group-hover:text-royal-red transition-colors">Dhaka, Bangladesh • International Shipping</span>
                     </div>
                  </div>
               </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white/60 backdrop-blur-xl p-12 rounded-[64px] border border-ink/5 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8">
                  <Star className="w-12 h-12 text-ink/5" />
               </div>
               
               <div className="space-y-8 relative z-10">
                   <div className="space-y-3">
                      <Label className="text-[10px] uppercase font-bold tracking-widest text-ink/30 ml-6">Full Dignitary Name</Label>
                      <Input 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        placeholder="e.g. Honorable Mahmud Hasan" 
                        className="rounded-full bg-paper border-ink/5 h-16 px-8 focus:border-royal-red/30 text-ink text-sm shadow-inner" 
                      />
                   </div>
                   <div className="space-y-3">
                      <Label className="text-[10px] uppercase font-bold tracking-widest text-ink/30 ml-6">Official Email Portal</Label>
                      <Input 
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        placeholder="dignitary@luxury.com" 
                        className="rounded-full bg-paper border-ink/5 h-16 px-8 focus:border-royal-red/30 text-ink text-sm shadow-inner" 
                      />
                   </div>
                   <div className="space-y-3">
                      <Label className="text-[10px] uppercase font-bold tracking-widest text-ink/30 ml-6">Nature of Inquiry</Label>
                      <textarea 
                        value={formData.message}
                        onChange={e => setFormData({...formData, message: e.target.value})}
                        className="w-full bg-paper border border-ink/5 rounded-[40px] p-8 min-h-[200px] text-sm focus:outline-none focus:border-royal-red/30 transition-all text-ink shadow-inner italic font-serif"
                        placeholder="How may our imperial team serve you today?"
                      />
                   </div>
                   <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full rounded-full bg-ink text-white hover:bg-ink/90 h-20 text-[10px] uppercase tracking-[0.4em] font-bold shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] transition-all active:scale-[0.98]"
                   >
                     {isSubmitting ? "Gracefully Transmitting..." : (
                       <>
                         <Send className="w-4 h-4 mr-4" />
                         Transmit Inquiry
                       </>
                     )}
                   </Button>
               </div>
            </form>
         </div>
       </section>
    </div>
  );
}
