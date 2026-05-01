import { motion } from "motion/react";
import { Play, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useSettings } from "../context/SettingsContext";

export default function Hero() {
  const { settings } = useSettings();

  return (
    <section className="relative h-screen w-full flex items-center overflow-hidden bg-paper">
      {/* Background Cinematic Video/Image placeholder */}
      <div className="absolute inset-0 z-0">
        <img
          src={settings.heroImage || "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=2070&auto=format&fit=crop"}
          className="w-full h-full object-cover opacity-20 scale-105"
          alt="Premium Spices"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-paper via-paper/40 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8, ease: "easeOut" }}
           className="max-w-2xl"
        >
          <span className="inline-block px-4 py-1.5 rounded-full border border-royal-red/30 bg-royal-red/5 text-royal-red text-[10px] font-bold tracking-[0.3em] uppercase mb-8">
            EST. 2024 • {settings.siteName}
          </span>
          <h1 className="text-7xl md:text-9xl font-display font-medium tracking-tighter leading-none mb-10 text-ink">
            {settings.heroTitle ? (
              <span className="text-royal-red">{settings.heroTitle}</span>
            ) : (
              <>
                <span className="text-gold-gradient">The Crown</span> <br />
                <span className="text-ink/20 italic font-serif">of Taste.</span>
              </>
            )}
          </h1>
          <p className="text-lg md:text-xl text-ink/40 mb-12 max-w-lg leading-relaxed font-light">
            {settings.heroSubtitle || settings.tagline}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link to="/shop">
              <Button size="lg" className="w-full sm:w-auto rounded-full bg-ink text-white hover:bg-ink/90 px-10 py-8 text-xs uppercase tracking-[0.3em] font-bold group shadow-2xl">
                Explore Curation
                <ArrowRight className="ml-3 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <button 
              onClick={() => toast.info("The Royal Heritage Cinematic is currently in private screening.")}
              className="flex items-center space-x-4 text-ink/60 hover:text-ink transition-colors group"
            >
              <div className="w-14 h-14 rounded-full border border-ink/5 flex items-center justify-center group-hover:border-ink/20 transition-colors bg-white/50 backdrop-blur-sm">
                <Play className="w-4 h-4 fill-ink text-ink" />
              </div>
              <span className="font-bold tracking-[0.2em] text-[10px] uppercase">Watch Story</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Floating Elements for Premium Feel */}
      <div className="absolute right-10 bottom-20 hidden lg:block opacity-40">
        <div className="flex flex-col space-y-4 items-end">
            <div className="text-[10px] uppercase tracking-[0.4em] font-bold rotate-90 origin-right translate-y-8 text-white/40 mb-12">
                Scroll to explore
            </div>
            <div className="w-px h-24 bg-gradient-to-b from-white/40 to-transparent" />
        </div>
      </div>
    </section>
  );
}
