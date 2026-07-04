import React, { useState, useEffect } from 'react';
import { TranslationSet } from '../data/translations';
import { HelpCircle, BarChart3, Users, Eye, Target, MapPin } from 'lucide-react';

interface ReachCalculatorProps {
  t: TranslationSet;
  isRtl: boolean;
}

export default function ReachCalculator({ t, isRtl }: ReachCalculatorProps) {
  const [budget, setBudget] = useState(5000000); // 5 Million SYP as default
  const [currency, setCurrency] = useState<'SYP' | 'USD'>('SYP');
  const [channel, setChannel] = useState<'outdoor' | 'digital' | 'video' | 'branding'>('outdoor');
  const [targetCity, setTargetCity] = useState<string>('all');
  
  const [metrics, setMetrics] = useState({
    impressions: 0,
    reach: 0,
    clicks: 0,
    conversion: 0
  });

  const cities = isRtl 
    ? [
        { id: 'all', name: 'كل المحافظات والأسواق', multiplier: 1.0 },
        { id: 'damascus', name: 'دمشق وريفها (الكثافة الأعلى)', multiplier: 1.2 },
        { id: 'aleppo', name: 'حلب (العاصمة الاقتصادية)', multiplier: 1.1 },
        { id: 'coast', name: 'الساحل السوري (اللاذقية وطرطوس)', multiplier: 0.95 },
        { id: 'homs', name: 'حمص وحماة', multiplier: 0.85 },
        { id: 'arab', name: 'دول الخليج والشرق الأوسط عامة', multiplier: 0.6 } // USD scale primarily
      ]
    : [
        { id: 'all', name: 'All Syrian & Arab Markets', multiplier: 1.0 },
        { id: 'damascus', name: 'Damascus Hub (Highest Density)', multiplier: 1.2 },
        { id: 'aleppo', name: 'Aleppo (Economic Capital)', multiplier: 1.1 },
        { id: 'coast', name: 'Syrian Coast (Lattakia & Tartous)', multiplier: 0.95 },
        { id: 'homs', name: 'Homs & Hama', multiplier: 0.85 },
        { id: 'arab', name: 'GCC & Pan-Arab Region', multiplier: 0.6 }
      ];

  // Recalculate metrics on inputs modification
  useEffect(() => {
    // Basic values based on USD normalization
    const normalizedBudgetUsd = currency === 'USD' ? budget : budget / 15000; // Normalizing rate
    const selectedCity = cities.find(c => c.id === targetCity) || cities[0];
    const mult = selectedCity.multiplier;

    let impressionsFactor = 10;
    let clickFactor = 0.05;
    let conversionFactor = 0.015;

    switch (channel) {
      case 'outdoor':
        impressionsFactor = 150; // Billboards have huge passive impressions
        clickFactor = 0.005;     // Very low direct "click" but high mindshare
        conversionFactor = 0.008;
        break;
      case 'digital':
        impressionsFactor = 80;
        clickFactor = 0.06;
        conversionFactor = 0.022;
        break;
      case 'video':
        impressionsFactor = 120; // Video has high impact
        clickFactor = 0.04;
        conversionFactor = 0.03;
        break;
      case 'branding':
        impressionsFactor = 40;  // Long-term branding impressions
        clickFactor = 0.03;
        conversionFactor = 0.04; // Very high premium conversion
        break;
    }

    const baseImpressions = normalizedBudgetUsd * impressionsFactor * mult;
    const baseReach = baseImpressions * 0.65; // Reach is a subset of unique views
    const baseClicks = baseReach * clickFactor;
    const baseConversions = baseClicks * conversionFactor;

    setMetrics({
      impressions: Math.round(baseImpressions),
      reach: Math.round(baseReach),
      clicks: Math.round(baseClicks),
      conversion: Math.round(baseConversions)
    });
  }, [budget, currency, channel, targetCity]);

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBudget(Number(e.target.value));
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + (isRtl ? ' مليون' : 'M');
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(0) + (isRtl ? ' ألف' : 'K');
    }
    return num.toString();
  };

  return (
    <div id="calculator-section" className="relative py-20 px-4 md:px-8 max-w-7xl mx-auto z-10">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glassmorphism-light text-brand-gold text-xs font-semibold tracking-wider uppercase mb-4 animate-pulse">
          <BarChart3 size={14} />
          <span>REACH ESTIMATOR</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-black mb-6 text-white leading-tight">
          {t.calcTitle}
        </h2>
        <p className="text-gray-400 text-base md:text-lg">
          {t.calcSub}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Sliders and Configurations */}
        <div className="lg:col-span-6 bg-brand-slate/60 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/10 shadow-2xl flex flex-col justify-between">
          <div className="space-y-6">
            
            {/* Currency toggle */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Target size={18} className="text-brand-orange" />
                <span>{isRtl ? 'إعدادات ميزانية الحملة' : 'Campaign Budget Settings'}</span>
              </h3>
              <div className="bg-brand-dark/80 p-0.5 rounded-lg border border-white/10 flex">
                <button
                  id="currency-syp-btn"
                  onClick={() => {
                    setCurrency('SYP');
                    setBudget(5000000);
                  }}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                    currency === 'SYP' ? 'bg-brand-orange text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  SYP
                </button>
                <button
                  id="currency-usd-btn"
                  onClick={() => {
                    setCurrency('USD');
                    setBudget(5000);
                  }}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                    currency === 'USD' ? 'bg-brand-orange text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  USD
                </button>
              </div>
            </div>

            {/* Slider container */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">{t.calcLabelBudget}</span>
                <span className="font-mono text-brand-gold font-bold text-lg">
                  {budget.toLocaleString()} {currency === 'SYP' ? (isRtl ? 'ل.س' : 'SYP') : '$'}
                </span>
              </div>
              <input
                id="budget-slider"
                type="range"
                min={currency === 'SYP' ? 1000000 : 500}
                max={currency === 'SYP' ? 100000000 : 50000}
                step={currency === 'SYP' ? 500000 : 250}
                value={budget}
                onChange={handleBudgetChange}
                className="w-full accent-brand-orange bg-brand-dark/80 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-gray-500 font-mono">
                <span>{currency === 'SYP' ? '1M' : '$500'}</span>
                <span>{currency === 'SYP' ? '50M' : '$25K'}</span>
                <span>{currency === 'SYP' ? '100M' : '$50K'}</span>
              </div>
            </div>

            {/* Area/Region dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-1.5">
                <MapPin size={15} className="text-brand-orange" />
                <span>{isRtl ? 'منطقة التركيز الجغرافي' : 'Focus Geographic Region'}</span>
              </label>
              <select
                id="calc-target-city"
                value={targetCity}
                onChange={(e) => setTargetCity(e.target.value)}
                className="w-full bg-brand-dark/80 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition duration-300 text-sm"
              >
                {cities.map((city) => (
                  <option key={city.id} value={city.id} className="bg-brand-slate text-white">{city.name}</option>
                ))}
              </select>
            </div>

            {/* Channel Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                {t.calcLabelType}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'outdoor', label: t.portTagOutdoor, desc: isRtl ? 'شوارع كبرى وتأثير طرق عريض' : 'High exposure outdoor' },
                  { id: 'digital', label: t.portTagDigital, desc: isRtl ? 'فيسبوك وتيك توك ممول' : 'Social Ads & influencers' },
                  { id: 'video', label: t.portTagVideo, desc: isRtl ? 'إنتاج سينمائي عالي الجودة' : 'Cinematic commercial production' },
                  { id: 'branding', label: t.portTagBrand, desc: isRtl ? 'هوية متكاملة وصياغة لوغو' : 'Complete packaging & logos' }
                ].map((item) => (
                  <button
                    id={`calc-channel-btn-${item.id}`}
                    key={item.id}
                    type="button"
                    onClick={() => setChannel(item.id as any)}
                    className={`p-4 rounded-xl text-right transition-all duration-300 border ${
                      channel === item.id
                        ? 'bg-brand-orange/10 border-brand-orange/80 text-white'
                        : 'bg-brand-dark/40 border-white/5 text-gray-400 hover:border-white/10 hover:text-white'
                    }`}
                  >
                    <div className="font-bold text-sm text-white mb-1">{item.label}</div>
                    <div className="text-[10px] text-gray-400 leading-tight">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

          </div>

          <div className="mt-6 pt-6 border-t border-white/5 text-xs text-gray-500">
            {t.calcFormSponsor}
          </div>
        </div>

        {/* Dynamic Interactive Metrics & Graph */}
        <div className="lg:col-span-6 bg-brand-slate/30 border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
              <Users size={20} className="text-brand-gold" />
              <span>{t.calcEstReach}</span>
            </h3>

            {/* Reach Dashboard Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-brand-dark/60 p-5 rounded-xl border border-white/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-1.5 h-full bg-brand-orange"></div>
                <div className="text-xs text-gray-400 mb-1 flex items-center gap-1.5">
                  <Eye size={13} className="text-brand-orange" />
                  <span>{isRtl ? 'المشاهدات التقديرية' : 'Estimated Impressions'}</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1 text-glow-orange">
                  {formatNumber(metrics.impressions)}
                </div>
                <div className="text-[10px] text-gray-500 mt-2">{isRtl ? 'مرات ظهور مكررة للعلامة' : 'Ad placements exposure count'}</div>
              </div>

              <div className="bg-brand-dark/60 p-5 rounded-xl border border-white/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-1.5 h-full bg-brand-gold"></div>
                <div className="text-xs text-gray-400 mb-1 flex items-center gap-1.5">
                  <Users size={13} className="text-brand-gold" />
                  <span>{isRtl ? 'الجمهور الفريد المستهدف' : 'Unique Target Audience'}</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-brand-gold font-mono mt-1 text-glow-gold">
                  {formatNumber(metrics.reach)}
                </div>
                <div className="text-[10px] text-gray-500 mt-2">{isRtl ? 'أشخاص حقيقيون يلمسون الرسالة' : 'Individual people engaged'}</div>
              </div>

              <div className="bg-brand-dark/60 p-5 rounded-xl border border-white/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-1.5 h-full bg-teal-500"></div>
                <div className="text-xs text-gray-400 mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                  <span>{isRtl ? 'التفاعلات والاهتمام النشط' : 'Active Engagement / Clicks'}</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">
                  {formatNumber(metrics.clicks)}
                </div>
                <div className="text-[10px] text-gray-500 mt-2">{isRtl ? 'استفسارات ومشاركات مباشرة' : 'Direct actions & queries'}</div>
              </div>

              <div className="bg-brand-dark/60 p-5 rounded-xl border border-white/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-1.5 h-full bg-purple-500"></div>
                <div className="text-xs text-gray-400 mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  <span>{isRtl ? 'مبيعات / عملاء محتملين' : 'Estimated Conversions'}</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-purple-400 font-mono mt-1">
                  {formatNumber(metrics.conversion)}
                </div>
                <div className="text-[10px] text-gray-500 mt-2">{isRtl ? 'عمليات شراء أو تعاقد فعلي' : 'Completed client acquisitions'}</div>
              </div>
            </div>

            {/* Custom SVG Reach over 7-Day Chart for stunning visual finish */}
            <div className="bg-brand-dark/40 p-4 rounded-xl border border-white/5">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-gray-400">{isRtl ? 'ارتفاع مؤشر الانتشار اليومي للحملة' : 'Daily Reach Growth Index'}</span>
                <span className="text-[10px] text-brand-orange bg-brand-orange/10 px-2 py-0.5 rounded font-mono">7 Days</span>
              </div>
              <div className="h-28 flex items-end justify-between gap-1.5 pt-4 px-2 relative">
                {/* SVG background line */}
                <svg className="absolute inset-0 w-full h-full p-2 pointer-events-none" preserveAspectRatio="none">
                  <path
                    d={`M 10 90 Q 60 ${90 - (metrics.reach % 30)} 120 ${80 - (metrics.reach % 45)} T 240 ${60 - (metrics.reach % 35)} T 360 ${40 - (metrics.reach % 40)} T 480 ${25 - (metrics.reach % 20)}`}
                    fill="none"
                    stroke="rgba(255, 92, 53, 0.3)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <path
                    d={`M 10 90 Q 60 ${90 - (metrics.reach % 30)} 120 ${80 - (metrics.reach % 45)} T 240 ${60 - (metrics.reach % 35)} T 360 ${40 - (metrics.reach % 40)} T 480 ${25 - (metrics.reach % 20)} L 480 100 L 10 100 Z`}
                    fill="url(#chart-grad)"
                    opacity="0.1"
                  />
                  <defs>
                    <linearGradient id="chart-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#ff5c35" />
                      <stop offset="100%" stopColor="#ff5c35" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Simulated vertical growth indicators */}
                {[...Array(7)].map((_, idx) => {
                  const factor = [0.15, 0.28, 0.45, 0.62, 0.78, 0.9, 1.0][idx];
                  const height = factor * 80;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 z-10">
                      <div className="w-full bg-gradient-to-t from-brand-orange/20 to-brand-orange/80 rounded-t" style={{ height: `${height}px` }}></div>
                      <span className="text-[9px] text-gray-500 font-mono mt-1">D{idx+1}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-400 leading-relaxed text-center sm:text-right">
              {isRtl 
                ? 'هل تريد حجز خطتك للحصول على لوحات طرقية حصرية في أرقى شوارع دمشق وحلب؟' 
                : 'Ready to secure high-visibility billboards in Damascus and Aleppo hubs?'}
            </p>
            <a
              id="calc-book-consult-btn"
              href="#contact-section"
              className="px-5 py-2 bg-brand-gold hover:bg-yellow-600 text-brand-dark font-black text-xs rounded-lg transition duration-300 transform hover:-translate-y-0.5 whitespace-nowrap"
            >
              {isRtl ? 'احجز استشارة مجانية' : 'Book Free Strategy'}
            </a>
          </div>

        </div>

      </div>
    </div>
  );
}
