import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import { Switch } from "../components/ui/switch";
import { CheckCircle2, CreditCard, ShieldCheck, Smartphone, Landmark } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { db } from "../lib/firebase";
import { doc, writeBatch, collection } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { handleFirestoreError, OperationType } from "../lib/firestoreUtils";

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const { settings, payment } = useSettings();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [smsConsent, setSmsConsent] = useState(false);
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplete = async () => {
    if (items.length === 0) {
        toast.error(`Your cart is empty. Please select your prestige pickles from ${settings?.siteName}.`);
        return;
    }

    if (smsConsent) {
        // Strict E.164 verification: optional +, followed by 10-15 digits
        const e164Regex = /^\+?[1-9]\d{9,14}$/;
        if (!phone || !e164Regex.test(phone.replace(/\s+/g, ''))) {
            toast.error("Prestige communication requires a valid international phone number (e.g., +1234567890).");
            return;
        }
    }

    setIsSubmitting(true);
    const sanitizedPhone = phone.replace(/\s+/g, '');
    const orderId = `${settings?.logoText?.toUpperCase() || 'ROYAL'}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    try {
        const batch = writeBatch(db);
        
        // Order Reference (using fixed ID to prevent duplicates on double-click/retry)
        const orderRef = doc(db, "orders", orderId);
        
        const orderData = {
            orderId,
            userId: user?.uid || 'guest',
            userEmail: user?.email || 'guest@royal.com',
            items: items.map(i => ({
                productId: i.id,
                name: i.name,
                price: Number(i.price),
                quantity: Number(i.quantity)
            })),
            total: Number(total),
            status: 'pending',
            createdAt: new Date().toISOString(),
            paymentMethod,
            smsNotification: smsConsent,
            customerPhone: sanitizedPhone || null
        };

        batch.set(orderRef, orderData);

        // Trigger SMS Fallback System
        if (smsConsent && phone && settings?.smsEnabled) {
            const smsRef = doc(collection(db, "sms_logs"));
            batch.set(smsRef, {
                orderId,
                userId: user?.uid || 'guest',
                phoneNumber: phone,
                message: `${settings?.siteName} Order ${orderId} Confirmed! Total: $${total.toFixed(2)}. Preparing for shipment.`,
                status: 'sent',
                retryCount: 0,
                createdAt: new Date().toISOString()
            });
        }

        // Commit both atomically
        await batch.commit();

        toast.success(`Order placed with the House of ${settings?.siteName}!`);
        
        setTimeout(() => {
            clearCart();
            window.location.href = "/";
        }, 2000);

    } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, "orders/batch");
        toast.error("A rare system error occurred. Please contact royal support.");
    } finally {
        setIsSubmitting(false);
    }
  };

  if (items.length === 0) return <div className="p-20 text-center bg-paper text-ink min-h-screen">Empty cart. <Link to="/shop" className="text-royal-red font-bold underline">Go back.</Link></div>;

  const getInstructions = (method: string) => {
    if (method === 'paypal' && payment?.paypal) return `Please send payment to PayPal: ${payment.paypal}`;
    if (method === 'bkash' && payment?.bkash) return `Please Send Money to: ${payment.bkash}`;
    if (method === 'nagad' && payment?.nagad) return `Please Send Money to: ${payment.nagad}`;
    if (method === 'bank' && settings?.bankAccountInfo) return settings.bankAccountInfo;
    return null;
  };

  return (
    <div className="bg-paper min-h-screen text-ink">
      <div className="max-w-7xl mx-auto px-6 py-24">
        <header className="mb-24 text-center">
          <span className="text-royal-red text-[10px] font-bold uppercase tracking-[0.5em] mb-6 block">Order Finalization</span>
          <h1 className="text-5xl md:text-8xl font-light tracking-tighter mb-8 font-serif leading-none italic">Secure <span className="text-ink/10 font-bold not-italic">Checkout.</span></h1>
          <div className="flex items-center justify-center space-x-6 text-[10px] font-bold uppercase tracking-[0.3em] text-ink/20">
              <span className={step >= 1 ? "text-ink border-b-2 border-royal-red pb-1" : ""}>Shipping</span>
              <div className="w-10 h-px bg-ink/5" />
              <span className={step >= 2 ? "text-ink border-b-2 border-royal-red pb-1" : ""}>Payment</span>
              <div className="w-10 h-px bg-ink/5" />
              <span className={step >= 3 ? "text-ink border-b-2 border-royal-red pb-1" : ""}>Review</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
          <div className="space-y-16">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-10"
                >
                  <h2 className="text-3xl font-serif italic mb-2">Shipping Information</h2>
                  <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-3">
                          <Label className="text-[10px] uppercase font-bold tracking-widest text-ink/30 ml-6">First Name</Label>
                          <Input placeholder="John" className="rounded-full bg-white/50 border-ink/5 h-16 px-8 shadow-inner" />
                      </div>
                      <div className="space-y-3">
                          <Label className="text-[10px] uppercase font-bold tracking-widest text-ink/30 ml-6">Last Name</Label>
                          <Input placeholder="Doe" className="rounded-full bg-white/50 border-ink/5 h-16 px-8 shadow-inner" />
                      </div>
                  </div>
                  <div className="space-y-3">
                      <Label className="text-[10px] uppercase font-bold tracking-widest text-ink/30 ml-6">Home Address</Label>
                      <Input placeholder="123 Luxury Ave, Suite 100" className="rounded-full bg-white/50 border-ink/5 h-16 px-8 shadow-inner" />
                  </div>
                  <div className="grid grid-cols-3 gap-8">
                      <div className="space-y-3">
                          <Label className="text-[10px] uppercase font-bold tracking-widest text-ink/30 ml-6">City</Label>
                          <Input placeholder="New York" className="rounded-full bg-white/50 border-ink/5 h-16 px-8 shadow-inner" />
                      </div>
                      <div className="space-y-3">
                          <Label className="text-[10px] uppercase font-bold tracking-widest text-ink/30 ml-6">Postal Code</Label>
                          <Input placeholder="10001" className="rounded-full bg-white/50 border-ink/5 h-16 px-8 shadow-inner" />
                      </div>
                      <div className="space-y-3">
                          <Label className="text-[10px] uppercase font-bold tracking-widest text-ink/30 ml-6">Country</Label>
                          <Input placeholder="USA" className="rounded-full bg-white/50 border-ink/5 h-16 px-8 shadow-inner" />
                      </div>
                  </div>
                  <Button onClick={() => setStep(2)} className="w-full rounded-full py-10 bg-ink text-white text-[10px] uppercase tracking-[0.4em] font-bold shadow-2xl transition-all hover:scale-[1.01] active:scale-[0.98]">
                    Continue to Payment
                  </Button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-10"
                >
                  <h2 className="text-3xl font-serif italic mb-2">Payment Method</h2>
                  <div className="grid grid-cols-1 gap-6">
                      {[
                          { id: "stripe", name: "Imperial Credit Card", icon: CreditCard, enabled: true },
                          { id: "paypal", name: "PayPal Express", icon: ShieldCheck, enabled: !!payment?.paypal },
                          { id: "bkash", name: "bKash Transfer", icon: Smartphone, enabled: !!payment?.bkash },
                          { id: "nagad", name: "Nagad Transfer", icon: Smartphone, enabled: !!payment?.nagad },
                          { id: "bank", name: "Direct Bank Wire", icon: Landmark, enabled: !!settings?.bankAccountInfo },
                      ].filter(m => m.enabled).map(method => (
                          <button
                              key={method.id}
                              onClick={() => setPaymentMethod(method.id)}
                              className={`flex items-center justify-between p-8 rounded-[32px] border transition-all ${
                                  paymentMethod === method.id 
                                  ? "bg-white border-royal-red shadow-xl" 
                                  : "bg-white/40 border-ink/5 grayscale hover:grayscale-0 hover:border-ink/20"
                              }`}
                          >
                              <div className="flex items-center space-x-6">
                                  <div className={`p-4 rounded-2xl ${paymentMethod === method.id ? 'bg-royal-red text-white' : 'bg-ink/5 text-ink/20'}`}>
                                      <method.icon className="w-5 h-5" />
                                  </div>
                                  <span className={`font-bold tracking-tight ${paymentMethod === method.id ? 'text-ink' : 'text-ink/40'}`}>{method.name}</span>
                              </div>
                              {paymentMethod === method.id && <CheckCircle2 className="w-6 h-6 text-royal-red" />}
                          </button>
                      ))}
                  </div>
                  <div className="flex space-x-6 items-center">
                      <Button variant="ghost" onClick={() => setStep(1)} className="rounded-full py-10 flex-1 text-ink/40 text-[10px] uppercase font-bold tracking-[0.3em] hover:bg-ink/5">Back</Button>
                      <Button onClick={() => setStep(3)} className="rounded-full py-10 flex-[2] bg-ink text-white text-[10px] uppercase font-bold tracking-[0.4em] shadow-2xl">Review Order</Button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                  <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-12"
                  >
                      <div className="space-y-4">
                          <h2 className="text-3xl font-serif italic">Confirm Order</h2>
                          <p className="text-ink/30 text-sm font-light">Please verify your details before finalizing your premium purchase.</p>
                      </div>
                      
                      <div className="bg-white/60 backdrop-blur-xl p-10 rounded-[48px] border border-ink/5 space-y-10 shadow-sm">
                          <div className="flex justify-between items-center text-sm">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-ink/20">Shipping To</span>
                              <span className="font-serif italic text-ink">John Doe, New York, USA</span>
                          </div>
                          <Separator className="bg-ink/5" />
                          <div className="flex justify-between items-center text-sm">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-ink/20">Payment Mode</span>
                              <span className="font-bold uppercase tracking-widest text-royal-red text-[10px]">{paymentMethod}</span>
                          </div>

                          {getInstructions(paymentMethod) && (
                              <div className="p-8 rounded-[32px] bg-paper shadow-inner space-y-4 border border-ink/5 relative overflow-hidden">
                                  <div className="absolute top-0 right-0 p-4">
                                      <Landmark className="w-12 h-12 text-ink/5" />
                                  </div>
                                  <Label className="text-[10px] uppercase font-bold tracking-[0.2em] text-royal-red/60 italic block mb-2">Relay Instructions</Label>
                                  <p className="text-sm text-ink/80 whitespace-pre-line leading-relaxed font-serif italic">
                                      {getInstructions(paymentMethod)}
                                  </p>
                                  <p className="text-[10px] text-ink/20 font-bold uppercase tracking-widest pt-4 border-t border-ink/5">Verification time: Est. 12 hours</p>
                              </div>
                          )}

                          {settings?.smsEnabled && (
                              <div className="space-y-6 pt-4">
                                  <div className="flex items-center justify-between">
                                      <div className="space-y-1">
                                          <Label className="text-xs font-bold uppercase tracking-widest flex items-center text-ink/60">
                                              <Smartphone className="w-4 h-4 mr-3 text-royal-red" />
                                              Elite SMS Updates
                                          </Label>
                                          <p className="text-[10px] text-ink/30 italic font-medium">Real-time transit alerts for your curation.</p>
                                      </div>
                                      <Switch 
                                          checked={smsConsent} 
                                          onCheckedChange={setSmsConsent}
                                          className="data-[state=checked]:bg-royal-red shadow-sm"
                                      />
                                  </div>
                                  {smsConsent && (
                                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                                          <Input 
                                              placeholder="+1 (555) 000-0000" 
                                              className="rounded-full bg-paper border-ink/5 h-16 px-8 shadow-inner text-sm italic font-serif" 
                                              value={phone}
                                              onChange={e => setPhone(e.target.value)}
                                          />
                                      </motion.div>
                                  )}
                              </div>
                          )}
                      </div>

                      <Button 
                          onClick={handleComplete} 
                          disabled={isSubmitting}
                          className="w-full rounded-full py-12 bg-ink text-white hover:bg-ink/80 text-[10px] font-bold uppercase tracking-[0.5em] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                      >
                          {isSubmitting ? "Gracefully Processing..." : `Complete Purchase • $${total.toFixed(2)}`}
                      </Button>
                  </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar Summary */}
          <div className="bg-white/40 backdrop-blur-xl p-12 rounded-[64px] border border-ink/5 space-y-12 lg:sticky lg:top-32 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)]">
              <h3 className="text-3xl font-serif italic text-ink/60">Your Selection</h3>
              <div className="space-y-10">
                  {items.map(item => (
                      <div key={item.id} className="flex justify-between items-center space-x-6 group">
                          <div className="flex items-center space-x-6">
                              <div className="w-16 h-20 rounded-2xl overflow-hidden bg-paper shadow-inner border border-ink/5">
                                  <img src={item.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt={item.name} />
                              </div>
                              <div>
                                  <h4 className="text-sm font-serif italic text-ink mb-1">{item.name}</h4>
                                  <span className="text-[10px] text-ink/20 font-bold uppercase tracking-widest">Quantity: {item.quantity}</span>
                              </div>
                          </div>
                          <span className="text-sm font-bold text-ink/40">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                  ))}
              </div>
              <Separator className="bg-ink/5" />
              <div className="space-y-6">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-ink/20">
                      <span>Subtotal</span>
                      <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-ink/20">
                      <span>Shipping</span>
                      <span className="text-royal-red italic">Complimentary</span>
                  </div>
                  <div className="flex justify-between text-3xl pt-8 border-t border-ink/5 mt-10 font-serif italic text-ink">
                      <span>Total Value</span>
                      <span>${total.toFixed(2)}</span>
                  </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
