import React from 'react';
import { TranslationSet } from '../data/translations';
import { Mail, Phone, MapPin, Clock, Globe, ArrowUp } from 'lucide-react';

interface FooterProps {
  t: TranslationSet;
  isRtl: boolean;
  onNavigate: (section: any) => void;
}

export default function Footer({ t, isRtl, onNavigate }: FooterProps) {
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#060910] border-t border-white/5 relative overflow-hidden">
      {/* Absolute glow spots inside footer */}
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-orange/5 rounded-full filter blur-[120px] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 relative z-10">
        
        {/* Upper footer grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/5">
          
          {/* Brand block */}
          <div className="md:col-span-5 space-y-5">
            <div className="flex items-center gap-3">
              {/* Logo icon */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-orange to-brand-gold flex items-center justify-center font-black text-white text-lg tracking-wider shadow-lg shadow-brand-orange/10">
                A
              </div>
              <span className="text-xl font-black text-white tracking-wider uppercase">
                {t.navBrand}
              </span>
            </div>
            
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              {isRtl 
                ? 'التا للإعلان هي وكالة إعلانية رائدة متكاملة الخدمات. نصنع الأفكار الملهمة، ندير أكبر شبكة لوحات طرقية في دمشق والمحافظات السورية، ونبتكر قصص النجاح التي تخلد.' 
                : 'Alta Advertising is a leading full-service agency. We design inspiring concepts, manage the premier billboard network in Damascus and major Syrian cities, and construct immortal brand stories.'}
            </p>

            {/* Quick social indicators */}
            <div className="flex gap-3 pt-2">
              {['Facebook', 'Instagram', 'TikTok', 'WhatsApp', 'LinkedIn'].map((platform, idx) => (
                <a
                  id={`footer-social-${platform.toLowerCase()}`}
                  key={idx}
                  href="#contact-section"
                  className="w-9 h-9 rounded-lg bg-white/5 hover:bg-brand-orange text-gray-400 hover:text-white transition-all duration-300 flex items-center justify-center text-xs"
                >
                  {platform[0]}
                </a>
              ))}
            </div>
          </div>

          {/* Quick links block */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              {isRtl ? 'روابط التنقل السريع' : 'Quick Navigation'}
            </h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: t.navHome, id: 'home' },
                { label: t.navGenerator, id: 'generator' },
                { label: t.navServices, id: 'services' },
                { label: t.navProcess, id: 'process' },
                { label: t.navCalculator, id: 'calculator' },
                { label: t.navPortfolio, id: 'portfolio' },
                { label: t.navContact, id: 'contact' },
              ].map((link) => (
                <li key={link.id}>
                  <button
                    id={`footer-nav-${link.id}`}
                    onClick={() => {
                      const el = document.getElementById(`${link.id}-section`) || document.getElementById(`ai-generator-section`);
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        onNavigate(link.id as any);
                      }
                    }}
                    className="text-gray-400 hover:text-brand-orange transition-all duration-300 flex items-center gap-1.5 cursor-pointer text-xs"
                  >
                    <span className="text-brand-orange/40">•</span>
                    <span>{link.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacts info block */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              {isRtl ? 'معلومات الاتصال والوصول' : 'Corporate Headquarters'}
            </h4>
            
            <ul className="space-y-3.5 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-brand-orange flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed text-xs">{t.contHq}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-brand-orange flex-shrink-0" />
                <span className="font-mono text-xs">+963 (11) 611-2345 / WhatsApp: +963 933-444-555</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-brand-orange flex-shrink-0" />
                <span className="font-mono text-xs">info@alta-ddu.com / sales@alta-ddu.com</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock size={16} className="text-brand-gold flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white text-xs">{t.contHours}</div>
                  <div className="text-[11px] mt-0.5">{t.contHoursVal}</div>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Lower footer */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <Globe size={13} className="text-gray-600" />
            <span>
              &copy; {new Date().getFullYear()} {t.navBrand}. {isRtl ? 'جميع الحقوق محفوظة لشركة التا للإعلان.' : 'All rights reserved.'}
            </span>
          </div>

          {/* Back to top button */}
          <button
            id="back-to-top-btn"
            onClick={handleScrollToTop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-brand-orange hover:text-white text-gray-400 transition-all duration-300 cursor-pointer text-[11px] font-bold border border-white/5"
          >
            <span>{isRtl ? 'العودة للأعلى' : 'Back to Top'}</span>
            <ArrowUp size={12} />
          </button>
        </div>

      </div>
    </footer>
  );
}
