import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { Link, useNavigate } from "react-router-dom";
import { 
  LogOut, LayoutDashboard, ShoppingBag, Users, Settings, Bell, 
  TrendingUp, DollarSign, Package, Star, Plus, Trash2, Edit, Save, 
  SwitchCamera, Smartphone, ShieldCheck, Banknote, Mail
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { motion } from "motion/react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useState, useEffect } from "react";
import { db, auth } from "../lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot, setDoc, getDoc } from "firebase/firestore";
import { Product, SystemSettings } from "../types";
import { toast } from "sonner";
import { handleFirestoreError, OperationType } from "../lib/firestoreUtils";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "../components/ui/dialog";

const data = [
  { name: 'Jan', sales: 4000, revenue: 2400 },
  { name: 'Feb', sales: 3000, revenue: 1398 },
  { name: 'Mar', sales: 2000, revenue: 9800 },
  { name: 'Apr', sales: 2780, revenue: 3908 },
  { name: 'May', sales: 1890, revenue: 4800 },
  { name: 'Jun', sales: 2390, revenue: 3800 },
];

type AdminTab = "Overview" | "Products" | "Orders" | "Customers" | "Payments" | "Messages" | "Appearance" | "Settings";

export default function AdminDashboard() {
  const { profile, user } = useAuth();
  const { settings: globalSettings, payment: globalPayment } = useSettings();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>("Overview");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(globalSettings);
  const [payment, setPayment] = useState(globalPayment);
  const [loading, setLoading] = useState(true);

  const logAuditAction = async (action: string, details: string) => {
    if (!user) return;
    try {
      const logData = {
        adminId: user.uid,
        adminEmail: user.email || 'unknown@royal.com',
        action,
        details,
        timestamp: new Date().toISOString()
      };
      await addDoc(collection(db, "audit_logs"), logData);
    } catch (e) {
      console.error("Audit log critical failure:", e);
    }
  };

  // Product form state
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  useEffect(() => {
    if (profile?.role !== 'admin') return;

    const unsubProducts = onSnapshot(collection(db, "products"), (snapshot) => {
      const pList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(pList);
    }, (error) => {
        handleFirestoreError(error, OperationType.GET, "products");
        toast.error("Security alert: Product sync failed.");
    });

    const unsubOrders = onSnapshot(collection(db, "orders"), (snapshot) => {
        const oList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrders(oList);
    }, (error) => {
        handleFirestoreError(error, OperationType.GET, "orders");
        toast.error("Security alert: Order sync failed.");
    });

    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
        const uList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCustomers(uList);
    }, (error) => {
        handleFirestoreError(error, OperationType.GET, "users");
        toast.error("Security alert: Customer sync failed.");
    });

    const unsubMessages = onSnapshot(collection(db, "messages"), (snapshot) => {
        const mList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMessages(mList);
    }, (error) => {
        handleFirestoreError(error, OperationType.GET, "messages");
        toast.error("Security alert: Message sync failed.");
    });

    const fetchSettings = async () => {
       try {
         const snapGlobal = await getDoc(doc(db, "settings", "global"));
         if (snapGlobal.exists()) {
           setSettings(prev => ({ ...prev, ...snapGlobal.data() }));
         }
         const snapPayment = await getDoc(doc(db, "settings", "payment"));
         if (snapPayment.exists()) {
           setPayment(prev => ({ ...prev, ...snapPayment.data() }));
         }
       } catch (e) {
         console.error("Fetch settings error", e);
       }
    };
    fetchSettings();
    setLoading(false);

    return () => {
        unsubProducts();
        unsubOrders();
        unsubUsers();
        unsubMessages();
    };
  }, [profile]);

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      if (editingProduct.id) {
        await updateDoc(doc(db, "products", editingProduct.id), editingProduct);
        toast.success("Product updated successfully");
        logAuditAction("UPDATE_PRODUCT", `Updated: ${editingProduct.name} (${editingProduct.id})`);
      } else {
        const newDoc = await addDoc(collection(db, "products"), {
            ...editingProduct,
            stock: editingProduct.stock || 0
        });
        toast.success("Product added successfully");
        logAuditAction("CREATE_PRODUCT", `Created: ${editingProduct.name} (${newDoc.id})`);
      }
      setEditingProduct(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `products/${editingProduct?.id || 'new'}`);
      toast.error("Failed to save product");
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status });
      toast.success(`Order status updated to ${status}`);
      logAuditAction("UPDATE_ORDER", `Order ${orderId} status set to ${status}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `orders/${orderId}`);
      toast.error("Status update failed");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this prestige product?")) return;
    try {
      await deleteDoc(doc(db, "products", id));
      toast.success("Product removed");
      logAuditAction("DELETE_PRODUCT", `Deleted product ID: ${id}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
      toast.error("Failed to delete product");
    }
  };

  const handleSaveSettings = async () => {
    try {
      await setDoc(doc(db, "settings", "global"), settings);
      await setDoc(doc(db, "settings", "payment"), payment);
      toast.success("All institutional configurations updated");
      logAuditAction("UPDATE_SETTINGS", "Updated global and payment enterprise settings");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "settings/global");
      toast.error("Failed to save settings");
    }
  };

  if (!profile) return <div className="p-20 text-center">Loading...</div>;
  if (profile.role !== 'admin') {
      return (
          <div className="min-h-screen flex items-center justify-center flex-col space-y-6">
              <h1 className="text-4xl font-bold">Access Denied</h1>
              <p className="text-white/40">You do not have permission to view this page.</p>
              <Link to="/"><Button variant="outline">Return Home</Button></Link>
          </div>
      )
  }

  return (
    <div className="flex min-h-screen bg-paper text-ink">
      {/* Sidebar */}
      <aside className="w-64 border-r border-ink/5 bg-white/40 backdrop-blur-xl p-6 hidden lg:flex flex-col">
        <div className="mb-12">
            <span className="text-xl font-display font-bold tracking-tighter uppercase">{globalSettings.logoText}<span className="text-royal-red">.</span>ADMIN</span>
        </div>
        
        <nav className="space-y-2 flex-1">
            {[
                { name: "Overview", icon: LayoutDashboard },
                { name: "Products", icon: Package },
                { name: "Appearance", icon: SwitchCamera },
                { name: "Orders", icon: ShoppingBag },
                { name: "Customers", icon: Users },
                { name: "Payments", icon: Banknote },
                { name: "Messages", icon: Mail },
                { name: "Settings", icon: Settings },
            ].map(item => (
                <button 
                  key={item.name} 
                  onClick={() => setActiveTab(item.name as AdminTab)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm transition-all ${activeTab === item.name ? 'bg-ink text-white font-medium shadow-xl' : 'text-ink/40 hover:bg-ink/5 hover:text-ink'}`}
                >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                </button>
            ))}
        </nav>

        <div className="pt-20 border-t border-ink/5 space-y-2">
            <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                className="w-full justify-start text-ink/40 hover:text-royal-red hover:bg-royal-red/10 rounded-xl"
            >
                <LayoutDashboard className="w-4 h-4 mr-3" />
                View Website
            </Button>
            <Button 
                variant="ghost" 
                onClick={async () => {
                   await auth.signOut();
                   navigate('/auth');
                }}
                className="w-full justify-start text-ink/40 hover:text-royal-red hover:bg-royal-red/10 rounded-xl text-destructive"
            >
                <LogOut className="w-4 h-4 mr-3" />
                Logout
            </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-12">
            <div>
                <h1 className="text-3xl font-display font-medium tracking-tight">Enterprise {activeTab}</h1>
                <p className="text-ink/40 text-sm">Managing the {globalSettings.siteName} Empire.</p>
            </div>
            <div className="flex items-center space-x-4">
                <button className="p-2 bg-white/50 rounded-full border border-ink/5 relative overflow-hidden">
                    <Bell className="w-5 h-5 text-ink/60" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-royal-red rounded-full border-2 border-white" />
                </button>
                <div className="w-10 h-10 rounded-full bg-ink text-white flex items-center justify-center font-bold text-xs ring-4 ring-ink/5">
                  {profile.displayName?.charAt(0) || profile.email?.charAt(0)}
                </div>
            </div>
        </header>

        {activeTab === "Overview" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {[
                        { title: "Total Revenue", value: "$124,592.00", change: "+12.5%", icon: DollarSign },
                        { title: "Active Orders", value: "482", change: "+4.3%", icon: ShoppingBag },
                        { title: "New Customers", value: "1,204", change: "+18.2%", icon: Users },
                        { title: "Avg. Rating", value: "4.9", change: "+0.1", icon: Star },
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Card className="bg-white/60 border-ink/5 rounded-2xl overflow-hidden shadow-sm">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-xs font-bold uppercase tracking-[0.2em] text-ink/40">{stat.title}</CardTitle>
                                    <stat.icon className="w-4 h-4 text-royal-red" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-display font-medium mb-1">{stat.value}</div>
                                    <p className="text-[10px] text-green-600 font-bold">{stat.change} <span className="text-ink/20 ml-1 font-medium italic">vs last month</span></p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    <Card className="bg-white/60 border-ink/5 rounded-3xl p-8 shadow-sm">
                        <CardTitle className="text-xl font-light mb-8">Sales performance</CardTitle>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'rgba(0,0,0,0.4)', fontSize: 12}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: 'rgba(0,0,0,0.4)', fontSize: 12}} />
                                    <Tooltip contentStyle={{backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '12px'}} />
                                    <Bar dataKey="sales" fill="#0A0A0A" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card className="bg-white/60 border-ink/5 rounded-3xl p-8 shadow-sm">
                        <CardTitle className="text-xl font-light mb-8">Global Revenue growth</CardTitle>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'rgba(0,0,0,0.4)', fontSize: 12}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: 'rgba(0,0,0,0.4)', fontSize: 12}} />
                                    <Tooltip contentStyle={{backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '12px'}} />
                                    <Line type="monotone" dataKey="revenue" stroke="#8B0000" strokeWidth={3} dot={{fill: '#8B0000', strokeWidth: 2, r: 4}} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>
            </motion.div>
        )}

        {activeTab === "Products" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="flex justify-between items-center bg-white/60 p-6 rounded-3xl border border-ink/5 shadow-sm">
                    <div>
                        <h2 className="text-xl font-display font-medium">Prestige Inventory</h2>
                        <p className="text-ink/40 text-xs">Manage the world's most premium pickles.</p>
                    </div>
                    <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
                        <DialogTrigger
                          render={
                            <Button className="bg-ink hover:bg-ink/80 text-white rounded-full px-6 shadow-lg">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Product
                            </Button>
                          }
                          onClick={() => setEditingProduct({})}
                        />
                        <DialogContent className="bg-white border-ink/5 text-ink rounded-[32px] max-w-2xl shadow-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-light font-display">Refine the Collection</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSaveProduct} className="space-y-6 py-4">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase tracking-widest text-ink/40 ml-4">Name</Label>
                                        <Input 
                                            value={editingProduct?.name || ''} 
                                            onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                                            className="bg-paper border-ink/5 h-12" 
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase tracking-widest text-ink/40 ml-4">Category</Label>
                                        <Input 
                                            value={editingProduct?.category || ''} 
                                            onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}
                                            className="bg-paper border-ink/5 h-12" 
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase tracking-widest text-ink/40 ml-4">Price ($)</Label>
                                        <Input 
                                            type="number" 
                                            value={editingProduct?.price || ''} 
                                            onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                                            className="bg-paper border-ink/5 h-12" 
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase tracking-widest text-ink/40 ml-4">Stock</Label>
                                        <Input 
                                            type="number" 
                                            value={editingProduct?.stock || ''} 
                                            onChange={e => setEditingProduct({...editingProduct, stock: Number(e.target.value)})}
                                            className="bg-paper border-ink/5 h-12" 
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-widest text-ink/40 ml-4">Image URL</Label>
                                    <Input 
                                        value={editingProduct?.image || ''} 
                                        onChange={e => setEditingProduct({...editingProduct, image: e.target.value})}
                                        className="bg-paper border-ink/5 h-12" 
                                        placeholder="Unsplash URL"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-widest text-ink/40 ml-4">Description</Label>
                                    <textarea 
                                        value={editingProduct?.description || ''} 
                                        onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
                                        className="w-full bg-paper border border-ink/5 rounded-2xl p-4 min-h-[100px] text-sm focus:outline-none"
                                        required
                                    />
                                </div>
                                <DialogFooter>
                                    <Button type="submit" className="bg-ink hover:bg-ink/80 text-white w-full rounded-full py-8 font-bold text-xs uppercase tracking-widest">
                                        {editingProduct?.id ? 'Enshrine Changes' : 'Launch Product'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {products.map(product => (
                        <Card key={product.id} className="bg-white/60 border-ink/5 rounded-[40px] overflow-hidden group shadow-sm hover:shadow-xl transition-all duration-700">
                           <div className="aspect-square relative overflow-hidden">
                             <img src={product.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt={product.name} />
                             <div className="absolute top-6 right-6 flex space-x-3">
                                <Button size="icon" className="rounded-full w-10 h-10 bg-white text-ink shadow-lg hover:scale-110 transition-transform" onClick={() => setEditingProduct(product)}>
                                    <Edit className="w-4 h-4" />
                                </Button>
                                <Button size="icon" className="rounded-full w-10 h-10 bg-royal-red text-white shadow-lg hover:scale-110 transition-transform" onClick={() => handleDeleteProduct(product.id)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                             </div>
                           </div>
                           <CardContent className="p-8">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-2xl font-serif italic tracking-tight">{product.name}</h3>
                                    <span className="text-royal-red font-bold font-display">${product.price}</span>
                                </div>
                                <p className="text-ink/40 text-sm line-clamp-2 mb-6 leading-relaxed">{product.description}</p>
                                <div className="flex items-center text-[10px] uppercase font-bold tracking-widest text-ink/30 border-t border-ink/5 pt-4">
                                    <Package className="w-3 h-3 mr-2" />
                                    {product.stock} units in boutique
                                </div>
                           </CardContent>
                        </Card>
                    ))}
                </div>
            </motion.div>
        )}

        {activeTab === "Appearance" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-8 pb-20">
             <Card className="bg-white/60 border-ink/5 rounded-[48px] p-12 shadow-sm">
                <div className="flex justify-between items-center mb-12">
                   <div>
                      <h2 className="text-3xl font-serif italic text-ink">Website Narrative</h2>
                      <p className="text-ink/40">Shape the visual and textual landscape of your brand.</p>
                   </div>
                   <Button onClick={handleSaveSettings} className="bg-ink hover:bg-ink/80 text-white rounded-full px-8 py-6 shadow-xl">
                      <Save className="w-4 h-4 mr-2" />
                      Save Master Profile
                   </Button>
                </div>

                <div className="space-y-12">
                   {/* Brand Identity */}
                   <section className="space-y-6">
                      <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-royal-red/60">Brand Identity</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-widest text-ink/40 ml-4">Site Name</Label>
                            <Input value={settings.siteName} onChange={e => setSettings({...settings, siteName: e.target.value})} className="bg-paper border-ink/5 h-14" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-widest text-ink/40 ml-4">Logo Text</Label>
                            <Input value={settings.logoText} onChange={e => setSettings({...settings, logoText: e.target.value})} className="bg-paper border-ink/5 h-14 font-display font-bold uppercase" />
                        </div>
                        <div className="col-span-full space-y-2">
                            <Label className="text-[10px] uppercase tracking-widest text-ink/40 ml-4">Global Tagline</Label>
                            <Input value={settings.tagline} onChange={e => setSettings({...settings, tagline: e.target.value})} className="bg-paper border-ink/5 h-14" />
                        </div>
                      </div>
                   </section>

                   {/* Hero Section */}
                   <section className="space-y-6 border-t border-ink/5 pt-12">
                      <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-royal-red/60">Hero Masterpiece</h3>
                      <div className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-widest text-ink/40 ml-4">Hero Title</Label>
                            <Input value={settings.heroTitle} onChange={e => setSettings({...settings, heroTitle: e.target.value})} className="bg-paper border-ink/5 h-14 font-serif italic text-xl" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-widest text-ink/40 ml-4">Hero Narrative (Subtitle)</Label>
                            <textarea value={settings.heroSubtitle} onChange={e => setSettings({...settings, heroSubtitle: e.target.value})} className="w-full bg-paper border border-ink/5 rounded-[32px] p-6 min-h-[100px] text-sm focus:outline-none" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-widest text-ink/40 ml-4">Main Hero Visual URL</Label>
                            <Input value={settings.heroImage} onChange={e => setSettings({...settings, heroImage: e.target.value})} className="bg-paper border-ink/5 h-14" />
                        </div>
                      </div>
                   </section>

                   {/* Story Section */}
                   <section className="space-y-6 border-t border-ink/5 pt-12">
                      <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-royal-red/60">Heritage Chronicle</h3>
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-2">
                              <Label className="text-[10px] uppercase tracking-widest text-ink/40 ml-4">Heritage Label</Label>
                              <Input value={settings.storySubtitle} onChange={e => setSettings({...settings, storySubtitle: e.target.value})} className="bg-paper border-ink/5 h-14" />
                          </div>
                          <div className="space-y-2">
                              <Label className="text-[10px] uppercase tracking-widest text-ink/40 ml-4">Heritage Title</Label>
                              <Input value={settings.storyTitle} onChange={e => setSettings({...settings, storyTitle: e.target.value})} className="bg-paper border-ink/5 h-14" />
                          </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-widest text-ink/40 ml-4">The Complete Heritage Narrative</Label>
                            <textarea value={settings.storyContent} onChange={e => setSettings({...settings, storyContent: e.target.value})} className="w-full bg-paper border border-ink/5 rounded-[32px] p-8 min-h-[150px] text-base font-serif italic focus:outline-none" />
                        </div>
                      </div>
                   </section>

                   {/* Process Section */}
                   <section className="space-y-6 border-t border-ink/5 pt-12">
                      <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-royal-red/60">Artisanal Process</h3>
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-2">
                              <Label className="text-[10px] uppercase tracking-widest text-ink/40 ml-4">Process Label</Label>
                              <Input value={settings.processSubtitle} onChange={e => setSettings({...settings, processSubtitle: e.target.value})} className="bg-paper border-ink/5 h-14" />
                          </div>
                          <div className="space-y-2">
                              <Label className="text-[10px] uppercase tracking-widest text-ink/40 ml-4">Process Title</Label>
                              <Input value={settings.processTitle} onChange={e => setSettings({...settings, processTitle: e.target.value})} className="bg-paper border-ink/5 h-14" />
                          </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-widest text-ink/40 ml-4">Artisanal Process Description</Label>
                            <textarea value={settings.processContent} onChange={e => setSettings({...settings, processContent: e.target.value})} className="w-full bg-paper border border-ink/5 rounded-[32px] p-8 min-h-[150px] text-sm leading-relaxed focus:outline-none" />
                        </div>
                      </div>
                   </section>
                </div>
             </Card>
          </motion.div>
        )}

        {activeTab === "Settings" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-8 pb-20">
                <Card className="bg-white/60 border-ink/5 rounded-[48px] p-12 shadow-sm">
                    <div className="flex justify-between items-center mb-12">
                       <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-ink/5 rounded-2xl flex items-center justify-center">
                             <ShieldCheck className="w-6 h-6 text-ink" />
                          </div>
                          <div>
                             <h2 className="text-3xl font-serif italic text-ink">Global Control</h2>
                             <p className="text-ink/40">Managing the institutional core.</p>
                          </div>
                       </div>
                       <Button onClick={handleSaveSettings} className="bg-ink hover:bg-ink/80 text-white rounded-full px-8 py-6 shadow-xl">
                          <Save className="w-4 h-4 mr-2" />
                          Save Institutional Config
                       </Button>
                    </div>
                    
                    <div className="space-y-12">
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-widest text-ink/40 ml-4">Master Concierge Email</Label>
                            <Input 
                                value={settings.contactEmail} 
                                onChange={e => setSettings({...settings, contactEmail: e.target.value})}
                                className="bg-paper border-ink/5 h-14"
                            />
                        </div>
                        <div className="flex items-center justify-between p-10 bg-paper rounded-[32px] border border-ink/5">
                            <div className="space-y-1">
                                <Label className="text-base flex items-center font-bold uppercase tracking-widest text-[10px]">
                                    <Smartphone className="w-4 h-4 mr-3 text-royal-red" />
                                    Prestige SMS Service
                                </Label>
                                <p className="text-ink/30 text-xs italic">Automated order alerts for our elite patrons.</p>
                            </div>
                            <Switch 
                                checked={settings.smsEnabled} 
                                onCheckedChange={val => setSettings({...settings, smsEnabled: val})} 
                                className="data-[state=checked]:bg-ink"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-widest text-ink/40 ml-4">Referral Invitation Bonus ($)</Label>
                            <Input 
                                type="number"
                                value={settings.referralBonus} 
                                onChange={e => setSettings({...settings, referralBonus: Number(e.target.value)})}
                                className="bg-paper border-ink/5 h-14"
                            />
                        </div>
                    </div>
                </Card>
            </motion.div>
        )}

        {activeTab === "Payments" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-8 pb-20">
                <div className="flex justify-between items-center bg-white/60 p-10 rounded-[48px] border border-ink/5 shadow-sm mb-12">
                   <div>
                      <h2 className="text-3xl font-serif italic text-ink">Settlement Infrastructure</h2>
                      <p className="text-ink/40">Configure your global payment gateways and domestic vectors.</p>
                   </div>
                   <Button onClick={handleSaveSettings} className="bg-ink hover:bg-ink/80 text-white rounded-full px-8 py-6 shadow-xl">
                      <Save className="w-4 h-4 mr-2" />
                      Save Infrastructure
                   </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="bg-white/60 border-ink/5 rounded-[48px] p-10 shadow-sm">
                        <div className="flex items-center space-x-4 mb-8">
                            <div className="w-12 h-12 bg-gold/10 rounded-2xl flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-gold" />
                            </div>
                            <h3 className="text-2xl font-serif italic">Mobile Finance</h3>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase tracking-widest text-ink/40 ml-4">bKash Royal Number</Label>
                                <Input 
                                    value={payment.bkash} 
                                    onChange={e => setPayment({...payment, bkash: e.target.value})}
                                    className="bg-paper border-ink/5 h-14 font-mono font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase tracking-widest text-ink/40 ml-4">Nagad Elite Number</Label>
                                <Input 
                                    value={payment.nagad} 
                                    onChange={e => setPayment({...payment, nagad: e.target.value})}
                                    className="bg-paper border-ink/5 h-14 font-mono font-bold"
                                />
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-white/60 border-ink/5 rounded-[48px] p-10 shadow-sm">
                        <div className="flex items-center space-x-4 mb-8">
                            <div className="w-12 h-12 bg-ink/5 rounded-2xl flex items-center justify-center">
                                <ShieldCheck className="w-6 h-6 text-ink" />
                            </div>
                            <h3 className="text-2xl font-serif italic">International Portals</h3>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase tracking-widest text-ink/40 ml-4">PayPal Executive Email</Label>
                                <Input 
                                    value={payment.paypal} 
                                    onChange={e => setPayment({...payment, paypal: e.target.value})}
                                    className="bg-paper border-ink/5 h-14 font-mono"
                                    placeholder="orders@luxury.com"
                                />
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-white/60 border-ink/5 rounded-[48px] p-10 md:col-span-2 shadow-sm">
                        <div className="flex items-center space-x-4 mb-8">
                            <div className="w-12 h-12 bg-ink/5 rounded-2xl flex items-center justify-center">
                                <Banknote className="w-6 h-6 text-ink" />
                            </div>
                            <h3 className="text-2xl font-serif italic">Direct Bank Orchestration</h3>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-widest text-ink/40 ml-4">SWIFT / IBAN / Institutional Details</Label>
                            <textarea 
                                value={settings.bankAccountInfo} 
                                onChange={e => setSettings({...settings, bankAccountInfo: e.target.value})}
                                className="w-full bg-paper border border-ink/5 rounded-[32px] p-8 min-h-[150px] text-sm font-mono focus:outline-none"
                                placeholder="Bank: Royal Bank of Heritage..."
                            />
                        </div>
                    </Card>
                </div>
            </motion.div>
        )}

        {activeTab === "Orders" && (
            <Card className="bg-white/60 border-ink/5 rounded-[48px] p-12 shadow-sm">
                 <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between mb-12">
                    <CardTitle className="text-2xl font-serif italic">Royal Manifest (Orders)</CardTitle>
                </CardHeader>
                <div className="overflow-x-auto">
                    {orders.length === 0 ? (
                        <div className="py-20 text-center text-ink/10 italic font-serif text-2xl">No orders have graced the records.</div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] uppercase tracking-widest text-ink/30 border-b border-ink/5">
                                    <th className="pb-6">Dossier</th>
                                    <th className="pb-6">Status</th>
                                    <th className="pb-6">Settlement</th>
                                    <th className="pb-6 text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {orders.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(order => (
                                    <tr key={order.id} className="border-b border-ink/5 last:border-0 hover:bg-ink/[0.01] transition-colors group">
                                        <td className="py-8">
                                          <div className="font-bold text-ink">{order.userEmail}</div>
                                          <div className="text-[10px] text-ink/30 uppercase tracking-tighter">REF: {order.id.slice(0,10)}</div>
                                        </td>
                                        <td className="py-8">
                                            <span className="px-3 py-1 rounded-full bg-ink text-white text-[10px] font-bold uppercase tracking-widest">
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="py-8 font-display font-bold text-royal-red text-lg">${order.total?.toFixed(2)}</td>
                                        <td className="py-8 text-ink/40 text-xs text-right italic">{new Date(order.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </Card>
        )}

        {activeTab === "Customers" && (
            <Card className="bg-white/60 border-ink/5 rounded-[48px] p-12 shadow-sm">
                 <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between mb-12">
                    <CardTitle className="text-2xl font-serif italic text-ink">Elite Directory</CardTitle>
                </CardHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {customers.length === 0 ? (
                        <div className="col-span-full py-20 text-center text-ink/10 italic">The directory remains exclusive.</div>
                    ) : (
                        customers.map(customer => (
                            <div key={customer.id} className="p-8 rounded-[40px] bg-white/50 border border-ink/5 hover:border-ink/20 flex flex-col space-y-6 transition-all duration-500 hover:shadow-xl">
                                <div className="w-16 h-16 rounded-[24px] bg-ink text-white flex items-center justify-center text-xl font-display font-bold">
                                    {customer.displayName?.charAt(0) || customer.email?.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-medium text-xl leading-tight text-ink">{customer.displayName || 'Unnamed Elite'}</h4>
                                    <p className="text-xs text-ink/40 mb-4">{customer.email}</p>
                                    <span className="px-3 py-1 rounded-full bg-royal-red/10 text-royal-red text-[10px] font-bold uppercase tracking-widest">{customer.role === 'admin' ? 'Administrator' : 'Elite Customer'}</span>
                                </div>
                                <div className="pt-4 border-t border-ink/5 flex justify-between items-center text-[10px] uppercase font-bold text-ink/20 tracking-widest">
                                    <span>Joined</span>
                                    <span>{new Date(customer.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>
        )}

        {activeTab === "Messages" && (
            <Card className="bg-white/60 border-ink/5 rounded-[48px] p-12 shadow-sm">
                 <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between mb-12">
                    <CardTitle className="text-2xl font-serif italic">Imperial Inquiries</CardTitle>
                </CardHeader>
                <div className="space-y-8">
                    {messages.length === 0 ? (
                        <div className="py-20 text-center text-ink/10 italic">No imperial inquiries have arrived.</div>
                    ) : (
                        messages.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(msg => (
                            <div key={msg.id} className="p-10 rounded-[48px] bg-white/50 border border-ink/5 hover:border-ink/20 transition-all shadow-sm">
                                <div className="flex justify-between items-start mb-8">
                                    <div className="flex items-center space-x-6">
                                        <div className="w-14 h-14 rounded-2xl bg-ink text-white flex items-center justify-center text-lg font-display font-bold">
                                            {msg.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-xl text-ink underline decoration-gold/30 underline-offset-4">{msg.name}</h4>
                                            <p className="text-xs text-ink/40 italic mt-1">{msg.email}</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] uppercase font-bold text-ink/20 tracking-[0.2em]">{new Date(msg.createdAt).toLocaleString()}</span>
                                </div>
                                <div className="text-lg text-ink/80 leading-relaxed bg-paper p-10 rounded-[32px] border border-ink/5 italic font-serif relative">
                                  <span className="absolute -top-4 -left-2 text-6xl text-gold/20 font-serif opacity-50">"</span>
                                    {msg.message}
                                  <span className="absolute -bottom-10 -right-2 text-6xl text-gold/20 font-serif opacity-50">"</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>
        )}
      </main>
    </div>
  );
}

