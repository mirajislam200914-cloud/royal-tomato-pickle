import { Link } from "react-router-dom";
import { Instagram, Twitter, Facebook, ArrowUpRight } from "lucide-react";
import { useSettings } from "../../context/SettingsContext";

export default function Footer() {
  const { settings } = useSettings();

  return (
    <footer className="bg-black border-t border-white/5 pt-32 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-24">
          <div className="lg:col-span-2">
             <Link to="/" className="text-3xl font-display font-bold tracking-tighter mb-8 block">
               {settings.logoText}<span className="text-royal-red">.</span>
             </Link>
             <p className="text-white/40 max-w-sm text-lg leading-relaxed mb-8">
               {settings.tagline}
             </p>
             <div className="flex space-x-6">
               {[Instagram, Twitter, Facebook].map((Icon, i) => (
                 <a key={i} href="#" className="p-3 rounded-full border border-white/10 text-white/60 hover:text-white hover:border-white transition-all">
                    <Icon className="w-5 h-5" />
                 </a>
               ))}
             </div>
          </div>
          
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest mb-8 text-white/20">Discovery</h4>
            <ul className="space-y-4">
              {[
                { name: "Shop Collection", path: "/shop" },
                { name: "Our Process", path: "/#process" },
                { name: "Heritage Story", path: "/#story" },
                { name: "Contact Us", path: "/#contact" }
              ].map(item => (
                <li key={item.name}>
                    <Link to={item.path} className="text-white/60 hover:text-white transition-colors flex items-center group">
                        {item.name}
                        <ArrowUpRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-all -translate-y-0.5" />
                    </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
             <h4 className="text-sm font-bold uppercase tracking-widest mb-8 text-white/20">Newsletter</h4>
             <p className="text-sm text-white/40 mb-6">Join our exclusive mailing list for early access to limited seasonal blends.</p>
             <div className="relative">
                <input
                    type="email"
                    placeholder="your@email.com"
                    className="w-full bg-white/5 border border-white/10 rounded-full py-4 px-6 text-sm focus:outline-none focus:border-royal-red/50"
                />
                <button className="absolute right-2 top-2 bottom-2 bg-white text-black px-6 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white/90 transition-colors">
                    Join
                </button>
             </div>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-[10px] uppercase font-bold tracking-widest text-white/20 space-y-4 md:space-y-0">
            <div>© {new Date().getFullYear()} {settings.siteName}. All Rights Reserved.</div>
            <div className="flex space-x-8">
                <Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link>
                <Link to="#" className="hover:text-white transition-colors">Terms of Service</Link>
                <Link to="#" className="hover:text-white transition-colors">Accessibility</Link>
            </div>
            <div className="flex items-center space-x-2">
                <span>Designed for Perfection</span>
                <div className="w-1 h-1 bg-royal-red rounded-full" />
            </div>
        </div>
      </div>
    </footer>
  );
}
