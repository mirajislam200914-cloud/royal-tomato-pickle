import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { auth, db } from "../lib/firebase";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { User, Package, LogOut, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { toast } from "sonner";

export default function Profile() {
  const { user, profile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        const q = query(
          collection(db, "orders"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        setOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Order fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (!user) return null;

  const handleLogout = async () => {
    try {
      await auth.signOut();
      toast.success("Signed out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  return (
    <div className="bg-paper min-h-screen text-ink pt-24 pb-48">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-20"
        >
          <header className="flex flex-col md:flex-row items-center justify-between gap-12 pb-16 border-b border-ink/5">
            <div className="flex items-center space-x-10">
              <div className="w-32 h-32 rounded-full bg-ink p-1 shadow-2xl">
                <div className="w-full h-full rounded-full bg-paper flex items-center justify-center">
                   <User className="w-12 h-12 text-ink" />
                </div>
              </div>
              <div>
                <span className="text-royal-red text-[10px] font-bold uppercase tracking-[0.4em] mb-3 block">Patron Profile</span>
                <h1 className="text-5xl font-serif italic tracking-tighter mb-4">{profile?.displayName || "Elite Member"}</h1>
                <div className="flex items-center space-x-4">
                                   <span className="text-[10px] uppercase font-bold tracking-[0.4em] px-4 py-1.5 bg-ink text-white rounded-full">
                                      {profile?.role === 'admin' ? "Super Admin" : "Patron member"}
                                   </span>
                   {isAdmin && (
                     <Button variant="link" size="sm" onClick={() => navigate("/admin")} className="text-royal-red p-0 h-auto text-[10px] uppercase font-bold tracking-widest hover:no-underline hover:text-ink transition-colors">
                       <Shield className="w-3 h-3 mr-2" />
                       Control Dashboard
                     </Button>
                   )}
                </div>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} className="rounded-full border-ink/5 bg-white shadow-sm hover:bg-ink hover:text-white transition-all px-10 py-7 text-[10px] uppercase font-bold tracking-widest">
              <LogOut className="w-4 h-4 mr-3" />
              Relinquish Session
            </Button>
          </header>

          <section className="space-y-12">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Package className="w-6 h-6 text-ink/20" />
                  <h2 className="text-3xl font-serif italic text-ink">Order History</h2>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-ink/20">{orders.length} Curations</span>
              </div>

              {loading ? (
                  <div className="py-24 text-center text-ink/10 italic font-serif text-2xl tracking-tighter">Scanning the archives...</div>
              ) : orders.length === 0 ? (
                  <div className="bg-white/40 backdrop-blur-xl rounded-[64px] p-24 text-center border border-ink/5 shadow-sm">
                      <p className="text-ink/30 italic font-serif text-xl mb-10">No formal orders found in your heritage history.</p>
                      <Button onClick={() => navigate("/shop")} className="rounded-full bg-ink text-white hover:bg-ink/90 px-16 py-8 text-[10px] uppercase font-bold tracking-[0.4em] shadow-xl">
                          Acquire Heritage
                      </Button>
                  </div>
              ) : (
                  <div className="grid gap-6">
                      {orders.map(order => (
                          <div key={order.id} className="bg-white/60 hover:bg-white border border-ink/5 p-10 rounded-[48px] flex flex-col md:flex-row justify-between items-start md:items-center gap-10 group transition-all shadow-sm hover:shadow-xl">
                              <div className="space-y-2">
                                  <div className="flex items-center space-x-6 mb-3">
                                      <span className="text-xl font-bold tracking-tight text-ink">{order.orderId}</span>
                                      <span className={`text-[9px] font-bold uppercase tracking-[0.3em] px-4 py-1.5 rounded-full ${
                                          order.status === 'delivered' ? 'bg-green-500/10 text-green-600' : 'bg-royal-red/10 text-royal-red'
                                      }`}>
                                          {order.status}
                                      </span>
                                  </div>
                                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/20">{new Date(order.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })} • {order.items.length} Curated Items</p>
                              </div>
                              <div className="text-right">
                                  <p className="text-3xl font-bold tracking-tighter mb-2 text-ink">${order.total?.toFixed(2)}</p>
                                  <Button variant="link" className="text-[10px] uppercase font-bold tracking-[0.4em] text-ink/20 p-0 h-auto hover:text-ink hover:no-underline transition-colors">
                                      View Invoice Detail
                                  </Button>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </section>
        </motion.div>
      </div>
    </div>
  );
}
