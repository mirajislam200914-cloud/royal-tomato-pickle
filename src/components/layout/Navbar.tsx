import { Link } from "react-router-dom";
import { ShoppingCart, User, Menu, X, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useSettings } from "../../context/SettingsContext";
import { Button } from "../ui/button";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { items } = useCart();
  const { user, isAdmin } = useAuth();
  const { settings } = useSettings();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? "bg-white/90 backdrop-blur-xl border-b border-ink/5 py-4 shadow-sm" : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-2xl font-display font-bold tracking-tighter text-ink italic">
            {settings.logoText}<span className="text-royal-red not-italic">.</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-10">
          {[
            { name: "Shop", path: "/shop" },
            { name: "Our Story", path: "/#story" },
            { name: "Process", path: "/#process" },
            { name: "Contact", path: "/#contact" }
          ].map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className="text-[10px] uppercase tracking-[0.3em] font-bold text-ink/30 hover:text-royal-red transition-all"
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center space-x-4">
          <button className="p-2 text-ink/30 hover:text-ink transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <Link to="/cart" className="p-2 text-ink/30 hover:text-ink relative transition-colors">
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-ink text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-lg">
                {cartCount}
              </span>
            )}
          </Link>
          <Link to={user ? (isAdmin ? "/admin" : "/profile") : "/auth"}>
            <Button variant="outline" size="sm" className="hidden md:flex rounded-full border-ink/5 text-ink/60 hover:bg-ink hover:text-white px-8 h-10 text-[10px] uppercase font-bold tracking-widest shadow-sm">
              {user ? (isAdmin ? "Dashboard" : "Account") : "Sign In"}
            </Button>
          </Link>
          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(true)}>
            <Menu className="w-6 h-6 text-ink" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            className="fixed inset-0 z-50 bg-paper flex flex-col p-10"
          >
            <div className="flex justify-end">
              <button onClick={() => setIsMenuOpen(false)}>
                <X className="w-8 h-8 text-ink" />
              </button>
            </div>
            <div className="flex flex-col space-y-12 mt-20 text-5xl font-serif italic tracking-tighter text-ink">
              <Link to="/shop" onClick={() => setIsMenuOpen(false)}>Shop</Link>
              <Link to="/#story" onClick={() => setIsMenuOpen(false)}>Our Story</Link>
              <Link to="/#process" onClick={() => setIsMenuOpen(false)}>Process</Link>
              <Link to="/#contact" onClick={() => setIsMenuOpen(false)}>Contact</Link>
              <Link to={user ? (isAdmin ? "/admin" : "/profile") : "/auth"} onClick={() => setIsMenuOpen(false)} className="text-royal-red">
                {user ? (isAdmin ? "Dashboard" : "Account") : "Sign In"}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
