import React, { useState, useEffect } from 'react';
import { arTranslations, enTranslations, TranslationSet } from './data/translations';
import { ActiveSection } from './types';
import CampaignGenerator from './components/CampaignGenerator';
import ReachCalculator from './components/ReachCalculator';
import Footer from './components/Footer';
import AdminDashboard from './components/AdminDashboard';

// Icons
import { 
  Sparkles, 
  Layers, 
  Tv, 
  Map, 
  ChevronRight, 
  Globe, 
  Menu, 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  ArrowRight,
  TrendingUp,
  Award,
  Users,
  Eye,
  CheckCircle,
  ExternalLink,
  ChevronLeft,
  Lock,
  Settings
} from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<ActiveSection>('home');
  const [portfolioFilter, setPortfolioFilter] = useState<'all' | 'outdoor' | 'digital' | 'branding' | 'video'>('all');
  const [selectedProject, setSelectedProject] = useState<any | null>(null);

  // Dynamic configuration state
  const [config, setConfig] = useState<any>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Contact Form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);

  // Fetch config on mount
  useEffect(() => {
    fetch("/api/config")
      .then(res => res.json())
      .then(data => {
        if (data) setConfig(data);
      })
      .catch(err => console.error("Error loading live config:", err));
  }, []);

  // Set the dynamic translations
  const defaultTranslations = lang === 'ar' ? arTranslations : enTranslations;
  const t: TranslationSet = (config?.translations?.[lang]) 
    ? { ...defaultTranslations, ...config.translations[lang] }
    : defaultTranslations;

  const isRtl = lang === 'ar';

  // Apply dynamic theme variables to document root
  useEffect(() => {
    if (config?.theme) {
      const primary = config.theme.primaryColor || '#ff5c35';
      const secondary = config.theme.secondaryColor || '#e2b053';
      document.documentElement.style.setProperty('--color-brand-orange', primary);
      document.documentElement.style.setProperty('--color-brand-orange-light', primary + 'dd');
      document.documentElement.style.setProperty('--color-brand-gold', secondary);
    }
  }, [config]);

  // Automatically update HTML document attributes for RTL support
  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang, isRtl]);

  const toggleLanguage = () => {
    setLang(prev => (prev === 'ar' ? 'en' : 'ar'));
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactLoading(true);
    
    // Simulate API save/contact action gracefully
    setTimeout(() => {
      setContactLoading(false);
      setContactSuccess(true);
      // reset form
      setContactName('');
      setContactEmail('');
      setContactPhone('');
      setContactMsg('');
    }, 1200);
  };

  // Portfolio items database
  const getPortfolioItems = () => {
    if (config?.portfolioItems && config.portfolioItems.length > 0) {
      return config.portfolioItems.map((item: any) => ({
        id: item.id,
        title: lang === 'ar' ? item.titleAr : item.titleEn,
        desc: lang === 'ar' ? item.descAr : item.descEn,
        category: item.category,
        tag: lang === 'ar' ? item.tagAr : item.tagEn,
        image: item.image,
        stat: lang === 'ar' ? item.statAr : item.statEn,
        client: lang === 'ar' ? item.clientAr : item.clientEn,
        year: item.year,
        details: lang === 'ar' ? item.detailsAr : item.detailsEn
      }));
    }

    return [
      {
        id: 'yasmine',
        title: t.portItem1Title,
        desc: t.portItem1Desc,
        category: 'outdoor',
        tag: t.portTagOutdoor,
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        stat: isRtl ? '+4.2 مليون مشاهدة طرقية' : '+4.2M road impressions',
        client: isRtl ? 'ريادة للعطور الشامية' : 'Riyada Levantine Perfumes',
        year: '2026',
        details: isRtl 
          ? 'تم تركيب لوحات بيلبورد ذكية ذات تصميم ثلاثي الأبعاد في أهم تقاطعات دمشق (أوتستراد المزة، ساحة الأمويين) مجهزة بتقنية دفع الروائح الدقيقة لبث رائحة ياسمين خفيفة تجذب المارة فوراً.'
          : 'Smart 3D billboards installed in prime Damascus intersections (Mezzeh, Umayyad Square) equipped with custom scent diffusers emitting jasmine aroma to captivate citizens.'
      },
      {
        id: 'hamwi',
        title: t.portItem2Title,
        desc: t.portItem2Desc,
        category: 'branding',
        tag: t.portTagBrand,
        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
        stat: isRtl ? '+180% نمو في المبيعات' : '+180% sales growth',
        client: isRtl ? 'مجموعة بن الحموي العريقة' : 'Hamwi Coffee Group',
        year: '2025',
        details: isRtl 
          ? 'قمنا بإعادة صياغة الهوية البصرية للعلامة بالكامل، وتحديث تغليف أكياس القهوة السورية والعلب المعدنية الفاخرة بطابع يجمع الحداثة بعبق التاريخ، مما جذب جيل الشباب لاقتناء المنتج.'
          : 'Rebuilt the entire brand design, packaging books, and premium tin cans, combining modern styles with historical warmth to successfully target young millennials.'
      },
      {
        id: 'captain',
        title: t.portItem3Title,
        desc: t.portItem3Desc,
        category: 'digital',
        tag: t.portTagDigital,
        image: 'https://images.unsplash.com/photo-1549576490-b0b4831da60a?auto=format&fit=crop&w=800&q=80',
        stat: isRtl ? 'نصف مليون تحميل شهري' : '500k monthly downloads',
        client: isRtl ? 'تطبيق كابتن للتوصيل' : 'Captain Cab Tech',
        year: '2025',
        details: isRtl 
          ? 'حملة رقمية متكاملة شملت إنتاج فيديوهات فكاهية قصيرة مستلهمة من واقع المواطن السوري اليومي بالشارع، مع إعلانات ممولة مستهدفة بدقة حققت صدى واسعاً وتضاعف نسبة التحميل.'
          : 'Integrated digital campaign producing humorous TikTok reels inspired by real daily Syrian commuting struggles, paired with hyper-targeted mobile advertisements.'
      },
      {
        id: 'canning',
        title: t.portItem4Title,
        desc: t.portItem4Desc,
        category: 'video',
        tag: t.portTagVideo,
        image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80',
        stat: isRtl ? '+8 مليون مشاهدة على الويب' : '+8M web views',
        client: isRtl ? 'الشركة السورية للكونسروة' : 'Syrian Canning Company',
        year: '2026',
        details: isRtl 
          ? 'فيلم إعلاني تلفزيوني دافئ يركز على قيمة التكاتف ولمة العائلة حول المائدة الرمضانية في الأحياء القديمة، وتم عرضه في القنوات الفضائية والويب مع موسيقى شامية أصيلة لاقت رواجاً كبيراً.'
          : 'A warm cinematic commercial emphasizing the beautiful essence of Syrian family gatherings during Ramadan. Broadcasted via pan-Arab satellite TV channels.'
      }
    ];
  };

  const portfolioItems = getPortfolioItems();

  const filteredPortfolio = portfolioFilter === 'all' 
    ? portfolioItems 
    : portfolioItems.filter(item => item.category === portfolioFilter);

  return (
    <div className="min-h-screen bg-brand-dark text-gray-100 flex flex-col selection:bg-brand-orange selection:text-white">
      
      {/* 1. Header/Navigation Bar */}
      <header className="sticky top-0 z-50 glassmorphism shadow-lg border-b border-white/5 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
          
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-orange to-brand-gold flex items-center justify-center font-black text-white text-base tracking-wider shadow-lg shadow-brand-orange/20 animate-pulse">
              A
            </div>
            <div className="flex flex-col">
              <span className="text-sm md:text-base font-black text-white tracking-widest uppercase leading-none">
                {t.navBrand}
              </span>
              <span className="text-[9px] text-brand-orange font-bold uppercase tracking-widest mt-1">
                {isRtl ? 'وكالة إبداعية متكاملة' : 'Creative Agency'}
              </span>
            </div>
          </div>

          {/* Desktop Navigation Link Menu */}
          <nav className="hidden lg:flex items-center gap-1">
            {[
              { id: 'home', label: t.navHome },
              { id: 'generator', label: t.navGenerator },
              { id: 'services', label: t.navServices },
              { id: 'process', label: t.navProcess },
              { id: 'calculator', label: t.navCalculator },
              { id: 'portfolio', label: t.navPortfolio },
              { id: 'contact', label: t.navContact },
            ].map((item) => (
              <button
                id={`nav-item-${item.id}`}
                key={item.id}
                onClick={() => {
                  const targetEl = document.getElementById(`${item.id}-section`) || document.getElementById(`ai-generator-section`);
                  if (targetEl) {
                    targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                  setActiveSection(item.id as any);
                }}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 cursor-pointer ${
                  activeSection === item.id 
                    ? 'text-brand-orange bg-brand-orange/5' 
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Controls - Language and Quick Contact */}
          <div className="flex items-center gap-3">
            {/* Language Toggle Button */}
            <button
              id="lang-toggle-btn"
              onClick={toggleLanguage}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-200 border border-white/5 hover:border-white/10 transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
            >
              <Globe size={13} className="text-brand-gold animate-spin" style={{ animationDuration: '8s' }} />
              <span>{isRtl ? 'English' : 'العربية'}</span>
            </button>

            {/* Admin Dashboard Portal Trigger Button */}
            <button
              id="admin-portal-open-btn"
              onClick={() => setIsAdminOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-200 border border-white/5 hover:border-white/10 hover:text-brand-orange transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
              title={isRtl ? "بوابة الإدارة والمشرف" : "Supervisor Administration Portal"}
            >
              <Lock size={12} className="text-brand-gold" />
              <span>{isRtl ? "لوحة التحكم" : "Admin Panel"}</span>
            </button>

            {/* Quick Consultation CTA */}
            <a
              id="header-cta-btn"
              href="#contact-section"
              className="hidden sm:inline-flex px-4 py-2 rounded-lg bg-gradient-to-r from-brand-orange to-brand-orange-light text-white text-xs font-bold shadow-lg shadow-brand-orange/10 hover:shadow-brand-orange/20 transition-all duration-300 hover:-translate-y-0.5 text-center"
            >
              {isRtl ? 'اطلب استشارة' : 'Free Consultation'}
            </a>

            {/* Mobile Menu Toggle */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="p-2 text-gray-400 hover:text-white lg:hidden cursor-pointer"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[68px] z-40 bg-brand-dark/95 backdrop-blur-lg lg:hidden border-t border-white/5 flex flex-col p-6 animate-fade-in justify-between">
          <div className="space-y-4">
            {[
              { id: 'home', label: t.navHome },
              { id: 'generator', label: t.navGenerator },
              { id: 'services', label: t.navServices },
              { id: 'process', label: t.navProcess },
              { id: 'calculator', label: t.navCalculator },
              { id: 'portfolio', label: t.navPortfolio },
              { id: 'contact', label: t.navContact },
            ].map((item) => (
              <button
                id={`mobile-nav-${item.id}`}
                key={item.id}
                onClick={() => {
                  const targetEl = document.getElementById(`${item.id}-section`) || document.getElementById(`ai-generator-section`);
                  if (targetEl) {
                    targetEl.scrollIntoView({ behavior: 'smooth' });
                  }
                  setActiveSection(item.id as any);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-right py-3.5 px-4 rounded-xl font-bold text-sm transition-all ${
                  activeSection === item.id 
                    ? 'bg-brand-orange/10 text-brand-orange' 
                    : 'text-gray-300 hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="pt-6 border-t border-white/5 space-y-4">
            <a
              id="mobile-menu-cta"
              href="#contact-section"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full block text-center py-3.5 bg-gradient-to-r from-brand-orange to-brand-orange-light text-white text-sm font-bold rounded-xl"
            >
              {isRtl ? 'اطلب استشارة مجانية الآن' : 'Free Consultation'}
            </a>
          </div>
        </div>
      )}

      {/* 2. Main Content Body */}
      <main className="flex-grow">
        
        {/* HERO SECTION */}
        <section id="home-section" className="relative py-20 lg:py-32 px-4 md:px-8 max-w-7xl mx-auto overflow-hidden">
          {/* Ambient graphics */}
          <div className="glow-spot-1 -top-20 right-10"></div>
          <div className="glow-spot-2 top-40 left-10"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            {/* Visual Text Panel */}
            <div className="lg:col-span-7 space-y-8 text-right">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glassmorphism-light text-brand-orange text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-ping"></span>
                <span>{isRtl ? 'التصنيف الإعلاني الأول في سوريا' : '#1 Rated Creative Agency in Syria'}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-none tracking-tight">
                {isRtl ? (
                  <>
                    نصنع <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-brand-gold text-glow-orange">الدهشة</span>،<br />
                    نقود التأثير الإعلاني
                  </>
                ) : (
                  <>
                    We Craft <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-brand-gold text-glow-orange">Awe</span>,<br />
                    We Drive Impact
                  </>
                )}
              </h1>

              <p className="text-gray-400 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl">
                {t.heroSub}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <a
                  id="hero-ai-gen-btn"
                  href="#ai-generator-section"
                  className="px-8 py-4 bg-gradient-to-r from-brand-orange to-brand-orange-light text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-orange/20 hover:shadow-brand-orange/40 hover:-translate-y-0.5 transition-all duration-300 text-center flex items-center justify-center gap-2 group"
                >
                  <Sparkles size={16} />
                  <span>{t.heroBtnGen}</span>
                </a>
                <a
                  id="hero-portfolio-btn"
                  href="#portfolio-section"
                  className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold text-sm rounded-xl border border-white/5 hover:border-white/10 transition-all duration-300 text-center flex items-center justify-center gap-1"
                >
                  <span>{t.heroBtnPort}</span>
                  {isRtl ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                </a>
              </div>
            </div>

            {/* Visual Interactive Screen Mockup (Shows real billboards in Damascus context to make a strong impression) */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-[360px] rounded-3xl p-3 bg-brand-slate border border-white/10 shadow-2xl relative group overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-orange via-brand-gold to-brand-orange"></div>
                
                {/* Simulated Damascus Street Billboard Preview */}
                <div className="relative h-[440px] rounded-2xl overflow-hidden bg-[#0a0f1d] flex flex-col justify-between p-4">
                  
                  {/* Mock UI header */}
                  <div className="flex justify-between items-center z-10">
                    <span className="text-[10px] text-gray-500 font-mono tracking-wider">ALTA_OUTDOOR_LIVE</span>
                    <span className="bg-brand-orange/20 text-brand-orange text-[9px] px-2 py-0.5 rounded-full font-bold">MEZZEH_HUB</span>
                  </div>

                  {/* Creative artwork layout */}
                  <div className="my-auto text-center space-y-4">
                    <div className="relative w-16 h-16 mx-auto">
                      <div className="absolute inset-0 bg-brand-orange/20 rounded-full animate-ping"></div>
                      <div className="relative w-16 h-16 rounded-full bg-brand-dark flex items-center justify-center border border-brand-orange/40">
                        <span className="text-xl font-black text-brand-orange">A</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-[10px] text-brand-gold font-bold tracking-widest uppercase">ALTA ADVERTISING</p>
                      <h3 className="text-lg font-black text-white px-2">
                        {isRtl ? 'الأفكار تولد لتغير وجه الشارع والمنتج' : 'Ideas that change the visual landscape'}
                      </h3>
                    </div>

                    <p className="text-[11px] text-gray-400 max-w-[200px] mx-auto leading-relaxed">
                      {isRtl ? 'لوحاتنا تغطي المزة والأمويين والشعلان لتضمن أعلى وصول' : 'Our coverage matches high density locations'}
                    </p>
                  </div>

                  {/* Simulated interaction stats */}
                  <div className="pt-3 border-t border-white/5 flex justify-between text-[10px] text-gray-500 font-mono">
                    <span className="flex items-center gap-1"><Eye size={10} /> 1.2M+</span>
                    <span className="flex items-center gap-1"><TrendingUp size={10} /> +24% ROI</span>
                  </div>

                </div>
              </div>

              {/* Float badges for professional details */}
              <div className="absolute -bottom-6 -right-6 bg-brand-slate border border-white/10 p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce" style={{ animationDuration: '6s' }}>
                <div className="w-10 h-10 rounded-lg bg-brand-orange/10 text-brand-orange flex items-center justify-center">
                  <Award size={20} />
                </div>
                <div>
                  <div className="text-xs text-gray-400 leading-none">{isRtl ? 'الريادة الإعلانية' : 'Industry Leader'}</div>
                  <div className="text-sm font-bold text-white mt-1 leading-none">{isRtl ? 'الحملات الأكبر صدى' : 'Most Relatable Ads'}</div>
                </div>
              </div>

            </div>
          </div>

          {/* Quick Metrics Counter Dashboard Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 pt-12 border-t border-white/5 relative z-10">
            {[
              { val: t.statSatisfactionVal, label: t.statSatisfaction, col: 'text-brand-orange' },
              { val: t.statCampaignsVal, label: t.statCampaigns, col: 'text-white' },
              { val: t.statExperienceVal, label: t.statExperience, col: 'text-brand-gold' },
              { val: t.statBillboardsVal, label: t.statBillboards, col: 'text-white' },
            ].map((stat, idx) => (
              <div key={idx} className="bg-brand-slate/30 p-5 rounded-2xl border border-white/5 text-right flex flex-col justify-between">
                <div className={`text-3xl md:text-4xl font-black font-mono ${stat.col} mb-2`}>
                  {stat.val}
                </div>
                <div className="text-xs text-gray-400 leading-relaxed font-semibold">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* AI GENERATOR LAB */}
        <section className="bg-brand-slate/20 border-y border-white/5">
          <CampaignGenerator t={t} isRtl={isRtl} />
        </section>

        {/* SERVICES SECTION */}
        <section id="services-section" className="relative py-24 px-4 md:px-8 max-w-7xl mx-auto z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-orange bg-brand-orange/10 px-3 py-1.5 rounded-full">
              {isRtl ? 'حلول إبداعية متكاملة' : '360° Creative Solutions'}
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-white mt-4 mb-6 leading-tight">
              {t.servTitle}
            </h2>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              {t.servSub}
            </p>
          </div>

          {/* Services Cards Bento-like Grid with interactive details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {(() => {
              const activeServices = config?.services && config.services.length > 0
                ? config.services
                : [
                    {
                      id: 'serv1',
                      titleAr: t.serv1Title,
                      titleEn: 'Premium Billboards & Outdoor Media',
                      descAr: t.serv1Desc,
                      descEn: 'Strategic placement of digital and steel billboards across prime Syrian highways and squares.',
                      icon: 'Map',
                      subtitleAr: 'شوارع حيوية: المزة، الأمويين، الشعلان',
                      subtitleEn: 'Key Spots: Mezzeh, Umayyad, Shaalan'
                    },
                    {
                      id: 'serv2',
                      titleAr: t.serv2Title,
                      titleEn: 'Dynamic AI Campaigns & Digital Marketing',
                      descAr: t.serv2Desc,
                      descEn: 'Maximize performance with hyper-targeted digital advertisement strategies and automated campaigns.',
                      icon: 'Sparkles',
                      subtitleAr: 'بالهوية والروح السورية المحببة',
                      subtitleEn: 'Culturally Relatable Syrian Content'
                    },
                    {
                      id: 'serv3',
                      titleAr: t.serv3Title,
                      titleEn: 'Branding & Corporate Identity',
                      descAr: t.serv3Desc,
                      descEn: 'Design timeless brand elements, packaging systems, and corporate guidelines.',
                      icon: 'Layers',
                      subtitleAr: 'كتيب الهوية وتصاميم التغليف',
                      subtitleEn: 'Full Brand Books & Premium Packaging'
                    },
                    {
                      id: 'serv4',
                      titleAr: t.serv4Title,
                      titleEn: 'Cinematic Production & TV Ads',
                      descAr: t.serv4Desc,
                      descEn: 'Cinematic video storytelling tailored for local culture with premium audio production.',
                      icon: 'Tv',
                      subtitleAr: 'تصوير سينمائي ومونتاج احترافي',
                      subtitleEn: 'Cinematic Production with sound design'
                    }
                  ];

              return activeServices.map((service: any) => {
                const title = lang === 'ar' ? service.titleAr : service.titleEn;
                const desc = lang === 'ar' ? service.descAr : service.descEn;
                const subtitle = lang === 'ar' ? service.subtitleAr : service.subtitleEn;

                let IconComponent = Sparkles;
                if (service.icon === 'Map') IconComponent = Map;
                else if (service.icon === 'Layers') IconComponent = Layers;
                else if (service.icon === 'Tv') IconComponent = Tv;

                return (
                  <div key={service.id} className="bg-brand-slate/40 border border-white/5 rounded-2xl p-8 hover:border-brand-orange/40 transition-all duration-300 hover:shadow-xl hover:shadow-brand-orange/5 group relative overflow-hidden flex flex-col justify-between min-h-[280px]">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-brand-orange/10 rounded-bl-full pointer-events-none transition-all group-hover:scale-125"></div>
                    
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center mb-6">
                        <IconComponent size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                        <span>{title}</span>
                      </h3>
                      <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                        {desc}
                      </p>
                    </div>

                    <div className="pt-6 border-t border-white/5 mt-6 flex justify-between items-center">
                      <span className="text-[11px] text-brand-gold font-bold">{subtitle}</span>
                      <span className="text-xs text-gray-500 group-hover:text-brand-orange transition flex items-center gap-1">
                        {isRtl ? 'حملة ترويجية' : 'Launch Campaign'} <ArrowRight size={12} className="transform rotate-180" />
                      </span>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </section>

        {/* METHODOLOGY / PROCESS SECTION */}
        <section id="process-section" className="bg-brand-slate/20 py-24 border-y border-white/5 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 md:px-8 z-10 relative">
            
            <div className="text-center max-w-3xl mx-auto mb-20">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-gold bg-brand-gold/10 px-3 py-1.5 rounded-full">
                {isRtl ? 'كيف نعمل في التا؟' : 'How We Deliver Impact'}
              </span>
              <h2 className="text-3xl md:text-5xl font-black text-white mt-4 mb-6 leading-tight">
                {t.procTitle}
              </h2>
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                {t.procSub}
              </p>
            </div>

            {/* Interactive horizontal/vertical timeline process nodes */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
              {/* Connector line for desktop */}
              <div className="hidden md:block absolute top-[44px] left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-brand-orange via-brand-gold to-brand-orange opacity-25 z-0"></div>

              {[
                { title: t.proc1Title, desc: t.proc1Desc, num: '01', col: 'from-brand-orange to-brand-orange-light' },
                { title: t.proc2Title, desc: t.proc2Desc, num: '02', col: 'from-brand-gold to-yellow-600' },
                { title: t.proc3Title, desc: t.proc3Desc, num: '03', col: 'from-teal-500 to-emerald-400' },
                { title: t.proc4Title, desc: t.proc4Desc, num: '04', col: 'from-purple-500 to-pink-500' },
              ].map((step, idx) => (
                <div key={idx} className="bg-brand-slate/60 border border-white/5 rounded-2xl p-6 relative z-10 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group">
                  <div>
                    {/* Top indicator with numbers */}
                    <div className="flex justify-between items-center mb-6">
                      <span className={`w-9 h-9 rounded-full bg-gradient-to-tr ${step.col} text-white flex items-center justify-center font-bold text-xs font-mono shadow-md`}>
                        {step.num}
                      </span>
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">STAGE {step.num}</span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-3 group-hover:text-brand-orange transition">
                      {step.title}
                    </h3>
                    <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                      {step.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/5 text-[10px] text-gray-500 font-mono flex items-center justify-between">
                    <span>STATUS: READY</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* REACH ESTIMATOR SECTION */}
        <section className="relative overflow-hidden">
          <ReachCalculator t={t} isRtl={isRtl} />
        </section>

        {/* PORTFOLIO GALLERY */}
        <section id="portfolio-section" className="bg-brand-slate/10 py-24 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            
            {/* Header and filters */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
              <div className="max-w-xl text-right">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-orange bg-brand-orange/10 px-3 py-1.5 rounded-full">
                  {isRtl ? 'قصص دهشة ونجاح واقعية' : 'Curated Masterpieces'}
                </span>
                <h2 className="text-3xl md:text-5xl font-black text-white mt-4 mb-4 leading-tight">
                  {t.portTitle}
                </h2>
                <p className="text-gray-400 text-xs sm:text-sm">
                  {t.portSub}
                </p>
              </div>

              {/* Filtering Controls */}
              <div className="flex flex-wrap gap-2 bg-brand-dark/80 p-1.5 rounded-xl border border-white/10 w-full md:w-auto overflow-x-auto">
                {[
                  { id: 'all', label: isRtl ? 'الكل' : 'All' },
                  { id: 'outdoor', label: t.portTagOutdoor },
                  { id: 'branding', label: t.portTagBrand },
                  { id: 'digital', label: t.portTagDigital },
                  { id: 'video', label: t.portTagVideo }
                ].map((filter) => (
                  <button
                    id={`portfolio-filter-${filter.id}`}
                    key={filter.id}
                    onClick={() => setPortfolioFilter(filter.id as any)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                      portfolioFilter === filter.id 
                        ? 'bg-brand-orange text-white' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid display with images and stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredPortfolio.map((item) => (
                <div
                  id={`portfolio-card-${item.id}`}
                  key={item.id}
                  onClick={() => setSelectedProject(item)}
                  className="bg-brand-slate/60 border border-white/5 rounded-2xl overflow-hidden hover:border-brand-orange/40 transition-all duration-500 cursor-pointer group flex flex-col justify-between"
                >
                  <div className="relative aspect-video overflow-hidden bg-brand-dark">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/20 to-transparent"></div>
                    
                    {/* Badge */}
                    <span className="absolute top-4 right-4 bg-brand-dark/80 backdrop-blur-md text-brand-orange text-[10px] font-extrabold px-3 py-1.5 rounded-lg border border-white/10 uppercase tracking-wider">
                      {item.tag}
                    </span>
                    
                    {/* Floating stat inside image bottom */}
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                      <span className="text-[10px] text-gray-400 font-semibold">{item.client}</span>
                      <span className="bg-brand-gold text-brand-dark font-black text-xs px-3 py-1 rounded-md shadow-lg">
                        {item.stat}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 md:p-8 space-y-3">
                    <h3 className="text-xl font-bold text-white group-hover:text-brand-orange transition">
                      {item.title}
                    </h3>
                    <p className="text-gray-400 text-xs sm:text-sm leading-relaxed line-clamp-2">
                      {item.desc}
                    </p>
                    
                    <div className="pt-4 border-t border-white/5 flex justify-between items-center text-xs text-brand-orange font-bold">
                      <span>{isRtl ? 'عرض تفاصيل الحملة الإبداعية' : 'Explore creative details'}</span>
                      <ExternalLink size={14} className="transform group-hover:translate-x-1 transition duration-300" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* DETAILED PORTFOLIO MODAL (To create maximum impression of details and craft) */}
        {selectedProject && (
          <div className="fixed inset-0 z-50 bg-brand-dark/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-brand-slate border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative animate-fade-in">
              <button
                id="close-portfolio-modal-btn"
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-brand-dark/80 text-gray-400 hover:text-white border border-white/10 cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="relative h-64 overflow-hidden bg-brand-dark">
                <img
                  src={selectedProject.image}
                  alt={selectedProject.title}
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-slate via-transparent to-transparent"></div>
                <div className="absolute bottom-4 right-6 text-right">
                  <span className="text-[10px] text-brand-orange font-bold uppercase tracking-widest">{selectedProject.tag}</span>
                  <h3 className="text-2xl font-black text-white mt-1">{selectedProject.title}</h3>
                </div>
              </div>

              <div className="p-6 md:p-8 space-y-6 text-right">
                <div className="grid grid-cols-3 gap-4 pb-6 border-b border-white/5 text-center">
                  <div>
                    <span className="text-[10px] text-gray-500 block uppercase font-bold">{isRtl ? 'العميل' : 'Client'}</span>
                    <span className="text-xs font-bold text-white mt-1 block">{selectedProject.client}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 block uppercase font-bold">{isRtl ? 'العام' : 'Year'}</span>
                    <span className="text-xs font-bold text-brand-orange mt-1 block">{selectedProject.year}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 block uppercase font-bold">{isRtl ? 'الأثر المحقق' : 'Impact ROI'}</span>
                    <span className="text-xs font-bold text-brand-gold mt-1 block font-mono">{selectedProject.stat}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">{isRtl ? 'نبذة عن المشروع' : 'About the Project'}</h4>
                  <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">{selectedProject.desc}</p>
                </div>

                <div className="space-y-3 bg-brand-dark/40 p-4 rounded-xl border border-white/5">
                  <h4 className="text-sm font-bold text-brand-gold uppercase tracking-wider">{isRtl ? 'الرؤية الإبداعية والتنفيذ' : 'Creative Implementation'}</h4>
                  <p className="text-gray-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line">{selectedProject.details}</p>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    id="modal-close-bottom-btn"
                    onClick={() => setSelectedProject(null)}
                    className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-bold transition"
                  >
                    {isRtl ? 'إغلاق النافذة' : 'Close Detail'}
                  </button>
                  <a
                    id="modal-cta-btn"
                    href="#contact-section"
                    onClick={() => setSelectedProject(null)}
                    className="px-5 py-2.5 bg-brand-orange hover:bg-brand-orange-light text-white rounded-lg text-xs font-bold transition"
                  >
                    {isRtl ? 'طلب حملة مماثلة لمشروعي' : 'Request Similar Campaign'}
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CONTACT US FORM SECTION */}
        <section id="contact-section" className="relative py-24 px-4 md:px-8 max-w-7xl mx-auto z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
            
            {/* Context/Coordinates info Card */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-8 bg-brand-slate/40 border border-white/5 rounded-2xl p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/5 rounded-bl-full pointer-events-none"></div>

              <div className="space-y-6">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-gold bg-brand-gold/10 px-3 py-1.5 rounded-full">
                  {isRtl ? 'تواصل مباشر مع عقول التا' : 'Direct Agency Contact'}
                </span>
                
                <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
                  {isRtl ? 'جاهز لتقود الشارع بمشروعك؟' : 'Ready to dominate the local market?'}
                </h2>
                
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                  {t.contSub}
                </p>
              </div>

              {/* Direct coordinates list with elegant minimal design */}
              <div className="space-y-4 pt-6 border-t border-white/5 text-xs sm:text-sm">
                <div className="flex items-start gap-3 text-gray-300">
                  <MapPin size={18} className="text-brand-orange flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block mb-1">{isRtl ? 'المقر الرئيسي' : 'Headquarters'}</span>
                    <span className="text-xs text-gray-400 leading-relaxed">{t.contHq}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-gray-300">
                  <Phone size={18} className="text-brand-orange flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block mb-1">{isRtl ? 'الاتصال المباشر والواتساب' : 'Direct Call & WhatsApp'}</span>
                    <span className="text-xs font-mono text-gray-400">+963 (11) 611-2345 / +963 933-444-555</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-gray-300">
                  <Mail size={18} className="text-brand-orange flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block mb-1">{isRtl ? 'البريد الإلكتروني الرسمي' : 'Official Inquiry Mail'}</span>
                    <span className="text-xs font-mono text-gray-400">info@alta-ddu.com / sales@alta-ddu.com</span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-gray-500 font-mono pt-4 border-t border-white/5 flex justify-between">
                <span>LAT: 33.5138° N, LON: 36.2765° E</span>
                <span>DAMASCUS, SYRIA</span>
              </div>
            </div>

            {/* Interactive consultation brief input form */}
            <div className="lg:col-span-7 bg-brand-slate/60 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/10 shadow-2xl relative">
              
              {contactSuccess ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-teal-500/10 text-teal-400 flex items-center justify-center animate-bounce">
                    <CheckCircle size={36} />
                  </div>
                  <h3 className="text-2xl font-black text-white">
                    {isRtl ? 'تم إرسال موجز حملتك بنجاح!' : 'Brief Received Successfully!'}
                  </h3>
                  <p className="text-gray-400 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                    {t.contSuccess}
                  </p>
                  
                  <button
                    id="contact-reset-btn"
                    onClick={() => setContactSuccess(false)}
                    className="mt-6 px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-lg border border-white/10 transition"
                  >
                    {isRtl ? 'إرسال استشارة جديدة' : 'Submit Another Request'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                        {t.contName} <span className="text-brand-orange">*</span>
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder={isRtl ? 'مثال: شركة الرضا التجارية' : 'e.g., Al Reda Trading'}
                        className="w-full bg-brand-dark/80 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition duration-300 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                        {t.contEmail} <span className="text-brand-orange">*</span>
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="e.g., mail@company.com"
                        className="w-full bg-brand-dark/80 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition duration-300 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                      {t.contPhone} <span className="text-brand-orange">*</span>
                    </label>
                    <input
                      id="contact-phone"
                      type="text"
                      required
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="e.g., +963 933 444 555"
                      className="w-full bg-brand-dark/80 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition duration-300 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                      {t.contMsg}
                    </label>
                    <textarea
                      id="contact-msg"
                      rows={4}
                      value={contactMsg}
                      onChange={(e) => setContactMsg(e.target.value)}
                      placeholder={isRtl ? 'مثال: نود حجز لوحة طرقية في شارع المزة لمدة ٣ أشهر تزامناً مع إطلاق المنتج الجديد لشركتنا في دمشق وحلب.' : 'e.g., We plan to book high-exposure billboards in Damascus...'}
                      className="w-full bg-brand-dark/80 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition duration-300 text-xs leading-relaxed"
                    ></textarea>
                  </div>

                  <button
                    id="contact-submit-btn"
                    type="submit"
                    disabled={contactLoading || !contactName || !contactEmail || !contactPhone}
                    className={`w-full py-4 px-6 rounded-xl text-white font-bold text-xs uppercase tracking-wider transition duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                      contactLoading || !contactName || !contactEmail || !contactPhone
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-brand-orange to-brand-orange-light hover:shadow-lg hover:shadow-brand-orange/30 transform hover:-translate-y-0.5'
                    }`}
                  >
                    {contactLoading ? (
                      <>
                        <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></span>
                        <span>{isRtl ? 'جاري إرسال المتطلبات...' : 'Sending brief parameters...'}</span>
                      </>
                    ) : (
                      <>
                        <Mail size={16} />
                        <span>{t.contBtn}</span>
                      </>
                    )}
                  </button>
                </form>
              )}

            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <Footer t={t} isRtl={isRtl} onNavigate={setActiveSection} />

      {/* ADMIN CONTROL PANEL OVERLAY */}
      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        currentConfig={config}
        onConfigUpdated={(newConfig) => setConfig(newConfig)}
        isRtl={isRtl}
      />

    </div>
  );
}
