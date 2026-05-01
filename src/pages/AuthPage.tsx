import { useState } from "react";
import { auth, db } from "../lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { Sparkles, ArrowRight } from "lucide-react";
import { useSettings } from "../context/SettingsContext";

export default function AuthPage() {
  const { settings } = useSettings();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Welcome back!");
      } else {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", res.user.uid), {
          userId: res.user.uid,
          email,
          displayName: email.split("@")[0],
          role: "customer",
          createdAt: new Date().toISOString(),
        });
        toast.success("Account created successfully!");
      }
      if (email === "mirajislam200914@gmail.com") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const res = await signInWithPopup(auth, provider);
      await setDoc(doc(db, "users", res.user.uid), {
        userId: res.user.uid,
        email: res.user.email,
        displayName: res.user.displayName,
        photoURL: res.user.photoURL,
        role: "customer",
        createdAt: new Date().toISOString(),
      }, { merge: true });
      toast.success("Signed in with Google");
      if (res.user.email === "mirajislam200914@gmail.com") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-6 py-20 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute -top-48 -left-48 w-[600px] h-[600px] bg-royal-red/5 blur-[160px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-48 -right-48 w-[600px] h-[600px] bg-ink/5 blur-[160px] rounded-full pointer-events-none" />

        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg bg-white/60 backdrop-blur-3xl border border-ink/5 shadow-[0_32px_128px_-32px_rgba(0,0,0,0.1)] p-16 rounded-[64px] relative z-10"
        >
            <div className="text-center mb-16">
                <div className="w-20 h-20 bg-ink rounded-full mx-auto mb-10 flex items-center justify-center shadow-2xl">
                    <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-5xl font-serif italic tracking-tighter mb-4 text-ink">
                    {isLogin ? "Welcome" : "Join the Elite"} <br />
                    <span className="font-bold not-italic text-ink/10 text-7xl leading-[0.8]">{settings.logoText}.</span>
                </h1>
                <p className="text-ink/40 text-[10px] font-bold uppercase tracking-[0.4em] leading-relaxed mt-6">{settings.tagline}</p>
            </div>

            <form onSubmit={handleAuth} className="space-y-8">
                <div className="space-y-3">
                    <Label className="text-[10px] uppercase tracking-[0.3em] font-bold text-ink/30 ml-6">Registry Email</Label>
                    <Input
                        type="email"
                        placeholder="patron@heritage.com"
                        className="rounded-full bg-white border-ink/5 h-16 px-8 focus:ring-1 focus:ring-ink/10 transition-all shadow-sm"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-3">
                    <Label className="text-[10px] uppercase tracking-[0.3em] font-bold text-ink/30 ml-6">Secure Key</Label>
                    <Input
                        type="password"
                        placeholder="••••••••"
                        className="rounded-full bg-white border-ink/5 h-16 px-8 focus:ring-1 focus:ring-ink/10 transition-all font-mono shadow-sm"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <Button type="submit" className="w-full rounded-full h-18 bg-ink text-white hover:bg-ink hover:scale-[1.02] active:scale-[0.98] transition-all text-[10px] uppercase font-bold tracking-[0.4em] shadow-2xl group" disabled={loading}>
                    {loading ? "Verifying Credentials..." : isLogin ? "Authorize Entry" : "Register Lineage"}
                    <ArrowRight className="ml-4 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
            </form>

            <div className="mt-12 flex items-center space-x-6">
                <div className="h-px bg-ink/5 flex-1" />
                <span className="text-[9px] uppercase font-bold text-ink/20 tracking-[1em]">Global Access</span>
                <div className="h-px bg-ink/5 flex-1" />
            </div>

            <div className="mt-12">
                <Button
                    variant="outline"
                    className="w-full rounded-full h-16 border-ink/5 bg-white/50 hover:bg-white text-ink/60 hover:text-ink transition-all shadow-sm"
                    onClick={signInWithGoogle}
                >
                    <img src="https://www.google.com/favicon.ico" className="w-5 h-5 mr-4" alt="Google" />
                    <span className="text-[11px] font-bold uppercase tracking-widest">Google Synchronization</span>
                </Button>
            </div>

            <div className="mt-12 text-center">
                <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-[11px] font-bold uppercase tracking-widest text-ink/30 hover:text-ink transition-colors underline underline-offset-8 decoration-ink/10"
                >
                    {isLogin ? "Request New Membership" : "Return to Secured Login"}
                </button>
            </div>
        </motion.div>
    </div>
  );
}
